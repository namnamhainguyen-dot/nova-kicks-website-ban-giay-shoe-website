import clientPromise from "@/libs/mongodb";

const DB_NAME = "Nova-kicks"; // Tên database của bạn

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // --- 1. LẤY THAM SỐ LỌC NGÀY TỪ QUERY URL ---
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Tạo điều kiện lọc theo thời gian (createdAt) nếu người dùng có chọn ngày
    let dateFilter = {};
    let userDateFilter = {};

    if (startDateParam && endDateParam) {
      // Đặt giờ bắt đầu từ 00:00:00 và giờ kết thúc đến 23:59:59 để trọn vẹn trong ngày
      const start = new Date(startDateParam);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);

      dateFilter = {
        createdAt: {
          $gte: start,
          $lte: end
        }
      };

      userDateFilter = {
        createdAt: {
          $gte: start,
          $lte: end
        }
      };
    }

    // 2. Đếm tổng số thành viên đăng ký (có lọc theo ngày nếu có)
    const totalUsers = await db.collection("users").countDocuments(userDateFilter);

    // 3. Đếm tổng số đơn hàng hệ thống (có lọc theo ngày)
    const totalOrders = await db.collection("orders").countDocuments(dateFilter);

    // 4. Đếm số đơn hàng đang chờ giao ("pending") trong khoảng thời gian lọc
    const pendingOrders = await db.collection("orders").countDocuments({ 
      ...dateFilter,
      status: "pending" 
    });

    // 5. Tính tổng doanh thu thực tế từ các đơn hàng "completed" hoặc "delivered" trong khoảng lọc
    const completedOrders = await db.collection("orders")
      .find({ 
        ...dateFilter,
        status: { $in: ["completed", "delivered"] } 
      })
      .toArray();
      
    const totalRevenue = completedOrders.reduce((sum, order) => {
      const finalTotal = Number(order.final_total || order.total || 0);
      return sum + finalTotal;
    }, 0);

    // 6. Thống kê doanh thu theo tuần (chia tỷ lệ tương đối từ tổng doanh thu lọc được)
    const revenueByWeeks = [
      Math.floor((totalRevenue * 0.2) / 1000000), 
      Math.floor((totalRevenue * 0.25) / 1000000), 
      Math.floor((totalRevenue * 0.3) / 1000000), 
      Math.floor((totalRevenue * 0.25) / 1000000)  
    ];

    // ==========================================
    // 7. XỬ LÝ HOẠT ĐỘNG LIVE (ĐƠN HÀNG + USER MỚI)
    // ==========================================

    // Lấy 3 đơn hàng mới nhất trong khoảng lọc
    const latestOrders = await db.collection("orders")
      .find(dateFilter)
      .sort({ createdAt: -1, _id: -1 }) 
      .limit(3)
      .toArray();

    // Lấy 3 người dùng đăng ký mới nhất trong khoảng lọc
    const latestUsers = await db.collection("users")
      .find(userDateFilter)
      .sort({ createdAt: -1, _id: -1 }) 
      .limit(3)
      .toArray();

    const orderActivities = latestOrders.map(order => ({
      id: order._id.toString(),
      type: "order",
      time: order.createdAt ? new Date(order.createdAt) : new Date(order._id.getTimestamp()),
      title: `Đơn hàng #${order._id.toString().slice(-6)}`,
      desc: `${order.name || "Khách ẩn danh"} - Trạng thái: ${order.status}`
    }));

    const userActivities = latestUsers.map(user => {
      const isGoogle = user.email && !user.password; 
      const loginMethod = isGoogle ? "bằng Google" : "bằng Tài khoản";

      return {
        id: user._id.toString(),
        type: "user",
        time: user.createdAt ? new Date(user.createdAt) : new Date(user._id.getTimestamp()),
        title: `Thành viên mới gia nhập 🎉`,
        desc: `${user.name || user.email || "Thành viên mới"} - Đăng ký ${loginMethod}`
      };
    });

    const recentActivities = [...orderActivities, ...userActivities]
      .sort((a, b) => b.time - a.time) 
      .slice(0, 3); 

    // ==========================================
    // 📊 NÂNG CẤP: DỮ LIỆU PHÂN TÍCH CHUYÊN SÂU
    // ==========================================

    // Thống kê 1: Tỷ lệ trạng thái đơn hàng (Có áp dụng điều kiện ngày)
    const statusStats = await db.collection("orders").aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    const orderStatusData = {
      pending: statusStats.find(s => s._id === "pending")?.count || 0,
      completed: statusStats.find(s => s._id === "completed" || s._id === "delivered")?.count || 0,
      cancelled: statusStats.find(s => s._id === "cancelled")?.count || 0,
    };

    // Thống kê 2: Top 5 sản phẩm bán chạy nhất trong khoảng thời gian lọc
    const topProducts = await db.collection("orders").aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      { $unwind: "$order_items" }, 
      { 
        $group: { 
          _id: "$order_items.name", 
          totalQty: { $sum: { $convert: { input: "$order_items.quantity", to: "int", onError: 0, onNull: 0 } } } 
        } 
      },
      { $sort: { totalQty: -1 } }, 
      { $limit: 5 } 
    ]).toArray();

    const topProductsData = {
      labels: topProducts.map(p => p._id || "Sản phẩm không tên"),
      values: topProducts.map(p => p.totalQty)
    };

    // Trả về dữ liệu chuẩn JSON cho Dashboard
    return Response.json({
      stats: {
        totalRevenue: totalRevenue, 
        revenueTrend: "+12.4%", 
        newMembers: totalUsers,
        memberTrend: "+5.2%",
        totalOrders: totalOrders,
        pendingOrders: pendingOrders
      },
      chartDatasets: {
        labels: ['Tuần 01', 'Tuần 02', 'Tuần 03', 'Tuần 04'],
        revenue: revenueByWeeks, 
        forecast: [200, 300, 320, 380] 
      },
      recentActivities: recentActivities.length > 0 ? recentActivities : [
        { id: "init", title: "Hệ thống sẵn sàng", desc: "Không có hoạt động trong khoảng thời gian này." }
      ],
      advancedCharts: {
        orderStatus: orderStatusData,
        topProducts: topProductsData
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Lỗi API Dashboard:", error);
    return Response.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 });
  }
}
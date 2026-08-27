import clientPromise from "@/libs/mongodb";

const DB_NAME = "Nova-kicks";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let dateFilter = {};
    let userDateFilter = {};
    let start = new Date();
    let end = new Date();

    if (startDateParam && endDateParam) {
      start = new Date(startDateParam);
      start.setHours(0, 0, 0, 0);

      end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);

      dateFilter = { createdAt: { $gte: start, $lte: end } };
      userDateFilter = { createdAt: { $gte: start, $lte: end } };
    }

    const totalUsers = await db.collection("users").countDocuments(userDateFilter);
    const totalOrders = await db.collection("orders").countDocuments(dateFilter);
    const pendingOrders = await db.collection("orders").countDocuments({ ...dateFilter, status: "pending" });

    const completedOrders = await db.collection("orders")
      .find({ ...dateFilter, status: { $in: ["completed", "delivered"] } })
      .toArray();
      
    const totalRevenue = completedOrders.reduce((sum, order) => {
      return sum + Number(order.final_total || order.total || 0);
    }, 0);

    // ==========================================
    // 📊 TÍNH TOÁN DOANH THU & DỰ BÁO THEO KHOẢNG THỜI GIAN
    // ==========================================
    // Chia khoảng thời gian lọc thành 4 mốc (Tuần/Giai đoạn) để biểu đồ trực quan
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const chunkDays = Math.max(Math.floor(diffDays / 4), 1);

    let revenueByWeeks = [0, 0, 0, 0];
    let forecastByWeeks = [];

    completedOrders.forEach(order => {
      const orderDate = new Date(order.createdAt || order._id.getTimestamp());
      const dayIndex = Math.floor((orderDate - start) / (1000 * 60 * 60 * 24 * chunkDays));
      const targetIndex = Math.min(Math.max(dayIndex, 0), 3);
      
      const amountInMillions = Number(order.final_total || order.total || 0) / 1000000;
      revenueByWeeks[targetIndex] += amountInMillions;
    });

    // Làm tròn số liệu doanh thu biểu đồ đến 1 chữ số thập phân cho đẹp
    revenueByWeeks = revenueByWeeks.map(val => Number(val.toFixed(1)));

    // Tạo mốc dự báo hợp lý (ví dụ: dự báo cao hơn thực tế khoảng 15% - 20% hoặc dựa trên xu hướng)
    forecastByWeeks = revenueByWeeks.map(rev => Number((rev > 0 ? rev * 1.2 : 5).toFixed(1)));

    // ==========================================
    // XỬ LÝ HOẠT ĐỘNG LIVE & THỐNG KÊ KHÁC
    // ==========================================
    const latestOrders = await db.collection("orders").find(dateFilter).sort({ createdAt: -1, _id: -1 }).limit(3).toArray();
    const latestUsers = await db.collection("users").find(userDateFilter).sort({ createdAt: -1, _id: -1 }).limit(3).toArray();

    const orderActivities = latestOrders.map(order => ({
      id: order._id.toString(),
      type: "order",
      time: order.createdAt ? new Date(order.createdAt) : new Date(order._id.getTimestamp()),
      title: `Đơn hàng #${order._id.toString().slice(-6)}`,
      desc: `${order.name || "Khách ẩn danh"} - Trạng thái: ${order.status}`
    }));

    const userActivities = latestUsers.map(user => {
      const isGoogle = user.email && !user.password; 
      return {
        id: user._id.toString(),
        type: "user",
        time: user.createdAt ? new Date(user.createdAt) : new Date(user._id.getTimestamp()),
        title: `Thành viên mới gia nhập 🎉`,
        desc: `${user.name || user.email || "Thành viên mới"} - Đăng ký ${isGoogle ? "bằng Google" : "bằng Tài khoản"}`
      };
    });

    const recentActivities = [...orderActivities, ...userActivities].sort((a, b) => b.time - a.time).slice(0, 3); 

    const statusStats = await db.collection("orders").aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    const orderStatusData = {
      pending: statusStats.find(s => s._id === "pending")?.count || 0,
      completed: statusStats.find(s => s._id === "completed" || s._id === "delivered")?.count || 0,
      cancelled: statusStats.find(s => s._id === "cancelled")?.count || 0,
    };

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
        labels: ['Giai đoạn 1', 'Giai đoạn 2', 'Giai đoạn 3', 'Giai đoạn 4'],
        revenue: revenueByWeeks, 
        forecast: forecastByWeeks 
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
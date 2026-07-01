import clientPromise from "@/libs/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // 1. Trích xuất tham số 'email' từ query string URL
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // 2. Khởi tạo bộ lọc tìm kiếm mặc định (Trống = Lấy tất cả cho Admin)
    let queryFilter = {};

    // 3. Nếu có tham số email gửi lên (Trang cá nhân đang gọi)
    if (email) {
      if (email === "guest") {
        return Response.json([]); // Nếu là guest không có tài khoản, trả về mảng rỗng
      }
      queryFilter.email = email; // Gán bộ lọc tìm kiếm theo đúng email này
    }

    // 4. Tìm kiếm trong Database dựa theo bộ lọc queryFilter linh hoạt
    const orders = await db
      .collection("orders")
      .find(queryFilter)
      .sort({ createdAt: -1 }) // Đơn hàng mới nhất lên đầu
      .toArray();

    const normalized = orders.map((order) => ({
      ...order,
      _id: String(order._id),
    }));

    return Response.json(normalized);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const body = await request.json();

    const {
      email,
      name,
      phone,
      location_id,
      note,
      order_items,
      total,
      discount,
      final_total,
      applied_voucher,
    } = body;

    const newOrder = {
      email: email || "guest",
      name,
      phone,
      location_id,
      note,
      order_items,

      total,
      discount: discount || 0,
      final_total: final_total || total,
      applied_voucher: applied_voucher || null,

      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(newOrder);

    return Response.json({
      success: true,
      _id: String(result.insertedId),
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
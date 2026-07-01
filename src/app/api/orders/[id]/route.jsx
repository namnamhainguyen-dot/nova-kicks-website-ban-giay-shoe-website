import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

// ==========================================
// 🌟 1. BỔ SUNG HÀM GET (Giải quyết lỗi "Không tìm thấy đơn hàng" ở giao diện chi tiết)
// ==========================================
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Next.js 16 bắt buộc phải await params
    const { id } = await params;

    if (!id || id.length !== 24) {
      return Response.json({ error: "Định dạng mã đơn hàng không chính xác" }, { status: 400 });
    }

    // Truy vấn dữ liệu từ MongoDB
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(String(id)),
    });

    // Nếu không tồn tại bản ghi trong DB, trả về 404
    if (!order) {
      return Response.json({ error: "Đơn hàng không tồn tại trong hệ thống" }, { status: 404 });
    }

    // Chuẩn hóa định dạng id trước khi trả về frontend
    const normalizedOrder = {
      ...order,
      _id: String(order._id),
    };

    return Response.json(normalizedOrder);
  } catch (error) {
    console.error("Lỗi API GET chi tiết đơn hàng:", error);
    return Response.json({ error: "Lỗi xử lý hệ thống phía Backend" }, { status: 500 });
  }
}

// ==========================================
// ✅ HÀM PATCH CỦA BẠN (Giữ nguyên cấu trúc chạy rất tốt)
// ==========================================
export async function PATCH(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "ID không hợp lệ" }, { status: 400 });
    }

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(String(id)) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ success: false, error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Cập nhật trạng thái thành công" });

  } catch (error) {
    console.error("Lỗi API PATCH đơn hàng:", error);
    return Response.json({ success: false, error: "Lỗi hệ thống" }, { status: 500 });
  }
}
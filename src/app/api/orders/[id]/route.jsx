import clientPromise from "../../../../libs/mongodb"; // Đã sửa đường dẫn lùi 4 cấp chuẩn xác ra ngoài src
import { ObjectId } from "mongodb";


// ==========================================
// 🌟 1. HÀM GET (Chi tiết đơn hàng)
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
// ✅ 2. HÀM PATCH (Cập nhật trạng thái)
// ==========================================
export async function PATCH(request, { params }) {

/**
 * 1. API XEM CHI TIẾT ĐƠN HÀNG (GET)
 */
export async function GET(request, { params }) {

  try {
    const { id } = await params;

    const client = await clientPromise;
    const db = client.db("Nova-kicks");


    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(id),
    });


    if (!order) {
      return Response.json(
        { success: false, error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Chuẩn hóa cấu trúc trả về { success: true, data: order } để Front-end page.jsx đọc được luôn
    return Response.json({
      success: true,
      data: {
        ...order,
        _id: String(order._id),
      }
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Lỗi lấy đơn hàng" },
      { status: 500 }
    );
  }
}

/**
 * 2. API CẬP NHẬT TRẠNG THÁI & LÝ DO HỦY (PATCH)
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Tạo object cập nhật động
    const updateFields = { status: body.status };

    // BỔ SUNG: Nếu trạng thái là hủy đơn và có lý do hủy từ client gửi lên
    if (body.status === "cancelled" && body.cancelReason) {
      updateFields.cancelReason = body.cancelReason;
    }

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateFields,
      }
    );

    return Response.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Cập nhật thất bại" },
      { status: 500 }
    );
  }
}

/**
 * 3. API XÓA ĐƠN HÀNG (DELETE)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const result = await db.collection("orders").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return Response.json(
        { success: false, error: "Không tìm thấy đơn hàng để xóa" },
        { status: 404 }
      );
    }


    return Response.json({ success: true, message: "Cập nhật trạng thái thành công" });


    return Response.json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Xóa đơn hàng thất bại" },
      { status: 500 }
    );
  }
}

// ==========================================
// 🚀 3. BỔ SUNG HÀM DELETE (Xóa đơn hàng)
// ==========================================
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Await params theo chuẩn Next.js 16
    const { id } = await params;

    // Kiểm tra định dạng ID MongoDB (24 ký tự hex)
    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "ID đơn hàng không hợp lệ" }, { status: 400 });
    }

    // Tiến hành xóa trong MongoDB
    const result = await db.collection("orders").deleteOne({
      _id: new ObjectId(String(id)),
    });

    // Nếu không tìm thấy đơn hàng nào để xóa
    if (result.deletedCount === 0) {
      return Response.json({ success: false, error: "Không tìm thấy đơn hàng cần xóa" }, { status: 404 });
    }

    // Trả về JSON thành công để frontend không bị lỗi "Unexpected end of JSON input"
    return Response.json({ success: true, message: "Xóa đơn hàng thành công" });

  } catch (error) {
    console.error("Lỗi API DELETE đơn hàng:", error);
    return Response.json({ success: false, error: "Lỗi hệ thống khi xóa đơn hàng" }, { status: 500 });
  }
}
import clientPromise from "../../../../libs/mongodb"; // Đã sửa đường dẫn lùi 4 cấp chuẩn xác ra ngoài src
import { ObjectId } from "mongodb";

/**
 * 1. API XEM CHI TIẾT ĐƠN HÀNG (GET)
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

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
import clientPromise from "../../../../libs/mongodb"; 
import { ObjectId } from "mongodb";

//HÀM GET (Chi tiết đơn hàng)
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const { id } = await params;

    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "Định dạng mã đơn hàng không chính xác" }, { status: 400 });
    }

    // Truy vấn dữ liệu từ MongoDB
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(String(id)),
    });

    if (!order) {
      return Response.json({ success: false, error: "Đơn hàng không tồn tại trong hệ thống" }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        ...order,
        _id: String(order._id),
      }
    });
  } catch (error) {
    console.error("Lỗi API GET chi tiết đơn hàng:", error);
    return Response.json({ success: false, error: "Lỗi xử lý hệ thống phía Backend" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "ID đơn hàng không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const updateFields = { status: body.status };

    if (body.status === "cancelled" && body.cancelReason) {
      updateFields.cancelReason = body.cancelReason;
    }

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateFields,
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ success: false, error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Cập nhật thất bại:", error);
    return Response.json(
      { success: false, error: "Cập nhật thất bại" },
      { status: 500 }
    );
  }
}

// ==========================================
//BỔ SUNG HÀM DELETE (Xóa đơn hàng)
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
    return Response.json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });

  } catch (error) {
    console.error("Lỗi API DELETE đơn hàng:", error);
    return Response.json({ success: false, error: "Lỗi hệ thống khi xóa đơn hàng" }, { status: 500 });
  }
}
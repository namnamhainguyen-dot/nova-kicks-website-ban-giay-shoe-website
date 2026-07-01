import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // 🌟 Next.js 16 bắt buộc phải await params
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "ID không hợp lệ" }, { status: 400 });
    }

    // Cập nhật trạng thái mới vào MongoDB
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

    // 🌟 QUAN TRỌNG: Phải trả về JSON chứa thuộc tính { success: true } để Frontend nhận biết
    return Response.json({ success: true, message: "Cập nhật trạng thái thành công" });

  } catch (error) {
    console.error("Lỗi API PATCH đơn hàng:", error);
    return Response.json({ success: false, error: "Lỗi hệ thống" }, { status: 500 });
  }
}
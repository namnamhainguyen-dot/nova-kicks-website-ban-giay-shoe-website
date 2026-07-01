import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const body = await request.json();
    
    // Khai báo đúng các trường gửi từ Frontend lên
    const { _id, email, fullname, phone, address } = body;

    if (!_id && !email) {
      return Response.json({ error: "Thiếu thông tin tài khoản định danh" }, { status: 400 });
    }

    // Xây dựng điều kiện tìm kiếm linh hoạt (ưu tiên ObjectId)
    const filter = _id ? { _id: new ObjectId(String(_id)) } : { email: email };

    const result = await db.collection("users").updateOne(
      filter,
      {
        $set: {
          fullname: fullname, // Hãy đảm bảo tên trường ở đây khớp với DB của bạn (vd: name hay fullname)
          phone: phone,
          address: address,
          updatedAt: new Date()
        }
      }
    );

    return Response.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Lỗi xử lý hệ thống phía Backend" }, { status: 500 });
  }
}
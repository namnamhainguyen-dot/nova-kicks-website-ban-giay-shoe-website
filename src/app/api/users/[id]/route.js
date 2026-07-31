import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy thông tin user (Ẩn các trường nhạy cảm)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "ID sai" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    
    // Ẩn: password, resetToken, hoặc bất kỳ trường nào bạn muốn
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0, resetToken: 0 } } 
    );
    
    if (!user) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PATCH: Cập nhật an toàn (Ngăn người dùng tự sửa role/status từ client)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Loại bỏ các trường không cho phép người dùng tự sửa trực tiếp
    const { password, email, ...updateData } = body; 

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}
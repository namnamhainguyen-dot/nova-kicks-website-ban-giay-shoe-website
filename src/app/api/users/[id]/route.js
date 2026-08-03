import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// GET: Lấy thông tin user
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "ID sai định dạng" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0, resetToken: 0 } } 
    );
    
    if (!user) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin user theo ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "ID sai định dạng" }, { status: 400 });

    const body = await request.json();
    
    // Loại bỏ các trường nhạy cảm không cho phép người dùng tự sửa trực tiếp
    const { password, email, _id, ...updateData } = body; 

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Không tìm thấy người dùng trong CSDL" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.error("API update error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật dữ liệu" }, { status: 500 });
  }
}
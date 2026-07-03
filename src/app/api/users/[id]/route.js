import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Đảm bảo await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID không đúng định dạng" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    
    // Tìm user theo _id
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}
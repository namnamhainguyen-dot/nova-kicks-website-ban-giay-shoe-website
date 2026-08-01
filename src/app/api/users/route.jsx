import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { dbName } from "@/libs/mongodb";

async function connectDB() {
  const client = await clientPromise;
  return client.db(dbName).collection("users");
}

// 1. GET: Lấy danh sách tất cả tài khoản
export async function GET() {
  try {
    const collection = await connectDB();
    const accounts = await collection.find({}).toArray();
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi kết nối MongoDB" }, { status: 500 });
  }
}

// 2. POST: Thêm tài khoản mới
export async function POST(req) {
  try {
    const body = await req.json();
    const collection = await connectDB();
    
    // Kiểm tra trùng email
    const exist = await collection.findOne({ email: body.email });
    if (exist) {
      return NextResponse.json({ message: "Email này đã tồn tại!" }, { status: 400 });
    }

    const result = await collection.insertOne({
      id: body.id,
      name: body.name,
      email: body.email,
      password: body.password, // Nên hash mật khẩu nếu làm thực tế
      role: body.role || "MEMBER",
      status: body.status || "active",
      avatar: body.avatar,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi thêm tài khoản" }, { status: 500 });
  }
}
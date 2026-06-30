import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// Chuỗi kết nối lấy từ file .env hoặc điền trực tiếp
const uri = process.env.MONGODB_URI || "CHUOI_KET_NOI_MONGODB_CUA_BAN";
const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
  // Thay 'test' bằng tên Database thật của bạn nếu cần
  return client.db("test").collection("accounts"); 
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
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "CHUOI_KET_NOI_MONGODB_CUA_BAN";
const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
  return client.db("test").collection("accounts");
}

// 1. DELETE: Xóa tài khoản
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const collection = await connectDB();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi xóa tài khoản" }, { status: 500 });
  }
}

// 2. PUT: Cập nhật thông tin hoặc trạng thái tài khoản
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const collection = await connectDB();

    // Lọc bỏ các trường không cập nhật hoặc rỗng
    const updateData = {};
    if (body.name) updateData.name = body.name;
    if (body.role) updateData.role = body.role;
    if (body.status) updateData.status = body.status;
    if (body.avatar) updateData.avatar = body.avatar;
    if (body.id) updateData.id = body.id;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi khi cập nhật tài khoản" }, { status: 500 });
  }
}
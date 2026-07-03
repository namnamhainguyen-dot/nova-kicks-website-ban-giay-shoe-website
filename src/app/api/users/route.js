import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";

// GET: Lấy danh sách tất cả người dùng
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // 1. Chỉ lấy những trường cần thiết (Tránh trả về mật khẩu)
    // 2. Chuyển đổi _id sang chuỗi để tránh lỗi Serializing của Next.js
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } }) // Loại bỏ trường 'password'
      .toArray();

    const sanitizedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(), // Chuyển đổi ObjectId sang String
    }));

    return NextResponse.json(sanitizedUsers, { status: 200 });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return NextResponse.json(
      { message: "Không thể lấy dữ liệu người dùng" },
      { status: 500 }
    );
  }
}
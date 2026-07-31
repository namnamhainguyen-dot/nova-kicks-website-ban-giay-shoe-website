import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";

// GET /api/users - Lấy danh sách tất cả người dùng
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    const formattedUsers = users.map((u) => ({
      ...u,
      _id: u._id.toString(),
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    console.error("Lỗi GET /api/users:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ khi lấy danh sách người dùng" },
      { status: 500 }
    );
  }
}

// POST /api/users - Tạo mới 1 tài khoản (Sử dụng MongoDB Native Client)
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const body = await req.json();
    const { fullname, name, email, password, role, status, avatar } = body;

    // 1. Kiểm tra đầu vào bắt buộc
    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng điền đầy đủ email và mật khẩu!" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Kiểm tra email đã tồn tại trong DB chưa
    const existingUser = await db.collection("users").findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng!" },
        { status: 400 }
      );
    }

    // 3. Chuẩn bị dữ liệu tài khoản mới
    const displayName = fullname || name || cleanEmail.split("@")[0];
    const newUser = {
      fullname: displayName,
      name: displayName,
      email: cleanEmail,
      password, // Khuyên dùng bcryptjs để hash password nếu cần
      role: role || "USER",
      status: status || "active",
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 4. Lưu vào MongoDB
    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      {
        message: "Tạo tài khoản thành công!",
        user: { ...newUser, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi POST /api/users:", error);
    return NextResponse.json(
      { message: error.message || "Lỗi máy chủ nội bộ khi tạo tài khoản" },
      { status: 500 }
    );
  }
}
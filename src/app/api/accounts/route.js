import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const sanitizedUsers = users.map((user) => {
      const stringId = user._id.toString();
      // Tự động sinh mã NV-XXXXXX từ _id nếu trong DB bị trống
      const autoEmployeeCode = user.id || user.code || `NV-${stringId.slice(-6).toUpperCase()}`;

      return {
        ...user,
        _id: stringId,
        id: autoEmployeeCode, // Mã nhân viên trả về cho giao diện
        name: user.fullname || user.name || user.email || "Không rõ",
        role: user.role || "MEMBER",
        status: user.status || "active",
        avatar: user.avatar || "https://i.pravatar.cc/80?img=32",
      };
    });

    return NextResponse.json(sanitizedUsers, { status: 200 });
  } catch (error) {
    console.error("Lỗi GET /api/accounts:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, status, avatar } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email và mật khẩu là bắt buộc!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);

    const existing = await db.collection("users").findOne({ email: email.trim() });
    if (existing) {
      return NextResponse.json({ message: "Email đã tồn tại trong hệ thống!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tạo ngẫu nhiên chuỗi mã nhân viên mới
    const randomCode = `NV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newUser = {
      id: randomCode, // Lưu mã nhân viên tự động vào DB
      fullname: name || email.split("@")[0],
      name: name || email.split("@")[0],
      email: email.trim(),
      password: hashedPassword,
      role: role || "MEMBER",
      status: status || "active",
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId.toString(),
        user: {
          ...newUser,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi POST /api/accounts:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}
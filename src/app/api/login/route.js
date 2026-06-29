import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const body = await request.json();
    const { identifier, password } = body; 

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" },
        { status: 400 }
      );
    }

    // 1. Tìm kiếm User
    const user = await db.collection("users").findOne({
      $or: [
        { email: identifier.trim() },
        { phone: identifier.trim() }
      ]
    });

    // 2. Nếu không tìm thấy tài khoản
    if (!user) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    // 3. So sánh mật khẩu
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    // 4. Đăng nhập thành công, trả thông tin về cho Client
    // 🔥 CẬP NHẬT: Thêm trường 'role' từ database vào object trả về
    return NextResponse.json(
      {
        message: "Đăng nhập thành công!",
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email || null,
          phone: user.phone || null,
          role: user.role || "user", // Mặc định là 'user' nếu chưa có role
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Lỗi Đăng nhập MongoDB Driver:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống máy chủ, vui lòng thử lại!" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json(); // Không cần nhận 'otp' ở đây nữa

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin!" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const userCollection = db.collection("users");

    // 1. Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // 2. Cập nhật thẳng mật khẩu mới vào tài khoản dựa vào email
    const result = await userCollection.updateOne(
      { email: email.trim() },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Không tìm thấy tài khoản tương ứng với Email này!" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Thiết lập mật khẩu mới thành công!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Lỗi hệ thống tại reset-password:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống khi cập nhật mật khẩu!" },
      { status: 500 }
    );
  }
}
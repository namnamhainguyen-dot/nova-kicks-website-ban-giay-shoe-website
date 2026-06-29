import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks"); 

    const body = await request.json();
    // Lấy ra cả email và phone từ body do Frontend gửi lên
    const { fullname, email, phone, password } = body;

    // 1. Kiểm tra họ tên, mật khẩu và bắt buộc phải có 1 trong 2 (email HOẶC phone)
    if (!fullname || (!email && !phone) || !password) {
      return NextResponse.json(
        { message: "Vui lòng điền đầy đủ thông tin bắt buộc!" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra tài khoản trùng lặp linh hoạt theo email hoặc số điện thoại
    const searchFilter = {};
    if (email) searchFilter.email = email;
    if (phone) searchFilter.phone = phone;

    const existingUser = await db.collection("users").findOne(searchFilter);
    
    if (existingUser) {
      return NextResponse.json(
        { message: "Email hoặc Số điện thoại này đã được đăng ký sử dụng!" },
        { status: 400 }
      );
    }

    // 3. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo Object tài khoản mới (Chỉ thêm trường có dữ liệu thực tế)
    const newUser = {
      fullname,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (email) newUser.email = email;
    if (phone) newUser.phone = phone;

    // 5. Lưu vào MongoDB Database
    await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      { message: "Đăng ký thành công tài khoản mới!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi Đăng ký MongoDB Driver:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra tại máy chủ hệ thống." },
      { status: 500 }
    );
  }
}
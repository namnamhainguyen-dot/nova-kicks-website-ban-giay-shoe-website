import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const body = await request.json();
    const { token } = body; 

    if (!token) {
      return NextResponse.json(
        { message: "Không tìm thấy mã xác thực Google!" },
        { status: 400 }
      );
    }

    // 1. Giải mã Payload từ Google Token (JWT Base64)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const googleUser = JSON.parse(atob(base64));

    if (!googleUser.email) {
      return NextResponse.json(
        { message: "Không thể lấy email từ tài khoản Google này!" },
        { status: 400 }
      );
    }

    // 2. Tìm xem email Google này đã tồn tại trong database "users" chưa
    let user = await db.collection("users").findOne({ email: googleUser.email.trim() });

    // 3. Nếu CHƯA tồn tại -> Tự động đăng ký tài khoản mới cho họ
    if (!user) {
      const newUser = {
        fullname: googleUser.name,
        email: googleUser.email.trim(),
        phone: null,
        password: null, // Đăng nhập Google không cần mật khẩu trực tiếp
        role: "user",   // Mặc định phân quyền user
        createdAt: new Date(),
      };

      const result = await db.collection("users").insertOne(newUser);
      
      // Lấy lại thông tin user vừa insert thành công
      user = {
        _id: result.insertedId,
        ...newUser
      };
    }

    // 4. Trả thông tin User về cho Client giống hệt API đăng nhập thường
    return NextResponse.json(
      {
        message: "Đăng nhập bằng Google thành công!",
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone || null,
          role: user.role || "user",
        },
        token: "google-session-token-placeholder" // Có thể tích hợp thêm JWT token riêng của hệ thống bạn nếu cần
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Lỗi Đăng nhập Google API:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống máy chủ khi đăng nhập Google!" },
      { status: 500 }
    );
  }
}
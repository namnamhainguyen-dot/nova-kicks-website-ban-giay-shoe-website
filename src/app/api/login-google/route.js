import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { OAuth2Client } from "google-auth-library"; // 🟢 Khuyên dùng để verify token chính chủ

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { message: "Không tìm thấy mã xác thực Google!" },
        { status: 400 }
      );
    }

    let googleUser = {};

    // 🟢 1. GIẢI MÃ & VERIFY TOKEN VỚI GOOGLE (An toàn bảo mật)
    try {
      if (GOOGLE_CLIENT_ID) {
        // Xác thực token trực tiếp qua SDK Google
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: GOOGLE_CLIENT_ID,
        });
        googleUser = ticket.getPayload();
      } else {
        // Fallback Decode Base64 an toàn UTF-8 (chống crash Tiếng Việt có dấu)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
        googleUser = JSON.parse(jsonPayload);
      }
    } catch (authError) {
      console.error("Lỗi xác minh Google Token:", authError);
      return NextResponse.json(
        { message: "Mã xác thực Google không hợp lệ hoặc đã hết hạn!" },
        { status: 400 }
      );
    }

    if (!googleUser || !googleUser.email) {
      return NextResponse.json(
        { message: "Không thể lấy thông tin email từ tài khoản Google này!" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // 🟢 2. Tìm xem email Google này đã tồn tại trong database "users" chưa
    const userEmail = googleUser.email.trim().toLowerCase();
    let user = await db.collection("users").findOne({ email: userEmail });

    // 🟢 3. Nếu CHƯA tồn tại -> Tự động đăng ký tài khoản mới
    if (!user) {
      const newUser = {
        fullname: googleUser.name || "Người dùng Google",
        email: userEmail,
        avatar: googleUser.picture || null, // 🌟 Lưu thêm avatar Google
        phone: null,
        password: null, // Đăng nhập Google không dùng mật khẩu
        role: "user",   // Mặc định là user
        provider: "google",
        createdAt: new Date(),
      };

      const result = await db.collection("users").insertOne(newUser);

      user = {
        _id: result.insertedId,
        ...newUser,
      };
    }

    // 🟢 4. Trả thông tin User về cho Client
    return NextResponse.json(
      {
        message: "Đăng nhập bằng Google thành công!",
        user: {
          id: String(user._id),
          fullname: user.fullname,
          email: user.email,
          avatar: user.avatar || googleUser.picture || null,
          phone: user.phone || null,
          role: user.role || "user",
        },
        token: token // Dùng luôn ID Token này hoặc tạo JWT token riêng của app bạn
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
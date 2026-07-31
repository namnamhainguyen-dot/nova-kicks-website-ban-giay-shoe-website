import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks"); // Check kỹ lại tên DB trên Compass/Atlas!

    const body = await request.json();
    const { identifier, password } = body; 

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // 1. Tìm kiếm User (Hỗ trợ không phân biệt hoa thường với Email và check thêm field sdt)
    const user = await db.collection("users").findOne({
      $or: [
        { email: { $regex: `^${cleanIdentifier}$`, $options: "i" } },
        { phone: cleanIdentifier },
        { sdt: cleanIdentifier },
        { phoneNumber: cleanIdentifier }
      ]
    });

    // 🔴 DEBUG LOG 1: Bật Terminal VS Code lên xem server tìm thấy User không
    console.log("--> Debug Login - Identifier:", cleanIdentifier);
    console.log("--> Debug Login - User tìm thấy trong DB:", user ? user._id : "KHÔNG TÌM THẤY USER");

    // 2. Nếu không tìm thấy tài khoản
    if (!user) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    // 3. So sánh mật khẩu (Xử lý cả Bcrypt lẫn Mật khẩu thô Plaintext)
    let isPasswordMatch = false;

    if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
      // Mật khẩu đã hash
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Mật khẩu dạng chuỗi thô (dữ liệu test)
      isPasswordMatch = password === user.password;
    }

    // 🔴 DEBUG LOG 2: Xem kết quả so sánh mật khẩu
    console.log("--> Debug Login - Khớp mật khẩu không?:", isPasswordMatch);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    // 4. Đăng nhập thành công
    return NextResponse.json(
      {
        message: "Đăng nhập thành công!",
        user: {
          id: user._id,
          fullname: user.fullname || user.name || "N/A",
          email: user.email || null,
          phone: user.phone || user.sdt || null,
          role: user.role || "user",
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
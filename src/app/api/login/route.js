import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb"; // Thay bằng hàm kết nối Mongo của bạn
// import User from "@/models/User"; // Thay bằng Model User của bạn

export async function POST(request) {
  try {
    const { identity, password } = await request.json(); // identity là email hoặc phone

    // 1. Kết nối DB và kiểm tra user (Đoạn này bạn tự cấu hình theo dự án của mình nhé)
    // await connectToDatabase();
    // const user = await User.findOne({ $or: [{ email: identity }, { phone: identity }] });
    // if (!user || user.password !== password) { 
    //   return NextResponse.json({ message: "Sai tài khoản hoặc mật khẩu" }, { status: 401 }); 
    // }

    // Giả lập một object user thành công sau khi check DB
    const mockUser = {
      id: "6a2bae4f89cab539d5399c4b",
      name: "Hai Nam",
      email: identity.includes("@") ? identity : "hainam@example.com",
    };

    const response = NextResponse.json({ 
      success: true, 
      message: "Đăng nhập thành công!",
      user: mockUser 
    });

    // 2. Lưu thông tin đăng nhập vào Cookie của trình duyệt (Hết hạn sau 7 ngày)
    response.cookies.set("user", JSON.stringify(mockUser), {
      httpOnly: false, // Để JavaScript ở Frontend có thể đọc được trạng thái đăng nhập
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, 
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
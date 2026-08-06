import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, otp, password } = await request.json();

    // 1. Kiểm tra dữ liệu đầu vào nghiêm ngặt
    if (!email || !otp || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ Email, mã OTP và Mật khẩu mới!" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const otpCollection = db.collection("otps");
    const userCollection = db.collection("users");

    // 2. Xác thực lại mã OTP một lần nữa tại Backend để đảm bảo tính chính danh
    const otpRecord = await otpCollection.findOne({ email: email.trim() });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng lấy mã mới!" },
        { status: 400 }
      );
    }

    // Kiểm tra OTP hết hạn
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await otpCollection.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ message: "Mã OTP đã hết hạn!" }, { status: 400 });
    }

    // Kiểm tra tính chính xác của OTP
    if (otpRecord.code !== otp.trim()) {
      return NextResponse.json({ message: "Mã OTP không chính xác!" }, { status: 400 });
    }

    // 3. Tiến hành mã hóa bảo mật mật khẩu mới bằng bcrypt tương thích với hệ thống login
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // 4. Cập nhật mật khẩu vào tài khoản người dùng
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

    // 5. Thành công -> Xóa mã OTP trong DB để tránh tái sử dụng
    await otpCollection.deleteOne({ _id: otpRecord._id });

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
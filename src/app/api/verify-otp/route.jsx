import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb"; // Import clientPromise từ file của bạn

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Thiếu thông tin xác thực!" }, { status: 400 });
    }

    // 1. Kết nối DB bằng clientPromise của bạn và trỏ vào bảng 'otps'
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const otpCollection = db.collection("otps");

    // 2. Tìm mã OTP của email này
    const otpRecord = await otpCollection.findOne({ email: email.trim() });

    if (!otpRecord) {
      return NextResponse.json({ message: "Mã OTP đã hết hạn hoặc không tồn tại!" }, { status: 400 });
    }

    // 3. Kiểm tra thời gian hết hạn
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await otpCollection.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ message: "Mã OTP đã hết hạn, vui lòng lấy mã mới!" }, { status: 400 });
    }

    // 4. Kiểm tra tính chính xác của mã số
    if (otpRecord.code !== otp.trim()) {
      return NextResponse.json({ message: "Mã OTP không chính xác!" }, { status: 400 });
    }

    // 5. Xác thực đúng -> Xóa mã để bảo mật
    await otpCollection.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({ message: "Mã OTP chính xác!" }, { status: 200 });

  } catch (error) {
    console.error("Lỗi hệ thống tại verify-otp:", error);
    return NextResponse.json({ message: "Lỗi hệ thống!" }, { status: 500 });
  }
}
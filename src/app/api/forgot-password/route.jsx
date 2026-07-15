import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import clientPromise from "@/libs/mongodb"; // Import clientPromise từ file của bạn

// Cấu hình bộ gửi thư bằng Gmail cá nhân
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thanhdanhdo254@gmail.com", 
    pass: "rank xcxm prte qjsu",     
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: "Vui lòng cung cấp Email!" }, { status: 400 });
    }

    // 1. Kết nối DB bằng clientPromise của bạn và trỏ vào database "Nova-kicks"
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const otpCollection = db.collection("otps"); // Sử dụng bảng viết thường 'otps' theo chuẩn Mongo

    // 2. Sinh mã OTP ngẫu nhiên
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    // 3. Lưu hoặc cập nhật mã OTP trực tiếp vào Mongo bằng MongoClient thuần
    await otpCollection.updateOne(
      { email: email.trim() },
      { $set: { code: otpCode, expiresAt } },
      { upsert: true } // Nếu chưa có email thì tự tạo mới
    );

    // 4. Cấu hình nội dung Email
    const mailOptions = {
      from: `"Nova Kicks" <admin@novakicks.com>`,
      to: email.trim(),
      subject: "[Nova Kicks] - Mã Xác Thực Khôi Phục Mật Khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #012a3a; text-align: center; text-transform: uppercase;">Security Verify</h2>
          <p>Bạn đã yêu cầu khôi phục mật khẩu tại <strong>Nova Kicks</strong>. Vui lòng sử dụng mã số OTP dưới đây để xác thực:</p>
          <div style="background-color: #f4f6f8; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #012a3a; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="color: red; font-size: 12px;">* Mã xác thực này có hiệu lực trong vòng 5 phút và chỉ sử dụng được 1 lần.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Gửi mã OTP thành công!" }, { status: 200 });

  } catch (error) {
    console.error("Lỗi hệ thống tại forgot-password:", error);
    return NextResponse.json({ message: "Gửi Email thất bại, vui lòng thử lại sau!" }, { status: 500 });
  }
}
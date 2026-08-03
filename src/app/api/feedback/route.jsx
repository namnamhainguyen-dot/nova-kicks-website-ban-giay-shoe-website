import clientPromise from "@/libs/mongodb";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. Hàm GET: Dành cho trang Admin load danh sách feedback từ database
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks"); // Trỏ đúng tên database trên Atlas của bạn

    const feedbacks = await db
      .collection("feedback")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error) {
    console.error("GET FEEDBACK ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}

// 2. Hàm POST: Dành cho form phía người dùng gửi liên hệ/feedback mới
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !phone || !message) {
      return Response.json(
        { success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc!" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks"); // Trỏ đúng tên database trên Atlas của bạn

    // Lưu vào Database collection "feedback"
    const newFeedback = {
      name,
      email,
      phone,
      subject: subject || "Không có tiêu đề",
      message,
      status: "pending", // Trạng thái chờ xử lý
      createdAt: new Date(),
    };

    const result = await db.collection("feedback").insertOne(newFeedback);

    // Gửi email thông báo về cho cửa hàng/admin
    try {
      await transporter.sendMail({
        from: `"Nova Kicks System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `[Nova Kicks] Liên hệ mới từ: ${name}`,
        html: `
          <div style="font-family:Arial, sans-serif; line-height:1.6;">
            <h3>Bạn nhận được một liên hệ mới từ website Nova Kicks</h3>
            <p><b>Họ tên:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Số điện thoại:</b> ${phone}</p>
            <p><b>Tiêu đề:</b> ${subject || 'Không có'}</p>
            <p><b>Nội dung:</b></p>
            <div style="background:#f5f5f5; padding:15px; border-radius:8px;">
              ${message}
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Lỗi gửi mail thông báo:", mailErr);
    }

    return Response.json(
      { 
        success: true, 
        message: "Gửi liên hệ thành công!", 
        insertedId: result.insertedId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST FEEDBACK ERROR:", error);
    return Response.json(
      { success: false, message: error.message || "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}
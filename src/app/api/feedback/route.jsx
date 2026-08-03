import clientPromise from "@/libs/mongodb";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!name || !email || !phone || !message) {
      return Response.json(
        { success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc!" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // 2. Lưu vào Database collection "feedback"
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

    // 3. Gửi email thông báo về cho cửa hàng/admin
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
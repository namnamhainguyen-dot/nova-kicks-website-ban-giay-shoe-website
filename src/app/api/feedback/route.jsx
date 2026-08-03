import clientPromise from "@/libs/mongodb";
import nodemailer from "nodemailer";

// ===============================
// Mail Transport
// ===============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===============================
// GET ALL FEEDBACK
// ===============================
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const feedbacks = await db
      .collection("feedback")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(
      feedbacks.map((item) => ({
        ...item,
        _id: item._id.toString(),
      }))
    );
  } catch (error) {
    console.error("GET FEEDBACK ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Không lấy được feedback",
      },
      {
        status: 500,
      }
    );
  }
}

// ===============================
// CREATE FEEDBACK
// ===============================
export async function POST(request) {
  try {
    const body = await request.json();

    console.log("NEW FEEDBACK:", body);

    const {
      name,
      email,
      phone,
      subject,
      message,
    } = body;

    if (!name || !email || !message) {
      return Response.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc",
        },
        {
          status: 400,
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const feedback = {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "Chưa cung cấp",
      subject: subject?.trim() || "Không có tiêu đề",
      message: message.trim(),
      status: "pending",
      reply: "",
      createdAt: new Date(),
    };

    const result = await db.collection("feedback").insertOne(feedback);

    // ===============================
    // Send email to Admin
    // ===============================
    try {
      await transporter.sendMail({
        from: `"Nova Kicks" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `[Nova Kicks] Feedback mới - ${feedback.subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>📩 Feedback mới từ website Nova Kicks</h2>

            <p><strong>Họ tên:</strong> ${feedback.name}</p>

            <p><strong>Email:</strong> ${feedback.email}</p>

            <p><strong>Số điện thoại:</strong> ${feedback.phone}</p>

            <p><strong>Tiêu đề:</strong> ${feedback.subject}</p>

            <hr>

            <p><strong>Nội dung:</strong></p>

            <div style="background:#f5f5f5;padding:15px;border-left:4px solid #000">
              ${feedback.message}
            </div>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);
    }

    return Response.json({
      success: true,
      message: "Gửi feedback thành công",
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("POST FEEDBACK ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Lỗi server",
      },
      {
        status: 500,
      }
    );
  }
}
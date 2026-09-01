import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import nodemailer from "nodemailer";
import { checkModeration } from "@/libs/moderation";

// =======================================================
// NODEMAILER
// =======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =======================================================
// GET - LẤY DANH SÁCH FEEDBACK
// =======================================================

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const feedbacks = await db
      .collection("feedback")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const data = feedbacks.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("❌ GET feedback error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể lấy danh sách feedback.",
      },
      {
        status: 500,
      }
    );
  }
}

// =======================================================
// POST - KHÁCH HÀNG GỬI FEEDBACK
// =======================================================

export async function POST(req) {
  try {
    // ===================================================
    // ĐỌC REQUEST
    // ===================================================

    let body;

    try {
      body = await req.json();
    } catch (error) {
      console.error("❌ Không thể đọc JSON feedback:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu gửi lên không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // LẤY DỮ LIỆU
    // ===================================================

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const phone = String(body?.phone || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();

    console.log("📩 FEEDBACK REQUEST:", {
      name,
      email,
      phone,
      subject,
    });

    // ===================================================
    // VALIDATE
    // ===================================================

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin.",
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // KIỂM TRA EMAIL
    // ===================================================

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email không hợp lệ! Vui lòng sử dụng địa chỉ @gmail.com.",
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // KIỂM TRA SỐ ĐIỆN THOẠI
    // ===================================================

    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.",
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // AI MODERATION
    //
    // Nếu moderation bị lỗi thì KHÔNG làm API feedback
    // trả 500.
    // ===================================================

    const moderationText = `${subject}\n${message}`;

    let moderation = {
      blocked: false,
      reason: "safe",
      message: "Nội dung hợp lệ.",
    };

    try {
      moderation = await checkModeration(
        moderationText
      );

      console.log(
        "🛡️ SERVER MODERATION RESULT:",
        moderation
      );
    } catch (moderationError) {
      console.error(
        "⚠️ SERVER MODERATION ERROR:",
        moderationError
      );

      // Không chặn feedback chỉ vì AI moderation lỗi.
      moderation = {
        blocked: false,
        reason: "moderation_error",
        message: "Không thể kiểm tra bằng AI.",
      };
    }

    // ===================================================
    // NẾU NỘI DUNG KHÔNG PHÙ HỢP
    // ===================================================

    if (moderation?.blocked === true) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          message:
            moderation.message ||
            "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại nội dung.",
        },
        {
          status: 400,
        }
      );
    }

    // ===================================================
    // KẾT NỐI MONGODB
    // ===================================================

    console.log("🗄️ Đang kết nối MongoDB...");

    const client = await clientPromise;

    console.log("✅ MongoDB client đã kết nối.");

    const db = client.db("Nova-kicks");

    console.log(
      "📂 Database:",
      db.databaseName
    );

    // ===================================================
    // TẠO FEEDBACK
    // ===================================================

    const newFeedback = {
      name,
      email,
      phone,
      subject,
      message,
      status: "pending",
      reply: "",
      createdAt: new Date(),
    };

    // ===================================================
    // LƯU MONGODB
    // ===================================================

    console.log(
      "💾 Đang lưu feedback vào MongoDB..."
    );

    const result = await db
      .collection("feedback")
      .insertOne(newFeedback);

    console.log(
      "✅ Feedback đã lưu:",
      result.insertedId.toString()
    );

    // ===================================================
    // GỬI EMAIL THÔNG BÁO ADMIN
    //
    // Email lỗi KHÔNG làm feedback thất bại.
    // ===================================================

    try {
      if (
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
      ) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `📩 Feedback mới từ ${name}`,

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
              "
            >
              <h2>📩 Nova Kicks - Feedback mới</h2>

              <p>
                <strong>Họ tên:</strong>
                ${name}
              </p>

              <p>
                <strong>Email:</strong>
                ${email}
              </p>

              <p>
                <strong>Số điện thoại:</strong>
                ${phone}
              </p>

              <p>
                <strong>Chủ đề:</strong>
                ${subject || "Không có"}
              </p>

              <hr />

              <p>
                <strong>Nội dung:</strong>
              </p>

              <div
                style="
                  background:#f5f5f5;
                  padding:15px;
                  border-radius:8px;
                  white-space:pre-line;
                "
              >
                ${message}
              </div>

              <hr />

              <p>
                Vui lòng truy cập trang quản trị
                Nova Kicks để xem và phản hồi.
              </p>
            </div>
          `,
        });

        console.log(
          "📧 Email thông báo feedback đã gửi."
        );
      } else {
        console.warn(
          "⚠️ Thiếu EMAIL_USER hoặc EMAIL_PASS. Bỏ qua gửi email."
        );
      }
    } catch (emailError) {
      console.error(
        "⚠️ Gửi email thông báo thất bại:",
        emailError
      );
    }

    // ===================================================
    // RESPONSE THÀNH CÔNG
    // ===================================================

    return NextResponse.json(
      {
        success: true,
        message: "Gửi feedback thành công.",

        feedback: {
          ...newFeedback,
          _id: result.insertedId.toString(),
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    // ===================================================
    // LỖI SERVER
    // ===================================================

    console.error(
      "❌❌❌ POST FEEDBACK ERROR ❌❌❌"
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Không thể gửi feedback.",
      },
      {
        status: 500,
      }
    );
  }
}
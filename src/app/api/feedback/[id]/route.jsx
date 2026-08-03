import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =======================================================
// GET - Lấy chi tiết feedback theo ID
// =======================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const feedback = await db.collection("feedback").findOne({
      _id: new ObjectId(id),
    });

    if (!feedback) {
      return Response.json(
        { success: false, message: "Không tìm thấy feedback" },
        { status: 404 }
      );
    }

    return Response.json({
      ...feedback,
      _id: feedback._id.toString(),
    });
  } catch (error) {
    console.error("GET FEEDBACK ERROR:", error);
    return Response.json(
      { success: false, message: "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}

// =======================================================
// PATCH - Đổi trạng thái hoặc trả lời feedback
// =======================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, reply } = body;

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const feedback = await db.collection("feedback").findOne({
      _id: new ObjectId(id),
    });

    if (!feedback) {
      return Response.json(
        { success: false, message: "Không tìm thấy feedback" },
        { status: 404 }
      );
    }

    const updateFields = {};

    // 1. Nếu có gửi reply -> Gửi email cho khách hàng và cập nhật trạng thái done
    if (reply) {
      const html = `
        <div style="font-family:Arial, sans-serif; line-height:1.6;">
          <h2>Nova Kicks phản hồi liên hệ</h2>
          <p>Xin chào <b>${feedback.name}</b>,</p>
          <p>Cảm ơn bạn đã liên hệ với Nova Kicks.</p>
          <hr/>
          <p><b>Nội dung phản hồi từ chúng tôi:</b></p>
          <div style="background:#f5f5f5; padding:15px; border-radius:8px; white-space:pre-line;">
            ${reply}
          </div>
          <br/>
          <b>Trân trọng,<br/>Nova Kicks Team</b>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"Nova Kicks" <${process.env.EMAIL_USER}>`,
          to: feedback.email,
          subject: `Phản hồi: ${feedback.subject || 'Liên hệ từ khách hàng'}`,
          html,
        });
      } catch (mailErr) {
        console.error("SEND REPLY MAIL ERROR:", mailErr);
      }

      updateFields.reply = reply;
      updateFields.status = "done";
      updateFields.repliedAt = new Date();
    } 
    // 2. Nếu chỉ cập nhật status thông thường (ví dụ: read, pending...)
    else if (status) {
      updateFields.status = status;
    }

    if (Object.keys(updateFields).length === 0) {
      return Response.json(
        { success: false, message: "Không có dữ liệu cập nhật" },
        { status: 400 }
      );
    }

    await db.collection("feedback").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return Response.json({
      success: true,
      message: reply ? "Đã gửi phản hồi thành công" : "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    console.error("PATCH FEEDBACK ERROR:", error);
    return Response.json(
      { success: false, message: error.message || "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}

// =======================================================
// DELETE - Xóa feedback theo ID
// =======================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const result = await db.collection("feedback").deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return Response.json(
        { success: false, message: "Không tìm thấy feedback" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Đã xóa feedback",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return Response.json(
      { success: false, message: "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}
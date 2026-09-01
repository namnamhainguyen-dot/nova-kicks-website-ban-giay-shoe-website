import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
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
// GET - CHI TIẾT FEEDBACK
// =======================================================

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID feedback không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const feedback = await db
      .collection("feedback")
      .findOne({
        _id: new ObjectId(id),
      });

    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy feedback.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      ...feedback,
      _id: feedback._id.toString(),
    });
  } catch (error) {
    console.error("❌ GET feedback detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể tải feedback.",
      },
      {
        status: 500,
      }
    );
  }
}

// =======================================================
// PATCH - CẬP NHẬT STATUS / GỬI PHẢN HỒI
// =======================================================

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID feedback không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await req.json();

    const status = body.status;
    const reply =
      body.reply !== undefined
        ? String(body.reply).trim()
        : "";

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const feedback = await db
      .collection("feedback")
      .findOne({
        _id: new ObjectId(id),
      });

    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy feedback.",
        },
        {
          status: 404,
        }
      );
    }

    // ===================================================
    // TRƯỜNG HỢP GỬI REPLY
    // ===================================================

    if (reply) {
      // -----------------------------------------------
      // AI KIỂM TRA NỘI DUNG ADMIN PHẢN HỒI
      // -----------------------------------------------

      const moderation = await checkModeration(reply);

      if (moderation.blocked) {
        return NextResponse.json(
          {
            success: false,
            blocked: true,
            message:
              "Nội dung phản hồi chứa từ ngữ không phù hợp. Vui lòng viết lại.",
          },
          {
            status: 400,
          }
        );
      }

      // -----------------------------------------------
      // GỬI EMAIL CHO KHÁCH HÀNG
      // -----------------------------------------------

      if (
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
      ) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: feedback.email,
          subject: `Nova Kicks - Phản hồi: ${feedback.subject}`,

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 700px;
                margin: auto;
              "
            >
              <h2>📩 Nova Kicks phản hồi bạn</h2>

              <p>
                Xin chào <strong>${feedback.name}</strong>,
              </p>

              <p>
                Cảm ơn bạn đã gửi feedback đến Nova Kicks.
              </p>

              <div
                style="
                  margin: 20px 0;
                  padding: 15px;
                  background: #f8f9fa;
                  border-radius: 8px;
                "
              >
                <strong>Feedback của bạn:</strong>

                <p style="white-space: pre-line;">
                  ${feedback.message}
                </p>
              </div>

              <div
                style="
                  margin: 20px 0;
                  padding: 15px;
                  background: #fff3cd;
                  border-radius: 8px;
                "
              >
                <strong>Phản hồi từ Nova Kicks:</strong>

                <p style="white-space: pre-line;">
                  ${reply}
                </p>
              </div>

              <p>
                Trân trọng,<br />
                <strong>Nova Kicks</strong>
              </p>
            </div>
          `,
        });
      }

      // -----------------------------------------------
      // LƯU REPLY
      // -----------------------------------------------

      await db.collection("feedback").updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            reply,
            status: "done",
            repliedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Đã gửi phản hồi cho khách hàng.",
      });
    }

    // ===================================================
    // CHỈ CẬP NHẬT STATUS
    // ===================================================

    if (status) {
      const allowedStatuses = [
        "pending",
        "unread",
        "read",
        "done",
      ];

      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Trạng thái không hợp lệ.",
          },
          {
            status: 400,
          }
        );
      }

      await db.collection("feedback").updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            status,
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Cập nhật trạng thái thành công.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Không có dữ liệu cần cập nhật.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error("❌ PATCH feedback error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra khi cập nhật feedback.",
      },
      {
        status: 500,
      }
    );
  }
}

// =======================================================
// DELETE - XÓA FEEDBACK
// =======================================================

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID feedback không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const result = await db
      .collection("feedback")
      .deleteOne({
        _id: new ObjectId(id),
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy feedback để xóa.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa feedback.",
    });
  } catch (error) {
    console.error("❌ DELETE feedback error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể xóa feedback.",
      },
      {
        status: 500,
      }
    );
  }
}


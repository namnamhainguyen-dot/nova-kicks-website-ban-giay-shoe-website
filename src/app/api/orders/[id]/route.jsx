import clientPromise from "../../../../libs/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

/// CẤU HÌNH TRÌNH GỬI EMAIL (TRANSPORTER)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: (process.env.EMAIL_USER || "luckhanh6677@gmail.com").trim(),
    pass: (process.env.EMAIL_PASS || "kemtlqntuxiiqfai").replace(/\s+/g, ""), // Tự động xóa sạch khoảng trắng
  },
});
// ==========================================
// 📧 CÁC MẪU TEMPLATE EMAIL
// ==========================================

// 1. Mẫu HTML Mail 1: Báo đơn mới / Xác nhận thanh toán
function generateOrderEmailHTML(order) {
  const itemsHTML = order.order_items?.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        <strong>${item.name}</strong><br>
        <small style="color: #666;">Màu: ${item.color || '---'} | Size: ${item.size || '---'}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}đ</td>
    </tr>
  `).join("") || "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #1a1a1a; text-align: center; text-transform: uppercase;">Thông Báo Đơn Hàng Mới</h2>
      <p style="font-size: 16px; color: #333;">Xin chào ${order.name || "Khách hàng"},</p>
      <p style="font-size: 14px; color: #555;">Hệ thống <strong>Nova Kicks</strong> ghi nhận đơn hàng của bạn đã cập nhật trạng thái thành công. Dưới đây là thông tin chi tiết:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h4 style="margin-top: 0; color: #333;">📍 Thông tin đơn hàng #${order._id.toString().toUpperCase()}</h4>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Người nhận:</strong> ${order.name}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Số điện thoại:</strong> ${order.phone}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Địa chỉ giao:</strong> ${order.location_id || "Chưa cập nhật"}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Trạng thái thanh toán:</strong> <span style="color: green; font-weight: bold;">ĐÃ XÁC NHẬN</span></p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr style="background-color: #333; color: #fff;">
            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
            <th style="padding: 10px; text-align: center;">SL</th>
            <th style="padding: 10px; text-align: right;">Tổng</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 16px;">
        <strong>Tổng tiền thanh toán: <span style="color: #d9534f; font-size: 20px;">${(order.final_total || order.total || 0).toLocaleString("vi-VN")}đ</span></strong>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Cảm ơn bạn đã lựa chọn Nova Kicks!</p>
    </div>
  `;
}

// 2. Mẫu HTML Mail 2: Cảm ơn sau khi giao hàng thành công (completed)
function generateThankYouEmailHTML(order) {
  const itemsHTML = order.order_items?.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small style="color: #666;">Màu: ${item.color || '---'} | Size: ${item.size || '---'}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}đ</td>
    </tr>
  `).join("") || "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #111111; color: #ffffff; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NOVA KICKS</h1>
        <p style="margin: 8px 0 0; font-size: 15px; color: #28a745; font-weight: bold;">🎉 ĐƠN HÀNG ĐÃ GIAO THÀNH CÔNG!</p>
      </div>
      
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="font-size: 15px; color: #111;">Xin chào <strong>${order.name || "Khách hàng"}</strong>,</p>
        <p style="font-size: 14px; color: #444; line-height: 1.6;">
          Đơn hàng <strong>#${order._id.toString().toUpperCase()}</strong> của bạn đã giao thành công và hoàn tất. Cảm ơn bạn rất nhiều vì đã tin tưởng và lựa chọn sản phẩm từ <strong>Nova Kicks</strong>!
        </p>

        <h3 style="color: #111111; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 20px;">👟 TỔNG KẾT ĐƠN HÀNG</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 8px 10px; text-align: left;">Sản phẩm</th>
              <th style="padding: 8px 10px; text-align: center;">SL</th>
              <th style="padding: 8px 10px; text-align: right;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div style="margin-top: 15px; text-align: right; font-size: 15px;">
          <strong>Tổng giá trị: <span style="color: #dc3545;">${(order.final_total || order.total || 0).toLocaleString("vi-VN")}đ</span></strong>
        </div>

        <div style="background-color: #f0f7ff; border-left: 4px solid #007bff; padding: 12px 15px; margin-top: 25px; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #004085; line-height: 1.5;">
            🌟 <strong>Hy vọng bạn hài lòng với trải nghiệm lần này!</strong> Nếu có bất kỳ thắc mắc hay cần hỗ trợ về sản phẩm, hãy liên hệ ngay với Nova Kicks nhé.
          </p>
        </div>
      </div>
      
      <div style="background-color: #111111; text-align: center; padding: 15px; font-size: 12px; color: #aaaaaa;">
        Cảm ơn bạn đã đồng hành cùng <strong>Nova Kicks</strong>!
      </div>
    </div>
  `;
}

// ==========================================
// 1. HÀM GET (Chi tiết đơn hàng)
// ==========================================
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const { id } = await params;

    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "Định dạng mã đơn hàng không chính xác" }, { status: 400 });
    }

    const order = await db.collection("orders").findOne({ _id: new ObjectId(String(id)) });

    if (!order) {
      return Response.json({ success: false, error: "Đơn hàng không tồn tại trong hệ thống" }, { status: 404 });
    }

    return Response.json({
      ...order,
      _id: String(order._id),
    });
  } catch (error) {
    console.error("Lỗi API GET:", error);
    return Response.json({ success: false, error: "Lỗi xử lý hệ thống phía Backend" }, { status: 500 });
  }
}

// ==========================================
// 2. HÀM PATCH (Cập nhật trạng thái & Gửi Email)
// ==========================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "ID đơn hàng không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const updateFields = {};
    
    if (body.status !== undefined) {
      updateFields.status = body.status;
    }
    
    if (body.isPaid !== undefined) {
      updateFields.isPaid = body.isPaid;
    }

    if (body.status === "cancelled" && body.cancelReason) {
      updateFields.cancelReason = body.cancelReason;
    }

    // Cập nhật dữ liệu vào MongoDB
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return Response.json({ success: false, error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // Lấy thông tin đơn hàng đầy đủ sau khi cập nhật
    const fullOrderDetails = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    if (fullOrderDetails && fullOrderDetails.email && fullOrderDetails.email !== "guest") {
      
      // 🌟 KỊCH BẢN 1: GỬI MAIL 1 (Khi xác nhận thanh toán thành công isPaid = true)
      if (body.isPaid === true) {
        const mailOptions = {
          from: '"Nova Kicks" <luckhanh6677@gmail.com>',
          to: fullOrderDetails.email,
          bcc: "luckhanh6677@gmail.com",
          subject: `👟 [Nova Kicks] Xác nhận thanh toán đơn hàng #${fullOrderDetails._id.toString().toUpperCase()}`,
          html: generateOrderEmailHTML(fullOrderDetails),
        };

        transporter.sendMail(mailOptions).then(info => {
          console.log("Email Mail 1 (Xác nhận) đã gửi:", info.messageId);
        }).catch(mailErr => console.error("Lỗi gửi Mail 1:", mailErr));
      }

      // 🌟 KỊCH BẢN 2: GỬI MAIL 2 (Khi Admin đổi trạng thái thành "completed")
      if (body.status === "completed") {
        const thankYouMailOptions = {
          from: '"Nova Kicks" <luckhanh6677@gmail.com>',
          to: fullOrderDetails.email,
          bcc: "luckhanh6677@gmail.com",
          subject: `🎉 [Nova Kicks] Cảm ơn bạn đã mua hàng! (Đơn hàng #${fullOrderDetails._id.toString().toUpperCase()})`,
          html: generateThankYouEmailHTML(fullOrderDetails),
        };

        transporter.sendMail(thankYouMailOptions).then(info => {
          console.log("Email Mail 2 (Cảm ơn) đã gửi thành công:", info.messageId);
        }).catch(mailErr => console.error("Lỗi gửi Mail 2:", mailErr));
      }
    }

    return Response.json({
      success: true,
      message: "Cập nhật đơn hàng và xử lý thông báo thành công",
    });
  } catch (error) {
    console.error("Cập nhật thất bại:", error);
    return Response.json({ success: false, error: "Cập nhật thất bại" }, { status: 500 });
  }
}

// ==========================================
// 3. HÀM DELETE (Xóa đơn hàng)
// ==========================================
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const { id } = await params;

    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "ID đơn hàng không hợp lệ" }, { status: 400 });
    }

    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(String(id)) });

    if (result.deletedCount === 0) {
      return Response.json({ success: false, error: "Không tìm thấy đơn hàng cần xóa" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Xóa đơn hàng thành công" });
  } catch (error) {
    console.error("Lỗi API DELETE:", error);
    return Response.json({ success: false, error: "Lỗi hệ thống khi xóa đơn hàng" }, { status: 500 });
  }
}
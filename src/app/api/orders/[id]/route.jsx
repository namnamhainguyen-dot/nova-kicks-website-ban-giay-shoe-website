import clientPromise from "../../../../libs/mongodb"; // Đã sửa đường dẫn lùi 4 cấp chuẩn xác ra ngoài src
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

// CẤU HÌNH TRÌNH GỬI EMAIL (TRANSPORTER)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "luckhanh6677@gmail.com", // Gmail dùng để gửi đi
    pass: "zainqffwrylcapry",       // Mật khẩu ứng dụng 16 ký tự của bạn
  },
});

// Hàm tạo giao diện HTML cho nội dung Email
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
  `).join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #1a1a1a; text-align: center; text-transform: uppercase;">Thông Báo Đơn Hàng Mới</h2>
      <p style="font-size: 16px; color: #333;">Xin chào,</p>
      <p style="font-size: 14px; color: #555;">Hệ thống <strong>Nova Kicks</strong> ghi nhận một đơn hàng đã được cập nhật trạng thái thanh toán thành công. Dưới đây là thông tin chi tiết:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h4 style="margin-top: 0; color: #333;">📍 Thông tin đơn hàng #${order._id.toString().toUpperCase()}</h4>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Người nhận:</strong> ${order.name}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Số điện thoại:</strong> ${order.phone}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Địa chỉ giao:</strong> ${order.location_id || "Chưa cập nhật"}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Trạng thái thanh toán:</strong> <span style="color: green; font-weight: bold;">ĐÃ THANH TOÁN (VietQR)</span></p>
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
        <strong>Tổng tiền cuối cùng: <span style="color: #d9534f; font-size: 20px;">${(order.final_total || order.total).toLocaleString("vi-VN")}đ</span></strong>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động từ hệ thống giả lập website Nova Kicks. Vui lòng không phản hồi lại email này.</p>
    </div>
  `;
}

//HÀM GET (Chi tiết đơn hàng)
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Next.js 16 bắt buộc phải await params
    const { id } = await params;

    if (!id || id.length !== 24) {
      return Response.json({ success: false, error: "Định dạng mã đơn hàng không chính xác" }, { status: 400 });
    }

    const order = await db.collection("orders").findOne({ _id: new ObjectId(String(id)) });

    if (!order) {
      return Response.json({ success: false, error: "Đơn hàng không tồn tại trong hệ thống" }, { status: 404 });
    }

    // Chuẩn hóa cấu trúc trả về { success: true, data: order } để Front-end page.jsx đọc được luôn
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
// ✅ 2. HÀM PATCH (Cập nhật trạng thái)
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

    // 👉 ĐÃ SỬA: Khởi tạo object cập nhật động chứa cả status và isPaid (nếu có truyền lên)
    const updateFields = {};
    
    if (body.status !== undefined) {
      updateFields.status = body.status;
    }
    
    if (body.isPaid !== undefined) {
      updateFields.isPaid = body.isPaid; // Lưu trạng thái thanh toán true/false vào database
    }

    // BỔ SUNG: Nếu trạng thái là hủy đơn và có lý do hủy từ client gửi lên
    if (body.status === "cancelled" && body.cancelReason) {
      updateFields.cancelReason = body.cancelReason;
    }

    // Cập nhật dữ liệu mới vào MongoDB
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return Response.json({ success: false, error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // 🌟 LOGIC TỰ ĐỘNG GỬI MAIL KHI THANH TOÁN THÀNH CÔNG
    // (Lúc này DB đã được cập nhật isPaid: true thành công ở bước trên)
    if (body.isPaid === true) {
      const fullOrderDetails = await db.collection("orders").findOne({ _id: new ObjectId(id) });
      
      if (fullOrderDetails) {
        const mailOptions = {
          from: '"Nova Kicks" <luckhanh6677@gmail.com>', // Gmail gửi đi
          to: fullOrderDetails.email, // Gửi trực tiếp đến hòm thư của khách hàng
          
          // 🌟 BỔ SUNG BCC: Gửi một bản sao ẩn danh về hòm thư của bạn (Admin)
          bcc: "luckhanh6677@gmail.com", 
          
          subject: `👟 [Nova Kicks] Xác nhận thanh toán đơn hàng #${fullOrderDetails._id.toString().toUpperCase()}`,
          html: generateOrderEmailHTML(fullOrderDetails), 
        };

        // Kích hoạt tiến trình gửi mail bất đồng bộ (không làm chậm phản hồi của client)
        transporter.sendMail(mailOptions).then(info => {
          console.log("Email thông báo đơn hàng gửi thành công:", info.messageId);
        }).catch(mailErr => {
          console.error("Lỗi tiến trình gửi mail:", mailErr);
        });
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
// 🚀 3. BỔ SUNG HÀM DELETE (Xóa đơn hàng)
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
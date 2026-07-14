import clientPromise from "@/libs/mongodb";
import nodemailer from "nodemailer";

// ── CẤU HÌNH GỬI MAIL (NODEMAILER) ──
// Nhớ thêm EMAIL_USER và EMAIL_PASS vào file .env.local nhé!
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // ví dụ: shopcuaban@gmail.com
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng Gmail (16 ký tự viết liền)
  },
});

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // 1. Trích xuất tham số 'email' từ query string URL
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // 2. Khởi tạo bộ lọc tìm kiếm mặc định (Trống = Lấy tất cả cho Admin)
    let queryFilter = {};

    // 3. Nếu có tham số email gửi lên (Trang cá nhân đang gọi)
    if (email) {
      if (email === "guest") {
        return Response.json([]); // Nếu là guest không có tài khoản, trả về mảng rỗng
      }
      queryFilter.email = email; // Gán bộ lọc tìm kiếm theo đúng email này
    }

    // 4. Tìm kiếm trong Database dựa theo bộ lọc queryFilter linh hoạt
    const orders = await db
      .collection("orders")
      .find(queryFilter)
      .sort({ createdAt: -1 }) // Đơn hàng mới nhất lên đầu
      .toArray();

    const normalized = orders.map((order) => ({
      ...order,
      _id: String(order._id),
    }));

    return Response.json(normalized);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    return Response.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const body = await request.json();

    const {
      email,
      name,
      phone,
      location_id,
      note,
      order_items,
      total,
      discount,
      final_total,
      applied_voucher,
      paymentMethod, // Nhận thêm phương thức thanh toán từ frontend gửi lên
    } = body;

    // 1. Tạo đối tượng đơn hàng mới lưu vào MongoDB
    const newOrder = {
      email: email || "guest",
      name,
      phone,
      location_id,
      note,
      order_items,
      total,
      discount: discount || 0,
      final_total: final_total || total,
      applied_voucher: applied_voucher || null,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
      createdAt: new Date(),
    };

    // 2. Lưu trực tiếp đơn hàng vào MongoDB
    const result = await db.collection("orders").insertOne(newOrder);
    const orderId = String(result.insertedId);

    // ── 3. XỬ LÝ THANH TOÁN GIẢ LẬP ──
    let paymentUrl = null;
    if (paymentMethod === "vnpay") {
      // Điều hướng người dùng đến trang QR Code giả lập của bạn trên Frontend
      paymentUrl = `/checkout/payment-simulation?orderId=${orderId}&total=${final_total || total}`;
    }

    // ── 4. TIẾN HÀNH GỬI MAIL THÔNG BÁO (CHẠY BẤT ĐỒNG BỘ) ──
    // Gom HTML danh sách sản phẩm
    const itemsHtml = order_items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong> 
          ${item.color ? `<br/><span style="color: #666; font-size: 12px;">Màu: ${item.color}</span>` : ""}
          ${item.size ? `<span style="color: #666; font-size: 12px;"> | Size: ${item.size}</span>` : ""}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString("vi-VN")}đ</td>
      </tr>
    `).join("");

    // Khung HTML email đẹp mắt mang phong cách Nova Kicks
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #111111; color: #ffffff; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NOVA KICKS</h1>
          <p style="margin: 5px 0 0; font-size: 14px; color: #aaaaaa;">Cảm ơn bạn đã đặt hàng tại shop chúng tôi!</p>
        </div>
        
        <div style="padding: 24px; background-color: #ffffff;">
          <h3 style="color: #111111; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 0;">📦 THÔNG TIN ĐƠN HÀNG #${orderId}</h3>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Khách hàng:</strong> ${name}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Số điện thoại:</strong> ${phone}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Địa chỉ giao:</strong> ${location_id}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Thanh toán:</strong> ${paymentMethod === "cod" ? "Thanh toán COD khi nhận hàng" : "Thanh toán Online bằng mã QR (Giả lập)"}</p>
          ${note ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Ghi chú:</strong> ${note}</p>` : ""}

          <h3 style="color: #111111; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 24px;">👟 CHI TIẾT SẢN PHẨM</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa; font-size: 13px;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Sản phẩm</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
              </tr>
            </thead>
            <tbody style="font-size: 13px; color: #333;">
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right; font-size: 14px; line-height: 1.6;">
            <p style="margin: 4px 0;">Tổng tiền hàng: <strong>${total.toLocaleString("vi-VN")}đ</strong></p>
            ${discount > 0 ? `<p style="margin: 4px 0; color: #dc3545;">Mã giảm giá: <strong>-${discount.toLocaleString("vi-VN")}đ</strong></p>` : ""}
            <p style="margin: 4px 0; font-size: 18px; color: #111111;"><strong>Tổng thanh toán: <span style="color: #dc3545;">${final_total.toLocaleString("vi-VN")}đ</span></strong></p>
          </div>
        </div>
        
        <div style="background-color: #f9f9f9; text-align: center; padding: 15px; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
          Đơn hàng đang được hệ thống chuẩn bị và đóng gói. Mọi thắc mắc vui lòng liên hệ hotline hỗ trợ khách hàng của Nova Kicks.
        </div>
      </div>
    `;

    // Xác định email gửi đến (Nếu là guest hoặc email không hợp lệ thì dự phòng gửi về mail quản trị để test)
    const receiverEmail = email && email !== "guest" && email.includes("@") 
      ? email 
      : process.env.EMAIL_USER; 

    // Gửi mail không chặn luồng chính (không sử dụng 'await' nếu muốn phản hồi nhanh, hoặc dùng await để chắc chắn thành công)
    try {
      await transporter.sendMail({
        from: `"Nova Kicks Shop" <${process.env.EMAIL_USER}>`,
        to: receiverEmail,
        subject: `[Nova Kicks] Xác nhận đơn hàng #${orderId} thành công!`,
        html: emailTemplate,
      });
    } catch (mailError) {
      console.error("Lỗi gửi email:", mailError);
      // Vẫn tiếp tục tạo đơn bình thường kể cả khi gửi mail lỗi
    }

    // 5. Trả về thông tin cho Client
    return Response.json({
      success: true,
      _id: orderId,
      paymentUrl: paymentUrl // Trả về URL để Client điều hướng sang trang QR nếu chọn vnpay
    });

  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);

    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
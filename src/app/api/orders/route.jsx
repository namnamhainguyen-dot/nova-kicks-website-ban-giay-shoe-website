import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

// ── CẤU HÌNH GỬI MAIL (NODEMAILER) ──
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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

    // 3. Lọc đơn hàng theo email khách hàng nếu có
    if (email) {
      if (email === "guest") {
        return Response.json([]);
      }
      queryFilter.email = email;
    }

    // 4. Lấy danh sách đơn hàng từ MongoDB
    const orders = await db
      .collection("orders")
      .find(queryFilter)
      .sort({ createdAt: -1 })
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
      paymentMethod,
    } = body;

    // 🛑 THÊM LỚP 1 Ở ĐÂY: Kiểm tra tài khoản có bị khóa không trước khi cho đặt hàng
    if (email && email !== "guest") {
      const existingUser = await db.collection("users").findOne({ email: email.trim().toLowerCase() });
      if (existingUser && existingUser.status === "inactive") {
        return Response.json(
          { message: "Tài khoản của bạn đã bị khóa bởi quản trị viên. Không thể thực hiện giao dịch." },
          { status: 403 } // 403 Forbidden
        );
      }
    }

    // 1. Tạo đối tượng đơn hàng mới
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

    // 2. Lưu đơn hàng vào MongoDB
    const result = await db.collection("orders").insertOne(newOrder);
    const orderId = String(result.insertedId);

    // 🌟 3. TỰ ĐỘNG TRỪ SỐ LƯỢNG KHO THEO TỪNG SIZE RIÊNG LẺ
    if (Array.isArray(order_items)) {
      for (const item of order_items) {
        const productId = item.product_id || item.productId || item._id || item.id;
        const buyQuantity = Number(item.quantity) || 0;
        
        const itemColor = item.color ? String(item.color).trim().toLowerCase() : null;
        const itemSize = item.size ? Number(item.size) : null;

        if (productId && buyQuantity > 0) {
          const productFilter = ObjectId.isValid(productId) 
            ? { _id: new ObjectId(productId) } 
            : { _id: productId };

          const product = await db.collection("products").findOne(productFilter);

          if (product && Array.isArray(product.variants) && product.variants.length > 0 && itemColor && itemSize !== null) {
            
            // 1. Tìm vị trí (index) của màu sắc (color)
            const colorIndex = product.variants.findIndex(v => {
              const vColor = v.color ? String(v.color).trim().toLowerCase() : "";
              return vColor === itemColor;
            });

            if (colorIndex !== -1) {
              // 2. Tìm vị trí (index) của size trong mảng sizes của màu đó
              const sizesArray = product.variants[colorIndex].sizes || [];
              const sizeIndex = sizesArray.findIndex(s => Number(s.size) === itemSize);

              if (sizeIndex !== -1) {
                // Trừ đúng số lượng của size đó VÀ trừ luôn tổng kho chung của sản phẩm
                await db.collection("products").updateOne(
                  productFilter,
                  { 
                    $inc: { 
                      [`variants.${colorIndex}.sizes.${sizeIndex}.quantity`]: -buyQuantity,
                      quantity: -buyQuantity 
                    } 
                  }
                );
              } else {
                // Fallback nếu không tìm thấy size khớp chính xác
                await db.collection("products").updateOne(
                  productFilter,
                  { $inc: { quantity: -buyQuantity } }
                );
              }
            } else {
              // Fallback nếu không tìm thấy màu khớp
              await db.collection("products").updateOne(
                productFilter,
                { $inc: { quantity: -buyQuantity } }
              );
            }
          } else {
            // Trường hợp sản phẩm không có biến thể phân loại
            await db.collection("products").updateOne(
              productFilter,
              { $inc: { quantity: -buyQuantity } }
            );
          }
        }
      }
    }

    // 4. Xử lý thanh toán giả lập
    let paymentUrl = null;
    if (paymentMethod === "vnpay") {
      paymentUrl = `/checkout/payment-simulation?orderId=${orderId}&total=${final_total || total}`;
    }

    // 5. Tạo giao diện HTML danh sách sản phẩm
    const itemsHtml = order_items
      .map(
        (item) => `
      <tr>
        <td style="padding: 14px 10px; border-bottom: 1px solid #f0f0f0;">
          <div style="display: flex; align-items: center;">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px; border: 1px solid #eee;" />`
                : ""
            }
            <div>
              <div style="font-weight: 600; color: #111111; font-size: 14px;">${item.name}</div>
              <div style="color: #777777; font-size: 12px; margin-top: 2px;">
                ${item.color ? `Màu: <strong>${item.color}</strong>` : ""} 
                ${item.color && item.size ? " | " : ""}
                ${item.size ? `Size: <strong>${item.size}</strong>` : ""}
              </div>
            </div>
          </div>
        </td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #f0f0f0; text-align: center; font-weight: 600; color: #333333; font-size: 14px;">
          x${item.quantity}
        </td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #111111; font-size: 14px;">
          ${item.price.toLocaleString("vi-VN")}đ
        </td>
      </tr>
    `
      )
      .join("");

    // 6. Template Email giao diện mới
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f6; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #eaeaea;">
                
                <!-- HEADER BANNER -->
                <tr>
                  <td style="background-color: #0d0d0d; padding: 36px 20px; text-align: center;">
                    <div style="display: inline-block; background: #222; padding: 6px 16px; border-radius: 20px; color: #e50914; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">
                      Xác Nhận Đơn Hàng
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 3px; font-family: Arial, sans-serif;">
                      NOVA KICKS<span style="color: #e50914;">.</span>
                    </h1>
                    <p style="margin: 8px 0 0; color: #999999; font-size: 14px;">Cảm ơn bạn đã tin tưởng chọn lựa phong cách của chúng tôi.</p>
                  </td>
                </tr>

                <!-- THÔNG TIN ĐƠN HÀNG GIỚI THIỆU -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px;">
                    <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; border-left: 4px solid #111111;">
                      <div style="font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Mã đơn hàng</div>
                      <div style="font-size: 20px; font-weight: 800; color: #111111; margin-top: 4px;">#${orderId}</div>
                    </div>
                  </td>
                </tr>

                <!-- THÔNG TIN KHÁCH HÀNG -->
                <tr>
                  <td style="padding: 0 30px 20px 30px;">
                    <h3 style="margin: 0 0 14px 0; font-size: 15px; color: #111111; text-transform: uppercase; letter-spacing: 0.5px;">📍 Thông tin giao hàng</h3>
                    <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #444444; line-height: 1.6;">
                      <tr>
                        <td style="padding: 4px 0; width: 120px; color: #777777;">Người nhận:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #111111;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #777777;">Số điện thoại:</td>
                        <td style="padding: 4px 0; font-weight: 600; color: #111111;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #777777;">Địa chỉ:</td>
                        <td style="padding: 4px 0; font-weight: 500;">${location_id}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #777777;">Thanh toán:</td>
                        <td style="padding: 4px 0;">
                          <span style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; ${
                            paymentMethod === "cod"
                              ? "background-color: #e3f2fd; color: #0d47a1;"
                              : "background-color: #e8f5e9; color: #1b5e20;"
                          }">
                            ${
                              paymentMethod === "cod"
                                ? "COD (Thanh toán khi nhận hàng)"
                                : "Chuyển khoản QR (Đã thanh toán giả lập)"
                            }
                          </span>
                        </td>
                      </tr>
                      ${
                        note
                          ? `
                      <tr>
                        <td style="padding: 4px 0; color: #777777;">Ghi chú:</td>
                        <td style="padding: 4px 0; font-style: italic; color: #666666;">"${note}"</td>
                      </tr>
                      `
                          : ""
                      }
                    </table>
                  </td>
                </tr>

                <!-- DANH SÁCH SẢN PHẨM -->
                <tr>
                  <td style="padding: 10px 30px 20px 30px;">
                    <h3 style="margin: 0 0 14px 0; font-size: 15px; color: #111111; text-transform: uppercase; letter-spacing: 0.5px;">👟 Chi tiết sản phẩm</h3>
                    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                      <thead>
                        <tr style="border-bottom: 2px solid #111111;">
                          <th align="left" style="padding: 8px 10px; font-size: 12px; color: #666666; text-transform: uppercase;">Sản phẩm</th>
                          <th align="center" style="padding: 8px 10px; font-size: 12px; color: #666666; text-transform: uppercase;">SL</th>
                          <th align="right" style="padding: 8px 10px; font-size: 12px; color: #666666; text-transform: uppercase;">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- BẢNG TỔNG TIỀN -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px;">
                      <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #555555; line-height: 1.8;">
                        <tr>
                          <td>Tạm tính:</td>
                          <td align="right" style="font-weight: 600; color: #111111;">${total.toLocaleString("vi-VN")}đ</td>
                        </tr>
                        ${
                          discount > 0
                            ? `
                        <tr>
                          <td>Mã giảm giá ${applied_voucher ? `(${applied_voucher})` : ""}:</td>
                          <td align="right" style="font-weight: 600; color: #e50914;">-${discount.toLocaleString("vi-VN")}đ</td>
                        </tr>
                        `
                            : ""
                        }
                        <tr>
                          <td style="padding-top: 10px; font-size: 16px; font-weight: 800; color: #111111; border-top: 1px dashed #e0e0e0;">Tổng thanh toán:</td>
                          <td align="right" style="padding-top: 10px; font-size: 20px; font-weight: 900; color: #e50914; border-top: 1px dashed #e0e0e0;">${final_total.toLocaleString("vi-VN")}đ</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #fafafa; padding: 24px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666; font-weight: 500;">
                      Đơn hàng đang được đóng gói và chuẩn bị giao tới bạn.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      Nếu bạn có câu hỏi, vui lòng phản hồi lại email này hoặc gọi hotline hỗ trợ.
                    </p>
                    <div style="margin-top: 16px; font-size: 11px; color: #bbbbbb; text-transform: uppercase; letter-spacing: 1px;">
                      © ${new Date().getFullYear()} Nova Kicks. All rights reserved.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 7. Xác định địa chỉ email nhận thư
    const receiverEmail =
      email && email !== "guest" && email.includes("@")
        ? email
        : process.env.EMAIL_USER;

    // 8. Gửi mail bất đồng bộ
    try {
      await transporter.sendMail({
        from: `"Nova Kicks Shop" <${process.env.EMAIL_USER}>`,
        to: receiverEmail,
        subject: `[Nova Kicks] Xác nhận đơn hàng #${orderId} thành công!`,
        html: emailTemplate,
      });
    } catch (mailError) {
      console.error("Lỗi gửi email:", mailError);
    }

    // 9. Phản hồi kết quả cho client
    return Response.json({
      success: true,
      _id: orderId,
      paymentUrl: paymentUrl,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
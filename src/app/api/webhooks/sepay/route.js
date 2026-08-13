import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const data = await req.json();
    
    // SePay thường gửi các trường: content (hoặc description), transferAmount (hoặc amount)
    const { content, transferAmount } = data;

    if (!content) {
      return NextResponse.json({ success: false, message: "Không có nội dung chuyển khoản" }, { status: 400 });
    }

    // 1. Quét tìm chuỗi 24 ký tự hex (MongoDB ObjectId) trong nội dung chuyển khoản
    const match = content.match(/[0-9a-fA-F]{24}/); 
    if (!match) {
      return NextResponse.json({ success: false, message: "Không tìm thấy mã đơn hàng hợp lệ trong nội dung" }, { status: 400 });
    }

    const orderIdStr = match[0];

    const ordersCollection = db.collection("orders");
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderIdStr) });

    if (!order) {
      return NextResponse.json({ success: false, message: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    // 2. (Tùy chọn an toàn) Kiểm tra xem đơn hàng đã được thanh toán trước đó chưa để tránh xử lý trùng lặp
    if (order.isPaid) {
      return NextResponse.json({ success: true, message: "Đơn hàng này đã được thanh toán từ trước đó rồi" });
    }

    // 3. (Tùy chọn an toàn) Kiểm tra số tiền chuyển khoản có khớp với final_total của đơn hàng không
    // Chuyển về số để so sánh chính xác
    const paidAmount = Number(transferAmount || 0);
    const expectedAmount = Number(order.final_total || order.total || 0);

    if (paidAmount > 0 && paidAmount < expectedAmount) {
      console.warn(`[SEPAY WARNING] Đơn ${orderIdStr} chuyển thiếu tiền. Cần: ${expectedAmount}, Thực nhận: ${paidAmount}`);
      // Bạn có thể chọn cập nhật status là "underpaid" hoặc vẫn cho qua tùy chính sách shop
    }

    // 4. Cập nhật trạng thái đơn hàng thành ĐÃ THANH TOÁN
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderIdStr) },
      { 
        $set: { 
          isPaid: true,                            
          status: "preparing",        
          paymentMethod: "sepay_qr",   
          paidAmount: paidAmount,
          paidAt: new Date()          
        } 
      }
    );

    console.log(`[SEPAY WEBHOOK SUCCESS] Đã xác nhận thanh toán đơn: ${orderIdStr} với số tiền: ${paidAmount}`);

    return NextResponse.json({ success: true, message: "Cập nhật đơn hàng thành công" });
  } catch (error) {
    console.error("Lỗi Webhook SePay:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
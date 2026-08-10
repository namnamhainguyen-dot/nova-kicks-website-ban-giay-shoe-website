import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const data = await req.json();
    
    const { content, transferAmount } = data;

    if (!content) {
      return NextResponse.json({ success: false, message: "Không có nội dung chuyển khoản" }, { status: 400 });
    }

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

    await ordersCollection.updateOne(
      { _id: new ObjectId(orderIdStr) },
      { 
        $set: { 
          isPaid: true,                    
          status: "preparing",         
          paymentMethod: "sepay_qr",   
          paidAt: new Date()           
        } 
      }
    );

    console.log(`[SEPAY WEBHOOK SUCCESS] Đã xác nhận thanh toán đơn: ${orderIdStr} với số tiền: ${transferAmount}`);

    return NextResponse.json({ success: true, message: "Cập nhật đơn hàng thành công" });
  } catch (error) {
    console.error("Lỗi Webhook SePay:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
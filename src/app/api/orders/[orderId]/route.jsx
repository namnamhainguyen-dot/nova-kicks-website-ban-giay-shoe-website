import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { orderId } = params;

    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ success: false, message: "Mã đơn hàng không hợp lệ" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // Trả về trạng thái isPaid hiện tại trong DB cho Frontend biết
    return NextResponse.json({
      _id: String(order._id),
      total: order.final_total || order.total,
      isPaid: order.isPaid || false,
      status: order.status,
    }, { status: 200 });

  } catch (error) {
    console.error("Lỗi lấy thông tin đơn hàng:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
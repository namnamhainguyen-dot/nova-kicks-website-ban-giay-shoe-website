import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { orderId } = await req.json();
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId), isPaid: false });

    if (order) {
      // Hoàn lại kho cho từng sản phẩm
      for (const item of order.order_items) {
        await db.collection("products").updateOne(
          { _id: new ObjectId(item.product_id) },
          { $inc: { quantity: item.quantity } }
        );
      }
      // Xóa đơn rác
      await db.collection("orders").deleteOne({ _id: new ObjectId(orderId) });
    }
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ success: false }, { status: 500 }); }
}
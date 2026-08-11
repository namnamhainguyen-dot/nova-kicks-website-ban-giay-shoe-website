// app/api/products/flash-sale/route.js
import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const database = client.db(dbName);
    const productsCollection = database.collection("products");

    // Lấy 4 sản phẩm Flash Sale
    const flashSaleProducts = await productsCollection
      .find({ isFlashSale: true })
      .limit(4)
      .toArray();

    const formattedProducts = flashSaleProducts.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    // Giả lập hoặc lấy thời gian kết thúc đợt sale (Ví dụ: tính thời gian kết thúc sau 7 ngày tính từ hôm nay)
    // Bạn có thể lưu mốc thời gian này vào một Collection riêng trong DB để quản lý chung.
    const now = new Date();
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      batchId: "week-sale-" + Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000)),
      endTime: endTime, // Truyền thời gian kết thúc sang cho CountdownTimer ở Frontend
      products: formattedProducts
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi kết nối cơ sở dữ liệu", error: error.message },
      { status: 500 }
    );
  }
}
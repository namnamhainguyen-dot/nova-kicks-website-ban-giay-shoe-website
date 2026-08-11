// app/api/products/flash-sale/route.js
import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";

export async function GET(request) { // Thêm tham số request để lấy query params nếu cần
  try {
    const client = await clientPromise;
    const database = client.db(dbName);
    const productsCollection = database.collection("products");

    // Lấy query param 'batch' từ URL (nếu trang chủ truyền lên, mặc định lấy 'batch-1')
    const { searchParams } = new URL(request.url);
    const batch = searchParams.get("batch") || "batch-1";

    // ✅ Thêm điều kiện lọc flashSaleBatch vào câu query
    const flashSaleProducts = await productsCollection
      .find({ 
        isFlashSale: true,
        flashSaleBatch: batch 
      })
      .limit(4)
      .toArray();

    const formattedProducts = flashSaleProducts.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    const now = new Date();
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      batchId: batch,
      endTime: endTime,
      products: formattedProducts
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi kết nối cơ sở dữ liệu", error: error.message },
      { status: 500 }
    );
  }
}
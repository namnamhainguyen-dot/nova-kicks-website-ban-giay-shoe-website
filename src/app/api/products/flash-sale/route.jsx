// app/api/products/flash-sale/route.js
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Thay thế bằng chuỗi kết nối MongoDB của bạn (thường lưu ở file .env)
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"; 
const client = new MongoClient(uri);

export async function GET() {
  try {
    // Kết nối tới MongoDB Server
    await client.connect();
    
    // Tên database của bạn (Ví dụ: "nova_kicks")
    const database = client.db("nova_kicks"); 
    const productsCollection = database.collection("products");

    // Lọc thẳng các Document có trường isFlashSale bằng true
    // Dùng .limit(4) để lấy đúng 4 sản phẩm hiển thị hàng ngang giống UI của bạn
    const flashSaleProducts = await productsCollection
      .find({ isFlashSale: true })
      .limit(4)
      .toArray();

    // Định dạng lại _id từ ObjectId thành chuỗi String để Frontend dễ xử lý map()
    const formattedProducts = flashSaleProducts.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    return NextResponse.json(formattedProducts, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi kết nối cơ sở dữ liệu", error: error.message },
      { status: 500 }
    );
  } finally {
    // Đóng kết nối sau khi lấy xong dữ liệu
    await client.close();
  }
}
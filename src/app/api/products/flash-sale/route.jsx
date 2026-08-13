import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const database = client.db(dbName);
    const productsCollection = database.collection("products");

    // 1. Lấy tất cả các sản phẩm đang bật cờ Flash Sale
    const allFlashProducts = await productsCollection
      .find({ isFlashSale: true })
      .toArray();

    if (allFlashProducts.length === 0) {
      return NextResponse.json({
        batchId: "daily-random",
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        products: []
      }, { status: 200 });
    }

    // 2. Lấy chuỗi ngày hiện tại làm "seed" (ví dụ: "2026-06-07")
    const todayString = new Date().toISOString().split('T')[0];

    // 3. Hàm tạo số ngẫu nhiên cố định dựa trên chuỗi seed ngày tháng
    function pseudoRandom(seedStr) {
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      return function() {
        hash = Math.sin(hash++) * 10000;
        return hash - Math.floor(hash);
      };
    }

    // 4. Xáo trộn danh sách sản phẩm dựa trên seed của ngày hôm đó
    const rng = pseudoRandom(todayString);
    const shuffled = [...allFlashProducts].sort(() => rng() - 0.5);

    // 5. Lấy ra tối đa 4 sản phẩm ngẫu nhiên cho ngày hôm nay
    const dailyFlashProducts = shuffled.slice(0, 4);

    const formattedProducts = dailyFlashProducts.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    // Thiết lập thời gian kết thúc đợt random trong ngày (ví dụ hết ngày hôm đó)
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    return NextResponse.json({
      batchId: "daily-random-" + todayString,
      endTime: endOfDay,
      products: formattedProducts
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Lỗi kết nối cơ sở dữ liệu", error: error.message },
      { status: 500 }
    );
  }
}
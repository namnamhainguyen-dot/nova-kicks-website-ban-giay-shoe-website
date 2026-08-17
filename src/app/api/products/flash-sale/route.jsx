import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const database = client.db(dbName);
    const productsCollection = database.collection("products");

    const now = new Date();

    // 1. Lấy batch từ query param (ví dụ: /api/products/flash-sale?batch=8-3)
    const { searchParams } = new URL(request.url);
    const batchParam = searchParams.get("batch");

    // Nếu client không truyền lên, tự tính batch theo tháng và tuần trong tháng hiện tại
    let currentBatch = batchParam;
    if (!currentBatch) {
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      const currentWeekOfMonth = Math.ceil(currentDay / 7);
      currentBatch = `${currentMonth}-${currentWeekOfMonth}`;
    }

    // 2. Lấy các sản phẩm đang bật cờ Flash Sale VÀ khớp đúng flashSaleBatch
    const allFlashProducts = await productsCollection
      .find({ 
        isFlashSale: true,
        $or: [
          { flashSaleBatch: currentBatch },
          { flashSaleBatch: { $exists: false } }, // Dự phòng cho sản phẩm cũ
          { flashSaleBatch: null }
        ]
      })
      .toArray();

    if (allFlashProducts.length === 0) {
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      return NextResponse.json({
        batchId: `batch-${currentBatch}-empty`,
        endTime: endOfDay,
        products: []
      }, { status: 200 });
    }

    // 3. Lấy chuỗi ngày hiện tại làm "seed" để xáo trộn cố định trong ngày
    const todayString = now.toISOString().split('T')[0];

    // 4. Hàm tạo số ngẫu nhiên cố định dựa trên chuỗi seed ngày tháng
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

    // 5. Xáo trộn danh sách sản phẩm dựa trên seed của ngày hôm đó
    const rng = pseudoRandom(todayString);
    const shuffled = [...allFlashProducts].sort(() => rng() - 0.5);

    // 6. Lấy ra tối đa 4 sản phẩm ngẫu nhiên cho ngày hôm nay trong batch tương ứng
    const dailyFlashProducts = shuffled.slice(0, 4);

    const formattedProducts = dailyFlashProducts.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    return NextResponse.json({
      batchId: `daily-random-${todayString}-batch-${currentBatch}`,
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
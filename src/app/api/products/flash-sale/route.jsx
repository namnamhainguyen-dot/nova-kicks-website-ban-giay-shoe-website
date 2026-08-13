import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const database = client.db(dbName);
    const productsCollection = database.collection("products");

    const now = new Date();

    // 1. Lấy số tuần từ query param (ví dụ: /api/flash-sale?week=18)
    // Nếu client không truyền lên, hệ thống sẽ tự tính toán dự phòng theo công thức hiện tại
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get("week");

    let currentWeekNumber;
    if (weekParam && !isNaN(weekParam)) {
      currentWeekNumber = Number(weekParam);
    } else {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      currentWeekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    }

    // 2. Lấy các sản phẩm đang bật cờ Flash Sale VÀ thuộc tuần được chỉ định
    const allFlashProducts = await productsCollection
      .find({ 
        isFlashSale: true,
        $or: [
          { flashSaleWeek: currentWeekNumber },
          { flashSaleWeek: { $exists: false } }, // Dự phòng cho sản phẩm cũ chưa set tuần
          { flashSaleWeek: null }
        ]
      })
      .toArray();

    if (allFlashProducts.length === 0) {
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      return NextResponse.json({
        batchId: `week-${currentWeekNumber}-empty`,
        endTime: endOfDay,
        products: []
      }, { status: 200 });
    }

    // 3. Lấy chuỗi ngày hiện tại làm "seed" (ví dụ: "2026-06-07") để xáo trộn cố định trong ngày
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

    // 6. Lấy ra tối đa 4 sản phẩm ngẫu nhiên cho ngày hôm nay trong tuần tương ứng
    const dailyFlashProducts = shuffled.slice(0, 4);

    const formattedProducts = dailyFlashProducts.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    // Thiết lập thời gian kết thúc đợt random trong ngày (hết ngày hôm đó)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    return NextResponse.json({
      batchId: `daily-random-${todayString}-week-${currentWeekNumber}`,
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
import clientPromise from "@/libs/mongodb";
import { Code, ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const orderList = await db.collection("orders").aggregate([
      {
        $lookup: {
          from: "tables",
          localField: "location_id",
          foreignField: "_id",
          as: "location_info",
        },
      },
      {
        $unwind: {
          path: "$location_info",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]).toArray();

    return Response.json(orderList);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
    try {
        const client = await clientPromise;
        // SỬA TẠI ĐÂY: Điền tên database khớp với Compass (1 chữ f)
        const db = client.db("Nova-kicks"); 

        const body = await request.json();
        const {name, location_id, order_items, total} = body;
        if (!name || !location_id || !order_items || !total) {
            return Response.json({ error: "Thiếu thông tin đơn hàng" }, { status: 400 });   
        }

        const newOrder = {
            name,
            location_id: new ObjectId(location_id),
            order_items,
            total,
            created_at: new Date(),
            status: "don-moi"
        }

        const result = await db.collection("orders").insertOne(newOrder);

        return Response.json({message:"Đơn hàng đã được tạo mới thành công!", code: "success"});
    } catch (error) {
        console.error(error);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });   
    }
}
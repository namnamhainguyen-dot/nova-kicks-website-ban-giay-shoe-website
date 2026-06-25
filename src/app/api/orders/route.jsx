import clientPromise from "@/libs/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const orders = await db.collection("orders").find({}).toArray();

    const normalized = orders.map((order) => ({
      ...order,
      _id: String(order._id),
    }));

    return Response.json(normalized);
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
    const db = client.db("Nova-kicks");

    const body = await request.json();

    const {
      name,
      phone,
      location_id,
      note,
      order_items,
      total,
      discount,
      final_total,
      applied_voucher,
    } = body;

    const newOrder = {
      name,
      phone,
      location_id,
      note,
      order_items,

      total,
      discount: discount || 0,
      final_total: final_total || total,
      applied_voucher: applied_voucher || null,

      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(newOrder);

    return Response.json({
      success: true,
      _id: String(result.insertedId),
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
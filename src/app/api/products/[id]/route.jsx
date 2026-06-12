import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "Nova-kicks";
const COLLECTION_NAME = "products";

function buildIdFilter(id) {
  if (ObjectId.isValid(id)) {
    return { _id: new ObjectId(id) };
  }
  return { _id: id };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params; // ✅ await params
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const product = await db.collection(COLLECTION_NAME).findOne(buildIdFilter(id));

    if (!product) {
      return Response.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }

    return Response.json({ ...product, _id: String(product._id) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params; // ✅ await params
    const body = await request.json();
    const { name, price, description, image, quantity, status } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "Không có dữ liệu cập nhật." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db
      .collection(COLLECTION_NAME)
      .updateOne(buildIdFilter(id), { $set: updateData });

    if (result.matchedCount === 0) {
      return Response.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update product" }, { status: 500 });
  }
  
}
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION_NAME).deleteOne(buildIdFilter(id));

    if (result.deletedCount === 0) {
      return Response.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
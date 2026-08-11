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
    const { id } = await params;
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
    const { id } = await params;
    const body = await request.json();
    
    const { name, price, description, image, quantity, status, categoryID, variants, isFlashSale, originalPrice } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (status !== undefined) updateData.status = status;
    if (categoryID !== undefined) updateData.categoryID = categoryID;

    if (isFlashSale !== undefined) {
      updateData.isFlashSale = Boolean(isFlashSale);
      updateData.originalPrice = isFlashSale ? Number(originalPrice || 0) : 0;
    }

    if (variants !== undefined) {
      updateData.variants = Array.isArray(variants) 
        ? variants.map((v) => ({
            color: v.color ? String(v.color).trim() : "",
            image: v.image ? String(v.image).trim() : "",
            quantity: Math.max(0, parseInt(v.quantity) || 0),
            // Sửa lại đoạn map này để lưu giữ nguyên cấu trúc object gồm size và quantity
            sizes: Array.isArray(v.sizes) 
              ? v.sizes.map((s) => ({
                  size: Number(s.size) || 0,
                  quantity: Math.max(0, parseInt(s.quantity) || 0)
                }))
              : []
          }))
        : [];
    }

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

// 🌟 BỔ SUNG PHƯƠNG THỨC PATCH ĐỂ TRỪ SỐ LƯỢNG KHI MUA HÀNG
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { buyQuantity } = body; // Số lượng khách mua (ví dụ: 5)

    const deductQty = Number(buyQuantity) || 0;
    if (deductQty <= 0) {
      return Response.json({ error: "Số lượng trừ không hợp lệ." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Dùng toán tử $inc để trừ trực tiếp số lượng tổng đi một lượng `deductQty`
    const result = await db.collection(COLLECTION_NAME).updateOne(
      buildIdFilter(id),
      { $inc: { quantity: -deductQty } }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Không tìm thấy sản phẩm để trừ kho." }, { status: 404 });
    }

    return Response.json({ success: true, message: "Đã trừ số lượng kho thành công!" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to deduct product quantity" }, { status: 500 });
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
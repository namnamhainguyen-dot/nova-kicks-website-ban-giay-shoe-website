import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "Nova-kicks";
const COLLECTION_NAME = "products";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const { searchParams } = new URL(request.url);
    const categoryID = searchParams.get("categoryID");
    const isFlashSaleParam = searchParams.get("flashSale"); // 🌟 Thêm param check flashsale

    const query = {};

    // 1. Lọc theo danh mục (Category)
    if (categoryID) {
      if (ObjectId.isValid(categoryID)) {
        query.$or = [
          { categoryID: categoryID },
          { categoryID: new ObjectId(categoryID) },
          { categoryId: categoryID },
          { categoryId: new ObjectId(categoryID) }
        ];
      } else {
        query.$or = [
          { categoryID: categoryID },
          { categoryId: categoryID }
        ];
      }
    }

    // 🌟 2. Lọc tự động Flash Sale theo thời gian thực nếu có yêu cầu
    if (isFlashSaleParam === "true") {
      const now = new Date();
      query.isFlashSale = true;
      query.flashSaleStart = { $lte: now };
      query.flashSaleEnd = { $gt: now };
    }

    const productsList = await db
      .collection(COLLECTION_NAME)
      .find(query)
      .sort({ _id: -1 })
      .toArray();

    const normalized = productsList.map((product) => ({
      ...product,
      _id: String(product._id),
      categoryID: product.categoryID ? String(product.categoryID) : String(product.categoryId || ""),
    }));

    return Response.json(normalized);
  } catch (error) {
    console.error("[API GET Products Error]:", error);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { 
      name, 
      price, 
      description, 
      image, 
      quantity, 
      status, 
      showOnHome, 
      categoryId, 
      categoryID, 
      variants,
      // 🌟 Bổ sung các trường Flash Sale nhận từ form Admin
      isFlashSale,
      flashSalePrice,
      flashSaleStart,
      flashSaleEnd
    } = body;

    if (!name || !price) {
      return Response.json({ error: "Tên và giá sản phẩm là bắt buộc." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const processedVariants = Array.isArray(variants)
      ? variants.map((v) => ({
          color: v.color ? String(v.color).trim() : "",
          image: v.image ? String(v.image).trim() : "",
          quantity: Math.max(0, parseInt(v.quantity) || 0),
          sizes: Array.isArray(v.sizes)
            ? v.sizes.map((s) => ({
                size: Number(s.size) || 0,
                quantity: Number(s.quantity) || 0,
              })).filter((s) => s.size > 0)
            : [],
        }))
      : [];

    const finalCategoryID = categoryID || categoryId || "";

    const newProduct = {
      name: String(name).trim(),
      price: Number(price),
      description: description || "",
      image: image || "",
      quantity: Number(quantity) || 0,
      status: status || "active",
      showOnHome: Boolean(showOnHome),
      categoryID: ObjectId.isValid(finalCategoryID) ? new ObjectId(finalCategoryID) : finalCategoryID,
      variants: processedVariants,
      
      // 🌟 Lưu cấu hình Flash Sale vào DB (Chuyển chuỗi thời gian thành kiểu Date của MongoDB)
      isFlashSale: Boolean(isFlashSale),
      flashSalePrice: Number(flashSalePrice) || 0,
      flashSaleStart: flashSaleStart ? new Date(flashSaleStart) : null,
      flashSaleEnd: flashSaleEnd ? new Date(flashSaleEnd) : null,

      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newProduct);
    newProduct._id = String(result.insertedId);
    newProduct.categoryID = String(newProduct.categoryID);

    return Response.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("[API POST Product Error]:", error);
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}
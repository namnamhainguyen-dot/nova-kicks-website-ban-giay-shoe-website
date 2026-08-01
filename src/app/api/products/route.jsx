import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb"; // 🟢 Import ObjectId để xử lý filter chính xác

const DB_NAME = "Nova-kicks";
const COLLECTION_NAME = "products";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // ── LẤY QUERY PARAMETERS TỪ URL ──
    const { searchParams } = new URL(request.url);
    const categoryID = searchParams.get("categoryID");

    // Tạo điều kiện lọc (Query Object)
    const query = {};
    if (categoryID) {
      // 🟢 Xử lý hỗ trợ cả dạng ObjectId lẫn String trong DB Compass
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

    // Truy vấn dữ liệu từ MongoDB với điều kiện query, sắp xếp sản phẩm mới nhất lên đầu
    const productsList = await db
      .collection(COLLECTION_NAME)
      .find(query)
      .sort({ _id: -1 })
      .toArray();

    // Chuẩn hóa _id thành String để tránh lỗi Serialization trên Next.js Client Component
    const normalized = productsList.map((product) => ({
      ...product,
      _id: String(product._id),
      // Chuyển luôn categoryID trong document thành string nếu nó đang là ObjectId
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
      variants 
    } = body;

    if (!name || !price) {
      return Response.json({ error: "Tên và giá sản phẩm là bắt buộc." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // 🌟 CHUẨN HÓA DỮ LIỆU MẢNG VARIANTS TRƯỚC KHI LƯU DB
    const processedVariants = Array.isArray(variants)
      ? variants.map((v) => ({
          color: v.color ? String(v.color).trim() : "",
          image: v.image ? String(v.image).trim() : "",
          quantity: Math.max(0, parseInt(v.quantity) || 0),
          sizes: Array.isArray(v.sizes) ? v.sizes.map(Number) : []
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
      // 🟢 Nếu chuỗi ID hợp lệ thì lưu dạng ObjectId vào DB cho chuẩn quan hệ, nếu không thì lưu string
      categoryID: ObjectId.isValid(finalCategoryID) ? new ObjectId(finalCategoryID) : finalCategoryID,
      variants: processedVariants,
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newProduct);
    newProduct._id = String(result.insertedId);
    newProduct.categoryID = String(newProduct.categoryID); // Convert lại string để trả về client

    return Response.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("[API POST Product Error]:", error);
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}
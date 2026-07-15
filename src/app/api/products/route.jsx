import clientPromise from "@/libs/mongodb";

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
      query.categoryID = categoryID; // Chỉ lọc nếu URL có truyền categoryID
    }

    // Truy vấn dữ liệu từ MongoDB với điều kiện query
    const productsList = await db.collection(COLLECTION_NAME).find(query).toArray();

    const normalized = productsList.map((product) => ({
      ...product,
      _id: String(product._id),
    }));

    return Response.json(normalized);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 🌟 ĐỒNG BỘ THÊM: Hứng thêm quantity và mảng variants từ client gửi lên
    // Đồng thời đổi tên biến categoryId thành categoryID đúng chuẩn DB của bạn
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
          quantity: Math.max(0, parseInt(v.quantity) || 0), // Đảm bảo số lượng >= 0
          sizes: Array.isArray(v.sizes) ? v.sizes.map(Number) : [] // Định dạng số cho kích cỡ
        }))
      : [];

    const newProduct = {
      name,
      price: Number(price),
      description: description || "",
      image: image || "",
      quantity: Number(quantity) || 0, // 🌟 Thêm số lượng tổng kho
      status: status || "active",
      showOnHome: Boolean(showOnHome),
      categoryID: categoryID || categoryId || "", // 🌟 Hỗ trợ cả 2 cách viết key từ client gửi lên
      variants: processedVariants, // 🌟 Lưu mảng biến thể chi tiết màu/size/số lượng vào DB
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newProduct);
    newProduct._id = String(result.insertedId);

    return Response.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}
import clientPromise from "@/libs/mongodb";

const DB_NAME = "Nova-kicks";
const COLLECTION_NAME = "products";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const productsList = await db.collection(COLLECTION_NAME).find({}).toArray();
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
    const { name, price, description, image, status, showOnHome } = body;

    if (!name || !price) {
      return Response.json({ error: "Tên và giá sản phẩm là bắt buộc." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const newProduct = {
      name,
      price: Number(price),
      description: description || "",
      image: image || "",
      status: status || "active",
      showOnHome: Boolean(showOnHome),
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
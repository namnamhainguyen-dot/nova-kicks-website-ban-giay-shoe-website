import clientPromise from "@/libs/mongodb";

export const dynamic = "force-dynamic";

// GET: /api/categories
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const categories = await db.collection("categories").find({}).toArray();
    return Response.json(categories, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Không thể lấy danh mục" }, { status: 500 });
  }
}

// POST: /api/categories
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, description, image, status } = body;

    if (!name) {
      return Response.json({ error: "Tên danh mục là bắt buộc!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const newCategory = {
      id: id || `CAT-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/ /g, "-"),
      description: description || "",
      image: image || "",
      status: status || "active",
      createdAt: new Date()
    };

    const result = await db.collection("categories").insertOne(newCategory);
    return Response.json({ message: "Tạo danh mục thành công!", data: result }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Lỗi database" }, { status: 500 });
  }
}
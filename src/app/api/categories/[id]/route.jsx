import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "Nova-kicks";
const COLLECTION_NAME = "categories";

// PUT: Cập nhật trạng thái hoặc sửa đổi thông tin danh mục
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Lọc các trường dữ liệu mà user muốn cập nhật
    const updateData = {};
    if (body.id !== undefined) updateData.id = body.id;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.status !== undefined) updateData.status = body.status;

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
    }

    return Response.json({ message: "Cập nhật thành công!" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE: Xóa danh mục
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection(COLLECTION_NAME).deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return Response.json({ error: "Không tìm thấy danh mục để xóa" }, { status: 404 });
    }

    return Response.json({ message: "Xóa danh mục thành công!" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
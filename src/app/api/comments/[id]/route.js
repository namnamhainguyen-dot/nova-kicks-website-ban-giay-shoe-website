import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "ID bình luận không hợp lệ" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Đồng bộ trỏ vào collection "reviews" giống như bên file GET
    const collection = db.collection("reviews");

    let comment = null;
    if (ObjectId.isValid(id)) {
      comment = await collection.findOne({ _id: new ObjectId(id) });
    }
    
    if (!comment) {
      comment = await collection.findOne({ $or: [{ _id: id }, { id: id }] });
    }

    if (!comment) {
      return NextResponse.json({ error: "Không tìm thấy bình luận" }, { status: 404 });
    }

    const newHiddenState = comment.isHidden ? false : true;

    await collection.updateOne(
      { _id: comment._id },
      { $set: { isHidden: newHiddenState, updatedAt: new Date() } }
    );

    return NextResponse.json({
      message: "Cập nhật trạng thái thành công",
      comment: {
        ...comment,
        _id: comment._id.toString(),
        isHidden: newHiddenState,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật" }, { status: 500 });
  }
}
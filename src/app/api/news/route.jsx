import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// ... (Giữ nguyên các hàm GET, POST, DELETE hiện tại của bạn)

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ success: false, error: "Thiếu ID" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const collection = db.collection("news");

    // XỬ LÝ LIKE
    if (body.action === "like") {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { likes: 1 } },
        { returnDocument: "after" }
      );
      return NextResponse.json({ success: true, likes: result.value.likes });
    }

    // XỬ LÝ COMMENT
    if (body.action === "comment") {
      const newComment = {
        _id: new ObjectId(),
        name: body.name,
        content: body.content,
        createdAt: new Date().toISOString(),
      };
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment } }
      );
      return NextResponse.json({ success: true, comment: newComment });
    }

    // XỬ LÝ UPDATE BÀI VIẾT (Cũ)
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...body, updatedAt: new Date().toISOString() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi server" }, { status: 500 });
  }
}
import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    if (id) {
      const article = await db.collection("news").findOne({ _id: new ObjectId(id) });
      if (!article) {
        return NextResponse.json({ success: false, error: "Không tìm thấy bài viết" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: article });
    }

    const newsList = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: newsList });
  } catch (error) {
    console.error("Lỗi API GET news:", error);
    return NextResponse.json({ success: false, error: error.message || "Lỗi kết nối máy chủ" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const article = {
      ...body,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection("news").insertOne(article);
    return NextResponse.json({ success: true, data: { ...article, _id: result.insertedId } });
  } catch (error) {
    console.error("Lỗi API POST news:", error);
    return NextResponse.json({ success: false, error: "Không thể tạo bài viết" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu id bài viết" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const collection = db.collection("news");

    // Xử lý Like
    if (body.action === "like") {
      const updated = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { likes: 1 } },
        { returnDocument: "after" }
      );
      // Hỗ trợ cả mongodb driver cũ (updated.value) và mới (updated trực tiếp)
      const currentLikes = updated?.likes !== undefined ? updated.likes : updated?.value?.likes || 1;
      return NextResponse.json({ success: true, likes: currentLikes });
    }

    // Xử lý Comment
    if (body.action === "comment") {
      const { name, content } = body;
      if (!name || !content) {
        return NextResponse.json({ success: false, error: "Thiếu tên hoặc nội dung" }, { status: 400 });
      }

      const newComment = {
        _id: new ObjectId(),
        name,
        content,
        createdAt: new Date().toISOString(),
      };

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment } }
      );

      return NextResponse.json({ success: true, comment: newComment });
    }

    // Cập nhật bài viết thông thường
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi API PUT news:", error);
    return NextResponse.json({ success: false, error: error.message || "Không thể cập nhật" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu id bài viết" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const result = await db.collection("news").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi API DELETE news:", error);
    return NextResponse.json({ success: false, error: "Không thể xóa bài viết" }, { status: 500 });
  }
}
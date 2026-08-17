import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search"); // Hỗ trợ tìm kiếm bài viết theo từ khóa

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // LẤY CHI TIẾT 1 BÀI VIẾT THEO ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "ID bài viết không hợp lệ" },
          { status: 400 }
        );
      }

      const article = await db.collection("news").findOne({ _id: new ObjectId(id) });

      if (!article) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy bài viết" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: article });
    }

    // LẤY DANH SÁCH BÀI VIẾT (CÓ HOẶC KHÔNG CÓ TÌM KIẾM)
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ],
      };
    }

    const newsList = await db
      .collection("news")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: newsList });
  } catch (error) {
    console.error("Lỗi API GET news:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi kết nối máy chủ" },
      { status: 500 }
    );
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
      isHidden: false,
      createdAt: body.createdAt ? new Date(body.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection("news").insertOne(article);
    return NextResponse.json({
      success: true,
      data: { ...article, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Lỗi API POST news:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo bài viết" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không hợp lệ" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const collection = db.collection("news");

    // XỬ LÝ THÍCH BÀI VIẾT (LIKE)
    if (body.action === "like") {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { likes: 1 } },
        { returnDocument: "after" }
      );

      const updatedDoc = result.value || result;
      return NextResponse.json({ success: true, likes: updatedDoc?.likes });
    }

    // XỬ LÝ BÌNH LUẬN (COMMENT)
    if (body.action === "comment") {
      const newComment = {
        _id: new ObjectId(),
        name: body.name || "Ẩn danh",
        content: body.content,
        createdAt: new Date().toISOString(),
      };

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment } }
      );

      return NextResponse.json({ success: true, comment: newComment });
    }

    // XỬ LÝ CẬP NHẬT HOẶC ẨN/HIỆN BÀI VIẾT
    const { _id, action, likes, comments, ...updateData } = body;

    if (updateData.createdAt) {
      updateData.createdAt = new Date(updateData.createdAt).toISOString();
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi API PUT news:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật bài viết" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không hợp lệ" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const result = await db.collection("news").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi API DELETE news:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa bài viết" },
      { status: 500 }
    );
  }
}
import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Xóa một bình luận khỏi bài viết
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get("newsId");
    const commentId = searchParams.get("commentId");

    if (!newsId || !commentId) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin newsId hoặc commentId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Dùng $pull để gỡ bỏ bình luận có _id khớp trong mảng comments
    const result = await db.collection("news").updateOne(
      { _id: new ObjectId(newsId) },
      { $pull: { comments: { _id: new ObjectId(commentId) } } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bình luận hoặc bài viết" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Đã xóa bình luận thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ khi xóa bình luận" }, { status: 500 });
  }
}
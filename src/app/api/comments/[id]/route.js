import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request, context) {
  try {
    // Ép kiểu hoặc await an toàn cho params tránh lỗi Next.js
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID bình luận không hợp lệ" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
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

    // Cập nhật trạng thái ẩn/hiện
    await collection.updateOne(
      { _id: comment._id },
      { $set: { isHidden: newHiddenState, updatedAt: new Date() } }
    );

    // Tính lại điểm trung bình cho sản phẩm (chỉ tính các review không bị ẩn)
    if (comment.productId) {
      const prodId = ObjectId.isValid(comment.productId) ? new ObjectId(comment.productId) : comment.productId;
      
      const activeReviews = await collection.find({ 
        productId: prodId, 
        isHidden: { $ne: true } 
      }).toArray();

      let averageRating = 0;
      if (activeReviews.length > 0) {
        const totalRating = activeReviews.reduce((sum, item) => sum + item.rating, 0);
        averageRating = Number((totalRating / activeReviews.length).toFixed(1));
      }

      await db.collection("products").updateOne(
        { _id: prodId },
        { 
          $set: { 
            averageRating: averageRating,
            reviewCount: activeReviews.length 
          } 
        }
      );
    }

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
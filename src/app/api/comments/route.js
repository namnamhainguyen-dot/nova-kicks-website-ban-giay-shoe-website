import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Sửa "comments" thành "reviews"
    const comments = await db.collection("reviews")
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const enrichedComments = await Promise.all(
      comments.map(async (item) => {
        let product = null;
        let user = null;

        if (item.productId) {
          try {
            product = await db.collection("products").findOne({ _id: new ObjectId(item.productId) });
          } catch (e) {}
        }

        if (item.userId) {
          try {
            user = await db.collection("users").findOne({ _id: new ObjectId(item.userId) });
          } catch (e) {}
        }

        return {
          ...item,
          _id: item._id.toString(),
          productId: product ? { _id: product._id.toString(), name: product.name, image: product.image } : null,
          userId: user ? { _id: user._id.toString(), fullname: user.fullname || user.name, email: user.email } : null,
        };
      })
    );

    return NextResponse.json(enrichedComments, { status: 200 });
  } catch (error) {
    console.error("Lỗi lấy danh sách đánh giá:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải bình luận" }, { status: 500 });
  }
}
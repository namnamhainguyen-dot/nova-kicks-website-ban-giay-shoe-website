import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/libs/mongodb'; // Import clientPromise từ libs/mongodb

// 1. GET: Lấy danh sách bình luận của sản phẩm từ MongoDB
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Hỗ trợ params async cho Next.js 15+
    const resolvedParams = await params;
    const id = resolvedParams?.id || params?.id;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID sản phẩm không hợp lệ" }, { status: 400 });
    }

    const product = await db.collection('products').findOne(
      { _id: new ObjectId(id) },
      { projection: { reviews: 1 } }
    );

    if (!product) {
      return NextResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    // Lấy mảng reviews và đảo ngược để bình luận mới nhất lên đầu
    const reviews = (product.reviews || []).reverse();

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error("Lỗi GET reviews:", error);
    return NextResponse.json({ message: error.message || "Lỗi lấy bình luận" }, { status: 500 });
  }
}

// 2. POST: Thêm bình luận mới vào mảng `reviews` của sản phẩm
export async function POST(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const resolvedParams = await params;
    const id = resolvedParams?.id || params?.id;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID sản phẩm không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();
    const { rating, comment, userName, userEmail } = body;

    if (!comment || !comment.trim()) {
      return NextResponse.json({ message: "Nội dung bình luận không được để trống" }, { status: 400 });
    }

    const newReview = {
      _id: new ObjectId(),
      userName: userName || 'Khách hàng',
      userEmail: userEmail || '',
      rating: Number(rating) || 5,
      comment: comment.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $push: { reviews: newReview } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Lỗi POST review:", error);
    return NextResponse.json({ message: error.message || "Lỗi lưu bình luận" }, { status: 500 });
  }
}
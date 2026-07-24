import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/libs/mongodb'; // Check lại đường dẫn file mongodb của bạn

async function getDb() {
    const client = await clientPromise;
    return client.db("Nova-kicks"); // Tên database của bạn trong Compass
}

// 1. GET: Lấy bình luận
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
        }

        const db = await getDb();
        const product = await db.collection('products').findOne(
            { _id: new ObjectId(id) },
            { projection: { reviews: 1 } }
        );

        if (!product) {
            return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
        }

        const reviews = (product.reviews || []).reverse();
        return NextResponse.json(reviews, { status: 200 });
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}

// 2. POST: Lưu bình luận mới
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
        }

        const body = await req.json();
        const { rating, comment, userName } = body;

        if (!comment || !rating) {
            return NextResponse.json({ error: 'Nội dung và đánh giá không được để trống' }, { status: 400 });
        }

        const newReview = {
            _id: new ObjectId(),
            userName: userName || 'Khách hàng',
            rating: Number(rating),
            comment: comment.trim(),
            createdAt: new Date(),
        };

        const db = await getDb();
        const result = await db.collection('products').updateOne(
            { _id: new ObjectId(id) },
            { $push: { reviews: newReview } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
        }

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error('Lỗi khi lưu đánh giá:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
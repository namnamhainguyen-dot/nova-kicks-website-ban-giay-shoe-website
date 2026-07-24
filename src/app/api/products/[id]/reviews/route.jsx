import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/libs/mongodb';

async function getDb() {
    const client = await clientPromise;
    return client.db("Nova-kicks");
}

// 1. GET: Lấy tất cả bình luận từ collection `reviews` theo productId
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
        }

        const db = await getDb();

        // Tìm tất cả reviews có productId bằng với id của sản phẩm
        // Sắp xếp giảm dần theo thời gian tạo (mới nhất lên đầu)
        const reviews = await db.collection('reviews')
            .find({ productId: id })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(reviews, { status: 200 });
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}

// 2. POST: Lưu bình luận mới vào collection `reviews` riêng
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
        }

        const body = await req.json();
        const { rating, comment, userName, userId } = body;

        const numRating = Number(rating);
        if (!comment || !comment.trim() || isNaN(numRating) || numRating < 1 || numRating > 5) {
            return NextResponse.json(
                { error: 'Vui lòng nhập nội dung và đánh giá từ 1 đến 5 sao' },
                { status: 400 }
            );
        }

        const db = await getDb();

        // Kiểm tra xem sản phẩm có tồn tại không
        const productExists = await db.collection('products').findOne({ _id: new ObjectId(id) });
        if (!productExists) {
            return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
        }

        // Tạo document review mới có liên kết với productId
        const newReview = {
            productId: id, // Lưu ID sản phẩm dưới dạng String (hoặc new ObjectId(id) tùy dự án của bạn)
            userId: userId || null,
            userName: userName?.trim() || 'Khách hàng',
            rating: numRating,
            comment: comment.trim(),
            createdAt: new Date(),
        };

        // Chèn trực tiếp vào collection 'reviews'
        const result = await db.collection('reviews').insertOne(newReview);

        // Cập nhật lại _id trả về cho frontend
        const savedReview = {
            _id: result.insertedId,
            ...newReview
        };

        return NextResponse.json(savedReview, { status: 201 });
    } catch (error) {
        console.error('Lỗi khi lưu đánh giá:', error);
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
    }
}
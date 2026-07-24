import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/libs/mongodb';

async function getDb() {
    const client = await clientPromise;
    return client.db("Nova-kicks");
}

// 1. GET: Lấy tất cả bình luận từ collection `reviews` riêng biệt theo productId
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
        }

        const db = await getDb();

        // Tìm tất cả reviews từ collection `reviews`
        // Dùng $or để hỗ trợ quét cả dạng String lẫn ObjectId của productId
        const reviews = await db.collection('reviews')
            .find({
                $or: [
                    { productId: id },
                    { productId: new ObjectId(id) }
                ]
            })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(reviews, { status: 200 });
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}

// 2. POST: Lưu bình luận mới vào collection `reviews` VÀ cập nhật rating tổng hợp sang `products`
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

        // 1. Kiểm tra sản phẩm có tồn tại trong bảng `products` không
        const productExists = await db.collection('products').findOne({ _id: new ObjectId(id) });
        if (!productExists) {
            return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
        }

        // 2. Tạo document chứa nội dung chi tiết bài viết
        const newReview = {
            productId: id,
            userId: userId && ObjectId.isValid(userId) ? new ObjectId(userId) : userId || null,
            userName: userName?.trim() || 'Khách hàng',
            rating: numRating,
            comment: comment.trim(),
            createdAt: new Date(),
        };

        // 3. Thêm bài viết mới trực tiếp vào collection `reviews` riêng
        const result = await db.collection('reviews').insertOne(newReview);

        // 4. Lấy lại tất cả review của sản phẩm này trong `reviews` để tính điểm trung bình mới
        const allReviews = await db.collection('reviews').find({
            $or: [
                { productId: id },
                { productId: new ObjectId(id) }
            ]
        }).toArray();

        const totalReviewsCount = allReviews.length;
        const totalRatingSum = allReviews.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = Number((totalRatingSum / totalReviewsCount).toFixed(1));

        // 5. Cập nhật số sao trung bình và tổng số lượt đánh giá sang bảng `products`
        await db.collection('products').updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    rating: averageRating, 
                    numReviews: totalReviewsCount 
                } 
            }
        );

        // 6. Trả về kết quả review vừa tạo cho Frontend
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
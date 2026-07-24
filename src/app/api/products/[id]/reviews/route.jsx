import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/libs/mongodb';

export const dynamic = 'force-dynamic';

async function getDb() {
    const client = await clientPromise;
    return client.db("Nova-kicks");
}

// ==========================================
// 1. GET: Lấy danh sách đánh giá của sản phẩm
// ==========================================
export async function GET(req, { params }) {
    try {
        const { id } = await params;

        // Kiểm tra ID sản phẩm hợp lệ
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
        }

        const db = await getDb();

        // Lấy tất cả reviews theo productId (hỗ trợ cả kiểu String lẫn ObjectId)
        const reviews = await db.collection('reviews')
            .find({
                $or: [
                    { productId: id },
                    { productId: new ObjectId(id) }
                ]
            })
            .sort({ createdAt: -1 }) // Đánh giá mới nhất lên đầu
            .toArray();

        return NextResponse.json(reviews, { status: 200 });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đánh giá:', error);
        return NextResponse.json(
            { error: error.message || 'Lỗi server khi tải đánh giá' }, 
            { status: 500 }
        );
    }
}

// ==========================================
// 2. POST: Thêm đánh giá mới cho sản phẩm
// ==========================================
export async function POST(req, { params }) {
    try {
        const { id } = await params;

        // 1. Kiểm tra ID sản phẩm
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
        }

        const body = await req.json();
        const { rating, comment, userName, userId } = body;

        const numRating = Number(rating);

        // 2. Kiểm tra validation nội dung
        if (!comment || typeof comment !== 'string' || !comment.trim()) {
            return NextResponse.json({ error: 'Nội dung bình luận không được để trống' }, { status: 400 });
        }

        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return NextResponse.json({ error: 'Đánh giá phải từ 1 đến 5 sao' }, { status: 400 });
        }

        const db = await getDb();

        // 3. Kiểm tra sản phẩm tồn tại
        const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
        if (!product) {
            return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
        }

        // 4. Tạo document review (Xử lý an toàn nếu userName/userId bị null)
        const finalUserName = (userName && typeof userName === 'string' && userName.trim()) 
            ? userName.trim() 
            : 'Khách hàng ẩn danh';

        const newReview = {
            productId: id,
            userId: userId && ObjectId.isValid(userId) ? new ObjectId(userId) : (userId || null),
            userName: finalUserName,
            rating: numRating,
            comment: comment.trim(),
            createdAt: new Date(),
        };

        // 5. Thêm vào collection reviews
        const result = await db.collection('reviews').insertOne(newReview);

        // 6. Tính toán lại số sao trung bình cho bảng products
        const allReviews = await db.collection('reviews').find({
            $or: [{ productId: id }, { productId: new ObjectId(id) }]
        }).toArray();

        const totalReviewsCount = allReviews.length;
        const totalRatingSum = allReviews.reduce((sum, item) => sum + (item.rating || 5), 0);
        const averageRating = Number((totalRatingSum / totalReviewsCount).toFixed(1));

        await db.collection('products').updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    rating: averageRating, 
                    numReviews: totalReviewsCount 
                } 
            }
        );

        return NextResponse.json({
            _id: result.insertedId,
            ...newReview
        }, { status: 201 });

    } catch (error) {
        console.error('Lỗi khi lưu đánh giá:', error);
        return NextResponse.json({ error: error.message || 'Lỗi server nội bộ' }, { status: 500 });
    }
}
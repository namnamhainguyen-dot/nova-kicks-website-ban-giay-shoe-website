import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/libs/mongodb'; // Check lại đường dẫn file mongodb của bạn

async function getDb() {
    const client = await clientPromise;
    return client.db("Nova-kicks"); // Tên database của bạn trong Compass
}

// 1. GET: Lấy danh sách đánh giá của sản phẩm
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

        // Mảng reviews đã được sắp xếp từ mới nhất đến cũ nhất nhờ $position ở POST
        const reviews = product.reviews || [];
        return NextResponse.json(reviews, { status: 200 });
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}

// 2. POST: Lưu đánh giá mới và cập nhật rating trung bình
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
        }

        const body = await req.json();
        const { rating, comment, userName } = body;

        const numRating = Number(rating);
        if (!comment || !comment.trim() || isNaN(numRating) || numRating < 1 || numRating > 5) {
            return NextResponse.json(
                { error: 'Vui lòng nhập nội dung và đánh giá từ 1 đến 5 sao' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const productObjectId = new ObjectId(id);

        // Tạo object review mới
        const newReview = {
            _id: new ObjectId(),
            userName: userName?.trim() || 'Khách hàng',
            rating: numRating,
            comment: comment.trim(),
            createdAt: new Date(),
        };

        // 1. Thêm review mới vào đầu mảng reviews ($position: 0)
        const updateResult = await db.collection('products').updateOne(
            { _id: productObjectId },
            { 
                $push: { 
                    reviews: { 
                        $each: [newReview], 
                        $position: 0 
                    } 
                } 
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
        }

        // 2. Tính lại trung bình sao (Average Rating) & tổng số review để đồng bộ DB
        const updatedProduct = await db.collection('products').findOne(
            { _id: productObjectId },
            { projection: { reviews: 1 } }
        );

        if (updatedProduct && updatedProduct.reviews) {
            const allReviews = updatedProduct.reviews;
            const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            const avgRating = Number((totalRating / allReviews.length).toFixed(1));

            // Cập nhật rating trung bình và numReviews vào sản phẩm
            await db.collection('products').updateOne(
                { _id: productObjectId },
                { 
                    $set: { 
                        rating: avgRating,
                        numReviews: allReviews.length 
                    } 
                }
            );
        }

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error('Lỗi khi lưu đánh giá:', error);
        return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

// --- PHƯƠNG THỨC GET ---
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const { searchParams } = new URL(request.url);
    const productIdParam = searchParams.get("productId");

    let query = {};
    if (productIdParam && ObjectId.isValid(productIdParam)) {
      query.productId = new ObjectId(productIdParam);
    }

    const comments = await db.collection("reviews")
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const enrichedComments = await Promise.all(
      comments.map(async (item) => {
        let product = null;
        let user = null;

        if (item.productId) {
          try {
            const prodId = ObjectId.isValid(item.productId) ? new ObjectId(item.productId) : item.productId;
            product = await db.collection("products").findOne({ _id: prodId });
          } catch (e) {}
        }

        if (item.userId) {
          try {
            const userId = ObjectId.isValid(item.userId) ? new ObjectId(item.userId) : item.userId;
            user = await db.collection("users").findOne({ _id: userId });
          } catch (e) {}
        }

        return {
          ...item,
          _id: item._id.toString(),
          productId: product ? { _id: product._id.toString(), name: product.name, image: product.image || product.images?.[0] } : null,
          userId: user ? { _id: user._id.toString(), fullname: user.fullname || user.name, email: user.email, avatar: user.avatar || null } : null,
        };
      })
    );

    return NextResponse.json(enrichedComments, { status: 200 });
  } catch (error) {
    console.error("Lỗi lấy danh sách đánh giá:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải bình luận" }, { status: 500 });
  }
}

// --- PHƯƠNG THỨC POST ---
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const body = await request.json();
    const { userId, productId, orderId, rating, comment, images } = body;

    console.log("Dữ liệu nhận từ client gửi lên:", { userId, productId, orderId, rating });

    if (!productId || !orderId || !rating) {
      return NextResponse.json({ error: "Vui lòng cung cấp đầy đủ thông tin bắt buộc!" }, { status: 400 });
    }

    const orderQueryId = ObjectId.isValid(orderId) ? new ObjectId(orderId) : orderId;
    
    // Tìm đơn hàng chỉ dựa vào orderId để đảm bảo tính ổn định cao nhất
    const order = await db.collection("orders").findOne({ _id: orderQueryId });
    
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng trong hệ thống!" }, { status: 404 });
    }

    // Cho phép duyệt cả tiếng Anh ("completed") và tiếng Việt ("Đã giao")
    if (order.status !== "completed" && order.status !== "Đã giao") {
      return NextResponse.json({ error: `Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn thành! (Trạng thái hiện tại: ${order.status})` }, { status: 400 });
    }

    if (images && Array.isArray(images) && images.length > 3) {
      return NextResponse.json({ error: "Chỉ được upload tối đa 3 ảnh sản phẩm thực tế!" }, { status: 400 });
    }

    const prodQueryId = ObjectId.isValid(productId) ? new ObjectId(productId) : productId;
    const userQueryId = userId && ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    
    // Kiểm tra xem đã đánh giá sản phẩm trong đơn hàng này chưa
    const existingReview = await db.collection("reviews").findOne({
      productId: prodQueryId,
      orderId: orderQueryId
    });

    if (existingReview) {
      return NextResponse.json({ error: "Bạn đã đánh giá sản phẩm này trong đơn hàng rồi!" }, { status: 400 });
    }

    const newReview = {
      userId: userQueryId || order.userId || order.user || "guest",
      productId: prodQueryId,
      orderId: orderQueryId,
      rating: Number(rating),
      comment: comment || "",
      images: images || [],
      createdAt: new Date()
    };

    const insertResult = await db.collection("reviews").insertOne(newReview);

    // Cập nhật lại điểm trung bình (averageRating) và số lượng đánh giá (reviewCount) cho sản phẩm
    const allReviewsForProduct = await db.collection("reviews").find({ productId: prodQueryId }).toArray();
    const totalRating = allReviewsForProduct.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = Number((totalRating / allReviewsForProduct.length).toFixed(1));

    await db.collection("products").updateOne(
      { _id: prodQueryId },
      { 
        $set: { 
          averageRating: averageRating,
          reviewCount: allReviewsForProduct.length 
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Đánh giá thành công!", 
      data: { ...newReview, _id: insertResult.insertedId.toString() } 
    }, { status: 201 });

  } catch (error) {
    console.error("Lỗi chi tiết khi thêm đánh giá:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi gửi đánh giá: " + error.message }, { status: 500 });
  }
}
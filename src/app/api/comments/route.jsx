import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const cleanOrderId = typeof orderId === 'string' ? orderId.trim() : orderId;
    const cleanProductId = typeof productId === 'string' ? productId.trim() : productId;

    const orderQueryId = ObjectId.isValid(cleanOrderId) ? new ObjectId(cleanOrderId) : cleanOrderId;
    
    const order = await db.collection("orders").findOne({ _id: orderQueryId });
    
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng trong hệ thống!" }, { status: 404 });
    }

    if (order.status !== "completed" && order.status !== "Đã giao") {
      return NextResponse.json({ error: `Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn thành! (Trạng thái hiện tại: ${order.status})` }, { status: 400 });
    }

    const prodQueryId = ObjectId.isValid(cleanProductId) ? new ObjectId(cleanProductId) : cleanProductId;
    const userQueryId = userId && ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    
    const existingReview = await db.collection("reviews").findOne({
      productId: prodQueryId,
      orderId: orderQueryId
    });

    if (existingReview) {
      return NextResponse.json({ error: "Bạn đã đánh giá sản phẩm này trong đơn hàng rồi!" }, { status: 400 });
    }

   // ==========================================
    // 🛡️ BỘ LỌC KIỂM DUYỆT BẢO MẬT & AI CHI TIẾT
    // ==========================================
    let shouldHide = false;
    let aiReason = "";
    
    const lowerComment = comment ? comment.trim().toLowerCase() : "";
    
    const hexList = ["6ce1bb936e", "6363", "76636c", "646d", "6e6875206c6f6e"]; 
    const decodedHexList = hexList.map(h => Buffer.from(h, 'hex').toString('utf8'));
    
    // Kiểm tra nhanh qua mã Hex
    const hasToxicMatch = decodedHexList.some(badWord => lowerComment.includes(badWord));

    if (hasToxicMatch) {
        shouldHide = true;
        aiReason = "Phát hiện từ ngữ không phù hợp với chuẩn mực đánh giá.";
    } else {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (apiKey && lowerComment !== "") {
          try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
              model: "gemini-1.5-flash",
              generationConfig: { responseMimeType: "application/json" },
            });

            const prompt = `
              Bạn là hệ thống kiểm duyệt nội dung chuyên nghiệp cho nền tảng thương mại điện tử.
              Hãy phân tích thật kỹ nội dung đánh giá sau từ khách hàng: "${comment}"
              
              Nhiệm vụ: Phát hiện xem bình luận này có chứa từ ngữ thô tục, chửi thề, tiếng lóng xúc phạm, từ lóng lắt léo (kể cả viết tắt cực ngắn hoặc che ký tự như "như l...", v.v.), lăng mạ hoặc mang tính chất độc hại, kém văn minh hay không.
              
              Quy tắc đánh giá:
              - Nếu câu chứa từ ngữ thô tục, chửi thề, tiếng lóng viết tắt mang ý nghĩa chửi rủa -> Bắt buộc đặt "isToxic": true.
              - Nếu câu chỉ là lời chê bai sản phẩm bình thường, góp ý thực tế (ví dụ: chê form rộng, chất liệu cứng, giao hàng chậm) nhưng sử dụng từ ngữ lịch sự, văn minh -> Đặt "isToxic": false.
              
              Chỉ trả về định dạng JSON thuần túy duy nhất sau (không kèm markdown khác):
              {
                "isToxic": true hoặc false,
                "reason": "Lý do ngắn gọn bằng tiếng Việt nếu vi phạm, ngược lại để trống"
              }
            `;

            const result = await model.generateContent(prompt);
            let textResponse = result.response.text().trim()
              .replace(/^```json\s*/i, "")
              .replace(/^```\s*/i, "")
              .replace(/\s*```$/, "");

            const parsedAI = JSON.parse(textResponse);
            shouldHide = parsedAI.isToxic || false;
            aiReason = parsedAI.reason || "";
          } catch (aiError) {
            console.error("Lỗi kiểm duyệt AI:", aiError);
          }
        }
    }

    // ==========================================
    // LƯU ĐÁNH GIÁ VÀO MONGODB
    // ==========================================
    const newReview = {
      userId: userQueryId || order.userId || order.user || "guest",
      productId: prodQueryId,
      orderId: orderQueryId,
      rating: Number(rating),
      comment: comment || "",
      images: Array.isArray(images) ? images : [],
      isHidden: shouldHide,     // Tự động ẩn nếu AI phát hiện từ ngữ nhạy cảm
      aiReason: aiReason,       // Lưu lý do AI đánh giá lại
      createdAt: new Date()
    };

    const insertResult = await db.collection("reviews").insertOne(newReview);

    // Tính toán lại điểm trung bình cho sản phẩm
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
      message: shouldHide ? "Đánh giá của bạn đã được ghi nhận nhưng đang chờ kiểm duyệt." : "Đánh giá thành công!", 
      data: { ...newReview, _id: insertResult.insertedId.toString() } 
    }, { status: 201 });

  } catch (error) {
    console.error("Lỗi chi tiết khi thêm đánh giá:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi gửi đánh giá: " + error.message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Dữ liệu dự phòng khi chưa cấu hình API Key hoặc AI phản hồi lỗi
function buildFallbackNewsResponse(topic) {
  const defaultTopic = topic || "Giày Sneaker Hot Nhất Năm";
  return {
    title: `Đánh Giá Chi Tiết: ${defaultTopic} - Thiết Kế & Trải Nghiệm`,
    summary: `Bài viết phân tích chuyên sâu về phong cách, chất liệu và tính ứng dụng thực tế của mẫu ${defaultTopic}.`,
    category: "Xu hướng",
    content: `<p>Mẫu <strong>${defaultTopic}</strong> đang trở thành tâm điểm thu hút sự chú ý trong giới thời trang nhờ thiết kế hiện đại và độ hoàn thiện cao.</p><h3>1. Thiết kế và Chất liệu</h3><p>Được gia công tỉ mỉ từ các chất liệu cao cấp, sản phẩm mang lại cảm giác vô cùng thoải mái và êm ái khi di chuyển suốt cả ngày.</p><h3>2. Phong cách phối đồ</h3><p>Dòng sản phẩm này cực kỳ linh hoạt, dễ dàng kết hợp với nhiều phong cách từ năng động, thể thao cho đến lịch sự, tinh tế.</p>`
  };
}

export async function POST(req) {
  let topic = "";

  try {
    const body = await req.json();
    topic = body.topic || "";

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ Không tìm thấy GEMINI_API_KEY/GOOGLE_API_KEY. Đang dùng dữ liệu dự phòng.");
      return NextResponse.json({ success: true, data: buildFallbackNewsResponse(topic) }, { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
    Bạn là một biên tập viên tin tức chuyên nghiệp về thời trang và giày sneaker của thương hiệu Nova Kicks.

    YÊU CẦU: Hãy viết một bài viết tin tức hấp dẫn về chủ đề hoặc từ khóa: "${topic || "Mẫu giày sneaker hot nhất hiện nay"}".

    QUY TẮC BẮT BUỘC:
    1. Trả về đúng định dạng JSON thuần túy gồm 4 trường: "title", "summary", "category", "content".
    2. Trường "content" phải chứa nội dung chi tiết dạng các thẻ HTML chuẩn (<p>, <h3>, <ul>, <li>, <strong>).
    3. Cấu trúc JSON trả về:
    {
      "title": "Tiêu đề hấp dẫn, chuẩn SEO",
      "summary": "Đoạn tóm tắt ngắn gọn 2-3 câu giới thiệu bài viết",
      "category": "Danh mục phù hợp (VD: Xu hướng, Đánh giá, Thể thao...)",
      "content": "<p>Đoạn mở đầu...</p><h3>1. Ý thứ nhất</h3><p>Chi tiết...</p>"
    }
    `;

    const result = await model.generateContent(prompt);
    let textResponse = result.response.text().trim();

    // Làm sạch Markdown JSON
    textResponse = textResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");

    let parsedData;
    try {
      parsedData = JSON.parse(textResponse);
    } catch (e) {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = buildFallbackNewsResponse(topic);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        title: parsedData.title || `Bài viết về ${topic}`,
        summary: parsedData.summary || "",
        category: parsedData.category || "Xu hướng",
        content: parsedData.content || ""
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Lỗi API AI News:", error);
    return NextResponse.json({
      success: true,
      data: buildFallbackNewsResponse(topic)
    }, { status: 200 });
  }
}
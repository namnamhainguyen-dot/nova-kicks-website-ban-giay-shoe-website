import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Dữ liệu dự phòng (fallback) nếu AI lỗi hoặc thiếu API Key
function buildFallbackNewsResponse(topic) {
  const defaultTopic = topic || "Giày Sneaker Hot Nhất Năm";
  const promptEncoded = encodeURIComponent(`sneaker ${defaultTopic} footwear photography, high quality, studio lighting`);
  
  return {
    title: `Đánh Giá Chi Tiết: ${defaultTopic} - Thiết Kế & Trải Nghiệm`,
    summary: `Bài viết phân tích chuyên sâu về phong cách, chất liệu và tính ứng dụng thực tế của mẫu ${defaultTopic}.`,
    category: "Xu hướng",
    image: `https://image.pollinations.ai/prompt/${promptEncoded}?width=800&height=500&nologo=true`,
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
      console.warn("⚠️ Không tìm thấy GEMINI_API_KEY / GOOGLE_API_KEY. Sử dụng dữ liệu dự phòng.");
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
    1. Trả về đúng định dạng JSON thuần túy gồm 5 trường: "title", "summary", "category", "imagePrompt", "content".
    2. Trường "imagePrompt" chứa câu lệnh miêu tả bức ảnh bằng Tiếng Anh ngắn gọn (ví dụ: "a pair of modern Nike sneakers product photography, studio light, 8k").
    3. Trường "content" chứa bài viết dạng các thẻ HTML chuẩn (<p>, <h3>, <ul>, <li>, <strong>).
    
    Cấu trúc JSON trả về:
    {
      "title": "Tiêu đề bài viết hấp dẫn",
      "summary": "Tóm tắt ngắn gọn 2-3 câu",
      "category": "Danh mục phù hợp (VD: Xu hướng, Đánh giá...)",
      "imagePrompt": "a stylish sneaker product shot, photorealistic, 4k",
      "content": "<p>Nội dung chi tiết...</p>"
    }
    `;

    const result = await model.generateContent(prompt);
    let textResponse = result.response.text().trim();

    // Làm sạch khối mã JSON nếu AI trả về dạng ```json ... ```
    textResponse = textResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");

    let parsedData;
    try {
      parsedData = JSON.parse(textResponse);
    } catch (e) {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : buildFallbackNewsResponse(topic);
    }

    // Sinh link ảnh AI trực tiếp từ Prompt tiếng Anh do Gemini gợi ý
    const imageKeyword = parsedData.imagePrompt || `modern sneaker ${topic}`;
    const generatedImageUrl = `[https://image.pollinations.ai/prompt/$](https://image.pollinations.ai/prompt/$){encodeURIComponent(imageKeyword)}?width=800&height=500&nologo=true`;

    return NextResponse.json({
      success: true,
      data: {
        title: parsedData.title || `Bài viết về ${topic}`,
        summary: parsedData.summary || "",
        category: parsedData.category || "Xu hướng",
        image: generatedImageUrl, // Tự sinh link ảnh đại diện
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
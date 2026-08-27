import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackNewsResponse(topic) {
  const defaultTopic = topic || "Giày Sneaker Hot Nhất Năm";
  const promptEncoded = encodeURIComponent(`sneaker ${defaultTopic} footwear photography, high quality`);
  
  return {
    title: `Đánh Giá Chi Tiết: ${defaultTopic}`,
    summary: `Bài viết phân tích chuyên sâu về phong cách và chất liệu của mẫu ${defaultTopic}.`,
    category: "Xu hướng",
    image: `https://image.pollinations.ai/prompt/${promptEncoded}?width=800&height=500&nologo=true`,
    content: `<p>Mẫu <strong>${defaultTopic}</strong> sở hữu thiết kế hiện đại và kiểu dáng thu hút...</p>`
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, imageBase64 } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ Không tìm thấy GEMINI_API_KEY / GOOGLE_API_KEY.");
      return NextResponse.json({ success: true, data: buildFallbackNewsResponse(topic) }, { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const promptText = `
    Bạn là một biên tập viên tin tức chuyên nghiệp về thời trang và giày sneaker của thương hiệu Nova Kicks.

    YÊU CẦU: 
    ${
      imageBase64
        ? "Hãy phân tích hình ảnh sản phẩm/mẫu giày được đính kèm và viết một bài viết tin tức review/giới thiệu sản phẩm chi tiết dựa trên bức ảnh đó."
        : `Hãy viết một bài viết tin tức hấp dẫn về chủ đề hoặc từ khóa: "${topic || "Mẫu giày sneaker hot nhất hiện nay"}".`
    }

    QUY TẮC BẮT BUỘC:
    1. Trả về đúng định dạng JSON thuần túy gồm 5 trường: "title", "summary", "category", "imagePrompt", "content".
    2. Trường "imagePrompt" chứa câu lệnh miêu tả bức ảnh bằng Tiếng Anh ngắn gọn.
    3. Trường "content" chứa bài viết dạng HTML chuẩn (<p>, <h3>, <ul>, <li>, <strong>).
    
    Cấu trúc JSON trả về:
    {
      "title": "Tiêu đề bài viết chuẩn SEO",
      "summary": "Tóm tắt ngắn gọn 2-3 câu",
      "category": "Danh mục phù hợp (VD: Đánh giá, Xu hướng, Thể thao...)",
      "imagePrompt": "a product shot of sneakers",
      "content": "<p>Nội dung chi tiết...</p>"
    }
    `;

    let contents = [];

    // Nếu người dùng tải ảnh lên, gửi kèm dữ liệu Ảnh Base64 sang cho Gemini xử lý
    if (imageBase64) {
      // Tách bỏ header data URL (ví dụ: data:image/jpeg;base64,) nếu có
      const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      const mimeTypeMatch = imageBase64.match(/^data:(.*);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

      contents = [
        promptText,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          },
        },
      ];
    } else {
      contents = [promptText];
    }

    const result = await model.generateContent(contents);
    let textResponse = result.response.text().trim();

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

    // Nếu tải ảnh lên thì giữ nguyên ảnh người dùng, nếu viết bằng text thì tự sinh link ảnh AI
    const finalImageUrl = imageBase64
      ? imageBase64
      : `[https://image.pollinations.ai/prompt/$](https://image.pollinations.ai/prompt/$){encodeURIComponent(parsedData.imagePrompt || topic || "sneaker")}`;

    return NextResponse.json({
      success: true,
      data: {
        title: parsedData.title || "Bài viết mới",
        summary: parsedData.summary || "",
        category: parsedData.category || "Đánh giá",
        image: finalImageUrl,
        content: parsedData.content || "",
      },
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Lỗi API AI News:", error);
    return NextResponse.json({
      success: true,
      data: buildFallbackNewsResponse("Giày Sneaker"),
    }, { status: 200 });
  }
}
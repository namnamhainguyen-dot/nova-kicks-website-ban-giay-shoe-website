import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Khởi tạo SDK (Tự động đọc GEMINI_API_KEY từ file .env.local)
const ai = new GoogleGenAI();

export async function POST(request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề bài viết!" },
        { status: 400 }
      );
    }

    const prompt = `Bạn là một biên tập viên tin tức chuyên nghiệp. Hãy viết một bài viết tin tức hoàn chỉnh dựa trên chủ đề/tiêu đề sau: "${topic}".
    Trả về kết quả dưới dạng JSON duy nhất (không chứa ký tự markdown \`\`\`json) với cấu trúc sau:
    {
      "title": "Tiêu đề hấp dẫn, chuẩn SEO",
      "summary": "Đoạn tóm tắt ngắn gọn 2-3 câu",
      "category": "Tên danh mục phù hợp (VD: Thể thao, Thời trang, Xu hướng...)",
      "content": "Nội dung bài viết chi tiết, trình bày chuẩn HTML (có các thẻ <p>, <h3>, <ul>, <li>, <strong>) để chèn thẳng vào editor"
    }`;

    // Gọi Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text.trim();
    // Làm sạch chuỗi nếu AI lỡ bọc trong markdown codeblock
    const cleanJson = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Lỗi Gemini API:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo bài viết từ AI: " + error.message },
      { status: 500 }
    );
  }
}
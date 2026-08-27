import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { topic } = await request.json();

    const prompt = `Bạn là biên tập viên tin tức giày sneaker. Hãy viết một bài viết về chủ đề: "${topic || "Xu hướng giày sneaker hot nhất"}".
    Trả về duy nhất định dạng JSON (không kèm mã markdown \`\`\`json) gồm cấu trúc:
    {
      "title": "Tiêu đề bài viết",
      "summary": "Tóm tắt ngắn gọn 2-3 câu",
      "category": "Xu hướng",
      "content": "<p>Nội dung chi tiết định dạng HTML...</p>"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleanJson = response.text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Lỗi Gemini API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý AI" },
      { status: 500 }
    );
  }
}
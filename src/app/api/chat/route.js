import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { reply: "Hệ thống chưa cấu hình API Key.", matchedIds: [] },
        { status: 500 }
      );
    }

    const { userMessage, products = [], history = [] } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    // Dùng model 1.5-flash-8b siêu nhẹ, hạn mức Free cao
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // 1. Tóm tắt danh sách sản phẩm thành text rút gọn
    const productsContext = products.map((p) => ({
      id: p._id?.$oid || p._id || p.id,
      name: p.name,
      price: p.price,
      sizes: p.availableSizes || p.displaySizes || p.sizes || [],
      colors: (p.availableColors?.map((c) => (typeof c === "object" ? c.color : c)) || p.displayColors || []),
    }));

    // 2. Gộp Prompt làm 1 bước duy nhất
    const singlePrompt = `
      Bạn là Trợ lý tư vấn bán giày nhiệt tình của Nova Kicks.
      
      Danh sách sản phẩm trong kho:
      ${JSON.stringify(productsContext)}

      Lịch sử trò chuyện:
      ${JSON.stringify(history)}

      Khách hàng vừa nhắn: "${userMessage}"

      Nhiệm vụ:
      - Dựa vào lịch sử và tin nhắn mới nhất, lọc ra danh sách các product ID phù hợp (về tên, size, màu sắc, tầm giá...).
      - Trả về KẾT QUẢ DẠNG JSON DUY NHẤT (không kèm markdown \`\`\`json):
      {
        "reply": "Câu trả lời tư vấn ngắn gọn (2-3 câu), xưng 'mình' gọi 'bạn'.",
        "matchedIds": ["id1", "id2"]
      }
    `;

    // 3. Gọi AI đúng 1 lần
    const result = await model.generateContent(singlePrompt);
    const textResponse = result.response.text().trim();

    let parsedData = { reply: "Mình đã tiếp nhận yêu cầu, bạn xem các sản phẩm bên dưới nhé!", matchedIds: [] };
    
    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("Lỗi parse JSON:", e, "Raw text:", textResponse);
      parsedData.reply = textResponse;
    }

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Lỗi API Chatbot Chi Tiết:", error);
    
    // Xử lý riêng thông báo lỗi 429 cho người dùng
    if (error?.status === 429 || error?.message?.includes("429")) {
      return NextResponse.json({
        reply: "⏳ Hệ thống tư vấn AI đang đạt giới hạn lượt gọi tạm thời. Bạn vui lòng đợi khoảng 15-20 giây rồi thử lại nhé!",
        matchedIds: []
      });
    }

    return NextResponse.json(
      { reply: "Rất tiếc, hệ thống tư vấn đang bận một chút. Bạn thử lại nhé!", matchedIds: [] },
      { status: 500 }
    );
  }
}
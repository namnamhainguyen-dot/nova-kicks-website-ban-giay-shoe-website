import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  const productNames = products.slice(0, 3).map((p) => p.name || p.title).filter(Boolean);
  const matchedIds = products.slice(0, 3).map((p) => p._id?.$oid || p._id || p.id).filter(Boolean);

  const reply = productNames.length > 0
    ? `Mình đang ở chế độ dự phòng vì khóa Gemini chưa được cấu hình hoặc bị giới hạn. Bạn có thể xem các sản phẩm phù hợp như: ${productNames.join(", ")}.`
    : `Mình đang ở chế độ dự phòng. Bạn có thể tiếp tục xem các sản phẩm bên dưới nhé!`;

  return {
    reply,
    matchedIds,
  };
}

export async function POST(req) {
  let userMessage = "";
  let products = [];
  let history = [];

  try {
    const body = await req.json();
    userMessage = body.userMessage || "";
    products = body.products || [];
    history = body.history || [];

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ Khóa GEMINI_API_KEY chưa được khai báo!");
      return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const productsContext = products.map((p) => ({
      id: p._id?.$oid || p._id || p.id,
      name: p.name,
      price: p.price,
      sizes: p.availableSizes || p.displaySizes || p.sizes || [],
      colors: (p.availableColors?.map((c) => (typeof c === "object" ? c.color : c)) || p.displayColors || []),
    }));

    const singlePrompt = `
      Bạn là Trợ lý tư vấn bán giày nhiệt tình của Nova Kicks.

      Danh sách sản phẩm trong kho:
      ${JSON.stringify(productsContext)}

      Lịch sử trò chuyện:
      ${JSON.stringify(history)}

      Khách hàng vừa nhắn: ${JSON.stringify(userMessage)}

      Nhiệm vụ:
      - Dựa vào lịch sử và tin nhắn mới nhất, lọc ra danh sách các product ID phù hợp.
      - Trả về JSON theo đúng cấu trúc sau:
      {
        "reply": "Câu trả lời tư vấn ngắn gọn (2-3 câu), xưng 'mình' gọi 'bạn'.",
        "matchedIds": ["id1", "id2"]
      }
    `;

    const result = await model.generateContent(singlePrompt);
    const textResponse = result.response.text().trim();

    let parsedData = {
      reply: "Mình đã tiếp nhận yêu cầu, bạn xem các sản phẩm bên dưới nhé!",
      matchedIds: [],
    };

    try {
      parsedData = JSON.parse(textResponse);
    } catch (e) {
      console.warn("Lỗi parse JSON từ Gemini:", e);
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData.reply = textResponse;
      }
    }

    return NextResponse.json(parsedData, { status: 200 });

  } catch (error) {
    console.error("Lỗi API Chatbot Chi Tiết:", error);

    // Xử lý lỗi Rate Limit 429 hoặc các lỗi khác không làm sập UI
    let fallbackText = "⏳ Hệ thống tư vấn AI đang bận hoặc đạt giới hạn tạm thời. Bạn vui lòng thử lại sau vài giây nhé!";
    
    if (!error?.message?.includes("429")) {
      return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
    }

    return NextResponse.json({
      reply: fallbackText,
      matchedIds: [],
    }, { status: 200 });
  }
}
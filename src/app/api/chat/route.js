import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  const productNames = products
    .slice(0, 3)
    .map((p) => p.name || p.title)
    .filter(Boolean);
  const matchedIds = products
    .slice(0, 3)
    .map((p) => p._id?.$oid || p._id || p.id)
    .filter(Boolean);

  const reply =
    productNames.length > 0
      ? `Bạn có thể xem các sản phẩm phù hợp như: ${productNames.join(", ")}.`
      : `Bạn có thể tiếp tục xem các sản phẩm bên dưới nhé!`;

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

    // Cập nhật tên model ổn định mới nhất (gemini-1.5-flash)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Rút gọn bớt dữ liệu sản phẩm để tránh làm phình Prompt/Token
    const productsContext = products.map((p) => ({
      id: String(p._id?.$oid || p._id || p.id),
      name: p.name,
      price: p.price,
      sizes: p.availableSizes || p.displaySizes || p.sizes || [],
      colors: p.availableColors?.map((c) => (typeof c === "object" ? c.color : c)) || p.displayColors || [],
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
      - Trả về JSON theo đúng cấu trúc sau (không kèm ký tự markdown như \`\`\`json):
      {
        "reply": "Câu trả lời tư vấn ngắn gọn (2-3 câu), xưng 'mình' gọi 'bạn'.",
        "matchedIds": ["id1", "id2"]
      }
    `;

    const result = await model.generateContent(singlePrompt);
    let textResponse = result.response.text().trim();

    // Làm sạch các ký tự bọc Codeblock của Markdown nếu có
    if (textResponse.startsWith("```")) {
      textResponse = textResponse.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

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
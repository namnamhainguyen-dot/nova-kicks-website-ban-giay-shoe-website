import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  const productNames = products.slice(0, 3).map((p) => p.name || p.title).filter(Boolean);
  const matchedIds = products.slice(0, 3).map((p) => p._id?.$oid || p._id || p.id).filter(Boolean);

  const reply = productNames.length > 0
    ? `Mình đang ở chế độ dự phòng vì khóa Gemini chưa được cấu hình. Bạn có thể xem các sản phẩm phù hợp như ${productNames.join(", ")}.`
    : `Mình đang ở chế độ dự phòng vì khóa Gemini chưa được cấu hình. Bạn có thể tiếp tục trao đổi và mình sẽ hỗ trợ sớm nhất có thể.`;

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
    ({ userMessage = "", products = [], history = [] } = await req.json());
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      Khách hàng vừa nhắn: "${userMessage}"

      Nhiệm vụ:
      - Dựa vào lịch sử và tin nhắn mới nhất, lọc ra danh sách các product ID phù hợp (về tên, size, màu sắc, tầm giá...).
      - Trả về KẾT QUẢ DẠNG JSON DUY NHẤT (không kèm markdown \`\`\`json):
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

    if (error?.status === 429 || error?.message?.includes("429")) {
      return NextResponse.json({
        reply: "⏳ Hệ thống tư vấn AI đang đạt giới hạn lượt gọi tạm thời. Bạn vui lòng đợi khoảng 15-20 giây rồi thử lại nhé!",
        matchedIds: [],
      });
    }

    return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
  }
}
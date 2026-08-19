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

  return { reply, matchedIds };
}

export async function POST(req) {
  let userMessage = "";
  let products = [];
  let history = [];

  try {
    const body = await req.json();
    userMessage = body.userMessage || "";
    products = body.products || [];
    history = body.history || []; // [{ role: "user" | "model", parts: [{ text: "..." }] }] hoặc dạng { sender, message }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ Khóa GEMINI_API_KEY chưa được khai báo!");
      return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Rút gọn dữ liệu sản phẩm để tiết kiệm Token
    const productsContext = products.map((p) => ({
      id: String(p._id?.$oid || p._id || p.id),
      name: p.name,
      price: p.price,
      sizes: p.availableSizes || p.displaySizes || p.sizes || [],
      colors: p.availableColors?.map((c) => (typeof c === "object" ? c.color : c)) || p.displayColors || [],
    }));

    // Quy hoạch lại Lịch sử chat theo đúng chuẩn định dạng Gemini yêu cầu (nếu history từ client gửi lên có cấu trúc khác)
    const formattedHistory = history.map((h) => ({
      role: h.role === "assistant" || h.role === "model" ? "model" : "user",
      parts: [{ text: typeof h.content === "string" ? h.content : (h.parts?.[0]?.text || h.message || "") }],
    }));

    // Khởi tạo phiên trò chuyện đa lượt (Multi-turn Chat)
    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: {
        parts: [
          {
            text: `Bạn là Trợ lý tư vấn bán hàng nhiệt tình và chuyên nghiệp.
Danh sách sản phẩm hiện có trong kho (dạng JSON):
${JSON.stringify(productsContext)}

NHIỆM VỤ & QUY TẮC:
1. Dựa vào yêu cầu của khách hàng và danh sách kho, hãy tư vấn sản phẩm phù hợp nhất.
2. Xưng "mình" - gọi "bạn", giọng điệu thân thiện, ngắn gọn (tối đa 2-3 câu).
3. Lọc chính xác danh sách ID sản phẩm phù hợp từ kho để đưa vào mảng "matchedIds".
4. LUÔN LUÔN trả về kết quả dưới dạng JSON thuần túy (không kèm markdown như \`\`\`json) theo đúng cấu trúc sau:
{
  "reply": "Câu trả lời tư vấn...",
  "matchedIds": ["id1", "id2"]
}`
          }
        ]
      }
    });

    // Gửi tin nhắn mới nhất của người dùng vào phiên chat
    const result = await chat.sendMessage(userMessage);
    let textResponse = result.response.text().trim();

    // Làm sạch Markdown codeblock nếu mô hình lỡ sinh ra
    textResponse = textResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");

    let parsedData;
    try {
      parsedData = JSON.parse(textResponse);
    } catch (e) {
      console.warn("⚠️ Lỗi parse JSON từ Gemini, đang cố trích xuất thủ công...", e);
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = {
          reply: textResponse,
          matchedIds: [],
        };
      }
    }

    return NextResponse.json(parsedData, { status: 200 });

  } catch (error) {
    console.error("❌ Lỗi API Chatbot Chi Tiết:", error);

    if (error?.message?.includes("429")) {
      return NextResponse.json({
        reply: "⏳ Hệ thống tư vấn AI đang bận hoặc đạt giới hạn tạm thời. Bạn vui lòng thử lại sau vài giây nhé!",
        matchedIds: [],
      }, { status: 200 });
    }

    return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
  }
}
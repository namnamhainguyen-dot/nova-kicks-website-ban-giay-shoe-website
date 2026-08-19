import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  // Bỏ .slice(0, 3) để cho phép lấy toàn bộ hoặc nhiều sản phẩm hơn khi fallback
  const productNames = products
    .map((p) => p.name || p.title)
    .filter(Boolean);
  const matchedIds = products
    .map((p) => p._id?.$oid || p._id || p.id)
    .filter(Boolean);

  const reply =
    productNames.length > 0
      ? `Mình gợi ý một số sản phẩm phù hợp với yêu cầu của bạn nhé!`
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
    history = body.history || [];

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

    // Rút gọn dữ liệu sản phẩm để tiết kiệm Token nhưng vẫn giữ đủ thông tin để AI lọc
    const productsContext = products.map((p) => ({
      id: String(p._id?.$oid || p._id || p.id),
      name: p.name,
      price: p.price,
      description: p.description, // Bổ sung mô tả để AI đọc hiểu sản phẩm nào dùng đi leo núi, đi tiệc... tốt hơn
      sizes: p.availableSizes || p.displaySizes || p.sizes || [],
      colors: p.availableColors?.map((c) => (typeof c === "object" ? c.color : c)) || p.displayColors || [],
    }));

    // Gom lịch sử chat thành dạng văn bản
    const formattedHistory = history
      .map((h) => {
        const role = h.role === "assistant" || h.role === "model" ? "Trợ lý" : "Khách hàng";
        const content = typeof h.content === "string" ? h.content : (h.parts?.[0]?.text || h.message || "");
        return `${role}: ${content}`;
      })
      .join("\n");

    const singlePrompt = `
    Bạn là Trợ lý tư vấn bán giày nhiệt tình và chuyên nghiệp của cửa hàng Nova Kicks.

    DANH SÁCH SẢN PHẨM TRONG KHO (JSON):
    ${JSON.stringify(productsContext)}

    LỊCH SỬ TRÒ CHUYỆN GẦN ĐÂY:
    ${formattedHistory || "(Chưa có lịch sử)"}

    TIN NHẮN MỚI NHẤT CỦA KHÁCH HÀNG:
    "${userMessage}"

    NHIỆM VỤ VÀ QUY TẮC TƯ VẤN:
    1. Đọc kỹ tin nhắn mới nhất của khách hàng để hiểu họ đang muốn tìm loại giày nào (ví dụ: đi leo núi, đi tiệc, đi học, chạy bộ, v.v.).
    2. Đối chiếu với danh sách sản phẩm trong kho, chọn ra **TẤT CẢ** các sản phẩm thực sự phù hợp (không giới hạn số lượng, có thể chọn nhiều hơn 3 sản phẩm nếu phù hợp).
    3. Xưng "mình" - gọi "bạn", viết câu trả lời tư vấn ngắn gọn, thân thiện (tối đa 2-3 câu).
    4. Lấy danh sách ID của **tất cả** các sản phẩm phù hợp bỏ vào mảng "matchedIds".
    5. TUYỆT ĐỐI chỉ trả về kết quả dưới dạng JSON thuần túy theo cấu trúc sau, không kèm markdown:
    {
      "reply": "Câu trả lời tư vấn ngắn gọn...",
      "matchedIds": ["id1", "id2", "id3", ...]
    }
    `;

    const result = await model.generateContent(singlePrompt);
    let textResponse = result.response.text().trim();

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
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  // Fallback thông minh: Tự động lọc từ khóa cơ bản nếu AI gặp lỗi hoặc hết hạn mức API
  const lowerMsg = userMessage.toLowerCase();
  const matched = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return name.includes(lowerMsg) || desc.includes(lowerMsg);
  });

  // Nếu tìm thấy sản phẩm khớp từ khóa thì lấy, nếu không lấy toàn bộ để tránh mảng trống
  const targetProducts = matched.length > 0 ? matched : products;
  
  const matchedIds = targetProducts
    .map((p) => p._id?.$oid || p._id || p.id)
    .filter(Boolean);

  const reply = `Chào bạn, dựa trên yêu cầu "${userMessage}", mình đã chọn lọc các mẫu giày phù hợp nhất trong cửa hàng để bạn tham khảo ở danh sách bên dưới nhé!`;

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

    // Truyền đầy đủ thông tin (tên, giá, mô tả, size) để AI phân tích chuẩn xác
    const productsContext = products.map((p) => ({
      id: String(p._id?.$oid || p._id || p.id),
      name: p.name,
      price: p.price,
      description: p.description || "", 
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
    Bạn là Trợ lý tư vấn bán giày cao cấp, am hiểu thời trang và cực kỳ nhiệt tình của cửa hàng Nova Kicks.

    DANH SÁCH TẤT CẢ SẢN PHẨM TRONG KHO (JSON):
    ${JSON.stringify(productsContext)}

    LỊCH SỬ TRÒ CHUYỆN GẦN ĐÂY:
    ${formattedHistory || "(Chưa có lịch sử)"}

    TIN NHẮN MỚI NHẤT CỦA KHÁCH HÀNG:
    "${userMessage}"

    NHIỆM VỤ VÀ QUY TẮC TƯ VẤN:
    1. Đọc kỹ và phân tích thật sâu sắc nhu cầu của khách hàng (ví dụ: đi tiệc cần sự sang trọng, đi leo núi cần độ bám/chống nước, đi học cần sự thoải mái, v.v.).
    2. Rà soát TOÀN BỘ danh sách sản phẩm trong kho, chọn ra **TẤT CẢ** các sản phẩm thực sự phù hợp (không giới hạn số lượng, quét hết kho nếu sản phẩm đáp ứng đúng tiêu chí).
    3. Viết câu trả lời tư vấn thật chi tiết, thuyết phục và dài dặn hơn (khoảng 3-4 câu), xưng "mình" - gọi "bạn", giải thích rõ lý do tại sao những mẫu giày này lại phù hợp với yêu cầu của khách.
    4. Trích xuất danh sách ID của **tất cả** các sản phẩm phù hợp đó bỏ vào mảng "matchedIds".
    5. TUYỆT ĐỐI chỉ trả về kết quả dưới dạng JSON thuần túy theo cấu trúc sau, không kèm markdown:
    {
      "reply": "Câu trả lời tư vấn chi tiết, dài dặn và phân tích kỹ lưỡng khoảng 3-4 câu...",
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
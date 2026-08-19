import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  const lowerMsg = userMessage.toLowerCase();
  
  // Thuật toán lọc thông minh cho fallback khi không có AI hoặc gặp lỗi kết nối
  let matched = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    return name.includes(lowerMsg) || desc.includes(lowerMsg) || category.includes(lowerMsg);
  });

  // Nếu không khớp từ khóa cụ thể, xoay vòng dựa theo độ dài câu chữ để trả ra sản phẩm khác nhau
  if (matched.length === 0 && products.length > 0) {
    const startIndex = userMessage.length % products.length;
    matched = [
      products[startIndex % products.length],
      products[(startIndex + 1) % products.length]
    ].filter(Boolean);
  }

  const targetProducts = matched.length > 0 ? matched.slice(0, 3) : products.slice(0, 3);
  const matchedIds = targetProducts.map((p) => String(p._id?.$oid || p._id || p.id)).filter(Boolean);

  const productBullets = targetProducts.map((p, index) => {
    const formattedPrice = p.price ? Number(p.price).toLocaleString("vi-VN") + "đ" : "Liên hệ";
    return `${index + 1}. **${p.name}** - Giá ${formattedPrice}`;
  }).join("\n");

  const reply = `Chào bạn, dựa trên yêu cầu "${userMessage}", mình gợi ý các mẫu phù hợp nhé:\n${productBullets}`;

  return { reply, matchedIds };
}

export async function POST(req) {
  let userMessage = "";
  let products = [];

  try {
    const body = await req.json();
    userMessage = body.userMessage || "";
    products = body.products || [];

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ Khóa GEMINI_API_KEY chưa được khai báo!");
      return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Sử dụng model chuẩn để đảm bảo ổn định
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Chuẩn hóa dữ liệu sản phẩm để AI dễ phân biệt
    const productsContext = products.map((p, idx) => ({
      index: idx,
      id: p._id?.$oid || p._id || p.id,
      name: p.name || p.title,
      price: p.price,
      description: p.description || p.category || "Giày thời trang đa năng"
    }));

    const singlePrompt = `
    Bạn là Trợ lý tư vấn bán giày thông minh của cửa hàng Nova Kicks.

    DANH SÁCH SẢN PHẨM HIỆN CÓ (JSON):
    ${JSON.stringify(productsContext)}

    YÊU CẦU CỦA KHÁCH:
    "${userMessage}"

    QUY TẮC TƯ VẤN (BẮT BUỘC):
    1. "Đi ăn cưới, ăn tiệc": Ưu tiên giày da, giày tây, thiết kế lịch lãm. Tránh giày thể thao chạy bộ hầm hố.
    2. "Đi leo núi": Ưu tiên giày cổ cao, đế bám tốt, outdoor, boots hoặc giày bền chắc.
    3. "Đi học": Ưu tiên sneaker năng động, giày vải hoặc giày thể thao nhẹ nhàng, thoải mái.
    4. Các nhu cầu khác nhau phải trả về danh sách sản phẩm đặc trưng riêng phù hợp.

    NHIỆM VỤ:
    1. Chọn 2 sản phẩm phù hợp nhất.
    2. Viết câu trả lời ("reply") ngắn gọn, thân thiện theo mẫu:
        "Chào bạn, gợi ý phù hợp nhất đây ạ:
        1. **[Tên sản phẩm]** - Giá [Giá]đ ([Lý do ngắn gọn vì sao hợp]).
        2. **[Tên sản phẩm]** - Giá [Giá]đ ([Lý do ngắn gọn vì sao hợp])."
    3. Trích xuất chính xác trường "id" vào mảng "matchedIds".
    4. Chỉ trả về JSON thuần túy, không markdown, không kèm chữ ngoài cấu trúc:
    {
      "reply": "...",
      "matchedIds": ["id1", "id2"]
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
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
      }
    }

    return NextResponse.json({
      reply: parsedData.reply || "Dưới đây là các sản phẩm phù hợp với bạn:",
      matchedIds: Array.isArray(parsedData.matchedIds) ? parsedData.matchedIds.map(String) : []
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Lỗi API Chatbot:", error);
    return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
  }
}
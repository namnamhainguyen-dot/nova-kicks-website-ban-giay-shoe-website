import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  const lowerMsg = userMessage.toLowerCase();
  
  let matched = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    return name.includes(lowerMsg) || desc.includes(lowerMsg) || category.includes(lowerMsg);
  });

  if (matched.length === 0 && products.length > 0) {
    const startIndex = userMessage.length % products.length;
    matched = [
      products[startIndex % products.length],
      products[(startIndex + 1) % products.length]
    ].filter(Boolean);
  }

  const targetProducts = matched.length > 0 ? matched.slice(0, 2) : products.slice(0, 2);
  const matchedIds = targetProducts.map((p) => String(p._id?.$oid || p._id || p.id)).filter(Boolean);

  const productBullets = targetProducts.map((p, index) => {
    const formattedPrice = p.price ? Number(p.price).toLocaleString("vi-VN") + "đ" : "Liên hệ";
    const desc = p.description || p.category || "Thiết kế thời trang, dễ phối đồ";
    return `${index + 1}. **${p.name}** - Giá: ${formattedPrice}\n- Mô tả: ${desc}`;
  }).join("\n\n");

  const reply = `Chào bạn, dựa trên yêu cầu "${userMessage}", mình gợi ý các mẫu phù hợp nhé:\n\n${productBullets}`;

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
      return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 🌟 QUAN TRỌNG: Đảm bảo lấy đủ mô tả (description) từ sản phẩm truyền cho AI
    const productsContext = products.map((p, idx) => ({
      index: idx,
      id: p._id?.$oid || p._id || p.id,
      name: p.name || p.title,
      price: p.price,
      description: p.description || p.category || "Giày thời trang cao cấp, form ôm chân thoải mái"
    }));

    const singlePrompt = `
    Bạn là Trợ lý tư vấn bán giày thông minh của cửa hàng Nova Kicks.

    DANH SÁCH SẢN PHẨM (JSON):
    ${JSON.stringify(productsContext)}

    YÊU CẦU: "${userMessage}"

    QUY TẮC BẮT BUỘC:
    1. Chọn ra đúng 2 sản phẩm phù hợp nhất trong danh sách dựa trên yêu cầu.
    2. Với mỗi sản phẩm, BẮT BUỘC phải viết theo đúng cấu trúc nhiều dòng sau đây (không được gom thành 1 dòng):
       [STT]. **[Tên sản phẩm]** - Giá: [Giá]đ
       - Mô tả: [Lấy thông tin mô tả thực tế từ JSON hoặc tự viết thêm chi tiết về chất liệu, kiểu dáng, phong cách]
       - Lý do hợp: [Giải thích vì sao mẫu này phù hợp với yêu cầu của khách]
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
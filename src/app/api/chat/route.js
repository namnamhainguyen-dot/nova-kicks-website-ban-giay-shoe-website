import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  const lowerMsg = userMessage.toLowerCase();
  const matched = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return name.includes(lowerMsg) || desc.includes(lowerMsg);
  });

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
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const productsContext = products.map((p) => ({
      id: String(p._id?.$oid || p._id || p.id),
      name: p.name,
      price: p.price,
      description: p.description || "",
    }));

    const singlePrompt = `
    Bạn là Trợ lý tư vấn bán giày thông minh của cửa hàng Nova Kicks.

    DANH SÁCH SẢN PHẨM (JSON):
    ${JSON.stringify(productsContext)}

    YÊU CẦU CỦA KHÁCH:
    "${userMessage}"

    NHIỆM VỤ:
    1. Đọc kỹ yêu cầu của khách và so khớp thông minh với từng sản phẩm trong danh sách dựa trên tên, danh mục hoặc mô tả. 
    2. NGUYÊN TẮC BẮT BUỘC - ĐỘ KHÁC BIỆT: Các câu hỏi khác nhau (ví dụ: "đi học" khác với "đi tiệc" hoặc "leo núi") PHẢI trả về các tập hợp sản phẩm khác nhau. TUYỆT ĐỐI KHÔNG được trả về cố định một nhóm sản phẩm cho mọi câu hỏi.
    3. Nếu không có sản phẩm nào khớp tuyệt đối, hãy tìm sản phẩm gần đúng nhất và nêu rõ lý do trong câu trả lời. Nếu hoàn toàn không có, hãy để mảng matchedIds rỗng [].
    4. Viết câu trả lời ("reply") ngắn gọn, thân thiện theo đúng mẫu:
       "Chào bạn, gợi ý phù hợp nhất dành cho bạn đây ạ:
       1. **[Tên sản phẩm]** - Giá [Giá]đ ([Lý do ngắn gọn vì sao hợp với yêu cầu]).
       2. **[Tên sản phẩm]** - Giá [Giá]đ ([Lý do ngắn gọn vì sao hợp với yêu cầu])."
    5. Trích xuất chính xác các giá trị định danh của sản phẩm được chọn (ưu tiên lấy _id hoặc id tùy theo cấu trúc JSON của sản phẩm) vào mảng "matchedIds".
    6. ĐỊNH DẠNG ĐẦU RA: Chỉ trả về JSON thuần túy hợp lệ. TUYỆT ĐỐI KHÔNG bọc trong khối code markdown (như \`\`\`json ... \`\`\`), không kèm theo bất kỳ lời chào hay chữ nào khác ngoài cấu trúc JSON sau:
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
      console.warn("⚠️ Lỗi parse JSON từ Gemini, dùng fallback...", e);
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
      }
    }

    // Đảm bảo cấu trúc trả về luôn hợp lệ
    return NextResponse.json({
      reply: parsedData.reply || "Dưới đây là các sản phẩm phù hợp với bạn:",
      matchedIds: Array.isArray(parsedData.matchedIds) ? parsedData.matchedIds.map(String) : []
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Lỗi API Chatbot:", error);
    return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
  }
}
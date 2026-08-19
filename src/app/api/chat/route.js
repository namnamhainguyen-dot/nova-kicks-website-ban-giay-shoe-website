import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackResponse(userMessage, products = []) {
  const lowerMsg = userMessage.toLowerCase();
  const matched = products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return name.includes(lowerMsg) || desc.includes(lowerMsg);
  });

  const targetProducts = matched.length > 0 ? matched : products;
  const matchedIds = targetProducts.map((p) => p._id?.$oid || p._id || p.id).filter(Boolean);

  // Tạo danh sách dạng liệt kê giống mẫu bạn muốn khi fallback
  const productBullets = targetProducts.slice(0, 5).map((p, index) => {
    const formattedPrice = p.price ? p.price.toLocaleString("vi-VN") + "đ" : "Liên hệ";
    return `${index + 1}. **${p.name}** - Giá ${formattedPrice}, ${p.description || "Thiết kế phù hợp với nhu cầu của bạn."}`;
  }).join("\n\n");

  const reply = `Chào bạn, dựa trên yêu cầu "${userMessage}", mình gợi ý một số mẫu giày phù hợp sau nhé:\n\n${productBullets}`;

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

    const productsContext = products.map((p) => ({
      id: String(p._id?.$oid || p._id || p.id),
      name: p.name,
      price: p.price,
      description: p.description || "",
      sizes: p.availableSizes || p.displaySizes || p.sizes || [],
    }));

    const formattedHistory = history
      .map((h) => {
        const role = h.role === "assistant" || h.role === "model" ? "Trợ lý" : "Khách hàng";
        const content = typeof h.content === "string" ? h.content : (h.parts?.[0]?.text || h.message || "");
        return `${role}: ${content}`;
      })
      .join("\n");

    const singlePrompt = `
    Bạn là Trợ lý tư vấn bán giày chuyên nghiệp, thân thiện và am hiểu thời trang của cửa hàng Nova Kicks.

    DANH SÁCH SẢN PHẨM GỢI Ý (JSON):
    ${JSON.stringify(productsContext)}

    LỊCH SỬ TRÒ CHUYỆN:
    ${formattedHistory || "(Chưa có lịch sử)"}

    YÊU CẦU MỚI NHẤT CỦA KHÁCH:
    "${userMessage}"

    NHIỆM VỤ VÀ QUY TẮC TRÌNH BÀY:
    1. Đọc kỹ nhu cầu của khách hàng. Hãy mở đầu câu trả lời bằng một lời chào thân thiện, nhận xét ngắn gọn, tâm lý và tự nhiên (Ví dụ: "Chào bạn! Chọn giày đi chơi/đi học là một ý hay đấy. Mình gợi ý vài mẫu giày phù hợp với phong cách của bạn nhé:").
    2. Liệt kê các sản phẩm theo đúng cấu trúc đánh số, trong đó **Tên sản phẩm phải được in đậm** và kèm theo mô tả chi tiết, cuốn hút về chất liệu, kiểu dáng hoặc dịp sử dụng phù hợp, kèm giá tiền rõ ràng:
       1. **[Tên sản phẩm]** - [Mô tả chi tiết về điểm nổi bật, chất liệu hoặc phong cách], rất hợp cho [dịp sử dụng] với mức giá **[Giá sản phẩm]đ**.
       2. **[Tên sản phẩm]** - [Mô tả chi tiết...], giá **[Giá sản phẩm]đ**.
    3. Trích xuất chính xác ID của các sản phẩm có mặt trong danh sách gợi ý trên vào mảng "matchedIds".
    4. Chỉ trả về JSON thuần túy theo cấu trúc:
    {
      "reply": "Chào bạn! ...\n\n1. **Tên** - Mô tả..., giá ...\n2. **Tên** - Mô tả..., giá ...",
      "matchedIds": ["id1", "id2", ...]
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
    return NextResponse.json(buildFallbackResponse(userMessage, products), { status: 200 });
  }
}
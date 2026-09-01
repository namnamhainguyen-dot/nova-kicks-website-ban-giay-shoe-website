import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// =======================================================
// FALLBACK MODERATION
// Dùng khi Gemini không hoạt động
// =======================================================

const bannedWords = [
  "đụ",
  "đm",
  "đmm",
  "đcm",
  "đéo",
  "địt",
  "dit",
  "dm",
  "dmm",
  "dcm",
  "deo",
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "motherfucker",
];

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[@4]/g, "a")
    .replace(/[!1|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/\$/g, "s")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// =======================================================
// FALLBACK CHECK
// =======================================================

function fallbackCheck(text) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return {
      blocked: false,
      reason: "empty",
      message: "Không có nội dung để kiểm tra.",
    };
  }

  const words = normalized.split(/\s+/);

  for (const word of bannedWords) {
    const normalizedWord = normalizeText(word);

    // Kiểm tra từng từ
    if (words.includes(normalizedWord)) {
      return {
        blocked: true,
        reason: "bad_language",
        message:
          "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại trước khi gửi.",
      };
    }

    // Kiểm tra trường hợp từ bị dính vào nhau
    if (
      normalizedWord.length >= 3 &&
      normalized.includes(normalizedWord)
    ) {
      return {
        blocked: true,
        reason: "bad_language",
        message:
          "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại trước khi gửi.",
      };
    }
  }

  return {
    blocked: false,
    reason: "safe",
    message: "Nội dung hợp lệ.",
  };
}

// =======================================================
// POST - KIỂM TRA NỘI DUNG
// =======================================================

export async function POST(req) {
  let text = "";

  try {
    // ===================================================
    // ĐỌC REQUEST
    // ===================================================

    const body = await req.json();

    text = String(body?.text || "").trim();

    if (!text) {
      return NextResponse.json(
        {
          blocked: false,
          reason: "empty",
          message: "Không có nội dung để kiểm tra.",
        },
        { status: 200 }
      );
    }

    // ===================================================
    // LẤY API KEY
    // ===================================================

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    // ===================================================
    // KHÔNG CÓ API KEY
    // → FALLBACK
    // ===================================================

    if (!apiKey) {
      console.warn(
        "⚠️ Không tìm thấy GEMINI_API_KEY hoặc GOOGLE_API_KEY."
      );

      console.warn(
        "⚠️ Đang sử dụng fallback moderation."
      );

      return NextResponse.json(
        fallbackCheck(text),
        { status: 200 }
      );
    }

    // ===================================================
    // KHỞI TẠO GEMINI
    // ===================================================

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    // ===================================================
    // PROMPT
    // ===================================================

    const prompt = `
Bạn là hệ thống kiểm duyệt nội dung cho website bán giày Nova Kicks.

Hãy kiểm tra nội dung khách hàng gửi.

NỘI DUNG:
${JSON.stringify(text)}

Hãy phát hiện:

- Chửi tục
- Xúc phạm
- Lăng mạ
- Từ ngữ thô tục
- Nội dung khiêu dâm rõ ràng
- Đe dọa
- Công kích người khác
- Các cách viết né kiểm duyệt

Ví dụ:

"đ.m"
"đ!t"
"d m"
"d.m"
"dm"
"đm"
"f*ck"
"f**k"
"sh!t"

Không chặn các câu bình thường chỉ vì một từ có thể mang nhiều nghĩa.

Nếu nội dung không vi phạm:

{
  "blocked": false,
  "reason": "safe",
  "message": "Nội dung hợp lệ."
}

Nếu nội dung vi phạm:

{
  "blocked": true,
  "reason": "bad_language",
  "message": "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại trước khi gửi."
}

CHỈ trả về JSON.
Không sử dụng markdown.
Không thêm giải thích.
`;

    // ===================================================
    // GỌI GEMINI
    // ===================================================

    let result;

    try {
      result = await model.generateContent(prompt);
    } catch (geminiError) {
      console.error(
        "❌ GEMINI MODERATION ERROR:",
        geminiError?.message || geminiError
      );

      console.warn(
        "⚠️ Gemini không hoạt động → chuyển sang fallback moderation."
      );

      return NextResponse.json(
        fallbackCheck(text),
        { status: 200 }
      );
    }

    // ===================================================
    // LẤY RESPONSE
    // ===================================================

    let responseText = "";

    try {
      responseText = result?.response?.text?.()?.trim() || "";
    } catch (responseError) {
      console.error(
        "❌ Không thể đọc response Gemini:",
        responseError
      );

      return NextResponse.json(
        fallbackCheck(text),
        { status: 200 }
      );
    }

    // ===================================================
    // GEMINI KHÔNG TRẢ VỀ NỘI DUNG
    // ===================================================

    if (!responseText) {
      console.warn(
        "⚠️ Gemini không trả về nội dung → fallback."
      );

      return NextResponse.json(
        fallbackCheck(text),
        { status: 200 }
      );
    }

    // ===================================================
    // LOẠI BỎ MARKDOWN
    // ===================================================

    responseText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // ===================================================
    // PARSE JSON
    // ===================================================

    let parsed;

    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "❌ Gemini trả về JSON không hợp lệ:"
      );

      console.error(responseText);

      return NextResponse.json(
        fallbackCheck(text),
        { status: 200 }
      );
    }

    // ===================================================
    // CHUẨN HÓA KẾT QUẢ
    // ===================================================

    const blocked = Boolean(parsed?.blocked);

    return NextResponse.json(
      {
        blocked,

        reason: blocked
          ? "bad_language"
          : "safe",

        message:
          typeof parsed?.message === "string" &&
          parsed.message.trim()
            ? parsed.message.trim()
            : blocked
            ? "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại trước khi gửi."
            : "Nội dung hợp lệ.",
      },
      { status: 200 }
    );
  } catch (error) {
    // ===================================================
    // LỖI TOÀN BỘ API
    // → KHÔNG TRẢ 500
    // ===================================================

    console.error(
      "❌ MODERATION API ERROR:",
      error?.message || error
    );

    // Luôn fallback nếu server/Gemini có vấn đề
    return NextResponse.json(
      fallbackCheck(text),
      { status: 200 }
    );
  }
}

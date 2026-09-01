import { GoogleGenerativeAI } from "@google/generative-ai";

// =======================================================
// DANH SÁCH TỪ KHÓA CƠ BẢN
// =======================================================

const BAD_WORDS = [
  "địt",
  "đm",
  "đmm",
  "đcm",
  "đcmm",
  "đụ",
  "đéo",
  "đell",
  "đek",
  "dcm",
  "dmm",
  "vcl",
  "vl",
  "clm",
  "clgt",
  "cc",
  "cặc",
  "lồn",
  "buồi",
  "mẹ mày",
  "mẹ nó",
  "con chó",
  "chó chết",
  "đĩ",
  "điếm",
  "ngu",
  "óc chó",
  "súc vật",
  "khốn nạn",
  "mất dạy",
];

// =======================================================
// CHUẨN HÓA TEXT
// Ví dụ:
// "Đ.M"       -> "dm"
// "Đ M"       -> "dm"
// "Địt"       -> "dit"
// "ĐÉO"       -> "deo"
// =======================================================

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =======================================================
// KIỂM TRA KEYWORD
// =======================================================

function checkBadWords(text = "") {
  const normalizedText = normalizeText(text);

  // Tạo thêm phiên bản bỏ toàn bộ khoảng trắng
  // để bắt các trường hợp:
  // "d m", "d.m", "d-m"
  const compactText = normalizedText.replace(/\s/g, "");

  for (const word of BAD_WORDS) {
    const normalizedWord = normalizeText(word);

    const compactWord = normalizedWord.replace(/\s/g, "");

    // Kiểm tra dạng thông thường
    if (
      normalizedText === normalizedWord ||
      normalizedText.includes(` ${normalizedWord} `) ||
      normalizedText.startsWith(`${normalizedWord} `) ||
      normalizedText.endsWith(` ${normalizedWord}`)
    ) {
      return {
        blocked: true,
        reason: "Nội dung chứa từ ngữ không phù hợp.",
        method: "keyword",
      };
    }

    // Kiểm tra dạng viết liền / né bằng dấu cách
    if (compactText.includes(compactWord)) {
      return {
        blocked: true,
        reason: "Nội dung chứa từ ngữ không phù hợp.",
        method: "keyword",
      };
    }
  }

  return {
    blocked: false,
    reason: "",
    method: "keyword",
  };
}

// =======================================================
// KIỂM TRA BẰNG GEMINI
// =======================================================

async function checkWithGemini(text) {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  // Nếu chưa cấu hình Gemini thì sử dụng keyword filter
  if (!apiKey) {
    return {
      blocked: false,
      reason: "",
      method: "fallback",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
Bạn là hệ thống kiểm duyệt nội dung cho website bán giày Nova Kicks.

Hãy kiểm tra nội dung người dùng gửi:

"${text}"

Hãy phát hiện:

1. Từ chửi tục.
2. Từ ngữ thô tục.
3. Xúc phạm người khác.
4. Lăng mạ.
5. Nội dung tục tĩu.
6. Cố tình viết sai chính tả để né kiểm duyệt.
7. Viết không dấu.
8. Viết tắt.
9. Chèn dấu cách hoặc ký tự đặc biệt để né bộ lọc.

Ví dụ cần phát hiện:
- đm
- dcm
- địt
- đéo
- lồn
- cặc
- vcl
- đ m
- d.m
- d-m

KHÔNG chặn những nội dung phàn nàn lịch sự như:
- Sản phẩm giao chậm.
- Tôi không hài lòng.
- Shop phục vụ chưa tốt.
- Tôi muốn đổi sản phẩm.
- Sản phẩm bị lỗi.

Chỉ blocked=true khi nội dung thực sự chứa ngôn ngữ tục tĩu hoặc xúc phạm.

Chỉ trả về JSON:

{
  "blocked": true,
  "reason": "Nội dung chứa từ ngữ không phù hợp"
}

hoặc:

{
  "blocked": false,
  "reason": ""
}
`;

    const result = await model.generateContent(prompt);

    let responseText = result.response.text().trim();

    // Loại bỏ markdown nếu Gemini trả về
    responseText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    const data = JSON.parse(responseText);

    return {
      blocked: Boolean(data.blocked),
      reason: data.reason || "",
      method: "gemini",
    };
  } catch (error) {
    console.error("❌ Gemini moderation error:", error);

    // Gemini lỗi thì không làm website crash
    return {
      blocked: false,
      reason: "",
      method: "fallback",
    };
  }
}

// =======================================================
// HÀM CHÍNH
// =======================================================

export async function checkModeration(text = "") {
  if (!text || !text.trim()) {
    return {
      blocked: false,
      reason: "",
      method: "empty",
    };
  }

  // -----------------------------------------------
  // Bước 1: Keyword
  // -----------------------------------------------

  const keywordResult = checkBadWords(text);

  if (keywordResult.blocked) {
    return keywordResult;
  }

  // -----------------------------------------------
  // Bước 2: Gemini
  // -----------------------------------------------

  return await checkWithGemini(text);
}
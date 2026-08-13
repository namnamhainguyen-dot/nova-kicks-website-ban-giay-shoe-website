import { NextResponse } from "next/server";

// Giả sử đây là mảng lưu tin nhắn tạm thời hoặc kết nối MongoDB/Database
let messagesDatabase = []; 

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  // Nếu Client truyền sessionId, chỉ lọc tin nhắn của đúng Session đó
  if (sessionId) {
    const sessionMessages = messagesDatabase.filter((m) => m.sessionId === sessionId);
    return NextResponse.json(sessionMessages);
  }

  // Phía Admin (không truyền sessionId): Nhóm tin nhắn theo sessionId để trả về danh sách hội thoại
  const conversationsMap = {};

  messagesDatabase.forEach((msg) => {
    if (!conversationsMap[msg.sessionId]) {
      conversationsMap[msg.sessionId] = {
        sessionId: msg.sessionId,
        user: msg.user || "Khách hàng",
        time: msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        messages: [],
      };
    }
    // Cập nhật tên mới nhất nếu tin nhắn do 'user' gửi
    if (msg.sender === "user" && msg.user) {
      conversationsMap[msg.sessionId].user = msg.user;
    }
    conversationsMap[msg.sessionId].messages.push(msg);
  });

  return NextResponse.json(Object.values(conversationsMap));
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, user, sender, text, mode } = body;

    const newMessage = {
      id: Date.now(),
      sessionId,
      user: user || "Khách hàng",
      sender, // 'user', 'admin', hoặc 'bot'
      text,
      mode,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    messagesDatabase.push(newMessage);

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi lưu tin nhắn" }, { status: 500 });
  }
}
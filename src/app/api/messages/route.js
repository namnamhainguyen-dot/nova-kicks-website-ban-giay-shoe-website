import { NextResponse } from "next/server";

// GIẢ LẬP DATABASE (Trong thực tế, bạn sẽ dùng Mongoose/Prisma để query DB thật ở đây)
// Cấu trúc: { sessionId: "id_khach_hang", user: "Tên khách", messages: [{ sender: "user" | "admin", text: "..." }] }
let mockDatabase = []; 

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  // Nếu Khách gọi (có sessionId) -> Trả về tin nhắn của khách đó
  if (sessionId) {
    const chat = mockDatabase.find(c => c.sessionId === sessionId);
    return NextResponse.json(chat ? chat.messages : []);
  }

  // Nếu Admin gọi (không truyền sessionId) -> Trả về toàn bộ danh sách khách đang chat
  return NextResponse.json(mockDatabase);
}

export async function POST(req) {
  try {
    const { sessionId, user, sender, text } = await req.json();

    let chat = mockDatabase.find(c => c.sessionId === sessionId);
    
    // Nếu khách chưa từng chat, tạo phiên chat mới
    if (!chat) {
      chat = {
        sessionId,
        user: user || "Khách Ẩn Danh",
        time: new Date().toLocaleTimeString(),
        messages: []
      };
      mockDatabase.push(chat);
    }

    // Thêm tin nhắn mới vào cuộc hội thoại
    const newMessage = { id: Date.now(), sender, text };
    chat.messages.push(newMessage);
    chat.time = new Date().toLocaleTimeString(); // Cập nhật thời gian mới nhất

    return NextResponse.json({ success: true, newMessage });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
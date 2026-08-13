import { NextResponse } from "next/server";
import clientPromise, { dbName } from "@/libs/mongodb";

// GET: Lấy tin nhắn theo sessionId (cho Client) hoặc lấy toàn bộ danh sách hội thoại (cho Admin)
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("messages");

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // 1. Trường hợp Khách hàng lấy tin nhắn của chính mình
    if (sessionId) {
      const messages = await collection
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .toArray();

      return NextResponse.json(messages);
    }

    // 2. Trường hợp Admin lấy tất cả danh sách cuộc hội thoại
    const conversations = await collection
      .aggregate([
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: "$sessionId",
            sessionId: { $first: "$sessionId" },
            user: { $last: "$user" },
            time: {
              $last: {
                $dateToString: {
                  format: "%H:%M",
                  date: "$createdAt",
                  timezone: "Asia/Ho_Chi_Minh",
                },
              },
            },
            messages: {
              $push: {
                id: "$_id",
                sender: "$sender",
                text: "$text",
                mode: "$mode",
                createdAt: "$createdAt",
              },
            },
            updatedAt: { $last: "$createdAt" },
          },
        },
        { $sort: { updatedAt: -1 } },
      ])
      .toArray();

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Lỗi GET /api/messages:", error);
    return NextResponse.json({ error: "Lỗi kết nối CSDL" }, { status: 500 });
  }
}

// POST: Lưu tin nhắn mới vào MongoDB
export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, user, sender, text, mode } = body;

    if (!sessionId || !text) {
      return NextResponse.json({ error: "Thiếu dữ liệu bắt buộc" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);

    const newMessage = {
      sessionId,
      user: user || "Khách hàng",
      sender: sender || "user", // "user" | "bot" | "admin"
      text,
      mode: mode || "bot", // "bot" | "admin"
      createdAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(newMessage);

    return NextResponse.json({ success: true, id: result.insertedId, ...newMessage }, { status: 201 });
  } catch (error) {
    console.error("Lỗi POST /api/messages:", error);
    return NextResponse.json({ error: "Không thể lưu tin nhắn" }, { status: 500 });
  }
}
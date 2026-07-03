import clientPromise from "@/libs/mongodb";
import { NextResponse } from "next/server";

// GET: Lấy danh sách bài viết
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks"); // Tên database của bạn

    const newsList = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 }) // Bài mới nhất lên đầu
      .toArray();

    return NextResponse.json({ success: true, data: newsList });
  } catch (error) {
    console.error("Lỗi API GET news:", error);
    return NextResponse.json({ success: false, error: "Lỗi kết nối máy chủ" }, { status: 500 });
  }
}
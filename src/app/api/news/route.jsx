import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/libs/mongodb"; // Hoặc đường dẫn trỏ tới file clientPromise của bạn

export const maxDuration = 60; // Tăng timeout cho Vercel Serverless Function

// Hàm hỗ trợ kết nối database và lấy collection "news"
async function getNewsCollection() {
  const client = await clientPromise;
  const db = client.db(); // Lấy database mặc định từ connection string
  return db.collection("news");
}

// 1. LẤY BÀI VIẾT (GET)
export async function GET(request) {
  try {
    const collection = await getNewsCollection();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isAdmin = searchParams.get("admin");

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "ID bài viết không hợp lệ" },
          { status: 400 }
        );
      }
      
      const article = await collection.findOne({ _id: new ObjectId(id) });
      if (!article) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy bài viết" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: article });
    }

    const filter = isAdmin === "true" ? {} : { isHidden: { $ne: true } };
    const news = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error("Lỗi GET /api/news:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi Server: " + error.message },
      { status: 500 }
    );
  }
}

// 2. CẬP NHẬT BÀI VIẾT (PUT)
export async function PUT(request) {
  try {
    const collection = await getNewsCollection();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Loại bỏ các trường hệ thống không được phép ghi đè trực tiếp
    delete body._id;
    delete body.__v;
    delete body.updatedAt;

    // Chuyển đổi định dạng ngày nếu có gửi lên
    if (body.createdAt) {
      body.createdAt = new Date(body.createdAt);
    }

    // Tự động cập nhật thời gian sửa
    body.updatedAt = new Date();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: body },
      { returnDocument: "after" }
    );

    // Xử lý tùy theo cấu trúc trả về của driver
    const updatedArticle = result.value || result;

    if (!updatedArticle) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết trong CSDL" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedArticle });
  } catch (error) {
    console.error("Lỗi Server PUT /api/news:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi Server DB: " + error.message },
      { status: 500 }
    );
  }
}

// 3. XÓA BÀI VIẾT (DELETE)
export async function DELETE(request) {
  try {
    const collection = await getNewsCollection();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết để xóa" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa bài viết thành công",
    });
  } catch (error) {
    console.error("Lỗi DELETE /api/news:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi Server: " + error.message },
      { status: 500 }
    );
  }
}
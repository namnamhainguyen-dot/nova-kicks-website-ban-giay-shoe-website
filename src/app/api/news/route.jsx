import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import News from "@/models/News";

// 1. LẤY DỮ LIỆU BÀI VIẾT (GET)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isAdmin = searchParams.get("admin"); // Kiểm tra xem yêu cầu đến từ trang Admin hay không

    // Lấy chi tiết 1 bài viết theo ID
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "ID bài viết không đúng định dạng!" },
          { status: 400 }
        );
      }

      const article = await News.findById(id);
      if (!article) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy bài viết!" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: article });
    }

    // Lấy danh sách bài viết:
    // - Trang Admin (admin=true): Lấy tất cả bài viết (kể cả bị ẩn)
    // - Trang Người dùng: Chỉ lấy bài viết KHÔNG BỊ ẨN (isHidden: false hoặc không có thuộc tính isHidden)
    const filter = isAdmin === "true" ? {} : { isHidden: { $ne: true } };

    const newsList = await News.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: newsList });

  } catch (error) {
    console.error("Lỗi API News GET:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi Server: " + error.message },
      { status: 500 }
    );
  }
}

// 2. THÊM BÀI VIẾT MỚI (POST)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề và nội dung bài viết không được để trống!" },
        { status: 400 }
      );
    }

    // Tạo bài viết mới (mặc định isHidden = false nếu không truyền)
    const newArticle = await News.create({
      ...body,
      isHidden: body.isHidden ?? false,
    });

    return NextResponse.json({ success: true, data: newArticle }, { status: 201 });
  } catch (error) {
    console.error("Lỗi API News POST:", error);
    return NextResponse.json(
      { success: false, error: "Không thể thêm bài viết: " + error.message },
      { status: 500 }
    );
  }
}

// 3. CẬP NHẬT / ẨN BÀI VIẾT (PUT)
export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không hợp lệ!" },
        { status: 400 }
      );
    }

    const updatedArticle = await News.findByIdAndUpdate(id, body, { new: true });

    if (!updatedArticle) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết để cập nhật!" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedArticle });
  } catch (error) {
    console.error("Lỗi API News PUT:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật bài viết: " + error.message },
      { status: 500 }
    );
  }
}

// 4. XÓA BÀI VIẾT (DELETE)
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không hợp lệ!" },
        { status: 400 }
      );
    }

    await News.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Đã xóa bài viết thành công!" });
  } catch (error) {
    console.error("Lỗi API News DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa bài viết: " + error.message },
      { status: 500 }
    );
  }
}
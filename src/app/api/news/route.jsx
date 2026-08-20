import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/libs/mongodb";
import News from "@/models/News";

export const maxDuration = 60; // Tăng timeout cho Vercel Serverless Function

// 1. LẤY BÀI VIẾT (GET)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isAdmin = searchParams.get("admin");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "ID bài viết không hợp lệ" },
          { status: 400 }
        );
      }
      const article = await News.findById(id);
      if (!article) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy bài viết" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: article });
    }

    const filter = isAdmin === "true" ? {} : { isHidden: { $ne: true } };
    const news = await News.find(filter).sort({ createdAt: -1 });

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
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // LOẠI BỎ CÁC TRƯỜNG CẤM CỦA MONGOOSE (Khắc phục nguyên nhân lỗi Status 500)
    delete body._id;
    delete body.__v;
    delete body.updatedAt;

    // Chuyển đổi định dạng ngày nếu có gửi lên
    if (body.createdAt) {
      body.createdAt = new Date(body.createdAt);
    }

    const updatedArticle = await News.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

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
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    await News.findByIdAndDelete(id);
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
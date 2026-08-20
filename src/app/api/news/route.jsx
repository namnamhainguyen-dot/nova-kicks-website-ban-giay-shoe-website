import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import News from "@/models/News";

// Tăng maxDuration lên tối đa (Vercel Hobby cho phép 10s-60s)
export const maxDuration = 60;

export async function PUT(request) {
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

    const body = await request.json();

    // Loại bỏ các trường tự sinh của MongoDB khỏi body để tránh lỗi update
    delete body._id;
    delete body.__v;

    const updatedArticle = await News.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedArticle) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết để cập nhật!" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedArticle });
  } catch (error) {
    console.error("Lỗi API PUT News:", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật bài viết: " + error.message },
      { status: 500 }
    );
  }
}
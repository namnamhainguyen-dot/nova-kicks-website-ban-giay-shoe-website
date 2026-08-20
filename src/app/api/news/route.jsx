import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import News from "@/models/News";

export const maxDuration = 60; // Tăng timeout cho Vercel

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isAdmin = searchParams.get("admin");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, error: "ID không hợp lệ" }, { status: 400 });
      }
      const article = await News.findById(id);
      return NextResponse.json({ success: true, data: article });
    }

    // Nếu không phải admin thì lọc bỏ các bài đang ẩn
    const filter = isAdmin === "true" ? {} : { isHidden: { $ne: true } };
    const news = await News.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "ID bài viết không hợp lệ" }, { status: 400 });
    }

    const body = await request.json();

    // LOẠI BỎ _id VÀ __v KHỎI BODY CẬP NHẬT (Tránh lỗi Mongoose "Immutable Field")
    const { _id, __v, ...updateData } = body;

    const updatedArticle = await News.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedArticle) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedArticle });
  } catch (error) {
    console.error("Lỗi API PUT News:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi Server: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "ID không hợp lệ" }, { status: 400 });
    }

    await News.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Đã xóa bài viết thành công" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
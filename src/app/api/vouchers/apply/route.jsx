import { NextResponse } from "next/server";
import mongoose from "mongoose";

const Voucher = mongoose.models.Voucher || mongoose.model("Voucher", new mongoose.Schema({
  code: String, discount_type: String, discount_value: Number, min_order_value: Number, is_active: Boolean
}));

export async function POST(req) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ success: false, message: "Vui lòng nhập mã giảm giá!" }, { status: 400 });
    }

    // Tìm voucher dựa trên mã khách nhập
    const voucher = await Voucher.findOne({ code: code.trim().toUpperCase() });

    if (!voucher) {
      return NextResponse.json({ success: false, message: "Mã giảm giá không tồn tại hoặc đã nhập sai!" }, { status: 404 });
    }

    if (voucher.is_active === false) {
      return NextResponse.json({ success: false, message: "Mã giảm giá này hiện đã bị vô hiệu hóa!" }, { status: 400 });
    }

    // Trả thẳng dữ liệu voucher về cho client
    return NextResponse.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công!",
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_order_value: voucher.min_order_value || 0
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi kết nối kiểm tra mã!" }, { status: 500 });
  }
}
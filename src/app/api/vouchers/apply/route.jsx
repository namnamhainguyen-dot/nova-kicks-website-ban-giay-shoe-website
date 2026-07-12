import { NextResponse } from "next/server";
import mongoose from "mongoose";

// ĐỒNG BỘ: Định nghĩa Schema giống hệt với file Admin
const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true },
  discount_type: String,
  discount_value: Number,
  min_order_value: Number,
  is_active: Boolean,
  expiry_date: Date,
  used_count: { type: Number, default: 0 },
  usage_limit: { type: Number, default: 0 },
  description: String
}, { timestamps: true });

// Sử dụng model 'Voucher' từ mongoose.models để tránh xung đột
const Voucher = mongoose.models.Voucher || mongoose.model("Voucher", VoucherSchema);

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

    const voucher = await Voucher.findOne({ code: code.trim().toUpperCase() });

    if (!voucher) {
      return NextResponse.json({ success: false, message: "Mã giảm giá không tồn tại!" }, { status: 404 });
    }

    if (voucher.is_active === false) {
      return NextResponse.json({ success: false, message: "Mã giảm giá đã bị vô hiệu hóa!" }, { status: 400 });
    }

    // THÊM: Kiểm tra số lần sử dụng ở đây
    if (voucher.used_count >= voucher.usage_limit) {
      return NextResponse.json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng!" }, { status: 400 });
    }

    // Trả về đầy đủ dữ liệu
    return NextResponse.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công!",
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_order_value: voucher.min_order_value || 0
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống!" }, { status: 500 });
  }
}
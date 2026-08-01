import { NextResponse } from "next/server";
import mongoose from "mongoose";

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

    // 1. Kiểm tra ngày hết hạn
    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      return NextResponse.json({ success: false, message: "Mã giảm giá đã hết hạn!" }, { status: 400 });
    }

    // 2. Chỉ kiểm tra giới hạn KHI usage_limit > 0 (0 tức là vô hạn)
    if (voucher.usage_limit > 0 && (voucher.used_count || 0) >= voucher.usage_limit) {
      return NextResponse.json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng!" }, { status: 400 });
    }

    // 3. TĂNG DỮ LIỆU `used_count` TRONG DATABASE
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      voucher._id,
      { $inc: { used_count: 1 } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công!",
      code: updatedVoucher.code,
      discount_type: updatedVoucher.discount_type,
      discount_value: updatedVoucher.discount_value,
      min_order_value: updatedVoucher.min_order_value || 0,
      used_count: updatedVoucher.used_count
    }, { status: 200 });

  } catch (error) {
    console.error("Lỗi apply voucher:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống!" }, { status: 500 });
  }
}
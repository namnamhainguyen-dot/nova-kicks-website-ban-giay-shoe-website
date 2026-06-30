import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Định nghĩa Schema (Thay thế bằng Model thực tế của bạn nếu cần)
const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount_type: { type: String, required: true }, 
  discount_value: { type: Number, required: true },
  min_order_value: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

const Voucher = mongoose.models.Voucher || mongoose.model("Voucher", VoucherSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

// GET: Lấy danh sách voucher cho Admin xem
export async function GET() {
  try {
    await connectDB();
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    return NextResponse.json(vouchers, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

// POST: Chỉ dành riêng cho Admin bấm nút TẠO MỚI voucher
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.code) {
      return NextResponse.json({ success: false, message: "Mã giảm giá không được trống" }, { status: 400 });
    }

    const discount_type = body.discount_type || body.type;
    const discount_value = body.discount_value !== undefined ? body.discount_value : (body.value || body.discount);

    if (!discount_type || discount_value === undefined) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin loại hoặc giá trị giảm giá!" }, { status: 400 });
    }

    const formattedCode = body.code.trim().toUpperCase();
    const existingVoucher = await Voucher.findOne({ code: formattedCode });
    if (existingVoucher) {
      return NextResponse.json({ success: false, message: "Mã giảm giá này đã tồn tại!" }, { status: 400 });
    }

    const newVoucher = await Voucher.create({
      ...body,
      code: formattedCode,
      discount_type,
      discount_value: Number(discount_value),
      min_order_value: Number(body.min_order_value || body.minValue || 0)
    });

    return NextResponse.json({ success: true, message: "Tạo voucher mới thành công!", data: newVoucher }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}
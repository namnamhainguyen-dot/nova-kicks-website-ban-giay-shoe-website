import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Định nghĩa Schema đầy đủ các trường
const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discount_type: { type: String, required: true }, 
  discount_value: { type: Number, required: true },
  max_discount_amount: { type: Number, default: null },
  min_order_value: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  start_date: { type: Date, default: null },
  expiry_date: { type: Date, default: null }, // Hoặc end_date
  used_count: { type: Number, default: 0 },
  usage_limit: { type: Number, default: 0 },
  description: { type: String, default: "Không có mô tả" },
}, { timestamps: true });

const Voucher = mongoose.models.Voucher || mongoose.model("Voucher", VoucherSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

// GET: Lấy danh sách voucher cho Admin và Checkout xem
export async function GET() {
  try {
    await connectDB();
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    return NextResponse.json(vouchers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Tạo mới voucher
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
      max_discount_amount: body.max_discount_amount ? Number(body.max_discount_amount) : null,
      min_order_value: Number(body.min_order_value || body.minValue || 0),
      start_date: body.start_date ? new Date(body.start_date) : null,
      expiry_date: body.expiry_date ? new Date(body.expiry_date) : (body.end_date ? new Date(body.end_date) : null),
      usage_limit: Number(body.usage_limit || 0),
      is_active: body.is_active !== undefined ? body.is_active : true,
      description: body.description ? body.description.trim() : "Không có mô tả",
    });

    return NextResponse.json({ success: true, message: "Tạo voucher mới thành công!", data: newVoucher }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}
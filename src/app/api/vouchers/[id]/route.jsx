import { NextResponse } from "next/server";
import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";

// GET: Lấy chi tiết 1 voucher để sửa
export async function GET(request, { params }) {
  try {
    const { id } = await params; // Đảm bảo có await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "ID không đúng định dạng!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    const voucher = await db.collection("vouchers").findOne({ _id: new ObjectId(id) });
    if (!voucher) {
      return NextResponse.json({ success: false, message: "Không tìm thấy voucher!" }, { status: 404 });
    }

    return NextResponse.json(voucher, { status: 200 });
  } catch (error) {
    console.error("Lỗi API GET Chi tiết:", error);
    return NextResponse.json({ success: false, message: "Lỗi server!" }, { status: 500 });
  }
}

// PUT: Cập nhật thông tin voucher
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "ID không hợp lệ!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Chỉ cập nhật các trường được gửi lên, ép kiểu chuẩn dữ liệu
    const updateData = {};
    if (body.code) updateData.code = body.code.trim().toUpperCase();
    if (body.discount_type) updateData.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updateData.discount_value = Number(body.discount_value);
    if (body.min_order_value !== undefined) updateData.min_order_value = Number(body.min_order_value);
    if (body.max_discount_amount !== undefined) updateData.max_discount_amount = body.max_discount_amount ? Number(body.max_discount_amount) : null;
    if (body.usage_limit !== undefined) updateData.usage_limit = Number(body.usage_limit);
    if (body.expiry_date) updateData.expiry_date = new Date(body.expiry_date);
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.description !== undefined) updateData.description = body.description.trim();

    const result = await db.collection("vouchers").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: "Cập nhật voucher thành công!" }, { status: 200 });
  } catch (error) {
    console.error("Lỗi API PUT Voucher:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống khi cập nhật!" }, { status: 500 });
  }
}

// DELETE: Xóa voucher
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "ID không hợp lệ!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    await db.collection("vouchers").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: "Xóa voucher thành công!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi xóa voucher!" }, { status: 500 });
  }
}
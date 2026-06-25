import clientPromise from "@/libs/mongodb";

export async function POST(request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return Response.json({ success: false, message: "Vui lòng nhập mã giảm giá!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Nova-kicks");

    // Tìm voucher trong collection "vouchers"
    const voucher = await db.collection("vouchers").findOne({
      code: code.trim().toUpperCase(),
    });
    if (!voucher) {
      return Response.json({ success: false, message: "Mã giảm giá không tồn tại!" });
    }

    // Kiểm tra hạn sử dụng
    const now = new Date();
    if (voucher.expiry_date && new Date(voucher.expiry_date) < now) {
      return Response.json({ success: false, message: "Mã giảm giá này đã hết hạn sử dụng!" });
    }

    // Kiểm tra số lượng lượt dùng còn lại
    if (voucher.usage_limit !== undefined && voucher.usage_limit <= 0) {
      return Response.json({ success: false, message: "Mã giảm giá này đã hết lượt sử dụng!" });
    }

    return Response.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công!",
      discount_type: voucher.discount_type, // "fixed" (trừ tiền thẳng) hoặc "percentage" (% giảm)
      discount_value: voucher.discount_value, // số tiền hoặc số %
      min_order_value: voucher.min_order_value || 0 // giá trị đơn hàng tối thiểu để áp dụng
    });

  } catch (error) {
    console.error("Lỗi API Voucher:", error);
    return Response.json({ success: false, message: "Lỗi hệ thống!" }, { status: 500 });
  }
}
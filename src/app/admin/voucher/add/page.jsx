"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddVoucher() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "fixed", 
    discount_value: "",
    min_order_value: "",
    max_discount_amount: "",
    usage_limit: 100,
    start_date: "", // 🌟 Bổ sung ngày bắt đầu
    expiry_date: "",
    is_active: true,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // 🛡️ KIỂM TRA RÀNG BUỘC DỮ LIỆU (VALIDATION)
    // ==========================================
    const discountVal = Number(formData.discount_value);
    const minOrderVal = formData.min_order_value ? Number(formData.min_order_value) : 0;
    const maxDiscountAmt = formData.max_discount_amount ? Number(formData.max_discount_amount) : 0;

    // 1. Kiểm tra giới hạn phần trăm không quá 50%
    if (formData.discount_type === "percentage" && discountVal > 50) {
      alert("⚠️ Mức giảm giá theo phần trăm không được vượt quá 50%!");
      return;
    }

    // 2. Kiểm tra logic ngày bắt đầu và ngày hết hạn
    const startTimestamp = new Date(formData.start_date).getTime();
    const expiryTimestamp = new Date(formData.expiry_date).getTime();
    if (startTimestamp >= expiryTimestamp) {
      alert("⚠️ Ngày hết hạn phải xảy ra sau ngày bắt đầu!");
      return;
    }

    // 3. Kiểm tra logic mức giảm tối đa với đơn hàng tối thiểu (nếu có nhập)
    if (formData.discount_type === "percentage" && maxDiscountAmt > 0 && minOrderVal > 0) {
      if (maxDiscountAmt >= minOrderVal) {
        alert("⚠️ Mức giảm tối đa không nên lớn hơn hoặc bằng giá trị đơn hàng tối thiểu!");
        return;
      }
    }

    setLoading(true);

    // Chuẩn hóa và làm sạch dữ liệu trước khi gửi lên API
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discount_value: discountVal,
      min_order_value: minOrderVal,
      max_discount_amount: formData.discount_type === "percentage" && maxDiscountAmt > 0 ? maxDiscountAmt : null,
      usage_limit: Number(formData.usage_limit),
      start_date: new Date(formData.start_date).toISOString(), // Chuẩn hóa ISO String
      expiry_date: new Date(formData.expiry_date).toISOString(),
    };

    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Lỗi hệ thống từ Server!" }));
        throw new Error(errorData.message);
      }

      const data = await res.json();

      if (data.success || res.status === 201) {
        alert("Tạo mã giảm giá thành công!");
        router.push("/admin/voucher"); 
        router.refresh();
      } else {
        alert(data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      alert(error.message || "Lỗi kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      {/* Header điều hướng */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h3 className="fw-bold mb-1">Thêm Voucher Mới</h3>
          <p className="text-muted small">Tạo chương trình ưu đãi khuyến mại mới cho khách hàng.</p>
        </div>
        <Link href="/admin/voucher" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Quay lại
        </Link>
      </div>

      {/* Form nhập liệu */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              
              {/* Mã Voucher */}
              <div className="col-md-6">
                <label className="form-label fw-bold small">Mã giảm giá (Code)</label>
                <input
                  type="text"
                  name="code"
                  className="form-control font-monospace text-uppercase"
                  placeholder="Ví dụ: NOVA50K"
                  required
                  value={formData.code}
                  onChange={handleChange}
                />
              </div>

              {/* Loại giảm giá */}
              <div className="col-md-6">
                <label className="form-label fw-bold small">Loại giảm giá</label>
                <select
                  name="discount_type"
                  className="form-select"
                  value={formData.discount_type}
                  onChange={handleChange}
                >
                  <option value="fixed">Số tiền cố định (đ)</option>
                  <option value="percentage">Phần trăm (%)</option>
                </select>
              </div>

              {/* Giá trị giảm */}
              <div className="col-md-6">
                <label className="form-label fw-bold small">Mức giảm giá</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="discount_value"
                    className="form-control"
                    placeholder={formData.discount_type === "fixed" ? "Ví dụ: 50000" : "Tối đa 50"}
                    required
                    min="1"
                    max={formData.discount_type === "percentage" ? "50" : undefined} // Khống chế thuộc tính HTML khi chọn %
                    value={formData.discount_value}
                    onChange={handleChange}
                  />
                  <span className="input-group-text bg-light">
                    {formData.discount_type === "fixed" ? "đ" : "%"}
                  </span>
                </div>
              </div>

              {/* Đơn hàng tối thiểu */}
              <div className="col-md-6">
                <label className="form-label fw-bold small">Giá trị đơn hàng tối thiểu</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="min_order_value"
                    className="form-control"
                    placeholder="Ví dụ: 400000"
                    min="0"
                    value={formData.min_order_value}
                    onChange={handleChange}
                  />
                  <span className="input-group-text bg-light">đ</span>
                </div>
              </div>

              {/* Giảm tối đa */}
              <div className="col-md-6">
                <label className="form-label fw-bold small text-secondary">
                  Mức giảm tối đa {formData.discount_type === "fixed" && "(Không áp dụng)"}
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    name="max_discount_amount"
                    className="form-control"
                    placeholder={formData.discount_type === "fixed" ? "Chỉ áp dụng cho loại %" : "Để trống nếu không giới hạn"}
                    disabled={formData.discount_type === "fixed"}
                    min="0"
                    value={formData.discount_type === "fixed" ? "" : formData.max_discount_amount}
                    onChange={handleChange}
                  />
                  <span className="input-group-text bg-light">đ</span>
                </div>
              </div>

              {/* Giới hạn lượt dùng */}
              <div className="col-md-6">
                <label className="form-label fw-bold small">Tổng số lượt sử dụng tối đa</label>
                <input
                  type="number"
                  name="usage_limit"
                  className="form-control"
                  placeholder="Ví dụ: 100"
                  min="1"
                  required
                  value={formData.usage_limit}
                  onChange={handleChange}
                />
              </div>

              {/* 🌟 Ngày bắt đầu */}
              <div className="col-md-6">
                <label className="form-label fw-bold small">Ngày bắt đầu áp dụng</label>
                <input
                  type="datetime-local"
                  name="start_date"
                  className="form-control"
                  required
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>

              {/* Ngày hết hạn */}
              <div className="col-md-6">
                <label className="form-label fw-bold small">Ngày hết hạn</label>
                <input
                  type="datetime-local"
                  name="expiry_date"
                  className="form-control"
                  required
                  value={formData.expiry_date}
                  onChange={handleChange}
                />
              </div>

              {/* Trạng thái hoạt động */}
              <div className="col-md-12 d-flex align-items-end shadow-none">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    role="switch"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label className="form-check-label small fw-bold ms-1" htmlFor="is_active">
                    Kích hoạt sử dụng ngay
                  </label>
                </div>
              </div>

              {/* Mô tả voucher */}
              <div className="col-12">
                <label className="form-label fw-bold small">Mô tả hiển thị công khai</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Giảm ngay 10% cho đơn hàng mua giày từ 400k trở lên..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Nút hành động */}
              <div className="col-12 text-end mt-4">
                <Link href="/admin/voucher" className="btn btn-light border me-2">
                  Hủy bỏ
                </Link>
                <button type="submit" className="btn btn-dark px-4" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Lưu Voucher"
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
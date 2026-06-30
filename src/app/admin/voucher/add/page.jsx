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
    setLoading(true);

    // Chuẩn hóa và làm sạch dữ liệu trước khi gửi lên API
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discount_value: Number(formData.discount_value),
      min_order_value: formData.min_order_value ? Number(formData.min_order_value) : 0,
      max_discount_amount: formData.max_discount_amount && formData.discount_type === "percentage" 
        ? Number(formData.max_discount_amount) 
        : null,
      usage_limit: Number(formData.usage_limit),
      expiry_date: new Date(formData.expiry_date).toISOString(), // Đảm bảo đúng định dạng Date ISO string
    };

    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Phòng thủ nếu response trả về lỗi HTTP trống body
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
                    placeholder={formData.discount_type === "fixed" ? "Ví dụ: 50000" : "Ví dụ: 10"}
                    required
                    min="1"
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
                    placeholder="Để trống nếu không giới hạn"
                    disabled={formData.discount_type === "fixed"}
                    min="0"
                    value={formData.max_discount_amount}
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
              <div className="col-md-6 d-flex align-items-end shadow-none">
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
                  placeholder="Giảm ngay 50k cho đơn hàng mua giày từ 400k trở lên..."
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
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditVoucher() {
  const router = useRouter();
  const { id } = useParams(); 
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "fixed",
    discount_value: "",
    min_order_value: "",
    max_discount_amount: "",
    usage_limit: "",
    expiry_date: "",
    is_active: true,
    description: "",
  });

  // 1. Tải thông tin voucher cũ (Gọi đúng sang /api/vouchers có s)
  useEffect(() => {
    const fetchVoucherData = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/vouchers/${id}`); // Thêm s ở đây
        if (!res.ok) throw new Error("Không lấy được dữ liệu");
        const data = await res.json();
        
        let formattedDate = "";
        if (data.expiry_date) {
          const date = new Date(data.expiry_date);
          formattedDate = date.toISOString().slice(0, 16);
        }

        setFormData({
          code: data.code || "",
          discount_type: data.discount_type || "fixed",
          discount_value: data.discount_value || "",
          min_order_value: data.min_order_value || "",
          max_discount_amount: data.max_discount_amount || "",
          usage_limit: data.usage_limit || "",
          expiry_date: formattedDate,
          is_active: data.is_active ?? true,
          description: data.description || "",
        });
      } catch (error) {
        console.error(error);
        alert("Lỗi tải dữ liệu hoặc mã voucher không tồn tại!");
        router.push("/admin/voucher"); // Quay về trang list không s của bạn
      } finally {
        setLoading(false);
      }
    };

    fetchVoucherData();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 2. Gửi thông tin cập nhật (Gọi đúng sang /api/vouchers có s)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const updatePayload = {
      code: formData.code.trim().toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      min_order_value: formData.min_order_value ? Number(formData.min_order_value) : 0,
      max_discount_amount: formData.max_discount_amount && formData.discount_type === "percentage" 
        ? Number(formData.max_discount_amount) 
        : null,
      usage_limit: Number(formData.usage_limit),
      expiry_date: new Date(formData.expiry_date).toISOString(),
      is_active: formData.is_active,
      description: formData.description?.trim() || "",
    };

  try {
    const res = await fetch(`/api/vouchers/${id}`, { // Thêm s ở đây
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert("Cập nhật thông tin voucher thành công!");
      router.push("/admin/voucher"); // Quay về trang không s
      router.refresh();
    } else {
      alert(data.message || "Có lỗi xảy ra!");
    }
  } catch (error) {
    alert("Lỗi kết nối đến server.");
  } finally {
    setSubmitLoading(false);
  }
};

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-secondary" role="status"></div>
        <p className="mt-2 text-muted">Đang lấy thông tin voucher cũ...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h3 className="fw-bold mb-1">Chỉnh sửa Voucher</h3>
          <p className="text-muted small">Cập nhật thông số cấu hình và chính sách khuyến mại.</p>
        </div>
        <Link href="/admin/voucher" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Quay lại
        </Link>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              
              <div className="col-md-6">
                <label className="form-label fw-bold small">Mã giảm giá (Code)</label>
                <input
                  type="text"
                  name="code"
                  className="form-control font-monospace text-uppercase"
                  required
                  value={formData.code}
                  onChange={handleChange}
                />
              </div>

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

              <div className="col-md-6">
                <label className="form-label fw-bold small">Mức giảm giá</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="discount_value"
                    className="form-control"
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

              <div className="col-md-6">
                <label className="form-label fw-bold small">Giá trị đơn hàng tối thiểu</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="min_order_value"
                    className="form-control"
                    min="0"
                    value={formData.min_order_value}
                    onChange={handleChange}
                  />
                  <span className="input-group-text bg-light">đ</span>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-secondary">
                  Mức giảm tối đa {formData.discount_type === "fixed" && "(Không áp dụng)"}
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    name="max_discount_amount"
                    className="form-control"
                    disabled={formData.discount_type === "fixed"}
                    min="0"
                    value={formData.max_discount_amount}
                    onChange={handleChange}
                  />
                  <span className="input-group-text bg-light">đ</span>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small">Tổng số lượt sử dụng tối đa</label>
                <input
                  type="number"
                  name="usage_limit"
                  className="form-control"
                  min="1"
                  required
                  value={formData.usage_limit}
                  onChange={handleChange}
                />
              </div>

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

              <div className="col-12">
                <label className="form-label fw-bold small">Mô tả hiển thị công khai</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="col-12 text-end mt-4">
                <Link href="/admin/voucher" className="btn btn-light border me-2">
                  Hủy bỏ
                </Link>
                <button type="submit" className="btn btn-dark px-4" disabled={submitLoading}>
                  {submitLoading ? "Đang lưu..." : "Cập nhật Voucher"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
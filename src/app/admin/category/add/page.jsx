"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddCategory() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    image: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Tên danh mục không được để trống!");

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.id.trim(),
          name: formData.name.trim(),
          slug: formData.name.toLowerCase().replace(/ /g, "-"),
          description: formData.description.trim(),
          image: formData.image.trim(),
          status: formData.status,
        }),
      });

      // Đọc dữ liệu phản hồi từ API để lấy thông tin lỗi chi tiết
      const data = await res.json();

      if (res.ok) {
        alert("Thêm danh mục mới thành công!");
        router.push("/admin/category");
        router.refresh();
      } else {
        // Hiện thẳng lỗi mà API trả về
        alert(`Thêm thất bại: ${data.error || "Lỗi không xác định từ server"}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="mb-3">
        <Link href="/admin/category" className="text-decoration-none text-muted small">
          <i className="bi bi-arrow-left me-1"></i> Quay lại danh sách
        </Link>
      </div>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h4 className="fw-bold mb-1 text-dark">Thêm danh mục mới</h4>
          <p className="text-muted small mb-4">Nhập đầy đủ thông tin chi tiết dưới đây.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Mã danh mục (id)</label>
              <input type="text" className="form-control" name="id" placeholder="Ví dụ: CAT-G001" value={formData.id} onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Tên danh mục *</label>
              <input type="text" className="form-control" name="name" placeholder="Ví dụ: Giày Sneaker" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Đường dẫn ảnh (URL)</label>
              <input type="text" className="form-control" name="image" placeholder="https://..." value={formData.image} onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Mô tả</label>
              <textarea className="form-control" name="description" rows="3" placeholder="Nhập mô tả ngắn..." value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">Trạng thái</label>
              <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Hiển thị (Active)</option>
                <option value="inactive">Ẩn (Inactive)</option>
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <Link href="/admin/category" className="btn btn-light px-4">Hủy</Link>
              <button type="submit" className="btn btn-dark px-4" disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo danh mục"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
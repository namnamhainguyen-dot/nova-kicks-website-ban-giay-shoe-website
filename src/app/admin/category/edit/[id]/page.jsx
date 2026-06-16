"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Lấy _id của danh mục từ URL

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    image: "",
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. Lấy dữ liệu cũ của danh mục dựa vào ID để đổ vào Form
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const res = await fetch(`/api/categories`);
        if (res.ok) {
          const categories = await res.json();
          // Tìm danh mục khớp với ID trên URL
          const currentCategory = categories.find((cat) => cat._id === id);
          
          if (currentCategory) {
            setFormData({
              id: currentCategory.id || "",
              name: currentCategory.name || "",
              description: currentCategory.description || "",
              image: currentCategory.image || "",
              status: currentCategory.status || "active",
            });
          } else {
            alert("Không tìm thấy danh mục này!");
            router.push("/admin/category");
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết danh mục:", error);
        alert("Có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategoryDetails();
  }, [id, router]);

  // 2. Xử lý khi người dùng thay đổi dữ liệu trong ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Gửi dữ liệu cập nhật lên API (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/ /g, "-"), // Tự động cập nhật lại slug theo tên mới
          description: formData.description,
          image: formData.image,
          status: formData.status,
        }),
      });

      if (res.ok) {
        alert("Cập nhật danh mục thành công!");
        router.push("/admin/category"); // Quay về trang danh sách
        router.refresh(); // Làm mới dữ liệu
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Cập nhật thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-secondary" role="status"></div>
        <p className="mt-2 text-muted">Đang tải dữ liệu danh mục...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      {/* Nút quay lại */}
      <div className="mb-3">
        <Link href="/admin/category" className="text-decoration-none text-muted small">
          <i className="bi bi-arrow-left me-1"></i> Quay lại danh sách
        </Link>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h4 className="fw-bold mb-1 text-dark">Chỉnh sửa danh mục</h4>
          <p className="text-muted small mb-4">Thay đổi thông tin phân loại sản phẩm hệ thống.</p>

          <form onSubmit={handleSubmit}>
            {/* Mã danh mục */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Mã danh mục</label>
              <input
                type="text"
                className="form-control"
                name="id"
                placeholder="Ví dụ: CAT-G001"
                value={formData.id}
                onChange={handleChange}
              />
            </div>

            {/* Tên danh mục */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Tên danh mục <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Nhập tên danh mục (ví dụ: Giày Chạy Bộ)"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Đường dẫn ảnh */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Đường dẫn hình ảnh (URL)</label>
              <input
                type="text"
                className="form-control"
                name="image"
                placeholder="Nhập link ảnh https://..."
                value={formData.image}
                onChange={handleChange}
              />
              {formData.image && (
                <div className="mt-2">
                  <span className="d-block small text-muted mb-1">Xem trước ảnh:</span>
                  <img
                    src={formData.image.startsWith("http") ? formData.image : "https://via.placeholder.com/80"}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                </div>
              )}
            </div>

            {/* Mô tả */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Mô tả</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                placeholder="Nhập mô tả ngắn về danh mục..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Trạng thái hiển thị */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">Trạng thái</label>
              <select
                className="form-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Hiển thị (Active)</option>
                <option value="inactive">Ẩn (Inactive)</option>
              </select>
            </div>

            {/* Thanh nút bấm */}
            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <Link href="/admin/category" className="btn btn-light px-4">
                Hủy
              </Link>
              <button
                type="submit"
                className="btn btn-dark px-4"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
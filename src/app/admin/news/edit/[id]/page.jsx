"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p className="p-3 border rounded text-muted">Đang tải trình soạn thảo...</p>,
});

import "react-quill-new/dist/quill.snow.css";

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    createdAt: "",
    summary: "",
    image: "",
    content: "",
    isHidden: false,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/news?id=${params.id}&admin=true`);
        const data = await res.json();

        if (data.success && data.data) {
          let formattedDate = "";
          if (data.data.createdAt) {
            formattedDate = new Date(data.data.createdAt).toISOString().split("T")[0];
          }
          setFormData({
            ...data.data,
            createdAt: formattedDate,
            isHidden: data.data.isHidden ?? false,
          });
        } else {
          alert(data.error || "Không tìm thấy bài viết!");
          router.push("/admin/news");
        }
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id && params.id !== "create") {
      fetchArticle();
    } else {
      setLoading(false);
    }
  }, [params?.id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentChange = (contentValue) => {
    setFormData((prev) => ({ ...prev, content: contentValue }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleRatio = MAX_WIDTH / img.width;
          
          canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
          canvas.height = img.width > MAX_WIDTH ? img.height * scaleRatio : img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
          setFormData((prev) => ({ ...prev, image: compressedBase64 }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!params?.id || params.id === "create") {
      alert("ID bài viết không hợp lệ!");
      return;
    }

    setSubmitting(true);

    // Lọc bỏ các trường mặc định của MongoDB tránh lỗi update
    const { _id, __v, updatedAt, ...updateData } = formData;

    try {
      const res = await fetch(`/api/news?id=${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();

      if (data.success) {
        alert("Cập nhật bài viết thành công!");
        router.push("/admin/news");
      } else {
        alert(data.error || "Có lỗi xảy ra khi cập nhật");
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Lỗi kết nối máy chủ hoặc dữ liệu gửi đi không hợp lệ!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary me-2" role="status"></div>
        <span>Đang tải dữ liệu bài viết...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Chỉnh sửa bài viết</h2>
          <p className="text-muted">Cập nhật nội dung chi tiết, định dạng văn bản và thông tin hiển thị.</p>
        </div>
        <Link href="/admin/news" className="btn btn-outline-secondary">
          ← Quay lại quản lý
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card shadow-sm border-0 p-4">
        <div className="mb-3">
          <label className="form-label fw-semibold">Tiêu đề bài viết</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Tác giả</label>
            <input
              type="text"
              name="author"
              className="form-control"
              value={formData.author || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Danh mục</label>
            <input
              type="text"
              name="category"
              className="form-control"
              value={formData.category || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Ngày đăng</label>
            <input
              type="date"
              name="createdAt"
              className="form-control"
              value={formData.createdAt || ""}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="col-md-3 d-flex align-items-end">
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="isHidden"
                name="isHidden"
                checked={formData.isHidden || false}
                onChange={handleChange}
              />
              <label className="form-check-label fw-semibold text-danger ms-1" htmlFor="isHidden">
                Ẩn bài viết này
              </label>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Ảnh đại diện</label>
          <div className="input-group mb-2">
            <input
              type="text"
              name="image"
              className="form-control"
              value={formData.image || ""}
              onChange={handleChange}
              placeholder="Dán đường dẫn URL ảnh hoặc chọn file từ máy..."
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Chọn tệp ảnh
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="d-none"
            />
          </div>
          {formData.image && (
            <div className="mt-2 p-2 border rounded bg-light d-inline-block position-relative">
              <span className="d-block text-muted small mb-1">Xem trước ảnh:</span>
              <img
                src={formData.image}
                alt="Ảnh đại diện"
                style={{ maxHeight: "140px", objectFit: "cover" }}
                className="rounded border"
              />
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Tóm tắt ngắn</label>
          <textarea
            name="summary"
            className="form-control"
            rows="3"
            value={formData.summary || ""}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold d-block mb-2">Nội dung chi tiết</label>
          <div className="bg-white">
            <ReactQuill
              theme="snow"
              value={formData.content || ""}
              onChange={handleContentChange}
              modules={quillModules}
              style={{ minHeight: "250px" }}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link href="/admin/news" className="btn btn-light px-4">
            Hủy
          </Link>
          <button type="submit" className="btn btn-dark px-4" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
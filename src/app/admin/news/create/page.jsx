"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Import ReactQuill dynamically để tránh lỗi SSR trong Next.js
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p className="p-3 border rounded text-muted">Đang tải trình soạn thảo...</p>,
});

export default function CreateNewsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    createdAt: new Date().toISOString().split("T")[0],
    summary: "",
    image: "",
    content: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Cấu hình thanh công cụ soạn thảo trực quan
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContentChange = (contentValue) => {
    setFormData((prev) => ({ ...prev, content: contentValue }));
  };

  // Xử lý tải ảnh từ File máy tính
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        alert("Thêm bài viết mới thành công!");
        router.push("/admin/news");
      } else {
        alert(data.error || "Có lỗi xảy ra khi thêm bài viết");
      }
    } catch (error) {
      console.error("Lỗi tạo bài viết:", error);
      alert("Không thể kết nối tới máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Thêm bài viết mới</h2>
          <p className="text-muted">Tạo bài viết mới với nội dung chi tiết, định dạng văn bản và thông tin hiển thị.</p>
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
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Tác giả</label>
            <input
              type="text"
              name="author"
              className="form-control"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Danh mục</label>
            <input
              type="text"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Ngày đăng</label>
            <input
              type="date"
              name="createdAt"
              className="form-control"
              value={formData.createdAt}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Khối Ảnh Đại Diện: Hỗ trợ cả Nhập URL & Upload File */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Ảnh đại diện</label>
          <div className="input-group mb-2">
            <input
              type="text"
              name="image"
              className="form-control"
              value={formData.image}
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
            value={formData.summary}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Soạn thảo văn bản Rich Text WYSIWYG */}
        <div className="mb-4">
          <label className="form-label fw-semibold d-block mb-2">Nội dung chi tiết</label>
          <div className="bg-white">
            <ReactQuill
              theme="snow"
              value={formData.content}
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
            {submitting ? "Đang lưu..." : "Thêm bài viết"}
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import động React Quill để tránh lỗi SSR (Server-Side Rendering) trong Next.js
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import giao diện CSS chuẩn của Quill

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    createdAt: "",
    summary: "",
    image: "",
    content: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/news?id=${params.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          let formattedDate = "";
          if (data.data.createdAt) {
            formattedDate = new Date(data.data.createdAt).toISOString().split("T")[0];
          }
          setFormData({
            ...data.data,
            createdAt: formattedDate,
          });
        } else {
          alert("Không tìm thấy bài viết!");
        }
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchArticle();
    }
  }, [params?.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm riêng để nhận dữ liệu khi soạn thảo văn bản phong phú
  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/news?id=${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Cập nhật bài viết thành công!");
        router.push("/admin/news");
      } else {
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Đang tải dữ liệu bài viết...</div>;
  }

  // Cấu hình các nút bấm trên thanh công cụ (giống Word)
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Chỉnh sửa bài viết</h2>
          <p className="text-muted">Cập nhật nội dung chi tiết với định dạng văn bản trực quan.</p>
        </div>
        <Link href="/admin/news" className="btn btn-outline-secondary">
          ← Quay lại quản lý
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card shadow-sm border-0 p-4">
        {/* Tiêu đề */}
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

        {/* Tác giả, Danh mục, Ngày đăng */}
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

        {/* Ảnh đại diện */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Ảnh đại diện (URL)</label>
          <input
            type="text"
            name="image"
            className="form-control"
            value={formData.image || ""}
            onChange={handleChange}
          />
        </div>

        {/* Tóm tắt ngắn */}
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

        {/* Nội dung chi tiết - Thay thế bằng React Quill */}
        <div className="mb-4" style={{ minHeight: "350px" }}>
          <label className="form-label fw-semibold mb-2">Nội dung chi tiết (Soạn thảo trực quan)</label>
          <div style={{ height: "300px", marginBottom: "50px" }}>
            <ReactQuill
              theme="snow"
              value={formData.content || ""}
              onChange={handleContentChange}
              modules={modules}
              style={{ height: "250px" }}
            />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="d-flex justify-content-end gap-2">
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
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
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
          setFormData(data.data);
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

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">Chỉnh sửa bài viết</h2>
            <Link href="/admin/news" className="btn btn-outline-secondary">
              Quay lại
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
              <div className="col-md-6">
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
              <div className="col-md-6">
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
            </div>

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

            <div className="mb-3">
              <label className="form-label fw-semibold">Nội dung chi tiết (HTML)</label>
              <textarea
                name="content"
                className="form-control"
                rows="6"
                value={formData.content || ""}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-dark py-2" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Nạp CKEditor theo dạng Client-side Only để tránh lỗi SSR
const CKEditorWrapper = dynamic(() => import("@/components/CKEditorWrapper"), {
  ssr: false,
  loading: () => (
    <div className="p-3 border rounded text-muted bg-light">
      Đang tải trình soạn thảo...
    </div>
  ),
});

const emptyForm = {
  title: "",
  summary: "",
  content: "",
  image: "",
  category: "Xu hướng",
  author: "Nova Kicks Admin",
  isFeatured: false,
};

export default function AdminNewsPage() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải tin tức:", error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = editingId ? `/api/news?id=${editingId}` : "/api/news";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Không thể lưu bài viết");

      setMessage(editingId ? "Cập nhật bài viết thành công" : "Đã tạo bài viết mới");
      setForm(emptyForm);
      setEditingId(null);
      fetchArticles();
    } catch (error) {
      setMessage(error.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article) => {
    setEditingId(article._id);
    setForm({
      title: article.title || "",
      summary: article.summary || "",
      content: article.content || "",
      image: article.image || "",
      category: article.category || "Xu hướng",
      author: article.author || "Nova Kicks Admin",
      isFeatured: Boolean(article.isFeatured),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Không thể xóa bài viết");
      setMessage("Đã xóa bài viết");
      fetchArticles();
    } catch (error) {
      setMessage(error.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Quản lý tin tức</h2>
          <p className="text-muted mb-0">Tạo, chỉnh sửa và quản lý các bài báo cho website.</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-info py-2">{message}</div>
      )}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">{editingId ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}</h5>
              <form onSubmit={handleSubmit} className="d-grid gap-3">
                <div>
                  <label className="form-label small fw-bold mb-1">Tiêu đề bài viết</label>
                  <input
                    className="form-control"
                    placeholder="Tiêu đề bài viết"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold mb-1">Danh mục</label>
                    <input
                      className="form-control"
                      placeholder="Danh mục"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold mb-1">Tác giả</label>
                    <input
                      className="form-control"
                      placeholder="Tác giả"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label small fw-bold mb-1">Ảnh đại diện (URL)</label>
                  <input
                    className="form-control"
                    placeholder="Ảnh đại diện (URL)"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label small fw-bold mb-1">Tóm tắt ngắn</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Tóm tắt bài viết"
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    required
                  />
                </div>

                {/* Tích hợp CKEditor */}
                <div>
                  <label className="form-label small fw-bold mb-1">Nội dung bài viết</label>
                  <CKEditorWrapper
                    value={form.content}
                    onChange={(newContent) => setForm({ ...form, content: newContent })}
                  />
                </div>

                <label className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  Đặt làm bài nổi bật
                </label>

                <div className="d-flex gap-2">
                  <button className="btn btn-dark" disabled={loading} type="submit">
                    {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
                  </button>
                  {editingId && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Danh sách bài viết</h5>
              <div className="d-grid gap-3">
                {articles.length === 0 ? (
                  <div className="text-muted">Chưa có bài viết nào.</div>
                ) : articles.map((article) => (
                  <div key={article._id} className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between gap-3">
                      <div>
                        <h6 className="fw-bold mb-1">{article.title}</h6>
                        <p className="text-muted small mb-2">{article.summary}</p>
                        <div className="small text-secondary">
                          <span className="me-3">Danh mục: {article.category}</span>
                          <span className="me-3">Tác giả: {article.author}</span>
                          <span>{article.isFeatured ? "⭐ Nổi bật" : ""}</span>
                        </div>
                      </div>
                      <div className="d-flex gap-2 align-items-start">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(article)}>
                          Sửa
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(article._id)}>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
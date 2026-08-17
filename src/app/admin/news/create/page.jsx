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
          alert(data.error || "Không tìm thấy bài viết!");
          router.push("/admin/news");
        }
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
        alert("Lỗi tải dữ liệu bài viết");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ thực thi fetch khi ID tồn tại và không phải route 'create'
    if (params?.id && params.id !== "create") {
      fetchArticle();
    } else {
      setLoading(false);
    }
  }, [params?.id, router]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const insertFormatting = (openTag, closeTag) => {
    const textarea = document.getElementById("newsContentArea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || "";
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + openTag + selectedText + closeTag + text.substring(end);
    setFormData((prev) => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!params?.id || params.id === "create") {
      alert("ID bài viết không hợp lệ!");
      return;
    }

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
        alert(data.error || "Có lỗi xảy ra khi cập nhật");
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Không thể kết nối tới máy chủ");
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
          <div className="col-md-4">
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
          <div className="col-md-4">
            <label className="form-label fw-semibold">Danh mục</label>
            <input
              type="text"
              name="category"
              className="form-control"
              value={formData.category || ""}
              onChange={handleChange}
              placeholder="Ví dụ: Xu hướng, Thể thao..."
              required
            />
          </div>
          <div className="col-md-4">
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
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Ảnh đại diện (URL)</label>
          <input
            type="text"
            name="image"
            className="form-control"
            value={formData.image || ""}
            onChange={handleChange}
            placeholder="Dán đường dẫn hình ảnh vào đây..."
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
            placeholder="Viết đoạn mở đầu ngắn gọn cho bài viết..."
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold d-block mb-2">Nội dung chi tiết</label>

          <div className="d-flex flex-wrap gap-2 mb-2 p-2 bg-light border rounded">
            <button type="button" className="btn btn-sm btn-white border fw-bold" onClick={() => insertFormatting("<strong>", "</strong>")} title="In đậm">B</button>
            <button type="button" className="btn btn-sm btn-white border fst-italic" onClick={() => insertFormatting("<em>", "</em>")} title="In nghiêng">I</button>
            <button type="button" className="btn btn-sm btn-white border text-decoration-underline" onClick={() => insertFormatting("<u>", "</u>")} title="Gạch chân">U</button>
            <span className="vr"></span>
            <button type="button" className="btn btn-sm btn-white border fw-bold" onClick={() => insertFormatting("<h1>", "</h1>")} title="Tiêu đề to">Tiêu đề lớn</button>
            <button type="button" className="btn btn-sm btn-white border fw-bold" onClick={() => insertFormatting("<h3>", "</h3>")} title="Tiêu đề vừa">Tiêu đề vừa</button>
            <span className="vr"></span>
            <button type="button" className="btn btn-sm btn-white border text-danger fw-bold" onClick={() => insertFormatting('<span style="color: red;">', "</span>")} title="Chữ đỏ">Chữ đỏ</button>
            <button type="button" className="btn btn-sm btn-white border text-primary fw-bold" onClick={() => insertFormatting('<span style="color: blue;">', "</span>")} title="Chữ xanh">Chữ xanh</button>
            <span className="vr"></span>
            <button type="button" className="btn btn-sm btn-white border" onClick={() => insertFormatting('<img src="', '" alt="" class="img-fluid rounded my-3" />')} title="Chèn ảnh">🖼️ Chèn ảnh</button>
          </div>

          <textarea
            id="newsContentArea"
            name="content"
            className="form-control"
            rows="10"
            value={formData.content || ""}
            onChange={handleChange}
            placeholder="Nhập nội dung bài viết..."
            required
          ></textarea>
        </div>

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
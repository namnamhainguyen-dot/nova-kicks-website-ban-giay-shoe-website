"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p className="p-3 border rounded text-muted">Đang tải trình soạn thảo...</p>,
});

export default function CreateNewsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "Admin",
    category: "",
    createdAt: new Date().toISOString().split("T")[0],
    summary: "",
    image: "",
    content: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Nén ảnh Base64
  const compressImage = (file, maxWidth = 800, quality = 0.6) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scaleRatio = maxWidth / img.width;

          canvas.width = img.width > maxWidth ? maxWidth : img.width;
          canvas.height = img.width > maxWidth ? img.height * scaleRatio : img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: function () {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
              const file = input.files[0];
              if (file) {
                const compressedImage = await compressImage(file, 800, 0.6);
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  const range = quill.getSelection(true);
                  quill.insertEmbed(range.index, "image", compressedImage);
                  quill.setSelection(range.index + 1);
                }
              }
            };
          },
        },
      },
    }),
    []
  );

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContentChange = (contentValue) => {
    setFormData((prev) => ({ ...prev, content: contentValue }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedBase64 = await compressImage(file, 800, 0.6);
      setFormData((prev) => ({ ...prev, image: compressedBase64 }));
    }
  };

  // Hàm gọi AI tạo bài viết (Hỗ trợ cả Tiêu đề chữ HOẶC Hình ảnh đã tải)
  const handleAutoGenerateAI = async (fromImage = false) => {
    if (fromImage && !formData.image) {
      alert("Vui lòng chọn/tải ảnh lên trước khi dùng tính năng tạo bài viết từ ảnh!");
      return;
    }

    setGeneratingAi(true);
    try {
      const topicPrompt = formData.title.trim()
        ? formData.title
        : "Hãy chọn 1 mẫu giày sneaker hot nhất hiện nay";

      const payload = fromImage
        ? { imageBase64: formData.image }
        : { topic: topicPrompt };

      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success && result.data) {
        const { title, summary, category, image, content } = result.data;

        setFormData((prev) => ({
          ...prev,
          title: title || prev.title,
          summary: summary || prev.summary,
          category: category || "Đánh giá",
          image: image || prev.image,
          content: content || prev.content,
        }));
      } else {
        alert(result.error || "Không thể tạo bài viết tự động.");
      }
    } catch (error) {
      console.error("Lỗi AI:", error);
      alert("Lỗi kết nối máy chủ AI!");
    } finally {
      setGeneratingAi(false);
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
          <p className="text-muted">Cập nhật nội dung chi tiết, định dạng văn bản và thông tin hiển thị.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => handleAutoGenerateAI(false)}
            disabled={generatingAi}
          >
            {generatingAi ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                Đang suy nghĩ...
              </>
            ) : (
              <>
                <span>✨</span> AI Tạo Bài Theo Ý Tưởng
              </>
            )}
          </button>

          <Link className="btn btn-outline-secondary" href="/admin/news">
            ← Quay lại quản lý
          </Link>
        </div>
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
            placeholder="Nhập tiêu đề (hoặc gõ ý tưởng sơ lược)..."
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
              placeholder="Ví dụ: Xu hướng, Đánh giá..."
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

        <div className="mb-3">
          <label className="form-label fw-semibold">Ảnh đại diện</label>
          <div className="input-group">
            <input
              type="text"
              name="image"
              className="form-control"
              value={formData.image}
              onChange={handleChange}
              placeholder="Dán URL ảnh hoặc chọn tệp từ máy..."
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
            <div className="mt-3 p-3 border rounded bg-light">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-bold">Xem trước ảnh đại diện:</span>
                <button
                  type="button"
                  className="btn btn-sm btn-success d-flex align-items-center gap-1"
                  onClick={() => handleAutoGenerateAI(true)}
                  disabled={generatingAi}
                >
                  {generatingAi ? "Đang phân tích..." : "🔍 AI Phân Tích Ảnh & Viết Bài"}
                </button>
              </div>
              <img
                src={formData.image}
                alt="Xem trước ảnh đại diện"
                style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "cover" }}
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
            placeholder="Mở đầu bài viết..."
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold d-block mb-2">Nội dung chi tiết</label>
          <div className="bg-white">
            <ReactQuill modules="{quillModules}" onChange="{handleContentChange}" placeholder="Nhập nội dung bài viết..." ref="{quillRef}" theme="snow" value="{formData.content}"/>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link className="btn btn-light px-4" href="/admin/news">
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
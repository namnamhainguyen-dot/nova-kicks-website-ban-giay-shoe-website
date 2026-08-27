"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import ReactQuill để tránh lỗi SSR
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
  const [aiTopic, setAiTopic] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Hàm nén ảnh tổng dùng chung cho cả Thumbnail và Editor
  const compressImage = (file, maxWidth = 600, quality = 0.5) => {
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

  // Tùy chỉnh toolbar và Image handler cho ReactQuill
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
                // Tự động nén ảnh chèn vào nội dung bài viết
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

  // Nén ảnh đại diện khi chọn file từ máy
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedBase64 = await compressImage(file, 600, 0.5);
      setFormData((prev) => ({ ...prev, image: compressedBase64 }));
    }
  };

  // Hàm gọi AI Gemini viết bài
  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) {
      alert("Vui lòng nhập ý tưởng hoặc chủ đề bài viết!");
      return;
    }

    setGeneratingAi(true);
    try {
      const res = await fetch("/api/ai/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic }),
      });

      const result = await res.json();

      if (result.success && result.data) {
        const { title, summary, category, content } = result.data;

        // Tự động đổ dữ liệu AI tạo ra vào Form
        setFormData((prev) => ({
          ...prev,
          title: title || prev.title,
          summary: summary || prev.summary,
          category: category || prev.category,
          content: content || prev.content,
        }));

        alert("AI đã viết xong bài viết! Bạn có thể xem và chỉnh sửa lại bên dưới.");
      } else {
        alert(result.error || "Không thể khởi tạo bài viết từ AI.");
      }
    } catch (error) {
      console.error("Lỗi AI:", error);
      alert("Không thể kết nối đến máy chủ AI!");
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
      alert("Không thể kết nối tới máy chủ hoặc dữ liệu quá lớn!");
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
        <Link href="/admin/news" className="btn btn-outline-secondary">
          ← Quay lại quản lý
        </Link>
      </div>

      {/* Khung công cụ trợ lý AI Gemini */}
      <div className="card bg-light border-primary shadow-sm mb-4 p-3">
        <label className="form-label fw-bold text-primary mb-1">
          ✨ Trợ lý AI sáng tạo nội dung
        </label>
        <p className="text-muted small mb-2">
          Nhập ý tưởng hoặc tiêu đề sơ lược, AI sẽ tự động soạn thảo Tiêu đề, Danh mục, Tóm tắt và Nội dung chi tiết.
        </p>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Ví dụ: Đánh giá chi tiết mẫu giày Nike Air Max 2026 siêu nhẹ..."
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleGenerateAI())}
          />
          <button
            type="button"
            className="btn btn-primary px-4"
            onClick={handleGenerateAI}
            disabled={generatingAi}
          >
            {generatingAi ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                AI đang viết bài...
              </>
            ) : (
              "✨ Tạo bài viết"
            )}
          </button>
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
            <label className="form-label fw-semibold">Chủ đề</label>
            <input
              type="text"
              name="category"
              className="form-control"
              value={formData.category}
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
              placeholder="Dán URL ảnh hoặc nhấn nút bên cạnh để tải file..."
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
            <div className="mt-2 p-2 border rounded bg-light d-inline-block">
              <span className="d-block text-muted small mb-1">Xem trước ảnh:</span>
              <img
                src={formData.image}
                alt="Xem trước ảnh đại diện"
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
            placeholder="Viết đoạn mở đầu ngắn gọn cho bài viết..."
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold d-block mb-2">Nội dung chi tiết</label>
          <div className="bg-white">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={quillModules}
              placeholder="Nhập nội dung bài viết..."
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
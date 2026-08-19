"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State cho form bình luận
  const [commentName, setCommentName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/news?id=${params.id}`);
      const data = await res.json();
      if (data.success) {
        setArticle(data.data);
      }
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) fetchArticle();
  }, [params?.id]);

  // Xử lý Thích bài viết
  const handleLike = async () => {
    try {
      const res = await fetch(`/api/news?id=${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
      const data = await res.json();
      if (data.success) {
        setArticle((prev) => ({ ...prev, likes: data.likes }));
      }
    } catch (error) {
      console.error("Lỗi khi thích bài viết:", error);
    }
  };

  // Xử lý gửi bình luận
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentContent.trim()) {
      alert("Vui lòng nhập đầy đủ tên và nội dung bình luận!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/news?id=${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          name: commentName,
          content: commentContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Cập nhật lại danh sách bình luận ngay trên giao diện mà không cần reload trang
        setArticle((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), data.comment],
        }));
        setCommentName("");
        setCommentContent("");
      }
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Đang tải bài viết...</div>;
  }

  if (!article) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold">Không tìm thấy bài viết</h3>
        <Link href="/new" className="btn btn-dark mt-3">Quay lại tin tức</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Link href="/new" className="btn btn-outline-dark btn-sm mb-4">← Quay lại danh sách</Link>
          
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            {article.image && (
              <img src={article.image} alt={article.title} className="w-100 object-fit-cover" style={{ maxHeight: "420px" }} />
            )}
            <div className="card-body p-4 p-md-5">
              <span className="badge bg-dark mb-3">{article.category || "Tin tức"}</span>
              <h1 className="fw-bold mb-3">{article.title}</h1>
              <p className="text-secondary lead fs-6 mb-4">{article.summary}</p>
              
              <div className="d-flex justify-content-between align-items-center text-secondary small mb-4 pb-3 border-bottom">
                <div className="d-flex gap-3">
                  <span>✍️ {article.author || "Nova Kicks"}</span>
                  <span>📅 {formatDate(article.createdAt)}</span>
                </div>
                {/* Nút Thích tương tác trực tiếp */}
                <button 
                  onClick={handleLike} 
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-3 py-1 rounded-pill"
                >
                  ❤️ Thích <span>({article.likes || 0})</span>
                </button>
              </div>

              {/* Nội dung bài viết */}
              <div
                className="article-content lh-base"
                dangerouslySetInnerHTML={{ __html: article.content || article.summary }}
              />
            </div>
          </div>

          {/* Khu vực Bình luận */}
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-light">
            <h4 className="fw-bold mb-4">💬 Bình luận ({article.comments?.length || 0})</h4>

            {/* Form gửi bình luận */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Họ và tên của bạn</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên..."
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nội dung bình luận</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-dark px-4" disabled={submitting}>
                {submitting ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </form>

            <hr className="my-4" />

            {/* Danh sách các bình luận đã có */}
            <div className="d-flex flex-column gap-3">
              {(!article.comments || article.comments.length === 0) ? (
                <p className="text-muted mb-0 fst-italic">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
              ) : (
                article.comments.map((cmt) => (
                  <div key={cmt._id || Math.random()} className="card border-0 shadow-sm p-3 bg-white rounded-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark">{cmt.name}</strong>
                      <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {new Date(cmt.createdAt || Date.now()).toLocaleString("vi-VN")}
                      </small>
                    </div>
                    <p className="mb-0 text-secondary" style={{ fontSize: "0.95rem" }}>{cmt.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
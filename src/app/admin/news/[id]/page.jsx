"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "link";

export default function AdminNewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        const resolvedParams = await params;
        if (!resolvedParams?.id) return;

        const res = await fetch(`/api/news?id=${resolvedParams.id}`);
        const data = await res.json();
        if (data.success) {
          setArticle(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetail();
  }, [params]);

  if (loading) {
    return <div className="container py-5 text-center">Đang tải bài viết...</div>;
  }

  if (!article) {
    return <div className="container py-5 text-center">Không tìm thấy bài viết!</div>;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          {/* Nút quay lại danh sách */}
          <div className="mb-3">
            <Link href="/admin/news" className="btn btn-sm btn-outline-secondary">
              ← Quay lại quản lý tin tức
            </Link>
          </div>

          {/* Tiêu đề bài viết */}
          <h1 className="fw-bold mb-3">{article.title}</h1>

          {/* Thông tin bài viết & Tương tác */}
          <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-4 border-bottom pb-3">
            <span>✍️ Tác giả: <strong>{article.author || "N/A"}</strong></span>
            <span>
              📅 Ngày tạo:{" "}
              {article.createdAt
                ? new Date(article.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "N/A"}
            </span>
            <span className="badge bg-light text-dark border">{article.category || "Uncategorized"}</span>
            <span className="text-danger ms-auto">❤️ {article.likes || 0} lượt thích</span>
            <span className="text-primary">💬 {article.comments?.length || 0} bình luận</span>
          </div>

          {/* Tóm tắt ngắn */}
          {article.summary && (
            <p className="lead fw-normal text-secondary mb-4 fst-italic bg-light p-3 rounded-3 border-start border-4 border-dark">
              {article.summary}
            </p>
          )}

          {/* Ảnh đại diện nếu có */}
          {article.image && (
            <img
              src={article.image}
              alt={article.title || "News thumbnail"}
              className="img-fluid rounded-4 mb-4 w-100 object-fit-cover shadow-sm"
              style={{ maxHeight: "400px" }}
            />
          )}

          {/* Nội dung chi tiết từ CKEditor/HTML toolbar */}
          <div
            className="article-body lh-base mb-5"
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />

          {/* Khu vực hiển thị danh sách bình luận */}
          <div className="card shadow-sm border-0 p-4 bg-light">
            <h5 className="fw-bold mb-3">💬 Bình luận từ người dùng ({article.comments?.length || 0})</h5>
            {!article.comments || article.comments.length === 0 ? (
              <p className="text-muted mb-0">Chưa có bình luận nào cho bài viết này.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {article.comments.map((cmt, index) => (
                  <div key={cmt._id || index} className="card p-3 border-0 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark">{cmt.name || "Ẩn danh"}</strong>
                      <small className="text-muted">
                        {cmt.createdAt
                          ? new Date(cmt.createdAt).toLocaleString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </small>
                    </div>
                    <p className="mb-0 text-secondary">{cmt.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
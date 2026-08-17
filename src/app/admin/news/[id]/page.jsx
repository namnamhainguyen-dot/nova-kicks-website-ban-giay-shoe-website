@ -1,82 +0,0 @@
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        const res = await fetch(`/api/news?id=${params.id}`);
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

    if (params?.id) {
      fetchArticleDetail();
    }
  }, [params?.id]);

  if (loading) {
    return <div className="container py-5 text-center">Đang tải bài viết...</div>;
  }

  if (!article) {
    return <div className="container py-5 text-center">Không tìm thấy bài viết!</div>;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Tiêu đề bài viết */}
          <h1 className="fw-bold mb-3">{article.title}</h1>

          {/* Thông tin bài viết */}
          <div className="d-flex align-items-center gap-3 text-muted small mb-4 border-bottom pb-3">
            <span>✍️ {article.author}</span>
            <span>📅 {new Date(article.createdAt || Date.now()).toLocaleDateString("vi-VN")}</span>
            <span className="badge bg-secondary">{article.category}</span>
          </div>

          {/* Tóm tắt ngắn */}
          {article.summary && (
            <p className="lead fw-normal text-secondary mb-4 fst-italic">
              {article.summary}
            </p>
          )}

          {/* Ảnh đại diện nếu có */}
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="img-fluid rounded-4 mb-4 w-100 object-fit-cover"
              style={{ maxHeight: "400px" }}
            />
          )}

          {/* 
            🔥 ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT:
            Dùng dangerouslySetInnerHTML để biên dịch chuỗi HTML từ CKEditor
          */}
          <div
            className="article-body lh-base"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
    </div>
  );
}
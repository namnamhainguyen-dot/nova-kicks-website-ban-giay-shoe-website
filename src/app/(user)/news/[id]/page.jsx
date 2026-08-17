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

  useEffect(() => {
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

    if (params?.id) fetchArticle();
  }, [params?.id]);

  if (loading) {
    return <div className="container py-5">Đang tải bài viết...</div>;
  }

  if (!article) {
    return (
      <div className="container py-5">
        <h3 className="fw-bold">Không tìm thấy bài viết</h3>
        <Link href="/new" className="btn btn-dark mt-3">Quay lại tin tức</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link href="/new" className="btn btn-outline-dark btn-sm mb-4">← Quay lại danh sách</Link>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {article.image && (
          <img src={article.image} alt={article.title} className="w-100 object-fit-cover" style={{ maxHeight: "420px" }} />
        )}
        <div className="card-body p-4 p-md-5">
          <span className="badge bg-dark mb-3">{article.category || "Tin tức"}</span>
          <h1 className="fw-bold mb-3">{article.title}</h1>
          <p className="text-muted mb-4">{article.summary}</p>
          <div className="d-flex gap-3 text-secondary small mb-4">
            <span>✍️ {article.author || "Nova Kicks"}</span>
            <span>📅 {formatDate(article.createdAt)}</span>
          </div>

          {/* Dùng dangerouslySetInnerHTML để render đúng HTML */}
          <div
            className="article-content"
            style={{ lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: article.content || article.summary }}
          />
        </div>
      </div>
    </div>
  );
}
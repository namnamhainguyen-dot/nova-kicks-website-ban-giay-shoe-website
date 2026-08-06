"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const clampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const clampTitleStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export default function StaticNewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        if (data.success) {
          setNews(data.data || []);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách tin tức:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const featuredPost = news.find((item) => item.isFeatured) || news[0];
  const regularPosts = news.filter((item) => item._id !== featuredPost?._id);

  if (loading) {
    return (
      <div className="container my-5 py-5 text-center">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 py-3">
      <style jsx global>{`
        .news-img-zoom {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card-hover:hover .news-img-zoom {
          transform: scale(1.05);
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      {/* 🌟 TIÊU ĐỀ TRANG PHONG CÁCH TẠP CHÍ */}
      <div className="text-center mb-5 pb-2">
        <span className="text-uppercase tracking-widest text-muted fw-semibold" style={{ fontSize: "0.75rem", letterSpacing: "3px" }}>
          Editorial & Stories
        </span>
        <h1 className="fw-black text-uppercase display-5 mt-2 mb-3" style={{ letterSpacing: "1px", fontWeight: 800 }}>
          Tin Tức & Xu Hướng
        </h1>
        <p className="text-secondary mx-auto" style={{ maxWidth: "600px", fontSize: "0.95rem" }}>
          Cập nhật những góc nhìn sâu sắc về văn hóa Streetwear, bản phát hành độc quyền và câu chuyện đằng sau thương hiệu.
        </p>
        <div className="mx-auto mt-3 rounded-pill bg-dark" style={{ width: "40px", height: "3px" }} />
      </div>

      {news.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>Chưa có bài viết nào được đăng tải.</p>
        </div>
      ) : (
        <>
          {/* 🌟 1. BÀI VIẾT NỔI BẬT (HERO BANNER) */}
          {featuredPost && (
            <div className="card border-0 shadow-sm overflow-hidden mb-5 rounded-4 card-hover bg-white">
              <div className="row g-0 align-items-center">
                <div className="col-lg-7 overflow-hidden" style={{ minHeight: "380px" }}>
                  <Link href={`/news/${featuredPost._id}`}>
                    <img
                      src={featuredPost.image || "/img/no-image.png"}
                      alt={featuredPost.title}
                      className="img-fluid w-100 h-100 object-fit-cover news-img-zoom"
                      style={{ minHeight: "380px", maxHeight: "450px" }}
                    />
                  </Link>
                </div>
                <div className="col-lg-5 p-4 p-md-5 d-flex flex-column justify-content-center">
                  <div className="mb-3">
                    <span className="badge bg-dark text-uppercase px-3 py-2 rounded-pill" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>
                      🔥 Tiêu điểm / {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="fw-bold mb-3 h3">
                    <Link href={`/news/${featuredPost._id}`} className="text-decoration-none text-dark stretched-link">
                      {featuredPost.title}
                    </Link>
                  </h2>
                  <p className="text-secondary mb-4" style={{ ...clampStyle, fontSize: "0.92rem", lineHeight: "1.6" }}>
                    {featuredPost.summary}
                  </p>
                  <div className="d-flex align-items-center justify-content-between pt-3 border-top text-muted" style={{ fontSize: "0.85rem" }}>
                    <span className="fw-medium text-dark">✍️ {featuredPost.author || "Admin"}</span>
                    <span>📅 {formatDate(featuredPost.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📰 2. DANH SÁCH BÀI VIẾT PHỤ (GRID HIỆN ĐẠI) */}
          {regularPosts.length > 0 && (
            <>
              <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <h4 className="fw-bold text-uppercase m-0" style={{ fontSize: "1.1rem", letterSpacing: "0.5px" }}>
                  Bài viết mới nhất
                </h4>
                <span className="text-muted small">Hiển thị {regularPosts.length} bài viết</span>
              </div>

              <div className="row g-4">
                {regularPosts.map((post) => (
                  <div key={post._id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column card-hover bg-white">
                      <div className="position-relative overflow-hidden" style={{ height: "220px" }}>
                        <Link href={`/news/${post._id}`}>
                          <img
                            src={post.image || "/img/no-image.png"}
                            alt={post.title}
                            className="card-img-top w-100 h-100 object-fit-cover news-img-zoom"
                          />
                        </Link>
                        <span className="badge bg-white text-dark shadow-sm position-absolute top-0 start-0 m-3 px-2.5 py-1.5 rounded-pill fw-bold" style={{ fontSize: "0.7rem" }}>
                          {post.category}
                        </span>
                      </div>
                      
                      <div className="card-body d-flex flex-column p-4">
                        <h5 className="card-title fw-bold mb-2" style={{ fontSize: "1.05rem" }}>
                          <Link href={`/news/${post._id}`} className="text-decoration-none text-dark stretched-link" style={clampTitleStyle}>
                            {post.title}
                          </Link>
                        </h5>
                        <p className="card-text text-secondary small flex-grow-1 mb-4" style={{ ...clampStyle, lineHeight: "1.5" }}>
                          {post.summary}
                        </p>
                        
                        <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto text-muted" style={{ fontSize: "0.78rem" }}>
                          <span className="fw-medium text-dark text-truncate" style={{ maxWidth: "120px" }}>
                            👤 {post.author || "Admin"}
                          </span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
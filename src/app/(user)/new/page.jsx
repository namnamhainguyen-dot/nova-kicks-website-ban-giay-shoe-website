"use client";

import { useEffect, useState } from "react";

const clampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
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
      }
    };

    fetchNews();
  }, []);

  const featuredPost = news.find((item) => item.isFeatured) || news[0];
  const regularPosts = news.filter((item) => item._id !== featuredPost?._id);

  return (
    <div className="container my-5">
      <style jsx global>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>

      {/* Tiêu đề trang */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-uppercase" style={{ letterSpacing: "1px" }}>Tin tức & Biên tập</h1>
        <p className="text-muted">Cập nhật xu hướng thời trang Streetwear và các bản phát hành mới nhất.</p>
        <hr className="mx-auto" style={{ width: "60px", borderTop: "3px solid #000", opacity: 1 }} />
      </div>

      {/* 🌟 1. BÀI VIẾT NỔI BẬT (BANNER LỚN) */}
      {featuredPost && (
        <div className="card border-0 shadow-sm overflow-hidden mb-5 rounded-3 bg-light hover-shadow">
          <div className="row g-0 align-items-center">
            <div className="col-lg-7">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="img-fluid w-100 object-fit-cover"
                style={{ maxHeight: "400px", minHeight: "350px" }}
              />
            </div>
            <div className="col-lg-5 p-4 p-md-5">
              <span className="badge bg-dark mb-3 text-uppercase px-3 py-2 rounded-pill">
                🔥 {featuredPost.category}
              </span>
              <h2 className="fw-bold mb-3">
                <a href={`/news/${featuredPost._id}`} className="text-decoration-none text-dark">
                  {featuredPost.title}
                </a>
              </h2>
              <p className="text-muted mb-4" style={clampStyle}>{featuredPost.summary}</p>
              <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                <small className="text-secondary">✍️ {featuredPost.author}</small>
                <small className="text-muted">
                  📅 {formatDate(featuredPost.createdAt)}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📰 2. DANH SÁCH BÀI VIẾT PHỤ (GRID LƯỚI) */}
      <h4 className="fw-bold mb-4 pb-2 border-bottom">Bài viết mới cập nhật</h4>
      <div className="row g-4">
        {regularPosts.map((post) => (
          <div key={post._id} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column hover-shadow">
              <div className="position-relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="card-img-top object-fit-cover"
                  style={{ height: "220px" }}
                />
                <span className="badge bg-secondary position-absolute top-0 start-0 m-3 px-2 py-1.5 rounded">
                  {post.category}
                </span>
              </div>
              <div className="card-body d-flex flex-column p-4">
                <h5 className="card-title fw-bold mb-2">
                  <a href={`/news/${post._id}`} className="text-decoration-none text-dark text-truncate-2">
                    {post.title}
                  </a>
                </h5>
                <p className="card-text text-muted small flex-grow-1" style={clampStyle}>
                  {post.summary}
                </p>
                <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
                  <small className="text-secondary small">👤 {post.author}</small>
                  <small className="text-muted small">
                    {formatDate(post.createdAt)}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
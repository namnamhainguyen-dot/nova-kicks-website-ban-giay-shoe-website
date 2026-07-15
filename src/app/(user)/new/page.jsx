"use client";

import { useState } from "react";
import Link from "next/link";

// Mock Data dữ liệu tĩnh về giày Streetwear cho Nova Kicks
const MOCK_NEWS = [
  {
    _id: "news-1",
    title: "Xu Hướng Đỉnh Cao: Sự Trỗi Dậy Của Giày Streetwear Bản Giới Hạn Năm 2026",
    summary: "Thị trường giày streetwear đang chứng kiến những bước chuyển mình mạnh mẽ với các thiết kế phá cách, tích hợp công nghệ mới và những bản collab chấn động giới mộ điệu.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    category: "Xu hướng",
    author: "Nova Kicks Editor",
    createdAt: "2026-07-01T08:00:00.000Z",
  },
  {
    _id: "news-2",
    title: "Top 5 Đôi Giày Sneakers Đáng Mua Nhất Cho Mùa Hè Này",
    summary: "Điểm danh những mẫu giày vừa êm ái, thoáng khí lại cực kỳ dễ phối đồ với mọi outfit phong cách đường phố từ tối giản đến hầm hố.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop",
    category: "Style Guide",
    author: "Hải Nam",
    createdAt: "2026-06-28T03:15:00.000Z",
  },
  {
    _id: "news-3",
    title: "Cách Vệ Sinh Giày Sneaker Trắng Tại Nhà Chuẩn Spa",
    summary: "Làm sao để đôi sneaker thân yêu không bị ố vàng sau khi giặt? Bỏ túi ngay bí kíp vệ sinh giày cực dễ bằng những nguyên liệu sẵn có.",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=500&auto=format&fit=crop",
    category: "Mẹo nhỏ",
    author: "Nova Kicks Admin",
    createdAt: "2026-06-25T10:40:00.000Z",
  },
  {
    _id: "news-4",
    title: "Lịch Sử Phía Sau Những Thiết Kế Kinh Điển Của Dòng Sneaker Cổ Thấp",
    summary: "Cùng nhìn lại chặng đường lịch sử từ sân thi đấu thể thao cho đến khi trở thành biểu tượng văn hóa đại chúng toàn cầu của giày đế bằng.",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500&auto=format&fit=crop",
    category: "Văn hóa",
    author: "Fashion Blogger",
    createdAt: "2026-06-20T14:20:00.000Z",
  },
];

export default function StaticNewsPage() {
  const [news] = useState(MOCK_NEWS);

  // Bài viết đầu tiên làm bài viết nổi bật (Banner lớn)
  const featuredPost = news[0];
  // Các bài viết còn lại đưa vào lưới bên dưới
  const regularPosts = news.slice(1);

  return (
    <div className="container my-5">
      {/* Thêm CSS hỗ trợ cắt chữ trực tiếp bằng thẻ style */}
      <style jsx global>{`
        .text-truncate-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
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
              <p className="text-muted mb-4 text-truncate-3">{featuredPost.summary}</p>
              <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                <small className="text-secondary">✍️ {featuredPost.author}</small>
                <small className="text-muted">
                  📅 {new Date(featuredPost.createdAt).toLocaleDateString("vi-VN")}
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
                <p className="card-text text-muted text-truncate-3 small flex-grow-1">
                  {post.summary}
                </p>
                <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-3">
                  <small className="text-secondary small">👤 {post.author}</small>
                  <small className="text-muted small">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
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
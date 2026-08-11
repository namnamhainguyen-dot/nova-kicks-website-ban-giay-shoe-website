"use client";

import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import các file CSS của Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function HeroBannerSlider() {
  const banners = [
    {
      id: 1,
      badge: "Bộ Sưu Tập Mới 2026",
      badgeColor: "#ea580c",
      title: "Bước Đệm Cho Tương Lai",
      description: "Khám phá những thiết kế giày thể thao độc quyền, kết hợp hoàn hảo giữa phong cách đường phố và hiệu năng đỉnh cao.",
      buttonText: "Khám Phá Ngay",
      buttonLink: "/products",
      bgImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('/img/Gemini_Generated_Image_jqml2cjqml2cjqml.png')"
    },
    {
      id: 2,
      badge: "Ưu Đãi Đặc Biệt",
      badgeColor: "#0284c7",
      title: "Siêu Sale Mùa Hè",
      description: "Giảm giá lên đến 50% cho các dòng sản phẩm chạy bộ và thời trang thể thao hot nhất trong năm.",
      buttonText: "Mua Sắm Ngay",
      buttonLink: "/products",
      bgImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1920&auto=format&fit=crop')"
    },
    {
      id: 3,
      badge: "Chính Hãng 100%",
      badgeColor: "#16a34a",
      title: "Phong Cách Đỉnh Cao",
      description: "Nâng tầm phong cách của bạn với những bộ sưu tập giới hạn từ các thương hiệu hàng đầu thế giới.",
      buttonText: "Xem Bộ Sưu Tập",
      buttonLink: "/products",
      bgImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1920&auto=format&fit=crop')"
    }
  ];

  return (
    <div className="position-relative" style={{ marginTop: "-150px" }}>
      {/* Tối ưu hóa phần cứng GPU cho Swiper wrapper để chạy mượt 60fps */}
      <style jsx global>{`
        .hero-swiper .swiper-wrapper {
          will-change: transform;
        }
      `}</style>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        speed={1000} // Tăng tốc độ trượt lên 1000ms (1 giây) để chuyển động uyển chuyển, không bị giật cục
        grabCursor={true} // Cho phép đổi con trỏ thành bàn tay khi rê chuột vào slide
        autoplay={{
          delay: 3000, // 3 giây chuyển 1 lần
          disableOnInteraction: false, // Tiếp tục chạy autoplay sau khi người dùng click next/prev hoặc vuốt
          pauseOnMouseEnter: true, // Tạm dừng khi rê chuột vào banner để người dùng đọc nội dung
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        className="hero-swiper"
        style={{
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff',
          '--swiper-pagination-bullet-inactive-color': '#999',
          '--swiper-pagination-bullet-inactive-opacity': '0.6',
        }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div 
              className="d-flex align-items-center justify-content-center text-center text-white"
              style={{
                height: "85vh",
                backgroundImage: banner.bgImage,
                backgroundSize: "cover",
                backgroundPosition: "center",
                paddingTop: "70px",
                transform: "translateZ(0)", // Kích hoạt tăng tốc phần cứng trên từng slide
              }}
            >
              <div className="container px-3 z-1">
                <span 
                  className="badge px-3 py-2 mb-3 text-uppercase tracking-widest fw-semibold" 
                  style={{ backgroundColor: banner.badgeColor, color: "#fff", fontSize: "0.75rem" }}
                >
                  {banner.badge}
                </span>
                
                <h1 className="display-4 fw-black text-uppercase tracking-wider mb-3 text-white" style={{ letterSpacing: "-1px" }}>
                  {banner.title}
                </h1>
                
                <p className="lead mx-auto mb-4 text-light opacity-85" style={{ maxWidth: "600px", fontSize: "1rem" }}>
                  {banner.description}
                </p>
                
                <div className="d-flex justify-content-center gap-3">
                  <Link 
                    href={banner.buttonLink} 
                    className="btn btn-light rounded-pill px-4 py-3 fw-bold text-uppercase text-dark shadow-sm" 
                    style={{ fontSize: "0.85rem" }}
                  >
                    {banner.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
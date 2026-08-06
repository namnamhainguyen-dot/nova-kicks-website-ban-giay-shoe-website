import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import ToastProvider from "@/components/ToastProvider";
import clientPromise from "@/libs/mongodb";
import Link from "next/link";
import Image from "next/image";
import UserActions from "@/components/UserActions";
import NavbarLinks from "@/components/NavbarLinks";
import MobileMenu from "@/components/MobileMenu";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import "../global.css";

async function getCategories() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    const categoriesList = await db
      .collection("categories")
      .find({ status: "active" })
      .toArray();
    return categoriesList.map((cat) => ({
      ...cat,
      _id: String(cat._id),
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh mục từ MongoDB:", error);
    return [];
  }
}

export default async function Layout({ children }) {
  const categories = await getCategories();

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title>Nova Kicks - Premium Streetwear Hub</title>

        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />

        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="d-flex flex-column min-vh-100">
        <ToastProvider />
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              padding: "14px 20px",
              fontFamily: "'Inter', sans-serif",
            },
            success: {
              iconTheme: {
                primary: "#d87c3c",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#c73a2b",
                secondary: "#fff",
              },
            },
          }}
        />

        <CartProvider>
          <WishlistProvider>
            
            {/* ── THANH THÔNG BÁO PHÍA TRÊN ── */}
            <div className="nk-announcement-bar py-2 bg-dark text-white">
              <div className="container d-flex justify-content-between align-items-center">
                <div className="nk-announcement-content d-flex align-items-center gap-2 mx-auto mx-md-0">
                  <i className="fas fa-bolt text-warning"></i>
                  <span className="fw-medium" style={{ letterSpacing: "0.5px", fontSize: "0.78rem" }}>
                    FREESHIP TOÀN QUỐC CHO ĐƠN HÀNG TỪ 500K — MIỄN PHÍ ĐỔI TRẢ TRONG 30 NGÀY
                  </span>
                </div>
                <div className="d-none d-md-flex align-items-center gap-2 text-secondary" style={{ fontSize: "0.78rem" }}>
                  <span>|</span>
                  <span className="text-light">
                    HOTLINE HỖ TRỢ: <a href="tel:0931839732" className="text-warning text-decoration-none fw-bold">0931.839.732</a>
                  </span>
                </div>
              </div>
            </div>

            {/* ── NAVBAR CHÍNH ── */}
            <nav className="nk-nav shadow-sm bg-white py-3 sticky-top" id="mainNav" suppressHydrationWarning>
              <div className="container d-flex align-items-center justify-content-between">
                
                {/* Cụm Trái: Nút Hamburger Mobile & Logo */}
                <div className="d-flex align-items-center gap-3">
                  <MobileMenu categories={categories} />

                  <Link className="nk-brand d-flex align-items-center text-decoration-none" href="/">
                    <Image
                      src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"
                      alt="Nova Kicks Logo"
                      width={150}
                      height={44}
                      style={{
                        objectFit: "contain",
                        maxHeight: "40px",
                      }}
                      priority
                    />
                    <span className="brand-dot"></span>
                  </Link>
                </div>

                {/* Các liên kết chính (Hiển thị trên màn hình lớn) */}
                <div className="d-none d-lg-block">
                  <NavbarLinks />
                </div>

                {/* Giỏ hàng / Tài khoản */}
                <UserActions />
              </div>
            </nav>

            {/* ── CATEGORIES BAR (Thanh danh mục trượt) ── */}
            <div className="nk-categories-bar bg-white border-bottom py-2 shadow-none">
              <div className="container">
                <ul className="nk-categories-list d-flex align-items-center gap-4 overflow-x-auto m-0 list-unstyled py-1">
                  <li>
                    <Link href="/products" className="d-flex align-items-center text-decoration-none fw-bold text-dark">
                      <i className="fas fa-th text-warning me-2" style={{ fontSize: "0.75rem" }}></i>
                      Tất cả sản phẩm
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <Link href={`/products?categoryID=${cat._id}`} className="text-decoration-none text-secondary fw-semibold text-nowrap transition-colors hover-text-dark">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── NỘI DUNG CHÍNH ── */}
            <main className="flex-grow-1">{children}</main>

          </WishlistProvider>
        </CartProvider>

        {/* ── FOOTER CHÂN TRANG ── */}
        <footer className="nk-footer bg-dark text-light pt-5 pb-3 border-top border-secondary border-opacity-10">
          <div className="container py-4">
            <div className="row g-5">
              
              {/* Thông tin thương hiệu */}
              <div className="col-12 col-md-5">
                <div className="mb-3">
                  <Link className="nk-footer-brand d-inline-block text-decoration-none" href="/">
                    <Image
                      src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"
                      alt="Nova Kicks Logo"
                      width={180}
                      height={60}
                      style={{
                        objectFit: "contain",
                        filter: "brightness(0) invert(1)"
                      }}
                    />
                  </Link>
                </div>
                <p className="text-secondary mb-4" style={{ maxWidth: "340px", fontSize: "0.88rem", lineHeight: 1.7 }}>
                  <i className="fas fa-quote-left text-warning me-2 opacity-50"></i>
                  Nền tảng phân phối giày Streetwear cao cấp — nơi văn hóa đường phố gặp gỡ thiết kế đương đại và xu hướng thời trang đỉnh cao.
                </p>

                {/* Mạng xã hội */}
                <div className="social-links d-flex align-items-center gap-2">
                  <a href="#" className="btn btn-outline-secondary btn-sm text-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }} aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="btn btn-outline-secondary btn-sm text-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }} aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="#" className="btn btn-outline-secondary btn-sm text-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }} aria-label="Twitter"><i className="fab fa-x-twitter"></i></a>
                  <a href="#" className="btn btn-outline-secondary btn-sm text-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }} aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                  <a href="#" className="btn btn-outline-secondary btn-sm text-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }} aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="col-6 col-md-4">
                <p className="nk-footer-label text-warning fw-bold text-uppercase mb-3" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>
                  <i className="fas fa-headset me-2"></i> Liên hệ hỗ trợ
                </p>
                <ul className="nk-footer-links list-unstyled d-flex flex-column gap-3 mb-0" style={{ fontSize: "0.88rem" }}>
                  <li>
                    <a href="tel:0931839732" className="text-decoration-none text-secondary hover-text-white d-flex align-items-center gap-2">
                      <i className="fas fa-phone text-warning" style={{ width: "16px" }}></i>
                      0931 839 732
                    </a>
                  </li>
                  <li>
                    <a href="mailto:support@nova-kicks.com" className="text-decoration-none text-secondary hover-text-white d-flex align-items-center gap-2">
                      <i className="fas fa-envelope text-warning" style={{ width: "16px" }}></i>
                      support@nova-kicks.com
                    </a>
                  </li>
                  <li className="text-secondary d-flex align-items-start gap-2">
                    <i className="fas fa-location-dot text-warning mt-1" style={{ width: "16px" }}></i>
                    <span>123 CVPM Quang Trung, Quận 12, TP.HCM</span>
                  </li>
                </ul>
              </div>

              {/* Liên kết nhanh */}
              <div className="col-6 col-md-3">
                <p className="nk-footer-label text-warning fw-bold text-uppercase mb-3" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>
                  <i className="fas fa-link me-2"></i> Khám phá
                </p>
                <ul className="nk-footer-links list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: "0.88rem" }}>
                  <li><a href="/about" className="text-decoration-none text-secondary hover-text-white">Về chúng tôi</a></li>
                  <li><a href="/products" className="text-decoration-none text-secondary hover-text-white">Tất cả sản phẩm</a></li>
                  <li><a href="/new" className="text-decoration-none text-secondary hover-text-white">Tin tức & Sự kiện</a></li>
                  <li><a href="/contact" className="text-decoration-none text-secondary hover-text-white">Liên hệ trực tiếp</a></li>
                </ul>
              </div>

            </div>

            {/* Copyright */}
            <div className="nk-footer-copy border-top border-secondary border-opacity-10 mt-5 pt-4 d-flex justify-content-between align-items-center flex-wrap gap-2 text-secondary" style={{ fontSize: "0.78rem" }}>
              <span>
                <i className="far fa-copyright me-1"></i> 2026 Nova Kicks. All rights reserved.
              </span>
              <div className="d-flex align-items-center gap-3">
                <a href="#" className="text-decoration-none text-secondary hover-text-white">Chính sách bảo mật</a>
                <span className="opacity-50">|</span>
                <a href="#" className="text-decoration-none text-secondary hover-text-white">Điều khoản sử dụng</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Load Bootstrap JS */}
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}
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
            <div className="nk-announcement-bar">
              <div className="nk-announcement-content">
                <span>
                  <i className="fas fa-bolt" style={{ color: "var(--gold)" }}></i>
                  FREESHIP TOÀN QUỐC CHO ĐƠN HÀNG TỪ 500K — MIỄN PHÍ ĐỔI TRẢ TRONG 30 NGÀY
                </span>
                <span className="d-none d-md-inline-flex">|</span>
                <span className="d-none d-md-inline-flex">
                  HOTLINE HỖ TRỢ: <a href="tel:0931839732">0931.839.732</a>
                </span>
              </div>
            </div>

            {/* ── NAVBAR CHÍNH ── */}
            <nav className="nk-nav" id="mainNav" suppressHydrationWarning>
              <div className="container d-flex align-items-center justify-content-between">
                
                {/* Cụm Trái: Nút Hamburger Mobile & Logo */}
                <div className="d-flex align-items-center gap-2">
                  <MobileMenu categories={categories} />

                  <Link className="nk-brand" href="/">
                    <Image
                      src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"
                      alt="Nova Kicks Logo"
                      width={160}
                      height={48}
                      style={{
                        objectFit: "contain",
                        maxHeight: "44px",
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.04))",
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
            <div className="nk-categories-bar">
              <div className="container">
                <ul className="nk-categories-list">
                  <li>
                    <Link href="/products">
                      <i className="fas fa-th" style={{ marginRight: "6px", fontSize: "0.5rem" }}></i>
                      Tất cả
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <Link href={`/products?categoryID=${cat._id}`}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── NỘI DUNG CHÍNH ── */}
            <main>{children}</main>
          </WishlistProvider>
        </CartProvider>

        {/* ── FOOTER CHÂN TRANG ── */}
        <footer className="nk-footer">
          <div className="container">
            <div className="row justify-content-between g-4 g-lg-5">
              {/* Cột 1: Thông tin & Mạng xã hội */}
              <div className="col-12 col-md-4 col-lg-5">
                <div className="mb-3">
                  <Link className="nk-footer-brand" href="/">
                    <Image
                      src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"
                      alt="Nova Kicks Logo"
                      width={220}
                      height={80}
                      style={{
                        objectFit: "contain",
                        mixBlendMode: "multiply",
                      }}
                    />
                  </Link>
                </div>
                <p style={{ maxWidth: "320px", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  <i className="fas fa-quote-left" style={{ color: "var(--accent)", marginRight: "6px", opacity: 0.5 }}></i>
                  Nền tảng phân phối giày Streetwear cao cấp — nơi văn hóa đường phố gặp gỡ thiết kế đương đại.
                </p>

                {/* Mạng xã hội */}
                <div className="social-links">
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fab fa-x-twitter"></i></a>
                  <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                  <a href="#" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
                </div>
              </div>

              {/* Cột 2: Liên hệ */}
              <div className="col-6 col-md-4 col-lg-4">
                <p className="nk-footer-label">
                  <i className="fas fa-headset" style={{ marginRight: "8px", color: "var(--accent)" }}></i>
                  Liên hệ
                </p>
                <ul className="nk-footer-links">
                  <li>
                    <a href="tel:0931839732" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                      <i className="fas fa-phone" style={{ marginRight: "8px", color: "var(--accent)", width: "16px", textAlign: "right" }}></i>
                      <span>0931 839 732</span>
                    </a>
                  </li>
                  <li>
                    <a href="mailto:namnamhainguyen@gmail.com" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                      <i className="fas fa-envelope" style={{ marginRight: "8px", color: "var(--accent)", width: "16px", textAlign: "right" }}></i>
                      <span>namnamhainguyen@gmail.com</span>
                    </a>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                    <i className="fas fa-location-dot" style={{ marginRight: "8px", color: "var(--accent)", width: "26px", textAlign: "right", marginTop: "3px" }}></i>
                    <span>123 CVPM Quang Trung, Quận 12, TP.HCM</span>
                  </li>
                </ul>
              </div>

              {/* Cột 3: Liên kết */}
              <div className="col-6 col-md-3 col-lg-3">
                <p className="nk-footer-label">
                  <i className="fas fa-link" style={{ marginRight: "8px", color: "var(--accent)" }}></i>
                  Liên kết
                </p>
                <ul className="nk-footer-links">
                  <li><a href="/products">Sản phẩm</a></li>
                  <li><a href="/new">Tin tức</a></li>
                  <li><a href="/contact">Liên hệ</a></li>
                </ul>
              </div>
            </div>

            <div className="nk-footer-copy d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span>
                <i className="far fa-copyright" style={{ marginRight: "4px" }}></i>
                2026 Nova Kicks. All rights reserved.
              </span>
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.73rem" }}>
                  Chính sách bảo mật
                </a>
                <span style={{ color: "var(--border-medium)" }}>|</span>
                <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.73rem" }}>
                  Điều khoản sử dụng
                </a>
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
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import ToastProvider from "@/components/ToastProvider";
import clientPromise from "@/libs/mongodb";
import Link from "next/link";
import Image from "next/image";
import UserActions from "@/components/UserActions";
import NavbarLinks from "@/components/NavbarLinks";
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
    return categoriesList.map(cat => ({
      ...cat,
      _id: String(cat._id)
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nova Kicks - Premium Streetwear Hub</title>
        
        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
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
              borderRadius: '12px',
              background: '#fff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              padding: '14px 20px',
              fontFamily: "'Inter', sans-serif",
            },
            success: {
              iconTheme: {
                primary: '#d87c3c',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#c73a2b',
                secondary: '#fff',
              },
            },
          }}
        />


        <CartProvider>
          <WishlistProvider>
            
            {/* ── THANH THÔNG BÁO PHÍA TRÊN (ANNOUNCEMENT BAR) ── */}
            <div className="nk-announcement-bar">
              <div className="nk-announcement-content">
                <span>
                  <i className="fas fa-bolt" style={{ color: 'var(--gold)' }}></i>
                  FREESHIP TOÀN QUỐC CHO ĐƠN HÀNG TỪ 500K — MIỄN PHÍ ĐỔI TRẢ TRONG 30 NGÀY
                </span>
                <span className="d-none d-md-inline-flex">|</span>
                <span className="d-none d-md-inline-flex">
                  HOTLINE HỖ TRỢ: <a href="tel:0931839732">0931.839.732</a>
                </span>
              </div>
            </div>

            {/* ── NAVBAR CHÍNH NÂNG CẤP ── */}
            <nav className="nk-nav" id="mainNav" suppressHydrationWarning>
              <div className="container">
                <Link className="nk-brand" href="/">
                  <Image 
                    src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"
                    alt="Nova Kicks Logo" 
                    width={160}
                    height={48}
                    style={{ 
                      objectFit: 'contain',
                      maxHeight: '44px',
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.04))'
                    }} 
                    priority 
                  />
                  <span className="brand-dot"></span>
                </Link>

                <NavbarLinks />

                <UserActions />
              </div>
            </nav>

            {/* ── CATEGORIES BAR NÂNG CẤP ── */}
            <div className="nk-categories-bar">
              <div className="container">
                <ul className="nk-categories-list">
                  <li>
                    <Link href="/products">
                      <i className="fas fa-th" style={{ marginRight: '6px', fontSize: '0.5rem' }}></i>
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
            
            {/* ── CONTENT ── */}
            <main>
              {children}
            </main>

          </WishlistProvider>
        </CartProvider>

        {/* ── FOOTER NÂNG CẤP ── */}
        <footer className="nk-footer">
          <div className="container">
            <div className="row g-5">
              <div className="col-md-5">
                <div className="mb-3">
                  <Link className="nk-footer-brand" href="/">
                    <Image 
                      src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"
                      alt="Nova Kicks Logo" 
                      width={300} 
                      height={200} 
                      style={{ 
                        objectFit: 'contain',
                        mixBlendMode: 'multiply'
                      }} 
                    />
                  </Link>
                </div>
                <p style={{ maxWidth: '320px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  <i className="fas fa-quote-left" style={{ color: 'var(--accent)', marginRight: '6px', opacity: 0.5 }}></i>
                  Nền tảng phân phối giày Streetwear cao cấp — nơi văn hóa đường phố gặp gỡ thiết kế đương đại.
                </p>
                
                {/* Social Links */}
                <div className="social-links">
                  <a href="#" aria-label="Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" aria-label="Twitter">
                    <i className="fab fa-x-twitter"></i>
                  </a>
                  <a href="#" aria-label="YouTube">
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a href="#" aria-label="TikTok">
                    <i className="fab fa-tiktok"></i>
                  </a>
                </div>
              </div>
 
              <div className="col-6 col-md-4">
                <p className="nk-footer-label">
                  <i className="fas fa-headset" style={{ marginRight: '8px', color: 'var(--accent)' }}></i>
                  Liên hệ
                </p>
                <ul className="nk-footer-links">
                  <li>
                    <a href="tel:0931839732">
                      <i className="fas fa-phone" style={{ marginRight: '8px', color: 'var(--accent)', width: '16px' }}></i>
                      0931 839 732
                    </a>
                  </li>
                  <li>
                    <a href="mailto:support@nova-kicks.com">
                      <i className="fas fa-envelope" style={{ marginRight: '8px', color: 'var(--accent)', width: '16px' }}></i>
                      support@nova-kicks.com
                    </a>
                  </li>
                  <li style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-location-dot" style={{ color: 'var(--accent)', width: '16px' }}></i>
                    123 CVPM Quang Trung, Quận 12, TP.HCM
                  </li>
                  <li style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-clock" style={{ color: 'var(--accent)', width: '16px' }}></i>
                    09:00 – 22:00 hàng ngày
                  </li>
                </ul>
              </div>
              
              <div className="col-6 col-md-3">
                <p className="nk-footer-label">
                  <i className="fas fa-link" style={{ marginRight: '8px', color: 'var(--accent)' }}></i>
                  Liên kết
                </p>
                <ul className="nk-footer-links">
                  <li><a href="/about">Giới thiệu</a></li>
                  <li><a href="/products">Sản phẩm</a></li>
                  <li><a href="/new">Tin tức</a></li>
                  <li><a href="/contact">Liên hệ</a></li>
                </ul>
              </div>
            </div>
            
            <div className="nk-footer-copy d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span>
                <i className="far fa-copyright" style={{ marginRight: '4px' }}></i>
                2026 Nova Kicks. All rights reserved.
              </span>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.73rem', transition: 'color 0.3s' }}>
                  Chính sách bảo mật
                </a>
                <span style={{ color: 'var(--border-medium)' }}>|</span>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.73rem', transition: 'color 0.3s' }}>
                  Điều khoản sử dụng
                </a>
              </div>
            </div>
          </div>
        </footer>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
        
        {/* Scroll effect script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('scroll', function() {
              const nav = document.getElementById('mainNav');
              if (window.scrollY > 50) {
                nav.classList.add('scrolled');
              } else {
                nav.classList.remove('scrolled');
              }
            });
          `
        }} />
      </body>
    </html>
  );
}
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import clientPromise from "@/libs/mongodb";
import Link from "next/link";
import Image from "next/image";
import UserActions from "@/components/UserActions";
import NavbarLinks from "@/components/NavbarLinks"; // Import component NavbarLinks mới
import { Toaster } from "react-hot-toast";

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
    <html lang="vi">
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
        <style>{`
          html, body { height: 100%; }
          
          :root {
            --background: #ffffff;
            --surface: #f8f9fa;
            --surface-card: #ffffff;
            --surface-hover: #f1f3f5;
            --border-light: rgba(0, 0, 0, 0.06);
            --border-medium: rgba(0, 0, 0, 0.12);
            --text-primary: #111111;
            --text-secondary: #555555;
            --text-muted: #8e969f;
            --accent: #d87c3c;
            --accent-dark: #bd622c;
            --accent-light: rgba(216, 124, 60, 0.08);
            --accent-glow: rgba(216, 124, 60, 0.15);
            --accent-hover: #b85a28;
            --danger: #c73a2b;
            --gold: #cc9c5f;
            --success: #2c6e4f;
            --radius-sm: 4px;
            --radius-md: 12px;
            --radius-lg: 24px;
            --radius-xl: 32px;
            --shadow-sm: 0 2px 12px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
            --shadow-md: 0 8px 28px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.02);
            --shadow-hover: 0 20px 48px rgba(0,0,0,0.10), 0 4px 14px rgba(0,0,0,0.03);
            --shadow-glow: 0 0 40px rgba(216, 124, 60, 0.15);
            --font-display: 'Barlow Condensed', sans-serif;
            --font-body: 'Inter', 'Space Grotesk', system-ui, sans-serif;
          }
          
          *, *::before, *::after { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          
          body {
            display: flex;
            flex-direction: column;
            background-color: var(--background) !important;
            color: var(--text-primary);
            font-family: var(--font-body);
            font-size: 15px;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            min-height: 100vh;
            transition: all 0.3s ease;
          }
          
          main { 
            padding-top: 112px; 
            background-color: var(--background); 
            flex: 1;
            animation: fadeInMain 0.6s ease;
          }
          
          @keyframes fadeInMain {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* ── NAVBAR CHÍNH NÂNG CẤP ── */
          .nk-nav {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.88) !important;
            backdrop-filter: blur(20px) saturate(1.2);
            -webkit-backdrop-filter: blur(20px) saturate(1.2);
            border-bottom: 1px solid var(--border-light);
            height: 72px;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
          }
          
          .nk-nav.scrolled {
            box-shadow: 0 4px 30px rgba(0,0,0,0.06);
          }
          
          .nk-nav .container { 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            max-width: 1400px;
          }
          
          /* ── BRAND NÂNG CẤP ── */
          .nk-brand {
            display: flex;
            align-items: center;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            height: 100%;
            position: relative;
          }
          
          .nk-brand::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--accent), var(--gold));
            transition: width 0.4s ease;
          }
          
          .nk-brand:hover::after {
            width: 100%;
          }
          
          .nk-brand:hover {
            opacity: 1;
            transform: scale(1.02);
          }
          
          .nk-brand .brand-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            background: var(--accent);
            border-radius: 50%;
            margin-left: 4px;
            animation: pulseDot 2s ease-in-out infinite;
          }
          
          @keyframes pulseDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.5); }
          }
          
          /* ── NAV LINKS NÂNG CẤP ── */
          .nk-links { 
            display: flex; 
            align-items: center; 
            gap: 2.5rem; 
            list-style: none; 
            margin: 0; 
            padding: 0; 
          }
          
          .nk-links a { 
            font-size: 0.72rem; 
            font-weight: 700; 
            letter-spacing: 0.12em; 
            text-transform: uppercase; 
            color: var(--text-secondary); 
            text-decoration: none; 
            transition: all 0.3s ease; 
            position: relative;
            padding: 4px 0;
            display: inline-block;
          }
          
          .nk-links a::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -4px;
            left: 50%;
            background: linear-gradient(90deg, var(--accent), var(--gold));
            transition: all 0.3s ease-in-out;
            transform: translateX(-50%);
            border-radius: 2px;
          }
          
          .nk-links a:hover::after,
          .nk-links a.active::after { 
            width: 100%;
          }
          
          .nk-links a:hover { 
            color: var(--text-primary);
          }
          
          .nk-links a.active { 
            color: var(--accent);
          }
          
          /* ── CATEGORIES BAR NÂNG CẤP ── */
          .nk-categories-bar {
            position: fixed;
            top: 72px; left: 0; right: 0;
            z-index: 999;
            background: rgba(255, 255, 255, 0.92) !important;
            backdrop-filter: blur(12px) saturate(1.1);
            -webkit-backdrop-filter: blur(12px) saturate(1.1);
            border-bottom: 1px solid var(--border-light);
            height: 48px;
            display: flex;
            align-items: center;
          }
          
          .nk-categories-bar .container {
            max-width: 1400px;
          }
          
          .nk-categories-list { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 2.8rem; 
            list-style: none; 
            margin: 0 auto; 
            padding: 0;
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          
          .nk-categories-list::-webkit-scrollbar {
            display: none;
          }
          
          .nk-categories-list a { 
            font-size: 0.65rem; 
            font-weight: 700; 
            letter-spacing: 0.16em; 
            text-transform: uppercase; 
            color: var(--text-muted); 
            text-decoration: none; 
            transition: all 0.3s ease;
            position: relative;
            white-space: nowrap;
            padding: 4px 0;
            display: inline-block;
          }
          
          .nk-categories-list a::before {
            content: '✦';
            opacity: 0;
            margin-right: 4px;
            transition: all 0.3s ease;
            color: var(--accent);
          }
          
          .nk-categories-list a:hover::before {
            opacity: 1;
          }
          
          .nk-categories-list a:hover { 
            color: var(--text-primary);
            transform: translateY(-1px);
          }
          
          .nk-categories-list a::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -4px;
            left: 50%;
            background: linear-gradient(90deg, var(--accent), var(--gold));
            transition: all 0.3s ease-in-out;
            transform: translateX(-50%);
            border-radius: 2px;
          }
          
          .nk-categories-list a:hover::after,
          .nk-categories-list a.active::after {
            width: 100%;
          }

          /* ── USER ACTIONS / NK-ACTIONS ── */
          .nk-actions {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .nk-actions li {
            list-style: none;
            margin: 0;
          }

          .nk-actions a {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--text-secondary);
            text-decoration: none;
            transition: all 0.3s ease;
          }

          .nk-actions a:hover {
            color: var(--text-primary);
          }

          /* ── HIỆU ỨNG ANIMATION CHO DROPDOWN MENU ── */
          .nk-actions .nav-item.dropdown {
            position: relative;
          }

          .nk-actions .nav-item.dropdown .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            left: auto;
            min-width: 160px;
            
            display: block;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s ease-in-out;
          }

          .nk-actions .nav-item.dropdown:hover .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(4px);
          }

          .nk-actions .badge {
            padding: 0.25em 0.45em;
            font-weight: 600;
            background-color: var(--accent) !important;
          }
          
          /* ── FOOTER NÂNG CẤP ── */
          .nk-footer { 
            background: linear-gradient(180deg, #fafbfc 0%, #f1f3f5 100%) !important;
            border-top: 1px solid var(--border-light);
            padding: 4rem 0 2.5rem;
            margin-top: auto;
          }
          
          .nk-footer-brand {
            display: flex;
            align-items: center;
            text-decoration: none;
            transition: transform 0.3s ease;
          }
          
          .nk-footer-brand:hover {
            transform: scale(1.02);
          }
          
          .nk-footer-links { 
            list-style: none; 
            padding: 0; 
            margin: 0; 
          }
          
          .nk-footer-links li { 
            margin-bottom: 0.6rem; 
          }
          
          .nk-footer-links a { 
            color: var(--text-secondary); 
            text-decoration: none; 
            font-size: 0.85rem; 
            transition: all 0.3s ease;
            position: relative;
            padding-left: 0;
          }
          
          .nk-footer-links a::before {
            content: '→';
            opacity: 0;
            margin-right: 0;
            transition: all 0.3s ease;
            display: inline-block;
          }
          
          .nk-footer-links a:hover {
            color: var(--accent);
            padding-left: 16px;
          }
          
          .nk-footer-links a:hover::before {
            opacity: 1;
            margin-right: 8px;
          }
          
          .nk-footer-label { 
            font-family: var(--font-display); 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 0.08em; 
            margin-bottom: 1.2rem; 
            color: var(--text-primary);
            font-size: 1.1rem;
          }
          
          .nk-footer-label::after {
            content: '';
            display: block;
            width: 30px;
            height: 2px;
            background: var(--accent);
            margin-top: 8px;
          }
          
          .nk-footer-copy { 
            margin-top: 2.5rem; 
            padding-top: 1.5rem; 
            border-top: 1px solid var(--border-light); 
            color: var(--text-muted); 
            font-size: 0.78rem; 
          }
          
          .nk-footer-copy a {
            transition: color 0.3s ease;
          }
          
          .nk-footer-copy a:hover {
            color: var(--accent) !important;
          }
          
          /* ── SOCIAL ICONS ── */
          .social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
          }
          
          .social-links a {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--surface);
            color: var(--text-secondary);
            transition: all 0.3s ease;
            text-decoration: none;
            font-size: 1rem;
            border: 1px solid var(--border-light);
          }
          
          .social-links a:hover {
            background: var(--accent);
            color: #fff;
            transform: translateY(-3px);
            box-shadow: var(--shadow-glow);
            border-color: var(--accent);
          }
          
          /* ── RESPONSIVE ── */
          @media (max-width: 768px) {
            main { padding-top: 100px; }
            .nk-nav { height: 64px; }
            .nk-categories-bar { 
              top: 64px;
              height: 40px;
              overflow-x: auto;
            }
            .nk-categories-list { 
              gap: 1.5rem;
              padding: 0 1rem;
              justify-content: flex-start;
            }
            .nk-links { gap: 1.2rem; }
            .nk-links a { font-size: 0.6rem; letter-spacing: 0.08em; }
          }
          
          @media (max-width: 576px) {
            .nk-links { gap: 0.8rem; }
            .nk-links a { font-size: 0.5rem; letter-spacing: 0.06em; }
            .nk-categories-list { gap: 1rem; }
            .nk-categories-list a { font-size: 0.55rem; }
          }
        `}</style>
      </head>
      <body className="d-flex flex-column min-vh-100">
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

                {/* Sử dụng component NavbarLinks đã được tách rời */}
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
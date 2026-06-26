import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext"; // 1. Import Wishlist ở đây
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nova Kicks - Premium Streetwear Hub</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Barlow+Condensed:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          /* ── TOKENS & RESET CHUYỂN TOÀN BỘ SANG LIGHT THEME (GIAO DIỆN SÁNG CAO CẤP) ──────── */
          html,
          body {
            height: 100%;
          }

          :root {
            --background:     #ffffff; /* Đổi sang nền trắng chuẩn */
            --surface:        #f8f9fa; /* Màu nền phụ xám siêu nhẹ để phân tầng nội dung */
            --surface-card:   #ffffff; /* Nền thẻ sản phẩm màu trắng nổi bật trên nền phụ */
            --surface-hover:  #f1f3f5;
            --border-light:   rgba(0, 0, 0, 0.06); /* Border mờ tối trên nền sáng */
            --border-medium:  rgba(0, 0, 0, 0.12);
            --text-primary:   #111111; /* Màu chữ chính: Đen sẫm sắc nét */
            --text-secondary: #555555; /* Chữ phụ: Xám đậm dễ đọc */
            --text-muted:     #8e969f; /* Chữ ẩn / chú thích */
            --accent:         #d87c3c;    
            --accent-light:   rgba(216,124,60,0.08);
            --accent-glow:    rgba(216,124,60,0.15);
            --accent-hover:   #bd622c;
            --danger:         #c73a2b;
            --gold:           #cc9c5f;
            --success:        #2c6e4f;
            
            --radius-sm:     4px;
            --radius-md:     10px;
            --radius-lg:     20px;
            --shadow-sm:     0 2px 12px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
            --shadow-md:     0 8px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.02);
            --shadow-hover:  0 16px 36px rgba(0,0,0,0.1), 0 4px 14px rgba(0,0,0,0.04);
            
            --font-display:  'Barlow Condensed', sans-serif;
            --font-body:     'Space Grotesk', system-ui, sans-serif;
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
            min-height: 100vh;
          }

          /* Tăng padding-top từ 68px lên 112px để không bị đè nội dung do có thêm thanh categories cố định */
          main {
            padding-top: 112px;
            background-color: var(--background);
            flex: 1;
          }

          /* Giữ nguyên class bắt buộc hiển thị chữ trắng (cho nội dung trên ảnh nền Hero banner) */
          .nk-text-white-forced {
            color: #ffffff !important;
          }

          /* ── STYLE CHO TRANG HOME & HERO SECTIONS ──────── */
          .page-home {
            background: var(--background);
          }

          .hero-section {
            position: relative;
            min-height: 80vh;
            background-image: url('https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg');
            background-size: cover;
            background-position: center;
            overflow: hidden;
          }

          /* Lớp phủ đen mờ trên ảnh banner để giữ tương phản cho chữ trắng phía trên */
          .hero-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
          }

          .hero-title {
            font-size: clamp(3rem, 5vw, 5rem);
            line-height: 1.02;
            letter-spacing: 0.18em;
            max-width: 640px;
            color: #ffffff;
          }

          .hero-line-group {
            margin-top: 1rem;
          }

          .hero-line {
            display: inline-block;
            height: 4px;
            width: 42px;
            border-radius: 999px;
          }

          .hero-line-white {
            background: #fff;
          }

          .hero-line-secondary {
            background: rgba(255, 255, 255, 0.3);
          }

          /* Kính mờ phong cách Light Mode (Frosted Glass trắng nhẹ) */
          .glass-card {
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          }

          .glass-card:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.85);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
          }

          /* ── TYPOGRAPHY & HEADERS ───────────────────────── */
          .font-display { font-family: var(--font-display); }

          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-display);
            font-weight: 700;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            line-height: 1.2;
            color: var(--text-primary);
          }

          .display-hero {
            font-family: var(--font-display);
            font-size: clamp(3.5rem, 9vw, 7rem);
            font-weight: 800;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            line-height: 0.92;
            color: var(--text-primary);
          }

          .label-caps {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--text-muted);
          }

          /* ── NAVBAR ĐÃ CHUYỂN SANG LIGHT MODE (SÁNG SỦA, CAO CẤP) ───────────────── */
          .nk-nav {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.85) !important; /* Nền trắng mờ đổ hiệu ứng kính gương */
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-light);
            height: 68px;
            display: flex;
            align-items: center;
          }

          .nk-nav .container {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .nk-brand {
            font-family: var(--font-display);
            font-size: 1.6rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #111111 !important; /* Chữ thương hiệu màu đen */
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .nk-brand-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--accent);
            display: inline-block;
            flex-shrink: 0;
          }

          .nk-links {
            display: flex;
            align-items: center;
            gap: 2rem;
            list-style: none;
            margin: 0; padding: 0;
          }

          .nk-links a {
            font-size: 0.74rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.2s;
            position: relative;
          }

          .nk-links a:hover,
          .nk-links a.active { color: var(--accent); }

          .nk-links a.active::after {
            content: '';
            position: absolute;
            bottom: -6px; left: 0; right: 0;
            height: 2px;
            background: var(--accent);
            border-radius: 2px;
          }

          .nk-actions {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            list-style: none;
            margin: 0; padding: 0;
          }

          .nk-actions a {
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.2s;
          }

          .nk-actions a:hover { color: var(--text-primary); }

          .btn-nk-outline {
            font-size: 0.7rem !important;
            font-weight: 600 !important;
            letter-spacing: 0.12em !important;
            text-transform: uppercase !important;
            color: #111111 !important;
            border: 1px solid #111111 !important;
            background: transparent !important;
            padding: 0.4rem 1rem !important;
            border-radius: 30px !important;
            text-decoration: none;
            transition: all 0.2s !important;
          }

          .btn-nk-outline:hover {
            background: #111111 !important;
            color: #ffffff !important;
            border-color: #111111 !important;
          }

          .nk-cart-link { position: relative; }

          /* ── STYLE NEW: THANH CATEGORIES PHỤ (SUB-NAVBAR) ── */
          .nk-categories-bar {
            position: fixed;
            top: 68px; left: 0; right: 0;
            z-index: 999;
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-bottom: 1px solid var(--border-light);
            height: 44px;
            display: flex;
            align-items: center;
          }

          .nk-categories-list {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2.5rem;
            list-style: none;
            margin: 0 auto; padding: 0;
          }

          .nk-categories-list a {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--text-muted);
            text-decoration: none;
            transition: color 0.2s, transform 0.2s;
          }

          .nk-categories-list a:hover {
            color: var(--text-primary);
          }

          /* ── CARDS & PRODUCTS LIGHT THEME ────────────────── */
          .nk-card {
            background: var(--surface-card);
            border-radius: 0px; /* Làm phẳng góc nhọn tăng tính góc cạnh streetwear */
            overflow: hidden;
            transition: transform 0.25s ease, box-shadow 0.3s ease;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-light);
          }

          .nk-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
            border-color: var(--border-medium);
          }

          .nk-card-img {
            aspect-ratio: 1 / 1;
            overflow: hidden;
            background: #f9f9f9;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .nk-card-img img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 1.2rem;
            transition: transform 0.4s ease;
          }

          .nk-card:hover .nk-card-img img {
            transform: scale(1.06);
          }

          .nk-card-body {
            padding: 1rem 1.1rem 1.2rem;
            border-top: 1px solid var(--border-light);
            background: var(--surface-card);
          }

          .nk-card-title {
            color: var(--text-primary);
          }

          .nk-price {
            color: var(--text-primary);
          }

          /* ── UTILS & SECTION HEADERS ────────────────────── */
          .nk-section-head {
            border-bottom: 2px solid var(--border-light);
          }

          .nk-section-title {
            color: var(--text-primary);
          }

          .experience-section { background: var(--surface); }

          .map-panel {
            background: var(--surface-card);
            border: 1px solid var(--border-light);
          }

          /* ── FOOTER LIGHT THEME ────────────────────────── */
          .nk-footer {
            background: #f8f9fa !important; /* Chân trang xám trắng nhẹ sang trọng */
            border-top: 1px solid var(--border-light);
            padding: 3rem 0 2rem;
            margin-top: auto;
          }

          .nk-footer-brand {
            color: var(--text-primary);
            font-family: var(--font-display);
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .nk-footer p {
            color: var(--text-secondary);
          }

          .nk-footer-links {
            list-style: none;
            padding: 0; margin: 0;
          }

          .nk-footer-links li {
            margin-bottom: 0.5rem;
          }

          .nk-footer-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.88rem;
            transition: color 0.2s;
          }

          .nk-footer-links a:hover { color: var(--accent); }

          .nk-footer-label {
            font-family: var(--font-display);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
            color: var(--text-primary);
          }

          .nk-footer-copy {
            margin-top: 2.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border-light);
            color: var(--text-muted);
            font-size: 0.82rem;
          }

          .bg-soft { background-color: var(--surface) !important; }
          .bg-card-white { background-color: var(--surface-card) !important; }
        `}</style>
      </head>
      <body className="d-flex flex-column min-vh-100">

        {/* 2. Bọc hai lớp Provider bao ngoài hệ thống */}
        <CartProvider>
          <WishlistProvider>
            
            {/* ── NAVBAR CHÍNH ── */}
            <nav className="nk-nav">
              <div className="container">
                <Link className="nk-brand" href="/">
                  <span className="nk-brand-dot"></span>
                  NOVA KICKS
                </Link>

                <ul className="nk-links">
                  <li><Link href="/" className="active">Trang chủ</Link></li>
                  <li><Link href="/products">Bộ sưu tập</Link></li>
                  <li><Link href="/about">Thương hiệu</Link></li>
                </ul>

                <ul className="nk-actions">
                  {/* TÍNH NĂNG MỚI: Thêm nút Yêu Thích lên thanh Header */}
                  <li>
                    <Link href="/wishlist" style={{color:'var(--text-secondary)', textDecoration:'none', fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase'}}>
                      Yêu thích
                    </Link>
                  </li>
                  <li>
                    <Link href="/cart" className="nk-cart-link" style={{color:'var(--text-secondary)', textDecoration:'none', fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', position:'relative'}}>
                      Giỏ hàng
                    </Link>
                  </li>
                  <li><Link href="/login">Đăng nhập</Link></li>
                  <li><Link href="/register" className="btn-nk-outline">Đăng ký</Link></li>
                </ul>
              </div>
            </nav>

            {/* ── THANH DANH MỤC SẢN PHẨM MỚI (CATEGORIES BAR) ── */}
            <div className="nk-categories-bar">
              <div className="container">
                <ul className="nk-categories-list">
                  <li><Link href="/products?categoryID=CAT-G001">Nike</Link></li>
                  <li><Link href="/products?categoryID=CAT-G002">Jordan</Link></li>
                  <li><Link href="/products?categoryID=CAT-G003">Adidas</Link></li>
                  <li><Link href="/products?categoryID=CAT-G004">Yeezy</Link></li>
                  <li><Link href="/products?categoryID=CAT-G005">New Balance</Link></li>
                  <li><Link href="/products?categoryID=CAT-G006">Phụ kiện</Link></li>
                </ul>
              </div>
            </div>
            

            {/* ── CONTENT ── */}
            <main>
              {children}
            </main>

          </WishlistProvider>
        </CartProvider>

        {/* ── FOOTER ── */}
        <footer className="nk-footer">
          <div className="container">
            <div className="row g-5">
              <div className="col-md-5">
                <div className="nk-footer-brand mb-3">
                  <span style={{color:'var(--accent)'}}>●</span> NOVA KICKS
                </div>
                <p style={{maxWidth:'320px'}}>
                  Nền tảng phân phối giày Streetwear cao cấp — nơi văn hóa đường phố gặp gỡ thiết kế đương đại.
                </p>
              </div>
              <div className="col-6 col-md-3">
                <p className="nk-footer-label">Khám phá</p>
                <ul className="nk-footer-links">
                  <li><Link href="/products">Bộ sưu tập</Link></li>
                  <li><Link href="/">Hàng mới về</Link></li>
                  <li><Link href="/">Flash Sale</Link></li>
                  <li><Link href="/">Tin tức & biên tập</Link></li>
                  <li><Link href="/about">Thương hiệu</Link></li>
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <p className="nk-footer-label">Liên hệ</p>
                <ul className="nk-footer-links">
                  <li><a href="tel:0123456789">0123 456 789</a></li>
                  <li><a href="mailto:support@nova-kicks.com">support@nova-kicks.com</a></li>
                  <li style={{color:'var(--text-secondary)', fontSize:'0.82rem'}}>123 Phố Tràng Tiền, HN</li>
                  <li style={{color:'var(--text-secondary)', fontSize:'0.82rem'}}>09:00 – 22:00 hàng ngày</li>
                </ul>
              </div>
            </div>
            <div className="nk-footer-copy d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span>© 2026 Nova Kicks. All rights reserved.</span>
              <div style={{display:'flex', gap:'1.5rem'}}>
                <a href="#" style={{color:'var(--text-muted)', textDecoration:'none', fontSize:'0.73rem'}}>Chính sách bảo mật</a>
                <a href="#" style={{color:'var(--text-muted)', textDecoration:'none', fontSize:'0.73rem'}}>Điều khoản sử dụng</a>
              </div>
            </div>
          </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
}
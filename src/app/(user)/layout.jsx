import { CartProvider } from "@/components/CartContext";
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
          /* ── TOKENS & RESET (ĐỒNG BỘ TỪ STYLE.CSS) ──────── */
          html,
          body {
            height: 100%;
          }

          :root {
            --background:     #ffffff; 
            --surface:        #fafafa; 
            --surface-card:   #ffffff;
            --surface-hover:  #f5f5f5;
            --border-light:   rgba(0,0,0,0.08);
            --border-medium:  rgba(0,0,0,0.12);
            --text-primary:   #111111; 
            --text-secondary: #4a4a4a;
            --text-muted:     #8a8a8a;
            --accent:         #d87c3c;    
            --accent-light:   rgba(216,124,60,0.12);
            --accent-glow:    rgba(216,124,60,0.2);
            --accent-hover:   #bd622c;
            --danger:         #c73a2b;
            --gold:           #cc9c5f;
            --success:        #2c6e4f;
            
            --radius-sm:     4px;
            --radius-md:     10px;
            --radius-lg:     20px;
            --shadow-sm:     0 2px 8px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03);
            --shadow-md:     0 8px 20px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.02);
            --shadow-hover:  0 14px 28px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
            
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

          main {
            padding-top: 68px;
            background-color: var(--background);
            flex: 1; /* chiếm khoảng trống để đẩy footer xuống */
          }

          /* ── CLASS ÉP CHỮ SANG MÀU TRẮNG THEO YÊU CẦU ── */
          .nk-text-white-forced {
            color: #ffffff !important;
          }

          /* ── STYLE CHO TRANG HOME & HERO SECTIONS ──────── */
          .page-home {
            background: linear-gradient(180deg, #ffffff 0%, #ffffff 100%);
          }

          .hero-section {
            position: relative;
            min-height: 80vh;
            background-image: url('https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg');
            background-size: cover;
            background-position: center;
            overflow: hidden;
          }

          .hero-overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.62);
          }

          .hero-title {
            font-size: clamp(3rem, 5vw, 5rem);
            line-height: 1.02;
            letter-spacing: 0.18em;
            max-width: 640px;
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
            background: rgba(255, 255, 255, 0.55);
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 28px 80px rgba(0, 0, 0, 0.18);
            backdrop-filter: blur(18px);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          .glass-card:hover {
            transform: translateY(-4px);
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

          .section-title {
            letter-spacing: 0.18em;
          }

          /* ── NAVBAR ─────────────────────────────────────── */
          .nk-nav {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            background: rgba(255,255,255,0.92) !important;
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
            color: var(--text-primary) !important;
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

          .nk-actions a:hover { color: var(--accent); }

          .btn-nk-outline {
            font-size: 0.7rem !important;
            font-weight: 600 !important;
            letter-spacing: 0.12em !important;
            text-transform: uppercase !important;
            color: var(--accent) !important;
            border: 1px solid var(--accent) !important;
            background: transparent !important;
            padding: 0.4rem 1rem !important;
            border-radius: 30px !important;
            text-decoration: none;
            transition: all 0.2s !important;
          }

          .btn-nk-outline:hover {
            background: var(--accent) !important;
            color: white !important;
            border-color: var(--accent) !important;
          }

          .btn-nk-gold {
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: white !important;
            background: var(--accent);
            border: none;
            padding: 0.5rem 1.25rem;
            border-radius: 30px;
            text-decoration: none;
            transition: all 0.2s;
            display: inline-block;
          }

          .btn-nk-gold:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(216,124,60,0.25);
          }

          .nk-cart-link { position: relative; }

          .nk-cart-badge {
            position: absolute;
            top: -6px; right: -10px;
            width: 16px; height: 16px;
            background: var(--accent);
            color: white;
            font-size: 9px;
            font-weight: 700;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* ── CARDS & PRODUCTS ───────────────────────────── */
          .product-card {
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 32px 90px rgba(0, 0, 0, 0.22);
          }

          .product-img-wrap {
            height: 240px;
            background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
          }

          .product-img {
            object-fit: contain;
            max-height: 100%;
            transition: transform 0.35s ease;
          }

          .product-card:hover .product-img {
            transform: scale(1.06);
          }

          .nk-card {
            background: var(--surface-card);
            border-radius: var(--radius-lg);
            overflow: hidden;
            transition: transform 0.25s ease, box-shadow 0.3s ease;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-light);
          }

          .nk-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
            border-color: transparent;
          }

          .nk-card-img {
            aspect-ratio: 1 / 1;
            overflow: hidden;
            background: linear-gradient(145deg, #f6f6f6 0%, #fff 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .nk-card-img img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 1.2rem;
            transition: transform 0.5s cubic-bezier(0.2,0.9,0.4,1.1);
          }

          .nk-card:hover .nk-card-img img {
            transform: scale(1.05);
          }

          .nk-card-body {
            padding: 1rem 1.1rem 1.2rem;
            border-top: 1px solid var(--border-light);
            background: white;
          }

          .nk-card-title {
            font-family: var(--font-display);
            font-size: 1rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--text-primary);
            margin-bottom: 0.2rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nk-card-desc {
            font-size: 0.78rem;
            color: var(--text-muted);
            margin-bottom: 0.6rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .nk-price {
            font-family: var(--font-display);
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent);
            letter-spacing: 0.02em;
          }

          /* ── FLASH SALE & TIMERS ───────────────────────── */
          .sale-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 1.5rem;
          }

          .sale-card-image {
            height: 200px;
          }

          .sale-card-image img {
            object-fit: contain;
          }

          .sale-timer {
            align-items: center;
          }

          .timer-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 42px;
            border-radius: 0.85rem;
            background: rgba(255, 255, 255, 0.08);
            padding: 0.65rem 0.75rem;
          }

          .nk-timer-block {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .nk-timer-digit {
            background: white;
            border: 1px solid var(--border-medium);
            font-family: var(--font-display);
            font-size: 1rem;
            font-weight: 700;
            padding: 0.2rem 0.5rem;
            border-radius: var(--radius-sm);
            color: var(--text-primary);
            letter-spacing: 0.04em;
            min-width: 2.2rem;
            text-align: center;
          }

          .nk-timer-sep {
            color: var(--text-muted);
            font-weight: 700;
            margin: 0 2px;
          }

          /* ── SECTION HEADERS & UTILS ────────────────────── */
          .nk-section-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            padding-bottom: 0.75rem;
            margin-bottom: 2rem;
            border-bottom: 2px solid var(--border-light);
          }

          .nk-section-title {
            font-family: var(--font-display);
            font-size: 1.7rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--text-primary);
          }

          .nk-section-link {
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--text-muted);
            text-decoration: none;
            transition: color 0.2s;
          }

          .nk-section-link:hover { color: var(--accent); }

          .nk-stripe {
            display: inline-flex;
            gap: 6px;
            margin-bottom: 1.25rem;
          }

          .nk-stripe span {
            display: block;
            height: 3px;
            border-radius: 3px;
          }

          .nk-stripe .s1 { width: 32px; background: var(--accent); }
          .nk-stripe .s2 { width: 16px; background: var(--accent-light); }
          .nk-stripe .s3 { width: 8px;  background: rgba(216,124,60,0.2); }

          .nk-banner-glass {
            background: rgba(245,245,245,0.7);
            border: 1px solid var(--border-light);
            backdrop-filter: blur(8px);
            border-radius: var(--radius-md);
            overflow: hidden;
          }

          .nk-badge {
            display: inline-block;
            font-size: 0.6rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            padding: 0.2rem 0.65rem;
            border-radius: 40px;
          }

          .nk-badge-sale { background: var(--danger); color: white; }
          .nk-badge-new {
            background: var(--accent-light);
            color: var(--accent);
            border: 1px solid rgba(216,124,60,0.25);
          }

          .experience-section { background: #0d0d0d; }

          .map-panel {
            height: 250px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.04);
            border-radius: 1rem;
          }

          .gray-scale-logos > div { filter: grayscale(1); opacity: 0.45; }
          .gray-scale-logos > div:hover { filter: none; opacity: 1; }

          .nk-divider { border: none; border-top: 1px solid var(--border-light); margin: 0; }

          /* ── FOOTER ─────────────────────────────────────── */
          .nk-footer {
            background: var(--surface) !important;
            border-top: 1px solid var(--border-light);
            padding: 3rem 0 2rem;
            margin-top: auto;
          }

          .nk-footer-brand {
            font-family: var(--font-display);
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: var(--text-primary);
          }

          .nk-footer p {
            font-size: 0.82rem;
            color: var(--text-secondary);
            line-height: 1.6;
          }

          .nk-footer-label {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--accent);
            margin-bottom: 0.75rem;
          }

          .nk-footer-links {
            list-style: none;
            padding: 0; margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .nk-footer-links a {
            font-size: 0.82rem;
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.2s;
          }

          .nk-footer-links a:hover { color: var(--accent); }

          .nk-footer-copy {
            font-size: 0.73rem;
            color: var(--text-muted);
            margin-top: 2rem;
            padding-top: 1.25rem;
            border-top: 1px solid var(--border-light);
          }

          .btn-add-cart {
            width: 100%;
            background: white;
            border: 1px solid var(--border-medium);
            color: var(--text-primary);
            font-family: var(--font-display);
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            padding: 0.55rem 0;
            border-radius: 40px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-add-cart:hover {
            background: var(--accent);
            border-color: var(--accent);
            color: white;
            box-shadow: 0 4px 10px rgba(216,124,60,0.2);
          }

          .nk-input {
            background: white;
            border: 1px solid var(--border-medium);
            color: var(--text-primary);
            border-radius: 50px;
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
            font-family: var(--font-body);
            outline: none;
            transition: all 0.2s;
          }

          .nk-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
          .nk-input::placeholder { color: var(--text-muted); }

          .text-gold { color: var(--accent) !important; }
          .text-muted-nk { color: var(--text-muted) !important; }
          .bg-soft { background-color: var(--surface) !important; }
          .bg-card-white { background-color: white !important; }
          .border-nk { border-color: var(--border-light) !important; }
          .fw-800 { font-weight: 800; }
          .ls-wide { letter-spacing: 0.1em; }
          .ls-wider { letter-spacing: 0.14em; }

          /* ── RESPONSIVE RESPONSIVE (STYLE.CSS + NAV) ────── */
          @media (max-width: 767px) {
            .hero-title {
              font-size: 2.75rem;
            }
            .product-img-wrap {
              height: 220px;
            }
            .nk-links { display: none; }
            .nk-actions { gap: 0.8rem; }
            .btn-nk-outline { display: none; }
            .nk-section-title { font-size: 1.3rem; }
          }
        `}</style>
      </head>
      <body className="d-flex flex-column min-vh-100 bg-white">

        {/* ── NAVBAR ── */}
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

        {/* ── CONTENT ── */}
        <CartProvider>
          <main>
            {children}
          </main>
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
                  {/* Ép chữ sang màu trắng theo yêu cầu */}
                  <li><Link href="/" className="nk-text-white-forced">Hàng mới về</Link></li>
                  <li><Link href="/" className="nk-text-white-forced">Flash Sale</Link></li>
                  <li><Link href="/" className="nk-text-white-forced">Tin tức & biên tập</Link></li>
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
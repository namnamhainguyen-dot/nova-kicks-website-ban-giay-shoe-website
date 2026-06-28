import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import clientPromise from "@/libs/mongodb"; // Import kết nối MongoDB của bạn
import Link from "next/link";
import Image from "next/image";

// ── HÀM LẤY DANH MỤC ĐỘNG TỪ MONGODB ──
async function getCategories() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    
    // Lấy danh sách danh mục từ collection 'categories'
    const categoriesList = await db.collection("categories").find({}).toArray();
    
    return categoriesList.map(cat => ({
      ...cat,
      _id: String(cat._id) // Chuyển ObjectId thành String để truyền lên URL
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh mục từ MongoDB:", error);
    return []; // Trả về mảng rỗng nếu lỗi để không làm sập trang web
  }
}

// Layout là async function để sử dụng await lấy dữ liệu từ database
export default async function Layout({ children }) {
  // Lấy danh mục trực tiếp từ database trước khi render giao diện
  const categories = await getCategories();

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
          html, body { height: 100%; }
          :root {
            --background:     #ffffff;
            --surface:        #f8f9fa;
            --surface-card:   #ffffff;
            --surface-hover:  #f1f3f5;
            --border-light:   rgba(0, 0, 0, 0.06);
            --border-medium:  rgba(0, 0, 0, 0.12);
            --text-primary:   #111111;
            --text-secondary: #555555;
            --text-muted:     #8e969f;
            --accent:         #d87c3c;    
            --accent-light:   rgba(216,124,60,0.08);
            --accent-glow:    rgba(216,124,60,0.15);
            --accent-hover:   #bd622c;
            --danger:         #c73a2b;
            --gold:           #cc9c5f;
            --success:        #2c6e4f;
            --radius-sm:      4px;
            --radius-md:      10px;
            --radius-lg:      20px;
            --shadow-sm:      0 2px 12px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
            --shadow-md:      0 8px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.02);
            --shadow-hover:   0 16px 36px rgba(0,0,0,0.1), 0 4px 14px rgba(0,0,0,0.04);
            --font-display:   'Barlow Condensed', sans-serif;
            --font-body:      'Space Grotesk', system-ui, sans-serif;
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
          main { padding-top: 112px; background-color: var(--background); flex: 1; }
          .nk-nav {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.85) !important;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-light);
            height: 68px;
            display: flex;
            align-items: center;
          }
          .nk-nav .container { display: flex; align-items: center; justify-content: space-between; }
          .nk-brand {
            display: flex;
            align-items: center;
            text-decoration: none;
            transition: opacity 0.2s;
          }
          .nk-brand:hover { opacity: 0.85; }
          .nk-links { display: flex; align-items: center; gap: 2rem; list-style: none; margin: 0; padding: 0; }
          .nk-links a { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; position: relative; }
          .nk-links a:hover, .nk-links a.active { color: var(--accent); }
          .nk-actions { display: flex; align-items: center; gap: 1.25rem; list-style: none; margin: 0; padding: 0; }
          .nk-actions a { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
          .btn-nk-outline { font-size: 0.7rem !important; font-weight: 600 !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; color: #111111 !important; border: 1px solid #111111 !important; background: transparent !important; padding: 0.4rem 1rem !important; border-radius: 30px !important; transition: all 0.2s !important; }
          .btn-nk-outline:hover { background: #111111 !important; color: #ffffff !important; }
          
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
          .nk-categories-list { display: flex; align-items: center; justify-content: center; gap: 2.5rem; list-style: none; margin: 0 auto; padding: 0; }
          .nk-categories-list a { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
          .nk-categories-list a:hover { color: var(--text-primary); }
          .nk-footer { background: #f8f9fa !important; border-top: 1px solid var(--border-light); padding: 3rem 0 2rem; margin-top: auto; }
          .nk-footer-brand {
            display: flex;
            align-items: center;
            text-decoration: none;
          }
          .nk-footer-links { list-style: none; padding: 0; margin: 0; }
          .nk-footer-links li { margin-bottom: 0.5rem; }
          .nk-footer-links a { color: var(--text-secondary); text-decoration: none; font-size: 0.88rem; transition: color 0.2s; }
          .nk-footer-links a:hover { color: var(--accent); }
          .nk-footer-label { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; color: var(--text-primary); }
          .nk-footer-copy { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-light); color: var(--text-muted); font-size: 0.82rem; }
        .nk-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: transform 0.2s ease, opacity 0.2s;
  height: 100%; /* Chiếm toàn bộ chiều cao linh hoạt của container */
}

.nk-brand:hover {
  opacity: 0.9;
  transform: scale(1.02); /* Hiệu ứng phóng to cực nhẹ khi hover tạo cảm giác cao cấp */
}
        `}
        </style>
      </head>
      <body className="d-flex flex-column min-vh-100">

        <CartProvider>
          <WishlistProvider>
            
            {/* ── NAVBAR CHÍNH ── */}
            <nav className="nk-nav">
              <div className="container">
                {/* Khu vực chứa Logo dạng ảnh */}
                <Link className="nk-brand" href="/">
                  <Image 
                    src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"               // Đổi đuôi sang .png đã xóa nền
                    alt="Nova Kicks Logo" 
                    width={160}                          // Tăng nhẹ chiều rộng lên để chữ rõ hơn
                    height={48}                          // Tăng nhẹ chiều cao
                    style={{ 
                      objectFit: 'contain',
                      maxHeight: '44px',                 // Đảm bảo không đè mất padding của nav (68px)
                      filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.05))' // Tạo độ nổi nhẹ cho chữ
                    }} 
                    priority 
                  />
                </Link>

                <ul className="nk-links">
                  <li><Link href="/">Trang chủ</Link></li>
                  <li><Link href="/products" className="active">Bộ sưu tập</Link></li>
                  <li><Link href="/about">Thương hiệu</Link></li>
                </ul>

                <ul className="nk-actions">
                  <li><Link href="/wishlist">Yêu thích</Link></li>
                  <li><Link href="/cart">Giỏ hàng</Link></li>
                  <li><Link href="/login">Đăng nhập</Link></li>
                  <li><Link href="/register" className="btn-nk-outline">Đăng ký</Link></li>
                </ul>
              </div>
            </nav>

            {/* ── THANH DANH MỤC ĐỘNG TỰ ĐỘNG LẤY TỪ MONGODB ── */}
            <div className="nk-categories-bar">
              <div className="container">
                <ul className="nk-categories-list">
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

        {/* ── FOOTER DƯỚI TRANG ── */}
        <footer className="nk-footer">
          <div className="container">
            <div className="row g-5">
              <div className="col-md-5">
                <div className="mb-3">
                  <Link className="nk-footer-brand" href="/">
                    <Image 
                      src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"              // Đồng bộ file logo sạch nền
                      alt="Nova Kicks Logo" 
                      width={300} 
                      height={200} 
                      style={{ 
                        objectFit: 'contain',
                        mixBlendMode: 'multiply'           // Giúp hòa trộn ảnh tốt hơn nếu nền footer hơi xám
                      }} 
                    />
                  </Link>
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
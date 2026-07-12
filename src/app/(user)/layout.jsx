import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import clientPromise from "@/libs/mongodb"; // Import kết nối MongoDB của bạn
import Link from "next/link";
import Image from "next/image";
import UserActions from "@/components/UserActions"; // 1. IMPORT COMPONENT HÀNH ĐỘNG THÀNH VIÊN
import { Toaster } from "react-hot-toast";

// ── HÀM LẤY DANH MỤC ĐỘNG TỪ MONGODB (ĐÃ THÊM FILTER CHỈ LẤY ACTIVE) ──
async function getCategories() {
  try {
    const client = await clientPromise;
    const db = client.db("Nova-kicks");
    
    // 🔥 Sửa ở đây: Thêm { status: "active" } để chỉ hiển thị các danh mục đang hiện
    const categoriesList = await db
      .collection("categories")
      .find({ status: "active" }) 
      .toArray();
    
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
            --shadow-hover:   0 16px 36px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.02);
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
            transition: transform 0.2s ease, opacity 0.2s;
            height: 100%; 
          }
          .nk-brand:hover {
            opacity: 0.9;
            transform: scale(1.02); 
          }
          .nk-links { display: flex; align-items: center; gap: 2rem; list-style: none; margin: 0; padding: 0; }
          .nk-links a { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; position: relative; }
          .nk-links a:hover, .nk-links a.active { color: var(--accent); }
          
          /* Hiệu ứng gạch chân mượt mà dưới Menu khi Hover */
          .nk-links a::after {
            content: '';
            position: absolute;
            bottom: -4px; left: 0; width: 0; height: 2px;
            background-color: var(--accent);
            transition: width 0.3s ease;
          }
          .nk-links a:hover::after, .nk-links a.active::after { width: 100%; }

          .nk-actions { display: flex; align-items: center; gap: 1.25rem; list-style: none; margin: 0; padding: 0; }
          .nk-actions a { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
          
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
          
          .nav-item.dropdown:hover > .dropdown-menu { display: block; margin-top: 0; }
          .dropdown-menu { display: none; transition: all 0.3s ease; animation: fadeIn 0.3s ease; }
          
          /* ================= NÂNG CẤP HIỆU ỨNG SINH ĐỘNG (HOVER CARD & BADGES) ================= */
          
          /* Hiệu ứng nổi bật bao quanh sản phẩm (Card) khi Hover */
          .nk-card {
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .nk-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-hover) !important;
          }

          /* Định vị trí cho khung ảnh sản phẩm phục vụ đè Badge lên */
          .card-product .overflow-hidden, .nk-card .p-3, .nk-card .p-4 {
            position: relative;
          }

          /* Tự động chèn nhãn (Badge) động bằng CSS cho các khu vực đặc biệt */
          /* 1. Nhãn Hot cho sản phẩm thuộc khu vực Đang Hot */
          section:nth-of-type(4) .nk-card .p-4::before {
            content: 'HOT';
            position: absolute;
            top: 12px; left: 12px; z-index: 10;
            background: #111111; color: #ffffff;
            font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em;
            padding: 3px 8px; font-family: var(--font-body);
          }

          

          /* Hiệu ứng zoom ảnh mượt và sâu hơn */
          .img-hover-scale {
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .nk-card:hover .img-hover-scale {
            transform: scale(1.06);
          }

          /* Kiểu dáng cho các ô Banner phụ của trang chủ */
          .glass-card {
            transition: transform 0.4s ease, box-shadow 0.4s ease;
          }
          .glass-card:hover {
            transform: scale(1.015);
            box-shadow: var(--shadow-md);
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </head>
      <body className="d-flex flex-column min-vh-100">
        <Toaster position="bottom-right" reverseOrder={false} />

        <CartProvider>
          <WishlistProvider>
            
            {/* ── NAVBAR CHÍNH ── */}
            <nav className="nk-nav">
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
                      filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.05))'
                    }} 
                    priority 
                  />
                </Link>

                <ul className="nk-links">
                  <li><Link href="/">Trang chủ</Link></li>




                  <li><Link href="/products">Bộ sưu tập</Link></li>
                  <li><Link href="/new">Tin tức</Link></li>




                  <li><Link href="/contact">Liên hệ</Link></li>
                </ul>

                <UserActions />
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
                <p style={{maxWidth:'320px'}}>
                  Nền tảng phân phối giày Streetwear cao cấp — nơi văn hóa đường phố gặp gỡ thiết kế đương đại.
                </p>
              </div>
 
              <div className="col-6 col-md-4">
                <p className="nk-footer-label">Liên hệ</p>
                <ul className="nk-footer-links">
                  <li><a href="tel:0931839732">0931839732</a></li>
                  <li><a href="mailto:support@nova-kicks.com">support@nova-kicks.com</a></li>
                  <li style={{color:'var(--text-secondary)', fontSize:'0.82rem'}}>123 CVPM Quang Trung, Quận 12, TP.HCM</li>
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
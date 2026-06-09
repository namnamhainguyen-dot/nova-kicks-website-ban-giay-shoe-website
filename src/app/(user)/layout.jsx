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
        <style>{`
          /* Custom CSS Minimalist phong cách Cyber/Streetwear */
          body { background-color: #000000; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; }
          .bg-black { background-color: #000000 !important; }
          .fw-black { font-weight: 900; }
          .tracking-wider { tracking-spacing: 0.15em; letter-spacing: 2px; }
          .tracking-widest { tracking-spacing: 0.25em; letter-spacing: 4px; }
          .fs-7 { font-size: 0.8rem; }
          .min-w-300 { min-width: 300px; }
          .img-hover-scale { transition: transform 0.4s ease; }
          .img-hover-scale:hover { transform: scale(1.06); }
        `}</style>
      </head>
      <body className="d-flex flex-column min-vh-100 bg-black text-white">
        
        {/* HEADER BAR ĐEN TUYỀN THEO HÌNH MẪU */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary fixed-top py-3">
          <div className="container">
            <Link className="navbar-brand fw-black tracking-widest text-uppercase fs-4" href="/">
              NOVA KICKS
            </Link>
            
            <button
              className="navbar-toggler border-0"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            
            {/* LINKS DI CHUYỂN CĂN GIỮA / PHẢI TINH TẾ */}
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto text-uppercase small fw-bold tracking-wide gap-3">
                <li className="nav-item">
                  <Link className="nav-link text-white active" href="/">Trang chủ</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-secondary" href="/products">Bộ sưu tập</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-secondary" href="/about">Thương hiệu</Link>
                </li>
              </ul>
              
              <ul className="navbar-nav text-uppercase small fw-bold tracking-wide gap-2 align-items-center">
                <li className="nav-item">
                  <Link className="nav-link text-white position-relative" href="/cart">
                    Giỏ hàng 🛒
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-secondary" href="/login">Đăng nhập</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-sm btn-outline-light rounded-0 px-3 text-uppercase fw-bold" href="/register">Đăng ký</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* CONTAINER CHỨA LOGIC GIỎ HÀNG TOÀN CỤC */}
        <CartProvider>
          {children}
        </CartProvider>

        {/* ================= FOOTER ĐEN TỐI GIẢN THEO MẪU ================= */}
        <footer className="bg-black text-white border-top border-secondary py-5 mt-auto small">
          <div className="container">
            <div className="row g-4">
              <div className="col-md-6 text-start">
                <h5 className="fw-black tracking-widest text-uppercase mb-3">NOVA KICKS</h5>
                <p className="text-secondary m-0">Nền tảng cung cấp và phân phối các dòng giày Streetwear cao cấp dẫn đầu xu hướng thị trường.</p>
              </div>
              <div className="col-md-6 text-md-end text-start">
                <p className="text-white fw-bold mb-1">Hotline: 0123 456 789</p>
                <p className="text-secondary mb-1">Email: support@nova-kicks.com</p>
                <p className="text-secondary m-0">&copy; 2026 Nova-kicks. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
}
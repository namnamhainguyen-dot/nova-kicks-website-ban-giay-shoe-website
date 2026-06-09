import { CartProvider } from "@/components/CartContext";
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <>
      <head>
        <title>Nova Kicks - Premium Streetwear POS</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* Nhúng một chút style cho hiệu ứng hover giống hình ảnh */}
        <style>{`
          .bg-black { background-color: #000000 !important; }
          .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
          .hover-scale { transition: transform 0.3s ease; }
          .hover-scale:hover { transform: scale(1.05); }
        `}</style>
      </head>
      
      <div className="bg-black text-white min-vh-100">
        {/* NAVBAR ĐEN CHUẨN ĐƯỜNG PHỐ */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary fixed-top py-3">
          <div className="container-fluid px-4">
            <Link className="navbar-brand fw-black tracking-widest text-uppercase" href="/staff">
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
            
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto text-uppercase small fw-bold tracking-wide">
                <li className="nav-item px-2">
                  <Link className="nav-link text-white" href="/staff">Cửa hàng</Link>
                </li>
                <li className="nav-item px-2">
                  <Link className="nav-link text-secondary" href="/staff/orders">Quản lý Đơn</Link>
                </li>
              </ul>
              
              <ul className="navbar-nav text-uppercase small align-items-center">
                <li className="nav-item">
                  <span className="nav-link text-secondary me-2">Xin chào, Nam</span>
                </li>
                <li className="nav-item">
                  <a className="btn btn-sm btn-outline-light rounded-0 text-uppercase fw-bold px-3" href="#">Đăng xuất</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* PROVIDER GIỮ NGUYÊN LOGIC GIỎ HÀNG */}
        <CartProvider>
          {children}
        </CartProvider>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // Dùng để xác định active link
  const [authorized, setAuthorized] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let user = null;

    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
      user = null;
    }

    if (!user || (user.role !== "admin" && user.role !== "ADMIN")) {
      setAuthorized(false);
      router.replace("/login");
    } else {
      setAuthorized(true);
      setCurrentUser(user);
    }
  }, [router]);

  if (!authorized) {
    return null;
  }

  // Hàm kiểm tra active link
  const isActive = (path) => pathname === path;

  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nova-kicks - Quản trị hệ thống</title>

        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* Thêm Bootstrap Icons để Sidebar đẹp hơn */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
        <link rel="stylesheet" href="/css/admin.css" />
      </head>

      <body className="bg-light">
        {/* SIDEBAR HIỆN ĐẠI */}
        <div 
          className="sidebar d-flex flex-column p-3 text-white shadow-sm"
          style={{
            width: "260px",
            minHeight: "100vh",
            backgroundColor: "#111827", // Màu nền tối sang trọng (Tailwind Gray 900)
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000
          }}
        >
          {/* LOGO / BRAND */}
          <div className="text-center py-3 mb-3 border-bottom border-secondary border-opacity-25">
            <h4 className="fw-black text-uppercase tracking-wider m-0" style={{ letterSpacing: "1px" }}>
              Nova<span className="text-info">Kicks</span>
            </h4>
            <span className="badge bg-info text-dark mt-1 text-uppercase" style={{ fontSize: "0.6rem" }}>
              Admin Panel
            </span>
          </div>

          {/* USER INFO CARD */}
          {currentUser && (
            <div className="d-flex align-items-center gap-2 p-2 mb-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-10">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}>
                {(currentUser.fullname || "A").charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="small fw-bold text-truncate text-white" style={{ fontSize: "0.8rem" }}>
                  {currentUser.fullname || "Administrator"}
                </div>
                <div className="text-success" style={{ fontSize: "0.65rem" }}>
                  ● Đang hoạt động
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION MENU */}
          <ul className="nav flex-column gap-1 flex-grow-1" style={{ fontSize: "0.88rem" }}>
            <li className="nav-item">
              <Link 
                href="/admin" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 transition-all ${isActive("/admin") ? "bg-primary fw-bold shadow-sm" : "hover-bg-dark"}`}
              >
                <i className="bi bi-speedometer2"></i> Tổng quan
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/category" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/category") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-folder"></i> Quản lý Danh mục
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/product" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/product") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-box-seam"></i> Quản lý Sản phẩm
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/order" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/order") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-cart-check"></i> Quản lý đơn hàng
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/account" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/account") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-people"></i> Quản lý người dùng
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/voucher" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/voucher") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-ticket-perforated"></i> Quản lý voucher
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/comments" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/comments") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-chat-square-text"></i> Đánh giá sản phẩm
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/feedback" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/feedback") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-headset"></i> Quản lý Liên hệ
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/news" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/news") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-newspaper"></i> Quản lý tin tức
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                href="/admin/chat" 
                className={`nav-link text-white d-flex align-items-center gap-2 px-3 py-2 rounded-2 ${isActive("/admin/chat") ? "bg-primary fw-bold shadow-sm" : ""}`}
              >
                <i className="bi bi-chat-dots"></i> Hỗ trợ trực tiếp
              </Link>
            </li>
          </ul>

          {/* LOGOUT BUTTON */}
          <div className="pt-3 mt-3 border-top border-secondary border-opacity-25">
            <button 
              type="button" 
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-2 text-uppercase fw-bold"
              style={{ fontSize: "0.75rem" }}
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i> Đăng xuất
            </button>
          </div>
        </div>

        {/* MAIN CONTENT (Được đẩy lề trái sang 260px để không bị đè bởi Sidebar) */}
        <div 
          className="main-content" 
          style={{ 
            marginLeft: "260px", 
            minHeight: "100vh",
            backgroundColor: "#f8f9fa" 
          }}
        >
          {children}
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // Trạng thái thu gọn/mở rộng sidebar

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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
        <link rel="stylesheet" href="/css/admin.css" />
      </head>

      <body className="bg-light">
        {/* SIDEBAR MÀU CAM & CÓ TÍNH NĂNG THU GỌN */}
        <div 
          className="sidebar d-flex flex-column p-3 text-white shadow-sm"
          style={{
            width: isCollapsed ? "80px" : "260px",
            minHeight: "100vh",
            backgroundColor: "#ea580c", // 🟢 Màu cam chủ đạo mới
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
            transition: "width 0.3s ease" // Hiệu ứng chuyển động mượt mà khi thu gọn
          }}
        >
          {/* LOGO / BRAND & NÚT THU GỌN */}
          <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-white border-opacity-25">
            {!isCollapsed && (
              <div className="overflow-hidden text-truncate">
                <h4 className="fw-black text-uppercase tracking-wider m-0 fs-5" style={{ letterSpacing: "1px" }}>
                  Nova<span className="text-dark">Kicks</span>
                </h4>
                <span className="badge bg-dark text-white mt-1 text-uppercase" style={{ fontSize: "0.55rem" }}>
                  Admin Panel
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="btn btn-sm text-white bg-dark bg-opacity-25 border-0 ms-auto"
              title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              <i className={`bi ${isCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
            </button>
          </div>

          {/* USER INFO CARD (Tự ẩn khi thu gọn) */}
          {currentUser && !isCollapsed && (
            <div className="d-flex align-items-center gap-2 p-2 mb-3 rounded bg-dark bg-opacity-25 border border-white border-opacity-15">
              <div className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "34px", height: "34px", fontSize: "0.85rem" }}>
                {(currentUser.fullname || "A").charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="small fw-bold text-truncate text-white" style={{ fontSize: "0.78rem" }}>
                  {currentUser.fullname || "Administrator"}
                </div>
                <div className="text-light opacity-75" style={{ fontSize: "0.6rem" }}>
                  ● Đang hoạt động
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION MENU */}
          <ul className="nav flex-column gap-1 flex-grow-1" style={{ fontSize: "0.85rem" }}>
            {[
              { href: "/admin", label: "Tổng quan", icon: "bi-speedometer2" },
              { href: "/admin/category", label: "Quản lý Danh mục", icon: "bi-folder" },
              { href: "/admin/product", label: "Quản lý Sản phẩm", icon: "bi-box-seam" },
              { href: "/admin/order", label: "Quản lý đơn hàng", icon: "bi-cart-check" },
              { href: "/admin/account", label: "Quản lý người dùng", icon: "bi-people" },
              { href: "/admin/voucher", label: "Quản lý voucher", icon: "bi-ticket-perforated" },
              { href: "/admin/comments", label: "Đánh giá sản phẩm", icon: "bi-chat-square-text" },
              { href: "/admin/feedback", label: "Quản lý Liên hệ", icon: "bi-headset" },
              { href: "/admin/news", label: "Quản lý tin tức", icon: "bi-newspaper" },
              { href: "/admin/chat", label: "Hỗ trợ trực tiếp", icon: "bi-chat-dots" },
            ].map((item) => (
              <li className="nav-item" key={item.href}>
                <Link 
                  href={item.href} 
                  className={`nav-link text-white d-flex align-items-center gap-3 px-3 py-2 rounded-2 ${isActive(item.href) ? "bg-dark bg-opacity-25 fw-bold shadow-sm" : "hover-orange"}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  {!isCollapsed && <span className="text-truncate">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* LOGOUT BUTTON */}
          <div className="pt-3 mt-3 border-top border-white border-opacity-25">
            <button 
              type="button" 
              className="btn btn-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-2 text-uppercase fw-bold shadow-sm"
              style={{ fontSize: "0.72rem" }}
              onClick={handleLogout}
              title={isCollapsed ? "Đăng xuất" : ""}
            >
              <i className="bi bi-box-arrow-right fs-6"></i>
              {!isCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT (Tự động co giãn lề trái theo kích thước của Sidebar) */}
        <div 
          className="main-content" 
          style={{ 
            marginLeft: isCollapsed ? "80px" : "260px", 
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            transition: "margin-left 0.3s ease" 
          }}
        >
          {children}
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

        {/* CSS Tùy chỉnh hiệu ứng Sidebar: Nền đen, hover cam nhẹ & active cam chủ đạo */}
        <style>{`
          .sidebar-link {
            transition: all 0.2s ease-in-out;
            color: #d1d5db !important;
          }
          .sidebar-link:hover {
            background-color: rgba(234, 88, 12, 0.25) !important; /* Cam nhẹ khi hover */
            color: #ffffff !important;
          }
          .sidebar-link.active-link {
            background-color: #ea580c !important; /* Cam đậm thương hiệu khi đang chọn */
            color: #ffffff !important;
            font-weight: bold;
          }
        `}</style>
      </head>

      <body className="bg-light">
        {/* SIDEBAR MÀU ĐEN & TÍCH HỢP THU GỌN */}
        <div 
          className="sidebar d-flex flex-column p-3 text-white shadow-sm"
          style={{
            width: isCollapsed ? "80px" : "260px",
            minHeight: "100vh",
            backgroundColor: "#111827", // 🟢 Màu đen chủ đạo sang trọng (Tailwind Gray 900)
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
            transition: "width 0.3s ease"
          }}
        >
          {/* LOGO / BRAND & NÚT THU GỌN */}
          <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-secondary border-opacity-25">
            {!isCollapsed && (
              <div className="overflow-hidden text-truncate">
                <h4 className="fw-black text-uppercase tracking-wider m-0 fs-5" style={{ letterSpacing: "1px" }}>
                  Nova<span className="text-warning">Kicks</span>
                </h4>
                <span className="badge bg-warning text-dark mt-1 text-uppercase" style={{ fontSize: "0.55rem" }}>
                  Admin Panel
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="btn btn-sm text-white bg-secondary bg-opacity-25 border-0 ms-auto"
              title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              <i className={`bi ${isCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
            </button>
          </div>

          {/* USER INFO CARD */}
          {currentUser && !isCollapsed && (
            <div className="d-flex align-items-center gap-2 p-2 mb-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
              <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "34px", height: "34px", fontSize: "0.85rem" }}>
                {(currentUser.fullname || "A").charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="small fw-bold text-truncate text-white" style={{ fontSize: "0.78rem" }}>
                  {currentUser.fullname || "Administrator"}
                </div>
                <div className="text-success" style={{ fontSize: "0.6rem" }}>
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
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-2 sidebar-link ${isActive(item.href) ? "active-link" : ""}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  {!isCollapsed && <span className="text-truncate">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* LOGOUT BUTTON */}
          <div className="pt-3 mt-3 border-top border-secondary border-opacity-25">
            <button 
              type="button" 
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-2 text-uppercase fw-bold shadow-sm"
              style={{ fontSize: "0.72rem" }}
              onClick={handleLogout}
              title={isCollapsed ? "Đăng xuất" : ""}
            >
              <i className="bi bi-box-arrow-right fs-6"></i>
              {!isCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
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
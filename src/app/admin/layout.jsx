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

        {/* CSS tinh chỉnh riêng cho hiệu ứng Sidebar thu gọn / mở rộng */}
        <style>{`
          .sidebar-link {
            transition: all 0.2s ease-in-out;
            color: #d1d5db !important;
          }
          .sidebar-link:hover {
            background-color: rgba(234, 88, 12, 0.25) !important;
            color: #ffffff !important;
          }
          .sidebar-link.active-link {
            background-color: #ea580c !important;
            color: #ffffff !important;
            font-weight: bold;
          }
        `}</style>
      </head>

      <body>
        {/* CONTAINER CHÍNH DÙNG FLEXBOX */}
        <div className="d-flex w-100 min-vh-100 position-relative m-0 p-0">
          
          {/* SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
          <div 
            className="d-flex flex-column p-3 text-white shadow-sm"
            style={{
              width: isCollapsed ? "80px" : "250px",
              minWidth: isCollapsed ? "80px" : "250px",
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
              backgroundColor: "#212529",
              transition: "width 0.3s ease, min-width 0.3s ease",
              zIndex: 1000,
              overflowY: "auto"
            }}
          >
            {/* LOGO & NÚT THU GỌN */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-secondary border-opacity-25">
              {!isCollapsed && (
                <div className="overflow-hidden text-truncate">
                  <h4 className="fw-black text-uppercase tracking-wider m-0 fs-5" style={{ letterSpacing: "1px" }}>
                    Nova<span style={{ color: "#ea580c" }}>Kicks</span>
                  </h4>
                  {/* Đã đổi sang badge màu cam */}
                  <span className="badge text-white mt-1 text-uppercase" style={{ fontSize: "0.55rem", backgroundColor: "#ea580c" }}>
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

            {/* USER INFO */}
            {currentUser && !isCollapsed && (
              <div className="d-flex align-items-center gap-2 p-2 mb-3 rounded bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                {/* Đã đổi avatar chữ cái sang nền cam */}
                <div className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "34px", height: "34px", fontSize: "0.85rem", backgroundColor: "#ea580c" }}>
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

            {/* MENU LINKS */}
            <ul className="nav flex-column gap-1 flex-grow-1" style={{ fontSize: "0.85rem", paddingLeft: 0, listStyle: "none" }}>
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

            {/* LOGOUT */}
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
            className="content"
            style={{ 
              marginLeft: isCollapsed ? "80px" : "250px",
              width: isCollapsed ? "calc(100vw - 80px)" : "calc(100vw - 250px)",
              transition: "margin-left 0.3s ease, width 0.3s ease",
              boxSizing: "border-box"
            }}
          >
            {children}
          </div>

        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
}
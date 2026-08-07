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

  // Các nhóm menu được phân chia gọn gàng bằng tiếng Việt
  const menuGroups = [
    {
      title: "TỔNG QUAN",
      items: [
        { href: "/admin", label: "Trang chủ", icon: "bi-speedometer2" },
        { href: "/admin/comments", label: "Đánh giá sản phẩm", icon: "bi-chat-square-text" },
        { href: "/admin/chat", label: "Hỗ trợ trực tiếp", icon: "bi-chat-dots" },
        { href: "/admin/feedback", label: "Phản hồi liên hệ", icon: "bi-headset" },
        { href: "/admin/news", label: "Quản lý tin tức", icon: "bi-newspaper" },
      ],
    },
    {
      title: "QUẢN LÝ CỬA HÀNG",
      items: [
        { href: "/admin/category", label: "Danh mục", icon: "bi-folder" },
        { href: "/admin/product", label: "Sản phẩm", icon: "bi-box-seam" },
        { href: "/admin/order", label: "Đơn hàng", icon: "bi-cart-check" },
        { href: "/admin/account", label: "Người dùng", icon: "bi-people" },
        { href: "/admin/voucher", label: "Mã giảm giá", icon: "bi-ticket-perforated" },
      ],
    },
  ];

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

        {/* CSS tùy chỉnh giữ nguyên màu cam đặc trưng của bạn */}
        <style>{`
          body {
            background-color: #f8fafc;
          }
          .sidebar-link {
            transition: all 0.15s ease-in-out;
            color: #64748b !important;
            font-weight: 500;
            font-size: 0.85rem;
            border-radius: 8px;
            margin-bottom: 2px;
          }
          .sidebar-link:hover {
            background-color: #ffedd5 !important;
            color: #ea580c !important;
          }
          .sidebar-link:hover i {
            color: #ea580c !important;
          }
          .sidebar-link.active-link {
            background-color: #ea580c !important;
            color: #ffffff !important;
            font-weight: 600;
          }
          .sidebar-link.active-link i {
            color: #ffffff !important;
          }
        `}</style>
      </head>

      <body>
        <div className="d-flex w-100 min-vh-100 position-relative m-0 p-0">
          
          {/* SIDEBAR */}
          <div 
            className="d-flex flex-column p-3 bg-white border-end shadow-sm"
            style={{
              width: isCollapsed ? "80px" : "260px",
              minWidth: isCollapsed ? "80px" : "260px",
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
              transition: "width 0.3s ease, min-width 0.3s ease",
              zIndex: 1000,
              overflowY: "auto"
            }}
          >
            {/* LOGO */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-2 border-bottom">
              {!isCollapsed && (
                <div className="d-flex align-items-center gap-2">
                  <div className="text-white rounded-2 d-flex align-items-center justify-content-center fw-bold fs-6 shadow-sm" style={{ width: "32px", height: "32px", backgroundColor: "#ea580c" }}>
                    N
                  </div>
                  <div>
                    <h5 className="fw-bold tracking-tight m-0 text-dark fs-6" style={{ letterSpacing: "-0.5px" }}>
                      Nova<span style={{ color: "#ea580c" }}>Kicks</span>
                    </h5>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className="btn btn-sm text-secondary bg-light border-0 ms-auto rounded-circle p-1 d-flex align-items-center justify-content-center"
                style={{ width: "28px", height: "28px" }}
                title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              >
                <i className={`bi ${isCollapsed ? "bi-chevron-right" : "bi-chevron-left"} fs-7`}></i>
              </button>
            </div>

            {/* DANH SÁCH MENU */}
            <div className="flex-grow-1 py-2 overflow-y-auto">
              {menuGroups.map((group, idx) => (
                <div key={idx} className="mb-3">
                  {!isCollapsed && (
                    <div className="text-uppercase text-muted fw-bold px-3 mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.8px" }}>
                      {group.title}
                    </div>
                  )}
                  <ul className="nav flex-column gap-1 p-0 m-0" style={{ listStyle: "none" }}>
                    {group.items.map((item) => (
                      <li className="nav-item" key={item.href}>
                        <Link 
                          href={item.href} 
                          className={`nav-link d-flex align-items-center gap-3 px-3 py-2 sidebar-link ${isActive(item.href) ? "active-link" : ""}`}
                          title={isCollapsed ? item.label : ""}
                        >
                          <i className={`bi ${item.icon} fs-5 text-secondary`}></i>
                          {!isCollapsed && <span className="text-truncate">{item.label}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* THÔNG TIN USER Ở ĐÁY */}
            {currentUser && !isCollapsed && (
              <div className="pt-3 mt-auto border-top">
                <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border">
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 shadow-sm" style={{ width: "36px", height: "36px", fontSize: "0.85rem", backgroundColor: "#ffedd5", color: "#ea580c" }}>
                      {(currentUser.fullname || "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="fw-semibold text-dark text-truncate" style={{ fontSize: "0.8rem" }}>
                        {currentUser.fullname || "Quản trị viên"}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                        Admin hệ thống
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-sm text-danger p-1 border-0 bg-transparent"
                    title="Đăng xuất"
                  >
                    <i className="bi bi-box-arrow-right fs-5"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MAIN CONTENT */}
          <div 
            className="content flex-grow-1"
            style={{ 
              marginLeft: isCollapsed ? "80px" : "260px",
              width: isCollapsed ? "calc(100vw - 80px)" : "calc(100vw - 260px)",
              transition: "margin-left 0.3s ease, width 0.3s ease",
              boxSizing: "border-box",
              minHeight: "100vh"
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
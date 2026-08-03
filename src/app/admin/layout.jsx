"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Layout({ children }) {
  const router = useRouter();
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

  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nova-kicks - Tổng quan</title>

        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/admin.css" />
      </head>

      <body>
        <div className="sidebar d-flex flex-column p-3">
          <h3 className="text-center mb-4">
            Nova-kicks<br />ADMIN
          </h3>
          {currentUser && (
            <div className="text-center small text-white-50 mb-3">
              👋 {currentUser.fullname || "Admin"}
            </div>
          )}

          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link href="/admin" className="nav-link ">
                Tổng quan
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/category" className="nav-link">
                Quản lý Danh mục
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/product" className="nav-link">
                Quản lý Sản phẩm
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/order" className="nav-link">
                Quản lý đơn hàng
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/account" className="nav-link">
                Quản lý người dùng
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/voucher" className="nav-link">
                Quản lý voucher
</Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/comments" className="nav-link">
                Quản lý bình luận
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link href="/admin/feedback" className="nav-link">
                Quản lý Liên hệ
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link href="/admin/news" className="nav-link">
                Quản lý tin tức
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/chat" className="nav-link text-white">
                Hỗ trợ trực tiếp
              </Link>
            </li>
            <li className="nav-item mt-5 border-top">
              <button type="button" className="nav-link btn btn-link text-start p-0" onClick={handleLogout}>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>

        <div className="main-content">
          {children}
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
}

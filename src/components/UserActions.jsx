"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartContext } from "@/components/CartContext";

export default function UserActions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Lấy dữ liệu giỏ hàng từ CartContext
  const { cart } = useContext(CartContext) || {};

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalItems = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  const fetchUserData = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchUserData();

    // Lắng nghe các sự kiện cập nhật user
    window.addEventListener("userLogin", fetchUserData);

    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUser(event.detail);
      } else {
        fetchUserData();
      }
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("userLogin", fetchUserData);
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/login");
  };

  if (!isMounted) {
    return <ul className="nk-actions d-none d-lg-flex"></ul>;
  }

  return (
    /* Thêm d-none d-lg-flex: Ẩn hoàn toàn trên Mobile/Tablet (< 992px) và chỉ hiện ở Desktop (>= 992px) */
    <ul className="nk-actions d-none d-lg-flex align-items-center mb-0 list-unstyled gap-3">
      {/* 1. ICON GIỎ HÀNG */}
      {(!user || user.role !== "admin") && (
        <li>
          <Link
            href="/cart"
            className="position-relative text-dark text-decoration-none"
            title="Giỏ hàng"
          >
            <i className="fas fa-shopping-bag" style={{ fontSize: "1rem" }}></i>

            {/* Badge hiển thị số lượng */}
            {totalItems > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.55rem" }}
              >
                {totalItems}
              </span>
            )}
          </Link>
        </li>
      )}

      {/* 2. TÀI KHOẢN / ĐĂNG NHẬP */}
      {user ? (
        <li className="nav-item dropdown">
          <Link
            className="nav-link dropdown-toggle fw-bold text-dark p-0"
            href="#"
            id="userDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
          >
            👋 CHÀO, {user.fullname || user.name || "KHÁCH"}
          </Link>

          <ul
            className="dropdown-menu dropdown-menu-end rounded-0 shadow-sm"
            aria-labelledby="userDropdown"
          >
            {user.role === "admin" && (
              <li>
                <Link
                  className="dropdown-item small text-primary fw-bold"
                  href="/admin"
                >
                  Quản trị hệ thống
                </Link>
              </li>
            )}

            <li>
              <Link className="dropdown-item small" href="/profile">
                Hồ sơ của tôi
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-item small text-danger bg-transparent border-0 w-100 text-start"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </li>
          </ul>
        </li>
      ) : (
        <li>
          <Link
            href="/login"
            className="text-decoration-none fw-bold text-dark"
            style={{ fontSize: "0.85rem" }}
          >
            Đăng nhập
          </Link>
        </li>
      )}
    </ul>
  );
}
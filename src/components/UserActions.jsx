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

  // Lấy link avatar từ user (hỗ trợ nhiều tên trường phổ biến: avatar, image, photo, picture)
  const userAvatar = user?.avatar || user?.image || user?.photo || user?.picture;

  return (
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
            className="nav-link dropdown-toggle fw-bold text-dark p-0 d-flex align-items-center gap-2"
            href="#"
            id="userDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ fontSize: "0.75rem", textTransform: "uppercase" }}
          >
            {/* AVATAR */}
            <img
              src={userAvatar || "https://via.placeholder.com/30"}
              alt="Avatar"
              className="rounded-circle object-fit-cover shadow-sm"
              style={{
                width: "28px",
                height: "28px",
                border: "2px solid #fff",
                boxShadow: "0 0 0 1px #e5e7eb",
              }}
            />
            <span>CHÀO, {user.fullname || user.name || "KHÁCH"}</span>
          </Link>

          {/* ✨ DROPDOWN MENU ĐÃ ĐƯỢC THIẾT KẾ LẠI */}
          <ul
            className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 mt-2"
            aria-labelledby="userDropdown"
            style={{
              borderRadius: "14px",
              minWidth: "210px",
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            {/* Header nhỏ hiển thị nhanh thông tin tài khoản */}
            <li className="px-3 py-2 mb-1 border-bottom">
              <span className="d-block text-muted" style={{ fontSize: "0.7rem" }}>Tài khoản đang đăng nhập</span>
              <span className="d-block text-dark fw-bold text-truncate" style={{ fontSize: "0.8rem" }}>
                {user.email || user.username || user.fullname || user.name}
              </span>
            </li>

            {user.role?.toLowerCase() === "admin" && (
              <li>
                <Link
                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 fw-semibold text-primary"
                  href="/admin"
                  style={{ fontSize: "0.85rem", transition: "all 0.2s" }}
                >
                  <i className="fas fa-shield-alt" style={{ width: "16px" }}></i>
                  Quản trị hệ thống
                </Link>
              </li>
            )}

            <li>
              <Link
                className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-dark"
                href="/profile"
                style={{ fontSize: "0.85rem", transition: "all 0.2s" }}
              >
                <i className="fas fa-user-circle text-secondary" style={{ width: "16px" }}></i>
                Hồ sơ của tôi
              </Link>
            </li>

            <li>
              <hr className="dropdown-divider my-1 bg-light" />
            </li>

            <li>
              <button
                className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-danger bg-transparent border-0 w-100 text-start fw-medium"
                onClick={handleLogout}
                style={{ fontSize: "0.85rem", transition: "all 0.2s" }}
              >
                <i className="fas fa-sign-out-alt" style={{ width: "16px" }}></i>
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
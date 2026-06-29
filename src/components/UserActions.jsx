"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserActions() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const fetchUserData = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    window.addEventListener("userLogin", fetchUserData);
    return () => window.removeEventListener("userLogin", fetchUserData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <ul className="nk-actions">
      {/* 🔥 CẬP NHẬT: Chỉ hiện khi user là null hoặc role không phải admin */}
      {(!user || user.role !== 'admin') && (
        <>
          <li><Link href="/wishlist">Yêu thích</Link></li>
          <li><Link href="/cart">Giỏ hàng</Link></li>
        </>
      )}
      
      {user ? (
        <li className="nav-item dropdown">
          <Link 
            className="nav-link fw-bold text-dark" 
            href="#" 
            id="userDropdown" 
            style={{ fontSize: "0.72rem", textTransform: "uppercase" }}
          >
            👋 Chào, {user.fullname}
          </Link>
          
          <ul className="dropdown-menu dropdown-menu-end rounded-0 shadow-sm" aria-labelledby="userDropdown">
            {/* Nếu là admin, có thể thêm link vào trang quản trị */}
            {user.role === 'admin' && (
              <li>
                <Link className="dropdown-item small text-primary fw-bold" href="/admin">
                  Quản trị hệ thống
                </Link>
              </li>
            )}
            
            <li>
              <Link className="dropdown-item small" href="/profile">
                Hồ sơ của tôi
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button 
                className="dropdown-item small text-danger" 
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </li>
          </ul>
        </li>
      ) : (
        <li><Link href="/login">Đăng nhập</Link></li>
      )}
    </ul>
  );
}
"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartContext } from "@/components/CartContext"; // Đường dẫn trỏ tới CartContext của bạn

export default function UserActions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Lấy dữ liệu giỏ hàng từ CartContext (tên biến có thể là cart hoặc cartItems tùy theo file Context của bạn)
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
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchUserData();

    // Lắng nghe sự kiện đăng nhập/đăng xuất
    window.addEventListener("userLogin", fetchUserData);

    // Lắng nghe sự kiện cập nhật profile từ trang Profile để đổi tên ngay lập tức không cần F5
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUser(event.detail); // Cập nhật trực tiếp state user bằng dữ liệu mới
      } else {
        fetchUserData(); // Fallback fetch lại từ localStorage nếu thiếu detail
      }
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);

    // Cleanup sự kiện khi component unmount
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
    return <ul className="nk-actions"></ul>;
  }

  return (
    <ul className="nk-actions">
      {(!user || user.role !== 'admin') && (
        <li>
          <Link href="/cart" className="position-relative text-dark text-decoration-none" title="Giỏ hàng">
            <i className="fas fa-shopping-bag" style={{ fontSize: "1rem" }}></i>
            
            {/* Badge hiển thị số lượng */}
            {totalItems > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.55rem" }}>
                {totalItems}
              </span>
            )}
          </Link>
        </li>
      )}
      
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
            👋 Chào, {user.fullname}
          </Link>
          
          <ul className="dropdown-menu dropdown-menu-end rounded-0 shadow-sm" aria-labelledby="userDropdown">
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
                className="dropdown-item small text-danger bg-transparent border-0 w-100 text-start" 
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
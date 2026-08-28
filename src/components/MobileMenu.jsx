'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartContext } from '@/components/CartContext';

export default function MobileMenu({ categories = [] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Toggle mở/đóng drawer
  const toggleMenu = () => setIsOpen(!isOpen);

  // 1. Lấy dữ liệu giỏ hàng từ CartContext
  const { cart } = useContext(CartContext) || {};
  const totalItems = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  // 2. Logic lấy dữ liệu User từ localStorage
  const fetchUserData = () => {
    const storedUser = localStorage.getItem('user');
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

  // 3. Đồng bộ các Event Listeners với bản PC
  useEffect(() => {
    setIsMounted(true);
    fetchUserData();

    window.addEventListener('userLogin', fetchUserData);

    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUser(event.detail);
      } else {
        fetchUserData();
      }
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('userLogin', fetchUserData);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  // 4. Logic Đăng xuất đồng bộ
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setIsOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { label: 'TRANG CHỦ', href: '/', icon: 'fas fa-home', active: true },
    { label: 'BỘ SƯU TẬP', href: '/products', icon: 'fas fa-th-large' },
    { label: 'TIN TỨC', href: '/new', icon: 'fas fa-newspaper' },
    { label: 'LIÊN HỆ', href: '/contact', icon: 'fas fa-envelope' },
  ];

  return (
    <>
      {/* Nút Hamburger Mở Menu */}
      <button 
        className="nk-mobile-toggle d-lg-none" 
        onClick={toggleMenu}
        aria-label="Mở Menu"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Backdrop (Nền mờ phía sau) */}
      <div 
        className={`nk-drawer-backdrop ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      />

      {/* Offcanvas Drawer */}
      <div className={`nk-mobile-drawer ${isOpen ? 'active' : ''}`}>
        
        {/* Header Drawer (Đã bỏ logo, chuyển màu nền sang Cam #d96c34) */}
        <div 
          className="nk-drawer-header d-flex justify-content-end align-items-center p-3"
          style={{ backgroundColor: '#d96c34' }}
        >
          <button 
            className="nk-drawer-close border-0 bg-transparent text-white fs-4 p-0" 
            onClick={toggleMenu} 
            aria-label="Đóng Menu"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body Drawer (Nội dung chính) */}
        <div className="nk-drawer-body p-0">

          {/* SECTION 1: USER BAR & GIỎ HÀNG */}
          {isMounted && (
            <div className="border-bottom bg-white">
              {user ? (
                <div>
                  <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
                    <Link 
                      href="/profile" 
                      onClick={toggleMenu}
                      className="d-flex align-items-center gap-2 text-decoration-none text-dark fw-bold text-uppercase fs-6"
                    >
                      <i className="far fa-user-circle fs-5"></i>
                      <span>CHÀO, {user.fullname || user.name || 'KHÁCH'}</span>
                    </Link>

                    {/* Biểu tượng Giỏ hàng dạng chấm đỏ nhấp nháy đồng bộ PC */}
                    {(!user || user.role?.toLowerCase() !== 'admin') && (
                      <Link 
                        href="/cart" 
                        onClick={toggleMenu} 
                        className="text-dark position-relative text-decoration-none"
                        title="Giỏ hàng"
                      >
                        <i className="fas fa-shopping-bag fs-5"></i>
                        {totalItems > 0 && (
                          <span
                            className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle animate-pulse"
                            style={{ width: "8px", height: "8px" }}
                            title={`Có ${totalItems} sản phẩm trong giỏ`}
                          >
                            <span className="visually-hidden">New alerts</span>
                          </span>
                        )}
                      </Link>
                    )}
                  </div>

                  {/* Menu phụ nếu là Admin / Đăng xuất */}
                  <div className="d-flex bg-light border-bottom px-3 py-2 gap-3 fs-7">
                    {user.role?.toLowerCase() === 'admin' && (
                      <Link href="/admin" onClick={toggleMenu} className="text-primary fw-bold text-decoration-none">
                        <i className="fas fa-cog me-1"></i> Quản trị
                      </Link>
                    )}
                    <Link href="/profile" onClick={toggleMenu} className="text-secondary text-decoration-none">
                      Hồ sơ
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="btn btn-link p-0 text-danger text-decoration-none ms-auto fw-semibold border-0 bg-transparent"
                      style={{ fontSize: '0.85rem' }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                /* Trường hợp chưa đăng nhập */
                <div className="d-flex align-items-center justify-content-between p-3">
                  <Link 
                    href="/login" 
                    onClick={toggleMenu} 
                    className="btn text-white fw-bold px-4"
                    style={{ backgroundColor: '#d96c34' }}
                  >
                    Đăng nhập
                  </Link>

                  <Link 
                    href="/cart" 
                    onClick={toggleMenu} 
                    className="text-dark position-relative me-2 text-decoration-none"
                    title="Giỏ hàng"
                  >
                    <i className="fas fa-shopping-bag fs-5"></i>
                    {totalItems > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle animate-pulse"
                        style={{ width: "8px", height: "8px" }}
                        title={`Có ${totalItems} sản phẩm trong giỏ`}
                      >
                        <span className="visually-hidden">New alerts</span>
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: TRANG CHÍNH (HEADER NAVIGATION) */}
          <div className="py-2">
            <div className="px-3 py-2 text-uppercase text-muted fw-bold style-heading">
              TRANG CHÍNH
            </div>
            <ul className="list-unstyled mb-0">
              {navLinks.map((link, idx) => (
                <li key={idx} className="border-bottom">
                  <Link
                    href={link.href}
                    className="d-flex align-items-center gap-3 px-3 py-3 text-decoration-none fw-bold"
                    style={{ color: link.active ? '#d96c34' : '#222222' }}
                    onClick={toggleMenu}
                  >
                    <i className={`${link.icon} fs-5`} style={{ width: '20px', color: link.active ? '#d96c34' : '#555' }}></i>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 3: DANH MỤC SẢN PHẨM */}
          <div className="py-2 bg-light-subtle">
            <div className="px-3 py-2 text-uppercase text-muted fw-bold style-heading">
              DANH MỤC SẢN PHẨM
            </div>
            <ul className="list-unstyled mb-0 bg-white">
              <li className="border-bottom">
                <Link
                  href="/products"
                  className="d-flex align-items-center justify-content-between px-3 py-3 text-decoration-none text-dark fw-bold"
                  onClick={toggleMenu}
                >
                  <span className="d-flex align-items-center gap-3">
                    <i className="fas fa-th fs-5 text-secondary" style={{ width: '20px' }}></i>
                    <span>Tất cả sản phẩm</span>
                  </span>
                  <i className="fas fa-chevron-right text-muted small"></i>
                </Link>
              </li>

              {categories.map((cat) => (
                <li key={cat._id || cat.slug} className="border-bottom">
                  <Link
                    href={`/products?categoryID=${cat._id || cat.slug}`}
                    className="d-flex align-items-center justify-content-between px-3 py-3 text-decoration-none text-dark fw-bold"
                    onClick={toggleMenu}
                  >
                    <span className="d-flex align-items-center gap-3">
                      <i className="fas fa-shoe-prints fs-5 text-secondary" style={{ width: '20px' }}></i>
                      <span>{cat.name}</span>
                    </span>
                    <i className="fas fa-chevron-down text-muted small"></i>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Style tùy chỉnh hiệu ứng nhấp nháy pulse */}
      <style jsx>{`
        .style-heading {
          font-size: 0.72rem;
          letter-spacing: 0.5px;
        }
        .nk-drawer-header {
          background-color: #d96c34 !important;
        }
        @keyframes pulseAnimation {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(220, 53, 69, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }
        .animate-pulse {
          animation: pulseAnimation 1.5s infinite;
        }
      `}</style>
    </>
  );
}
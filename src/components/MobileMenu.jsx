'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileMenu({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Lấy thông tin user đăng nhập từ localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Danh sách navigation chính tương tự trên PC
  const navLinks = [
    { label: 'TRANG CHỦ', href: '/', icon: 'fas fa-home' },
    { label: 'BỘ SƯU TẬP', href: '/collections', icon: 'fas fa-th-large' },
    { label: 'TIN TỨC', href: '/news', icon: 'fas fa-newspaper' },
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

      {/* Backdrop (Lớp nền mờ phía sau) */}
      <div 
        className={`nk-drawer-backdrop ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      />

      {/* Offcanvas Drawer */}
      <div className={`nk-mobile-drawer ${isOpen ? 'active' : ''}`}>
        {/* Header Drawer (Nền xanh + Logo + Nút ✕) */}
        <div className="nk-drawer-header">
          <div className="nk-drawer-brand">
            <Image 
              src="/img/df0accc9-68c0-4de5-b2c4-c7b28ba43e80.jpg"
              alt="Nova Kicks Logo" 
              width={130}
              height={36}
              style={{ objectFit: 'contain', brightness: 0, invert: 1 }}
            />
          </div>
          <button className="nk-drawer-close" onClick={toggleMenu} aria-label="Đóng Menu">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body Drawer (Nội dung cuộn) */}
        <div className="nk-drawer-body">
          {/* 1. THÔNG TIN TÀI KHOẢN & GIỎ HÀNG (ĐỒNG BỘ PC HEADER) */}
          <div className="nk-drawer-user-bar">
            {user ? (
              <div className="d-flex align-items-center justify-content-between w-100 px-3 py-2 border-bottom bg-light">
                <span className="fw-bold text-uppercase text-dark small d-flex align-items-center gap-2">
                  <i className="fas fa-user-circle text-orange"></i>
                  CHÀO, {user.fullname || user.name || 'NGUYỄN HOÀNG HẢI NAM'}
                </span>
                <Link href="/cart" onClick={toggleMenu} className="text-dark position-relative ms-2">
                  <i className="fas fa-shopping-bag fs-5"></i>
                </Link>
              </div>
            ) : (
              <div className="d-flex gap-2 p-3 border-bottom bg-light">
                <Link 
                  href="/login" 
                  onClick={toggleMenu} 
                  className="btn btn-sm text-white fw-bold flex-fill"
                  style={{ backgroundColor: '#d96c34' }}
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/register" 
                  onClick={toggleMenu} 
                  className="btn btn-sm btn-outline-secondary fw-bold flex-fill"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* 2. ĐIỀU HƯỚNG CHÍNH (HEADER NAV) */}
          <div className="nk-drawer-section-title mt-2">TRANG CHÍNH</div>
          <ul className="nk-drawer-menu mb-3">
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <Link href={link.href} onClick={toggleMenu}>
                  <span className="menu-item-left">
                    <i className={`${link.icon} menu-icon`}></i>
                    <span style={{ color: link.href === '/' ? '#d96c34' : 'inherit', fontWeight: 'bold' }}>
                      {link.label}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* 3. DANH MỤC SẢN PHẨM */}
          <div className="nk-drawer-section-title">DANH MỤC SẢN PHẨM</div>
          <ul className="nk-drawer-menu">
            <li>
              <Link href="/products" onClick={toggleMenu}>
                <span className="menu-item-left">
                  <i className="fas fa-th menu-icon"></i>
                  <span>Tất cả sản phẩm</span>
                </span>
                <i className="fas fa-chevron-right arrow-icon"></i>
              </Link>
            </li>

            {categories.map((cat) => (
              <li key={cat._id || cat.slug}>
                <Link href={`/products?categoryID=${cat._id || cat.slug}`} onClick={toggleMenu}>
                  <span className="menu-item-left">
                    <i className="fas fa-shoe-prints menu-icon"></i>
                    <span>{cat.name}</span>
                  </span>
                  <i className="fas fa-chevron-down arrow-icon"></i>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CSS bổ sung trực tiếp cho các class mới (nếu chưa có trong file CSS chung) */}
      <style jsx>{`
        .text-orange {
          color: #d96c34 !important;
        }
        .nk-drawer-menu li a:hover {
          color: #d96c34;
        }
      `}</style>
    </>
  );
}
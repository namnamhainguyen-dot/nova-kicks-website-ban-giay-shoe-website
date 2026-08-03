'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileMenu({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

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

        {/* Nội dung Danh mục */}
        <div className="nk-drawer-body">
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
              <li key={cat._id}>
                <Link href={`/products?categoryID=${cat._id}`} onClick={toggleMenu}>
                  <span className="menu-item-left">
                    {/* Icon tương ứng từng thương hiệu/danh mục */}
                    <i className="fas fa-shoe-prints menu-icon"></i>
                    <span>{cat.name}</span>
                  </span>
                  <i className="fas fa-chevron-down arrow-icon"></i>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Thanh Action Đáy Drawer (Zalo | Cart | Mua hàng ngay) */}
        <div className="nk-drawer-footer">
          <a href="https://zalo.me" target="_blank" rel="noreferrer" className="nk-footer-action-btn action-zalo">
            <i className="fas fa-comment-dots"></i>
            <span>Zalo</span>
          </a>

          <Link href="/cart" onClick={toggleMenu} className="nk-footer-action-btn action-cart">
            <i className="fas fa-shopping-bag"></i>
          </Link>

          <Link href="/products" onClick={toggleMenu} className="nk-btn-buy-now">
            MUA HÀNG NGAY
          </Link>
        </div>
      </div>
    </>
  );
}
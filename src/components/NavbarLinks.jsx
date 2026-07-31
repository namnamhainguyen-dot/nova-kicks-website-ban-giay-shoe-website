"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarLinks() {
  const pathname = usePathname();

  return (
    <ul className="nk-links">
      <li>
        <Link href="/" className={pathname === "/" ? "active" : ""}>
          <i className="fas fa-home" style={{ marginRight: '4px', fontSize: '0.6rem' }}></i>
          Trang chủ
        </Link>
      </li>
      <li>
        <Link href="/products" className={pathname.startsWith("/products") ? "active" : ""}>
          <i className="fas fa-th-large" style={{ marginRight: '4px', fontSize: '0.6rem' }}></i>
          Bộ sưu tập
        </Link>
      </li>
      <li>
        <Link href="/new" className={pathname.startsWith("/new") ? "active" : ""}>
          <i className="fas fa-newspaper" style={{ marginRight: '4px', fontSize: '0.6rem' }}></i>
          Tin tức
        </Link>
      </li>
      <li>
        <Link href="/contact" className={pathname.startsWith("/contact") ? "active" : ""}>
          <i className="fas fa-envelope" style={{ marginRight: '4px', fontSize: '0.6rem' }}></i>
          Liên hệ
        </Link>
      </li>
    </ul>
  );
}
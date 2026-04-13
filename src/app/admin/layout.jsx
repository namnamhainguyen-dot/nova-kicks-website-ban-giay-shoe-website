import Link from "next/link";

export default function Layout({ children }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Susan Coffee - Tổng quan</title>

        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/admin.css" />
      </head>

      <body>
        <div className="sidebar d-flex flex-column p-3">
          <h3 className="text-center mb-4">
            Susan Coffee<br />ADMIN
          </h3>

          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link href="/admin" className="nav-link active">
                Tổng quan
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/account" className="nav-link">
                Quản lý Tài khoản
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/product" className="nav-link">
                Quản lý Sản phẩm
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link href="/admin/tables" className="nav-link">
                Quản lý Bàn
              </Link>
            </li>

            <li className="nav-item mt-5 border-top">
              <a href="#" className="nav-link">
                Đăng xuất
              </a>
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
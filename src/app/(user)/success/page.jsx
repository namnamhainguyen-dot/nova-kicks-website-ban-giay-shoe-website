export default function Success() {
    return (
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Susan Coffee - Đặt hàng thành công</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="public/css/style.css" />
  </head>
  <body>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container">
        <a className="navbar-brand fw-bold" href="/">Susan Coffee</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active" href="/cart">Giỏ hàng</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/login">Đăng nhập</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/register">Đăng ký</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>


    <main
      className="container mt-5 pt-5 d-flex justify-content-center align-items-center"
      style={{ minHeight: 70 + "vh" }}
    >
      <div className="col-md-8 col-lg-6">
        <div className="alert alert-success text-center shadow-lg p-4">
          <h2 className="mb-3">🎉 Đặt hàng thành công!</h2>
          <p>Cảm ơn bạn đã đặt hàng tại <strong>Susan Coffee</strong>.</p>
          <p>
            Đơn hàng của bạn đang được xử lý và sẽ được phục vụ tại bàn bạn đã
            chọn.
          </p>
          <a href="/" className="btn btn-dark mt-3">Quay lại Menu</a>
        </div>
      </div>
    </main>


    <footer className="bg-dark text-white text-center py-3 mt-auto">
      <p>Susan Coffee - 123 Đường ABC, TP.HCM</p>
      <p>Hotline: 0123 456 789 | Email: susancoffee@gmail.com</p>
      <p>&copy; 2026 Susan Coffee. All rights reserved.</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>
    );
}
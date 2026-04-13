import Link from "next/link";

export default function Login() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <Link className="navbar-brand fw-bold" href="/">
            Susan Coffee
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link active" href="/cart">Giỏ hàng</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/login">Đăng nhập</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/register">Đăng ký</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main
        className="container mt-5 pt-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="text-center mb-4">Đăng nhập</h3>

              <form>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Số điện thoại</label>
                  <input type="text" className="form-control" id="phone" required />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mật khẩu</label>
                  <input type="password" className="form-control" id="password" required />
                </div>

                <button type="submit" className="btn btn-dark w-100">
                  Đăng nhập
                </button>
              </form>

              <p className="text-center mt-3">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="text-dark">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p>Susan Coffee - 123 Đường ABC, TP.HCM</p>
      </footer>
    </>
  );
}
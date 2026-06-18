"use client";
import Link from "next/link";

export default function Profile() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light text-secondary" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar hiện đại */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top shadow-sm py-3">
        <div className="container">
          <Link className="navbar-brand fw-extrabold text-dark fs-4 tracking-tight" href="/">
            Nova<span className="text-primary">.</span>kicks
          </Link>

          <div className="collapse navbar-collapse justify-content-end">
            <ul className="navbar-nav gap-2">
              <li className="nav-item">
                <Link className="nav-link px-3 rounded-pill hover-bg-light" href="/cart">
                  Giỏ hàng
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 rounded-pill hover-bg-light" href="/login">
                  Đăng nhập
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link btn btn-dark text-white px-4 rounded-pill shadow-sm" href="/register">
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Nội dung chính */}
      <main className="container my-5 pt-5 flex-grow-1">
        <div className="text-center my-4">
          <h1 className="fw-bold text-dark mb-2">Hồ sơ cá nhân</h1>
          <p className="text-muted">Quản lý thông tin tài khoản và lịch sử mua sắm của bạn</p>
        </div>

        <div className="row g-4">
          {/* Khối Thông tin cá nhân */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", fontSize: "20px" }}>
                    👤
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0">Thông tin cá nhân</h4>
                    <small className="text-muted">Cập nhật thông tin liên hệ</small>
                  </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control rounded-3 border-light bg-light"
                      id="fullname"
                      placeholder="Họ và tên"
                      defaultValue="Nguyễn Văn A"
                    />
                    <label htmlFor="fullname" className="text-muted">Họ và tên</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control rounded-3 border-light bg-light"
                      id="email"
                      placeholder="Email"
                      defaultValue="nguyenvana@example.com"
                    />
                    <label htmlFor="email" className="text-muted">Email</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control rounded-3 border-light bg-light"
                      id="phone"
                      placeholder="Số điện thoại"
                      defaultValue="0123456789"
                    />
                    <label htmlFor="phone" className="text-muted">Số điện thoại</label>
                  </div>

                  <div className="form-floating mb-4">
                    <input
                      type="text"
                      className="form-control rounded-3 border-light bg-light"
                      id="address"
                      placeholder="Địa chỉ"
                      defaultValue="123 Đường ABC, TP.HCM"
                    />
                    <label htmlFor="address" className="text-muted">Địa chỉ giao hàng</label>
                  </div>

                  <button type="submit" className="btn btn-dark w-100 py-2.5 rounded-3 fw-semibold shadow-sm transition">
                    Cập nhật thông tin
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Khối Đơn hàng đã đặt */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", fontSize: "20px" }}>
                    📦
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0">Đơn hàng đã đặt</h4>
                    <small className="text-muted">Lịch sử giao dịch gần đây</small>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle custom-table">
                    <thead>
                      <tr className="text-muted small text-uppercase">
                        <th className="border-0 pb-3">Mã đơn</th>
                        <th className="border-0 pb-3">Sản phẩm</th>
                        <th className="border-0 pb-3">Ngày đặt</th>
                        <th className="border-0 pb-3">Trạng thái</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td className="fw-bold text-dark py-3">#DH001</td>
                        <td className="py-3">Nova Runner <span className="text-muted small">x2</span></td>
                        <td className="text-muted py-3">20/03/2026</td>
                        <td className="py-3">
                          <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 fw-medium">
                            Hoàn thành
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="fw-bold text-dark py-3">#DH002</td>
                        <td className="py-3">Air Glide <span className="text-muted small">x1</span>, Street Classic <span className="text-muted small">x1</span></td>
                        <td className="text-muted py-3">22/03/2026</td>
                        <td className="py-3">
                          <span className="badge rounded-pill bg-warning-subtle text-warning px-3 py-2 fw-medium">
                            Đang xử lý
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="fw-bold text-dark py-3">#DH003</td>
                        <td className="py-3">Urban Slip-on <span className="text-muted small">x1</span></td>
                        <td className="text-muted py-3">23/03/2026</td>
                        <td className="py-3">
                          <span className="badge rounded-pill bg-info-subtle text-info px-3 py-2 fw-medium">
                            Đang chuẩn bị
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button className="btn btn-outline-dark w-100 py-2.5 rounded-3 fw-semibold mt-3 transition">
                  Xem toàn bộ chi tiết đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer tối giản và sang trọng */}
      <footer className="bg-white border-top text-muted py-4 mt-auto">
        <div className="container text-center">
          <p className="fw-bold text-dark mb-1">Nova-kicks</p>
          <p className="small mb-2">123 Đường ABC, TP.HCM | Hotline: 0123 456 789 | Email: support@nova-kicks.com</p>
          <p className="small mb-0 text-light-emphasis">&copy; 2026 Nova-kicks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
"use client";
import Link from "next/link";

export default function Profile() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <Link className="navbar-brand fw-bold" href="/">
            Susan Coffee
          </Link>

          <div className="collapse navbar-collapse justify-content-end">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link active" href="/cart">
                  Giỏ hàng
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/login">
                  Đăng nhập
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/register">
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container mt-5 pt-5">
        <h1 className="text-center mb-4">Hồ sơ cá nhân</h1>

        <div className="row">
          {/* Form chỉnh sửa thông tin */}
          <div className="col-md-6 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <h4 className="mb-3">Thông tin cá nhân</h4>

                <form>
                  <div className="mb-3">
                    <label htmlFor="fullname" className="form-label">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullname"
                      defaultValue="Nguyễn Văn A"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      defaultValue="nguyenvana@example.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      defaultValue="0123456789"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      defaultValue="123 Đường ABC, TP.HCM"
                    />
                  </div>

                  <button type="submit" className="btn btn-dark">
                    Cập nhật thông tin
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Đơn hàng */}
          <div className="col-md-6 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <h4 className="mb-3">Đơn hàng đã đặt</h4>

                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Mã đơn</th>
                        <th>Sản phẩm</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>#DH001</td>
                        <td>Cà phê sữa x2</td>
                        <td>20/03/2026</td>
                        <td>
                          <span className="badge bg-success">
                            Hoàn thành
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>#DH002</td>
                        <td>Latte x1, Trà đào x1</td>
                        <td>22/03/2026</td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            Đang xử lý
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>#DH003</td>
                        <td>Cà phê dừa x1</td>
                        <td>23/03/2026</td>
                        <td>
                          <span className="badge bg-info text-dark">
                            Đang chuẩn bị
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button className="btn btn-dark mt-2">
                  Xem chi tiết đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p>Susan Coffee - 123 Đường ABC, TP.HCM</p>
        <p>Hotline: 0123 456 789 | Email: susancoffee@gmail.com</p>
        <p>&copy; 2026 Susan Coffee</p>
      </footer>
    </>
  );
}
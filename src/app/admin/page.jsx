export default function Dashboard() {
  return (
    <div className="content admin-dashboard-page">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-2">Dashboard</h1>
          <p className="text-muted mb-0">Bảng điều khiển tổng quan đơn hàng, doanh thu và hệ thống.</p>
        </div>
        <button className="btn btn-dark btn-lg px-4">Xuất báo cáo</button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 card-value">
            <div className="card-body">
              <small className="text-uppercase text-secondary">Tổng doanh thu</small>
              <h2 className="fw-bold mt-3">999.999.999</h2>
              <div className="text-success small mt-2">+12.4%</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 card-value">
            <div className="card-body">
              <small className="text-uppercase text-secondary">Thành viên mới</small>
              <h2 className="fw-bold mt-3">450</h2>
              <div className="text-success small mt-2">+5.2%</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 card-value">
            <div className="card-body">
              <small className="text-uppercase text-secondary">Tổng đơn hàng</small>
              <h2 className="fw-bold mt-3">3.200</h2>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 card-value card-value-dark">
            <div className="card-body">
              <small className="text-uppercase text-white-50">Đơn hàng chờ giao</small>
              <h2 className="fw-bold mt-3 text-white">04</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-4 mb-4">
        <div className="col-xl-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="mb-1 fw-semibold">Tổng quan doanh số</h5>
                </div>
                <div className="text-muted small">Doanh thu / Dự báo</div>
              </div>
              <div className="chart-bars">
                <div className="chart-row">
                  <span className="chart-label">Tuần 01</span>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar chart-bar-dark" style={{ height: '60%' }} />
                    <div className="chart-bar chart-bar-light" style={{ height: '42%' }} />
                  </div>
                </div>
                <div className="chart-row">
                  <span className="chart-label">Tuần 02</span>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar chart-bar-dark" style={{ height: '80%' }} />
                    <div className="chart-bar chart-bar-light" style={{ height: '50%' }} />
                  </div>
                </div>
                <div className="chart-row">
                  <span className="chart-label">Tuần 03</span>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar chart-bar-dark" style={{ height: '70%' }} />
                    <div className="chart-bar chart-bar-light" style={{ height: '55%' }} />
                  </div>
                </div>
                <div className="chart-row">
                  <span className="chart-label">Tuần 04</span>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar chart-bar-dark" style={{ height: '65%' }} />
                    <div className="chart-bar chart-bar-light" style={{ height: '45%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-semibold">Hoạt động gần đây</h5>
                <span className="badge bg-light text-dark">Live</span>
              </div>
              <ul className="list-unstyled activity-list mb-0">
                <li>
                  <strong>#9021 hoàn thành</strong>
                  <div className="text-muted small">Jordan Retro 4 Fresh - 2 phút trước</div>
                </li>
                <li>
                  <strong>Người dùng mới đăng ký tài khoản</strong>
                  <div className="text-muted small">marcus.stylenew@gmail.com - 15 phút trước</div>
                </li>
                <li>
                  <strong>Cảnh báo tồn kho: sắp hết hàng</strong>
                  <div className="text-muted small">Nike Dunk Low Panda - size 10 - 42 phút trước</div>
                </li>
                <li>
                  <strong>Cập nhật giá thành công</strong>
                  <div className="text-muted small">Adidas Yeezy Boost 350 V2 - 1 tiếng trước</div>
                </li>
              </ul>
              <button className="btn btn-outline-dark w-100 mt-3">Xem tất cả hoạt động</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-4">
        <div className="col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Bán chạy nhất</h5>
              <div className="best-sellers">
                <div className="best-seller-item">
                  <div>
                    <div className="fw-semibold">Nike Air Max 90</div>
                    <div className="text-muted small">121 sales · +12%</div>
                  </div>
                  <div className="fw-bold">372.000.000 VND</div>
                </div>
                <div className="best-seller-item">
                  <div>
                    <div className="fw-semibold">Adidas Forum Hi</div>
                    <div className="text-muted small">98 sales · +4%</div>
                  </div>
                  <div className="fw-bold">362.600.000 VND</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Chỉ số hệ thống</h5>
              <div className="system-stats">
                <div className="stat-row">
                  <div className="stat-label">Tải máy chủ</div>
                  <div className="stat-value">24%</div>
                  <div className="progress stat-progress">
                    <div className="progress-bar bg-dark" style={{ width: '24%' }} />
                  </div>
                </div>
                <div className="stat-row">
                  <div className="stat-label">Tỷ lệ hoạt động API</div>
                  <div className="stat-value">99.9%</div>
                  <div className="progress stat-progress">
                    <div className="progress-bar bg-success" style={{ width: '99.9%' }} />
                  </div>
                </div>
                <div className="stat-row">
                  <div className="stat-label">Phiên hoạt động</div>
                  <div className="stat-value">1,402</div>
                </div>
                <div className="stat-row">
                  <div className="stat-label">Tỷ lệ lỗi</div>
                  <div className="stat-value">0.02%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
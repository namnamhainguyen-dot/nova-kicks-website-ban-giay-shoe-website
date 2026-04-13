export default function Dashboard() {
    return (<div className="content">

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <h5 className="card-title">Doanh thu hôm nay</h5>
              <h3 className="text-success">5.200.000đ</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <h5 className="card-title">Đơn hàng hôm nay</h5>
              <h3 className="text-primary">48</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <h5 className="card-title">Khách hàng mới</h5>
              <h3 className="text-info">12</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <h5 className="card-title">Bàn đang sử dụng</h5>
              <h3 className="text-warning">15/20</h3>
            </div>
          </div>
        </div>
      </div>

  
      <div className="card shadow mb-4">
        <div className="card-body">
          <h4 className="card-title">Doanh thu theo tuần</h4>
          <p>
            (Khu vực này có thể hiển thị biểu đồ doanh thu bằng chart.js hoặc
            bảng thống kê)
          </p>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <h4 className="card-title">Đơn hàng gần đây</h4>
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#DH101</td>
                <td>Nguyễn Văn B</td>
                <td>Cà phê sữa x2</td>
                <td>24/03/2026 - 15:30</td>
                <td><span className="badge bg-success">Hoàn thành</span></td>
              </tr>
              <tr>
                <td>#DH102</td>
                <td>Trần Thị C</td>
                <td>Latte x1</td>
                <td>24/03/2026 - 15:45</td>
                <td>
                  <span className="badge bg-warning text-dark">Đang xử lý</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
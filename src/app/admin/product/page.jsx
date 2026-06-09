export default function Product() {
    return (
        <div className="content">
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="card-title">Danh sách sản phẩm</h4>
            <a className="btn btn-outline-dark" href="admin-product-form.html"
              >+ Thêm sản phẩm</a
            >
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>P001</td>
                  <td>Nova Runner</td>
                  <td>1.200.000đ</td>
                  <td><span className="badge bg-success">Còn hàng</span></td>
                  <td>
                    <button className="btn btn-warning btn-sm">Sửa</button>
                    <button className="btn btn-danger btn-sm">Xóa</button>
                  </td>
                </tr>
                <tr>
                  <td>P002</td>
                  <td>Air Glide</td>
                  <td>1.450.000đ</td>
                  <td><span className="badge bg-success">Còn hàng</span></td>
                  <td>
                    <button className="btn btn-warning btn-sm">Sửa</button>
                    <button className="btn btn-danger btn-sm">Xóa</button>
                  </td>
                </tr>
                <tr>
                  <td>P003</td>
                  <td>Street Classic</td>
                  <td>990.000đ</td>
                  <td><span className="badge bg-secondary">Hết hàng</span></td>
                  <td>
                    <button className="btn btn-warning btn-sm">Sửa</button>
                    <button className="btn btn-danger btn-sm">Xóa</button>
                  </td>
                </tr>
                <tr>
                  <td>P004</td>
                  <td>Urban Slip-on</td>
                  <td>850.000đ</td>
                  <td><span className="badge bg-success">Còn hàng</span></td>
                  <td>
                    <button className="btn btn-warning btn-sm">Sửa</button>
                    <button className="btn btn-danger btn-sm">Xóa</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    )
}

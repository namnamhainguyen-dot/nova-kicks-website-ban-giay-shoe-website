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
                  <td>Cà phê sữa</td>
                  <td>30.000đ</td>
                  <td><span class="badge bg-success">Đang bán</span></td>
                  <td>
                    <button class="btn btn-warning btn-sm">Sửa</button>
                    <button class="btn btn-danger btn-sm">Xóa</button>
                  </td>
                </tr>
                <tr>
                  <td>P002</td>
                  <td>Latte</td>
                  <td>45.000đ</td>
                  <td><span class="badge bg-success">Đang bán</span></td>
                  <td>
                    <button class="btn btn-warning btn-sm">Sửa</button>
                    <button class="btn btn-danger btn-sm">Xóa</button>
                  </td>
                </tr>
                <tr>
                  <td>P003</td>
                  <td>Trà đào</td>
                  <td>35.000đ</td>
                  <td><span class="badge bg-secondary">Ngừng bán</span></td>
                  <td>
                    <button class="btn btn-warning btn-sm">Sửa</button>
                    <button class="btn btn-danger btn-sm">Xóa</button>
                  </td>
                </tr>
                <tr>
                  <td>P004</td>
                  <td>Bánh ngọt</td>
                  <td>25.000đ</td>
                  <td><span class="badge bg-success">Đang bán</span></td>
                  <td>
                    <button class="btn btn-warning btn-sm">Sửa</button>
                    <button class="btn btn-danger btn-sm">Xóa</button>
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
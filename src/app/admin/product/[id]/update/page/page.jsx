export default function UpdateProduct() {
    return (
        <div className="content">
      <div className="card shadow">
        <div className="card-body">
          <h4 className="card-title mb-4">Sửa sản phẩm</h4>
          <htmlForm>
            <div className="mb-3">
              <label htmlFor="productName" className="htmlForm-label">Tên sản phẩm</label>
              <input
                type="text"
                className="htmlForm-control"
                id="productName"
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>
            <div className="row row-cols-2">
              <div className="mb-3">
                <label htmlFor="price" className="htmlForm-label">Giá (VNĐ)</label>
                <input
                  type="number"
                  className="htmlForm-control"
                  id="price"
                  placeholder="Nhập giá sản phẩm"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="status" className="htmlForm-label">Trạng thái</label>
                <select className="htmlForm-select" id="status" required>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="htmlForm-label">Ảnh sản phẩm</label>
              <input
                type="file"
                className="htmlForm-control"
                id="image"
                accept="image/*"
              />
            </div>
            <button type="submit" className="btn btn-dark">Lưu sản phẩm</button>
            <a href="admin-products.html" className="btn btn-outline-secondary"
              >Hủy</a>
          </htmlForm>
        </div>
      </div>
    </div>
    )
}
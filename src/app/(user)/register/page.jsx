export default function Register(register) {
    return (<main
      className="container mt-5 pt-5 d-flex justify-content-center align-items-center"
      style={{ minHeight: '70vh' }}
    >
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body">
            <h3 className="text-center mb-4">Đăng ký tài khoản</h3>
            <htmlForm>
              <div className="mb-3">
                <label htmlFor="fullname" className="htmlForm-label">Họ và tên</label>
                <input
                  type="text"
                  className="htmlForm-control"
                  id="fullname"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="htmlForm-label">Số điện thoại</label>
                <input
                  type="text"
                  className="htmlForm-control"
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="htmlForm-label">Mật khẩu</label>
                <input
                  type="password"
                  className="htmlForm-control"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="htmlForm-label"
                  >Xác nhận mật khẩu</label
                >
                <input
                  type="password"
                  className="htmlForm-control"
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>
              <button type="submit" className="btn btn-dark w-100">Đăng ký</button>
            </htmlForm>
            <p className="text-center mt-3">
              Đã có tài khoản? <a href="#" className="text-dark">Đăng nhập ngay</a>
            </p>
          </div>
        </div>
      </div>
    </main>);
}
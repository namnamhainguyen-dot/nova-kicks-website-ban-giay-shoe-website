import Link from "next/link";

export default function Register() {
  return (
    <main className="container-fluid min-vh-100 p-0 d-flex flex-column flex-md-row" style={{ paddingTop: "70px", backgroundColor: "#ffffff" }}>
      
      {/* CỘT TRÁI: ẢNH BANNER LỚN PHONG CÁCH STREETWEAR */}
      <div 
        className="col-md-5 d-flex flex-column justify-content-end p-5 text-white position-relative overflow-hidden min-vh-50 min-vh-md-100"
        style={{
          backgroundImage: "url('https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Lớp phủ tối mờ góc trái */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-40 z-0"></div>
        
        <div className="position-relative z-1 mb-4">
          <span className="bg-black text-white px-2 py-1 small fw-bold text-uppercase tracking-widest mb-3 d-inline-block border border-secondary" style={{ fontSize: "0.65rem" }}>
            INNER CIRCLE
          </span>
          <h1 className="display-4 fw-black text-uppercase tracking-normal m-0 lh-1">
            ACCESS<br />IS EVERYTHING.
          </h1>
          
          <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex flex-column gap-3">
            <div className="d-flex align-items-start gap-2">
              <span className="small">⚡</span>
              <div>
                <strong className="text-uppercase tracking-wider small d-block">Early Access</strong>
                <span className="text-secondary" style={{ fontSize: "0.75rem" }}>Shop upcoming drops 24 hours before the public release.</span>
              </div>
            </div>
            <div className="d-flex align-items-start gap-2">
              <span className="small">★</span>
              <div>
                <strong className="text-uppercase tracking-wider small d-block">Exclusive Drops</strong>
                <span className="text-secondary" style={{ fontSize: "0.75rem" }}>Unlock members-only silhouettes and colorways.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: FORM ĐĂNG KÝ TRẮNG TINH TẾ (Đã fix lỗi htmlForm -> form) */}
      <div className="col-md-7 d-flex align-items-center justify-content-center bg-white py-5">
        <div className="col-10 col-sm-8 col-md-7">
          
          <div className="text-md-start text-center mb-4">
            <h2 className="fw-black text-uppercase tracking-widest m-0" style={{ color: "#012a3a" }}>
              TẠO TÀI KHOẢN
            </h2>
            <p className="small text-secondary text-uppercase tracking-wider mt-1">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="text-dark fw-bold text-decoration-none border-bottom border-dark">
                ĐĂNG NHẬP LẠI
              </Link>
            </p>
          </div>

          {/* Form đăng ký - Giữ nguyên toàn bộ ID, thuộc tính của các ô Input ban đầu */}
          <form>
            <div className="row g-3 mb-3">
              <div className="col-md-12">
                <label htmlFor="fullname" className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  className="form-control rounded-0 border-secondary bg-white text-dark py-2"
                  id="fullname"
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                className="form-control rounded-0 border-secondary bg-white text-dark py-2"
                id="phone"
                placeholder="Nhập số điện thoại đăng ký"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                className="form-control rounded-0 border-secondary bg-white text-dark py-2"
                id="password"
                placeholder="Nhập mật khẩu an toàn"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                className="form-control rounded-0 border-secondary bg-white text-dark py-2"
                id="confirmPassword"
                placeholder="Nhập lại mật khẩu phía trên"
                required
              />
            </div>

            <button type="submit" className="btn btn-dark w-100 rounded-0 py-2.5 text-uppercase fw-bold tracking-widest border-0" style={{ backgroundColor: "#012a3a" }}>
              Tạo tài khoản
            </button>
          </form>

          {/* Thẻ chuyển hướng dự phòng gốc */}
          <p className="text-center mt-4 small text-secondary text-uppercase tracking-wider d-block d-md-none">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-dark fw-bold">
              Đăng nhập ngay
            </Link>
          </p>

        </div>
      </div>

    </main>
  );
}

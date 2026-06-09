import Link from "next/link";

export default function Login() {
  return (
    <main
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center position-relative px-0"
      style={{
        backgroundImage: "url('https://myshoes.vn/image/catalog/2026/nike/526/giay-nike-downshifter-14-nam-trang-xanh-01.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "80px",
        color: "#ffffff"
      }}
    >
      {/* Lớp phủ màu sáng/mờ làm dịu ảnh nền giống Figma */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-75 z-0"></div>

      <div className="col-11 col-sm-8 col-md-6 col-lg-4 position-relative z-1 my-5 text-dark">
        <div className="text-center mb-4">
          <h2 className="fw-black text-uppercase tracking-widest m-0" style={{ color: "#062c3d", fontSize: "2rem" }}>
            MEMBER ACCESS
          </h2>
          <small className="text-secondary text-uppercase tracking-wider small d-block mt-1">
            AUTHENTICATE TO CONTINUE
          </small>
        </div>

        {/* Nút đăng nhập nhanh bằng Google theo thiết kế */}
        <button className="btn btn-outline-dark w-100 rounded-0 py-2 mb-4 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 border-2 small tracking-wide bg-white-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.556-4.43 10.556-10.74 0-.72-.08-1.265-.175-1.685H12.24z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <div className="position-relative text-center my-4">
          <hr className="border-secondary opacity-25" />
          <span className="position-absolute top-50 start-50 translate-middle bg-transparent px-3 text-secondary small fw-bold tracking-widest">OR EMAIL</span>
        </div>

        {/* Form đăng nhập - Giữ nguyên toàn bộ các thẻ input và ID ban đầu */}
        <form>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label text-uppercase small fw-bold tracking-wider m-0 mb-1">
              Nhập Email hoặc Số điện thoại
            </label>
            <input 
              type="text" 
              className="form-control rounded-0 border-secondary bg-white text-dark py-2" 
              id="phone" 
              placeholder="Email hoặc số điện thoại của bạn..."
              required 
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label text-uppercase small fw-bold tracking-wider m-0 mb-1">
              Mật khẩu
            </label>
            <input 
              type="password" 
              className="form-control rounded-0 border-secondary bg-white text-dark py-2" 
              id="password" 
              placeholder="••••••••"
              required 
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4 small fw-bold text-uppercase tracking-wider">
            <div className="form-check m-0 d-flex align-items-center gap-2">
              <input type="checkbox" className="form-check-input rounded-0 border-dark" id="remember" />
              <label className="form-check-label text-secondary fs-7" htmlFor="remember">Ghi nhớ</label>
            </div>
            <a href="#" className="text-secondary text-decoration-none fs-7">Quên mật khẩu</a>
          </div>

          <button type="submit" className="btn btn-dark w-100 rounded-0 py-2.5 text-uppercase fw-bold tracking-widest border-0" style={{ backgroundColor: "#012a3a" }}>
            Đăng nhập vào tài khoản
          </button>
        </form>

        <p className="text-center mt-4 small text-secondary text-uppercase tracking-wider">
          Bạn là người mới?{" "}
          <Link href="/register" className="text-dark fw-bold border-bottom border-dark text-decoration-none pb-0.5">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  
  // Các bước: "EMAIL" (nhập email) -> "OTP" (nhập mã xác nhận) -> "RESET" (nhập pass mới)
  const [step, setStep] = useState("EMAIL"); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 🌟 BƯỚC 1: GỌI API ĐỂ GỬI MÃ OTP VỀ MAIL THẬT
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email không tồn tại trên hệ thống!");
      }
      
      setSuccess("Hệ thống đã gửi mã số OTP gồm 6 chữ số đến Email của bạn!");
      setTimeout(() => {
        setStep("OTP"); // Chuyển sang bước nhập OTP
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi gửi mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 BƯỚC 2: CHUYỂN TIẾP SANG BƯỚC THIẾT LẬP MẬT KHẨU
  // Không gọi API verify trung gian nữa nhằm giữ mã OTP lại cho Backend xử lý 1 lần ở Bước 3
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.trim().length !== 6) {
      setError("Mã số xác thực OTP bắt buộc phải đủ 6 ký tự!");
      return;
    }

    setSuccess("Mã số xác nhận hợp lệ! Hãy thiết lập lại mật khẩu.");
    setTimeout(() => {
      setStep("RESET"); // Chuyển thẳng sang bước đổi mật khẩu mới
      setSuccess("");
    }, 1200);
  };

  // 🌟 BƯỚC 3: CẬP NHẬT MẬT KHẨU MỚI VÀO CƠ SỞ DỮ LIỆU
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không trùng khớp với mật khẩu mới!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải bảo mật và dài từ 6 ký tự trở lên!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otp.trim(), // Truyền kèm OTP để backend đối chiếu và kiểm tra quyền cập nhật
          password: newPassword 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Cập nhật mật khẩu thất bại.");
      }

      setSuccess("Thiết lập lại mật khẩu thành công! Đang quay lại trang đăng nhập...");
      
      setTimeout(() => {
        router.push("/login"); // Điều hướng quay lại trang Đăng nhập
      }, 2000);
    } catch (err) {
      setError(err.message || "Cập nhật mật khẩu thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

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
      {/* Lớp phủ mờ nền */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-75 z-0"></div>

      <div className="col-11 col-sm-8 col-md-6 col-lg-4 position-relative z-1 my-5 text-dark">
        
        {/* Tiêu đề biểu mẫu */}
        <div className="text-center mb-4">
          <h2 className="fw-black text-uppercase tracking-widest m-0" style={{ color: "#062c3d", fontSize: "1.8rem" }}>
            {step === "EMAIL" && "PASSWORD RECOVERY"}
            {step === "OTP" && "SECURITY VERIFY"}
            {step === "RESET" && "NEW CREDENTIALS"}
          </h2>
          <small className="text-secondary text-uppercase tracking-wider small d-block mt-1">
            {step === "EMAIL" && "Nhập email khôi phục tài khoản"}
            {step === "OTP" && "Nhập mã số xác thực đã gửi về mail"}
            {step === "RESET" && "Thiết lập mật khẩu truy cập mới"}
          </small>
        </div>

        {/* Thông báo lỗi/thành công */}
        {error && <div className="alert alert-danger rounded-0 small py-2 text-uppercase tracking-wider fw-bold">{error}</div>}
        {success && <div className="alert alert-success rounded-0 small py-2 text-uppercase tracking-wider fw-bold">{success}</div>}

        <div className="card border-0 rounded-0 p-4 shadow-sm bg-white">
          
          {/* 🌟 BƯỚC 1: FORM NHẬP EMAIL */}
          {step === "EMAIL" && (
            <form onSubmit={handleRequestOtp}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label text-uppercase small fw-bold tracking-wider m-0 mb-1">
                  Địa chỉ Email đã đăng ký
                </label>
                <input
                  type="email"
                  className="form-control rounded-0 border-secondary bg-white text-dark py-2"
                  id="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-dark w-100 rounded-0 py-2.5 text-uppercase fw-bold tracking-widest border-0" style={{ backgroundColor: "#012a3a" }} disabled={loading}>
                {loading ? "Đang gửi mã..." : "Tiếp tục xác minh"}
              </button>
            </form>
          )}

          {/* 🌟 BƯỚC 2: FORM NHẬP MÃ SỐ OTP */}
          {step === "OTP" && (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4 text-center">
                <p className="small text-muted mb-3">Mã số xác nhận đã gửi đến <strong>{email}</strong></p>
                <input
                  type="text"
                  className="form-control rounded-0 border-secondary text-center fs-4 fw-bold tracking-widest bg-white text-dark py-2 mx-auto"
                  style={{ maxWidth: "200px" }}
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Chỉ cho phép nhập số
                  disabled={loading}
                  required
                />
              </div>
              <button type="submit" className="btn btn-dark w-100 rounded-0 py-2.5 text-uppercase fw-bold tracking-widest border-0" style={{ backgroundColor: "#012a3a" }} disabled={loading}>
                {loading ? "Đang kiểm tra..." : "Xác nhận mã số"}
              </button>
              <div className="text-center mt-3">
                <button type="button" className="btn btn-link btn-sm text-secondary text-decoration-none small" onClick={() => setStep("EMAIL")} disabled={loading}>
                  &larr; Thay đổi email khác
                </button>
              </div>
            </form>
          )}

          {/* 🌟 BƯỚC 3: FORM ĐỔI MẬT KHẨU MỚI */}
          {step === "RESET" && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label htmlFor="newPass" className="form-label text-uppercase small fw-bold tracking-wider m-0 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  className="form-control rounded-0 border-secondary bg-white text-dark py-2"
                  id="newPass"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPass" className="form-label text-uppercase small fw-bold tracking-wider m-0 mb-1">
                  Nhập lại mật khẩu mới
                </label>
                <input
                  type="password"
                  className="form-control rounded-0 border-secondary bg-white text-dark py-2"
                  id="confirmPass"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-dark w-100 rounded-0 py-2.5 text-uppercase fw-bold tracking-widest border-0" style={{ backgroundColor: "#012a3a" }} disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          )}

        </div>

        {/* Nút quay lại trang đăng nhập ban đầu */}
        <p className="text-center mt-4 small text-secondary text-uppercase tracking-wider">
          Đã nhớ ra mật khẩu?{" "}
          <Link href="/login" className="text-dark fw-bold border-bottom border-dark text-decoration-none pb-0.5">
            Quay lại Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
"use client";

import Script from 'next/script';
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    fullname: "",
    identifier: "", // Thay đổi từ phone sang identifier để nhận email hoặc sđt
    password: "",
    confirmPassword: "",
  });

  // State quản lý trạng thái UI
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi giá trị input
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Hàm kiểm tra định dạng email hoặc số điện thoại bằng Regex
  const validateIdentifier = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Nhận diện số điện thoại Việt Nam (khoảng 9-11 chữ số)
    const phoneRegex = /^(0|84)[3|5|7|8|9][0-9]{8}$/; 
    
    if (emailRegex.test(value)) return "email";
    if (phoneRegex.test(value)) return "phone";
    return null;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Kiểm tra trùng khớp mật khẩu ở client
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    // 2. Kiểm tra tính hợp lệ của Email / Số điện thoại
    const inputType = validateIdentifier(formData.identifier.trim());
    if (!inputType) {
      setError("Vui lòng nhập đúng định dạng Email hoặc Số điện thoại!");
      return;
    }

    setLoading(true);

    try {
      // 3. Gọi API đăng ký
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          // Gửi kèm kiểu dữ liệu (email/phone) để Backend dễ dàng phân loại xử lý
          [inputType]: formData.identifier.trim(), 
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại. Vui lòng thử lại!");
      }

      // 4. Đăng ký thành công
      setSuccess("Đăng ký tài khoản thành công! Đang chuyển hướng...");
      
      // Xóa sạch form
      setFormData({ fullname: "", identifier: "", password: "", confirmPassword: "" });

      // Điều hướng sang trang đăng nhập sau 2 giây
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* CỘT PHẢI: FORM ĐĂNG KÝ TRẮNG TINH TẾ */}
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

          {/* HIỂN THỊ THÔNG BÁO LỖI / THÀNH CÔNG */}
          {error && <div className="alert alert-danger rounded-0 small py-2 text-uppercase tracking-wider fw-bold">{error}</div>}
          {success && <div className="alert alert-success rounded-0 small py-2 text-uppercase tracking-wider fw-bold">{success}</div>}

          {/* Form đăng ký */}
          <form onSubmit={handleSubmit}>
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
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* ĐỔI TRƯỜNG SỐ ĐIỆN THOẠI THÀNH EMAIL / SỐ ĐIỆN THOẠI */}
            <div className="mb-3">
              <label htmlFor="identifier" className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">
                Email hoặc Số điện thoại
              </label>
              <input
                type="text"
                className="form-control rounded-0 border-secondary bg-white text-dark py-2"
                id="identifier"
                placeholder="Nhập email hoặc số điện thoại của bạn"
                value={formData.identifier}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
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
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-dark w-100 rounded-0 py-2.5 text-uppercase fw-bold tracking-widest border-0" 
              style={{ backgroundColor: "#012a3a" }}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
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
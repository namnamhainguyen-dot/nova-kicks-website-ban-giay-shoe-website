"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const googleBtnRef = useRef(null); // Dùng ref để định vị nơi render nút Google

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. TỰ ĐỘNG TẢI THƯ VIỆN & RENDER NÚT BẤM CHUẨN GOOGLE
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "965150602590-a9bj52dr13dpgtf4nbenusvr3m1ekael.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          use_fedcm: true,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: "100%", // 🔥 SỬA DÒNG NÀY: Thay cái cũ thành "100%" giống hệt thế này
            text: "continue_with",
            shape: "square",
          });
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2. XỬ LÝ DỮ LIỆU GOOGLE TRẢ VỀ
  const handleGoogleResponse = async (response) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      setSuccess("Đang xác thực tài khoản Google với hệ thống...");

      const res = await fetch("/api/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Xác thực tài khoản Google thất bại!");
      }

      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);

      setSuccess("Đăng nhập bằng Google thành công! Đang chuyển hướng...");

      setTimeout(() => {
        window.dispatchEvent(new Event("userLogin"));
        if (data.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 1000);

    } catch (err) {
      setError(err.message || "Đăng nhập bằng Google thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại. Kiểm tra lại thông tin!");
      }

      setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);

      setTimeout(() => {
        if (data.user.role === "admin") {
          router.push("/admin"); 
        } else {
          window.dispatchEvent(new Event("userLogin"));
          router.push("/");
        }
      }, 1000);

    } catch (err) {
      setError(err.message);
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

        {error && <div className="alert alert-danger rounded-0 small py-2 text-uppercase tracking-wider fw-bold">{error}</div>}
        {success && <div className="alert alert-success rounded-0 small py-2 text-uppercase tracking-wider fw-bold">{success}</div>}

        {/* NÚT BẤM GOOGLE CHÍNH CHỦ ĐÃ ĐƯỢC CHUẨN HÓA BẢO MẬT FEDCM */}
        <div className="w-100 mb-4 d-flex justify-content-center">
          <div ref={googleBtnRef} className="w-100" style={{ minHeight: "44px" }}></div>
        </div>

        <div className="position-relative text-center my-4">
          <hr className="border-secondary opacity-25" />
          <span className="position-absolute top-50 start-50 translate-middle bg-transparent px-3 text-secondary small fw-bold tracking-widest">OR EMAIL</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label text-uppercase small fw-bold tracking-wider m-0 mb-1">
              Nhập Email hoặc Số điện thoại
            </label>
            <input 
              type="text" 
              className="form-control rounded-0 border-secondary bg-white text-dark py-2" 
              id="identifier" 
              placeholder="Email hoặc số điện thoại của bạn..."
              value={formData.identifier}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
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

          <button 
            type="submit" 
            className="btn btn-dark w-100 rounded-0 py-2.5 text-uppercase fw-bold tracking-widest border-0" 
            style={{ backgroundColor: "#012a3a" }}
            disabled={loading}
          >
            {loading ? "Đang xác thực..." : "Đăng nhập vào tài khoản"}
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
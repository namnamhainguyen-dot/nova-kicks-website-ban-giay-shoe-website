"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const googleBtnRef = useRef(null);

  const [formData, setFormData] = useState({
    fullname: "",
    identifier: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 1. Tự động tải thư viện Google Sign-In
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
          const btnWidth = googleBtnRef.current.offsetWidth || 350;

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: btnWidth,
            text: "signup_with",
            shape: "rectangular",
            logo_alignment: "left",
          });
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Logic kiểm tra: Chỉ SĐT hoặc Email @gmail.com
  const validateAndCheckIdentifier = (value) => {
    const trimmedVal = value.trim().toLowerCase();
    const phoneRegex = /^(0|84)[3|5|7|8|9][0-9]{8}$/;
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedVal);

    if (phoneRegex.test(trimmedVal)) {
      return { type: "phone", value: trimmedVal };
    }

    if (isEmailFormat) {
      if (!gmailRegex.test(trimmedVal)) {
        return { type: "blocked_email" };
      }
      return { type: "email", value: trimmedVal };
    }

    return { type: "invalid" };
  };

  // Xử lý đăng ký thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    const checkResult = validateAndCheckIdentifier(formData.identifier);

    if (checkResult.type === "invalid") {
      setError("Vui lòng nhập Số điện thoại hoặc Email (@gmail.com) hợp lệ!");
      return;
    }

    if (checkResult.type === "blocked_email") {
      setError("Hiện tại chúng tôi chỉ hỗ trợ đăng ký bằng @gmail.com!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullname: formData.fullname,
        password: formData.password,
        [checkResult.type]: checkResult.value,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại!");

      setSuccess("Đã đăng ký tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...");
      setFormData({ fullname: "", identifier: "", password: "", confirmPassword: "" });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý phản hồi khi Google thành công
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
        throw new Error(data.message || "Đăng ký/Đăng nhập Google thất bại!");
      }

      setSuccess("Đã đăng ký tài khoản thành công qua Google! Đang chuyển hướng...");

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
        document.cookie = `token=${encodeURIComponent(data.token)}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("userLogin"));
        router.push("/");
      }, 1500);

    } catch (err) {
      setError(err.message || "Đăng ký Google thất bại. Vui lòng thử lại!");
      setLoading(false);
    }
  };

  return (
    <main className="container-fluid min-vh-100 p-0 d-flex flex-column flex-md-row" style={{ paddingTop: "70px", backgroundColor: "#ffffff" }}>
      
      {/* CỘT TRÁI: ẢNH NỀN */}
      <div className="col-md-5 d-flex flex-column justify-content-end p-5 text-white position-relative overflow-hidden min-vh-50 min-vh-md-100" style={{ backgroundColor: "#111111" }}>
        <Image 
          src="https://tse4.mm.bing.net/th/id/OIP.jEvfyxNB_g23etbhZ3oMOwHaHa?r=0&cb=thfc1falcon4&rs=1&pid=ImgDetMain&o=7&rm=3"
          alt="Streetwear Background"
          fill
          priority
          unoptimized
          style={{ objectFit: "cover", objectPosition: "center", opacity: 0.45, zIndex: 0 }}
        />
        <div className="position-relative z-1 mb-4">
          <span className="bg-black text-white px-2 py-1 small fw-bold text-uppercase tracking-widest mb-3 d-inline-block border border-secondary" style={{ fontSize: "0.65rem" }}>
            CỘNG ĐỒNG ĐỘC QUYỀN
          </span>
          <h1 className="display-4 fw-black text-uppercase tracking-normal m-0 lh-1">
            ĐẶC QUYỀN<br />LÀ TẤT CẢ.
          </h1>
        </div>
      </div>

      {/* CỘT PHẢI: FORM */}
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

          {error && <div className="alert alert-danger rounded-0 small py-2 text-uppercase tracking-wider fw-bold">{error}</div>}
          {success && <div className="alert alert-success rounded-0 small py-2 text-uppercase tracking-wider fw-bold">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">Họ và tên</label>
              <input type="text" className="form-control rounded-0 border-secondary bg-white text-dark py-2" id="fullname" placeholder="Nhập họ và tên" value={formData.fullname} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">Email (@gmail.com) hoặc SĐT</label>
              <input type="text" className="form-control rounded-0 border-secondary bg-white text-dark py-2" id="identifier" placeholder="Ví dụ: example@gmail.com hoặc 0912345678" value={formData.identifier} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">Mật khẩu</label>
              <input type="password" className="form-control rounded-0 border-secondary bg-white text-dark py-2" id="password" placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" value={formData.password} onChange={handleChange} required minLength={6} />
            </div>

            <div className="mb-4">
              <label className="form-label text-uppercase small fw-bold text-secondary tracking-wider m-0 mb-1">Xác nhận mật khẩu</label>
              <input type="password" className="form-control rounded-0 border-secondary bg-white text-dark py-2" id="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} required minLength={6} />
            </div>

            <button type="submit" className="btn btn-dark w-100 rounded-0 py-2.5 text-uppercase fw-bold tracking-widest border-0 mb-3" style={{ backgroundColor: "#012a3a" }} disabled={loading}>
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </form>

          {/* ĐÃ CHUYỂN PHẦN GOOGLE XUỐNG DƯỚI */}
          <div className="text-center my-3 position-relative">
            <hr className="text-secondary opacity-25" />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 small text-secondary text-uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>
              Hoặc tiếp tục với
            </span>
          </div>

          <div className="w-100 mb-3 d-flex justify-content-center">
            <div ref={googleBtnRef} className="w-100 d-flex justify-content-center" style={{ minHeight: "44px" }}></div>
          </div>

        </div>
      </div>

    </main>
  );
}
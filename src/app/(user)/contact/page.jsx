"use client";

import { useState } from "react";

export default function StaticContactPage() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // 1. Kiểm tra số điện thoại (đúng 10 số, bắt đầu bằng số 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng số 0).");
      return;
    }

    // 2. Kiểm tra email bắt buộc phải là @gmail.com
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Email không hợp lệ! Vui lòng sử dụng địa chỉ @gmail.com.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await res.json();

      console.log("FEEDBACK RESPONSE:", data);

      if (data.success) {
        alert("Cảm ơn bạn đã gửi phản hồi đến Nova Kicks ❤️");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        alert(data.message || "Gửi feedback thất bại");
      }
    } catch (error) {
      console.error("SEND FEEDBACK ERROR:", error);
      alert("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Nếu là ô số điện thoại, chỉ cho phép lọc lấy các ký tự số và tối đa 10 chữ số
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="container my-5">
      <style jsx global>{`
        .contact-card {
          transition: all 0.3s ease;
        }
        .contact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      <div className="text-center mb-5">
        <h1
          className="fw-bold text-uppercase"
          style={{
            letterSpacing: "1px",
          }}
        >
          Liên hệ với chúng tôi
        </h1>

        <p className="text-muted">
          Nova Kicks luôn sẵn sàng lắng nghe mọi góp ý và phản hồi từ bạn.
        </p>

        <hr
          className="mx-auto"
          style={{
            width: "60px",
            borderTop: "3px solid #000",
            opacity: 1,
          }}
        />
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-3 contact-card bg-light">
            <h4 className="fw-bold text-dark mb-4">Thông Tin Cửa Hàng</h4>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">📍</span>
              <div>
                <h6 className="fw-bold mb-1">Địa chỉ cửa hàng</h6>
                <p className="text-muted mb-0">123 CVPM Quang Trung, Quận 12, TP.HCM</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">📞</span>
              <div>
                <h6 className="fw-bold mb-1">Số điện thoại liên hệ</h6>
                <p className="text-muted mb-0">0931839732</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">✉️</span>
              <div>
                <h6 className="fw-bold mb-1">Email hỗ trợ</h6>
                <p className="text-muted mb-0">namnamhainguyen@gmail.com</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">⏰</span>
              <div>
                <h6 className="fw-bold mb-1">Thời gian làm việc</h6>
                <p className="text-muted mb-0">09:00 – 22:00 hàng ngày</p>
              </div>
            </div>

            <hr className="text-muted opacity-25 my-3" />
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 contact-card">
            <h4 className="fw-bold mb-4">Gửi lời nhắn</h4>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Họ và tên *</label>
                  <input
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập 10 chữ số"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vd: yourname@gmail.com"
                    required
                  />
                  <div className="form-text text-muted">Vui lòng sử dụng địa chỉ Gmail (@gmail.com)</div>
                </div>

                <div className="col-12">
                  <label className="form-label">Tiêu đề</label>
                  <input
                    className="form-control"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Ví dụ: Góp ý sản phẩm"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Nội dung *</label>
                  <textarea
                    rows="5"
                    className="form-control"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <button className="btn btn-dark w-100" disabled={loading}>
                    {loading ? "Đang gửi..." : "🚀 Gửi lời nhắn"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
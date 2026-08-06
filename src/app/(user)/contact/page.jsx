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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container my-5 py-3">
      <style jsx global>{`
        .contact-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .contact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08) !important;
        }
        .form-control:focus {
          border-color: #111;
          box-shadow: 0 0 0 0.2rem rgba(17, 17, 17, 0.1);
        }
        .icon-box {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
          border-radius: 12px;
          flex-shrink: 0;
        }
      `}</style>

      {/* TIÊU ĐỀ TRANG */}
      <div className="text-center mb-5 pb-2">
        <span className="text-uppercase tracking-widest text-muted fw-semibold" style={{ fontSize: "0.75rem", letterSpacing: "3px" }}>
          Get In Touch
        </span>
        <h1 className="fw-black text-uppercase display-5 mt-2 mb-3" style={{ letterSpacing: "1px", fontWeight: 800 }}>
          Liên hệ với chúng tôi
        </h1>
        <p className="text-secondary mx-auto" style={{ maxWidth: "550px", fontSize: "0.95rem" }}>
          Nova Kicks luôn sẵn sàng lắng nghe mọi thắc mắc, góp ý hoặc yêu cầu hỗ trợ từ bạn.
        </p>
        <div className="mx-auto mt-3 rounded-pill bg-dark" style={{ width: "40px", height: "3px" }} />
      </div>

      <div className="row g-4 justify-content-center">
        {/* CỘT THÔNG TIN CỬA HÀNG */}
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm p-4 p-md-4 rounded-4 contact-card bg-white">
            <h4 className="fw-bold text-dark mb-4" style={{ fontSize: "1.2rem" }}>Thông Tin Cửa Hàng</h4>

            <div className="d-flex align-items-start mb-4">
              <div className="icon-box me-3 shadow-sm">📍</div>
              <div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Địa chỉ cửa hàng</h6>
                <p className="text-secondary mb-0 small">123 CVPM Quang Trung, Quận 12, TP.HCM</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <div className="icon-box me-3 shadow-sm">📞</div>
              <div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Số điện thoại liên hệ</h6>
                <p className="text-secondary mb-0 small">0931839732</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <div className="icon-box me-3 shadow-sm">✉️</div>
              <div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Email hỗ trợ</h6>
                <p className="text-secondary mb-0 small text-break">namnamhainguyen@gmail.com</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-3">
              <div className="icon-box me-3 shadow-sm">⏰</div>
              <div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Thời gian làm việc</h6>
                <p className="text-secondary mb-0 small">09:00 – 22:00 hàng ngày</p>
              </div>
            </div>

            <div className="mt-auto pt-3 border-top text-center">
              <span className="text-muted small">✨ Phản hồi trong vòng 24 giờ</span>
            </div>
          </div>
        </div>

        {/* CỘT FORM GỬI LỜI NHẮN */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 contact-card bg-white">
            <h4 className="fw-bold mb-4" style={{ fontSize: "1.2rem" }}>Gửi lời nhắn trực tuyến</h4>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Họ và tên *</label>
                  <input
                    className="form-control rounded-3 py-2.5"
                    name="name"
                    placeholder="Nhập họ tên của bạn"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Số điện thoại *</label>
                  <input
                    className="form-control rounded-3 py-2.5"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Email *</label>
                  <input
                    type="email"
                    className="form-control rounded-3 py-2.5"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Tiêu đề</label>
                  <input
                    className="form-control rounded-3 py-2.5"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Ví dụ: Góp ý sản phẩm, Tra cứu đơn hàng..."
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Nội dung tin nhắn *</label>
                  <textarea
                    rows="4"
                    className="form-control rounded-3 p-3"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung bạn muốn gửi tới Nova Kicks..."
                    required
                  />
                </div>

                <div className="col-12 pt-2">
                  <button 
                    className="btn btn-dark w-100 py-3 rounded-3 fw-bold text-uppercase shadow-sm" 
                    disabled={loading}
                    style={{ letterSpacing: "1px", fontSize: "0.9rem" }}
                  >
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
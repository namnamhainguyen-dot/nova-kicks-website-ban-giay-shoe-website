"use client";

import { useState } from "react";

export default function StaticContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Vì là trang tĩnh nên chỉ xuất thông báo test logic
    alert(
      `Cảm ơn ${formData.name} đã gửi liên hệ! Hệ thống Nova Kicks tĩnh đã ghi nhận lời nhắn.`
    );
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container my-5">
      {/* Hiệu ứng Hover Smooth cho nút bấm */}
      <style jsx global>{`
        .contact-card {
          transition: all 0.3s ease;
        }
        .contact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      {/* Tiêu đề phân hệ */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-uppercase" style={{ letterSpacing: "1px" }}>
          Liên hệ với chúng tôi
        </h1>
        <p className="text-muted">
          Nova Kicks luôn sẵn sàng lắng nghe mọi góp ý và phản hồi từ bạn.
        </p>
        <hr className="mx-auto" style={{ width: "60px", borderTop: "3px solid #000", opacity: 1 }} />
      </div>

      <div className="row g-4 mb-5">
        {/* 🏢 CỘT CHI TIẾT THÔNG TIN LIÊN HỆ */}
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
                <p className="text-muted mb-0">0123 456 789</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">✉️</span>
              <div>
                <h6 className="fw-bold mb-1">Email hỗ trợ</h6>
                <p className="text-muted mb-0">support@nova-kicks.com</p>
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

            <h6 className="fw-bold text-dark mb-2">Theo dõi Nova Kicks trên mạng xã hội</h6>
            <div className="d-flex gap-2">
              <span className="badge bg-dark px-3 py-2 rounded cursor-pointer">Facebook</span>
              <span className="badge bg-dark px-3 py-2 rounded cursor-pointer">Instagram</span>
              <span className="badge bg-dark px-3 py-2 rounded cursor-pointer">TikTok</span>
            </div>
          </div>
        </div>

        {/* ✉️ CỘT BIỂU MẪU GỬI ĐƠN LIÊN HỆ */}
        <div className="col-lg-7">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-3 contact-card">
            <h4 className="fw-bold text-dark mb-4">Gửi Lời Nhắn Thắc Mắc</h4>
            
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control rounded-2 py-2"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="form-control rounded-2 py-2"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0901234xxx"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">Địa chỉ Email *</label>
                  <input
                    type="email"
                    className="form-control rounded-2 py-2"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">Tiêu đề liên hệ</label>
                  <input
                    type="text"
                    className="form-control rounded-2 py-2"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Hỏi về sản phẩm, chính sách đổi trả..."
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">Nội dung tin nhắn *</label>
                  <textarea
                    className="form-control rounded-2"
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung bạn cần hỗ trợ chi tiết tại đây..."
                    required
                  ></textarea>
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-dark w-100 py-2.5 rounded-pill fw-medium">
                    🚀 Gửi lời nhắn đi
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
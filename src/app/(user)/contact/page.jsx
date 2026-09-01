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

  // =======================================================
  // ĐỌC JSON AN TOÀN TỪ RESPONSE
  // =======================================================

  const parseJsonResponse = async (res) => {
    const text = await res.text();

    if (!text || !text.trim()) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("❌ Response không phải JSON:", text);
      return null;
    }
  };

  // =======================================================
  // KIỂM TRA NỘI DUNG BẰNG AI
  // =======================================================

  const checkContentModeration = async (text) => {
    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      console.log("MODERATION STATUS:", res.status);

      const data = await parseJsonResponse(res);

      // ================================================
      // API TRẢ VỀ LỖI
      // ================================================

      if (!res.ok) {
        console.error("❌ Moderation API lỗi:", res.status, data);

        // Không để form bị crash.
        // Nếu moderation API lỗi thì tạm dùng trạng thái an toàn.
        return {
          blocked: false,
          reason: "api_error",
          message: "Không thể kiểm tra nội dung bằng AI.",
        };
      }

      // ================================================
      // API TRẢ RESPONSE RỖNG
      // ================================================

      if (!data) {
        console.error(
          "❌ Moderation API không trả về dữ liệu."
        );

        return {
          blocked: false,
          reason: "empty_response",
          message: "Không thể kiểm tra nội dung.",
        };
      }

      return {
        blocked: Boolean(data.blocked),
        reason: data.reason || "safe",
        message:
          data.message || "Nội dung hợp lệ.",
      };
    } catch (error) {
      console.error(
        "❌ Lỗi kiểm tra moderation:",
        error
      );

      return {
        blocked: false,
        reason: "network_error",
        message: "Không thể kết nối tới hệ thống kiểm duyệt.",
      };
    }
  };

  // =======================================================
  // SUBMIT FORM
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // =====================================================
    // 1. KIỂM TRA SỐ ĐIỆN THOẠI
    // =====================================================

    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(formData.phone)) {
      alert(
        "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng số 0)."
      );
      return;
    }

    // =====================================================
    // 2. KIỂM TRA EMAIL
    // =====================================================

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!emailRegex.test(formData.email.trim())) {
      alert(
        "Email không hợp lệ! Vui lòng sử dụng địa chỉ @gmail.com."
      );
      return;
    }

    // =====================================================
    // 3. KIỂM TRA NỘI DUNG RỖNG
    // =====================================================

    if (!formData.message.trim()) {
      alert("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    setLoading(true);

    try {
      // ===================================================
      // 4. GOM NỘI DUNG CẦN AI KIỂM TRA
      // ===================================================

      const contentToCheck = [
        formData.name,
        formData.subject,
        formData.message,
      ]
        .filter((item) => item && item.trim())
        .join("\n");

      // ===================================================
      // 5. GỌI AI MODERATION
      // ===================================================

      const moderation =
        await checkContentModeration(contentToCheck);

      console.log(
        "MODERATION RESULT:",
        moderation
      );

      // ===================================================
      // 6. NẾU AI PHÁT HIỆN NỘI DUNG XẤU → CHẶN
      // ===================================================

      if (moderation.blocked) {
        alert(
          moderation.message ||
            "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại trước khi gửi."
        );

        return;
      }

      // ===================================================
      // 7. NỘI DUNG SẠCH → GỬI FEEDBACK
      // ===================================================

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      console.log(
        "FEEDBACK STATUS:",
        res.status
      );

      const data = await parseJsonResponse(res);

      console.log(
        "FEEDBACK RESPONSE:",
        data
      );

      // ===================================================
      // API FEEDBACK LỖI
      // ===================================================

      if (!res.ok) {
        alert(
          data?.message ||
            `Gửi feedback thất bại. Mã lỗi: ${res.status}`
        );

        return;
      }

      // ===================================================
      // API FEEDBACK KHÔNG TRẢ JSON
      // ===================================================

      if (!data) {
        alert(
          "Máy chủ không trả về dữ liệu hợp lệ."
        );

        return;
      }

      // ===================================================
      // GỬI THÀNH CÔNG
      // ===================================================

      if (data.success) {
        alert(
          "Cảm ơn bạn đã gửi phản hồi đến Nova Kicks ❤️"
        );

        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        alert(
          data.message ||
            "Gửi feedback thất bại."
        );
      }
    } catch (error) {
      console.error(
        "❌ SEND FEEDBACK ERROR:",
        error
      );

      alert(
        "Không thể kết nối máy chủ. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Số điện thoại:
    // - Chỉ cho nhập số
    // - Tối đa 10 số

    if (name === "phone") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="container my-5">
      <style jsx global>{`
        .contact-card {
          transition: all 0.3s ease;
        }

        .contact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 0.5rem 1rem
            rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      {/* =================================================
          TIÊU ĐỀ
      ================================================= */}

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
          Nova Kicks luôn sẵn sàng lắng nghe mọi góp ý và
          phản hồi từ bạn.
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
        {/* =================================================
            THÔNG TIN CỬA HÀNG
        ================================================= */}

        <div className="col-lg-5">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-3 contact-card bg-light">
            <h4 className="fw-bold text-dark mb-4">
              Thông Tin Cửa Hàng
            </h4>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">📍</span>

              <div>
                <h6 className="fw-bold mb-1">
                  Địa chỉ cửa hàng
                </h6>

                <p className="text-muted mb-0">
                  123 CVPM Quang Trung, Quận 12, TP.HCM
                </p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">📞</span>

              <div>
                <h6 className="fw-bold mb-1">
                  Số điện thoại liên hệ
                </h6>

                <p className="text-muted mb-0">
                  0931839732
                </p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">✉️</span>

              <div>
                <h6 className="fw-bold mb-1">
                  Email hỗ trợ
                </h6>

                <p className="text-muted mb-0">
                  namnamhainguyen@gmail.com
                </p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">⏰</span>

              <div>
                <h6 className="fw-bold mb-1">
                  Thời gian làm việc
                </h6>

                <p className="text-muted mb-0">
                  09:00 – 22:00 hàng ngày
                </p>
              </div>
            </div>

            <hr className="text-muted opacity-25 my-3" />
          </div>
        </div>

        {/* =================================================
            FORM FEEDBACK
        ================================================= */}

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 contact-card">
            <h4 className="fw-bold mb-4">
              Gửi lời nhắn
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* HỌ TÊN */}

                <div className="col-md-6">
                  <label className="form-label">
                    Họ và tên *
                  </label>

                  <input
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* SỐ ĐIỆN THOẠI */}

                <div className="col-md-6">
                  <label className="form-label">
                    Số điện thoại *
                  </label>

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

                {/* EMAIL */}

                <div className="col-12">
                  <label className="form-label">
                    Email *
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vd: yourname@gmail.com"
                    required
                  />
                </div>

                {/* TIÊU ĐỀ */}

                <div className="col-12">
                  <label className="form-label">
                    Tiêu đề
                  </label>

                  <input
                    className="form-control"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Ví dụ: Góp ý sản phẩm"
                  />
                </div>

                {/* NỘI DUNG */}

                <div className="col-12">
                  <label className="form-label">
                    Nội dung *
                  </label>

                  <textarea
                    rows="5"
                    className="form-control"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung phản hồi..."
                    required
                  />
                </div>

                {/* BUTTON */}

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-dark w-100"
                    disabled={loading}
                  >
                    {loading
                      ? "🤖 Đang kiểm tra nội dung..."
                      : "🚀 Gửi lời nhắn"}
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


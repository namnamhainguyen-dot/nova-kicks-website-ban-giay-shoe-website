"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PaymentSimulation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || "ORD999";
  const totalAmount = parseInt(searchParams.get("total") || "0", 10);
  const [countdown, setCountdown] = useState(180); // 3 phút chuyển khoản
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Tạo mã QR VietQR giả lập
  const bankId = "MB"; // Ngân hàng MBBank
  const accountNo = "99999999999"; // Số tài khoản giả lập
  const accountName = "CONG TY TNHH NOVA KICKS";
  const description = `THANH TOAN DON HANG ${orderId}`;
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${totalAmount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // 🌟 GỬI API CẬP NHẬT TRẠNG THÁI THANH TOÁN THẬT VÀO DATABASE
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPaid: true,
          status: "preparing" // Tự động chuyển trạng thái đơn sang "Đang đóng gói"
        }),
      });

      if (response.ok) {
        sessionStorage.setItem("last_completed_order", orderId);
        // Chuyển hướng thẳng về trang chi tiết đơn hàng vừa thanh toán thành công
        router.push(`/orders/${orderId}?success_simulated=true`);
      } else {
        alert("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thanh toán:", error);
      alert("Đã xảy ra lỗi kết nối hệ thống.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="container d-flex justify-content-center align-items-center min-vh-100 py-5 bg-light">
      <div className="card p-4 shadow-lg border-0 text-center rounded-4" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-semibold">
          CỔNG THANH TOÁN
        </div>
        
        <h4 className="fw-bold mb-1">Quét Mã QR Chuyển Khoản</h4>
        <p className="text-muted small mb-4">Sử dụng ứng dụng Ngân hàng của bạn quét QR để thanh toán an toàn</p>

        {/* Khung QR Code */}
        <div className="bg-white p-3 border rounded-3 d-inline-block mx-auto mb-3 shadow-sm">
          <img src={qrUrl} alt="VietQR Viet Nam" style={{ maxWidth: "230px", width: "100%" }} />
        </div>

        {/* Chi tiết giao dịch */}
        <div className="text-start bg-light p-3 rounded-3 mb-4">
          <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
            <span className="text-muted small">Số tiền cần thanh toán:</span>
            <span className="fw-bold text-danger fs-5">{totalAmount.toLocaleString("vi-VN")}đ</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted small">Nội dung chuyển khoản:</span>
            <span className="fw-bold text-dark text-uppercase">{description}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted small">Tài khoản nhận:</span>
            <span className="fw-semibold small text-end">{bankId} - {accountNo} <br />({accountName})</span>
          </div>
        </div>

        {/* Đếm ngược thời gian giả lập */}
        <p className="text-muted small mb-3">
          Giao dịch sẽ hết hạn trong: <strong className="text-dark">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}</strong>
        </p>

        <button 
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="btn btn-dark btn-lg w-100 rounded-pill py-3 fw-bold mb-3 shadow"
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Đang xác nhận giao dịch...
            </>
          ) : (
            "XÁC NHẬN ĐÃ CHUYỂN KHOẢN"
          )}
        </button>

        <Link href="/checkout" className="text-muted small text-decoration-none">
          Quay lại trang thanh toán / Hủy bỏ
        </Link>
      </div>
    </main>
  );
}
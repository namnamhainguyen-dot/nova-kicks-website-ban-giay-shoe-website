"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId") || "ORD999";
  const totalAmount = parseInt(searchParams.get("total") || "0", 10);

  const [countdown, setCountdown] = useState(180);

  // Đếm ngược thời gian hết hạn giao dịch
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Hết giờ có thể xử lý thông báo hết hạn ở đây nếu cần
    }
  }, [countdown]);

  // Tự động kiểm tra trạng thái chuyển khoản thật qua API ngầm (Polling mỗi 3 giây)
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          
          // Khi webhook ngân hàng nhận được tiền thật và cập nhật isPaid = true
          if (data.isPaid === true) {
            sessionStorage.setItem("last_completed_order", orderId);
            // Tự động chuyển thẳng về trang chủ (/)
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái chuyển khoản:", error);
      }
    };

    const interval = setInterval(checkPaymentStatus, 3000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  const bankId = "MB";
  const accountNo = "0768696887";
  const accountName = "CONG TY TNHH NOVA KICKS";
  const description = `THANH TOAN DON HANG ${orderId}`;

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    description
  )}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <main className="container d-flex justify-content-center align-items-center min-vh-100 py-5 bg-light">
      <div
        className="card p-4 shadow-lg border-0 text-center rounded-4"
        style={{ maxWidth: "480px", width: "100%" }}
      >
        <div className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-semibold">
          CỔNG THANH TOÁN QR MB BANK
        </div>

        <h4 className="fw-bold mb-1">Quét Mã QR Chuyển Khoản</h4>
        <p className="text-muted small mb-4">
          Sử dụng ứng dụng ngân hàng quét mã bên dưới. Hệ thống sẽ tự động chuyển về trang chủ khi nhận được tiền.
        </p>

        <div className="bg-white p-3 border rounded-3 d-inline-block mx-auto mb-3 shadow-sm">
          <img
            src={qrUrl}
            alt="VietQR"
            style={{ maxWidth: "230px", width: "100%" }}
          />
        </div>

        <div className="text-start bg-light p-3 rounded-3 mb-4">
          <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
            <span>Số tiền cần thanh toán:</span>
            <span className="fw-bold text-danger">
              {totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>Nội dung chuyển khoản:</span>
            <span className="fw-bold text-primary">{description}</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>Tài khoản nhận:</span>
            <span>
              {bankId} - {accountNo}
              <br />
              ({accountName})
            </span>
          </div>
        </div>

        {/* Trạng thái chờ */}
        <div className="alert alert-info py-2 small mb-3 d-flex align-items-center justify-content-center">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <span>Đang chờ bạn chuyển khoản... (Tự động cập nhật)</span>
        </div>

        <p className="text-muted small mb-3">
          Mã QR hết hạn sau:{" "}
          <strong className="text-danger">
            {Math.floor(countdown / 60)}:
            {(countdown % 60).toString().padStart(2, "0")}
          </strong>
        </p>

        <Link href="/checkout" className="text-decoration-none text-muted small">
          ← Quay lại trang thanh toán / Hủy bỏ
        </Link>
      </div>
    </main>
  );
}

export default function PaymentSimulation() {
  return (
    <Suspense fallback={<div className="text-center p-5">Đang tải...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
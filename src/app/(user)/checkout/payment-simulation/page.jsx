"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const totalAmount = parseInt(searchParams.get("total") || "0", 10);

  const [countdown, setCountdown] = useState(300); // 5 phút đếm ngược
  const [isPaid, setIsPaid] = useState(false);

  // 1. Đếm ngược thời gian chờ thanh toán
  useEffect(() => {
    if (countdown > 0 && !isPaid) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isPaid) {
      alert("Đã hết thời gian chờ thanh toán. Vui lòng tạo lại đơn hàng.");
      router.push("/checkout");
    }
  }, [countdown, isPaid, router]);

  // 2. Polling: Cứ 3 giây gọi API kiểm tra trạng thái đơn hàng xem SePay đã webhook về chưa
  useEffect(() => {
    if (!orderId || isPaid) return;

    const checkOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          // Nếu backend nhận được webhook từ SePay và đổi isPaid thành true trong Database
          if (data.isPaid) {
            setIsPaid(true);
            sessionStorage.setItem("last_completed_order", orderId);
            router.push(`/orders/${orderId}?success=true`);
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái đơn hàng:", error);
      }
    };

    const interval = setInterval(checkOrderStatus, 3000);
    return () => clearInterval(interval);
  }, [orderId, isPaid, router]);

  // Thông tin tài khoản nhận tiền chính thức của công ty
  const bankId = "MB";
  const accountNo = "0768696887";
  const accountName = "CONG TY TNHH NOVA KICKS";
  
  // Nội dung chuyển khoản CHÍNH LÀ orderId để hệ thống tự khớp lệnh
  const description = `${orderId}`;

  // Link VietQR chính thống
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    description
  )}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <main className="container d-flex justify-content-center align-items-center min-vh-100 py-5 bg-light">
      <div
        className="card p-4 shadow-lg border-0 text-center rounded-4 bg-white"
        style={{ maxWidth: "480px", width: "100%" }}
      >
        <div className="badge bg-danger text-white mb-3 px-3 py-2 rounded-pill fw-semibold" style={{ letterSpacing: "1px" }}>
          NOVA KICKS - CỔNG THANH TOÁN TỰ ĐỘNG
        </div>

        <h4 className="fw-bold mb-1">Quét Mã QR Chuyển Khoản</h4>
        <p className="text-muted small mb-4">
          Sử dụng ứng dụng ngân hàng quét mã bên dưới. Hệ thống sẽ tự động chuyển trang ngay khi nhận được tiền.
        </p>

        <div className="bg-white p-3 border rounded-4 d-inline-block mx-auto mb-3 shadow-sm">
          <img
            src={qrUrl}
            alt="VietQR Code"
            style={{ maxWidth: "220px", width: "100%", height: "auto" }}
          />
        </div>

        <div className="text-start bg-light p-3 rounded-3 mb-4 fs-6">
          <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
            <span className="text-muted">Số tiền cần trả:</span>
            <span className="fw-bold text-danger fs-5">
              {totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Nội dung CK:</span>
            <span className="fw-bold text-dark font-monospace bg-white px-2 py-1 rounded border">
              {description}
            </span>
          </div>

          <div className="d-flex justify-content-between">
            <span className="text-muted">Tài khoản nhận:</span>
            <span className="fw-semibold text-end">
              {bankId} - {accountNo}
              <br />
              <small className="text-muted fw-normal">({accountName})</small>
            </span>
          </div>
        </div>

        <div className="alert alert-warning py-2 small mb-3 d-flex align-items-center justify-content-center">
          <div className="spinner-border spinner-border-sm me-2 text-danger" role="status"></div>
          <span>Đang chờ thanh toán thực tế... ({Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")})</span>
        </div>

        <Link href="/checkout" className="text-muted small text-decoration-none">
          ← Quay lại trang thanh toán / Hủy bỏ
        </Link>
      </div>
    </main>
  );
}

export default function PaymentSimulationPage() {
  return (
    <Suspense fallback={<div className="text-center p-5 fw-bold">Đang tải cổng thanh toán...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
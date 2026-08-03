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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const bankId = "MB";
  const accountNo = "0768696887";
  const accountName = "CONG TY TNHH NOVA KICKS";
  const description = `THANH TOAN DON HANG ${orderId}`;

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    description
  )}&accountName=${encodeURIComponent(accountName)}`;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPaid: true,
          status: "preparing",
        }),
      });

      if (response.ok) {
        sessionStorage.setItem("last_completed_order", orderId);
        router.push(`/orders/${orderId}?success_simulated=true`);
      } else {
        alert("Không thể cập nhật trạng thái đơn hàng.");
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="container d-flex justify-content-center align-items-center min-vh-100 py-5 bg-light">
      <div
        className="card p-4 shadow-lg border-0 text-center rounded-4"
        style={{ maxWidth: "480px", width: "100%" }}
      >
        <div className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-semibold">
          CỔNG THANH TOÁN
        </div>

        <h4 className="fw-bold mb-1">Quét Mã QR Chuyển Khoản</h4>
        <p className="text-muted small mb-4">
          Sử dụng ứng dụng Ngân hàng của bạn quét QR để thanh toán an toàn
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
            <span>Nội dung:</span>
            <span>{description}</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>Tài khoản:</span>
            <span>
              {bankId} - {accountNo}
              <br />
              ({accountName})
            </span>
          </div>
        </div>

        <p className="text-muted small mb-3">
          Giao dịch sẽ hết hạn trong{" "}
          <strong>
            {Math.floor(countdown / 60)}:
            {(countdown % 60).toString().padStart(2, "0")}
          </strong>
        </p>

        <button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="btn btn-dark btn-lg w-100 rounded-pill py-3 fw-bold mb-3"
        >
          {isProcessing
            ? "Đang xác nhận..."
            : "XÁC NHẬN ĐÃ CHUYỂN KHOẢN"}
        </button>

        <Link href="/checkout">
          Quay lại trang thanh toán / Hủy bỏ
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
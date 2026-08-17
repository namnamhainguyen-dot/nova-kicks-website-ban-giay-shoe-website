"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const totalAmount = parseInt(searchParams.get("amount") || "0", 10);

  const [orderId, setOrderId] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 phút đếm ngược
  const [isPaid, setIsPaid] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const hasCreatedOrder = useRef(false);

  // Hàm gọi API hủy/xóa đơn hàng rác
  const cancelOrderOnServer = async (idToCancel) => {
    if (!idToCancel) return;
    try {
      await fetch(`/api/orders/${idToCancel}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng rác:", err);
    }
  };

  // 1. Kiểm tra sessionStorage xem đã có orderId từ trước chưa (trường hợp vừa F5 trang), 
  // nếu chưa có thì mới gọi API tạo đơn mới từ "pending_order".
  useEffect(() => {
    if (hasCreatedOrder.current) return;
    hasCreatedOrder.current = true;

    const initOrder = async () => {
      // Kiểm tra xem đã lưu orderId trong session trước đó chưa (phòng khi F5)
      const existingOrderId = sessionStorage.getItem("current_order_id");
      
      if (existingOrderId) {
        // Nếu đã có sẵn orderId (do F5), dùng lại luôn, không tạo đơn mới nữa
        setOrderId(existingOrderId);
        setIsCreatingOrder(false);
        return;
      }

      // Nếu chưa có, tiến hành lấy pending_order để tạo mới lần đầu
      const rawPending = sessionStorage.getItem("pending_order");
      if (!rawPending) {
        setErrorMessage("Không tìm thấy thông tin đơn hàng tạm.");
        setIsCreatingOrder(false);
        return;
      }

      try {
        const orderPayload = JSON.parse(rawPending);

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) {
          throw new Error(`Lỗi server: ${res.status}`);
        }

        const result = await res.json();
        const createdId = result._id || result.id || (result.data && result.data._id);

        if (createdId) {
          setOrderId(createdId);
          
          // Lưu lại orderId vào sessionStorage để nếu người dùng F5 thì vẫn giữ nguyên mã cũ
          sessionStorage.setItem("current_order_id", createdId);
          sessionStorage.removeItem("pending_order"); // Xóa pending để tránh tạo lại

          // Trừ giỏ hàng ở client như logic ban đầu của bạn
          const checkoutItems = orderPayload.order_items || [];
          if (checkoutItems.length > 0) {
            const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
            const remainingCart = localCart.filter(
              (cartItem) =>
                !checkoutItems.some(
                  (checkoutItem) =>
                    checkoutItem.product_id === cartItem._id &&
                    checkoutItem.color === cartItem.selectedColor &&
                    checkoutItem.size === cartItem.selectedSize
                )
            );
            localStorage.setItem("cart", JSON.stringify(remainingCart));
          }
        } else {
          setErrorMessage("Không thể lấy mã đơn hàng từ hệ thống.");
        }
      } catch (err) {
        console.error("Lỗi khi tạo đơn hàng ngầm:", err);
        setErrorMessage("Không thể kết nối đến server để tạo đơn hàng.");
      } finally {
        setIsCreatingOrder(false);
      }
    };

    initOrder();
  }, []);

  // 2. Đếm ngược thời gian chờ thanh toán
  useEffect(() => {
    if (!orderId || isPaid) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Hết giờ -> Xóa cache orderId, hủy đơn và về checkout
      alert("Đã hết thời gian chờ thanh toán. Đơn hàng đã bị hủy.");
      sessionStorage.removeItem("current_order_id");
      cancelOrderOnServer(orderId);
      router.push("/checkout");
    }
  }, [countdown, orderId, isPaid, router]);

  // 3. Polling kiểm tra trạng thái thanh toán từ SePay/Webhook
  useEffect(() => {
    if (!orderId || isPaid) return;

    const checkOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isPaid) {
            setIsPaid(true);
            sessionStorage.removeItem("current_order_id"); // Thanh toán xong thì xóa cache
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

  // Xử lý khi nhấn nút "Hủy bỏ / Quay lại"
  const handleCancel = async (e) => {
    e.preventDefault();
    if (orderId && !isPaid) {
      await cancelOrderOnServer(orderId);
    }
    sessionStorage.removeItem("current_order_id");
    sessionStorage.removeItem("pending_order");
    router.push("/checkout");
  };

  // Thông tin tài khoản nhận tiền
  const bankId = "MB";
  const accountNo = "0768696887";
  const accountName = "CONG TY TNHH NOVA KICKS";
  const description = orderId ? `${orderId}` : "DANG_TAI_DON...";

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-qr_only.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    description
  )}&accountName=${encodeURIComponent(accountName)}`;

  if (isCreatingOrder) {
    return (
      <main className="container d-flex justify-content-center align-items-center min-vh-100 py-5 bg-light">
        <div className="text-center p-5 card shadow-sm border-0 rounded-4">
          <div className="spinner-border text-danger mb-3" role="status"></div>
          <h5 className="fw-bold">Đang khởi tạo mã giao dịch...</h5>
          <p className="text-muted small mb-0">Vui lòng đợi trong giây lát.</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="container d-flex justify-content-center align-items-center min-vh-100 py-5 bg-light">
        <div className="text-center p-5 card shadow-sm border-0 rounded-4" style={{ maxWidth: "450px" }}>
          <h4 className="text-danger fw-bold mb-3">⚠️ Có lỗi xảy ra</h4>
          <p className="text-muted mb-4">{errorMessage}</p>
          <button 
            onClick={handleCancel} 
            className="btn btn-dark rounded-pill px-4"
          >
            Quay lại trang thanh toán
          </button>
        </div>
      </main>
    );
  }

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

        <button 
        onClick={handleCancel} 
        className="btn btn-link text-muted small text-decoration-none p-0 border-0 bg-transparent">
        ← Quay lại trang thanh toán / Hủy bỏ
        </button>
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
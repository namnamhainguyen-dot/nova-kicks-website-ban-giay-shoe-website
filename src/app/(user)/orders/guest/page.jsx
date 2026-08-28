"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function GuestOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchLatestOrderStatuses = async () => {
      try {
        const stored = localStorage.getItem("guest_orders");
        if (!stored) return;
        
        let parsedOrders = JSON.parse(stored);
        if (!Array.isArray(parsedOrders) || parsedOrders.length === 0) return;

        const updatedOrders = await Promise.all(
          parsedOrders.map(async (ord) => {
            const orderId = ord._id || ord.id;
            if (!orderId) return ord;
            try {
              const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
              if (res.ok) {
                const latestData = await res.json();
                return {
                  ...ord,
                  status: latestData.status || ord.status,
                };
              }
            } catch (err) {
              console.error(`Không thể cập nhật trạng thái đơn ${orderId}:`, err);
            }
            return ord;
          })
        );

        setOrders(updatedOrders);
        localStorage.setItem("guest_orders", JSON.stringify(updatedOrders));
      } catch (e) {
        console.error(e);
      }
    };

    fetchLatestOrderStatuses();
  }, []);

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || "").toLowerCase().trim();
    switch (normalizedStatus) {
      case "pending":
      case "chờ xác nhận":
        return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold">Chờ xác nhận</span>;
      case "processing":
      case "đang xử lý":
        return <span className="badge bg-primary text-white px-3 py-2 rounded-pill fw-semibold">Đang xử lý</span>;
      case "preparing":
      case "đang đóng gói":
        return <span className="badge bg-info text-dark px-3 py-2 rounded-pill fw-semibold">Đang đóng gói</span>;
      case "shipping":
      case "đang giao hàng":
      case "đang giao":
        return <span className="badge bg-primary px-3 py-2 rounded-pill fw-semibold">Đang giao hàng</span>;
      case "completed":
      case "đã giao hàng":
      case "hoàn thành":
        return <span className="badge bg-success px-3 py-2 rounded-pill fw-semibold">✓ Đã giao hàng</span>;
      case "cancelled":
      case "đã hủy":
        return <span className="badge bg-danger px-3 py-2 rounded-pill fw-semibold">✕ Đã hủy</span>;
      default:
        return <span className="badge bg-secondary px-3 py-2 rounded-pill fw-semibold">{status || "Chờ xác nhận"}</span>;
    }
  };

  return (
    <main className="container mt-5 pt-5 py-5" style={{ maxWidth: "750px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 text-dark">📦 Đơn hàng của bạn (Khách vãng lai)</h2>
        <Link href="/" className="btn btn-outline-secondary btn-sm rounded-pill">
          ← Về trang chủ
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="alert alert-warning text-center p-4 rounded-4 shadow-sm">
          <p className="mb-3 text-muted">Không tìm thấy lịch sử đơn hàng nào trên thiết bị này.</p>
          <Link href="/products" className="btn btn-dark rounded-pill px-4">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((ord) => (
            <div key={ord._id || ord.id} className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="font-monospace fw-bold text-primary">#{ord._id?.toUpperCase() || ord.id}</span>
                {getStatusBadge(ord.status)}
              </div>
              <div className="small text-muted mb-3">
                Người nhận: <strong>{ord.name}</strong> ({ord.phone}) <br />
                Địa chỉ: {ord.location_id}
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <span className="fw-bold text-danger">
                  {(ord.final_total || ord.total || 0).toLocaleString("vi-VN")}đ
                </span>
                <Link 
                  href={`/orders/${ord._id || ord.id}`} 
                  className="btn btn-sm text-white rounded-pill px-4 fw-semibold"
                  style={{ backgroundColor: "#f59e0b" }}
                >
                  Xem chi tiết ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
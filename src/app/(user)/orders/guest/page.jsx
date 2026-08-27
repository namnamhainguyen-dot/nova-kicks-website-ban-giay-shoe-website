"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function GuestOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("guest_orders");
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
                <span className="font-monospace fw-bold text-primary">#{ord._id?.toUpperCase()}</span>
                <span className="badge bg-secondary">{ord.status || "Đang xử lý"}</span>
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
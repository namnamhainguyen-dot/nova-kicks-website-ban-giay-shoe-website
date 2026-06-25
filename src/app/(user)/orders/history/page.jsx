"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(order => activeTab === "all" ? true : order.status === activeTab);

  const statusBadges = {
    pending: { text: "⏳ Chờ xác nhận", class: "bg-warning-subtle text-warning" },
    preparing: { text: "📦 Đang đóng gói", class: "bg-info-subtle text-info" },
    completed: { text: "🚚 Đã giao hàng", class: "bg-success-subtle text-success" },
    cancelled: { text: "❌ Đã hủy", class: "bg-danger-subtle text-danger" }
  };

  if (loading) return <div className="container my-5 text-center">Đang tải lịch sử đơn hàng...</div>;

  return (
    <div className="container my-5" style={{ maxWidth: "800px" }}>
      <div className="text-center mb-4">
        <h3 className="fw-bold">📦 Đơn Hàng Của Tôi</h3>
        <p className="text-muted">Theo dõi tiến độ vận chuyển đơn hàng giày của bạn</p>
      </div>

      {/* Tabs chuyển bộ lọc trạng thái */}
      <div className="d-flex justify-content-center gap-2 mb-4 overflow-auto py-1">
        {["all", "pending", "preparing", "completed", "cancelled"].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm rounded-pill px-3 ${activeTab === tab ? "btn-dark" : "btn-light"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "Tất cả" : statusBadges[tab]?.text || tab}
          </button>
        ))}
      </div>

      {/* Danh sách các hóa đơn */}
      {filteredOrders.length === 0 ? (
        <p className="text-center text-muted">Không tìm thấy đơn hàng nào ở mục này.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map(order => (
            <div key={order._id} className="card p-3 shadow-sm border-0 rounded-3">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div>
                  <span className="fw-bold text-uppercase small">Mã: #{order._id?.substring(order._id.length - 6)}</span>
                  <small className="text-muted d-block">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</small>
                </div>
                <span className={`badge px-2 py-1 rounded-pill ${statusBadges[order.status]?.class || "bg-secondary text-white"}`}>
                  {statusBadges[order.status]?.text || "Đang xử lý"}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Số lượng sản phẩm: </small>
                  <strong className="small">{order.order_items?.length || 0} đôi giày</strong>
                  <div className="fw-bold text-danger mt-1">{order.total?.toLocaleString("vi-VN")}đ</div>
                </div>
                {/* NÚT LIÊN KẾT ĐẾN TRANG CHI TIẾT ĐƠN HÀNG Ở BƯỚC 3 */}
                <Link href={`/orders/${order._id}`} className="btn btn-outline-dark btn-sm rounded-pill px-3">
                  Xem chi tiết ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
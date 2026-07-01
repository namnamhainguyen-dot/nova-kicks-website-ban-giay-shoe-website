"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // 1. Lấy thông tin người dùng từ localStorage để lấy email định danh
    const savedUser = localStorage.getItem("user");
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const userEmail = parsedUser?.email;

        // Nếu tìm thấy email hợp lệ thì mới gửi kèm qua query parameter sang API
        if (userEmail) {
          fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                setOrders(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
              }
            })
            .catch(err => console.error("Lỗi fetch lịch sử đơn hàng:", err))
            .finally(() => setLoading(false));
            
          return; // Thoát sớm vì đã thực hiện fetch dữ liệu
        }
      } catch (e) {
        console.error("Lỗi phân giải thông tin user từ localStorage:", e);
      }
    }

    // Trường hợp không tìm thấy user hoặc email (khách vãng lai), set mảng rỗng và tắt loading
    setOrders([]);
    setLoading(false);
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
          {filteredOrders.map(order => {
            // Tính toán số tiền hiển thị thực tế (Dự phòng nếu đơn cũ không có final_total)
            const displayTotal = order.total || 0;
            const displayDiscount = order.discount || 0;
            const actualPayment = order.final_total !== undefined ? order.final_total : (displayTotal - displayDiscount);

            return (
              <div key={order._id} className="card p-3 shadow-sm border-0 rounded-3 bg-white">
                {/* Header của thẻ đơn hàng */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                  <div>
                    <span className="fw-bold text-uppercase small">Mã: #{order._id?.substring(order._id.length - 6)}</span>
                    <small className="text-muted d-block">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {/* Tag nhỏ hiển thị nếu đơn này có áp dụng voucher */}
                    {displayDiscount > 0 && (
                      <span className="badge bg-danger-subtle text-danger rounded-pill fw-medium" style={{ fontSize: "0.7rem" }}>
                        🎟️ Đã giảm {displayDiscount.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                    <span className={`badge px-2 py-1 rounded-pill ${statusBadges[order.status]?.class || "bg-secondary text-white"}`}>
                      {statusBadges[order.status]?.text || "Đang xử lý"}
                    </span>
                  </div>
                </div>

                {/* Phần hiển thị danh sách sản phẩm tóm tắt */}
                <div className="py-2 border-bottom mb-2">
                  {order.order_items?.map((item, idx) => {
                    const itemKey = `${item.product_id || idx}-${item.color || "none"}-${item.size || "none"}`;
                    return (
                      <div key={itemKey} className="d-flex align-items-center justify-content-between py-1 small">
                        <div className="d-flex align-items-center text-truncate" style={{ maxWidth: "80%" }}>
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="rounded border me-2 object-fit-cover" 
                              style={{ width: "35px", height: "35px" }}
                            />
                          )}
                          <div className="text-truncate">
                            <span className="fw-semibold text-dark text-truncate d-block" style={{ maxWidth: "300px" }}>
                              {item.name}
                            </span>
                            <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                              {item.color && `Màu: ${item.color}`}
                              {item.color && item.size && " | "}
                              {item.size && `Size: ${item.size}`}
                              {(item.color || item.size) && " | "} 
                              Số lượng: x{item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="text-secondary fw-medium">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer của thẻ đơn hàng chứa Tổng tiền thực tế & Nút xem chi tiết */}
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">Thực tế thanh toán: </small>
                    <span className="fw-bold text-danger fs-5 d-block">{actualPayment.toLocaleString("vi-VN")}đ</span>
                  </div>
                  
                  <Link href={`/orders/${order._id}`} className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-semibold">
                    Xem chi tiết ➔
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
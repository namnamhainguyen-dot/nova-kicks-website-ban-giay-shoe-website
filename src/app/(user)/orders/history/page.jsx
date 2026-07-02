"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  // State quản lý việc hiển thị form nhập lý do hủy cho từng đơn hàng cụ thể
  const [activeCancelForm, setActiveCancelForm] = useState(null); // Lưu orderId đang chọn hủy
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Danh sách lý do hủy mẫu
  const sampleReasons = [
    "Muốn thay đổi địa chỉ giao hàng",
    "Muốn thay đổi sản phẩm/kích thước/màu sắc",
    "Tìm thấy cửa hàng khác giá tốt hơn",
    "Không còn nhu cầu mua nữa",
    "Đặt trùng đơn hàng",
    "Khác (Nhập lý do cụ thể)"
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const userEmail = parsedUser?.email;

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
          return;
        }
      } catch (e) {
        console.error("Lỗi phân giải thông tin user từ localStorage:", e);
      }
    }
    setOrders([]);
    setLoading(false);
  }, []);

  // Hàm xử lý gửi yêu cầu hủy đơn lên API kèm lý do
  const handleCancelOrderSubmit = async (orderId) => {
    // Lấy lý do cuối cùng (Nếu chọn "Khác" thì lấy từ ô nhập text)
    const finalReason = cancelReason === "Khác (Nhập lý do cụ thể)" ? customReason.trim() : cancelReason;

    if (!finalReason) {
      alert("Vui lòng chọn hoặc nhập lý do hủy đơn hàng!");
      return;
    }

    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?");
    if (!confirmCancel) return;

    setCancellingId(orderId);

    try {
      // Đã đổi sang "PATCH" để khớp 100% với hàm PATCH của API Backend
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "cancelled",
          cancelReason: finalReason // Gửi kèm lý do hủy lên server
        }),
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, status: "cancelled", cancelReason: finalReason } : order
          )
        );
        alert("Hủy đơn hàng thành công!");
        // Reset form hủy đơn về trạng thái ban đầu
        setActiveCancelForm(null);
        setCancelReason("");
        setCustomReason("");
      } else {
        // Dự phòng đọc text nếu API lỗi không trả ra chuỗi JSON
        const errorText = await response.text();
        let errorMessage = "Lỗi không xác định";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          if (errorText) errorMessage = errorText;
        }
        alert(`Hủy đơn hàng thất bại: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại sau!");
    } finally {
      setCancellingId(null);
    }
  };

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
            const displayTotal = order.total || 0;
            const displayDiscount = order.discount || 0;
            const actualPayment = order.final_total !== undefined ? order.final_total : (displayTotal - displayDiscount);

            return (
              <div key={order._id} className="card p-3 shadow-sm border-0 rounded-3 bg-white">
                {/* Header đơn hàng */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                  <div>
                    <span className="fw-bold text-uppercase small">Mã: #{order._id?.substring(order._id.length - 6)}</span>
                    <small className="text-muted d-block">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
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

                {/* Danh sách sản phẩm tóm tắt */}
                <div className="py-2 border-bottom mb-2">
                  {order.order_items?.map((item, idx) => {
                    const itemKey = `${item.product_id || idx}-${item.color || "none"}-${item.size || "none"}`;
                    return (
                      <div key={itemKey} className="d-flex align-items-center justify-content-between py-1 small">
                        <div className="d-flex align-items-center text-truncate" style={{ maxWidth: "80%" }}>
                          {item.image && (
                            <img src={item.image} alt={item.name} className="rounded border me-2 object-fit-cover" style={{ width: "35px", height: "35px" }} />
                          )}
                          <div className="text-truncate">
                            <span className="fw-semibold text-dark text-truncate d-block" style={{ maxWidth: "300px" }}>{item.name}</span>
                            <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                              {item.color && `Màu: ${item.color}`}
                              {item.color && item.size && " | "}
                              {item.size && `Size: ${item.size}`}
                              {(item.color || item.size) && " | "} 
                              Số lượng: x{item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="text-secondary fw-medium">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                      </div>
                    );
                  })}
                </div>

                {/* Hiển thị lý do hủy cũ nếu đơn hàng đã bị hủy */}
                {order.status === "cancelled" && order.cancelReason && (
                  <div className="bg-light p-2 rounded mb-2 small text-muted">
                    <strong>Lý do hủy:</strong> {order.cancelReason}
                  </div>
                )}

                {/* Form chọn lý do hủy (Ẩn/Hiện động dựa theo nút bấm) */}
                {activeCancelForm === order._id && (
                  <div className="bg-light p-3 rounded mb-3 border border-danger-subtle">
                    <label className="form-label small fw-bold text-danger">Chọn lý do hủy đơn hàng:</label>
                    <select 
                      className="form-select form-select-sm mb-2"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    >
                      <option value="">-- Chọn lý do --</option>
                      {sampleReasons.map((reason, index) => (
                        <option key={index} value={reason}>{reason}</option>
                      ))}
                    </select>

                    {/* Nếu chọn lý do "Khác" thì hiển thị thêm ô nhập tay */}
                    {cancelReason === "Khác (Nhập lý do cụ thể)" && (
                      <textarea 
                        className="form-control form-control-sm mb-2" 
                        placeholder="Nhập lý do chi tiết tại đây..."
                        rows={2}
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                      />
                    )}

                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        className="btn btn-sm btn-light border" 
                        onClick={() => { setActiveCancelForm(null); setCancelReason(""); setCustomReason(""); }}
                        disabled={cancellingId === order._id}
                      >
                        Đóng
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancelOrderSubmit(order._id)}
                        disabled={cancellingId === order._id}
                      >
                        {cancellingId === order._id ? "Đang xử lý..." : "Xác nhận hủy"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer đơn hàng */}
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted">Thực tế thanh toán: </small>
                    <span className="fw-bold text-danger fs-5 d-block">{actualPayment.toLocaleString("vi-VN")}đ</span>
                  </div>
                  
                  <div className="d-flex gap-2">
                    {/* Chỉ hiển thị nút kích hoạt Form Hủy đơn nếu đơn hàng ở trạng thái 'pending' */}
                    {order.status === "pending" && activeCancelForm !== order._id && (
                      <button
                        onClick={() => setActiveCancelForm(order._id)}
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                      >
                        Hủy đơn
                      </button>
                    )}

                    <Link href={`/orders/${order._id}`} className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-semibold">
                      Xem chi tiết ➔
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
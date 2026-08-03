"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  // State quản lý việc hiển thị form nhập lý do hủy cho từng đơn hàng cụ thể
  const [activeCancelForm, setActiveCancelForm] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Danh sách lý do hủy mẫu chuẩn Shopee
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

  const handleCancelOrderSubmit = async (orderId) => {
    const finalReason = cancelReason === "Khác (Nhập lý do cụ thể)" ? customReason.trim() : cancelReason;

    if (!finalReason) {
      alert("Vui lòng chọn hoặc nhập lý do hủy đơn hàng!");
      return;
    }

    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?");
    if (!confirmCancel) return;

    setCancellingId(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "cancelled",
          cancelReason: finalReason
        }),
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, status: "cancelled", cancelReason: finalReason } : order
          )
        );
        alert("Hủy đơn hàng thành công!");
        setActiveCancelForm(null);
        setCancelReason("");
        setCustomReason("");
      } else {
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

  // Định nghĩa nhãn trạng thái chuẩn phong cách Shopee
  const statusBadges = {
    pending: { text: "CHỜ XÁC NHẬN", class: "text-warning" },
    preparing: { text: "ĐANG CHUẨN BỊ HÀNG", class: "text-info" },
    completed: { text: "HOÀN THÀNH", class: "text-success" },
    cancelled: { text: "ĐÃ HỦY", class: "text-danger" }
  };

  // Các tab bộ lọc chuẩn thương mại điện tử
  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "preparing", label: "Đang giao / Chuẩn bị" },
    { key: "completed", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã hủy" }
  ];

  if (loading) {
    return (
      <div className="container my-5 text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="text-muted mt-2">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Thanh Tabs Trạng Thái (Shopee Style) */}
        <div className="bg-white rounded shadow-sm mb-3 d-flex overflow-auto text-nowrap border">
          {tabs.map(tab => {
            // Gom nhóm tab "preparing" vào tab "Đang giao / Chuẩn bị" hoặc lọc chính xác
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-fill py-3 px-3 bg-transparent border-0 text-center fw-medium small transition-all ${
                  isActive ? "text-danger border-bottom border-danger border-3" : "text-dark"
                }`}
                style={{ minWidth: "140px" }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Danh sách đơn hàng */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded shadow-sm p-5 text-center">
            <img 
              src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/order/5fafbb923393b712b96488590b8f781f.png" 
              alt="No orders" 
              style={{ width: "100px", opacity: 0.6 }}
              className="mb-3"
            />
            <p className="text-muted mb-3">Chưa có đơn hàng nào</p>
            <Link href="/" className="btn btn-danger btn-sm px-4 rounded-1">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredOrders.map(order => {
              const displayTotal = order.total || 0;
              const displayDiscount = order.discount || 0;
              const actualPayment = order.final_total !== undefined ? order.final_total : (displayTotal - displayDiscount);

              return (
                <div key={order._id} className="bg-white rounded shadow-sm border p-3">
                  
                  {/* Header Đơn Hàng: Shop Name & Trạng Thái */}
                  <div className="d-flex justify-content-between align-items-center pb-3 border-bottom small">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-danger text-white px-1 py-0.5 rounded-0" style={{ fontSize: "10px" }}>Yêu thích</span>
                      <span className="fw-bold text-dark">Cửa Hàng Giày Sneaker</span>
                      <span className="text-muted">| Mã đơn: #{order._id?.substring(order._id.length - 8).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className={`fw-bold text-uppercase small ${statusBadges[order.status]?.class || "text-secondary"}`}>
                        {statusBadges[order.status]?.text || "ĐANG XỬ LÝ"}
                      </span>
                    </div>
                  </div>

                  {/* Danh Sách Sản Phẩm (Shopee Item Row) */}
                  <div className="py-3 border-bottom">
                    {order.order_items?.map((item, idx) => {
                      const itemKey = `${item.product_id || idx}-${item.color || "none"}-${item.size || "none"}`;
                      return (
                        <div key={itemKey} className="d-flex align-items-start gap-3 mb-3 last-mb-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="border rounded object-fit-cover flex-shrink-0" 
                              style={{ width: "70px", height: "70px" }} 
                            />
                          ) : (
                            <div className="bg-secondary bg-opacity-10 border rounded d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "70px", height: "70px" }}>
                              <small className="text-muted">No img</small>
                            </div>
                          )}
                          
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-dark fw-normal text-truncate" style={{ maxWidth: "500px", fontSize: "14px" }}>
                              {item.name}
                            </h6>
                            <div className="text-muted small mb-1">
                              Phân loại hàng: {[item.color, item.size].filter(Boolean).join(", ") || "Mặc định"}
                            </div>
                            <div className="small text-dark">x{item.quantity}</div>
                          </div>

                          <div className="text-end flex-shrink-0">
                            <span className="text-danger fw-medium">{(item.price).toLocaleString("vi-VN")}đ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Lý do hủy (Nếu có) */}
                  {order.status === "cancelled" && order.cancelReason && (
                    <div className="bg-light p-2 rounded mt-3 small text-muted border-start border-danger border-3">
                      <strong>Lý do hủy:</strong> {order.cancelReason}
                    </div>
                  )}

                  {/* Form chọn lý do hủy đơn */}
                  {activeCancelForm === order._id && (
                    <div className="bg-light p-3 rounded mt-3 border border-danger-subtle">
                      <label className="form-label small fw-bold text-danger">Vui lòng chọn lý do hủy đơn hàng:</label>
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
                          className="btn btn-sm btn-light border px-3" 
                          onClick={() => { setActiveCancelForm(null); setCancelReason(""); setCustomReason(""); }}
                          disabled={cancellingId === order._id}
                        >
                          Trở lại
                        </button>
                        <button 
                          className="btn btn-sm btn-danger px-3"
                          onClick={() => handleCancelOrderSubmit(order._id)}
                          disabled={cancellingId === order._id}
                        >
                          {cancellingId === order._id ? "Đang xử lý..." : "Hoàn thành"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Phần Tổng Tiền (Thanh toán cuối cùng) */}
                  <div className="d-flex justify-content-end align-items-center py-3 border-bottom gap-2">
                    <span className="text-muted small">Thành tiền:</span>
                    <span className="text-danger fs-4 fw-bold">{actualPayment.toLocaleString("vi-VN")}đ</span>
                  </div>

                  {/* Footer Thao Tác (Nút Hủy Đơn, Xem Chi Tiết, Mua Lại) */}
                  <div className="d-flex justify-content-between align-items-center pt-3">
                    <div className="small text-muted">
                      {order.createdAt && `Được đặt vào: ${new Date(order.createdAt).toLocaleString("vi-VN")}`}
                    </div>
                    
                    <div className="d-flex gap-2">
                      {order.status === "pending" && activeCancelForm !== order._id && (
                        <button
                          onClick={() => setActiveCancelForm(order._id)}
                          className="btn btn-outline-secondary btn-sm px-4 rounded-1 fw-medium text-dark bg-white border"
                        >
                          Hủy Đơn Hàng
                        </button>
                      )}

                      <Link 
                        href={`/orders/${order._id}`} 
                        className="btn btn-danger btn-sm px-4 rounded-1 fw-medium"
                      >
                        Xem Chi Tiết
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
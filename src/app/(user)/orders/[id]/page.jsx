"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage() {
  const { id } = useParams(); // Lấy ID đơn hàng từ URL /orders/[id]
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch thông tin đơn hàng cụ thể
    fetch(`/api/orders`)
      .then(res => res.json())
      .then(data => {
        const foundOrder = Array.isArray(data) ? data.find(o => o._id === id) : null;
        if (foundOrder) {
          setOrder(foundOrder);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const statusLabels = {
    pending: { text: "Chờ xác nhận hệ thống", color: "text-warning" },
    preparing: { text: "Cửa hàng đang đóng gói sản phẩm", color: "text-info" },
    completed: { text: "Đã giao hàng thành công", color: "text-success" },
    cancelled: { text: "Đơn đặt hàng đã bị hủy", color: "text-danger" }
  };

  if (loading) return <div className="container my-5 text-center">Đang tải dữ liệu đơn hàng...</div>;
  if (!order) return <div className="container my-5 text-center text-danger">⚠️ Không tìm thấy thông tin đơn hàng này!</div>;

  // Dự phòng tính toán nếu trường hợp đơn hàng cũ không có final_total
  const displayTotal = order.total || 0;
  const displayDiscount = order.discount || 0;
  const displayFinalTotal = order.final_total !== undefined ? order.final_total : (displayTotal - displayDiscount);

  return (
    <div className="container my-5" style={{ maxWidth: "700px" }}>
      <div className="mb-3">
        <Link href="/orders/history" className="text-decoration-none text-secondary small">
          ← Quay lại danh sách lịch sử
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        {/* Banner đầu trang */}
        <div className="bg-dark text-white p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-white-50 uppercase">MÃ ĐƠN HÀNG</small>
              <h4 className="fw-bold mb-0">#{order._id?.toUpperCase()}</h4>
            </div>
            <div className="text-end">
              <small className="text-white-50">TRẠNG THÁI</small>
              <h6 className={`fw-bold mb-0 ${statusLabels[order.status]?.color || "text-white"}`}>
                {statusLabels[order.status]?.text || "Đang xử lý"}
              </h6>
            </div>
          </div>
        </div>

        {/* Informational Section */}
        <div className="p-4 border-bottom bg-light-subtle">
          <h6 className="fw-bold mb-3 text-secondary">📍 Thông tin nhận hàng</h6>
          <div className="row g-2 small">
            <div className="col-4 text-muted">Người nhận:</div>
            <div className="col-8 fw-semibold text-dark">{order.name}</div>
            
            <div className="col-4 text-muted">Số điện thoại:</div>
            <div className="col-8 fw-semibold text-dark">{order.phone}</div>
            
            <div className="col-4 text-muted">Địa chỉ giao:</div>
            <div className="col-8 fw-semibold text-dark">{order.location_id || "Chưa cập nhật địa chỉ"}</div>
            
            <div className="col-4 text-muted">Ngày đặt hàng:</div>
            <div className="col-8 text-dark">{new Date(order.createdAt).toLocaleString("vi-VN")}</div>
          </div>
        </div>

        {/* Danh sách sản phẩm thực tế */}
        <div className="p-4 border-bottom">
          <h6 className="fw-bold mb-3 text-secondary">👟 Danh sách sản phẩm</h6>
          {order.order_items?.map((item, idx) => {
            const itemKey = `${item.product_id || idx}-${item.color || "none"}-${item.size || "none"}`;

            return (
              <div key={itemKey} className="d-flex align-items-center justify-content-between py-2 border-bottom last-item-border-0">
                <div className="d-flex align-items-center">
                  <img 
                    src={item.image || "https://via.placeholder.com/60"} 
                    alt={item.name} 
                    className="rounded border me-3 object-fit-cover" 
                    style={{ width: "55px", height: "55px" }} 
                  />
                  <div>
                    <span className="fw-bold d-block text-dark small">{item.name}</span>
                    
                    {/* Hiển thị phân loại màu sắc và size giày */}
                    {(item.color || item.size) && (
                      <div className="text-muted small mb-1" style={{ fontSize: "0.75rem" }}>
                        {item.color && <span>Màu: {item.color}</span>}
                        {item.color && item.size && <span> | </span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                    )}

                    <small className="text-muted">Số lượng: x{item.quantity}</small>
                  </div>
                </div>
                <span className="fw-bold small text-dark">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
              </div>
            );
          })}
        </div>

        {/* Ghi chú khách hàng */}
        {order.note && (
          <div className="p-4 bg-light border-bottom small">
            <strong className="text-secondary">📌 Ghi chú của bạn:</strong>
            <p className="mb-0 mt-1 text-dark-emphasis">{order.note}</p>
          </div>
        )}

        {/* Chi tiết tính tiền & Voucher giảm giá */}
        <div className="p-4 bg-light-subtle border-bottom small">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Tạm tính đơn hàng:</span>
            <span className="text-dark fw-medium">{displayTotal.toLocaleString("vi-VN")}đ</span>
          </div>

          {/* HIỂN THỊ VOUCHER ĐÃ ÁP DỤNG */}
          {displayDiscount > 0 && (
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                🎟️ Mã giảm giá {order.applied_voucher ? `(${order.applied_voucher.toUpperCase()})` : ""}:
              </span>
              <span className="text-danger fw-bold">-{displayDiscount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}

          <div className="d-flex justify-content-between">
            <span className="text-muted">Phí vận chuyển:</span>
            <span className="text-success fw-medium">Miễn phí (Toàn quốc)</span>
          </div>
        </div>

        {/* Chân trang tổng tiền cuối cùng */}
        <div className="p-4 bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark fs-5">Tổng tiền thanh toán:</span>
          <span className="h3 fw-bold text-danger mb-0">{displayFinalTotal.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      <style jsx>{`
        .last-item-border-0:last-child { border-bottom: 0 !important; }
      `}</style>
    </div>
  );
}
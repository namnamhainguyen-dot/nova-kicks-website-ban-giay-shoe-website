"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      
      if (!res.ok) {
        throw new Error("Không tìm thấy đơn hàng trên hệ thống.");
      }

      const data = await res.json();
      const orderData = data && data.data ? data.data : data;
      setOrder(orderData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center my-5 p-5 fs-5">⏳ Đang tải chi tiết đơn hàng...</div>;
  if (error) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-danger d-inline-block px-5 py-3 shadow-sm">{error}</div>
        <div className="mt-3">
          <Link href="/admin/order" className="btn btn-dark rounded-pill px-4">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const statusBadges = {
    pending: { label: "⏳ Chờ xác nhận", class: "bg-warning text-dark" },
    preparing: { label: "📦 Đang đóng gói", class: "bg-info text-dark" },
    shipping: { label: "🚚 Đang giao hàng", class: "bg-primary text-white" },
    completed: { label: "✅ Hoàn thành", class: "bg-success text-white" },
    cancelled: { label: "❌ Đã hủy", class: "bg-danger text-white" },
  };

  const currentBadge = statusBadges[order?.status] || { label: "Đang xử lý", class: "bg-secondary text-white" };

  // Lấy chính xác địa chỉ dựa theo cấu trúc từ phía trang khách hàng (location_id)
  const fullAddress = order?.location_id || order?.address || order?.shippingAddress || "Chưa cập nhật";

  // Lấy thông tin mã giảm giá và số tiền giảm của đơn hàng
  const voucherCode = order?.applied_voucher || order?.couponCode || order?.voucherCode;
  const discountAmount = order?.discount || order?.discountAmount || 0;

  return (
    <div className="container my-5" style={{ maxWidth: "1100px" }}>
      
      {/* Header & Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <Link href="/admin/order" className="text-decoration-none text-muted small fw-semibold mb-2 d-inline-block">
            ⬅️ Quay lại danh sách đơn hàng
          </Link>
          <div className="d-flex align-items-center gap-3 mt-1">
            <h2 className="fw-bold text-dark m-0">Đơn hàng #{order?._id?.slice(-6)}</h2>
            <span className={`badge px-3 py-2 rounded-pill fw-semibold ${currentBadge.class}`}>
              {currentBadge.label}
            </span>
          </div>
          <p className="text-muted small mb-0 mt-1">ID đầy đủ hệ thống: <code>{order?._id}</code></p>
        </div>
      </div>

      <div className="row g-4">
        
        {/* CỘT TRÁI: THÔNG TIN GIAO NHẬN */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <h5 className="fw-bold border-bottom pb-3 mb-3 text-secondary">Thông tin giao nhận</h5>

            <div className="mb-3">
              <span className="text-muted small d-block">Người nhận</span>
              <strong className="text-dark fs-6">{order?.name}</strong>
            </div>
            <div className="mb-3">
              <span className="text-muted small d-block">Số điện thoại</span>
              <strong className="text-dark">{order?.phone}</strong>
            </div>
            <div className="mb-3">
              <span className="text-muted small d-block">Địa chỉ giao hàng</span>
              <strong className="text-dark">{fullAddress}</strong>
            </div>
            <div className="mb-3">
              <span className="text-muted small d-block">Ngày đặt hàng</span>
              <span className="text-dark">{order?.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "---"}</span>
            </div>

            {order?.status === "cancelled" && order?.cancelReason && (
              <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded-3 mt-3">
                <span className="text-danger fw-bold small d-block">⚠️ Lý do hủy đơn:</span>
                <span className="text-danger small">{order.cancelReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM & TỔNG TIỀN */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white d-flex flex-column">
            <h5 className="fw-bold border-bottom pb-3 mb-3 text-secondary">Danh sách sản phẩm mua</h5>
            
            {order?.order_items && order.order_items.length > 0 ? (
              <div className="table-responsive flex-grow-1">
                <table className="table align-middle">
                  <thead className="table-light text-uppercase small text-muted">
                    <tr>
                      <th className="py-2">Sản phẩm</th>
                      <th className="text-center py-2" style={{ width: "90px" }}>Số lượng</th>
                      <th className="text-end py-2" style={{ width: "130px" }}>Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3">
                          <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: "260px" }}>
                            {item.name}
                          </span>
                          {(item.color || item.size) && (
                            <small className="text-muted d-block">
                              {item.color ? `Màu: ${item.color}` : ""} {item.size ? `| Size: ${item.size}` : ""}
                            </small>
                          )}
                        </td>
                        <td className="text-center fw-bold text-secondary">x{item.quantity}</td>
                        <td className="text-end fw-semibold text-danger">
                          {(item.price || 0).toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center py-5 my-auto">Không tìm thấy dữ liệu sản phẩm trong đơn hàng.</p>
            )}

            {/* Hiển thị mã giảm giá đơn hàng nếu có */}
            {voucherCode && (
              <div className="d-flex justify-content-between align-items-center py-2 px-3 bg-light rounded-3 mb-2 small">
                <span className="text-muted">Mã giảm giá áp dụng: <strong className="text-dark">({voucherCode.toUpperCase()})</strong></span>
                <span className="text-success fw-bold">-{Number(discountAmount).toLocaleString("vi-VN")}đ</span>
              </div>
            )}

            {/* Tổng thành tiền */}
            <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
              <span className="text-muted fw-semibold">Tổng thành tiền:</span>
              <span className="fs-3 fw-bold text-danger">
                {(order?.final_total || order?.total || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
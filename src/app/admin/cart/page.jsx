"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - Thay thế bằng API call sau
  useEffect(() => {
    // Giả lập dữ liệu đơn hàng
    const mockOrders = [
      {
        id: "ORD-001",
        date: "2026-06-15T10:30:00",
        total: 1250000,
        status: "delivered",
        items: [
          { name: "Áo sơ mi trắng", quantity: 2, price: 350000 },
          { name: "Quần jean đen", quantity: 1, price: 550000 },
        ],
        shippingAddress: "123 Nguyễn Văn A, Quận 1, TP.HCM",
        paymentMethod: "Thanh toán khi nhận hàng",
        note: "Giao hàng trong giờ hành chính",
      },
      {
        id: "ORD-002",
        date: "2026-06-14T15:20:00",
        total: 850000,
        status: "shipping",
        items: [
          { name: "Giày thể thao", quantity: 1, price: 850000 },
        ],
        shippingAddress: "456 Lê Văn B, Quận 3, TP.HCM",
        paymentMethod: "Chuyển khoản ngân hàng",
        note: "",
      },
      {
        id: "ORD-003",
        date: "2026-06-13T08:45:00",
        total: 2100000,
        status: "pending",
        items: [
          { name: "Laptop Dell", quantity: 1, price: 15000000 },
          { name: "Chuột không dây", quantity: 2, price: 300000 },
        ],
        shippingAddress: "789 Phạm Văn C, Quận 5, TP.HCM",
        paymentMethod: "Thẻ tín dụng",
        note: "Gọi trước khi giao",
      },
      {
        id: "ORD-004",
        date: "2026-06-12T09:10:00",
        total: 320000,
        status: "cancelled",
        items: [
          { name: "Sách giáo khoa", quantity: 3, price: 120000 },
        ],
        shippingAddress: "321 Trần Văn D, Quận 7, TP.HCM",
        paymentMethod: "Thanh toán khi nhận hàng",
        note: "Đã hủy đơn hàng",
      },
    ];
    setOrders(mockOrders);
    setLoading(false);
  }, []);

  // Format ngày giờ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Lấy màu sắc và text cho status
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        text: "Đang xử lý",
        color: "warning",
        bg: "bg-warning bg-opacity-10",
        borderColor: "border-warning",
      },
      shipping: {
        text: "Đang giao hàng",
        color: "info",
        bg: "bg-info bg-opacity-10",
        borderColor: "border-info",
      },
      delivered: {
        text: "Đã giao hàng",
        color: "success",
        bg: "bg-success bg-opacity-10",
        borderColor: "border-success",
      },
      cancelled: {
        text: "Đã hủy",
        color: "danger",
        bg: "bg-danger bg-opacity-10",
        borderColor: "border-danger",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  // Lọc đơn hàng theo status
  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Hàm xem chi tiết đơn hàng
  const toggleOrderDetail = (orderId) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải danh sách đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-2 mb-md-0">
          <i className="bi bi-box-seam me-2"></i>
          Quản lý đơn hàng
        </h2>
        <span className="badge bg-primary fs-6 px-3 py-2">
          {orders.length} đơn hàng
        </span>
      </div>

      {/* Filter buttons */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn ${filterStatus === "all" ? "btn-dark" : "btn-outline-secondary"}`}
          onClick={() => setFilterStatus("all")}
        >
          Tất cả ({orders.length})
        </button>
        <button
          className={`btn ${filterStatus === "pending" ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => setFilterStatus("pending")}
        >
          Đang xử lý ({orders.filter(o => o.status === "pending").length})
        </button>
        <button
          className={`btn ${filterStatus === "shipping" ? "btn-info" : "btn-outline-info"}`}
          onClick={() => setFilterStatus("shipping")}
        >
          Đang giao ({orders.filter(o => o.status === "shipping").length})
        </button>
        <button
          className={`btn ${filterStatus === "delivered" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setFilterStatus("delivered")}
        >
          Đã giao ({orders.filter(o => o.status === "delivered").length})
        </button>
        <button
          className={`btn ${filterStatus === "cancelled" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => setFilterStatus("cancelled")}
        >
          Đã hủy ({orders.filter(o => o.status === "cancelled").length})
        </button>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="card shadow-sm p-5 text-center">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <p className="fs-5 text-muted mt-3">Không có đơn hàng nào trong danh sách này.</p>
          <Link href="/products" className="btn btn-dark px-4 mt-2 mx-auto d-inline-block">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {/* Danh sách đơn hàng */}
          <div className="col-12">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div key={order.id} className="card shadow-sm mb-4 border-0">
                  {/* Order header */}
                  <div 
                    className="card-header bg-white p-3 d-flex flex-wrap justify-content-between align-items-center cursor-pointer"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleOrderDetail(order.id)}
                  >
                    <div className="d-flex flex-wrap align-items-center gap-3">
                      <span className="fw-bold text-primary">{order.id}</span>
                      <span className="text-muted small">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatDate(order.date)}
                      </span>
                      <span className={`badge ${statusInfo.bg} text-${statusInfo.color} border ${statusInfo.borderColor} px-3 py-2`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold text-danger">
                        {order.total.toLocaleString("vi-VN")} đ
                      </span>
                      <i className={`bi ${selectedOrder === order.id ? "bi-chevron-up" : "bi-chevron-down"} text-secondary`}></i>
                    </div>
                  </div>

                  {/* Order body - Chi tiết */}
                  {selectedOrder === order.id && (
                    <div className="card-body p-4">
                      <div className="row g-4">
                        {/* Danh sách sản phẩm */}
                        <div className="col-md-7">
                          <h6 className="fw-bold mb-3">
                            <i className="bi bi-bag me-2"></i>
                            Chi tiết sản phẩm
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead className="table-light">
                                <tr>
                                  <th>Sản phẩm</th>
                                  <th className="text-center">Số lượng</th>
                                  <th className="text-end">Đơn giá</th>
                                  <th className="text-end">Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td>{item.name}</td>
                                    <td className="text-center">x{item.quantity}</td>
                                    <td className="text-end">{item.price.toLocaleString("vi-VN")} đ</td>
                                    <td className="text-end fw-semibold">
                                      {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan="3" className="text-end fw-bold">Tổng cộng:</td>
                                  <td className="text-end fw-bold text-danger">
                                    {order.total.toLocaleString("vi-VN")} đ
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {/* Thông tin đơn hàng */}
                        <div className="col-md-5">
                          <h6 className="fw-bold mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Thông tin đơn hàng
                          </h6>
                          <div className="bg-light p-3 rounded-3">
                            <div className="mb-2">
                              <small className="text-muted">Địa chỉ giao hàng:</small>
                              <p className="mb-1 fw-semibold">{order.shippingAddress}</p>
                            </div>
                            <div className="mb-2">
                              <small className="text-muted">Phương thức thanh toán:</small>
                              <p className="mb-1">{order.paymentMethod}</p>
                            </div>
                            {order.note && (
                              <div className="mb-2">
                                <small className="text-muted">Ghi chú:</small>
                                <p className="mb-1 fst-italic text-muted">{order.note}</p>
                              </div>
                            )}
                            <div className="d-flex gap-2 mt-3">
                              <button className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-printer me-1"></i>
                                In hóa đơn
                              </button>
                              {order.status === "pending" && (
                                <button className="btn btn-sm btn-outline-danger">
                                  <i className="bi bi-x-circle me-1"></i>
                                  Hủy đơn
                                </button>
                              )}
                              {order.status === "delivered" && (
                                <button className="btn btn-sm btn-outline-success">
                                  <i className="bi bi-star me-1"></i>
                                  Đánh giá
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
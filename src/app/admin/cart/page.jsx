"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

<<<<<<< Updated upstream
  // 1. Tải giỏ hàng từ localStorage khi vừa vào trang
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  // Hàm cập nhật và lưu lại vào localStorage
  const updateCartAndStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // 2. Tăng/Giảm số lượng sản phẩm
  const handleQuantityChange = (id, change) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
=======
  // Mock data
  useEffect(() => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
>>>>>>> Stashed changes
    });
    updateCartAndStorage(updatedCart);
  };

<<<<<<< Updated upstream
  // 3. Xóa sản phẩm khỏi giỏ
  const handleRemoveItem = (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      const updatedCart = cart.filter((item) => item.id !== id);
      updateCartAndStorage(updatedCart);
    }
  };

  // 4. Tính tổng tiền giỏ hàng
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (loading) {
    return <div className="container mt-5 text-center">Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-bold">Giỏ Hàng Của Bạn</h2>

      {cart.length === 0 ? (
        <div className="card shadow-sm p-5 text-center">
          <p className="fs-5 text-muted">Giỏ hàng của bạn đang trống rỗng.</p>
          <Link href="/products" className="btn btn-dark px-4 mt-2">
=======
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        text: "Đang xử lý",
        icon: "bi-hourglass-split",
        bg: "bg-warning-subtle text-warning-emphasis border-warning-subtle",
      },
      shipping: {
        text: "Đang giao",
        icon: "bi-truck",
        bg: "bg-info-subtle text-info-emphasis border-info-subtle",
      },
      delivered: {
        text: "Đã giao hàng",
        icon: "bi-check-circle-fill",
        bg: "bg-success-subtle text-success-emphasis border-success-subtle",
      },
      cancelled: {
        text: "Đã hủy",
        icon: "bi-x-circle-fill",
        bg: "bg-danger-subtle text-danger-emphasis border-danger-subtle",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const toggleOrderDetail = (orderId) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="container min-vh-50 d-flex flex-column justify-content-center align-items-center my-5 py-5">
        <div className="spinner-border text-dark mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <h5 className="text-secondary fw-medium">Đang đồng bộ danh sách đơn hàng...</h5>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div className="row align-items-center mb-5">
        <div className="col-12 col-md-auto mb-3 mb-md-0">
          <h2 className="fw-black m-0 text-dark d-flex align-items-center gap-3">
            <div className="bg-dark text-white rounded-3 p-2 d-inline-flex justify-content-center align-items-center shadow-sm" style={{ width: "48px", height: "48px" }}>
              <i className="bi bi-receipt fs-4"></i>
            </div>
            Lịch sử đơn hàng
          </h2>
        </div>
        <div className="col text-md-end">
          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
            Tổng cộng: {orders.length} đơn
          </span>
        </div>
      </div>

      {/* Filter Tabs Style */}
      <div className="card border-0 bg-light p-2 mb-4 rounded-4 shadow-sm">
        <div className="nav nav-pills row g-2 border-0">
          {[
            { id: "all", label: `Tất cả (${orders.length})`, btnClass: "btn-dark" },
            { id: "pending", label: `Chờ xử lý (${orders.filter(o => o.status === "pending").length})`, btnClass: "btn-warning" },
            { id: "shipping", label: `Đang giao (${orders.filter(o => o.status === "shipping").length})`, btnClass: "btn-info" },
            { id: "delivered", label: `Đã giao (${orders.filter(o => o.status === "delivered").length})`, btnClass: "btn-success" },
            { id: "cancelled", label: `Đã hủy (${orders.filter(o => o.status === "cancelled").length})`, btnClass: "btn-danger" }
          ].map((tab) => (
            <div key={tab.id} className="col-6 col-md">
              <button
                className={`w-100 py-2.5 px-2 rounded-3 border-0 fw-medium transition-all text-truncate ${
                  filterStatus === tab.id 
                    ? `${tab.btnClass} text-white shadow-sm fw-bold` 
                    : "bg-transparent text-secondary hover-bg-white"
                }`}
                style={{ fontSize: "0.9rem" }}
                onClick={() => setFilterStatus(tab.id)}
              >
                {tab.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white">
          <div className="bg-light rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-4 mx-auto" style={{ width: "100px", height: "100px" }}>
            <i className="bi bi-mailbox display-5 text-muted"></i>
          </div>
          <h4 className="fw-bold text-dark">Danh sách trống</h4>
          <p className="text-muted mb-4 small">Bạn hiện không có đơn hàng nào thuộc trạng thái này.</p>
          <Link href="/products" className="btn btn-dark px-4 py-2 rounded-3 fw-medium shadow-sm transition-all">
>>>>>>> Stashed changes
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
<<<<<<< Updated upstream
        <div className="row g-4">
          {/* Cột danh sách sản phẩm */}
          <div className="col-lg-8">
            <div className="card shadow-sm p-4">
              {cart.map((item) => (
                <div key={item.id} className="row align-items-center mb-4 pb-4 border-bottom">
                  {/* Ảnh sản phẩm */}
                  <div className="col-3 col-md-2">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="img-fluid rounded border"
                    />
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="col-5 col-md-5">
                    <h5 className="fw-bold mb-1 text-truncate">{item.name}</h5>
                    <p className="text-muted mb-0">{item.price.toLocaleString("vi-VN")} đ</p>
                  </div>

                  {/* Bộ tăng giảm số lượng */}
<div className="col-4 col-md-3 d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-outline-secondary px-2"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="mx-3 fw-semibold">{item.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary px-2"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Nút xóa */}
                  <div className="col-12 col-md-2 text-md-end mt-2 mt-md-0">
                    <button
                      className="btn btn-sm btn-link text-danger p-0 border-0"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột tổng kết đơn hàng */}
          <div className="col-lg-4">
            <div className="card shadow-sm p-4 bg-light">
              <h4 className="fw-bold mb-4">Tóm tắt đơn hàng</h4>
              <div className="d-flex justify-content-between mb-3 fs-5">
                <span>Tổng tiền:</span>
                <span className="fw-bold text-danger">
                  {totalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <hr />
              <Link href="/checkout" className="btn btn-dark w-100 py-2 fw-semibold">
                Tiến hành thanh toán
              </Link>
              <Link href="/products" className="btn btn-outline-secondary w-100 py-2 mt-2">
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>
=======
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const isExpanded = selectedOrder === order.id;

            return (
              <div 
                key={order.id} 
                className={`card border-0 shadow-sm rounded-4 overflow-hidden transition-all bg-white ${
                  isExpanded ? "ring-light border border-dark border-opacity-10" : ""
                }`}
              >
                {/* Order Header / Accordion Trigger */}
                <div 
                  className={`p-3 p-md-4 cursor-pointer transition-all ${isExpanded ? "bg-light bg-opacity-50" : "hover-bg-light"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleOrderDetail(order.id)}
                >
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-8">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className="fw-bold text-dark fs-5">{order.id}</span>
                        <span className={`badge ${statusInfo.bg} border rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 small fw-semibold`}>
                          <i className={`bi ${statusInfo.icon}`}></i>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="text-muted small d-flex gap-3">
                        <span><i className="bi bi-clock me-1"></i> {formatDate(order.date)}</span>
                        <span><i className="bi bi-box-seam me-1"></i> {order.items.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm</span>
                      </div>
                    </div>
                    <div className="col-12 col-md-4 text-md-end d-flex justify-content-between align-items-center justify-content-md-end gap-3 border-top border-md-0 pt-2 pt-md-0">
                      <div>
                        <small className="text-muted d-block d-md-none">Tổng tiền:</small>
                        <span className="fs-5 fw-black text-dark">
                          {order.total.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div className={`btn btn-light btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center shadow-xs transition-transform ${isExpanded ? "rotate-180" : ""}`} style={{ width: "32px", height: "32px" }}>
                        <i className="bi bi-chevron-down text-secondary small"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Body Details */}
                {isExpanded && (
                  <div className="card-body p-3 p-md-4 border-top bg-white">
                    <div className="row g-4">
                      {/* Products Side */}
                      <div className="col-12 col-lg-7">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <div className="bg-light rounded p-1.5 line-height-1"><i className="bi bi-basket text-dark"></i></div>
                          <h6 className="fw-bold m-0 text-dark">Sản phẩm đã đặt</h6>
                        </div>
                        
                        <div className="border rounded-3 overflow-hidden">
                          {order.items.map((item, idx) => (
                            <div key={idx} className={`p-3 d-flex justify-content-between align-items-center bg-white ${idx !== 0 ? "border-top" : ""}`}>
                              <div className="pe-3">
                                <p className="mb-0 fw-semibold text-dark text-break">{item.name}</p>
                                <small className="text-muted">
                                  {item.price.toLocaleString("vi-VN")}đ × {item.quantity}
                                </small>
                              </div>
                              <span className="fw-bold text-dark text-nowrap ms-auto">
                                {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Info & Delivery Side */}
                      <div className="col-12 col-lg-5">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <div className="bg-light rounded p-1.5 line-height-1"><i className="bi bi-geo-alt text-dark"></i></div>
                          <h6 className="fw-bold m-0 text-dark">Thông tin giao nhận</h6>
                        </div>

                        <div className="bg-light p-3 rounded-3 border border-light-subtle">
                          <div className="mb-2.5">
                            <small className="text-muted d-block mb-0.5">Địa chỉ nhận hàng</small>
                            <span className="fw-medium text-dark small">{order.shippingAddress}</span>
                          </div>
                          
                          <div className="mb-2.5 row g-2">
                            <div className="col-12">
                              <small className="text-muted d-block mb-0.5">Phương thức thanh toán</small>
                              <span className="badge bg-white text-dark border rounded-pill py-1.5 px-2.5 font-monospace fw-normal small w-100 text-start text-truncate">
                                <i className="bi bi-credit-card me-1 text-secondary"></i> {order.paymentMethod}
                              </span>
                            </div>
                          </div>

                          {order.note && (
                            <div className="mb-2 bg-warning-subtle bg-opacity-25 p-2 rounded border border-warning-subtle border-opacity-50">
                              <small className="text-warning-emphasis fw-semibold d-block mb-0.5"><i className="bi bi-pencil-square me-1"></i> Ghi chú:</small>
                              <span className="text-secondary small fst-italic">{order.note}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="row g-2 mt-3 pt-2 border-top">
                            <div className="col">
                              <button className="btn btn-white btn-sm border w-100 py-2 rounded-3 fw-medium d-flex align-items-center justify-content-center gap-1 shadow-xs hover-bg-light">
                                <i className="bi bi-printer"></i> Hóa đơn
                              </button>
                            </div>
                            {order.status === "pending" && (
                              <div className="col">
                                <button className="btn btn-outline-danger btn-sm w-100 py-2 rounded-3 fw-medium d-flex align-items-center justify-content-center gap-1">
                                  <i className="bi bi-trash"></i> Hủy đơn
                                </button>
                              </div>
                            )}
                            {order.status === "delivered" && (
                              <div className="col">
                                <button className="btn btn-dark btn-sm w-100 py-2 rounded-3 fw-medium d-flex align-items-center justify-content-center gap-1 shadow-xs">
                                  <i className="bi bi-star"></i> Đánh giá
                                </button>
                              </div>
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
>>>>>>> Stashed changes
        </div>
      )}

      {/* Inject custom CSS directly for specific interactions not covered by native Bootstrap utility classes */}
      <style jsx global>{`
        .fw-black { font-weight: 900; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .transition-transform { transition: transform 0.2s ease-in-out; }
        .hover-bg-light:hover { background-color: var(--bs-light) !important; }
        .hover-bg-white:hover { background-color: #ffffff !important; color: var(--bs-dark) !important; }
        .rotate-180 { transform: rotate(180deg); }
        .line-height-1 { line-height: 1; }
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .ring-light { box-shadow: 0 0 0 4px rgba(0,0,0,0.03); }
        .mb-2\.5 { margin-bottom: 0.75rem; }
      `}</style>
    </div>
  );
}
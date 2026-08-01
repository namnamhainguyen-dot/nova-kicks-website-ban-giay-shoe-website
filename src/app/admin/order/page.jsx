"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showDeadline, setShowDeadline] = useState(true);

  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: "",
    currentStatus: "",
    nextStatus: "",
    reason: "",
  });

  const statusOrder = ["pending", "preparing", "shipping", "completed"];

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (Array.isArray(data)) {
        setOrders(
          data.sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          )
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChangeClick = (id, currentStatus, nextStatus) => {
    if (currentStatus === "completed" || currentStatus === "cancelled") {
      alert("Đơn hàng đã hoàn thành hoặc đã hủy trước đó, không thể thay đổi!");
      loadOrders();
      return;
    }

    if (nextStatus === "cancelled") {
      if (["pending", "preparing", "shipping"].includes(currentStatus)) {
        setCancelModal({
          isOpen: true,
          orderId: id,
          currentStatus,
          nextStatus,
          reason: "",
        });
        return;
      }
    }

    if (currentStatus === "shipping" && nextStatus === "completed") {
      executeStatusUpdate(id, nextStatus);
      return;
    }

    const currentIndex = statusOrder.indexOf(currentStatus);
    const optionIndex = statusOrder.indexOf(nextStatus);
    if (optionIndex !== currentIndex + 1) {
      alert("Bạn phải cập nhật trạng thái theo đúng thứ tự quy trình!");
      loadOrders();
      return;
    }

    executeStatusUpdate(id, nextStatus);
  };

  const executeStatusUpdate = async (id, nextStatus, reason = "") => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: nextStatus,
          cancelReason: reason || undefined
        }),
      });

      const data = await res.json();

      if (data.success) {
        loadOrders();
      } else {
        alert(data.message || "Cập nhật trạng thái thất bại");
        loadOrders();
      }
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại");
      loadOrders();
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModal.reason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng!");
      return;
    }
    executeStatusUpdate(cancelModal.orderId, cancelModal.nextStatus, cancelModal.reason.trim());
    setCancelModal({ isOpen: false, orderId: "", currentStatus: "", nextStatus: "", reason: "" });
  };

  const totalOrders = orders.length;
  const totalProducts = orders.reduce((sum, o) => sum + (o.order_items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0), 0);
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + Number(o.final_total || o.total || 0), 0);

  // Tone màu nhạt (pastel nhẹ nhàng)
  const statusConfig = {
    pending: { text: "Chờ xác nhận", class: "bg-warning-subtle text-warning-emphasis border-warning-subtle" },
    preparing: { text: "Đang đóng gói", class: "bg-info-subtle text-info-emphasis border-info-subtle" },
    shipping: { text: "Đang giao hàng", class: "bg-primary-subtle text-primary-emphasis border-primary-subtle" },
    completed: { text: "Hoàn thành", class: "bg-success-subtle text-success-emphasis border-success-subtle" },
    cancelled: { text: "Đã hủy", class: "bg-danger-subtle text-danger-emphasis border-danger-subtle" },
  };

  // Hàm cấu hình danh sách option linh hoạt theo trạng thái hiện tại
  const getAllowedOptions = (currentStatus) => {
    const allOpts = [
      { value: "pending", label: "Chờ xác nhận" },
      { value: "preparing", label: "Đang đóng gói" },
      { value: "shipping", label: "Đang giao hàng" },
      { value: "completed", label: "Hoàn thành" },
      { value: "cancelled", label: "Đã hủy" },
    ];

    if (currentStatus === "completed" || currentStatus === "cancelled") {
      return allOpts.filter(opt => opt.value === currentStatus);
    }

    const currentIndex = statusOrder.indexOf(currentStatus);

    return allOpts.filter(opt => {
      if (opt.value === currentStatus) return true;
      
      // Nếu đang giao hàng, cho phép chọn hoàn thành hoặc hủy (khách bom hàng)
      if (currentStatus === "shipping") {
        return opt.value === "completed" || opt.value === "cancelled";
      }

      if (opt.value === "cancelled") {
        return currentStatus === "pending" || currentStatus === "preparing";
      }

      const optIndex = statusOrder.indexOf(opt.value);
      return optIndex === currentIndex + 1;
    });
  };

  const filteredOrders = orders.filter((o) => activeTab === "all" ? true : o.status === activeTab);

  const renderDeadline = (order) => {
    if (order.deadline) return new Date(order.deadline).toLocaleDateString("vi-VN");
    if (order.createdAt) {
      const date = new Date(order.createdAt);
      date.setDate(date.getDate() + 2);
      return date.toLocaleDateString("vi-VN");
    }
    return "---";
  };

  if (loading) {
    return <div className="container my-5 text-center text-muted fw-medium">Đang tải danh sách đơn hàng...</div>;
  }

  return (
    <div className="content admin-order-dashboard container-fluid px-4 py-4 bg-light min-vh-100" style={{ position: "relative" }}>
      
      {/* Modal Hủy đơn */}
      {cancelModal.isOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white py-3">
                <h5 className="modal-title fw-bold fs-6">Lý do hủy đơn hàng</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setCancelModal({ ...cancelModal, isOpen: false }); loadOrders(); }}></button>
              </div>
              <div className="modal-body py-3">
                <p className="text-muted small mb-3">Đơn hàng mã <span className="fw-bold text-dark">#{cancelModal.orderId.slice(-6)}</span> sẽ được chuyển sang trạng thái hủy.</p>
                <label className="form-label fw-semibold small text-secondary">Nhập lý do chi tiết:</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  placeholder="Ví dụ: Khách đổi ý, Khách từ chối nhận hàng, Sai địa chỉ..."
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                ></textarea>
              </div>
              <div className="modal-footer bg-light py-2">
                <button type="button" className="btn btn-sm btn-light border rounded-pill px-3" onClick={() => { setCancelModal({ ...cancelModal, isOpen: false }); loadOrders(); }}>Đóng</button>
                <button type="button" className="btn btn-sm btn-danger rounded-pill px-3" onClick={handleConfirmCancel}>Xác nhận hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Title */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Quản lý đơn hàng</h2>
        <p className="text-muted small mb-0">Theo dõi toàn bộ trạng thái và doanh thu đơn hàng trực tuyến.</p>
      </div>

      {/* Dashboard Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body p-3">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Tổng đơn hàng</span>
              <h4 className="fw-bold text-dark mt-2 mb-0">{totalOrders.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body p-3">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Sản phẩm bán ra</span>
              <h4 className="fw-bold text-primary mt-2 mb-0">{totalProducts.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body p-3">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Đơn hoàn thành</span>
              <h4 className="fw-bold text-success mt-2 mb-0">{completedOrders.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body p-3">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Tổng doanh thu</span>
              <h4 className="fw-bold text-danger mt-2 mb-0" style={{ fontSize: "1.25rem" }}>{totalRevenue.toLocaleString("vi-VN")}đ</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Options */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3 bg-white p-3 rounded-3 shadow-sm">
        <div className="d-flex gap-2 overflow-auto py-1 w-100 w-md-auto">
          {["all", "pending", "preparing", "shipping", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-3 text-nowrap fw-medium ${activeTab === tab ? "btn-dark text-white" : "btn-light text-secondary border"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "Tất cả" : statusConfig[tab]?.text}
            </button>
          ))}
        </div>
        <button
          className={`btn btn-sm rounded-pill px-3 fw-medium ${showDeadline ? "btn-outline-secondary" : "btn-secondary text-white"}`}
          onClick={() => setShowDeadline(!showDeadline)}
          style={{ fontSize: "0.85rem" }}
        >
          {showDeadline ? "Ẩn hạn xử lý" : "Hiện hạn xử lý"}
        </button>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white">
          <p className="text-muted mb-0">Không có đơn hàng nào phù hợp.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.9rem" }}>
              <thead className="table-light text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                <tr>
                  <th scope="col" className="ps-3 py-3" style={{ width: "10%" }}>Mã đơn</th>
                  <th scope="col" className="py-3" style={{ width: "14%" }}>Ngày tạo</th>
                  <th scope="col" className="py-3" style={{ width: "18%" }}>Khách hàng</th>
                  <th scope="col" className="py-3" style={{ width: "20%" }}>Sản phẩm</th>
                  <th scope="col" className="py-3" style={{ width: "11%" }}>Tổng tiền</th>
                  {showDeadline && <th scope="col" className="py-3" style={{ width: "10%" }}>Hạn xử lý</th>}
                  <th scope="col" className="py-3" style={{ width: "15%" }}>Trạng thái</th>
                  <th scope="col" className="text-end pe-3 py-3" style={{ width: "10%" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const currentStatusStyle = statusConfig[order.status]?.class || "bg-secondary-subtle text-secondary-emphasis";
                  const allowedOptions = getAllowedOptions(order.status || "pending");

                  return (
                    <tr key={order._id}>
                      <td className="ps-3 fw-bold text-dark text-uppercase small">#{order._id?.slice(-6)}</td>
                      <td className="text-muted small">{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "---"}</td>
                      <td>
                        <div className="fw-semibold text-dark">{order.name}</div>
                        <span className="text-muted" style={{ fontSize: "0.8rem" }}>{order.phone}</span>
                      </td>
                      <td>
                        {order.order_items?.length > 0 ? (
                          <div style={{ maxHeight: "75px", overflowY: "auto" }}>
                            {order.order_items.map((item, idx) => (
                              <div key={idx} className="text-truncate text-secondary" style={{ fontSize: "0.82rem" }} title={`${item.name} × ${item.quantity}`}>
                                {item.name} <span className="fw-bold text-dark">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small">Trống</span>
                        )}
                      </td>
                      <td className="fw-bold text-danger">{(order.final_total || order.total || 0).toLocaleString("vi-VN")}đ</td>
                      {showDeadline && <td className="text-secondary fw-medium" style={{ fontSize: "0.85rem" }}>{renderDeadline(order)}</td>}
                      <td>
                        <select
                          className={`form-select form-select-sm fw-semibold shadow-sm border ${currentStatusStyle}`}
                          style={{ width: "145px", fontSize: "0.82rem" }}
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusChangeClick(order._id, order.status, e.target.value)}
                        >
                          {allowedOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white text-dark fw-normal">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {order.status === "cancelled" && order.cancelReason && (
                          <div className="text-danger mt-1" style={{ fontSize: "0.72rem", maxWidth: "145px", wordBreak: "break-word" }}>
                            Lý do: {order.cancelReason}
                          </div>
                        )}
                      </td>
                      <td className="text-end pe-3">
                        <Link href={`/admin/order/${order._id}`} className="btn btn-outline-dark btn-sm rounded-pill py-1 px-3" style={{ fontSize: "0.78rem" }}>Chi tiết</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showDeadline, setShowDeadline] = useState(true);

  // ===== State phục vụ cho việc nhập lý do hủy đơn (Thay thế prompt) =====
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
    // 1. Nếu đơn hàng đã hoàn thành hoặc đã bị hủy từ trước -> Chặn hoàn toàn
    if (currentStatus === "completed" || currentStatus === "cancelled") {
      alert("Đơn hàng đã hoàn thành hoặc đã hủy trước đó, không thể thay đổi!");
      loadOrders();
      return;
    }

    // 2. Nếu chọn trạng thái HỦY ĐƠN
    if (nextStatus === "cancelled") {
      // Chỉ cho phép hủy khi đang ở trạng thái: Chờ xác nhận (pending) HOẶC Đang đóng gói (preparing)
      if (currentStatus === "pending" || currentStatus === "preparing") {
        // Mở Custom Modal để nhập lý do (Không dùng prompt nữa)
        setCancelModal({
          isOpen: true,
          orderId: id,
          currentStatus,
          nextStatus,
          reason: "",
        });
        return;
      } else {
        alert("Đơn hàng đã được bàn giao cho đơn vị vận chuyển, không thể hủy!");
        loadOrders();
        return;
      }
    }

    // 3. Quy trình dịch chuyển trạng thái bình thường (không đi lùi, không nhảy cóc)
    const currentIndex = statusOrder.indexOf(currentStatus);
    const optionIndex = statusOrder.indexOf(nextStatus);
    if (optionIndex !== currentIndex + 1) {
      alert("Bạn phải cập nhật trạng thái theo đúng thứ tự quy trình!");
      loadOrders();
      return;
    }

    // Nếu hợp lệ, tiến hành gọi API cập nhật luôn
    executeStatusUpdate(id, nextStatus);
  };

  // Hàm xử lý gửi API thực tế
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

  // Xác nhận hủy đơn từ Modal công cụ
  const handleConfirmCancel = () => {
    if (!cancelModal.reason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng!");
      return;
    }
    // Gửi dữ liệu đi
    executeStatusUpdate(cancelModal.orderId, cancelModal.nextStatus, cancelModal.reason.trim());
    // Đóng modal
    setCancelModal({ isOpen: false, orderId: "", currentStatus: "", nextStatus: "", reason: "" });
  };

  // const deleteOrder = async (id) => {
  //   if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

  //   try {
  //     const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  //     const data = await res.json();
  //     if (data.success) loadOrders();
  //   } catch (error) {
  //     console.error(error);
  //     alert("Xóa đơn hàng thất bại");
  //   }
  // };

  // ===== Dashboard Logic =====
  const totalOrders = orders.length;
  const totalProducts = orders.reduce((sum, o) => sum + (o.order_items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0), 0);
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + Number(o.final_total || o.total || 0), 0);

  const statusBadges = {
    pending: { text: "⏳ Chờ xác nhận", class: "bg-warning-subtle text-warning" },
    preparing: { text: "📦 Đang đóng gói", class: "bg-info-subtle text-info" },
    shipping: { text: "🚚 Đang giao", class: "bg-primary-subtle text-primary" },
    completed: { text: "✅ Hoàn thành", class: "bg-success-subtle text-success" },
    cancelled: { text: "❌ Đã hủy", class: "bg-danger-subtle text-danger" },
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
    return <div className="container my-5 text-center">Đang tải danh sách đơn hàng...</div>;
  }

  return (
    <div className="content admin-order-dashboard container-fluid px-4 py-3" style={{ position: "relative" }}>
      
      {/* ================= CUSTOM REACT MODAL (AN TOÀN TUYỆT ĐỐI CHO TURBOPACK) ================= */}
      {cancelModal.isOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">⚠️ Lý do hủy đơn hàng</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setCancelModal({ ...cancelModal, isOpen: false }); loadOrders(); }}></button>
              </div>
              <div className="modal-body py-3">
                <p className="text-muted small mb-2">Đơn hàng mã <span className="fw-bold">#{cancelModal.orderId.slice(-6)}</span> đang ở trạng thái đóng gói/chờ duyệt sẽ bị chuyển sang trạng thái hủy.</p>
                <label className="form-label fw-semibold small text-secondary">Nhập lý do chi tiết:</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Ví dụ: Khách đổi ý, Hết size hàng, Sai địa chỉ..."
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                ></textarea>
              </div>
              <div className="modal-footer bg-light py-2">
                <button type="button" className="btn btn-sm btn-secondary rounded-pill px-3" onClick={() => { setCancelModal({ ...cancelModal, isOpen: false }); loadOrders(); }}>Đóng</button>
                <button type="button" className="btn btn-sm btn-danger rounded-pill px-3" onClick={handleConfirmCancel}>Xác nhận hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-2">Quản lý đơn hàng</h1>
          <p className="text-muted mb-0">Theo dõi đơn hàng và cập nhật nhanh dưới dạng bảng dữ liệu.</p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3"><div className="card shadow-sm border-0 h-100"><div className="card-body"><small className="text-uppercase text-secondary">Tổng mã đơn hàng</small><h3 className="fw-bold mt-3">{totalOrders.toLocaleString()}</h3></div></div></div>
        <div className="col-sm-6 col-xl-3"><div className="card shadow-sm border-0 h-100"><div className="card-body"><small className="text-uppercase text-secondary">Tổng sản phẩm bán ra</small><h3 className="fw-bold mt-3 text-danger">{totalProducts.toLocaleString()}</h3></div></div></div>
        <div className="col-sm-6 col-xl-3"><div className="card shadow-sm border-0 h-100"><div className="card-body"><small className="text-uppercase text-secondary">Đơn hoàn thành</small><h3 className="fw-bold mt-3 text-success">{completedOrders.toLocaleString()}</h3></div></div></div>
        <div className="col-sm-6 col-xl-3"><div className="card shadow-sm border-0 h-100"><div className="card-body"><small className="text-uppercase text-secondary">Tổng doanh thu</small><h3 className="fw-bold mt-3" style={{ fontSize: "1.2rem" }}>{totalRevenue.toLocaleString("vi-VN")}đ</h3></div></div></div>
      </div>

      {/* Tabs & Utilities */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3">
        <div className="d-flex gap-2 overflow-auto py-1 w-100 w-md-auto">
          {["all", "pending", "preparing", "shipping", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-3 text-nowrap ${activeTab === tab ? "btn-dark" : "btn-light"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "Tất cả" : statusBadges[tab]?.text}
            </button>
          ))}
        </div>
        <button
          className={`btn btn-sm ms-auto rounded-pill px-3 ${showDeadline ? "btn-outline-secondary" : "btn-secondary"}`}
          onClick={() => setShowDeadline(!showDeadline)}
          style={{ fontSize: "0.85rem" }}
        >
          {showDeadline ? "👁️ Ẩn Hạn xử lý" : "👁️ Hiện Hạn xử lý"}
        </button>
      </div>

      {/* Table Giao diện */}
      {filteredOrders.length === 0 ? (
        <p className="text-center text-muted my-5">Không có đơn hàng nào.</p>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-3" style={{ width: "10%" }}>Mã đơn</th>
                  <th scope="col" style={{ width: "13%" }}>Ngày tạo</th>
                  <th scope="col" style={{ width: "18%" }}>Khách hàng</th>
                  <th scope="col" style={{ width: "22%" }}>Sản phẩm</th>
                  <th scope="col" style={{ width: "12%" }}>Tổng tiền</th>
                  {showDeadline && <th scope="col" style={{ width: "10%" }}>Hạn xử lý</th>}
                  <th scope="col" style={{ width: "15%" }}>Trạng thái</th>
                  <th scope="col" className="text-end pe-3" style={{ width: "12%" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="ps-3 fw-bold text-uppercase small">#{order._id?.slice(-6)}</td>
                    <td className="small text-muted">{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "---"}</td>
                    <td>
                      <div className="fw-semibold small">{order.name}</div>
                      <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>{order.phone}</small>
                    </td>
                    <td>
                      {order.order_items?.length > 0 ? (
                        <div style={{ maxHeight: "75px", overflowY: "auto" }}>
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="small text-truncate" style={{ fontSize: "0.82rem text-muted" }} title={`${item.name} × ${item.quantity}`}>
                              • {item.name} <span className="text-dark fw-bold">×{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted small">Không có dữ liệu</span>
                      )}
                    </td>
                    <td className="fw-bold text-danger small">{(order.final_total || order.total || 0).toLocaleString("vi-VN")}đ</td>
                    {showDeadline && <td className="small fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>{renderDeadline(order)}</td>}
                    <td>
                      <select
                        className={`form-select form-select-sm border-0 fw-semibold rounded-2 ${statusBadges[order.status]?.class || "bg-secondary text-white"}`}
                        style={{ width: "145px", fontSize: "0.82rem" }}
                        value={order.status || "pending"}
                        onChange={(e) => handleStatusChangeClick(order._id, order.status, e.target.value)}
                      >
                        <option value="pending" className="bg-white text-dark">⏳ Chờ xác nhận</option>
                        <option value="preparing" className="bg-white text-dark">📦 Đang đóng gói</option>
                        <option value="shipping" className="bg-white text-dark">🚚 Đang giao hàng</option>
                        <option value="completed" className="bg-white text-dark">✅ Hoàn thành</option>
                        <option value="cancelled" className="bg-white text-dark">❌ Đã hủy</option>
                      </select>
                      {order.status === "cancelled" && order.cancelReason && (
                        <div className="text-danger fw-semibold mt-1" style={{ fontSize: "0.72rem", maxWidth: "145px", wordBreak: "break-word" }}>
                          Lý do: {order.cancelReason}
                        </div>
                      )}
                    </td>
                    <td className="text-end pe-3">
                      <div className="d-flex gap-1 justify-content-end">
                        <Link href={`/admin/order/${order._id}`} className="btn btn-outline-dark btn-sm rounded-pill py-0 px-2" style={{ fontSize: "0.75rem" }}>Chi tiết</Link>
                        <button onClick={() => deleteOrder(order._id)} className="btn btn-outline-danger btn-sm rounded-pill py-0 px-2" style={{ fontSize: "0.75rem" }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
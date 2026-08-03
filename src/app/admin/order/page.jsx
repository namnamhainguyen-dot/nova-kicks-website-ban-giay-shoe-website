"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showDeadline, setShowDeadline] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Inline notification state
  const [messageBar, setMessageBar] = useState({
    visible: false,
    text: "",
    type: "danger" // 'danger', 'warning', 'success'
  });

  const showMessage = (text, type = "danger") => {
    setMessageBar({ visible: true, text, type });
    setTimeout(() => setMessageBar({ visible: false, text: "", type: "danger" }), 4000);
  };

  // State phục vụ cho việc nhập lý do hủy đơn / boom / trả hàng
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: "",
    orderId: "",
    currentStatus: "",
    nextStatus: "",
    reason: "",
    note: "",
    image: "",
  });

  const statusOrder = ["pending", "preparing", "shipping", "completed"];

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        cache: "no-store",
      });
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
    if (["completed", "cancelled", "returned", "boomed"].includes(currentStatus)) {
      showMessage("Đơn hàng đã ở trạng thái cuối, không thể thay đổi!", "warning");
      loadOrders();
      return;
    }

    // Hủy đơn
    if (nextStatus === "cancelled") {
      if (currentStatus === "pending" || currentStatus === "preparing") {
        setActionModal({
          isOpen: true,
          type: "cancelled",
          orderId: id,
          currentStatus,
          nextStatus,
          reason: "",
          note: "",
          image: "",
        });
        return;
      } else {
        showMessage("Đơn hàng đã được bàn giao cho đơn vị vận chuyển, không thể hủy!", "warning");
        loadOrders();
        return;
      }
    }

    // Boom hàng
    if (nextStatus === "boomed") {
      setActionModal({
        isOpen: true,
        type: "boomed",
        orderId: id,
        currentStatus,
        nextStatus,
        reason: "",
        note: "",
        image: "",
      });
      return;
    }

    // Trả hàng
    if (nextStatus === "returned") {
      setActionModal({
        isOpen: true,
        type: "returned",
        orderId: id,
        currentStatus,
        nextStatus,
        reason: "",
        note: "",
        image: "",
      });
      return;
    }

    // Quy trình dịch chuyển trạng thái bình thường
    if (currentStatus === "shipping" && nextStatus === "completed") {
      executeStatusUpdate(id, nextStatus);
      return;
    }

    const currentIndex = statusOrder.indexOf(currentStatus);
    const optionIndex = statusOrder.indexOf(nextStatus);
    if (optionIndex !== currentIndex + 1) {
      showMessage("Bạn phải cập nhật trạng thái theo đúng thứ tự quy trình!", "warning");
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
          cancelReason: nextStatus === "cancelled" ? reason : undefined,
          boomInfo:
            nextStatus === "boomed"
              ? {
                  reason,
                  note: actionModal.note,
                  image: actionModal.image,
                  createdAt: new Date(),
                }
              : undefined,
          returnInfo:
            nextStatus === "returned"
              ? {
                  reason,
                  note: actionModal.note,
                  image: actionModal.image,
                  createdAt: new Date(),
                }
              : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showMessage("Cập nhật trạng thái thành công!", "success");
        loadOrders();
      } else {
        showMessage(data.message || "Cập nhật trạng thái thất bại");
        loadOrders();
      }
    } catch (error) {
      console.error(error);
      showMessage("Cập nhật trạng thái thất bại");
      loadOrders();
    }
  };

  const handleConfirmAction = () => {
    if (!actionModal.reason.trim()) {
      showMessage("Vui lòng nhập lý do!");
      return;
    }

    executeStatusUpdate(
      actionModal.orderId,
      actionModal.nextStatus,
      actionModal.reason
    );

    setActionModal({
      isOpen: false,
      type: "",
      orderId: "",
      currentStatus: "",
      nextStatus: "",
      reason: "",
      note: "",
      image: "",
    });
  };

  // Thống kê số liệu
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => !o.status || o.status === "pending").length;
  const shippingOrders = orders.filter((o) => o.status === "shipping" || o.status === "preparing").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + Number(o.final_total || o.total || 0), 0);

  const statusBadges = {
    pending: { text: "⏳ Chờ xác nhận", class: "bg-warning bg-opacity-10 text-warning text-dark" },
    preparing: { text: "📦 Đang đóng gói", class: "bg-info bg-opacity-10 text-info" },
    shipping: { text: "🚚 Đang giao", class: "bg-primary bg-opacity-10 text-primary" },
    completed: { text: "✅ Hoàn thành", class: "bg-success bg-opacity-10 text-success" },
    cancelled: { text: "❌ Đã hủy", class: "bg-danger bg-opacity-10 text-danger" },
    boomed: { text: "💥 Boom hàng", class: "bg-danger bg-opacity-10 text-danger" },
    returned: { text: "↩️ Trả hàng", class: "bg-warning bg-opacity-10 text-warning text-dark" },
  };

  const getAllowedOptions = (currentStatus) => {
    const allOpts = [
      { value: "pending", label: "⏳ Chờ xác nhận" },
      { value: "preparing", label: "📦 Đóng gói" },
      { value: "shipping", label: "🚚 Đang giao" },
      { value: "completed", label: "✅ Hoàn thành" },
      { value: "cancelled", label: "❌ Hủy" },
      { value: "returned", label: "↩️ Trả hàng" },
      { value: "boomed", label: "💥 Boom" },
    ];

    if (["completed", "cancelled", "returned", "boomed"].includes(currentStatus)) {
      return allOpts.filter((opt) => opt.value === currentStatus);
    }

    const currentIndex = statusOrder.indexOf(currentStatus);

    return allOpts.filter((opt) => {
      if (opt.value === currentStatus) return true;

      const optIndex = statusOrder.indexOf(opt.value);
      if (optIndex === currentIndex + 1) return true;

      if (currentStatus === "pending" || currentStatus === "preparing") {
        if (opt.value === "cancelled") return true;
      }
      
      if (currentStatus === "shipping") {
        if (opt.value === "boomed" || opt.value === "returned") return true;
      }

      return false;
    });
  };

  // Lọc dữ liệu theo tab, phương thức thanh toán và từ khóa tìm kiếm
  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "all" ? true : o.status === activeTab;
    const matchesPayment = paymentFilter === "all" ? true : o.paymentMethod === paymentFilter;
    const key = search.toLowerCase();
    const matchesSearch =
      o._id?.toLowerCase().includes(key) ||
      o.name?.toLowerCase().includes(key) ||
      o.phone?.toLowerCase().includes(key) ||
      o.email?.toLowerCase().includes(key);

    return matchesTab && matchesPayment && matchesSearch;
  });

  // Chọn tất cả / Bỏ chọn tất cả hàng loạt
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o._id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(item => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  // Thao tác hàng loạt: Duyệt nhanh / Chuyển sang đóng gói
  const handleBatchUpdate = async (nextStatus) => {
    if (selectedOrderIds.length === 0) {
      showMessage("Vui lòng chọn ít nhất một đơn hàng!", "warning");
      return;
    }
    if (!confirm(`Bạn có chắc muốn chuyển ${selectedOrderIds.length} đơn hàng sang trạng thái mới?`)) return;

    try {
      let successCount = 0;
      for (const id of selectedOrderIds) {
        const res = await fetch(`/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        const data = await res.json();
        if (data.success) successCount++;
      }
      showMessage(`Đã cập nhật thành công ${successCount}/${selectedOrderIds.length} đơn hàng!`, "success");
      setSelectedOrderIds([]);
      loadOrders();
    } catch (error) {
      console.error(error);
      showMessage("Có lỗi xảy ra khi thao tác hàng loạt!");
      loadOrders();
    }
  };

  // Xuất file CSV danh sách đơn hàng đang hiển thị
  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      showMessage("Không có dữ liệu để xuất file!", "warning");
      return;
    }

    const headers = ["Mã đơn", "Khách hàng", "Số điện thoại", "Tổng tiền", "Thanh toán", "Trạng thái", "Ngày tạo"];
    const rows = filteredOrders.map(o => [
      `#${o._id?.slice(-6)}`,
      `"${o.name || ""}"`,
      `"${o.phone || ""}"`,
      o.final_total || o.total || 0,
      o.paymentMethod || "cod",
      o.status || "pending",
      o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : ""
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_don_hang_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage("Xuất file Excel/CSV thành công!", "success");
  };

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
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", position: "relative" }}>
      
      {/* ================= INLINE MESSAGE NOTIFICATION ================= */}
      {messageBar.visible && (
        <div className={`alert alert-${messageBar.type} py-2 px-3 rounded-3 shadow-sm d-flex align-items-center mb-4`} role="alert">
          <span className="fw-medium" style={{ fontSize: "0.9rem" }}>{messageBar.text}</span>
          <button type="button" className="btn-close ms-auto" style={{ fontSize: "0.75rem" }} onClick={() => setMessageBar({ visible: false, text: "", type: "danger" })}></button>
        </div>
      )}

      {/* ================= MODAL ACTION (BOM/TRẢ HÀNG/HỦY) ================= */}
      {actionModal.isOpen && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {actionModal.type === "cancelled"
                    ? "❌ Lý do hủy đơn"
                    : actionModal.type === "boomed"
                    ? "💥 Thông tin boom hàng"
                    : "↩️ Thông tin trả hàng"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setActionModal({ ...actionModal, isOpen: false })}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-2">
                  {actionModal.type === "cancelled"
                    ? "Vui lòng nhập lý do hủy đơn hàng để lưu hệ thống."
                    : actionModal.type === "boomed"
                    ? "Vui lòng nhập thông tin chi tiết đơn bị boom."
                    : "Vui lòng nhập thông tin chi tiết trả hàng."}
                </p>
                <label className="form-label text-muted small fw-semibold">Lý do chi tiết:</label>
                <textarea
                  className="form-control rounded-3"
                  rows="3"
                  placeholder="Ví dụ: Khách đổi ý, Sai địa chỉ, Không liên lạc được..."
                  value={actionModal.reason}
                  onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                ></textarea>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary rounded-3 px-4" onClick={() => setActionModal({ ...actionModal, isOpen: false })}>Đóng</button>
                <button type="button" className="btn btn-primary rounded-3 px-4" onClick={handleConfirmAction}>Xác nhận</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tiêu đề trang & Nút xuất Excel */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "1.75rem" }}>
            📦 Quản lý đơn hàng nâng cao
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            Theo dõi, xử lý hàng loạt và xuất báo cáo doanh thu trực tuyến.
          </p>
        </div>
        <button
          className="btn btn-dark rounded-pill px-4 fw-semibold shadow-sm"
          onClick={exportToCSV}
          style={{ fontSize: "0.9rem" }}
        >
          📊 Xuất Excel / CSV
        </button>
      </div>

      {/* Thẻ thống kê tổng quan */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-dark border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-secondary small fw-semibold mb-1">
              Tổng đơn hàng
            </div>
            <div className="fs-3 fw-bold">{totalOrders.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-dark border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-secondary small fw-semibold mb-1">
              Chờ xác nhận
            </div>
            <div className="fs-3 fw-bold text-warning">{pendingOrders}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-dark border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-secondary small fw-semibold mb-1">
              Đang xử lý/giao
            </div>
            <div className="fs-3 fw-bold text-info">{shippingOrders}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-dark border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-secondary small fw-semibold mb-1">
              Tổng doanh thu
            </div>
            <div className="fs-3 fw-bold text-success" style={{ fontSize: "1.25rem", marginTop: "4px" }}>
              {totalRevenue.toLocaleString("vi-VN")}đ
            </div>
          </div>
        </div>
      </div>

      {/* Thanh công cụ tìm kiếm, lọc phương thức thanh toán & tùy chỉnh hạn xử lý */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <label className="form-label small text-muted fw-semibold">Tìm kiếm</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Tìm theo mã đơn, tên, SĐT, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small text-muted fw-semibold">Thanh toán</label>
            <select
              className="form-select rounded-3"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Tất cả cổng thanh toán</option>
              <option value="cod">Thanh toán COD</option>
              <option value="vnpay">Thanh toán VNPay</option>
            </select>
          </div>
          <div className="col-md-5 d-flex justify-content-md-end align-items-end pt-3 pt-md-0">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-medium ${showDeadline ? "btn-outline-secondary" : "btn-secondary text-white"}`}
              onClick={() => setShowDeadline(!showDeadline)}
              style={{ fontSize: "0.85rem", height: "38px" }}
            >
              {showDeadline ? "Ẩn hạn xử lý" : "Hiện hạn xử lý"}
            </button>
          </div>
        </div>

        {/* Các nút Tab trạng thái */}
        <div className="d-flex gap-2 overflow-auto py-2 mt-3 border-top pt-3">
          {[
            "all",
            "pending",
            "preparing",
            "shipping",
            "completed",
            "boomed",
            "returned",
            "cancelled"
          ].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-3 text-nowrap fw-medium ${activeTab === tab ? "btn-dark text-white" : "btn-light text-secondary border"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "Tất cả" : statusBadges[tab]?.text}
            </button>
          ))}
        </div>
      </div>

      {/* Thanh thao tác hàng loạt (Batch Actions Bar) nếu có chọn đơn */}
      {selectedOrderIds.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-dark text-white d-flex flex-row align-items-center justify-content-between animate__fadeIn">
          <div className="fw-semibold ms-2">
            Đã chọn <span className="badge bg-light text-dark px-2 py-1">{selectedOrderIds.length}</span> đơn hàng
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-info text-white fw-semibold rounded-pill px-3"
              onClick={() => handleBatchUpdate("preparing")}
            >
              📦 Chuyển sang Đóng gói
            </button>
            <button
              className="btn btn-sm btn-primary fw-semibold rounded-pill px-3"
              onClick={() => handleBatchUpdate("shipping")}
            >
              🚚 Chuyển sang Đang giao
            </button>
            <button
              className="btn btn-sm btn-success fw-semibold rounded-pill px-3"
              onClick={() => handleBatchUpdate("completed")}
            >
              ✅ Hoàn thành hàng loạt
            </button>
          </div>
        </div>
      )}

      {/* Bảng danh sách đơn hàng */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-dark text-uppercase small" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
              <tr>
                <th className="py-3 ps-4" style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleSelectAll}
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                  />
                </th>
                <th className="py-3">Mã đơn</th>
                <th className="py-3">Khách hàng</th>
                <th className="py-3">Sản phẩm</th>
                <th className="py-3">Tổng tiền</th>
                {showDeadline && <th className="py-3">Hạn xử lý</th>}
                <th className="py-3">Trạng thái</th>
                <th className="py-3 text-end px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const allowedOptions = getAllowedOptions(order.status || "pending");
                  const isSelected = selectedOrderIds.includes(order._id);

                  return (
                    <tr key={order._id} className={isSelected ? "table-active" : ""}>
                      <td className="ps-4 py-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isSelected}
                          onChange={() => handleSelectOne(order._id)}
                        />
                      </td>

                      <td className="py-3">
                        <div className="fw-bold text-dark text-uppercase">
                          #{order._id?.slice(-6)}
                        </div>
                        <small className="text-muted">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "---"}
                        </small>
                      </td>

                      <td className="py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="customer-avatar bg-light border rounded-circle d-flex align-items-center justify-content-center text-secondary fw-bold" style={{ width: "35px", height: "35px", fontSize: "0.9rem" }}>
                            {order.name?.charAt(0).toUpperCase() || "K"}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{order.name}</div>
                            <small className="text-muted d-block">{order.phone}</small>
                            {order.email && <small className="text-muted">{order.email}</small>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3" style={{ maxWidth: "220px" }}>
                        <div className="product-list" style={{ maxHeight: "75px", overflowY: "auto" }}>
                          {order.order_items?.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-truncate" style={{ fontSize: "0.85rem" }}>
                              {item.name}
                              <span className="fw-bold ms-1">×{item.quantity}</span>
                            </div>
                          ))}
                          {order.order_items?.length > 2 && (
                            <small className="text-primary fw-medium">
                              +{order.order_items.length - 2} sản phẩm khác
                            </small>
                          )}
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="fw-bold text-danger" style={{ fontSize: "0.95rem" }}>
                          {(order.final_total || order.total || 0).toLocaleString("vi-VN")}đ
                        </div>
                        <span className={`badge mt-1 ${order.paymentMethod === "vnpay" ? "bg-primary bg-opacity-10 text-primary" : "bg-secondary bg-opacity-10 text-secondary"}`} style={{ fontSize: "0.7rem" }}>
                          {order.paymentMethod === "cod" ? "COD" : "VNPay"}
                        </span>
                      </td>

                      {showDeadline && (
                        <td className="py-3">
                          <span className="text-secondary fw-medium" style={{ fontSize: "0.85rem" }}>
                            {renderDeadline(order)}
                          </span>
                        </td>
                      )}

                      <td className="py-3">
                        <select
                          className={`form-select form-select-sm fw-semibold shadow-sm border ${statusBadges[order.status]?.class || ""}`}
                          style={{ width: "140px", fontSize: "0.82rem" }}
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusChangeClick(order._id, order.status, e.target.value)}
                        >
                          {allowedOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white text-dark fw-normal">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="text-end px-4 py-3">
                        <Link
                          href={`/admin/order/${order._id}`}
                          className="btn btn-outline-dark btn-sm px-3 rounded-pill fw-semibold shadow-sm"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={showDeadline ? "8" : "7"} className="text-center py-5 text-muted">
                    Không tìm thấy đơn hàng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
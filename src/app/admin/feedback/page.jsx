"use client";
import { useEffect, useState } from "react";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reply, setReply] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState([]);

  // Trạng thái thông báo inline
  const [messageBar, setMessageBar] = useState({
    visible: false,
    text: "",
    type: "danger" // 'danger', 'warning', 'success'
  });

  const showMessage = (text, type = "danger") => {
    setMessageBar({ visible: true, text, type });
    setTimeout(() => setMessageBar({ visible: false, text: "", type: "danger" }), 4000);
  };

  // Tải dữ liệu từ database qua API
  const loadFeedback = async () => {
    try {
      const res = await fetch("/api/feedback", {
        cache: "no-store",
      });
      const json = await res.json();
      
      // Hỗ trợ linh hoạt cả 2 kiểu trả về của API: dạng mảng hoặc dạng object chứa mảng data/feedbacks
      let listData = [];
      if (Array.isArray(json)) {
        listData = json;
      } else if (json && Array.isArray(json.data)) {
        listData = json.data;
      } else if (json && Array.isArray(json.feedbacks)) {
        listData = json.feedbacks;
      }

      setFeedbacks(
        listData.sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )
      );
    } catch (error) {
      console.error(error);
      showMessage("Không thể tải danh sách feedback từ database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  // Thay đổi trạng thái
  const changeStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok || data.success) {
        setFeedbacks(prev =>
          prev.map(item =>
            (item._id === id || item.id === id) ? { ...item, status } : item
          )
        );
      } else {
        showMessage(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error(error);
      showMessage("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  // Xóa feedback
  const deleteFeedback = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa feedback này?")) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok || data.success) {
        setFeedbacks(prev => prev.filter(item => (item._id !== id && item.id !== id)));
        showMessage("Đã xóa feedback thành công!", "success");
      } else {
        showMessage(data.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error(error);
      showMessage("Có lỗi xảy ra khi xóa");
    }
  };

  // Gửi phản hồi
  const sendReply = async () => {
    if (!reply.trim()) {
      showMessage("Vui lòng nhập nội dung phản hồi", "warning");
      return;
    }
    const targetId = selectedFeedback._id || selectedFeedback.id;
    try {
      const res = await fetch(`/api/feedback/${targetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reply, status: "done" }),
      });
      const data = await res.json();
      if (res.ok || data.success) {
        showMessage("Đã gửi phản hồi thành công!", "success");
        setReply("");
        setSelectedFeedback(null);
        loadFeedback();
      } else {
        showMessage(data.message || "Gửi phản hồi thất bại");
      }
    } catch (error) {
      console.error(error);
      showMessage("Có lỗi xảy ra khi gửi phản hồi");
    }
  };

  // Xem chi tiết và tự chuyển sang trạng thái đã đọc
  const handleView = async (item) => {
    setSelectedFeedback(item);
    setReply(item.reply || "");
    
    const currentStatus = item.status || "unread";
    const itemId = item._id || item.id;
    if (currentStatus === "unread" || currentStatus === "pending") {
      await changeStatus(itemId, "read");
    }
  };

  // Thống kê
  const totalFeedback = feedbacks.length;
  const unreadCount = feedbacks.filter(
    i => !i.status || i.status === "unread" || i.status === "pending"
  ).length;
  const readCount = feedbacks.filter(i => i.status === "read").length;
  const doneCount = feedbacks.filter(i => i.status === "done").length;

  // Lọc dữ liệu
  const filteredFeedback = feedbacks.filter(item => {
    const key = search.toLowerCase();
    const matchesSearch =
      item.name?.toLowerCase().includes(key) ||
      item.email?.toLowerCase().includes(key) ||
      item.subject?.toLowerCase().includes(key) ||
      item.message?.toLowerCase().includes(key);

    const currentStatus = item.status || "unread";
    if (statusFilter === "unread") {
      return matchesSearch && (currentStatus === "unread" || currentStatus === "pending");
    }
    if (statusFilter === "read") return matchesSearch && currentStatus === "read";
    if (statusFilter === "done") return matchesSearch && currentStatus === "done";
    
    return matchesSearch;
  });

  // Chọn hàng loạt
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFeedbackIds(filteredFeedback.map(item => item._id || item.id));
    } else {
      setSelectedFeedbackIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedFeedbackIds.includes(id)) {
      setSelectedFeedbackIds(selectedFeedbackIds.filter(item => item !== id));
    } else {
      setSelectedFeedbackIds([...selectedFeedbackIds, id]);
    }
  };

  // Thao tác hàng loạt
  const handleBatchAction = async (actionType) => {
    if (selectedFeedbackIds.length === 0) {
      showMessage("Vui lòng chọn ít nhất một feedback!", "warning");
      return;
    }

    if (actionType === "delete" && !confirm(`Bạn có chắc muốn xóa ${selectedFeedbackIds.length} feedback đã chọn?`)) return;

    try {
      let successCount = 0;
      for (const id of selectedFeedbackIds) {
        if (actionType === "delete") {
          const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
          if (res.ok) successCount++;
        } else {
          const res = await fetch(`/api/feedback/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: actionType }),
          });
          if (res.ok) successCount++;
        }
      }
      showMessage(`Đã thao tác thành công ${successCount}/${selectedFeedbackIds.length} feedback!`, "success");
      setSelectedFeedbackIds([]);
      loadFeedback();
    } catch (error) {
      console.error(error);
      showMessage("Có lỗi xảy ra khi thao tác hàng loạt!");
      loadFeedback();
    }
  };

  // Xuất file CSV
  const exportToCSV = () => {
    if (filteredFeedback.length === 0) {
      showMessage("Không có dữ liệu để xuất file!", "warning");
      return;
    }

    const headers = ["Người gửi", "Email", "Chủ đề", "Nội dung", "Trạng thái", "Ngày gửi"];
    const rows = filteredFeedback.map(i => [
      `"${i.name || ""}"`,
      `"${i.email || ""}"`,
      `"${i.subject || ""}"`,
      `"${(i.message || "").replace(/"/g, '""')}"`,
      i.status || "unread",
      i.createdAt ? new Date(i.createdAt).toLocaleDateString("vi-VN") : ""
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_feedback_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage("Xuất file CSV thành công!", "success");
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
      {messageBar.visible && (
        <div className={`alert alert-${messageBar.type} py-2 px-3 rounded-3 shadow-sm d-flex align-items-center mb-4`} role="alert">
          <span className="fw-medium" style={{ fontSize: "0.9rem" }}>{messageBar.text}</span>
          <button type="button" className="btn-close ms-auto" style={{ fontSize: "0.75rem" }} onClick={() => setMessageBar({ visible: false, text: "", type: "danger" })}></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "1.75rem" }}>
            📩 Quản lý Feedback
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            Xem, quản lý, phản hồi và thao tác hàng loạt ý kiến đóng góp từ khách hàng.
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

      {/* Thống kê */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-dark border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-secondary small fw-semibold mb-1">Tổng feedback</div>
            <div className="fs-3 fw-bold">{totalFeedback}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-dark border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-secondary small fw-semibold mb-1">Chưa đọc</div>
            <div className="fs-3 fw-bold text-warning">{unreadCount}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-dark border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-secondary small fw-semibold mb-1">Đã đọc</div>
            <div className="fs-3 fw-bold text-success">{readCount}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-dark border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-secondary small fw-semibold mb-1">Đã trả lời</div>
            <div className="fs-3 fw-bold text-primary">{doneCount}</div>
          </div>
        </div>
      </div>

      {/* Tìm kiếm & Lọc */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-7">
            <label className="form-label small text-muted fw-semibold">Tìm kiếm</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Tìm theo tên, email, chủ đề, nội dung..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-5">
            <label className="form-label small text-muted fw-semibold">Trạng thái</label>
            <select
              className="form-select rounded-3"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unread">Chưa đọc</option>
              <option value="read">Đã đọc</option>
              <option value="done">Đã trả lời</option>
            </select>
          </div>
        </div>
      </div>

      {/* Thao tác hàng loạt */}
      {selectedFeedbackIds.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-dark text-white d-flex flex-row align-items-center justify-content-between">
          <div className="fw-semibold ms-2">
            Đã chọn <span className="badge bg-light text-dark px-2 py-1">{selectedFeedbackIds.length}</span> feedback
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-success fw-semibold rounded-pill px-3" onClick={() => handleBatchAction("read")}>
              ✓ Đánh dấu đã đọc
            </button>
            <button className="btn btn-sm btn-primary fw-semibold rounded-pill px-3" onClick={() => handleBatchAction("done")}>
              ✉ Đánh dấu đã trả lời
            </button>
            <button className="btn btn-sm btn-danger fw-semibold rounded-pill px-3" onClick={() => handleBatchAction("delete")}>
              🗑 Xóa hàng loạt
            </button>
          </div>
        </div>
      )}

      {/* Bảng dữ liệu */}
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
                    checked={filteredFeedback.length > 0 && selectedFeedbackIds.length === filteredFeedback.length}
                  />
                </th>
                <th className="py-3">Khách hàng</th>
                <th className="py-3">Email</th>
                <th className="py-3">Chủ đề</th>
                <th className="py-3">Nội dung</th>
                <th className="py-3">Ngày gửi</th>
                <th className="py-3">Trạng thái</th>
                <th className="py-3 text-end px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedback.length > 0 ? (
                filteredFeedback.map((item) => {
                  const itemId = item._id || item.id;
                  const isSelected = selectedFeedbackIds.includes(itemId);
                  return (
                    <tr key={itemId} className={isSelected ? "table-active" : ""}>
                      <td className="ps-4 py-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isSelected}
                          onChange={() => handleSelectOne(itemId)}
                        />
                      </td>
                      <td className="py-3">
                        <div className="fw-bold text-dark">{item.name}</div>
                      </td>
                      <td className="py-3 text-muted" style={{ fontSize: "0.9rem" }}>{item.email}</td>
                      <td className="py-3 fw-medium">{item.subject}</td>
                      <td className="py-3">
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold shadow-sm"
                          style={{ fontSize: "0.8rem" }}
                          onClick={() => handleView(item)}
                        >
                          Xem
                        </button>
                      </td>
                      <td className="py-3 text-muted small">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : ""}
                      </td>
                      <td className="py-3">
                        {item.status === "read" ? (
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "0.75rem" }}>
                            Đã đọc
                          </span>
                        ) : item.status === "done" ? (
                          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "0.75rem" }}>
                            Đã trả lời
                          </span>
                        ) : (
                          <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill fw-semibold text-dark" style={{ fontSize: "0.75rem" }}>
                            Chưa đọc
                          </span>
                        )}
                      </td>
                      <td className="text-end px-4 py-3">
                        <button
                          className="btn btn-success btn-sm me-1 rounded-circle"
                          style={{ width: "32px", height: "32px" }}
                          title="Đánh dấu đã đọc"
                          onClick={() => changeStatus(itemId, "read")}
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-primary btn-sm me-1 rounded-circle"
                          style={{ width: "32px", height: "32px" }}
                          title="Trả lời"
                          onClick={() => handleView(item)}
                        >
                          ✉
                        </button>
                        <button
                          className="btn btn-danger btn-sm rounded-circle"
                          style={{ width: "32px", height: "32px" }}
                          title="Xóa"
                          onClick={() => deleteFeedback(itemId)}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Không tìm thấy feedback phù hợp trong database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedFeedback && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Chi tiết Feedback khách hàng</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedFeedback(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3 bg-light p-3 rounded-3 mx-0">
                  <div className="col-md-6">
                    <p className="mb-1"><b>Người gửi:</b> {selectedFeedback.name}</p>
                    <p className="mb-1"><b>Email:</b> {selectedFeedback.email}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><b>Chủ đề:</b> {selectedFeedback.subject}</p>
                    <p className="mb-1"><b>Ngày gửi:</b> {selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString("vi-VN") : ""}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Nội dung khách gửi:</label>
                  <div className="p-3 border rounded-3 bg-white" style={{ whiteSpace: "pre-line", minHeight: "80px" }}>
                    {selectedFeedback.message}
                  </div>
                </div>

                <div className="mb-0">
                  <label className="form-label small fw-semibold text-dark">Nội dung phản hồi (Gửi tới khách hàng):</label>
                  <textarea
                    className="form-control rounded-3"
                    rows="4"
                    placeholder="Nhập nội dung trả lời..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary rounded-3 px-4" onClick={() => setSelectedFeedback(null)}>
                  Đóng
                </button>
                <button type="button" className="btn btn-primary rounded-3 px-4" onClick={sendReply}>
                  Gửi phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
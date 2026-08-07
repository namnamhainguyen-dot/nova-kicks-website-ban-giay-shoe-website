"use client";

import { useState, useEffect } from "react";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "visible", "hidden"

  // Tải danh sách bình luận từ API
  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      if (res.ok) {
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Hàm ẩn / hiện bình luận đã được bóc tách và chuẩn hóa ID an toàn
  const handleToggleHide = async (commentItem) => {
    try {
      const id = typeof commentItem === "object" ? (commentItem._id || commentItem.id) : commentItem;
      
      if (!id || typeof id !== "string" || id.length !== 24) {
        alert("ID bình luận không hợp lệ!");
        return;
      }

      const res = await fetch(`/api/comments/${id}`, { method: "PUT" });
      const data = await res.json();

      if (res.ok) {
        setComments((prev) =>
          prev.map((item) => {
            const itemId = item._id || item.id;
            return itemId === id ? { ...item, isHidden: data.comment.isHidden } : item;
          })
        );
      } else {
        alert(data.error || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  // Tính toán số liệu thống kê
  const totalComments = comments.length;
  const visibleCommentsCount = comments.filter((c) => !c.isHidden).length;
  const hiddenCommentsCount = comments.filter((c) => c.isHidden).length;

  // Lọc dữ liệu theo từ khóa tìm kiếm và trạng thái
  const filteredComments = comments.filter((item) => {
    const content = (item.content || item.comment || "").toLowerCase();
    const userName = (item.userName || item.userId?.fullname || item.name || "").toLowerCase();
    const productName = (item.productId?.name || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      content.includes(query) || userName.includes(query) || productName.includes(query);

    if (statusFilter === "visible") return matchesSearch && !item.isHidden;
    if (statusFilter === "hidden") return matchesSearch && item.isHidden;
    return matchesSearch;
  });

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
    <div className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "inherit" }}>
      {/* Tiêu đề trang */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "1.75rem", letterSpacing: "-0.5px" }}>
            Quản lý bình luận
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            Theo dõi nội dung, kiểm duyệt tương tác và ẩn các bình luận không phù hợp.
          </p>
        </div>
      </div>

      {/* Thẻ thống kê tổng quan (Đồng bộ kiểu dáng màu trắng, bo tròn 4, shadow-sm) */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-white border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-muted small fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              Tổng bình luận
            </div>
            <div className="fs-3 fw-bold text-dark">{totalComments}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-white border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-muted small fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              Đang hiển thị
            </div>
            <div className="fs-3 fw-bold text-success">{visibleCommentsCount}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-white border-0 p-3 rounded-4 shadow-sm">
            <div className="text-uppercase text-muted small fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              Đã ẩn
            </div>
            <div className="fs-3 fw-bold text-danger">{hiddenCommentsCount}</div>
          </div>
        </div>
      </div>

      {/* Thanh công cụ lọc & tìm kiếm */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-8">
            <label className="form-label small text-muted fw-semibold">Tìm theo tên</label>
            <input
              type="text"
              className="form-control rounded-3 py-2"
              placeholder="Nhập tên người dùng, nội dung, sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: "0.9rem" }}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted fw-semibold">Trạng thái</label>
            <select
              className="form-select rounded-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: "0.9rem" }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="visible">Đang hiển thị</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng danh sách bình luận */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light text-uppercase text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
              <tr>
                <th className="py-3 px-4 fw-semibold text-secondary">Người dùng</th>
                <th className="py-3 fw-semibold text-secondary">Nội dung đánh giá</th>
                <th className="py-3 fw-semibold text-secondary">Sản phẩm</th>
                <th className="py-3 fw-semibold text-secondary">Ngày đăng</th>
                <th className="py-3 fw-semibold text-secondary">Trạng thái</th>
                <th className="py-3 text-end px-4 fw-semibold text-secondary">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length > 0 ? (
                filteredComments.map((item) => (
                  <tr
                    key={item._id || item.id}
                    className={item.isHidden ? "table-light text-muted opacity-75" : ""}
                  >
                    <td className="px-4 py-3">
                      <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                        {item.userName || item.userId?.fullname || item.name || "Khách vãng lai"}
                      </div>
                      <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {item.userId?.email || item.email || "Không có email"}
                      </small>
                    </td>
                    <td className="py-3" style={{ maxWidth: "320px" }}>
                      <p className="mb-0 text-break text-dark" style={{ fontSize: "0.9rem" }}>
                        {item.content || item.comment}
                      </p>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        {item.productId?.image && (
                          <img
                            src={item.productId.image}
                            alt=""
                            style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px" }}
                          />
                        )}
                        <span className="small fw-semibold text-dark text-truncate" style={{ maxWidth: "160px" }}>
                          {item.productId?.name || "Sản phẩm đã xóa"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-muted small">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                    </td>
                    <td className="py-3">
                      {item.isHidden ? (
                        <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Đã ẩn
                        </span>
                      ) : (
                        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Hiển thị
                        </span>
                      )}
                    </td>
                    <td className="text-end px-4 py-3">
                      <button
                        className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-semibold shadow-sm"
                        style={{ fontSize: "0.8rem" }}
                        onClick={() => handleToggleHide(item)}
                      >
                        {item.isHidden ? "Hiện lại" : "Ẩn"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    Không tìm thấy đánh giá phù hợp.
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
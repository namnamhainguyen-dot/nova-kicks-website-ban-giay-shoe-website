"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Lấy danh sách Voucher từ API
  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/vouchers");
      const data = await res.json();
      if (Array.isArray(data)) {
        setVouchers(data);
      } else if (data.vouchers && Array.isArray(data.vouchers)) {
        setVouchers(data.vouchers);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // 2. Thay đổi trạng thái kích hoạt (is_active) - Optimistic UI cho trải nghiệm mượt hơn
  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = !currentStatus;

    // Cập nhật giao diện ngay lập tức
    setVouchers((prev) =>
      prev.map((v) => (v._id === id ? { ...v, is_active: nextStatus } : v))
    );

    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextStatus }),
      });

      // Nếu API lỗi thì rollback lại trạng thái cũ
      if (!res.ok) {
        setVouchers((prev) =>
          prev.map((v) => (v._id === id ? { ...v, is_active: currentStatus } : v))
        );
        alert("Không thể cập nhật trạng thái voucher.");
      }
    } catch (error) {
      setVouchers((prev) =>
        prev.map((v) => (v._id === id ? { ...v, is_active: currentStatus } : v))
      );
      alert("Không thể cập nhật trạng thái voucher.");
    }
  };

  // 3. Tìm kiếm Voucher an toàn (Không crash nếu null/undefined)
  const filteredVouchers = vouchers.filter((v) => {
    const code = v.code ? v.code.toLowerCase() : "";
    const description = v.description ? v.description.toLowerCase() : "";
    const term = searchTerm.toLowerCase();

    return code.includes(term) || description.includes(term);
  });

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-secondary" role="status"></div>
        <p className="mt-2 text-muted">Đang tải dữ liệu voucher...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header & Công cụ */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h3 className="fw-bold mb-1">Quản lý Voucher</h3>
          <p className="text-muted small">Theo dõi trạng thái và thời gian hiệu lực các mã giảm giá của cửa hàng.</p>
        </div>
        <div className="col-md-6 text-md-end">
          <Link href="/admin/voucher/add" className="btn btn-dark shadow-sm">
            <i className="bi bi-plus-lg me-2"></i>Thêm mã giảm giá mới
          </Link>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Tìm theo mã hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu Admin */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Mã Voucher</th>
                <th>Mức Giảm Giá</th>
                <th>Đơn Tối Thiểu</th>
                <th>Đã dùng / Giới hạn</th>
                <th>Thời Gian Hiệu Lực</th>
                <th>Trạng Thái Hiện Thị</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    Chưa có mã giảm giá nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  const now = new Date();
                  
                  // Kiểm tra ngày bắt đầu & hết hạn
                  const startDateKey = v.start_date || v.startDate;
                  const endDateKey = v.end_date || v.endDate || v.expiry_date;

                  const isNotStarted = startDateKey ? new Date(startDateKey) > now : false;
                  const isExpired = endDateKey ? new Date(endDateKey) < now : false;

                  // Bắt fallback dữ liệu đa dạng (snake_case + camelCase)
                  const usedCount = Number(v.used_count ?? v.usedCount ?? 0);
                  const usageLimit = Number(v.usage_limit ?? v.usageLimit ?? 0);
                  const isFull = usageLimit > 0 && usedCount >= usageLimit;

                  return (
                    <tr key={v._id}>
                      {/* Cột Mã Voucher + Mô tả */}
                      <td className="ps-4">
                        <span className="badge bg-light text-dark border px-3 py-2 font-monospace fw-bold fs-6">
                          {v.code}
                        </span>
                        <div className="text-muted small mt-1 text-truncate" style={{ maxWidth: "250px" }}>
                          {v.description || "Chưa có mô tả"}
                        </div>
                      </td>

                      {/* Cột Mức Giảm */}
                      <td>
                        <span className="fw-bold text-dark">
                          {v.discount_type === "fixed"
                            ? `${Number(v.discount_value || 0).toLocaleString("vi-VN")} đ`
                            : `${v.discount_value}%`}
                        </span>
                        {v.discount_type === "percentage" && v.max_discount_amount && (
                          <div className="small text-muted">
                            (Tối đa: {Number(v.max_discount_amount).toLocaleString("vi-VN")}đ)
                          </div>
                        )}
                      </td>

                      {/* Cột Đơn Tối Thiểu */}
                      <td>
                        <span className="text-secondary small">
                          {v.min_order_value ? `${Number(v.min_order_value).toLocaleString("vi-VN")} đ` : "0 đ"}
                        </span>
                      </td>

                      {/* Cột Đã dùng / Giới hạn */}
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <span className={`fw-bold ${isFull ? "text-danger" : "text-dark"}`}>
                            {usedCount}
                          </span>
                          <span className="text-muted">/</span>
                          <span className="text-muted">
                            {usageLimit > 0 ? usageLimit : "∞"}
                          </span>
                        </div>
                        {isFull && (
                          <span className="badge bg-danger-subtle text-danger mt-1" style={{ fontSize: "10px" }}>
                            Hết lượt
                          </span>
                        )}
                      </td>

                      {/* Cột Thời Gian Hiệu Lực */}
                      <td>
                        <div className="small text-dark">
                          <div>Từ: {startDateKey ? new Date(startDateKey).toLocaleDateString("vi-VN") : "Không giới hạn"}</div>
                          <div>Đến: {endDateKey ? new Date(endDateKey).toLocaleDateString("vi-VN") : "Không giới hạn"}</div>
                        </div>
                        {isNotStarted && (
                          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 mt-1" style={{ fontSize: "10px" }}>
                            Chưa kích hoạt (Chưa tới hạn)
                          </span>
                        )}
                        {isExpired && (
                          <span className="badge bg-danger-subtle text-danger px-2 py-1 mt-1" style={{ fontSize: "10px" }}>
                            Đã hết hạn
                          </span>
                        )}
                        {!isNotStarted && !isExpired && (
                          <span className="badge bg-success-subtle text-success px-2 py-1 mt-1" style={{ fontSize: "10px" }}>
                            Đang hoạt động
                          </span>
                        )}
                      </td>

                      {/* Cột Switch Trạng Thái (is_active) */}
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input cursor-pointer"
                            type="checkbox"
                            role="switch"
                            id={`switch-${v._id}`}
                            checked={Boolean(v.is_active)}
                            onChange={() => toggleStatus(v._id, v.is_active)}
                          />
                          <label
                            className={`form-check-label small ms-1 ${v.is_active ? "text-success" : "text-danger"}`}
                            htmlFor={`switch-${v._id}`}
                          >
                            {v.is_active ? "Bật" : "Tắt"}
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
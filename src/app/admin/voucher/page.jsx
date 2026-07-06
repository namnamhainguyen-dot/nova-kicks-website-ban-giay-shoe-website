"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Lấy danh sách Voucher từ API
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await fetch("/api/vouchers");
        const data = await res.json();
        setVouchers(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách voucher:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  // 2. Xóa Voucher
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) return;

    try {
      const res = await fetch(`/api/vouchers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVouchers(vouchers.filter((v) => v._id !== id));
        alert("Đã xóa voucher thành công!");
      }
    } catch (error) {
      alert("Lỗi khi xóa voucher.");
    }
  };

  // 3. Thay đổi trạng thái kích hoạt (is_active) nhanh bằng Switch
  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (res.ok) {
        setVouchers(
          vouchers.map((v) =>
            v._id === id ? { ...v, is_active: !currentStatus } : v
          )
        );
      }
    } catch (error) {
      alert("Không thể cập nhật trạng thái voucher.");
    }
  };

  // 4. Tìm kiếm Voucher theo Code hoặc Mô tả
  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-muted small">Xem, thêm, sửa và theo dõi trạng thái các mã giảm giá của cửa hàng.</p>
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
                <th>Ngày Hết Hạn</th>
                <th>Trạng Thái</th>
                {/* <th className="text-end pe-4">Hành Động</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">Chưa có mã giảm giá nào được tạo.</td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  const isExpired = new Date(v.expiry_date) < new Date();
                  
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
                            ? `${v.discount_value.toLocaleString("vi-VN")} đ`
                            : `${v.discount_value}%`}
                        </span>
                        {v.discount_type === "percentage" && v.max_discount_amount && (
                          <div className="small text-muted">
                            (Tối đa: {v.max_discount_amount.toLocaleString("vi-VN")}đ)
                          </div>
                        )}
                      </td>

                      {/* Cột Đơn Tối Thiểu */}
                      <td>
                        <span className="text-secondary small">
                          {v.min_order_value ? `${v.min_order_value.toLocaleString("vi-VN")} đ` : "0 đ"}
                        </span>
                      </td>

                      {/* Cột Số Lần Sử Dụng */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold">{v.used_count ?? 0}</span>
                          <span className="text-muted">/</span>
                          <span className="text-muted">{v.usage_limit}</span>
                        </div>
                      </td>

                      {/* Cột Ngày Hết Hạn */}
                      <td>
                        <span className={`small ${isExpired ? "text-danger fw-bold" : "text-dark"}`}>
                          {new Date(v.expiry_date).toLocaleDateString("vi-VN")}
                        </span>
                        {isExpired && (
                          <span className="badge bg-danger-subtle text-danger ms-1 px-2 py-1 small" style={{ fontSize: "10px" }}>
                            Hết hạn
                          </span>
                        )}
                      </td>

                      {/* Cột Switch Trạng Thái */}
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input cursor-pointer"
                            type="checkbox"
                            role="switch"
                            id={`switch-${v._id}`}
                            checked={v.is_active}
                            onChange={() => toggleStatus(v._id, v.is_active)}
                          />
                          <label 
                            className={`form-check-label small ms-1 ${v.is_active ? "text-success" : "text-danger"}`} 
                            htmlFor={`switch-${v._id}`}
                          >
                            {v.is_active ? "Kích hoạt" : "Tạm ẩn"}
                          </label>
                        </div>
                      </td>

                      {/* Cột Hành Động
                      <td className="text-end pe-4">
                        <Link
                          href={`/admin/voucher/edit/${v._id}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          <i className="bi bi-pencil"></i> Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <i className="bi bi-trash"></i> Xóa
                        </button>
                      </td> */}
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
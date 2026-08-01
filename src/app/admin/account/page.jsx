"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Lấy danh sách tài khoản từ MongoDB qua API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        const data = await res.json();
        setAccounts(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tài khoản:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  // 2. Thay đổi nhanh trạng thái (Hoạt động / Bị cấm)
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAccounts(
          accounts.map((acc) =>
            acc._id === id ? { ...acc, status: newStatus } : acc
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  // 3. Hàm tạo Mã nhân viên tự động hiển thị nếu trong DB chưa có
  const getEmployeeCode = (acc) => {
    if (acc.code) return acc.code;
    if (acc.id && acc.id !== "N/A") return acc.id;
    // Tự động tạo mã dựa trên 6 ký tự cuối của MongoDB _id
    if (acc._id) {
      return `NV-${acc._id.slice(-6).toUpperCase()}`;
    }
    return "NV-0001";
  };

  // 4. Tìm kiếm tài khoản theo tên hoặc email
  const filteredAccounts = accounts.filter((acc) =>
    acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản lý Tài khoản</h4>
          <p className="text-secondary small mb-0">Danh sách thành viên và phân quyền hệ thống</p>
        </div>
        <Link href="/admin/account/add" className="btn btn-dark text-white font-medium">
          + Thêm tài khoản mới
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
          <div className="row align-items-center">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-sm bg-light border-0 px-3 py-2 rounded-3"
                placeholder="Tìm kiếm tài khoản, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-sm">
            <thead className="table-light text-secondary small uppercase fw-bold border-bottom">
              <tr>
                <th className="ps-4">Thành viên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th className="text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-secondary">
                    Đang tải danh sách tài khoản...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-secondary">
                    Không tìm thấy tài khoản nào.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={acc.avatar || "https://i.pravatar.cc/80?img=32"}
                          alt={acc.name}
                          className="rounded-circle"
                          style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        />
                        <div>
                          <div className="fw-semibold text-dark">{acc.name}</div>
                          {/* Mã nhân viên được tự động sinh và hiển thị chuẩn đẹp */}
                          <div className="text-muted small">
                            Mã: <span className="fw-medium text-primary">{getEmployeeCode(acc)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-secondary">{acc.email}</td>
                    <td>
                      <span className={`badge px-2 py-1.5 rounded-2 ${acc.role === "ADMIN" || acc.role === "admin" ? "bg-dark" : "bg-light text-dark border"}`}>
                        {acc.role}
                      </span>
                    </td>
                    <td>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input cursor-pointer"
                          type="checkbox"
                          role="switch"
                          id={`switch-${acc._id}`}
                          checked={acc.status === "active"}
                          onChange={() => toggleStatus(acc._id, acc.status)}
                        />
                        <label className={`form-check-label small ms-1 ${acc.status === "active" ? "text-success" : "text-danger"}`} htmlFor={`switch-${acc._id}`}>
                          {acc.status === "active" ? "Hoạt động" : "Bị khóa"}
                        </label>
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <Link
                        href={`/admin/account/edit/${acc._id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="bi bi-pencil"></i> Sửa
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
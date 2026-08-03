"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm lấy ID an toàn
  const getAccountId = (user) => {
    if (!user?._id) return "";
    return typeof user._id === "object" && user._id.$oid
      ? user._id.$oid
      : String(user._id);
  };

  // Hàm lấy Tên an toàn
  const getDisplayName = (user) => {
    if (user.fullname) return user.fullname;
    if (user.name) return user.name;
    if (user.email) return user.email.split("@")[0];
    return "Người dùng";
  };

  // 1. Lấy danh sách từ /api/accounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/accounts");
        
        // Tránh lỗi "Unexpected token '<'" bằng cách kiểm tra res.ok trước
        if (!res.ok) {
          console.error("API trả về lỗi HTTP:", res.status);
          setUsers([]);
          return;
        }

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi parse JSON hoặc mất mạng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. Xóa tài khoản
  const handleDelete = async (user) => {
    const id = getAccountId(user);
    if (!id) return alert("Không tìm thấy ID!");
    if (!confirm(`Bạn chắc chắn muốn xóa "${getDisplayName(user)}"?`)) return;

    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => getAccountId(u) !== id));
        alert("Đã xóa thành công!");
      } else {
        alert("Xóa thất bại!");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  // 3. Đổi trạng thái
  const toggleStatus = async (user) => {
    const id = getAccountId(user);
    if (!id) return;

    const currentStatus = user.status === "Hoạt động" || user.status === "active";
    const newStatus = currentStatus ? "Bị cấm" : "Hoạt động";

    // Cập nhật giao diện trước (Optimistic Update)
    setUsers((prev) =>
      prev.map((u) => (getAccountId(u) === id ? { ...u, status: newStatus } : u))
    );

    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status: newStatus }),
      });

      if (!res.ok) {
        // Trả lại trạng thái cũ nếu server lỗi
        setUsers((prev) =>
          prev.map((u) => (getAccountId(u) === id ? { ...u, status: user.status } : u))
        );
        alert("Không thể cập nhật trạng thái!");
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    }
  };

  const filteredUsers = users.filter((user) => {
    const name = getDisplayName(user).toLowerCase();
    const email = (user.email || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Quản lý Người dùng</h3>
          <p className="text-muted small mb-0">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        <Link href="/admin/user/add" className="btn btn-dark px-4 py-2 rounded-3 shadow-sm">
          <i className="bi bi-plus-lg me-1"></i> Thêm người dùng
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-3">
          <div className="mb-4 px-2">
            <input
              type="text"
              className="form-control bg-light border-0 py-2 px-3"
              style={{ maxWidth: "350px" }}
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 ps-4">Người dùng</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Vai trò</th>
                  <th className="py-3">Trạng thái</th>
                  <th className="py-3 text-end pe-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      Đang tải danh sách tài khoản...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      Không tìm thấy dữ liệu phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userId = getAccountId(user);
                    const name = getDisplayName(user);
                    const isActive = user.status === "Hoạt động" || user.status === "active";
                    const roleUpper = (user.role || "MEMBER").toUpperCase();

                    return (
                      <tr key={userId}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={
                                user.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                              }
                              alt={name}
                              className="rounded-circle shadow-sm"
                              width="40"
                              height="40"
                              style={{ objectFit: "cover" }}
                            />
                            <div>
                              <div className="fw-bold text-dark">{name}</div>
                              <small className="text-muted">ID: {userId.slice(-6)}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-secondary">{user.email || "—"}</td>
                        <td>
                          <span className={`badge px-3 py-2 ${roleUpper === "ADMIN" ? "bg-dark" : "bg-primary-subtle text-primary"}`}>
                            {roleUpper}
                          </span>
                        </td>
                        <td>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input cursor-pointer"
                              type="checkbox"
                              role="switch"
                              checked={isActive}
                              onChange={() => toggleStatus(user)}
                            />
                            <span className={`ms-1 small ${isActive ? "text-success" : "text-danger"}`}>
                              {isActive ? "Hoạt động" : "Bị cấm"}
                            </span>
                          </div>
                        </td>
                        <td className="text-end pe-4">
                          <Link href={`/admin/user/edit/${userId}`} className="btn btn-sm btn-outline-secondary me-2">
                            Sửa
                          </Link>
                          <button onClick={() => handleDelete(user)} className="btn btn-sm btn-outline-danger">
                            Xóa
                          </button>
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
    </div>
  );
}
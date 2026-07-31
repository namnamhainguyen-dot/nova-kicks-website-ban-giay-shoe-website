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
    if (user?.fullname) return user.fullname;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "Người dùng";
  };

  // Check trạng thái hoạt động (khớp với "active", "hoạt động", true, "1")
  const isUserActive = (status) => {
    if (typeof status === "boolean") return status;
    const s = String(status).toLowerCase();
    return s === "hoạt động" || s === "active" || s === "1";
  };

  // 1. Lấy danh sách từ /api/users
  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", { signal: controller.signal });

        if (!res.ok) {
          console.error("API trả về lỗi HTTP:", res.status);
          setUsers([]);
          return;
        }

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Lỗi fetch users:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, []);

  // 2. Đổi trạng thái Hoạt động / Bị cấm (Optimistic UI Update)
  const toggleStatus = async (user) => {
    const id = getAccountId(user);
    if (!id) return;

    const currentActive = isUserActive(user.status);

    let newStatus;
    if (typeof user.status === "boolean") {
      newStatus = !currentActive;
    } else if (user.status === "Hoạt động" || user.status === "Bị cấm") {
      newStatus = currentActive ? "Bị cấm" : "Hoạt động";
    } else {
      newStatus = currentActive ? "inactive" : "active";
    }

    // Optimistic UI Update
    setUsers((prev) =>
      prev.map((u) => (getAccountId(u) === id ? { ...u, status: newStatus } : u))
    );

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Revert nếu server báo lỗi
        setUsers((prev) =>
          prev.map((u) => (getAccountId(u) === id ? { ...u, status: user.status } : u))
        );
        alert("Không thể cập nhật trạng thái!");
      }
    } catch (error) {
      // Revert nếu lỗi mạng
      setUsers((prev) =>
        prev.map((u) => (getAccountId(u) === id ? { ...u, status: user.status } : u))
      );
      alert("Lỗi kết nối server!");
    }
  };

  // 3. Lọc dữ liệu theo từ khóa tìm kiếm
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
                  filteredUsers.map((user, index) => {
                    const userId = getAccountId(user);
                    const name = getDisplayName(user);
                    const active = isUserActive(user.status);
                    const roleUpper = (user.role || "MEMBER").toUpperCase();

                    return (
                      <tr key={userId || index}>
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
                              <small className="text-muted">
                                ID: {userId ? userId.slice(-6) : "N/A"}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="text-secondary">{user.email || "—"}</td>
                        <td>
                          <span
                            className={`badge px-3 py-2 ${
                              roleUpper === "ADMIN"
                                ? "bg-dark"
                                : "bg-primary-subtle text-primary"
                            }`}
                          >
                            {roleUpper}
                          </span>
                        </td>
                        <td>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input cursor-pointer"
                              type="checkbox"
                              role="switch"
                              checked={active}
                              onChange={() => toggleStatus(user)}
                            />
                            <span
                              className={`ms-1 small ${
                                active ? "text-success" : "text-danger"
                              }`}
                            >
                              {active ? "Hoạt động" : "Bị cấm"}
                            </span>
                          </div>
                        </td>
                        <td className="text-end pe-4">
                          <Link
                            href={`/admin/user/edit/${userId}`}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Sửa
                          </Link>
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
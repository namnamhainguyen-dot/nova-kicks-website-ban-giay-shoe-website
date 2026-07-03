"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) setUsers(users.filter((user) => user._id !== id));
    } catch (error) { alert("Lỗi khi xóa!"); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    // Optimistic Update
    setUsers(prev => prev.map(user => user._id === id ? {...user, status: newStatus} : user));
    
    try {
      await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      setUsers(prev => prev.map(user => user._id === id ? {...user, status: currentStatus} : user));
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Quản lý Người dùng</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small text-muted mb-0">
              <li className="breadcrumb-item">Admin</li>
              <li className="breadcrumb-item active text-dark fw-semibold">Người dùng</li>
            </ol>
          </nav>
        </div>
        <Link href="/admin/user/add" className="btn btn-dark px-4 py-2 rounded-3 shadow-sm">
          <i className="bi bi-plus-lg me-1"></i> Thêm người dùng
        </Link>
      </div>

      {/* Main Card */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-3">
          {/* Search Box */}
          <div className="mb-4 px-2">
            <div className="input-group input-group-lg bg-light rounded-3 border-0 overflow-hidden" style={{ maxWidth: "400px" }}>
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-secondary"></i></span>
              <input
                type="text"
                className="form-control bg-transparent border-0 shadow-none"
                placeholder="Tìm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                   Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan="5"><div className="placeholder-glow"><span className="placeholder col-12 rounded"></span></div></td></tr>)
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">Không tìm thấy người dùng nào.</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="rounded-circle" width="45" height="45" />
                          <div>
                            <div className="fw-bold text-dark">{user.name}</div>
                            <small className="text-muted">ID: {user._id.slice(-6)}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary">{user.email}</td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 ${user.role === "ADMIN" ? "bg-dark" : "bg-primary-subtle text-primary"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" checked={user.status === "active"} onChange={() => toggleStatus(user._id, user.status)} />
                        </div>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <Link href={`/admin/user/edit/${user._id}`} className="btn btn-sm btn-light text-primary border-0"> Sửa<i className="bi bi-pencil"></i></Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
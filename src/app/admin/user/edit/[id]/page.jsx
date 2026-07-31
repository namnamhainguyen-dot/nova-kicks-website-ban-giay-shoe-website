"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    status: "active",
    avatar: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error("Không tìm thấy người dùng");
        const data = await res.json();

        // Đảm bảo ép role về chuẩn "admin" hoặc "user"
        const rawRole = (data.role || "user").toLowerCase();
        const role = rawRole === "admin" ? "admin" : "user";

        setFormData({
          fullname: data.fullname || data.name || "",
          email: data.email || "",
          password: "",
          phone: data.phone || "",
          role: role,
          status: data.status || "active",
          avatar: data.avatar || "",
        });
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const updatePayload = { ...formData };
    if (!updatePayload.password) {
      delete updatePayload.password;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        alert("Cập nhật thông tin thành công!");
        router.push("/admin/user");
        router.refresh();
      } else {
        const errData = await res.json();
        alert(errData.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 min-vh-50">
        <div className="spinner-border text-dark me-2" role="status"></div>
        <span className="text-muted">Đang tải thông tin người dùng...</span>
      </div>
    );
  }

  const avatarSrc =
    formData.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.fullname || "User"
    )}&background=random`;

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Chỉnh sửa tài khoản</h3>
          <p className="text-muted small mb-0">Cập nhật thông tin chi tiết và phân quyền tài khoản</p>
        </div>
        <Link href="/admin/user" className="btn btn-outline-secondary px-3 py-2 rounded-3">
          <i className="bi bi-arrow-left me-1"></i> Quay lại
        </Link>
      </div>

      <div className="row g-4">
        {/* Cột trái: Preview Avatar & Thông tin nhanh */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4">
            <div className="card-body">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={avatarSrc}
                  alt={formData.fullname}
                  className="rounded-circle shadow border border-3 border-white"
                  width="120"
                  height="120"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <h5 className="fw-bold mb-1">{formData.fullname || "Tài khoản"}</h5>
              <p className="text-muted small mb-3">{formData.email}</p>

              <div className="d-flex justify-content-center gap-2">
                <span
                  className={`badge ${
                    formData.role.toLowerCase() === "admin"
                      ? "bg-dark text-white"
                      : "bg-primary-subtle text-primary"
                  } px-3 py-2 rounded-pill`}
                >
                  {formData.role.toLowerCase() === "admin" ? "ADMIN" : "USER"}
                </span>
                <span
                  className={`badge ${
                    formData.status === "active" || formData.status === "Hoạt động"
                      ? "bg-success-subtle text-success"
                      : "bg-danger-subtle text-danger"
                  } px-3 py-2 rounded-pill`}
                >
                  {formData.status === "active" || formData.status === "Hoạt động"
                    ? "Hoạt động"
                    : "Bị cấm"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Form chỉnh sửa */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Họ tên */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    className="form-control py-2"
                    placeholder="Nhập họ và tên..."
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Địa chỉ Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control py-2 bg-light"
                    value={formData.email}
                    disabled
                  />
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    * Email không thể thay đổi
                  </small>
                </div>

                {/* Mật khẩu mới */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Mật khẩu mới (Để trống nếu không đổi)
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control py-2"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                {/* Số điện thoại */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control py-2"
                    placeholder="0901234567..."
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* URL Avatar */}
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">URL Ảnh đại diện</label>
                  <input
                    type="text"
                    name="avatar"
                    className="form-control py-2"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={handleChange}
                  />
                </div>

                {/* Vai trò: User / Admin */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Vai trò / Phân quyền
                  </label>
                  <select
                    name="role"
                    className="form-select py-2"
                    value={formData.role.toLowerCase()}
                    onChange={handleChange}
                  >
                    <option value="user">User (Khách hàng / Thành viên)</option>
                    <option value="admin">Admin (Quản trị viên)</option>
                  </select>
                </div>

                {/* Trạng thái */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Trạng thái tài khoản
                  </label>
                  <select
                    name="status"
                    className="form-select py-2"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active (Hoạt động)</option>
                    <option value="inactive">Inactive (Bị cấm)</option>
                  </select>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <Link href="/admin/user" className="btn btn-light px-4 py-2 rounded-3 fw-semibold">
                  Hủy bỏ
                </Link>
                <button
                  type="submit"
                  className="btn btn-dark px-4 py-2 rounded-3 fw-semibold shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
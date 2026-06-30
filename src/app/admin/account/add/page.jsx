"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddAccount() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
    status: "active",
    avatar: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Tên hiển thị không được để trống!");
    if (!formData.email.trim()) return alert("Email không được để trống!");
    if (!formData.password.trim()) return alert("Mật khẩu không được để trống!");

    setSubmitting(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.id.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          status: formData.status,
          avatar: formData.avatar.trim() || "https://i.pravatar.cc/80?img=32",
        }),
      });

      if (res.ok) {
        alert("Tạo tài khoản thành công!");
        router.push("/admin/account");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Lỗi khi tạo tài khoản.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ khi tạo tài khoản.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Thêm tài khoản mới</h4>
        <p className="text-secondary small">Cấp tài khoản mới để truy cập hệ thống quản trị</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold text-secondary">Mã nhân viên / ID</label>
                <input type="text" className="form-control" name="id" placeholder="VD: NK-8821" value={formData.id} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold text-secondary">Tên hiển thị <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="name" placeholder="Nhập họ và tên..." value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Địa chỉ Email <span className="text-danger">*</span></label>
              <input type="email" className="form-control" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Mật khẩu khởi tạo <span className="text-danger">*</span></label>
              <input type="password" className="form-control" name="password" placeholder="Nhập mật khẩu..." value={formData.password} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Đường dẫn ảnh đại diện (Avatar URL)</label>
              <input type="text" className="form-control" name="avatar" placeholder="https://..." value={formData.avatar} onChange={handleChange} />
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label className="form-label small fw-bold text-secondary">Vai trò</label>
                <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                  <option value="MEMBER">MEMBER (Người dùng)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div className="col-md-6 mb-4">
                <label className="form-label small fw-bold text-secondary">Trạng thái kích hoạt</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Hoạt động (Active)</option>
                  <option value="inactive">Khóa (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <Link href="/admin/account" className="btn btn-light px-4">Hủy</Link>
              <button type="submit" className="btn btn-dark px-4" disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
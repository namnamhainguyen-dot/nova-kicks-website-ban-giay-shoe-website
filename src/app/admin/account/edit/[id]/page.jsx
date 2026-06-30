"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditAccount() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Lấy _id tài khoản từ URL

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    role: "MEMBER",
    status: "active",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. Lấy dữ liệu cũ của tài khoản dựa theo MongoDB _id
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const res = await fetch(`/api/accounts`);
        if (res.ok) {
          const accounts = await res.json();
          const currentAccount = accounts.find((acc) => acc._id === id);
          
          if (currentAccount) {
            setFormData({
              id: currentAccount.id || "",
              name: currentAccount.name || "",
              email: currentAccount.email || "",
              role: currentAccount.role || "MEMBER",
              status: currentAccount.status || "active",
              avatar: currentAccount.avatar || "",
            });
          } else {
            alert("Không tìm thấy tài khoản này trong hệ thống!");
            router.push("/admin/account");
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết tài khoản:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAccountDetails();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Tên hiển thị không được để trống!");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Cập nhật thông tin tài khoản thành công!");
        router.push("/admin/account");
        router.refresh();
      } else {
        alert("Lỗi khi lưu thông tin thay đổi.");
      }
    } catch (error) {
      alert("Không thể kết nối API để cập nhật.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5 text-secondary">Đang tải thông tin tài khoản dữ liệu...</div>;
  }

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Chỉnh sửa tài khoản</h4>
        <p className="text-secondary small">Cập nhật quyền hạn hoặc thông tin hồ sơ của thành viên</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold text-secondary">Mã nhân viên / ID</label>
                <input type="text" className="form-control" name="id" value={formData.id} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold text-secondary">Tên hiển thị <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Địa chỉ Email</label>
              <input type="email" className="form-control bg-light" name="email" value={formData.email} disabled />
              <div className="form-text text-muted small">Không cho phép thay đổi địa chỉ email đăng nhập.</div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Đường dẫn ảnh đại diện (Avatar URL)</label>
              <input type="text" className="form-control" name="avatar" value={formData.avatar} onChange={handleChange} />
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label className="form-label small fw-bold text-secondary">Vai trò hệ thống</label>
                <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                  <option value="MEMBER">MEMBER (Người dùng)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div className="col-md-6 mb-4">
                <label className="form-label small fw-bold text-secondary">Trạng thái tài khoản</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Hiển thị (Active)</option>
                  <option value="inactive">Ẩn (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <Link href="/admin/account" className="btn btn-light px-4">Hủy</Link>
              <button type="submit" className="btn btn-dark px-4" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
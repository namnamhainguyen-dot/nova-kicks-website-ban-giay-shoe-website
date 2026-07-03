"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "MEMBER",
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
        
        setFormData({
          name: data.fullname || data.name || "",
          email: data.email || "",
          role: data.role || "MEMBER",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Cập nhật thành công!");
        router.push("/admin/user");
      } else {
        alert("Cập nhật thất bại!");
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải giao diện...</div>;

  return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <h4 className="fw-bold mb-4">Chỉnh sửa thông tin người dùng</h4>
      
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Tên hiển thị</label>
            <input type="text" className="form-control" value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Email</label>
            <input type="email" className="form-control bg-light" value={formData.email} disabled />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold text-secondary">Vai trò</label>
              <select className="form-select" value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold text-secondary">Trạng thái</label>
              <select className="form-select" value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Link href="/admin/user" className="btn btn-light px-4">Hủy</Link>
            <button type="submit" className="btn btn-dark px-4" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Lấy danh sách danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 2. Xóa danh mục
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((cat) => cat.id !== id));
        alert("Đã xóa danh mục thành công!");
      }
    } catch (error) {
      alert("Lỗi khi xóa danh mục.");
    }
  };

  // 3. Thay đổi trạng thái nhanh (Hiện/Ẩn)
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCategories(
          categories.map((cat) =>
            cat.id === id ? { ...cat, status: newStatus } : cat
          )
        );
      }
    } catch (error) {
      alert("Không thể cập nhật trạng thái.");
    }
  };

  // 4. Tìm kiếm danh mục
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-secondary" role="status"></div>
        <p className="mt-2 text-muted">Đang tải dữ liệu danh mục...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header & Công cụ */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h3 className="fw-bold mb-1">Quản lý danh mục</h3>
          <p className="text-muted small">Xem, thêm, sửa và phân loại sản phẩm của bạn.</p>
        </div>
        <div className="col-md-6 text-md-end">
          <Link href="/admin/category/add" className="btn btn-dark shadow-sm">
            <i className="bi bi-plus-lg me-2"></i>Thêm danh mục mới
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
              placeholder="Tìm tên danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Hình ảnh</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th className="text-end pe-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    Chưa có danh mục nào được tạo.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="ps-4">
                      <img
                        src={cat.image || "https://via.placeholder.com/50"}
                        alt={cat.name}
                        className="rounded"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      />
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{cat.name}</span>
                    </td>
                    <td>
                      <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: "250px" }}>
                        {cat.description || "Chưa có mô tả"}
                      </small>
                    </td>
                    <td>
                      <div 
                        className={`form-check form-switch cursor-pointer`}
                        onClick={() => toggleStatus(cat.id, cat.status)}
                      >
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          role="switch" 
                          checked={cat.status === "active"} 
                          readOnly 
                        />
                        <span className={`badge ${cat.status === "active" ? "text-success" : "text-danger"}`}>
                          {cat.status === "active" ? "Đang hiện" : "Đang ẩn"}
                        </span>
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <Link 
                        href={`/admin/category/edit/${cat.id}`} 
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <i className="bi bi-pencil"></i> Sửa
                      </Link>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <i className="bi bi-trash"></i> Xóa
                      </button>
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
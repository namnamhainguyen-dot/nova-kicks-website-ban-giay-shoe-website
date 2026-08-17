"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success) {
        setNewsList(data.data);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách tin tức:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchNews();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Lỗi xóa bài viết:", error);
    }
  };

  // Tính toán số liệu thống kê từ API mới
  const totalLikes = newsList.reduce((acc, item) => acc + (item.likes || 0), 0);
  const totalComments = newsList.reduce((acc, item) => acc + (item.comments?.length || 0), 0);

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Quản lý tin tức</h2>
          <p className="text-muted">Theo dõi bài viết, hiển thị tin tức mới và cập nhật nhanh.</p>
        </div>
        <Link href="/admin/news/create" className="btn btn-dark px-4 py-2">
          + Thêm bài viết mới
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 border-0 shadow-sm">
            <small className="text-muted fw-bold">TỔNG BÀI VIẾT</small>
            <h3 className="fw-bold mt-2">{newsList.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 border-0 shadow-sm">
            <small className="text-muted fw-bold">TỔNG LƯỢT THÍCH</small>
            <h3 className="fw-bold mt-2 text-primary">{totalLikes}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 border-0 shadow-sm">
            <small className="text-muted fw-bold">TỔNG BÌNH LUẬN</small>
            <h3 className="fw-bold mt-2 text-success">{totalComments}</h3>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>TIÊU ĐỀ</th>
                  <th>TÁC GIẢ</th>
                  <th>DANH MỤC</th>
                  <th>TƯƠNG TÁC</th>
                  <th>NGÀY TẠO</th>
                  <th className="text-end">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : newsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Chưa có bài viết nào.
                    </td>
                  </tr>
                ) : (
                  newsList.map((item) => (
                    <tr key={item._id}>
                      <td className="fw-semibold">{item.title}</td>
                      <td>{item.author}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.category}</span>
                      </td>
                      <td>
                        <span className="me-3 text-danger">❤️ {item.likes || 0}</span>
                        <span className="text-primary">💬 {item.comments?.length || 0}</span>
                      </td>
                      <td>{new Date(item.createdAt || Date.now()).toLocaleDateString("vi-VN")}</td>
                      <td className="text-end">
                        <Link href={`/admin/news/edit/${item._id}`} className="btn btn-sm btn-outline-secondary me-2">
                          Sửa
                        </Link>
                        <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-outline-danger">
                          Xóa
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
    </div>
  );
}
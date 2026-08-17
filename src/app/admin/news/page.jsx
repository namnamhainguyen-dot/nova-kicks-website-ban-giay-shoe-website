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

  if (loading) {
    return <div className="container py-5 text-center">Đang tải danh sách tin tức...</div>;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Quản lý Tin tức</h1>
        <Link href="/admin/news/create" className="btn btn-primary">
          + Thêm bài viết mới
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Tiêu đề</th>
                  <th>Tác giả</th>
                  <th>Danh mục</th>
                  <th>Ngày tạo</th>
                  <th className="text-end">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {newsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Chưa có bài viết nào.
                    </td>
                  </tr>
                ) : (
                  newsList.map((item) => (
                    <tr key={item._id}>
                      <td className="fw-semibold">{item.title}</td>
                      <td>{item.author}</td>
                      <td>
                        <span className="badge bg-secondary">{item.category}</span>
                      </td>
                      <td>{new Date(item.createdAt || Date.now()).toLocaleDateString("vi-VN")}</td>
                      <td className="text-end">
                        <Link href={`/admin/news/edit/${item._id}`} className="btn btn-sm btn-warning me-2">
                          Sửa
                        </Link>
                        <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-danger">
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
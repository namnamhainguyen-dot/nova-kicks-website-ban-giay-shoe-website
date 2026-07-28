"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";

export default function CategoryDetail({ params: paramsPromise }) {
  // Unwarp params trong Next.js App Router mới
  const params = use(paramsPromise);
  const categoryId = params.id;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy thông tin danh mục hiện tại
        const resCat = await fetch(`/api/categories/${categoryId}`);
        if (resCat.ok) {
          const catData = await resCat.json();
          setCategory(catData);
        }

        // 2. Lấy tất cả sản phẩm thuộc danh mục này
        const resProd = await fetch(`/api/products?categoryId=${categoryId}`);
        if (resProd.ok) {
          const prodData = await resProd.json();
          // Lọc lại phòng trường hợp API trả về toàn bộ danh sách sản phẩm
          const filtered = prodData.filter(
            (p) => (p.categoryId || p.categoryID) === categoryId
          );
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-dark" role="status"></div>
        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Nút quay lại */}
      <div className="mb-3">
        <Link href="/admin/category" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> Trở về Quản lý danh mục
        </Link>
      </div>

      {/* Thông tin Danh mục */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3">
            <img
              src={category?.image || "https://via.placeholder.com/80"}
              alt={category?.name || "Category"}
              className="rounded"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
            />
            <div>
              <div className="d-flex align-items-center gap-2">
                <h3 className="fw-bold mb-0">{category?.name || "Danh mục"}</h3>
                <span
                  className={`badge ${
                    category?.status === "active" ? "bg-success" : "bg-danger"
                  }`}
                >
                  {category?.status === "active" ? "Đang hiện" : "Đang ẩn"}
                </span>
              </div>
              <p className="text-muted mb-1 mt-1">
                {category?.description || "Chưa có mô tả cho danh mục này."}
              </p>
              <small className="text-secondary fw-mono">
                Mã DM: {category?.id || categoryId}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm bên trong Danh mục này */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">
            Sản phẩm thuộc danh mục ({products.length})
          </h5>
          <Link
            href={`/admin/product/create?categoryId=${categoryId}`}
            className="btn btn-sm btn-dark"
          >
            + Thêm sản phẩm vào danh mục này
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng tồn</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    Chưa có sản phẩm nào thuộc danh mục này.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td className="ps-4">
                      <img
                        src={p.image || "/img/hero-banner.jpg"}
                        alt={p.name}
                        className="rounded"
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>
                      <div className="fw-bold">{p.name}</div>
                      <small className="text-muted">
                        SKU: {String(p._id).slice(-6)}
                      </small>
                    </td>
                    <td className="fw-semibold">
                      {Number(p.price || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td>{p.quantity ?? 0} sản phẩm</td>
                    <td>
                      <Link
                        href={`/admin/product/${p._id}/update`}
                        className="btn btn-sm btn-outline-secondary">
                        ✎ Sửa
                      </Link>
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
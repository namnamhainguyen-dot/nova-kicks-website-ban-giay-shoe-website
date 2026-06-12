"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Product() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm.");

      const data = await res.json();
      setProductList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Lỗi khi tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  };



  const totalProducts = productList.length;
  const totalStock = productList.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const availableProducts = productList.filter((item) => item.status === "active").length;
  const totalValue = productList.reduce(
    (sum, item) => sum + (Number(item.price || 0) * (item.quantity ?? 1)),
    0
  );

  const getQuantity = (product) => product.quantity ?? 12;
  const getCategory = (product) => product.category || "N/A";
  const getStockPercent = (product) => {
    const qty = getQuantity(product);
    return Math.min(100, Math.round((qty / 120) * 100));
  };

  return (
    <div className="content admin-product-dashboard">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-2">Quản lý sản phẩm</h1>
          <p className="text-muted mb-0">Theo dõi kho hàng, hiển thị sản phẩm đang bán và cập nhật nhanh.</p>
        </div>
        <Link href="/admin/product/create" className="btn btn-dark btn-lg px-4">
          + Thêm sản phẩm mới
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 summary-card">
            <div className="card-body px-4 py-4">
              <small className="text-uppercase text-secondary">Tổng mã sản phẩm</small>
              <h3 className="fw-bold mt-3">{totalProducts.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 summary-card">
            <div className="card-body px-4 py-4">
              <small className="text-uppercase text-secondary">Số lượng còn lại</small>
              <h3 className="fw-bold mt-3 text-danger">{totalStock.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 summary-card">
            <div className="card-body px-4 py-4">
              <small className="text-uppercase text-secondary">Sản phẩm</small>
              <h3 className="fw-bold mt-3">{availableProducts.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 summary-card">
            <div className="card-body px-4 py-4">
              <small className="text-uppercase text-secondary">Tổng giá</small>
              <h3 className="fw-bold mt-3">{totalValue.toLocaleString("vi-VN")}đ</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table product-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Còn lại</th>
                  <th>Giá</th>
                  <th>Hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Đang tải sản phẩm...
                    </td>
                  </tr>
                ) : productList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Chưa có sản phẩm nào. Hãy thêm sản phẩm mới.
                    </td>
                  </tr>
                ) : (
                  productList.map((product) => {
                    const stringId = String(product._id);
                    return (
                      <tr key={stringId}>
                      <td className="product-image-cell">
                        <div className="product-image-wrapper">
                          <img
                            src={product.image || "/img/hero-banner.jpg"}
                            alt={product.name}
                            className="product-image"
                          />
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{product.name}</div>
                        <div className="text-secondary small">SKU: {String(product._id).slice(-8)}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark category-badge">{getCategory(product)}</span>
                      </td>
                      <td>
                        <div className="stock-meta mb-2">Còn lại {getQuantity(product)}</div>
                        <div className="progress stock-progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${getStockPercent(product)}%` }}
                          />
                        </div>
                      </td>
                      <td>{Number(product.price || 0).toLocaleString("vi-VN")}đ</td>
                      <td>
                        <Link 
                          href={`/admin/product/${stringId}/update`} 
                          className="btn btn-outline-secondary btn-sm"
                        >
                          ✎ Sửa
                        </Link>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-top text-muted small">Hiển thị 1 đến {productList.length || 0} trong {totalProducts.toLocaleString()} tổng thể</div>
        </div>
      </div>
    </div>
  );
}
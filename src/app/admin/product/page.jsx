"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

const CATEGORIES_DATA = [
  { oid: "6a2932c7044b3063b3d05171", id: "CAT-G001", name: "NIKE" },
  { oid: "6a2932c7044b3063b3d05172", id: "CAT-G002", name: "Giày Tây / Giày Công Sở" },
  { oid: "6a2932c7044b3063b3d05173", id: "CAT-G003", name: "Giày Cao Gót" },
  { oid: "6a2932c7044b3063b3d05174", id: "CAT-G004", name: "Sandal & Dép" },
  { oid: "6a3166d279a15e51f78006a5", id: "CAT-G005", name: "TÔNG LÀO" },
];

export default function Product() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // --- Pagination states ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số lượng sản phẩm trên mỗi trang

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

  const getQuantity = (product) => product.quantity ?? 12;
  
  const getCategory = (product) => {
    const pCatId = product.categoryId || product.categoryID;
    const found = CATEGORIES_DATA.find((cat) => cat.oid === pCatId);
    return found ? found.name : "Chưa phân loại";
  };

  const getStockPercent = (product) => {
    const qty = getQuantity(product);
    return Math.min(100, Math.round((qty / 120) * 100));
  };

  const filteredList = useMemo(() => {
    let list = [...productList];

    if (searchName.trim()) {
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(searchName.trim().toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => (p.categoryId || p.categoryID) === categoryFilter);
    }

    if (priceMin !== "") {
      list = list.filter((p) => Number(p.price || 0) >= Number(priceMin));
    }
    if (priceMax !== "") {
      list = list.filter((p) => Number(p.price || 0) <= Number(priceMax));
    }

    if (stockFilter === "out") {
      list = list.filter((p) => getQuantity(p) === 0);
    } else if (stockFilter === "low") {
      list = list.filter((p) => getQuantity(p) > 0 && getQuantity(p) <= 10);
    } else if (stockFilter === "instock") {
      list = list.filter((p) => getQuantity(p) > 10);
    }

    if (sortBy === "price_asc") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sortBy === "price_desc") list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    else if (sortBy === "qty_asc") list.sort((a, b) => getQuantity(a) - getQuantity(b));
    else if (sortBy === "qty_desc") list.sort((a, b) => getQuantity(b) - getQuantity(a));
    else if (sortBy === "name_asc") list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi"));

    return list;
  }, [productList, searchName, categoryFilter, priceMin, priceMax, stockFilter, sortBy]);

  // Reset về trang 1 mỗi khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, categoryFilter, priceMin, priceMax, stockFilter, sortBy]);

  // --- Phân chia danh sách theo trang hiện tại ---
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleResetFilters = () => {
    setSearchName("");
    setCategoryFilter("all");
    setPriceMin("");
    setPriceMax("");
    setStockFilter("all");
    setSortBy("default");
  };

  const hasActiveFilter =
    searchName || categoryFilter !== "all" || priceMin || priceMax || stockFilter !== "all" || sortBy !== "default";

  const totalProducts = productList.length;
  const totalStock = productList.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const availableProducts = productList.filter((item) => item.status === "active" || !item.status).length;
  const totalValue = productList.reduce(
    (sum, item) => sum + (Number(item.price || 0) * (item.quantity ?? 1)),
    0
  );

  return (
    <div className="content admin-product-dashboard container-fluid px-4 py-4 bg-light min-vh-100">
      
      {/* Header Title & Action */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Quản lý sản phẩm</h2>
          <p className="text-muted small mb-0">Theo dõi kho hàng, hiển thị sản phẩm đang bán và cập nhật nhanh.</p>
        </div>
        <Link href="/admin/product/create" className="btn btn-dark rounded-pill px-4 fw-medium shadow-sm">
          + Thêm sản phẩm mới
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body p-3">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Tổng mã sản phẩm</span>
              <h4 className="fw-bold text-dark mt-2 mb-0">{totalProducts.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body p-3">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Số lượng tồn kho</span>
              <h4 className="fw-bold text-danger mt-2 mb-0">{totalStock.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body p-3">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Đang hoạt động</span>
              <h4 className="fw-bold text-success mt-2 mb-0">{availableProducts.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-body p-3">
              <span className="text-uppercase text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>Tổng giá trị kho</span>
              <h4 className="fw-bold text-primary mt-2 mb-0" style={{ fontSize: "1.25rem" }}>{totalValue.toLocaleString("vi-VN")}đ</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card shadow-sm border-0 mb-4 rounded-3 bg-white">
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">
            
            <div className="col-12 col-md-2">
              <label className="form-label small text-secondary fw-semibold mb-1">Tìm theo tên</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập tên sản phẩm..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary fw-semibold mb-1">Danh mục</label>
              <select
                className="form-select form-select-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {CATEGORIES_DATA.map((cat) => (
                  <option key={cat.oid} value={cat.oid}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary fw-semibold mb-1">Giá từ (đ)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="0"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary fw-semibold mb-1">Giá đến (đ)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="∞"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-1">
              <label className="form-label small text-secondary fw-semibold mb-1">Tồn kho</label>
              <select
                className="form-select form-select-sm"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="instock">Còn (&gt;10)</option>
                <option value="low">Sắp hết (1-10)</option>
                <option value="out">Hết (0)</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary fw-semibold mb-1">Sắp xếp</label>
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="name_asc">Tên A → Z</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="qty_asc">Tồn kho tăng</option>
                <option value="qty_desc">Tồn kho giảm</option>
              </select>
            </div>

            <div className="col-12 col-md-1 d-flex align-items-end">
              {hasActiveFilter && (
                <button
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={handleResetFilters}
                  title="Xóa bộ lọc"
                  style={{ fontSize: "0.8rem" }}
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {hasActiveFilter && (
            <div className="mt-2 pt-2 border-top">
              <small className="text-muted">
                Tìm thấy <strong>{filteredList.length}</strong> / {totalProducts} sản phẩm phù hợp
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.9rem" }}>
            <thead className="table-light text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
              <tr>
                <th scope="col" className="ps-3 py-3" style={{ width: "10%" }}>Hình ảnh</th>
                <th scope="col" className="py-3" style={{ width: "25%" }}>Tên sản phẩm</th>
                <th scope="col" className="py-3" style={{ width: "20%" }}>Danh mục</th>
                <th scope="col" className="py-3" style={{ width: "15%" }}>Tồn kho</th>
                <th scope="col" className="py-3" style={{ width: "15%" }}>Giá bán</th>
                <th scope="col" className="text-end pe-3 py-3" style={{ width: "15%" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted fw-medium">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-danger fw-medium">
                    {error}
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    {hasActiveFilter
                      ? "Không tìm thấy sản phẩm phù hợp với bộ lọc."
                      : "Chưa có sản phẩm nào. Hãy bấm 'Thêm sản phẩm mới' ở góc trên."}
                  </td>
                </tr>
              ) : (
                paginatedList.map((product) => {
                  const stringId = String(product._id);
                  const qty = getQuantity(product);
                  const stockClass = qty === 0 ? "bg-danger" : qty <= 10 ? "bg-warning" : "bg-success";

                  return (
                    <tr key={stringId}>
                      <td className="ps-3 py-2">
                        <div 
                          className="rounded border overflow-hidden bg-light d-flex align-items-center justify-content-center" 
                          style={{ width: "45px", height: "45px" }}
                        >
                          <img
                            src={product.image || "/img/hero-banner.jpg"}
                            alt={product.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.target.src = "/img/hero-banner.jpg"; }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "250px" }} title={product.name}>
                          {product.name}
                        </div>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>SKU: #{stringId.slice(-6)}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border fw-normal px-2 py-1" style={{ fontSize: "0.8rem" }}>
                          {getCategory(product)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold small text-dark" style={{ minWidth: "45px" }}>{qty} cái</span>
                          <div className="progress flex-grow-1" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar ${stockClass}`}
                              role="progressbar"
                              style={{ width: `${getStockPercent(product)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="fw-bold text-danger">
                        {Number(product.price || 0).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="text-end pe-3">
                        <Link
                          href={`/admin/product/${stringId}/update`}
                          className="btn btn-outline-dark btn-sm rounded-pill py-1 px-3"
                          style={{ fontSize: "0.78rem" }}
                        >
                          Sửa
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer & Pagination */}
        <div className="card-footer bg-white border-top py-3 px-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Hiển thị từ <strong>{filteredList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> đến{" "}
            <strong>{Math.min(currentPage * itemsPerPage, filteredList.length)}</strong> trên tổng số{" "}
            <strong>{filteredList.length.toLocaleString()}</strong> sản phẩm phù hợp
          </div>

          {/* Thanh phân trang */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                    Trước
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                      <button className={`page-link ${currentPage === pageNum ? "bg-dark border-dark text-white" : ""}`} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
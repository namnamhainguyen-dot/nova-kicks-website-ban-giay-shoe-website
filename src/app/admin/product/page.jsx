"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

// Dữ liệu danh mục từ DB của bạn để đổ vào Select Box
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

  // --- Filter states ---
  const [searchName, setSearchName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all"); // Quản lý bằng OID danh mục
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "instock" | "low" | "out"
  const [sortBy, setSortBy] = useState("default"); // "default" | "price_asc" | "price_desc" | "qty_asc" | "qty_desc" | "name_asc"

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
  
  // 🌟 ĐÃ SỬA: Kiểm tra cả p.categoryId (từ form mới) lẫn p.categoryID (phòng dữ liệu cũ)
  const getCategory = (product) => {
    const pCatId = product.categoryId || product.categoryID;
    const found = CATEGORIES_DATA.find((cat) => cat.oid === pCatId);
    return found ? found.name : "N/A";
  };

  const getStockPercent = (product) => {
    const qty = getQuantity(product);
    return Math.min(100, Math.round((qty / 120) * 100));
  };

  // --- Filtered & sorted list ---
  const filteredList = useMemo(() => {
    let list = [...productList];

    // Lọc theo tên
    if (searchName.trim()) {
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(searchName.trim().toLowerCase())
      );
    }

    // 🌟 ĐÃ SỬA: Lọc danh mục chấp nhận cả 2 kiểu viết hoa/thường của key
    if (categoryFilter !== "all") {
      list = list.filter((p) => (p.categoryId || p.categoryID) === categoryFilter);
    }

    // Lọc theo giá
    if (priceMin !== "") {
      list = list.filter((p) => Number(p.price || 0) >= Number(priceMin));
    }
    if (priceMax !== "") {
      list = list.filter((p) => Number(p.price || 0) <= Number(priceMax));
    }

    // Lọc theo số lượng tồn kho
    if (stockFilter === "out") {
      list = list.filter((p) => getQuantity(p) === 0);
    } else if (stockFilter === "low") {
      list = list.filter((p) => getQuantity(p) > 0 && getQuantity(p) <= 10);
    } else if (stockFilter === "instock") {
      list = list.filter((p) => getQuantity(p) > 10);
    }

    // Sắp xếp
    if (sortBy === "price_asc") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sortBy === "price_desc") list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    else if (sortBy === "qty_asc") list.sort((a, b) => getQuantity(a) - getQuantity(b));
    else if (sortBy === "qty_desc") list.sort((a, b) => getQuantity(b) - getQuantity(a));
    else if (sortBy === "name_asc") list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi"));

    return list;
  }, [productList, searchName, categoryFilter, priceMin, priceMax, stockFilter, sortBy]);

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

  // Summary stats (dùng toàn bộ list, không lọc)
  const totalProducts = productList.length;
  const totalStock = productList.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const availableProducts = productList.filter((item) => item.status === "active").length;
  const totalValue = productList.reduce(
    (sum, item) => sum + (Number(item.price || 0) * (item.quantity ?? 1)),
    0
  );

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

      {/* Summary cards */}
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

      {/* ===== BỘ LỌC ===== */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">

            {/* Tìm theo tên */}
            <div className="col-12 col-md-2">
              <label className="form-label small text-secondary mb-1">Tìm theo tên</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Nhập tên sản phẩm..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            {/* Chọn Danh mục */}
            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary mb-1">Danh mục</label>
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

            {/* Giá từ */}
            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary mb-1">Giá từ (đ)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="0"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
            </div>

            {/* Giá đến */}
            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary mb-1">Giá đến (đ)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                placeholder="∞"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>

            {/* Tồn kho */}
            <div className="col-6 col-md-1">
              <label className="form-label small text-secondary mb-1">Tồn kho</label>
              <select
                className="form-select form-select-sm"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="instock">Còn hàng (&gt;10)</option>
                <option value="low">Sắp hết (1–10)</option>
                <option value="out">Hết hàng (0)</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="col-6 col-md-2">
              <label className="form-label small text-secondary mb-1">Sắp xếp</label>
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="name_asc">Tên A → Z</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="qty_asc">Số lượng tăng dần</option>
                <option value="qty_desc">Số lượng giảm dần</option>
              </select>
            </div>

            {/* Nút reset */}
            <div className="col-12 col-md-1 d-flex align-items-end">
              {hasActiveFilter && (
                <button
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={handleResetFilters}
                  title="Xóa bộ lọc"
                >
                  ✕ Xóa
                </button>
              )}
            </div>
          </div>

          {/* Kết quả lọc */}
          {hasActiveFilter && (
            <div className="mt-2">
              <small className="text-muted">
                Tìm thấy <strong>{filteredList.length}</strong> / {totalProducts} sản phẩm
              </small>
            </div>
          )}
        </div>
      </div>
      {/* ===== KẾT THÚC BỘ LỌC ===== */}

      {/* ===== BẢNG DANH SÁCH ===== */}
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
                    <td colSpan={6} className="text-center py-4 text-muted">
                      Đang tải sản phẩm...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      {hasActiveFilter
                        ? "Không tìm thấy sản phẩm phù hợp với bộ lọc."
                        : "Chưa có sản phẩm nào. Hãy thêm sản phẩm mới."}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((product) => {
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
                          <span className="badge bg-light text-dark category-badge">
                            {getCategory(product)}
                          </span>
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
          <div className="p-4 border-top text-muted small">
            Hiển thị 1 đến {filteredList.length} trong {totalProducts.toLocaleString()} tổng thể
          </div>
        </div>
      </div>
    </div>
  );
}
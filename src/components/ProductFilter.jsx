"use client";

import { useState, useMemo, useContext, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WishlistContext } from "@/components/WishlistContext";

const ITEMS_PER_PAGE = 9;

// 🌟 Component FilterPanel nhận giá trị và hàm cập nhật URL thông qua props
function FilterPanel({
  priceRange,
  setPriceParam,
  selectedSizes,
  toggleSizeParam,
  allSizes,
  showFavoritesOnly,
  toggleFavoriteParam,
  activeCount,
  clearAll,
}) {
  const [localMin, setLocalMin] = useState(priceRange.min ?? '');
  const [localMax, setLocalMax] = useState(priceRange.max ?? '');

  useEffect(() => {
    setLocalMin(priceRange.min ?? '');
    setLocalMax(priceRange.max ?? '');
  }, [priceRange.min, priceRange.max]);

  const handleInputChange = useCallback((type, e) => {
    const value = e.target.value.replace(/[,.]/g, '');
    if (value === '' || /^\d*$/.test(value)) {
      if (type === 'min') {
        setLocalMin(value);
      } else {
        setLocalMax(value);
      }
    }
  }, []);

  const handleApplyPrice = useCallback(() => {
    const minVal = localMin !== '' ? String(Number(localMin)) : '';
    const maxVal = localMax !== '' ? String(Number(localMax)) : '';
    setPriceParam(minVal, maxVal);
  }, [localMin, localMax, setPriceParam]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      handleApplyPrice();
    }
  }, [handleApplyPrice]);

  const handlePresetPrice = useCallback((preset) => {
    const presetMinStr = preset.min !== '' && preset.min !== undefined ? String(preset.min) : '';
    const presetMaxStr = preset.max !== '' && preset.max !== undefined ? String(preset.max) : '';

    const isActive =
      Number(localMin || 0) === Number(presetMinStr || 0) &&
      Number(localMax || 0) === Number(presetMaxStr || 0);

    if (isActive) {
      setLocalMin('');
      setLocalMax('');
      setPriceParam('', '');
    } else {
      setLocalMin(presetMinStr);
      setLocalMax(presetMaxStr);
      setPriceParam(presetMinStr, presetMaxStr);
    }
  }, [localMin, localMax, setPriceParam]);

  const isPresetActive = useCallback((min, max) => {
    const currentMin = localMin !== '' ? Number(localMin) : '';
    const currentMax = localMax !== '' ? Number(localMax) : '';
    const presetMin = min !== '' && min !== undefined ? Number(min) : '';
    const presetMax = max !== '' && max !== undefined ? Number(max) : '';
    return currentMin === presetMin && currentMax === presetMax;
  }, [localMin, localMax]);

  const pricePresets = useMemo(() => [
    { label: "Dưới 200k", min: 0, max: 200000 },
    { label: "200k–500k", min: 200000, max: 500000 },
    { label: "500k–1tr", min: 500000, max: 1000000 },
    { label: "1tr–3tr", min: 1000000, max: 3000000 },
    { label: "Trên 3tr", min: 3000000, max: "" },
  ], []);

  return (
    <div
      style={{
        background: "var(--surface-card, #fff)",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        position: "sticky",
        top: "100px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "15px" }}>Bộ lọc</span>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              fontSize: "12px",
              color: "#ef4444",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
            }}
          >
            Xóa tất cả ({activeCount})
          </button>
        )}
      </div>

      {/* MỤC LỌC SẢN PHẨM YÊU THÍCH */}
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#6b7280",
            marginBottom: "10px",
          }}
        >
          Tùy chọn
        </p>
        <button
          onClick={toggleFavoriteParam}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: showFavoritesOnly ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
            background: showFavoritesOnly ? "#fef2f2" : "#f9fafb",
            color: showFavoritesOnly ? "#ef4444" : "#374151",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill={showFavoritesOnly ? "#ef4444" : "none"}
            stroke={showFavoritesOnly ? "#ef4444" : "#4b5563"}
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          Chỉ hiện sản phẩm yêu thích
        </button>
      </div>

      {/* BỘ LỌC GIÁ */}
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#6b7280",
            marginBottom: "10px",
          }}
        >
          Giá (VND)
        </p>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder="Từ"
              value={localMin}
              onChange={(e) => handleInputChange('min', e)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>
          <span style={{ color: "#9ca3af", fontSize: "12px" }}>—</span>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder="Đến"
              value={localMax}
              onChange={(e) => handleInputChange('max', e)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "10px" }}>
          <button
            onClick={handleApplyPrice}
            style={{
              width: "100%",
              padding: "6px",
              borderRadius: "6px",
              background: "#111",
              color: "#fff",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Áp dụng giá
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
          {pricePresets.map((preset) => {
            const active = isPresetActive(preset.min, preset.max);
            return (
              <button
                key={preset.label}
                onClick={() => handlePresetPrice(preset)}
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "16px",
                  border: active ? "2px solid #111" : "1px solid #e5e7eb",
                  background: active ? "#111" : "transparent",
                  color: active ? "#fff" : "#374151",
                  cursor: "pointer",
                  fontWeight: active ? 700 : 500,
                  whiteSpace: "nowrap",
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* BỘ LỌC KÍCH THƯỚC */}
      {allSizes && allSizes.length > 0 && (
        <div>
          <p
            style={{
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6b7280",
              marginBottom: "10px",
            }}
          >
            Kích thước
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {allSizes.map((size) => {
              const active = selectedSizes?.includes(String(size));
              return (
                <button
                  key={size}
                  onClick={() => toggleSizeParam(String(size))}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    border: active ? "2px solid #111" : "1px solid #d1d5db",
                    background: active ? "#111" : "#f9fafb",
                    color: active ? "#fff" : "#374151",
                    fontSize: "12px",
                    fontWeight: active ? 700 : 600,
                    cursor: "pointer",
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 🏷️ Product Card riêng biệt để tối ưu render
function ProductCard({ product, isFavorite, toggleWishlist }) {
  const productId = String(product._id?.$oid || product._id);
  const isFav = isFavorite(productId);

  return (
    <div className="col-sm-6 col-lg-4">
      <div
        className="card h-100 border-0 shadow-sm card-product nk-card"
        style={{ backgroundColor: "var(--surface-card)", borderRadius: "12px", overflow: "hidden", position: "relative" }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          title={isFav ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill={isFav ? "var(--danger, #c73a2b)" : "none"}
            stroke={isFav ? "var(--danger, #c73a2b)" : "#555"}
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <Link href={`/products/${productId}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div
            className="d-flex align-items-center justify-content-center overflow-hidden"
            style={{ height: "250px", backgroundColor: "#f9f9f9", position: "relative" }}
          >
            {product.hasFlashSale && (
              <span style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                backgroundColor: "#ef4444",
                color: "#fff",
                fontSize: "11px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "4px",
                zIndex: 5
              }}>
                FLASH SALE
              </span>
            )}
            <img
              src={product.image || "/img/no-image.png"}
              alt={product.name}
              className="img-fluid img-hover-scale"
              style={{ maxHeight: "100%", objectFit: "contain" }}
            />
          </div>

          <div className="card-body pb-0">
            <h5 className="fw-bold text-truncate card-title" title={product.name}>
              {product.name}
            </h5>

            {product.displaySizes?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                {product.displaySizes.slice(0, 4).map((size) => (
                  <span
                    key={size}
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "#f9fafb",
                      color: "#374151",
                    }}
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}

            <p
              className="small text-secondary mb-2 custom-scrollbar"
              style={{ height: "72px", overflowY: "auto", fontSize: "13px", lineHeight: "1.4" }}
            >
              {product.description}
            </p>

            <div className="fw-bold fs-5 mb-3">
              {product.hasFlashSale && product.flashSalePrice ? (
                <div className="d-flex align-items-center gap-2">
                  <span className="text-danger">
                    {Number(product.flashSalePrice).toLocaleString("vi-VN")} VND
                  </span>
                  <span className="text-muted text-decoration-line-through small" style={{ fontSize: "14px" }}>
                    {Number(product.originalPrice || product.price).toLocaleString("vi-VN")} VND
                  </span>
                </div>
              ) : (
                <span className="text-danger">
                  {Number(product.originalPrice || product.price || 0).toLocaleString("vi-VN")} VND
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="card-body pt-0">
          <Link href={`/products/${productId}`} style={{ textDecoration: "none" }}>
            <button className="btn btn-dark w-100">Xem chi tiết</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductFilter({ products }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { toggleWishlist, isFavorite } = useContext(WishlistContext);

  const priceRange = useMemo(() => ({
    min: searchParams.get("minPrice") ?? "",
    max: searchParams.get("maxPrice") ?? "",
  }), [searchParams]);

  const selectedSizes = useMemo(() => {
    const sizesParam = searchParams.get("sizes");
    return sizesParam ? sizesParam.split(",") : [];
  }, [searchParams]);

  const showFavoritesOnly = searchParams.get("favorites") === "true";
  const sortBy = searchParams.get("sort") || "default";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const updateQueryParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "" && value !== null && value !== undefined && value !== false) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const setPriceParam = useCallback((minVal, maxVal) => {
    const params = new URLSearchParams(searchParams.toString());
    if (minVal !== "") params.set("minPrice", minVal); else params.delete("minPrice");
    if (maxVal !== "") params.set("maxPrice", maxVal); else params.delete("maxPrice");
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const toggleSizeParam = useCallback((size) => {
    const params = new URLSearchParams(searchParams.toString());
    let currentSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];

    if (currentSizes.length > 0) {
      params.set("sizes", currentSizes.join(","));
    } else {
      params.delete("sizes");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams, selectedSizes]);

  const toggleFavoriteParam = useCallback(() => {
    updateQueryParam("favorites", !showFavoritesOnly ? "true" : "");
  }, [updateQueryParam, showFavoritesOnly]);

  const handleSortChange = useCallback((e) => {
    updateQueryParam("sort", e.target.value);
  }, [updateQueryParam]);

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("sizes");
    params.delete("favorites");
    params.delete("sort");
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const processedProducts = useMemo(() => {
    return (products || []).map((p) => {
      const mappedColors = p.colors || p.variants?.map((v) => v.color) || [];
      const uniqueColors = [...new Set(mappedColors)].filter(Boolean);

      const rawSizes = p.sizes || p.variants?.flatMap((v) => {
        if (Array.isArray(v.sizes)) return v.sizes;
        if (v.size !== undefined && v.size !== null) return [v.size];
        return [];
      }) || p.availableSizes || [];

      const uniqueSizes = [...new Set(rawSizes)]
        .filter((size) => size !== null && size !== undefined && size !== "")
        .map((size) => {
          if (typeof size === "object") {
            return String(size.size || size.name || size.value || "").trim();
          }
          return String(size).trim();
        })
        .filter(Boolean);

      const hasFlashSale = Boolean(
        p.isFlashSale &&
        p.flashSalePrice !== null &&
        p.flashSalePrice !== undefined &&
        Number(p.flashSalePrice) > 0
      );

      const effectivePrice = hasFlashSale ? Number(p.flashSalePrice) : (Number(p.price) || 0);

      return {
        ...p,
        displayColors: uniqueColors,
        displaySizes: uniqueSizes,
        hasFlashSale,
        effectivePrice,
      };
    });
  }, [products]);

  const allSizes = useMemo(() => {
    const sizes = processedProducts.flatMap((p) => p.displaySizes || []);
    const uniqueSizes = [...new Set(sizes)];

    return uniqueSizes.sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return String(a).localeCompare(String(b));
    });
  }, [processedProducts]);

  const filtered = useMemo(() => {
    const minPriceNum = priceRange.min !== "" ? Number(priceRange.min) : null;
    const maxPriceNum = priceRange.max !== "" ? Number(priceRange.max) : null;

    const result = processedProducts.filter((p) => {
      const productId = String(p._id?.$oid || p._id);
      
      // 1. Lọc yêu thích
      if (showFavoritesOnly && !isFavorite(productId)) return false;

      // 2. Lọc giá
      if (minPriceNum !== null && p.effectivePrice < minPriceNum) return false;
      if (maxPriceNum !== null && p.effectivePrice > maxPriceNum) return false;

      // 3. Lọc kích thước
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some((s) => (p.displaySizes || []).includes(s));
        if (!hasSize) return false;
      }

      return true;
    });

    // 4. Sắp xếp
    return result.sort((a, b) => {
      if (sortBy === "price-asc") return a.effectivePrice - b.effectivePrice;
      if (sortBy === "price-desc") return b.effectivePrice - a.effectivePrice;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });
  }, [processedProducts, priceRange, selectedSizes, showFavoritesOnly, isFavorite, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const displayedProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (e, pageNumber) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const activeCount = useMemo(() => {
    let count = selectedSizes.length;
    if (priceRange.min !== "" || priceRange.max !== "") count++;
    if (showFavoritesOnly) count++;
    if (sortBy && sortBy !== "default") count++;
    return count;
  }, [selectedSizes.length, priceRange.min, priceRange.max, showFavoritesOnly, sortBy]);

  const filterPanelProps = useMemo(() => ({
    priceRange,
    setPriceParam,
    selectedSizes,
    toggleSizeParam,
    allSizes,
    showFavoritesOnly,
    toggleFavoriteParam,
    activeCount,
    clearAll,
  }), [priceRange, setPriceParam, selectedSizes, toggleSizeParam, allSizes, showFavoritesOnly, toggleFavoriteParam, activeCount, clearAll]);

  return (
    <div>
      <style>{`
        .pagination .page-item.active .page-link {
          background-color: #f97316 !important;
          border-color: #f97316 !important;
          color: #fff !important;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
        }
        .pagination .page-link {
          color: #374151;
          cursor: pointer;
        }
        .pagination .page-link:hover {
          color: #f97316 !important;
        }
      `}</style>

      {/* Mobile toggle */}
      <div className="d-flex d-md-none justify-content-between align-items-center mb-3">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1.5px solid #e5e7eb",
            background: activeCount > 0 ? "#111" : "#fff",
            color: activeCount > 0 ? "#fff" : "#111",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Bộ lọc{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          {filtered.length} / {products?.length || 0} sản phẩm
        </span>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000 }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{ background: "#fff", width: "300px", maxWidth: "85vw", height: "100%", overflowY: "auto", padding: "24px 16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontWeight: 700, fontSize: "16px" }}>Bộ lọc</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <FilterPanel {...filterPanelProps} />
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Sidebar desktop */}
        <div className="col-md-3 d-none d-md-block">
          <FilterPanel {...filterPanelProps} />
        </div>

        {/* Product grid */}
        <div className="col-12 col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-none d-md-flex align-items-center" style={{ fontSize: "13px", color: "#6b7280", gap: "8px" }}>
              <span>
                Hiển thị <strong style={{ color: "#111" }}>{displayedProducts.length}</strong> / tổng số {filtered.length} sản phẩm phù hợp
              </span>
              {activeCount > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: "none",
                    border: "1px solid #e5e7eb",
                    borderRadius: "20px",
                    padding: "2px 10px",
                    fontSize: "12px",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Dropdown Sắp xếp */}
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="form-select form-select-sm"
                style={{ fontSize: "13px", borderRadius: "8px", cursor: "pointer" }}
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
                <option value="name-asc">Tên: A - Z</option>
                <option value="name-desc">Tên: Z - A</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
              {showFavoritesOnly ? (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>❤️</div>
                  <p style={{ fontWeight: 600, fontSize: "16px", color: "#374151" }}>Chưa thêm sản phẩm vào mục yêu thích</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                  <p style={{ fontWeight: 600, fontSize: "16px", color: "#374151" }}>Không tìm thấy sản phẩm</p>
                </>
              )}
              <button
                onClick={clearAll}
                style={{ marginTop: "12px", padding: "8px 20px", borderRadius: "8px", background: "#111", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={String(product._id?.$oid || product._id)}
                    product={product}
                    isFavorite={isFavorite}
                    toggleWishlist={toggleWishlist}
                  />
                ))}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <nav className="d-flex justify-content-center mt-5 pt-3">
                  <ul className="pagination shadow-sm rounded-3 bg-white p-2 border">
                    <li className={`page-item ${validPage <= 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link border-0"
                        onClick={(e) => handlePageChange(e, validPage - 1)}
                        disabled={validPage <= 1}
                      >
                        <i className="fas fa-chevron-left me-1 fs-8"></i> Trước
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <li key={pageNum} className={`page-item ${pageNum === validPage ? "active" : ""}`}>
                        <button
                          className="page-link border-0"
                          onClick={(e) => handlePageChange(e, pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${validPage >= totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link border-0"
                        onClick={(e) => handlePageChange(e, validPage + 1)}
                        disabled={validPage >= totalPages}
                      >
                        Sau <i className="fas fa-chevron-right ms-1 fs-8"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
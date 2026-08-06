"use client";

import { useState, useMemo, useContext, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WishlistContext } from "@/components/WishlistContext";

// 🌟 Component FilterPanel nhận giá trị và hàm cập nhật URL thông qua props
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
  // State tạm cho input để xử lý mượt mà, không gọi router liên tục khi đang gõ
  const [localMin, setLocalMin] = useState(priceRange.min ?? '');
  const [localMax, setLocalMax] = useState(priceRange.max ?? '');

  // Đồng bộ local state với URL params khi thay đổi từ bên ngoài (ví dụ: nút Xóa tất cả, Preset)
  useEffect(() => {
    setLocalMin(priceRange.min ?? '');
    setLocalMax(priceRange.max ?? '');
  }, [priceRange.min, priceRange.max]);

  // Xử lý thay đổi input trực tiếp (chỉ cập nhật giao diện state nội bộ, KHÔNG gọi router)
  const handleInputChange = useCallback((type, e) => {
    const value = e.target.value.replace(/,/g, '');
    if (value === '' || /^\d*$/.test(value)) {
      if (type === 'min') {
        setLocalMin(value);
      } else {
        setLocalMax(value);
      }
    }
  }, []);

  // 🛠️ SỬA LẠI HÀM NÀY: Đảm bảo chuyển đổi đúng định dạng và đẩy thẳng lên URL
  const handleApplyPrice = useCallback(() => {
    const minVal = localMin !== '' ? String(Number(localMin)) : '';
    const maxVal = localMax !== '' ? String(Number(localMax)) : '';
    
    setPriceParam('min', minVal);
    setPriceParam('max', maxVal);
  }, [localMin, localMax, setPriceParam]);

  // Xử lý khi người dùng bấm Enter
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); 
      handleApplyPrice();
    }
  }, [handleApplyPrice]);

  // Hàm xử lý preset giá
  const handlePresetPrice = useCallback((preset) => {
    const presetMinStr = preset.min !== '' && preset.min !== undefined ? String(preset.min) : '';
    const presetMaxStr = preset.max !== '' && preset.max !== undefined ? String(preset.max) : '';

    const isActive = 
      Number(localMin || 0) === Number(presetMinStr || 0) && 
      Number(localMax || 0) === Number(presetMaxStr || 0);
    
    if (isActive) {
      setLocalMin('');
      setLocalMax('');
      setPriceParam('min', '');
      setPriceParam('max', '');
    } else {
      setLocalMin(presetMinStr);
      setLocalMax(presetMaxStr);
      setPriceParam('min', presetMinStr);
      setPriceParam('max', presetMaxStr);
    }
  }, [localMin, localMax, setPriceParam]);

  // Format số tiền hiển thị
  const formatPrice = useCallback((value) => {
    if (!value && value !== 0) return '';
    return Number(value).toLocaleString('vi-VN');
  }, []);

  // Hàm kiểm tra preset đang active
  const isPresetActive = useCallback((min, max) => {
    const currentMin = localMin !== '' ? Number(localMin) : '';
    const currentMax = localMax !== '' ? Number(localMax) : '';
    const presetMin = min !== '' && min !== undefined ? Number(min) : '';
    const presetMax = max !== '' && max !== undefined ? Number(max) : '';
    return currentMin === presetMin && currentMax === presetMax;
  }, [localMin, localMax]);

  // Các preset giá chuẩn hóa
  const pricePresets = useMemo(() => [
    { label: "Dưới 200k", min: 0, max: 200000 },
    { label: "200k–500k", min: 200000, max: 500000 },
    { label: "500k–1tr", min: 500000, max: 1000000 },
    { label: "1tr–3tr", min: 1000000, max: 3000000 },
    { label: "Trên 3tr", min: 3000000, max: "" },
  ], []);

  // ... (phần render giao diện giữ nguyên như cũ)

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

      {/* 🌟 MỤC LỌC SẢN PHẨM YÊU THÍCH */}
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

      {/* BỘ LỌC GIÁ TỐI ƯU */}
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
        
        {/* Input range */}
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
                transition: "border-color 0.2s",
              }}
            />
            {localMin !== '' && (
              <span style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px",
                color: "#9ca3af",
                pointerEvents: "none"
              }}>
                {formatPrice(localMin)}
              </span>
            )}
          </div>
          
          <span style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "300" }}>—</span>
          
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
                transition: "border-color 0.2s",
              }}
            />
            {localMax !== '' && (
              <span style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px",
                color: "#9ca3af",
                pointerEvents: "none"
              }}>
                {formatPrice(localMax)}
              </span>
            )}
          </div>
        </div>

        {/* Nút bấm áp dụng khoảng giá nhanh cho người dùng */}
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

        {/* Preset buttons */}
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
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Range slider indicator */}
        {(localMin !== '' || localMax !== '') && (
          <div style={{ 
            marginTop: "10px",
            padding: "6px 10px",
            background: "#f3f4f6",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#6b7280",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span>Khoảng giá đã chọn</span>
            <span style={{ fontWeight: 600, color: "#111" }}>
              {localMin !== '' ? formatPrice(localMin) : '0'} - {localMax !== '' ? formatPrice(localMax) : '∞'} VND
            </span>
          </div>
        )}
      </div>

      {/* Bộ lọc Kích thước */}
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
              const active = selectedSizes?.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSizeParam(size)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    border: active ? "2px solid #111" : "1px solid #d1d5db",
                    background: active ? "#111" : "#f9fafb",
                    color: active ? "#fff" : "#374151",
                    fontSize: "12px",
                    fontWeight: active ? 700 : 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
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

export default function ProductFilter({ products }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { toggleWishlist, isFavorite } = useContext(WishlistContext);

  // Đọc dữ liệu trực tiếp từ URL Search Params
  const priceRange = useMemo(() => ({
    min: searchParams.get("minPrice") ?? "",
    max: searchParams.get("maxPrice") ?? "",
  }), [searchParams]);

  const selectedSizes = useMemo(() => {
    const sizesParam = searchParams.get("sizes");
    return sizesParam ? sizesParam.split(",").map(Number) : [];
  }, [searchParams]);

  const showFavoritesOnly = searchParams.get("favorites") === "true";

  // Hàm cập nhật query param trên URL
  const updateQueryParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "" && value !== null && value !== undefined && value !== false) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Cập nhật riêng cho min/max giá
  const setPriceParam = useCallback((type, value) => {
    const params = new URLSearchParams(searchParams.toString());
    const key = type === "min" ? "minPrice" : "maxPrice";
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Toggle size trong URL
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
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams, selectedSizes]);

  // Toggle yêu thích trong URL
  const toggleFavoriteParam = useCallback(() => {
    updateQueryParam("favorites", !showFavoritesOnly ? "true" : "");
  }, [updateQueryParam, showFavoritesOnly]);

  // Xóa tất cả filter
  const clearAll = useCallback(() => {
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  // ĐỒNG BỘ DỮ LIỆU: Trích xuất màu sắc và kích cỡ từ variants
  const processedProducts = useMemo(() => {
    return (products || []).map((p) => {
      const mappedColors = p.colors || p.variants?.map((v) => v.color) || [];
      const uniqueColors = [...new Set(mappedColors)].filter(Boolean);

      const mappedSizes = p.sizes || p.variants?.flatMap((v) => v.sizes || []) || [];
      const uniqueSizes = [...new Set(mappedSizes)].map(Number).sort((a, b) => a - b);

      return {
        ...p,
        displayColors: uniqueColors,
        displaySizes: uniqueSizes,
      };
    });
  }, [products]);

  // Lấy danh sách tổng hợp các size duy nhất
  const allSizes = useMemo(() => {
    const sizes = processedProducts.flatMap((p) => p.displaySizes || []);
    return [...new Set(sizes)].sort((a, b) => a - b);
  }, [processedProducts]);

  // Logic lọc sản phẩm
  const filtered = useMemo(() => {
    return processedProducts.filter((p) => {
      const productId = p._id?.$oid || p._id;
      
      if (showFavoritesOnly && !isFavorite(productId)) {
        return false;
      }

      const price = Number(p.price) || 0;
      const minOk = priceRange.min === "" || price >= Number(priceRange.min);
      const maxOk = priceRange.max === "" || price <= Number(priceRange.max);
        
      const sizeOk =
        selectedSizes.length === 0 ||
        selectedSizes.some((s) => (p.displaySizes || []).includes(Number(s)));
        
      return minOk && maxOk && sizeOk;
    });
  }, [processedProducts, priceRange, selectedSizes, showFavoritesOnly, isFavorite]);

  // Đếm số lượng bộ lọc đang hoạt động
  const activeCount = useMemo(() => {
    let count = selectedSizes.length;
    if (priceRange.min !== "" || priceRange.max !== "") count++;
    if (showFavoritesOnly) count++;
    return count;
  }, [selectedSizes.length, priceRange.min, priceRange.max, showFavoritesOnly]);

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

  // Component Product Card để tránh lặp code
  const ProductCard = useCallback(({ product }) => {
    const stockQty = product.quantity ?? 12;
    const progressWidth = Math.min(100, Math.round((stockQty / 100) * 100));
    const productId = product._id?.$oid || product._id;
    const isFav = isFavorite(productId);

    return (
      <div className="col-sm-6 col-lg-4">
        <div
          className="card h-100 border-0 shadow-sm card-product nk-card"
          style={{ backgroundColor: "var(--surface-card)", borderRadius: "12px", overflow: "hidden", position: "relative" }}
        >
          {/* NÚT TRÁI TIM WISHLIST */}
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
              transition: "all 0.2s ease"
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

          <Link
            href={`/products/${productId}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="d-flex align-items-center justify-content-center overflow-hidden"
              style={{ height: "250px", backgroundColor: "#f9f9f9" }}
            >
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

              {/* HIỂN THỊ KÍCH THƯỚC */}
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
                  {product.displaySizes.length > 4 && (
                    <span style={{ fontSize: "11px", color: "#9ca3af", padding: "2px 4px" }}>
                      +{product.displaySizes.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* HIỂN THỊ MÀU SẮC */}
              {product.displayColors?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                  {product.displayColors.slice(0, 4).map((color) => (
                    <span
                      key={color}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        padding: "2px 7px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#fff",
                        color: "#6b7280",
                      }}
                    >
                      {color}
                    </span>
                  ))}
                  {product.displayColors.length > 4 && (
                    <span style={{ fontSize: "11px", color: "#9ca3af", padding: "2px 4px" }}>
                      +{product.displayColors.length - 4}
                    </span>
                  )}
                </div>
              )}

              <p
                className="small text-secondary mb-2 custom-scrollbar"
                style={{ 
                  height: "72px",
                  overflowY: "auto",
                  paddingRight: "4px",
                  textAlign: "justify",
                  fontSize: "13px",
                  lineHeight: "1.4"
                }}
              >
                {product.description}
              </p>

              {/* THANH SỐ LƯỢNG TỒN KHO */}
              <div className="mb-2" style={{ fontSize: "12px" }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted">
                    Còn lại: <strong style={{ color: "#111" }}>{stockQty}</strong> sản phẩm
                  </span>
                </div>
                <div className="progress" style={{ height: "4px", backgroundColor: "#e5e7eb" }}>
                  <div
                    className="progress-bar bg-dark"
                    role="progressbar"
                    style={{ width: `${progressWidth}%` }}
                    aria-valuenow={stockQty}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>

              <div className="fw-bold text-danger fs-5 mb-3">
                {product.price ? Number(product.price).toLocaleString("vi-VN") : 0} VND
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
  }, [isFavorite, toggleWishlist]);

  return (
    <div>
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
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          Bộ lọc{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          {filtered.length} / {products?.length || 0} sản phẩm
        </span>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1000,
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              width: "300px",
              maxWidth: "85vw",
              height: "100%",
              overflowY: "auto",
              padding: "24px 16px",
              borderRadius: "0 12px 12px 0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontWeight: 700, fontSize: "16px" }}>Bộ lọc</span>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
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
          <div className="d-none d-md-flex align-items-center mb-3" style={{ fontSize: "13px", color: "#6b7280", gap: "8px" }}>
            <span>
              Hiển thị <strong style={{ color: "#111" }}>{filtered.length}</strong> / {products?.length || 0} sản phẩm
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

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
              {showFavoritesOnly ? (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>❤️</div>
                  <p style={{ fontWeight: 600, fontSize: "16px", color: "#374151" }}>Chưa thêm sản phẩm vào mục yêu thích</p>
                  <p style={{ fontSize: "14px" }}>Hãy nhấn nút trái tim ở sản phẩm bạn thích để xem lại tại đây.</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                  <p style={{ fontWeight: 600, fontSize: "16px", color: "#374151" }}>Không tìm thấy sản phẩm</p>
                  <p style={{ fontSize: "14px" }}>Thử thay đổi bộ lọc</p>
                </>
              )}
              <button
                onClick={clearAll}
                style={{
                  marginTop: "12px",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((product) => (
                <ProductCard key={product._id?.$oid || product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
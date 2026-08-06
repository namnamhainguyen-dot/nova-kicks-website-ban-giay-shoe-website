import { useState, useEffect, useCallback, useMemo } from 'react';

export default function FilterPanel({
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

  // Hàm áp dụng giá trị vào URL chính thức
  const handleApplyPrice = useCallback(() => {
    const minVal = localMin !== '' ? Number(localMin).toString() : '';
    const maxVal = localMax !== '' ? Number(localMax).toString() : '';
    
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
    const presetMinStr = preset.min !== '' && preset.min !== undefined ? preset.min.toString() : '';
    const presetMaxStr = preset.max !== '' && preset.max !== undefined ? preset.max.toString() : '';

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
      setPriceParam('min', preset.min);
      setPriceParam('max', preset.max);
    }
  }, [localMin, localMax, setPriceParam]);

  // Format số tiền hiển thị
  const formatPrice = useCallback((value) => {
    if (!value) return '';
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

  // Các preset giá
  const pricePresets = useMemo(() => [
    { label: "Dưới 200k", min: "", max: 200000 },
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
      {/* Tiêu đề & Nút xóa tất cả */}
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

      {/* LỌC SẢN PHẨM YÊU THÍCH */}
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
        
        {/* Input nhập khoảng giá */}
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
            {localMin && (
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
              }}
            />
            {localMax && (
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

        {/* Nút bấm áp dụng khoảng giá */}
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

        {/* Các nút Preset nhanh */}
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

        {/* Hiển thị tóm tắt khoảng giá đang chọn */}
        {(localMin || localMax) && (
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
            <span>Khoảng giá:</span>
            <span style={{ fontWeight: 600, color: "#111" }}>
              {localMin ? formatPrice(localMin) : '0'} - {localMax ? formatPrice(localMax) : '∞'} đ
            </span>
          </div>
        )}
      </div>

      {/* BỘ LỌC KÍCH THƯỚC (SIZES) */}
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
              const isSelected = selectedSizes?.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSizeParam(size)}
                  style={{
                    minWidth: "36px",
                    height: "36px",
                    padding: "0 8px",
                    borderRadius: "8px",
                    border: isSelected ? "1.5px solid #111" : "1px solid #e5e7eb",
                    background: isSelected ? "#111" : "#fff",
                    color: isSelected ? "#fff" : "#374151",
                    fontSize: "12px",
                    fontWeight: 600,
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
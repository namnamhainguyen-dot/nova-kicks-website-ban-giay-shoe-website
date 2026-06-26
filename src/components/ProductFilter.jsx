"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AddToCart from "@/components/AddToCart";

// ── BẢN ĐỒ ÁNH XẠ MÃ ID THỰC TẾ TỪ DB SANG TÊN THƯƠNG HIỆU ĐẸP ──
const CATEGORY_MAP = {
  "6a2932c7044b3063b3d05171": "NIKE",
  "6a2932c7044b3063b3d05172": "Giày tây",
  "6a2932c7044b3063b3d05173": "giày cao gót",
  "6a2932c7044b3063b3d05174": "giày sandal",

};

export default function ProductFilter({ products }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lấy danh sách các categoryID duy nhất có trong sản phẩm
  const allCategories = useMemo(() => {
    const cats = products.map((p) => p.categoryID).filter(Boolean).flat();
    return [...new Set(cats)].sort();
  }, [products]);

  const allSizes = useMemo(() => {
    const sizes = products.flatMap((p) => p.sizes || []);
    return [...new Set(sizes)].sort();
  }, [products]);

  // Logic lọc sản phẩm theo mã ID
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const price = Number(p.price) || 0;
      const minOk = priceRange.min === "" || price >= Number(priceRange.min);
      const maxOk = priceRange.max === "" || price <= Number(priceRange.max);
      
      const catOk =
        selectedCategories.length === 0 ||
        selectedCategories.some(
          (c) =>
            p.categoryID === c ||
            (Array.isArray(p.categoryID) && p.categoryID.includes(c))
        );
        
      const sizeOk =
        selectedSizes.length === 0 ||
        selectedSizes.some((s) => (p.sizes || []).includes(s));
        
      return minOk && maxOk && catOk && sizeOk;
    });
  }, [products, priceRange, selectedCategories, selectedSizes]);

  const activeCount =
    selectedCategories.length +
    selectedSizes.length +
    (priceRange.min !== "" || priceRange.max !== "" ? 1 : 0);

  function toggleItem(list, setList, value) {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function clearAll() {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPriceRange({ min: "", max: "" });
  }

  const FilterPanel = () => (
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

      {/* Bộ lọc Giá (VND) */}
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
          <input
            type="number"
            placeholder="Từ"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "13px",
              outline: "none",
              width: "100%",
            }}
          />
          <span style={{ color: "#9ca3af", fontSize: "12px" }}>—</span>
          <input
            type="number"
            placeholder="Đến"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "13px",
              outline: "none",
              width: "100%",
            }}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
          {[
            { label: "Dưới 200k", max: 200000 },
            { label: "200k–500k", min: 200000, max: 500000 },
            { label: "Trên 500k", min: 500000 },
          ].map((preset) => {
            const active =
              priceRange.min == (preset.min ?? "") &&
              priceRange.max == (preset.max ?? "");
            return (
              <button
                key={preset.label}
                onClick={() =>
                  setPriceRange(
                    active
                      ? { min: "", max: "" }
                      : { min: preset.min ?? "", max: preset.max ?? "" }
                  )
                }
                style={{
                  fontSize: "11px",
                  padding: "3px 9px",
                  borderRadius: "20px",
                  border: active ? "1.5px solid #111" : "1px solid #e5e7eb",
                  background: active ? "#111" : "#f9fafb",
                  color: active ? "#fff" : "#374151",
                  cursor: "pointer",
                  fontWeight: active ? 700 : 500,
                  transition: "all 0.15s",
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── HIỂN THỊ TÊN DANH MỤC THAY VÌ ID ── */}
      {allCategories.length > 0 && (
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
            Danh mục
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {allCategories.map((catID) => {
              const active = selectedCategories.includes(catID);
              // Lấy tên hiển thị từ CATEGORY_MAP, nếu không có thì fallback về chính mã ID
              const categoryName = CATEGORY_MAP[catID] || catID;

              return (
                <label
                  key={catID}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: active ? "#111" : "#374151",
                    fontWeight: active ? 600 : 400,
                    padding: "4px 0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      toggleItem(selectedCategories, setSelectedCategories, catID)
                    }
                    style={{ accentColor: "#111", width: "15px", height: "15px" }}
                  />
                  {/* Hiển thị Tên thương hiệu đẹp đẽ ra ngoài UI */}
                  {categoryName} 
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Bộ lọc Kích thước */}
      {allSizes.length > 0 && (
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
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleItem(selectedSizes, setSelectedSizes, size)}
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
          {filtered.length} / {products.length} sản phẩm
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
            <FilterPanel />
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Sidebar desktop */}
        <div className="col-md-3 d-none d-md-block">
          <FilterPanel />
        </div>

        {/* Product grid */}
        <div className="col-12 col-md-9">
          <div className="d-none d-md-flex align-items-center mb-3" style={{ fontSize: "13px", color: "#6b7280", gap: "8px" }}>
            <span>
              Hiển thị <strong style={{ color: "#111" }}>{filtered.length}</strong> / {products.length} sản phẩm
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
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
              <p style={{ fontWeight: 600, fontSize: "16px", color: "#374151" }}>Không tìm thấy sản phẩm</p>
              <p style={{ fontSize: "14px" }}>Thử thay đổi bộ lọc</p>
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
              {filtered.map((p) => (
                <div key={p._id?.$oid || p._id} className="col-sm-6 col-lg-4">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ backgroundColor: "var(--surface-card)" }}
                  >
                    <Link
                      href={`/products/${p._id?.$oid || p._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center overflow-hidden"
                        style={{ height: "250px", backgroundColor: "#f9f9f9" }}
                      >
                        <img
                          src={p.image || "/img/no-image.png"}
                          alt={p.name}
                          className="img-fluid"
                          style={{ maxHeight: "100%", objectFit: "contain" }}
                        />
                      </div>

                      <div className="card-body pb-0">
                        <h5 className="fw-bold text-truncate" title={p.name}>
                          {p.name}
                        </h5>

                        {p.sizes?.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "6px" }}>
                            {p.sizes.slice(0, 4).map((size) => (
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
                            {p.sizes.length > 4 && (
                              <span style={{ fontSize: "11px", color: "#9ca3af", padding: "2px 4px" }}>
                                +{p.sizes.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {p.colors?.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                            {p.colors.slice(0, 4).map((color) => (
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
                            {p.colors.length > 4 && (
                              <span style={{ fontSize: "11px", color: "#9ca3af", padding: "2px 4px" }}>
                                +{p.colors.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        <p
                          className="small text-secondary"
                          style={{ minHeight: "48px", overflow: "hidden" }}
                        >
                          {p.description}
                        </p>

                        <div className="fw-bold text-danger fs-5 mb-3">
                          {p.price ? Number(p.price).toLocaleString("vi-VN") : 0} VND
                        </div>
                      </div>
                    </Link>

                    <div className="card-body pt-0">
                      <Link href={`/products/${p._id?.$oid || p._id}`} style={{ textDecoration: "none" }}>
                        <button className="btn btn-dark w-100">Xem chi tiết</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
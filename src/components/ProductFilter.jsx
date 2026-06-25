"use client";

import { useState, useCallback } from "react";

const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 500.000đ", min: 0, max: 500000 },
  { label: "500.000đ – 1.000.000đ", min: 500000, max: 1000000 },
  { label: "1.000.000đ – 2.000.000đ", min: 1000000, max: 2000000 },
  { label: "Trên 2.000.000đ", min: 2000000, max: Infinity },
];

export default function ProductFilter({ products, onFilter }) {
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Lấy danh sách unique từ data
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const colors = [...new Set(
    products.flatMap((p) =>
      (p.variants || []).map((v) => v.color).filter(Boolean)
    )
  )];
  const sizes = [...new Set(
    products.flatMap((p) =>
      (p.variants || []).map((v) => v.size).filter(Boolean)
    )
  )];

  const applyFilter = useCallback(
    ({ priceIdx, cats, cols, szs }) => {
      const range = PRICE_RANGES[priceIdx ?? selectedPrice];
      const activeCats = cats ?? selectedCategories;
      const activeCols = cols ?? selectedColors;
      const activeSzs = szs ?? selectedSizes;

      const result = products.filter((p) => {
        const price = Number(p.price || 0);
        const inPrice = price >= range.min && price <= range.max;

        const inCat =
          activeCats.length === 0 ||
          activeCats.includes(p.category);

        const productColors = (p.variants || []).map((v) => v.color).filter(Boolean);
        const inColor =
          activeCols.length === 0 ||
          activeCols.some((c) => productColors.includes(c));

        const productSizes = (p.variants || []).map((v) => v.size).filter(Boolean);
        const inSize =
          activeSzs.length === 0 ||
          activeSzs.some((s) => productSizes.includes(s));

        return inPrice && inCat && inColor && inSize;
      });

      onFilter(result);
    },
    [products, selectedPrice, selectedCategories, selectedColors, selectedSizes, onFilter]
  );

  const handlePrice = (idx) => {
    setSelectedPrice(idx);
    applyFilter({ priceIdx: idx });
  };

  const toggleMulti = (value, current, setter, key) => {
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];
    setter(next);
    applyFilter({ [key]: next });
  };

  const handleReset = () => {
    setSelectedPrice(0);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    onFilter(products);
  };

  const hasFilter =
    selectedPrice !== 0 ||
    selectedCategories.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0;

  return (
    <aside style={{ minWidth: 220 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-bold">Bộ lọc</span>
        {hasFilter && (
          <button
            className="btn btn-link btn-sm text-danger p-0 text-decoration-none"
            onClick={handleReset}
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* ── Giá ── */}
      <FilterSection title="Giá">
        {PRICE_RANGES.map((r, idx) => (
          <div className="form-check mb-1" key={r.label}>
            <input
              className="form-check-input"
              type="radio"
              name="price"
              id={`price-${idx}`}
              checked={selectedPrice === idx}
              onChange={() => handlePrice(idx)}
            />
            <label className="form-check-label small" htmlFor={`price-${idx}`}>
              {r.label}
            </label>
          </div>
        ))}
      </FilterSection>

      {/* ── Danh mục ── */}
      {categories.length > 0 && (
        <FilterSection title="Danh mục">
          {categories.map((cat) => (
            <div className="form-check mb-1" key={cat}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`cat-${cat}`}
                checked={selectedCategories.includes(cat)}
                onChange={() =>
                  toggleMulti(cat, selectedCategories, setSelectedCategories, "cats")
                }
              />
              <label className="form-check-label small" htmlFor={`cat-${cat}`}>
                {cat}
              </label>
            </div>
          ))}
        </FilterSection>
      )}

      {/* ── Màu sắc ── */}
      {colors.length > 0 && (
        <FilterSection title="Màu sắc">
          <div className="d-flex flex-wrap gap-2">
            {colors.map((color) => {
              const active = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    toggleMulti(color, selectedColors, setSelectedColors, "cols")
                  }
                  className={`btn btn-sm ${active ? "btn-dark" : "btn-outline-secondary"}`}
                  style={{ fontSize: 12, padding: "3px 10px" }}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* ── Size ── */}
      {sizes.length > 0 && (
        <FilterSection title="Size">
          <div className="d-flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    toggleMulti(size, selectedSizes, setSelectedSizes, "szs")
                  }
                  className={`btn btn-sm ${active ? "btn-dark" : "btn-outline-secondary"}`}
                  style={{ fontSize: 12, padding: "3px 10px", minWidth: 40 }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </aside>
  );
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-bottom pb-3 mb-3">
      <button
        type="button"
        className="btn btn-link p-0 text-decoration-none text-dark w-100 d-flex justify-content-between align-items-center mb-2"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="fw-semibold small text-uppercase">{title}</span>
        <span style={{ fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && children}
    </div>
  );
}
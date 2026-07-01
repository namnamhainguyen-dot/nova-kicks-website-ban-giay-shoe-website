"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── helpers ───────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 8);

const emptyBatch = () => ({
  id: genId(),
  quantity: "",
  costPrice: "",
  supplier: "",
});

const emptyVariant = () => ({
  id: genId(),
  color: "",
  size: "",
  material: "",
  batches: [emptyBatch()],
});

// ─── component ─────────────────────────────────────────────
export default function ProductCreate() {
  const router = useRouter();

  // Thông tin chung
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("active");
  const [showOnHome, setShowOnHome] = useState(false);

  // 🌟 State quản lý danh mục sản phẩm
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  // Biến thể
  const [variants, setVariants] = useState([emptyVariant()]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🌟 Fetch danh sách danh mục từ API khi trang load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // ── variant helpers ──
  const updateVariant = (vIdx, field, value) =>
    setVariants((prev) =>
      prev.map((v, i) => (i === vIdx ? { ...v, [field]: value } : v))
    );

  const addVariant = () =>
    setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariant = (vIdx) =>
    setVariants((prev) => prev.filter((_, i) => i !== vIdx));

  // ── batch helpers ──
  const updateBatch = (vIdx, bIdx, field, value) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i !== vIdx
          ? v
          : {
              ...v,
              batches: v.batches.map((b, j) =>
                j === bIdx ? { ...b, [field]: value } : b
              ),
            }
      )
    );

  const addBatch = (vIdx) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i !== vIdx ? v : { ...v, batches: [...v.batches, emptyBatch()] }
      )
    );

  const removeBatch = (vIdx, bIdx) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i !== vIdx
          ? v
          : { ...v, batches: v.batches.filter((_, j) => j !== bIdx) }
      )
    );

  // ── submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate danh mục
    if (!categoryId) {
      setError("Vui lòng chọn một danh mục sản phẩm.");
      return;
    }

    setSaving(true);
    setError("");

    // Validate: mỗi biến thể phải có ít nhất 1 lô với số lượng > 0
    for (const v of variants) {
      if (!v.color && !v.size && !v.material) {
        setError("Mỗi biến thể cần có ít nhất một thuộc tính (màu / size / chất liệu).");
        setSaving(false);
        return;
      }
      for (const b of v.batches) {
        if (!b.quantity || Number(b.quantity) <= 0) {
          setError("Số lượng mỗi lô phải lớn hơn 0.");
          setSaving(false);
          return;
        }
      }
    }

    try {
      const payload = {
        name,
        price: Number(price),
        description,
        image,
        status,
        showOnHome,
        categoryId, // Gửi chuẩn chuỗi hex ID lên server
        variants: variants.map((v) => ({
          color: v.color,
          size: v.size,
          material: v.material,
          batches: v.batches.map((b) => ({
            quantity: Number(b.quantity),
            costPrice: Number(b.costPrice) || 0,
            supplier: b.supplier,
          })),
        })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Lưu sản phẩm thất bại");
      }

      router.refresh();
      router.push("/admin/product");
    } catch (err) {
      setError(err?.message || "Đã có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content">
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>

        {/* ══════════════════════════════════════
            SECTION 1 — Thông tin sản phẩm
        ══════════════════════════════════════ */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-4">① Thông tin sản phẩm</h5>

            <div className="row g-3 mb-3">
              <div className="col-md-8">
                <label className="form-label">Tên sản phẩm</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nike Air Force 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              {/* 🌟 ĐÃ SỬA: Hàm chọn danh mục trích xuất chính xác chuỗi hex string */}
              <div className="col-md-4">
                <label className="form-label">Danh mục sản phẩm</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => {
                    // Trích xuất chuỗi ID từ đối tượng DB bọc bằng $oid hoặc giữ nguyên nếu là chuỗi
                    const actualId = typeof cat._id === "object" && cat._id?.$oid 
                      ? cat._id.$oid 
                      : cat._id;

                    return (
                      <option key={actualId} value={actualId}>
                        {cat.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Giá bán (VNĐ)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Link ảnh</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Mô tả</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Nhập mô tả sản phẩm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="showOnHome"
                checked={showOnHome}
                onChange={(e) => setShowOnHome(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showOnHome">
                Hiển thị trên trang chủ
              </label>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            SECTION 2 & 3 — Biến thể + Lô hàng
        ══════════════════════════════════════ */}
        <div className="mb-2 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-0">② Biến thể &amp; Lô hàng</h5>
            <small className="text-muted">
              Mỗi biến thể (màu / size / chất liệu) có thể có nhiều lô nhập kho.
            </small>
          </div>
          <button
            type="button"
            className="btn btn-outline-dark btn-sm"
            onClick={addVariant}
          >
            + Thêm biến thể
          </button>
        </div>

        {variants.map((variant, vIdx) => (
          <div key={variant.id} className="card shadow-sm border-0 mb-3">
            <div className="card-body">

              {/* Header biến thể */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-semibold text-secondary small text-uppercase">
                  Biến thể #{vIdx + 1}
                </span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeVariant(vIdx)}
                  >
                    ✕ Xóa biến thể
                  </button>
                )}
              </div>

              {/* Thuộc tính biến thể */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label">Màu sắc</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Trắng, Đen..."
                    value={variant.color}
                    onChange={(e) => updateVariant(vIdx, "color", e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Size / Kích cỡ</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: 40, 41, 42..."
                    value={variant.size}
                    onChange={(e) => updateVariant(vIdx, "size", e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Chất liệu</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Da, Canvas..."
                    value={variant.material}
                    onChange={(e) => updateVariant(vIdx, "material", e.target.value)}
                  />
                </div>
              </div>

              {/* Lô hàng */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-semibold">Lô hàng nhập kho</span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => addBatch(vIdx)}
                >
                  + Thêm lô
                </button>
              </div>

              {/* Header cột lô hàng */}
              <div className="row g-2 mb-1 px-1">
                <div className="col-1">
                  <span className="small text-muted">Lô</span>
                </div>
                <div className="col-3">
                  <span className="small text-muted">Số lượng <span className="text-danger">*</span></span>
                </div>
                <div className="col-3">
                  <span className="small text-muted">Giá nhập (đ)</span>
                </div>
                <div className="col-4">
                  <span className="small text-muted">Nhà cung cấp</span>
                </div>
                <div className="col-1" />
              </div>

              {variant.batches.map((batch, bIdx) => (
                <div key={batch.id} className="row g-2 mb-2 align-items-center">
                  {/* Số thứ tự lô */}
                  <div className="col-1">
                    <span
                      className="badge bg-secondary"
                      title={`Lô ${String(bIdx + 1).padStart(3, "0")}`}
                    >
                      {String(bIdx + 1).padStart(3, "0")}
                    </span>
                  </div>

                  {/* Số lượng */}
                  <div className="col-3">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="0"
                      min={1}
                      value={batch.quantity}
                      onChange={(e) => updateBatch(vIdx, bIdx, "quantity", e.target.value)}
                      required
                    />
                  </div>

                  {/* Giá nhập */}
                  <div className="col-3">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="0"
                      min={0}
                      value={batch.costPrice}
                      onChange={(e) => updateBatch(vIdx, bIdx, "costPrice", e.target.value)}
                    />
                  </div>

                  {/* Nhà cung cấp */}
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Tên NCC..."
                      value={batch.supplier}
                      onChange={(e) => updateBatch(vIdx, bIdx, "supplier", e.target.value)}
                    />
                  </div>

                  {/* Xóa lô */}
                  <div className="col-1 text-end">
                    {variant.batches.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 lh-1"
                        onClick={() => removeBatch(vIdx, bIdx)}
                        title="Xóa lô này"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Tổng lô */}
              <div className="mt-2 text-end">
                <small className="text-muted">
                  Tổng nhập:{" "}
                  <strong>
                    {variant.batches
                      .reduce((sum, b) => sum + (Number(b.quantity) || 0), 0)
                      .toLocaleString("vi-VN")}
                  </strong>{" "}
                  sản phẩm /{" "}
                  <strong>
                    {variant.batches
                      .reduce(
                        (sum, b) =>
                          sum + (Number(b.quantity) || 0) * (Number(b.costPrice) || 0),
                        0
                      )
                      .toLocaleString("vi-VN")}
                    đ
                  </strong>{" "}
                  vốn
                </small>
              </div>
            </div>
          </div>
        ))}

        {/* ── Actions ── */}
        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-dark px-4" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
          <Link href="/admin/product" className="btn btn-outline-secondary">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
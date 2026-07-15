"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SIZE_OPTIONS = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

export default function ProductCreate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("active");

  const [categoryId, setCategoryId] = useState(""); 
  const [categories, setCategories] = useState([]); 

  const [sizes, setSizes] = useState([]); 
  const [colors, setColors] = useState([]); 
  const [colorInput, setColorInput] = useState("");

  const [imagesByColor, setImagesByColor] = useState({});
  const [quantitiesByColor, setQuantitiesByColor] = useState({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size].sort((a, b) => a - b)
    );
  };

  const addColor = () => {
    const value = colorInput.trim();
    if (!value) return;
    if (colors.includes(value)) {
      setColorInput("");
      return;
    }
    setColors((prev) => [...prev, value]);
    setQuantitiesByColor((prev) => ({ ...prev, [value]: 0 }));
    setColorInput("");
  };

  const handleColorKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addColor();
    }
  };

  const removeColor = (color) => {
    setColors((prev) => prev.filter((c) => c !== color));
    setImagesByColor((prev) => {
      const updated = { ...prev };
      delete updated[color];
      return updated;
    });
    setQuantitiesByColor((prev) => {
      const updated = { ...prev };
      delete updated[color];
      return updated;
    });
  };

  const handleColorImageUrlChange = (color, url) => {
    setImagesByColor((prev) => ({ ...prev, [color]: url }));
  };

  const handleColorQuantityChange = (color, val) => {
    const numValue = Math.max(0, parseInt(val) || 0);
    setQuantitiesByColor((prev) => ({ ...prev, [color]: numValue }));
  };

  const totalVariantsQuantity = colors.reduce((sum, color) => sum + (quantitiesByColor[color] || 0), 0);
  const remainingQuantity = (Number(quantity) || 0) - totalVariantsQuantity;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!categoryId) {
      setError("Vui lòng chọn một danh mục sản phẩm.");
      return;
    }
    if (sizes.length === 0) {
      setError("Vui lòng chọn ít nhất 1 size.");
      return;
    }
    if (colors.length === 0) {
      setError("Vui lòng thêm ít nhất 1 màu.");
      return;
    }

    const targetQty = Number(quantity) || 0;
    if (totalVariantsQuantity !== targetQty) {
      if (totalVariantsQuantity > targetQty) {
        setError(`Tổng số lượng các màu (${totalVariantsQuantity}) vượt quá kho tổng (${targetQty}).`);
      } else {
        setError(`Chưa phân bổ hết! Vui lòng thêm ${remainingQuantity} sản phẩm cho các màu để khớp với kho tổng.`);
      }
      return;
    }

    setSaving(true);
    setError("");

    // Cấu trúc mảng variants để lưu trực tiếp vào database
    const finalVariants = colors.map((color) => ({
      color: color,
      image: imagesByColor[color] || image, // Nếu màu không có ảnh riêng, lấy ảnh chính làm mặc định
      quantity: quantitiesByColor[color] || 0,
      sizes: sizes.map(Number) 
    }));

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          image,
          quantity: Number(quantity),
          status,
          categoryId,
          variants: finalVariants // Gửi mảng variants chuẩn lên server
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Thêm sản phẩm thất bại");
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
    <div className="content admin-product-form py-4">
      <div className="card shadow">
        <div className="card-body">
          <h4 className="card-title mb-4">Thêm sản phẩm mới</h4>

          {error && <div className="alert alert-danger font-weight-bold">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="productName" className="form-label font-weight-bold">Tên sản phẩm</label>
              <input
                type="text"
                className="form-control"
                id="productName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="row row-cols-1 row-cols-md-2 g-3 mb-3">
              <div className="col">
                <label htmlFor="price" className="form-label">Giá (VNĐ)</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div className="col">
                <label htmlFor="quantity" className="form-label">Số lượng tổng kho</label>
                <input
                  type="number"
                  className="form-control"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="0"
                />
                <div className="form-text mt-1">
                  Đã phân bổ: <strong className="text-primary">{totalVariantsQuantity}</strong> / {quantity || 0} | 
                  {quantity && totalVariantsQuantity === Number(quantity) ? (
                    <span className="badge bg-success ms-1">Đã khớp dữ liệu</span>
                  ) : (quantity && remainingQuantity > 0) ? (
                    <span className="badge bg-warning text-dark ms-1">Còn thiếu {remainingQuantity} sp</span>
                  ) : quantity ? (
                    <span className="badge bg-danger ms-1">Vượt quá {Math.abs(remainingQuantity)} sp</span>
                  ) : (
                    <span className="badge bg-secondary ms-1">Chưa có kho tổng</span>
                  )}
                </div>
              </div>
              
              <div className="col">
                <label htmlFor="category" className="form-label">Danh mục sản phẩm</label>
                <select
                  className="form-select"
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => {
                    const actualId = typeof cat._id === "object" && cat._id?.$oid ? cat._id.$oid : cat._id;
                    return (
                      <option key={actualId} value={actualId}>{cat.name}</option>
                    );
                  })}
                </select>
              </div>

              <div className="col">
                <label htmlFor="status" className="form-label">Trạng thái</label>
                <select className="form-select" id="status" value={status} onChange={(e) => setStatus(e.target.value)} required>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="image" className="form-label font-weight-bold">Link ảnh chính mặc định</label>
              <input
                type="text"
                className="form-control"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Mô tả sản phẩm</label>
              <textarea
                className="form-control"
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <hr className="my-4" />

            {/* Chọn Size */}
            <div className="mb-4">
              <label className="form-label fw-bold">⚙️ Chọn các Size hiện có</label>
              <div className="d-flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const active = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`btn btn-sm ${active ? "btn-dark" : "btn-outline-secondary"}`}
                      style={{ minWidth: 44 }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thiết lập màu */}
            <div className="mb-4">
              <label htmlFor="colorInput" className="form-label fw-bold">🎨 Thiết lập màu sắc</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  id="colorInput"
                  placeholder="Nhập tên màu rồi ấn Enter"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={handleColorKeyDown}
                />
                <button type="button" className="btn btn-outline-dark" onClick={addColor}>Thêm màu</button>
              </div>

              {colors.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {colors.map((color) => (
                    <span key={color} className="badge bg-secondary d-flex align-items-center gap-2" style={{ fontSize: 14, padding: "8px 10px" }}>
                      {color}
                      <button type="button" onClick={() => removeColor(color)} className="btn-close btn-close-white" style={{ fontSize: 10 }} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cấu hình chi tiết từng màu */}
            {colors.length > 0 && (
              <div className="mb-4 p-3 border rounded bg-light">
                <h6 className="form-label font-weight-bold border-bottom pb-2 mb-3 text-dark">📷 Cấu hình chi tiết theo màu</h6>
                <div className="d-flex flex-column gap-3">
                  {colors.map((color) => (
                    <div className="row g-2 align-items-center p-2 bg-white rounded border" key={color}>
                      <div className="col-md-2 col-12">
                        <span className="badge bg-dark px-3 py-2 w-100 text-center">{color}</span>
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Link Ảnh</span>
                          <input
                            type="text"
                            className="form-control"
                            value={imagesByColor[color] || ""}
                            onChange={(e) => handleColorImageUrlChange(color, e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3 col-9">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Số lượng</span>
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            value={quantitiesByColor[color] || 0}
                            onChange={(e) => handleColorQuantityChange(color, e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-1 d-none d-md-block text-end">
                        <button type="button" onClick={() => removeColor(color)} className="btn-close" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex gap-2 pt-2">
              <button type="submit" className="btn btn-dark px-4" disabled={saving}>
                {saving ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>
              <Link href="/admin/product" className="btn btn-outline-secondary">Hủy</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
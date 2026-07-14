"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Danh sách size cố định để chọn nhanh
const SIZE_OPTIONS = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

export default function UpdateProductClient({ id }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState(0); // Số lượng tổng
  const [status, setStatus] = useState("active");

  // ----- 🌟 Cấu hình Flash Sale 🌟 -----
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(0);

  // Quản lý danh mục
  const [categoryID, setCategoryID] = useState(""); 
  const [categories, setCategories] = useState([]); 

  // ----- Biến thể: size & màu -----
  const [sizes, setSizes] = useState([]); 
  const [colors, setColors] = useState([]); 
  const [colorInput, setColorInput] = useState("");
  const [imagesByColor, setImagesByColor] = useState({});
  
  // State quản lý số lượng riêng cho từng màu
  const [quantitiesByColor, setQuantitiesByColor] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("ID sản phẩm không hợp lệ.");
        setLoading(false); 
        return;
      }

      try {
        // 1. Tải danh sách danh mục
        const resCategories = await fetch("/api/categories");
        if (resCategories.ok) {
          const categoriesData = await resCategories.json();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }

        // 2. Tải thông tin chi tiết sản phẩm cần cập nhật
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Không tìm thấy sản phẩm.");
        }

        const product = await res.json();
        setName(product.name || "");
        setPrice(product.price || 0);
        setDescription(product.description || "");
        setImage(product.image || "");
        setQuantity(product.quantity || 0);
        setStatus(product.status || "active");
        setCategoryID(product.categoryID || product.categoryId || product.category?._id || "");

        // Đổ dữ liệu cấu hình Flash Sale từ Database
        setIsFlashSale(product.isFlashSale || false);
        setOriginalPrice(product.originalPrice || 0);

        // Đổ dữ liệu từ mảng variants của DB vào các State ở Client
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          const uniqueColors = new Set();
          const loadedImagesMap = {};
          const loadedQuantitiesMap = {}; 
          let unionSizes = new Set();

          product.variants.forEach((v) => {
            if (v.color) {
              uniqueColors.add(v.color);
              if (v.image) loadedImagesMap[v.color] = v.image;
              loadedQuantitiesMap[v.color] = v.quantity !== undefined ? v.quantity : 0;

              if (Array.isArray(v.sizes)) {
                v.sizes.forEach(s => unionSizes.add(Number(s)));
              }
            }
          });

          setColors(Array.from(uniqueColors));
          setImagesByColor(loadedImagesMap);
          setQuantitiesByColor(loadedQuantitiesMap); 
          setSizes(Array.from(unionSizes).sort((a, b) => a - b));
        } else {
          // Fallback cũ
          setSizes(Array.isArray(product.sizes) ? product.sizes.map(Number) : []);
          setColors(Array.isArray(product.colors) ? product.colors : []);
          setImagesByColor(product.imagesByColor && typeof product.imagesByColor === "object" ? product.imagesByColor : {});
          
          const initialQuantities = {};
          (product.colors || []).forEach(c => { initialQuantities[c] = 0; });
          setQuantitiesByColor(initialQuantities);
        }

      } catch (err) {
        setError(err?.message || "Lỗi khi tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Bật/tắt 1 size
  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size].sort((a, b) => a - b)
    );
  };

  // Thêm 1 màu mới
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

  // Hàm cập nhật số lượng của từng màu đơn lẻ
  const handleColorQuantityChange = (color, val) => {
    const numValue = Math.max(0, parseInt(val) || 0); // Đảm bảo >= 0
    setQuantitiesByColor((prev) => ({
      ...prev,
      [color]: numValue
    }));
  };

  // Tiện ích hiển thị tính tổng nhanh giúp Admin đối chiếu dữ liệu số lượng
  const totalVariantsQuantity = colors.reduce((sum, color) => sum + (quantitiesByColor[color] || 0), 0);
  const remainingQuantity = Number(quantity) - totalVariantsQuantity;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!categoryID) {
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

    // RÀNG BUỘC SỐ LƯỢNG CHẶT CHẼ KHI LƯU
    if (totalVariantsQuantity !== Number(quantity)) {
      if (totalVariantsQuantity > Number(quantity)) {
        setError(`Không thể lưu! Tổng số lượng các màu (${totalVariantsQuantity}) đang vượt quá số lượng tổng của sản phẩm (${quantity}) là ${Math.abs(remainingQuantity)} sản phẩm.`);
      } else {
        setError(`Không thể lưu! Bạn chưa phân bổ hết số lượng. Vui lòng cấu hình thêm ${remainingQuantity} sản phẩm cho các màu để khớp với số lượng tổng (${quantity}).`);
      }
      return;
    }

    setSaving(true);
    setError("");

    const finalVariants = colors.map((color) => ({
      color: color,
      image: imagesByColor[color] || "",
      quantity: quantitiesByColor[color] || 0,
      sizes: sizes.map(Number) 
    }));

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          description,
          image,
          quantity: Number(quantity),
          status,
          categoryID, 
          variants: finalVariants,
          // Gửi kèm dữ liệu Flash Sale lên API
          isFlashSale: Boolean(isFlashSale),
          originalPrice: isFlashSale ? Number(originalPrice) : 0 
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Cập nhật sản phẩm thất bại");
      }

      router.push("/admin/product");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Đã có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Xóa sản phẩm thất bại");
      }

      router.push("/admin/product");
    } catch (err) {
      setError(err?.message || "Đã có lỗi xảy ra.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="card shadow">
          <div className="card-body text-center">Đang tải thông tin sản phẩm...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content admin-product-form">
      <div className="card shadow">
        <div className="card-body">
          <h4 className="card-title mb-4">Sửa sản phẩm</h4>

          {error && <div className="alert alert-danger font-weight-bold">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="productName" className="form-label">Tên sản phẩm</label>
              <input
                type="text"
                className="form-control"
                id="productName"
                placeholder="Nhập tên sản phẩm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="row row-cols-2 g-3 mb-3">
              <div className="col">
                <label htmlFor="price" className="form-label">Giá bán hiện tại (VNĐ)</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  placeholder="Nhập giá sản phẩm"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="col">
                <label htmlFor="quantity" className="form-label">Số lượng tổng</label>
                <input
                  type="number"
                  className="form-control"
                  id="quantity"
                  placeholder="Nhập số lượng"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="0"
                />
                <div className="form-text mt-1">
                  Đã phân bổ: <strong className="text-primary">{totalVariantsQuantity}</strong> / {quantity} | 
                  Trạng thái: {remainingQuantity === 0 ? (
                    <span className="badge bg-success ms-1">Đã khớp dữ liệu</span>
                  ) : remainingQuantity > 0 ? (
                    <span className="badge bg-warning text-dark ms-1">Còn thiếu {remainingQuantity} sp</span>
                  ) : (
                    <span className="badge bg-danger ms-1">Vượt quá {Math.abs(remainingQuantity)} sp</span>
                  )}
                </div>
              </div>
              
              <div className="col">
                <label htmlFor="category" className="form-label">Danh mục sản phẩm</label>
                <select
                  className="form-select"
                  id="category"
                  value={categoryID}
                  onChange={(e) => setCategoryID(e.target.value)}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col">
                <label htmlFor="status" className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
            </div>

            {/* ==================== 🛠️ KHỐI CẤU HÌNH FLASH SALE (MỚI THÊM) ==================== */}
            <div className="card p-3 mb-4 rounded bg-light border-warning">
              <h6 className="form-label font-weight-bold text-danger text-uppercase mb-3">
                🔥 Cấu hình Chương trình Flash Sale
              </h6>
              
              <div className="form-check form-switch mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="isFlashSaleToggle"
                  checked={isFlashSale}
                  onChange={(e) => setIsFlashSale(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <label className="form-check-label font-weight-bold text-dark" htmlFor="isFlashSaleToggle" style={{ cursor: "pointer" }}>
                  Kích hoạt trạng thái Flash Sale cho sản phẩm này
                </label>
              </div>

              {isFlashSale && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="originalPrice" className="form-label small text-uppercase font-weight-bold text-muted">
                      Giá gốc ban đầu trước khi giảm (VNĐ)
                    </label>
                    <input 
                      type="number" 
                      className="form-control"
                      id="originalPrice"
                      placeholder="Ví dụ: 3500000"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      required={isFlashSale}
                      min="0"
                    />
                    <small className="form-text text-muted">
                      Giá gốc cũ dùng để gạch ngang trên trang chủ (Ô <span className="font-weight-bold">Giá bán hiện tại</span> ở trên sẽ là giá khuyến mãi chạy Flash sale).
                    </small>
                  </div>
                </div>
              )}
            </div>
            {/* ============================================================================== */}

            <div className="mb-3">
              <label htmlFor="image" className="form-label font-weight-bold">
                Link ảnh sản phẩm mặc định (Ảnh chính)
              </label>
              <input
                type="text"
                className="form-control"
                id="image"
                placeholder="Nhập URL ảnh sản phẩm chính"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Mô tả</label>
              <textarea
                className="form-control"
                id="description"
                rows={4}
                placeholder="Nhập mô tả sản phẩm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* ----- Chọn Size ----- */}
            <div className="mb-3">
              <label className="form-label font-weight-bold">Size kích cỡ</label>
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
              {sizes.length === 0 && (
                <div className="form-text text-danger">Chưa chọn size nào.</div>
              )}
            </div>

            {/* ----- Chọn Màu ----- */}
            <div className="mb-3">
              <label htmlFor="colorInput" className="form-label font-weight-bold">Màu sắc</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  id="colorInput"
                  placeholder="Nhập tên màu rồi nhấn Enter (vd: Đen)"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={handleColorKeyDown}
                />
                <button type="button" className="btn btn-outline-dark" onClick={addColor}>
                  Thêm màu
                </button>
              </div>

              {colors.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {colors.map((color) => (
                    <span
                      key={color}
                      className="badge bg-secondary d-flex align-items-center gap-2"
                      style={{ fontSize: 14, padding: "8px 10px" }}
                    >
                      {color}
                    </span>
                  ))}
                </div>
              )}
              {colors.length === 0 && (
                <div className="form-text text-danger">Chưa thêm màu nào.</div>
              )}
            </div>

            {/* ----- 📷 CẤU HÌNH CHI TIẾT ẢNH & SỐ LƯỢNG KÈM THEO MÀU VÀ NÚT XÓA ----- */}
            {colors.length > 0 && (
              <div className="mb-4 p-3 border rounded bg-light">
                <h6 className="form-label font-weight-bold border-bottom pb-2 mb-3 text-dark">
                  📷 Cấu hình đường dẫn ảnh & số lượng chi tiết theo màu sắc
                </h6>
                <div className="d-flex flex-column gap-3">
                  {colors.map((color) => (
                    <div className="row g-2 align-items-center p-2 bg-white rounded border" key={color}>
                      
                      {/* Badge Màu sắc hiển thị và nút xóa */}
                      <div className="col-md-2 col-12 d-flex justify-content-between align-items-center">
                        <span className="badge bg-dark px-3 py-2 text-wrap w-100 text-center">
                          {color}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="btn btn-sm btn-outline-danger ms-2 d-md-none"
                        >
                          Xóa
                        </button>
                      </div>

                      {/* Ô nhập ảnh sản phẩm */}
                      <div className="col-md-6 col-12">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Link Ảnh</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="URL hình ảnh"
                            value={imagesByColor[color] || ""}
                            onChange={(e) => handleColorImageUrlChange(color, e.target.value)}
                          />
                          {imagesByColor[color] && (
                            <span className="input-group-text p-1 bg-white">
                              <img 
                                src={imagesByColor[color]} 
                                alt="Preview" 
                                style={{ width: "24px", height: "24px", objectFit: "cover" }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ô nhập số lượng chi tiết cho từng màu */}
                      <div className="col-md-3 col-9">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">Số lượng</span>
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            placeholder="0"
                            value={quantitiesByColor[color] || 0}
                            onChange={(e) => handleColorQuantityChange(color, e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Nút xóa màu ở màn hình máy tính desktop */}
                      <div className="col-md-1 col-3 text-end d-none d-md-block">
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="btn btn-sm btn-close"
                          aria-label="Delete"
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----- Các nút thao tác ----- */}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-dark" disabled={saving || deleting}>
                {saving ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                {deleting ? "Đang xóa..." : "Xóa sản phẩm"}
              </button>
              <Link href="/admin/product" className="btn btn-outline-secondary">
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
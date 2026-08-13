"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Danh sách size cố định để chọn nhanh
const SIZE_OPTIONS = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

export default function UpdateProductClient({ id }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [status, setStatus] = useState("active");

  // Flash Sale (Đã tách bạch hoàn toàn, không bị ảnh hưởng hay đồng bộ tự động với giá thường nữa)
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [flashSalePrice, setFlashSalePrice] = useState(0);
  const [flashSaleBatch, setFlashSaleBatch] = useState("batch-1");

  // Quản lý danh mục
  const [categoryID, setCategoryID] = useState(""); 
  const [categories, setCategories] = useState([]); 

  // Biến thể màu và size chi tiết
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [variantDetails, setVariantDetails] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const mainImageInputRef = useRef(null);
  const colorImageInputRefs = useRef({});

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("ID sản phẩm không hợp lệ.");
        setLoading(false); 
        return;
      }

      try {
        const resCategories = await fetch("/api/categories");
        if (resCategories.ok) {
          const categoriesData = await resCategories.json();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }

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
        
        // SỬA TẠI ĐÂY: Dùng kiểu kiểm tra tường minh để không bị nuốt mất số liệu 0 hoặc ghi đè nhầm
        setIsFlashSale(Boolean(product.isFlashSale));
        setOriginalPrice(product.originalPrice !== undefined && product.originalPrice !== null ? product.originalPrice : 0);
        setFlashSalePrice(product.flashSalePrice !== undefined && product.flashSalePrice !== null ? product.flashSalePrice : 0);
        setFlashSaleBatch(product.flashSaleBatch || "batch-1");

        if (Array.isArray(product.variants) && product.variants.length > 0) {
          const loadedColors = [];
          const loadedDetails = {};

          product.variants.forEach((v) => {
            if (v.color) {
              loadedColors.push(v.color);
              
              const sizeMap = {};
              if (Array.isArray(v.sizes)) {
                v.sizes.forEach((s) => {
                  if (s && typeof s === "object") {
                    const sizeVal = s.size !== undefined && s.size !== null ? String(s.size) : null;
                    const qtyVal = Number(s.quantity ?? s.qty ?? s.stock ?? s.amount ?? 0);
                    
                    if (sizeVal !== null) {
                      sizeMap[sizeVal] = qtyVal;
                    }
                  }
                });
              }

              const calculatedColorQty = Object.values(sizeMap).reduce((a, b) => a + b, 0);
              const finalColorQty = calculatedColorQty > 0 ? calculatedColorQty : Number(v.quantity || 0);

              loadedDetails[v.color] = {
                image: v.image || "",
                quantity: finalColorQty,
                sizes: sizeMap,
              };
            }
          });

          setColors(loadedColors);
          setVariantDetails(loadedDetails);
        }
      } catch (err) {
        setError(err?.message || "Lỗi khi tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload ảnh thất bại');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      setError(error.message || 'Lỗi khi upload ảnh');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setImage(url);
  };

  const handleColorImageUpload = async (color, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      setVariantDetails((prev) => ({
        ...prev,
        [color]: {
          ...prev[color],
          image: url,
        },
      }));
    }
  };

  const addColor = () => {
    const value = colorInput.trim();
    if (!value) return;
    if (colors.includes(value)) {
      setColorInput("");
      return;
    }
    setColors((prev) => [...prev, value]);
    setVariantDetails((prev) => ({
      ...prev,
      [value]: {
        image: "",
        quantity: 0,
        sizes: {},
      },
    }));
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
    setVariantDetails((prev) => {
      const updated = { ...prev };
      delete updated[color];
      return updated;
    });
  };

  const handleColorImageUrlChange = (color, url) => {
    setVariantDetails((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        image: url,
      },
    }));
  };

  const handleSizeQuantityChange = (color, size, val) => {
    const numValue = Math.max(0, parseInt(val) || 0);
    const sizeKey = String(size);
    
    setVariantDetails((prev) => {
      const colorData = prev[color] || { image: "", quantity: 0, sizes: {} };
      const updatedSizes = { ...colorData.sizes, [sizeKey]: numValue };
      
      const totalColorQty = Object.values(updatedSizes).reduce((a, b) => a + b, 0);

      return {
        ...prev,
        [color]: {
          ...colorData,
          quantity: totalColorQty,
          sizes: updatedSizes,
        },
      };
    });
  };

  const totalVariantsQuantity = colors.reduce((sum, color) => {
    return sum + (variantDetails[color]?.quantity || 0);
  }, 0);

  const remainingQuantity = Number(quantity) - totalVariantsQuantity;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!categoryID) {
      setError("Vui lòng chọn một danh mục sản phẩm.");
      return;
    }
    if (colors.length === 0) {
      setError("Vui lòng thêm ít nhất 1 màu.");
      return;
    }

    if (totalVariantsQuantity !== Number(quantity)) {
      if (totalVariantsQuantity > Number(quantity)) {
        setError(`Không thể lưu! Tổng số lượng các biến thể màu (${totalVariantsQuantity}) đang vượt quá số lượng tổng sản phẩm (${quantity}).`);
      } else {
        setError(`Không thể lưu! Tổng số lượng phân bổ (${totalVariantsQuantity}) chưa khớp với số lượng tổng (${quantity}).`);
      }
      return;
    }

    setSaving(true);
    setError("");

    // Xử lý chuẩn xác cấu trúc sizes thành Array of Objects giống hệt trang Sửa
    const finalVariants = colors.map((color) => {
      const colorData = variantDetails[color] || {};
      const sizesArray = Object.entries(colorData.sizes || {})
        .filter(([_, qty]) => Number(qty) > 0)
        .map(([size, qty]) => ({
          size: Number(size),
          quantity: Number(qty),
        }));

      return {
        color: color,
        image: colorData.image || "",
        quantity: Number(colorData.quantity || 0),
        sizes: sizesArray,
      };
    });

    try {
      // ĐÃ SỬA: Chuyển từ POST sang PUT và thêm /${id} để cập nhật đúng sản phẩm hiện tại
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
          isFlashSale: Boolean(isFlashSale),
          originalPrice: isFlashSale ? Number(originalPrice) : 0,
          flashSalePrice: isFlashSale ? Number(flashSalePrice) : 0,
          flashSaleBatch: isFlashSale ? flashSaleBatch : null
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
      router.refresh();
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
          {uploading && <div className="alert alert-info">Đang upload ảnh...</div>}

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
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrice(val === "" ? "" : Math.max(0, Number(val)));
                    // ĐÃ XÓA đoạn code tự động gán đợt giá flash sale ở đây để bảo toàn giá trị Flash Sale độc lập
                  }}
                  min="0"
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

            {/* Flash Sale */}
            <div className="card p-3 mb-4 rounded bg-light border-warning">
              <h6 className="form-label font-weight-bold text-danger text-uppercase mb-3">
                Cấu hình Chương trình Flash Sale
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
                  <div className="col-md-4">
                    <label htmlFor="originalPrice" className="form-label small text-uppercase font-weight-bold text-muted">
                      Giá gốc ban đầu trước khi giảm (VNĐ)
                    </label>
                    <input 
                      type="number" 
                      className="form-control"
                      id="originalPrice"
                      placeholder="Ví dụ: 350000"
                      value={originalPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOriginalPrice(val === "" ? "" : Math.max(0, Number(val)));
                      }}
                      required={isFlashSale}
                      min="0"
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="flashSalePrice" className="form-label small text-uppercase font-weight-bold text-danger">
                      Giá bán Flash Sale (VNĐ)
                    </label>
                    <input 
                      type="number" 
                      className="form-control border-danger"
                      id="flashSalePrice"
                      placeholder="Ví dụ: 200000"
                      value={flashSalePrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFlashSalePrice(val === "" ? "" : Math.max(0, Number(val)));
                      }}
                      required={isFlashSale}
                      min="0"
                    />
                  </div>

                  {/* Lựa chọn đợt / số tuần Flash Sale */}
                  <div className="col-md-4">
                    <label htmlFor="flashSaleBatch" className="form-label small text-uppercase font-weight-bold text-muted">
                      Tuần Flash Sale áp dụng (Số tuần)
                    </label>
                    <input 
                      type="number" 
                      className="form-control"
                      id="flashSaleBatch"
                      placeholder="Ví dụ: 18"
                      value={flashSaleBatch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFlashSaleBatch(val === "" ? "" : Number(val));
                      }}
                      min="1"
                      max="53"
                    />
                    <div className="form-text text-muted">Nhập số tuần trong năm (VD: 18) để khớp với API lọc theo tuần.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Ảnh chính */}
            <div className="mb-3">
              <label htmlFor="image" className="form-label font-weight-bold">
                Link ảnh sản phẩm mặc định (Ảnh chính)
              </label>
              <div className="d-flex gap-2 align-items-center">
                <div className="flex-grow-1">
                  <input
                    type="text"
                    className="form-control"
                    id="image"
                    placeholder="Nhập URL ảnh sản phẩm chính"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => mainImageInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <i className="bi bi-upload"></i> Chọn file
                  </button>
                  <input
                    type="file"
                    ref={mainImageInputRef}
                    className="d-none"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                  />
                </div>
              </div>
              {image && (
                <div className="mt-2">
                  <img 
                    src={image} 
                    alt="Preview" 
                    style={{ maxHeight: "100px", objectFit: "contain" }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
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

            {/* Chọn Màu */}
            <div className="mb-3">
              <label htmlFor="colorInput" className="form-label font-weight-bold">Màu sắc biến thể</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  id="colorInput"
                  placeholder="Nhập tên màu rồi nhấn Enter (vd: Xanh)"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={handleColorKeyDown}
                />
                <button type="button" className="btn btn-outline-dark" onClick={addColor}>
                  Thêm màu
                </button>
              </div>
            </div>

            {/* Cấu hình Ảnh, Tổng lượng và Size chi tiết theo từng Màu */}
            {colors.length > 0 && (
              <div className="mb-4 p-3 border rounded bg-light">
                <h6 className="form-label font-weight-bold border-bottom pb-2 mb-3 text-dark">
                  🎨 Cấu hình Ảnh & Số lượng chi tiết theo Size cho từng Màu
                </h6>
                <div className="d-flex flex-column gap-3">
                  {colors.map((color) => {
                    const colorData = variantDetails[color] || { image: "", quantity: 0, sizes: {} };

                    return (
                      <div className="p-3 bg-white rounded border" key={color}>
                        <div className="row g-2 align-items-center mb-2">
                          <div className="col-md-2 col-12">
                            <span className="badge bg-dark px-3 py-2 text-wrap w-100 text-center fs-6">
                              {color}
                            </span>
                          </div>

                          <div className="col-md-7 col-10">
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">Ảnh Màu</span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="URL hình ảnh của màu này"
                                value={colorData.image}
                                onChange={(e) => handleColorImageUrlChange(color, e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => colorImageInputRefs.current[color]?.click()}
                                disabled={uploading}
                              >
                                <i className="bi bi-upload"></i>
                              </button>
                              <input
                                type="file"
                                ref={(el) => {
                                  if (el) colorImageInputRefs.current[color] = el;
                                }}
                                className="d-none"
                                accept="image/*"
                                onChange={(e) => handleColorImageUpload(color, e)}
                              />
                            </div>
                          </div>

                          <div className="col-md-2 col-2 text-end">
                            <span className="badge bg-info text-dark p-2 w-100">
                              Tổng: {colorData.quantity}
                            </span>
                          </div>

                          <div className="col-md-1 text-end">
                            <button
                              type="button"
                              onClick={() => removeColor(color)}
                              className="btn btn-sm btn-outline-danger w-100"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        {/* Phân bổ số lượng theo từng Size cho màu này */}
                        <div className="mt-2 pt-2 border-top">
                          <label className="small text-muted font-weight-bold mb-2 d-block">
                            Nhập số lượng tồn kho cho từng Size của màu <span className="text-dark font-weight-bold">{color}</span>:
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {SIZE_OPTIONS.map((size) => {
                              const sizeKey = String(size);
                              const sizeQty = colorData.sizes[sizeKey] || 0;
                              return (
                                <div key={size} className="input-group input-group-sm" style={{ width: "110px" }}>
                                  <span className="input-group-text bg-secondary text-white">Size {size}</span>
                                  <input
                                    type="number"
                                    className="form-control text-center"
                                    min="0"
                                    value={sizeQty}
                                    onChange={(e) => handleSizeQuantityChange(color, size, e.target.value)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-dark" disabled={saving || deleting || uploading}>
                {saving ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={saving || deleting || uploading}
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
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
  const [quantity, setQuantity] = useState(0);
  const [status, setStatus] = useState("active");

  // ----- Biến thể: size & màu -----
  const [sizes, setSizes] = useState([]); // ví dụ: [39, 40, 41]
  const [colors, setColors] = useState([]); // ví dụ: ["Đen", "Trắng"]
  const [colorInput, setColorInput] = useState("");

  // 🌟 STATE MỚI: Quản lý object ảnh theo màu { "Đen": "url_anh_den", "Trắng": "url_anh_trang" }
  const [imagesByColor, setImagesByColor] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("ID sản phẩm không hợp lệ.");
        loading(false);
        return;
      }

      try {
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
        setSizes(Array.isArray(product.sizes) ? product.sizes : []);
        setColors(Array.isArray(product.colors) ? product.colors : []);
        
        // 🌟 Lấy dữ liệu imagesByColor từ database nếu có
        setImagesByColor(product.imagesByColor && typeof product.imagesByColor === "object" ? product.imagesByColor : {});
      } catch (err) {
        setError(err?.message || "Lỗi khi tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Bật/tắt 1 size trong danh sách đã chọn
  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size].sort((a, b) => a - b)
    );
  };

  // Thêm 1 màu mới vào danh sách (từ ô input)
  const addColor = () => {
    const value = colorInput.trim();
    if (!value) return;
    if (colors.includes(value)) {
      setColorInput("");
      return;
    }
    setColors((prev) => [...prev, value]);
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
    // 🌟 Đồng thời xóa cấu hình ảnh của màu đó ra khỏi object
    setImagesByColor((prev) => {
      const updated = { ...prev };
      delete updated[color];
      return updated;
    });
  };

  // 🌟 HÀM MỚI: Cập nhật URL ảnh cho từng màu cụ thể
  const handleColorImageUrlChange = (color, url) => {
    setImagesByColor((prev) => ({
      ...prev,
      [color]: url
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (sizes.length === 0) {
      setError("Vui lòng chọn ít nhất 1 size.");
      return;
    }
    if (colors.length === 0) {
      setError("Vui lòng thêm ít nhất 1 màu.");
      return;
    }

    setSaving(true);
    setError("");

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
          sizes,
          colors,
          // 🌟 Gửi kèm object imagesByColor lên server API
          imagesByColor, 
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Cập nhật sản phẩm thất bại");
      }

      router.push("/admin/product");
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

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="productName" className="form-label">
                Tên sản phẩm
              </label>
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
                <label htmlFor="price" className="form-label">
                  Giá (VNĐ)
                </label>
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
                <label htmlFor="quantity" className="form-label">
                  Số lượng
                </label>
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
              </div>
              <div className="col">
                <label htmlFor="status" className="form-label">
                  Trạng thái
                </label>
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
              <label htmlFor="description" className="form-label">
                Mô tả
              </label>
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
              <label className="form-label">Size</label>
              <div className="d-flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const active = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`btn btn-sm ${
                        active ? "btn-dark" : "btn-outline-secondary"
                      }`}
                      style={{ minWidth: 44 }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {sizes.length === 0 && (
                <div className="form-text text-danger">
                  Chưa chọn size nào.
                </div>
              )}
            </div>

            {/* ----- Chọn Màu ----- */}
            <div className="mb-3">
              <label htmlFor="colorInput" className="form-label">
                Màu sắc
              </label>
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
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={addColor}
                >
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
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="btn-close btn-close-white"
                        style={{ fontSize: 10 }}
                        aria-label={`Xóa màu ${color}`}
                      />
                    </span>
                  ))}
                </div>
              )}

              {colors.length === 0 && (
                <div className="form-text text-danger">
                  Chưa thêm màu nào.
                </div>
              )}
            </div>

            {/* 🌟 KHU VỰC MỚI: Đường dẫn hình ảnh theo từng màu sắc */}
            {colors.length > 0 && (
              <div className="mb-4 p-3 border rounded bg-light">
                <h6 className="form-label font-weight-bold border-bottom pb-2 mb-3 text-dark">
                  📷 Cấu hình đường dẫn ảnh cho từng màu sắc
                </h6>
                <div className="row g-3">
                  {colors.map((color) => (
                    <div className="col-12" key={color}>
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-white" style={{ minWidth: "110px", justifyContent: "center" }}>
                          {color}
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`Nhập URL hình ảnh dành riêng cho màu ${color}`}
                          value={imagesByColor[color] || ""}
                          onChange={(e) => handleColorImageUrlChange(color, e.target.value)}
                        />
                        {imagesByColor[color] && (
                          <span className="input-group-text p-1 bg-white">
                            <img 
                              src={imagesByColor[color]} 
                              alt={`Preview ${color}`} 
                              style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "4px" }}
                              onError={(e) => { e.target.style.display = 'none'; }} // Ẩn nếu URL lỗi
                            />
                          </span>
                        )}
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
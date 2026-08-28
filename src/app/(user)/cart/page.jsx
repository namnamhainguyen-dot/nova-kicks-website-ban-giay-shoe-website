"use client";
import { CartContext } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";

export default function Cart() {
  const { cart, setCart } = useContext(CartContext);
  const [locationList, setLocationList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const router = useRouter();

  const getNormalizedSizeValue = (s) => {
    if (typeof s === 'object' && s !== null) {
      return s.size !== undefined ? s.size : '';
    }
    return s;
  };

  const fetchCartStock = useCallback(async () => {
    if (!cart || cart.length === 0) return;

    const uniqueProductIds = [...new Set(cart.map((item) => item._id))];
    const newStockMap = {};

    await Promise.all(
      uniqueProductIds.map(async (pId) => {
        try {
          const res = await fetch(`/api/products/${pId}`, { cache: "no-store" });
          if (!res.ok) return;
          const productData = await res.json();

          cart.filter(item => item._id === pId).forEach(item => {
            const key = `${item._id}-${item.selectedColor || "none"}-${item.selectedSize || "none"}`;
            let available = 0;

            if (productData.variants && productData.variants.length > 0) {
              const matchedVariant = productData.variants.find(v => v.color === item.selectedColor);
              if (matchedVariant) {
                const normSize = getNormalizedSizeValue(item.selectedSize);
                if (Array.isArray(matchedVariant.sizes) && matchedVariant.sizes.length > 0) {
                  const foundSize = matchedVariant.sizes.find(s => {
                    const sVal = getNormalizedSizeValue(s);
                    return String(sVal) === String(normSize) || Number(sVal) === Number(normSize);
                  });
                  available = foundSize?.quantity ?? 0;
                } else {
                  available = matchedVariant.quantity ?? 0;
                }
              }
            } else {
              available = productData.quantity ?? 0;
            }

            newStockMap[key] = available;
          });
        } catch (err) {
          console.error("Lỗi lấy thông tin tồn kho:", err);
        }
      })
    );

    setStockMap(newStockMap);
  }, [cart]);

  useEffect(() => {
    fetchCartStock();
  }, [fetchCartStock]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/tables");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server không trả về JSON");
        }
        const locations = await res.json();
        setLocationList(Array.isArray(locations) ? locations : []);
      } catch (err) {
        console.error("Lỗi lấy danh sách cửa hàng:", err);
        setLocationList([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLocations();
  }, []);

  useEffect(() => {
    setSelectedItems(cart.map((_, index) => index));
  }, [cart.length]);

  const toggleSelectItem = (index) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((_, index) => index));
    }
  };

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;

  const handleQuantity = (index, value, maxStock) => {
    let newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;

    if (maxStock !== undefined && newQuantity > maxStock) {
      newQuantity = maxStock;
    }

    const newCart = [...cart];
    if (newCart[index]) {
      newCart[index].quantity = newQuantity;
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  const handleRemoveAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      setCart([]);
      localStorage.removeItem("cart");
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) {
      alert("Bạn chưa chọn sản phẩm nào để xóa!");
      return;
    }
    if (window.confirm(`Xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
      const newCart = cart.filter((_, i) => !selectedItems.includes(i));
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  const total = cart.reduce(
    (sum, product, index) =>
      selectedItems.includes(index) ? sum + product.price * product.quantity : sum,
    0
  );

  const hasInvalidStockItem = useMemo(() => {
    return selectedItems.some((index) => {
      const item = cart[index];
      if (!item) return false;
      const key = `${item._id}-${item.selectedColor || "none"}-${item.selectedSize || "none"}`;
      const maxStock = stockMap[key];

      if (maxStock !== undefined) {
        return maxStock <= 0 || item.quantity > maxStock;
      }
      return false;
    });
  }, [selectedItems, cart, stockMap]);

  const handleGoToCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }

    if (hasInvalidStockItem) {
      alert("Vui lòng điều chỉnh lại số lượng các sản phẩm vượt quá tồn kho hoặc đã hết hàng trước khi thanh toán!");
      return;
    }

    const itemsToCheckout = cart.filter((_, index) => selectedItems.includes(index));
    sessionStorage.setItem("checkout_items", JSON.stringify(itemsToCheckout));
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return (
      <main className="container my-5 pt-5 px-3">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center py-5 shadow-sm rounded-4 bg-light border">
            <div className="display-4 mb-3">🛒</div>
            <h2 className="fw-bold mb-2">Giỏ hàng trống</h2>
            <p className="text-muted mb-4">Không có sản phẩm nào trong giỏ hàng của bạn lúc này.</p>
            <Link href="/products" className="btn btn-dark rounded-pill px-4 py-2">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container my-4 py-5 px-3 px-md-3">
      <style jsx global>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        .btn-checkout-custom {
          background-color: #111 !important;
          color: #ffffff !important;
          border: 2px solid #111 !important;
        }
        .btn-checkout-custom:hover:not(:disabled) {
          background-color: #111 !important;
          color: #ffffff !important;
          border-color: #111 !important;
          transform: none !important;
          box-shadow: none !important;
        }

        .link-continue-custom {
          color: #555;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .link-continue-custom:hover {
          color: #000;
          transform: translateX(-3px);
        }
      `}</style>

      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 mt-3 mt-md-0">
        <h1 className="h4 fw-bold mb-0">Giỏ hàng của bạn</h1>
        <span className="text-muted small">{cart.length} sản phẩm</span>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            
            {/* Giao diện Desktop (Bảng) */}
            <div className="table-responsive m-0 d-none d-md-block">
              <table className="table align-middle mb-0">
                <thead className="bg-light text-uppercase fs-7 text-muted">
                  <tr>
                    <th scope="col" style={{ width: "40px", paddingLeft: "20px" }}>
                      <input
                        type="checkbox"
                        className="form-check-input cursor-pointer"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        title="Chọn tất cả"
                      />
                    </th>
                    <th scope="col">Sản phẩm</th>
                    <th scope="col" style={{ width: "140px" }}>Số lượng</th>
                    <th scope="col" className="text-end" style={{ paddingRight: "20px" }}>Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((product, index) => {
                    const uniqueKey = `${product._id}-${product.selectedColor || "none"}-${product.selectedSize || "none"}`;
                    const checked = selectedItems.includes(index);
                    const maxStock = stockMap[uniqueKey];
                    const isExceeded = maxStock !== undefined && product.quantity > maxStock;
                    const isOutOfStock = maxStock !== undefined && maxStock <= 0;

                    return (
                      <tr 
                        key={uniqueKey} 
                        className={`border-bottom ${!checked ? "bg-light text-muted opacity-75" : isExceeded || isOutOfStock ? "table-danger" : ""}`}
                      >
                        <td style={{ paddingLeft: "20px" }}>
                          <input
                            type="checkbox"
                            className="form-check-input cursor-pointer"
                            checked={checked}
                            onChange={() => toggleSelectItem(index)}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3 py-2">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="rounded-3 border object-fit-cover"
                                style={{ width: "65px", height: "65px" }}
                              />
                            ) : (
                              <div className="bg-secondary rounded-3 text-white d-flex align-items-center justify-content-center" style={{ width: "65px", height: "65px", fontSize: "12px" }}>
                                Ảnh
                              </div>
                            )}
                            <div>
                              <h6 className="fw-semibold mb-1 text-truncate" style={{ maxWidth: "200px" }}>
                                {product.name}
                              </h6>
                              <div className="text-muted small d-flex gap-2">
                                {product.selectedColor && <span>Màu: <strong>{product.selectedColor}</strong></span>}
                                {product.selectedSize && <span>Size: <strong>{product.selectedSize}</strong></span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center border rounded-pill bg-white overflow-hidden shadow-sm" style={{ width: "105px", height: "32px" }}>
                            <button
                              type="button"
                              className="btn btn-sm border-0 bg-transparent px-2 text-secondary fw-bold"
                              style={{ fontSize: "14px", lineHeight: 1 }}
                              onClick={() => handleQuantity(index, product.quantity - 1, maxStock)}
                              disabled={product.quantity <= 1}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              className="form-control form-control-sm text-center border-0 bg-transparent p-0 shadow-none fw-semibold"
                              style={{ fontSize: "13px" }}
                              value={product.quantity}
                              min="1"
                              max={maxStock !== undefined ? maxStock : undefined}
                              onChange={(e) => handleQuantity(index, e.target.value, maxStock)}
                            />
                            <button
                              type="button"
                              className="btn btn-sm border-0 bg-transparent px-2 text-secondary fw-bold"
                              style={{ fontSize: "14px", lineHeight: 1 }}
                              onClick={() => handleQuantity(index, product.quantity + 1, maxStock)}
                              disabled={maxStock !== undefined && product.quantity >= maxStock}
                            >
                              +
                            </button>
                          </div>

                          {maxStock !== undefined && (
                            <div className="mt-1">
                              {isOutOfStock ? (
                                <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: "10px" }}>Hết hàng</span>
                              ) : isExceeded ? (
                                <span className="text-danger fw-semibold" style={{ fontSize: "10px" }}>Vượt quá kho ({maxStock})</span>
                              ) : product.quantity >= maxStock ? (
                                <span className="text-warning text-dark fw-semibold" style={{ fontSize: "10px" }}>Đạt tối đa ({maxStock})</span>
                              ) : (
                                <span className="text-muted" style={{ fontSize: "10px" }}>Còn {maxStock} sản phẩm</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-end fw-medium text-nowrap text-dark" style={{ paddingRight: "20px" }}>
                          {product.price.toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Giao diện Mobile */}
            <div className="d-block d-md-none p-3">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input cursor-pointer"
                    id="selectAllMobile"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                  <label className="form-check-label fw-semibold small" htmlFor="selectAllMobile">
                    Chọn tất cả ({cart.length})
                  </label>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                {cart.map((product, index) => {
                  const uniqueKey = `${product._id}-${product.selectedColor || "none"}-${product.selectedSize || "none"}`;
                  const checked = selectedItems.includes(index);
                  const maxStock = stockMap[uniqueKey];
                  const isExceeded = maxStock !== undefined && product.quantity > maxStock;
                  const isOutOfStock = maxStock !== undefined && maxStock <= 0;

                  return (
                    <div 
                      key={uniqueKey}
                      className={`p-3 rounded-3 border ${!checked ? "bg-light text-muted opacity-75" : isExceeded || isOutOfStock ? "border-danger bg-danger bg-opacity-10" : "bg-white"}`}
                    >
                      <div className="d-flex align-items-start gap-2 mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input cursor-pointer mt-1 flex-shrink-0"
                          checked={checked}
                          onChange={() => toggleSelectItem(index)}
                        />
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="rounded-3 border object-fit-cover flex-shrink-0"
                            style={{ width: "50px", height: "50px" }}
                          />
                        ) : (
                          <div className="bg-secondary rounded-3 text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "50px", height: "50px", fontSize: "11px" }}>
                            Ảnh
                          </div>
                        )}
                        
                        <div className="flex-grow-1 min-width-0 px-1">
                          <h6 className="fw-semibold mb-1 small text-break" style={{ fontSize: "13px", lineHeight: "1.3" }}>
                            {product.name}
                          </h6>
                          <div className="text-muted small d-flex flex-wrap gap-1" style={{ fontSize: "11px" }}>
                            {product.selectedColor && <span>Màu: <strong>{product.selectedColor}</strong></span>}
                            {product.selectedSize && <span>Size: <strong>{product.selectedSize}</strong></span>}
                          </div>
                        </div>

                        {/* Giá tiền sản phẩm đổi sang màu đen (text-dark) */}
                        <div className="text-end fw-bold text-dark flex-shrink-0" style={{ fontSize: "13px", minWidth: "75px" }}>
                          {product.price.toLocaleString("vi-VN")}đ
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-2">
                        <div className="d-flex align-items-center border rounded-pill bg-white overflow-hidden shadow-sm" style={{ width: "100px", height: "30px" }}>
                          <button
                            type="button"
                            className="btn btn-sm border-0 bg-transparent px-2 text-secondary fw-bold"
                            style={{ fontSize: "13px", lineHeight: 1 }}
                            onClick={() => handleQuantity(index, product.quantity - 1, maxStock)}
                            disabled={product.quantity <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            className="form-control form-control-sm text-center border-0 bg-transparent p-0 shadow-none fw-semibold"
                            style={{ fontSize: "12px" }}
                            value={product.quantity}
                            min="1"
                            max={maxStock !== undefined ? maxStock : undefined}
                            onChange={(e) => handleQuantity(index, e.target.value, maxStock)}
                          />
                          <button
                            type="button"
                            className="btn btn-sm border-0 bg-transparent px-2 text-secondary fw-bold"
                            style={{ fontSize: "13px", lineHeight: 1 }}
                            onClick={() => handleQuantity(index, product.quantity + 1, maxStock)}
                            disabled={maxStock !== undefined && product.quantity >= maxStock}
                          >
                            +
                          </button>
                        </div>

                        {maxStock !== undefined && (
                          <div>
                            {isOutOfStock ? (
                              <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: "9px" }}>Hết hàng</span>
                            ) : isExceeded ? (
                              <span className="text-danger fw-semibold" style={{ fontSize: "9px" }}>Vượt kho ({maxStock})</span>
                            ) : product.quantity >= maxStock ? (
                              <span className="text-warning text-dark fw-semibold" style={{ fontSize: "9px" }}>Tối đa ({maxStock})</span>
                            ) : (
                              <span className="text-muted" style={{ fontSize: "9px" }}>Còn {maxStock}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-footer bg-white border-0 p-3 d-flex justify-content-between align-items-center">
              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-3"
                onClick={handleRemoveSelected}
              >
                Xóa mục đã chọn
              </button>
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold"
                onClick={handleRemoveAll}
              >
                Xóa toàn bộ
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-light">
            <h5 className="fw-bold mb-3">Tóm tắt đơn hàng</h5>
            
            <div className="d-flex justify-content-between mb-2 text-muted small">
              <span>Đã chọn:</span>
              <span className="fw-semibold text-dark">{selectedItems.length} / {cart.length} sản phẩm</span>
            </div>

            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
              <span className="fw-medium">Tổng tiền tạm tính:</span>
              <span className="h4 fw-bold text-danger mb-0">{total.toLocaleString("vi-VN")}đ</span>
            </div>

            {hasInvalidStockItem && (
              <div className="alert alert-warning py-2 small text-center mb-3 rounded-3">
                ⚠️ Có sản phẩm vượt quá tồn kho hoặc hết hàng. Vui lòng điều chỉnh lại số lượng!
              </div>
            )}

            <button
              onClick={handleGoToCheckout}
              className="btn w-100 py-3 rounded-pill fw-bold mb-2 shadow-sm text-white border-0"
              style={{
                backgroundColor: "#f97316",
                transition: "background-color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ea580c";
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#f97316";
              }}
              disabled={selectedItems.length === 0 || hasInvalidStockItem}
            >
              Tiến hành thanh toán
            </button>

            <Link 
              href="/products" 
              className="link-continue-custom w-100 py-2 text-decoration-none small fw-semibold mt-1"
            >
              <span>←</span> Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
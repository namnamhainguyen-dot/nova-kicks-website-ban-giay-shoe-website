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
  const [stockMap, setStockMap] = useState({}); // Key -> Tồn kho thực tế trong DB
  const router = useRouter();

  // Helper chuẩn hóa size
  const getNormalizedSizeValue = (s) => {
    if (typeof s === 'object' && s !== null) {
      return s.size !== undefined ? s.size : '';
    }
    return s;
  };

  // Lấy tồn kho thực tế của từng sản phẩm từ API Database
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

  // Lấy danh sách cửa hàng / địa điểm
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

  // Mặc định tick chọn tất cả sản phẩm
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

  // Tăng / Giảm / Nhập số lượng có giới hạn theo Tồn kho
  const handleQuantity = (index, value, maxStock) => {
    let newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;

    // Ép số lượng không được vượt quá tồn kho thực tế
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

  const handleRemove = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
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

  // Tính tổng tiền cho các item được tick chọn
  const total = cart.reduce(
    (sum, product, index) =>
      selectedItems.includes(index) ? sum + product.price * product.quantity : sum,
    0
  );

  // 🛑 ĐIỀU KIỆN CHẶN THANH TOÁN:
  // Kiểm tra xem trong số các sản phẩm ĐƯỢC CHỌN, có sản phẩm nào số lượng > tồn kho hoặc hết hàng không
  const hasInvalidStockItem = useMemo(() => {
    return selectedItems.some((index) => {
      const item = cart[index];
      if (!item) return false;
      const key = `${item._id}-${item.selectedColor || "none"}-${item.selectedSize || "none"}`;
      const maxStock = stockMap[key];

      // Nếu đã load xong stockMap mà stock <= 0 hoặc quantity > maxStock
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
      <main className="container mt-5 pt-5">
        <div className="text-center py-5">
          <h1 className="mb-4">Giỏ hàng của bạn</h1>
          <div className="alert alert-info">
            <h3>🛒 Giỏ hàng trống</h3>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
            <Link href="/products" className="btn btn-primary mt-3">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-5 pt-5">
      <h1 className="text-center mb-4">Giỏ hàng của bạn</h1>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "50px" }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  title="Chọn tất cả"
                />
              </th>
              <th>Sản phẩm</th>
              <th style={{ width: "170px" }}>Số lượng</th>
              <th>Giá</th>
              <th>Tổng</th>
              <th style={{ width: "100px" }}>Hành động</th>
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
                <tr key={uniqueKey} className={!checked ? "table-secondary" : isExceeded || isOutOfStock ? "table-danger" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={checked}
                      onChange={() => toggleSelectItem(index)}
                    />
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="text-muted small mt-1">
                      {product.selectedColor && (
                        <div>Màu: {product.selectedColor}</div>
                      )}
                      {product.selectedSize && (
                        <div>Size: {product.selectedSize}</div>
                      )}
                    </div>
                    {product.image && (
                      <div className="mt-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleQuantity(index, product.quantity - 1, maxStock)}
                        disabled={product.quantity <= 1}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        className="form-control text-center"
                        style={{ width: "60px" }}
                        value={product.quantity}
                        min="1"
                        max={maxStock !== undefined ? maxStock : undefined}
                        onChange={(e) => handleQuantity(index, e.target.value, maxStock)}
                      />

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleQuantity(index, product.quantity + 1, maxStock)}
                        disabled={maxStock !== undefined && product.quantity >= maxStock}
                      >
                        +
                      </button>
                    </div>

                    {/* 🛑 Hiển thị trạng thái/Cảnh báo tồn kho */}
                    {maxStock !== undefined && (
                      <div className="mt-1">
                        {isOutOfStock ? (
                          <span className="badge bg-danger">Hết hàng</span>
                        ) : isExceeded ? (
                          <span className="text-danger fw-bold" style={{ fontSize: "11px", display: "block" }}>
                            Vượt quá tồn kho (Còn {maxStock})
                          </span>
                        ) : product.quantity >= maxStock ? (
                          <span className="text-warning fw-bold" style={{ fontSize: "11px", display: "block" }}>
                            Đã đạt số lượng tối đa ({maxStock})
                          </span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: "11px", display: "block" }}>
                            Còn {maxStock} sản phẩm
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>{product.price.toLocaleString("vi-VN")}đ</td>
                  <td>{(product.quantity * product.price).toLocaleString("vi-VN")}đ</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(index)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={4}>
                TỔNG TIỀN ({selectedItems.length}/{cart.length} sản phẩm đã chọn)
              </th>
              <th className="text-danger h5">{total.toLocaleString("vi-VN")}đ</th>
              <th>
                <div className="d-flex flex-column gap-1">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleRemoveSelected}
                  >
                    Xóa đã chọn
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={handleRemoveAll}
                  >
                    Xóa hết
                  </button>
                </div>
              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cảnh báo khi nút thanh toán bị khóa do tồn kho */}
      {hasInvalidStockItem && (
        <div className="alert alert-warning text-center mt-3">
          ⚠️ Có sản phẩm đã chọn vượt quá số lượng trong kho hoặc hết hàng. Vui lòng điều chỉnh lại số lượng trước khi thanh toán.
        </div>
      )}

      <div className="d-flex justify-content-between mt-4 align-items-center">
        <Link href="/products" className="btn btn-outline-secondary">
          ← Tiếp tục mua sắm
        </Link>
        <button
          onClick={handleGoToCheckout}
          className="btn btn-success btn-lg px-5 fw-bold shadow-sm"
          disabled={selectedItems.length === 0 || hasInvalidStockItem}
        >
          Tiến hành thanh toán →
        </button>
      </div>
    </main>
  );
}
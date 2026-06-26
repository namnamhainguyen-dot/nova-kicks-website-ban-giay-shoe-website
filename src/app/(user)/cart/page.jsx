"use client";
import { CartContext } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Cart() {
  const { cart, setCart } = useContext(CartContext);
  const [locationList, setLocationList] = useState([]);
  const [inputLocation, setInputLocation] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchLocations() {
      try {
<<<<<<< Updated upstream
        const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api"/tables");
=======
        setIsLoading(true);
        const res = await fetch("http://localhost:3000/api/tables");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server không trả về JSON");
        }
        
>>>>>>> Stashed changes
        const locations = await res.json();
        setLocationList(locations);
      } catch (err) {
        console.error("Lỗi lấy danh sách cửa hàng:", err);
<<<<<<< Updated upstream
=======
        setLocationList([]);
      } finally {
        setIsLoading(false);
>>>>>>> Stashed changes
      }
    }
    fetchLocations();
  }, []);

<<<<<<< Updated upstream
  // Cập nhật số lượng sản phẩm
  const handleQuantity = (id, value) => {
=======
  // Thay đổi: Nhận thêm selectedSize và selectedColor để kiểm tra chính xác hàng cần cập nhật số lượng
  const handleQuantity = (id, selectedSize, selectedColor, value) => {
    const newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) return;
    
>>>>>>> Stashed changes
    const newCart = [...cart];
    const index = newCart.findIndex(
      (p) => p._id === id && p.selectedSize === selectedSize && p.selectedColor === selectedColor
    );
    if (index >= 0) {
      newCart[index].quantity = Number(value);
      setCart(newCart);
    }
  };

  // Thay đổi: Xóa đúng sản phẩm có cùng phân loại đã chọn
  const handleRemove = (id, selectedSize, selectedColor) => {
    const newCart = cart.filter(
      (p) => !(p._id === id && p.selectedSize === selectedSize && p.selectedColor === selectedColor)
    );
    setCart(newCart);
  };

  const handleRemoveAll = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

<<<<<<< Updated upstream
  // Thanh toán
=======
  const validateOrder = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống! Vui lòng thêm sản phẩm.");
      return false;
    }
    
    if (!inputLocation) {
      alert("Vui lòng chọn địa điểm nhận hàng!");
      return false;
    }
    
    return true;
  };

>>>>>>> Stashed changes
  const handleOrder = async () => {
    const order = {
      name: "Tên Khách",
      location_id: inputLocation,
<<<<<<< Updated upstream
      order_items: cart,
      total,
=======
      // Thay đổi: Gửi kèm thông tin size/màu lên API orders nếu backend có hỗ trợ
      order_items: cart.map(item => ({
        product_id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize || "",
        color: item.selectedColor || ""
      })),
      total: total,
>>>>>>> Stashed changes
    };

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api"/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
<<<<<<< Updated upstream
      const result = await res.json();

      if (result.code === "success") {
        handleRemoveAll();
=======
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server không trả về JSON");
      }
      
      const result = await res.json();

      if (result.code === "success" || result.success) {
        setCart([]);
>>>>>>> Stashed changes
        router.push("/success");
      } else {
        alert("Có lỗi xảy ra khi thêm đơn hàng!");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối tới server!");
    }
  };

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
  return (
    <main className="container mt-5 pt-5">
      <h1 className="text-center mb-4">Giỏ hàng của bạn</h1>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Giá</th>
              <th>Tổng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
<<<<<<< Updated upstream
            {cart.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={product.quantity}
                    min="1"
                    onChange={(e) => handleQuantity(product._id, e.target.value)}
                  />
                </td>
                <td>{product.price.toLocaleString("vi-VN")}đ</td>
                <td>{(product.quantity * product.price).toLocaleString("vi-VN")}đ</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(product._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
=======
            {cart.map((product) => {
              // Thay đổi: Tạo key duy nhất kết hợp để không bị lỗi trùng lặp key React
              const uniqueKey = `${product._id}-${product.selectedSize || ''}-${product.selectedColor || ''}`;
              
              return (
                <tr key={uniqueKey}>
                  <td>
                    <strong>{product.name}</strong>
                    
                    {/* Thay đổi: Hiển thị Size và Màu dưới tên sản phẩm nếu có */}
                    {(product.selectedSize || product.selectedColor) && (
                      <div className="text-muted small mt-1">
                        {product.selectedSize && <span className="me-3">Kích thước: {product.selectedSize}</span>}
                        {product.selectedColor && <span>Màu sắc: {product.selectedColor}</span>}
                      </div>
                    )}

                    {product.image && (
                      <div className="mt-1">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={product.quantity}
                      min="1"
                      // Thay đổi: Truyền thêm size và màu vào handler
                      onChange={(e) => handleQuantity(product._id, product.selectedSize, product.selectedColor, e.target.value)}
                    />
                  </td>
                  <td>{product.price.toLocaleString("vi-VN")}đ</td>
                  <td>{(product.quantity * product.price).toLocaleString("vi-VN")}đ</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      // Thay đổi: Truyền thêm size và màu vào handler để xoá chính xác phân loại đó
                      onClick={() => handleRemove(product._id, product.selectedSize, product.selectedColor)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
>>>>>>> Stashed changes
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={3}>TỔNG TIỀN</th>
              <th>{total.toLocaleString("vi-VN")}đ</th>
              <th>
                <button className="btn btn-danger btn-sm" onClick={handleRemoveAll}>
                  Xóa hết
                </button>
              </th>
            </tr>
          </tfoot>
        </table>
      </div>

<<<<<<< Updated upstream
      <div className="row mt-4">
        <div className="col-md-6 offset-md-6">
          <label htmlFor="locationSelect" className="form-label">
            Chọn cửa hàng nhận hàng:
          </label>
          <select
            className="form-select"
            id="locationSelect"
            onChange={(e) => setInputLocation(e.target.value)}
            defaultValue={-1}
          >
            <option value={-1} disabled>
              -- Vui lòng chọn cửa hàng --
            </option>
            {locationList.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-success" onClick={handleOrder}>
          Thanh toán
        </button>
=======
      <div className="d-flex justify-content-between mt-4">
        <Link href="/products" className="btn btn-outline-secondary">
          ← Tiếp tục mua sắm
        </Link>
        <Link href="/checkout" className="btn btn-success btn-lg px-5 fw-bold shadow-sm">
          Tiến hành thanh toán →
        </Link>
>>>>>>> Stashed changes
      </div>
    </main>
  );
}

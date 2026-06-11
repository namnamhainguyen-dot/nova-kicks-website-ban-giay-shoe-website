"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Tải giỏ hàng từ localStorage khi vừa vào trang
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  // Hàm cập nhật và lưu lại vào localStorage
  const updateCartAndStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // 2. Tăng/Giảm số lượng sản phẩm
  const handleQuantityChange = (id, change) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    });
    updateCartAndStorage(updatedCart);
  };

  // 3. Xóa sản phẩm khỏi giỏ
  const handleRemoveItem = (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      const updatedCart = cart.filter((item) => item.id !== id);
      updateCartAndStorage(updatedCart);
    }
  };

  // 4. Tính tổng tiền giỏ hàng
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (loading) {
    return <div className="container mt-5 text-center">Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-bold">Giỏ Hàng Của Bạn</h2>

      {cart.length === 0 ? (
        <div className="card shadow-sm p-5 text-center">
          <p className="fs-5 text-muted">Giỏ hàng của bạn đang trống rỗng.</p>
          <Link href="/products" className="btn btn-dark px-4 mt-2">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {/* Cột danh sách sản phẩm */}
          <div className="col-lg-8">
            <div className="card shadow-sm p-4">
              {cart.map((item) => (
                <div key={item.id} className="row align-items-center mb-4 pb-4 border-bottom">
                  {/* Ảnh sản phẩm */}
                  <div className="col-3 col-md-2">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="img-fluid rounded border"
                    />
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="col-5 col-md-5">
                    <h5 className="fw-bold mb-1 text-truncate">{item.name}</h5>
                    <p className="text-muted mb-0">{item.price.toLocaleString("vi-VN")} đ</p>
                  </div>

                  {/* Bộ tăng giảm số lượng */}
<div className="col-4 col-md-3 d-flex align-items-center">
                    <button
                      className="btn btn-sm btn-outline-secondary px-2"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="mx-3 fw-semibold">{item.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary px-2"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Nút xóa */}
                  <div className="col-12 col-md-2 text-md-end mt-2 mt-md-0">
                    <button
                      className="btn btn-sm btn-link text-danger p-0 border-0"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột tổng kết đơn hàng */}
          <div className="col-lg-4">
            <div className="card shadow-sm p-4 bg-light">
              <h4 className="fw-bold mb-4">Tóm tắt đơn hàng</h4>
              <div className="d-flex justify-content-between mb-3 fs-5">
                <span>Tổng tiền:</span>
                <span className="fw-bold text-danger">
                  {totalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <hr />
              <Link href="/checkout" className="btn btn-dark w-100 py-2 fw-semibold">
                Tiến hành thanh toán
              </Link>
              <Link href="/products" className="btn btn-outline-secondary w-100 py-2 mt-2">
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
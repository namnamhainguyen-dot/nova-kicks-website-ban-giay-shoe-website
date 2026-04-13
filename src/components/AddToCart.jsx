"use client";

import { useContext, useState, useEffect } from "react";
import { CartContext } from "./CartContext";

export default function AddToCart({ product, children }) {
  const { cart, setCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(0);

  // Đồng bộ quantity với cart trong context (Giữ nguyên)
  useEffect(() => {
    const productInCart = cart.find((p) => p._id === product._id);
    setQuantity(productInCart ? productInCart.quantity : 0);
  }, [cart, product._id]);

  // HÀM MỚI: Cập nhật cart (Thay thế cho useEffect gây lỗi)
  const updateCart = (newQty) => {
    setQuantity(newQty); // Cập nhật local state để UI mượt mà
    
    let newCart = [...cart];
    const index = newCart.findIndex((p) => p._id === product._id);

    if (newQty > 0) {
      if (index >= 0) {
        newCart[index] = { ...newCart[index], quantity: newQty };
      } else {
        newCart.push({ ...product, quantity: newQty });
      }
    } else {
      if (index >= 0) {
        newCart.splice(index, 1);
      }
    }
    setCart(newCart);
  };

  if (quantity === 0) {
    return (
      <button className="btn btn-dark" onClick={() => updateCart(1)}>
        {children}
      </button>
    );
  } else {
    return (
      <div className="input-group">
        {/* Thay setQuantity bằng updateCart */}
        <div className="btn btn-dark" onClick={() => updateCart(quantity - 1)}>
          -
        </div>
        <input
          type="number"
          value={quantity}
          min="0"
          className="text-center"
          style={{ width: "60px" }}
          onChange={(e) => updateCart(parseInt(e.target.value) || 0)}
        />
        <div className="btn btn-dark" onClick={() => updateCart(quantity + 1)}>
          +
        </div>
      </div>
    );
  }
}
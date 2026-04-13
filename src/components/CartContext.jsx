// /src/components/CartContext.jsx
"use client";
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Khởi tạo từ localStorage khi component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Lỗi đọc localStorage:", err);
      setCart([]);
    }
  }, []);

  // Mỗi khi cart thay đổi thì lưu lại vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Lỗi ghi localStorage:", err);
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
}


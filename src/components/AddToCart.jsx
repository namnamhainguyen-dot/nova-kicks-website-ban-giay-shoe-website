"use client";

import { useContext, useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import { toast } from "react-hot-toast";

export default function AddToCart({ product, children }) {
  const { cart, setCart } = useContext(CartContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user để kiểm tra quyền
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleAddToCart = () => {
    // 1. CHẶN ADMIN: Kiểm tra quyền trước khi thực hiện
    if (user && user.role === "admin") {
      toast.error("Quản trị viên không thể mua hàng!");
      return;
    }

    // 2. Logic thêm vào giỏ hàng
    let newCart = [...cart];
    const index = newCart.findIndex((p) => p._id === product._id);

    if (index >= 0) {
      newCart[index] = { ...newCart[index], quantity: newCart[index].quantity + 1 };
    } else {
      newCart.push({ ...product, quantity: 1 });
    }

    setCart(newCart);

    // 3. THÔNG BÁO: Hiển thị toast thay vì chuyển sang ô nhập số lượng
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`, {
      position: "bottom-right",
    });
  };

  // Luôn trả về nút bấm cố định, không render ô input số lượng
  return (
    <button className="btn btn-dark w-100" onClick={handleAddToCart}>
      {children}
    </button>
  );
}
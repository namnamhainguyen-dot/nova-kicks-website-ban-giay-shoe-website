'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  
  // Giả sử bạn lấy thông tin user đăng nhập từ một AuthContext hoặc localStorage
  // Bạn hãy thay thế logic lấy user này phù hợp với dự án của bạn nhé
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check xem có token/user nào đang đăng nhập không
    const loggedInUser = localStorage.getItem('userId'); // Hoặc lấy từ token
    setUserId(loggedInUser);
  }, []);

  // ⚡ QUAN TRỌNG: Mỗi khi userId thay đổi (đổi tài khoản hoặc logout)
  useEffect(() => {
    if (userId) {
      // 1. Nếu có user mới đăng nhập: Load giỏ hàng riêng của user đó
      const userCart = localStorage.getItem(`cart_${userId}`);
      setCart(userCart ? JSON.parse(userCart) : []);
    } else {
      // 2. Nếu không có user (đăng xuất): Reset giỏ hàng về rỗng ngay lập tức
      setCart([]);
    }
  }, [userId]);

  // Hàm thêm vào giỏ hàng (lưu theo key riêng của từng user)
  const addToCart = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    
    if (userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
    } else {
      localStorage.setItem('cart_guest', JSON.stringify(updatedCart));
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, setUserId }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
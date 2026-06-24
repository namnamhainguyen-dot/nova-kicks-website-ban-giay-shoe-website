"use client";
import { createContext, useState, useEffect } from "react";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  // Tải danh sách yêu thích từ localStorage khi trang web vừa load
  useEffect(() => {
    const savedWishlist = localStorage.getItem("nova_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Lỗi đọc wishlist từ localStorage", e);
      }
    }
  }, []);

  // Thêm hoặc Xóa sản phẩm khỏi danh sách yêu thích
  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const isExist = prevWishlist.some((item) => item._id === product._id);
      let updatedWishlist;

      if (isExist) {
        // Nếu đã có thì xóa đi (Bỏ thích)
        updatedWishlist = prevWishlist.filter((item) => item._id !== product._id);
      } else {
        // Nếu chưa có thì thêm vào
        updatedWishlist = [...prevWishlist, product];
      }

      localStorage.setItem("nova_wishlist", JSON.stringify(updatedWishlist));
      return updatedWishlist;
    });
  };

  // Kiểm tra xem sản phẩm đã được thích chưa (để tô màu trái tim)
  const isFavorite = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
}
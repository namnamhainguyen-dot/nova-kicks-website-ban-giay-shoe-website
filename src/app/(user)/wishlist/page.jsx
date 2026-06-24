"use client";
import { useContext } from "react";
import { WishlistContext } from "@/components/WishlistContext";
import { CartContext } from "@/components/CartContext";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { cart, setCart } = useContext(CartContext);

  // Hàm thêm nhanh sản phẩm vào giỏ hàng
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const isExist = prevCart.find((item) => item._id === product._id);
      let updatedCart;
      
      if (isExist) {
        updatedCart = prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...prevCart, { ...product, quantity: 1 }];
      }
      
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
    alert(`Đã thêm ${product.name} vào giỏ hàng thành công!`);
  };

  // Trường hợp danh sách yêu thích trống
  if (wishlist.length === 0) {
    return (
      <main className="container mt-5 pt-5 text-center py-5">
        <div className="py-5">
          <div className="fs-1 mb-3">🤍</div>
          <h2 className="fw-bold text-secondary">Danh sách yêu thích trống</h2>
          <p className="text-muted mb-4">Hãy thả tim những mẫu giày bạn ấn tượng nhất để lưu lại tại đây nhé!</p>
          <Link href="/products" className="btn btn-dark px-4 rounded-pill fw-semibold">
            Khám phá bộ sưu tập Giày
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-5 pt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark m-0">❤️ Sản Phẩm Yêu Thích ({wishlist.length})</h3>
        <Link href="/products" className="text-secondary text-decoration-none small">
          Tiếp tục xem giày →
        </Link>
      </div>

      <div className="row g-4">
        {wishlist.map((product) => (
          <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 col-6">
            <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden position-relative group-wishlist">
              
              {/* Nút Xóa nhanh khỏi danh sách (Nút Trái Tim màu đỏ) */}
              <button
                onClick={() => toggleWishlist(product)}
                className="btn position-absolute top-0 end-0 m-2 p-2 bg-white rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
                style={{ zIndex: 5, width: "35px", height: "35px" }}
                title="Xóa khỏi danh sách"
              >
                <span className="text-danger fs-5">❤️</span>
              </button>

              {/* Hình ảnh sản phẩm */}
              <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: "220px" }}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-100 h-100 object-fit-cover transition"
                  />
                ) : (
                  <span className="text-muted small">No Image</span>
                )}
              </div>

              {/* Thông tin sản phẩm */}
              <div className="card-body p-3 d-flex flex-column justify-content-between">
                <div>
                  <h6 className="card-title fw-bold text-dark text-truncate mb-1">
                    <Link href={`/products/${product._id}`} className="text-decoration-none text-dark">
                      {product.name}
                    </Link>
                  </h6>
                  <p className="text-danger fw-bold mb-3">
                    {product.price ? product.price.toLocaleString("vi-VN") : 0}đ
                  </p>
                </div>

                {/* Các nút hành động */}
                <div className="d-grid gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn btn-dark btn-sm rounded-pill py-2 fw-semibold"
                  >
                    🛒 Thêm vào giỏ
                  </button>
                  <Link
                    href={`/products/${product._id}`}
                    className="btn btn-outline-secondary btn-sm rounded-pill py-2 text-decoration-none text-center"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
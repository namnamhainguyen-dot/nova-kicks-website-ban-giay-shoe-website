"use client";
import { CartContext } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";

export default function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState(""); // Đổi thành địa chỉ giao hàng
  const [orderNote, setOrderNote] = useState("");
  
  const [isOrdering, setIsOrdering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  const router = useRouter();

  // Tính tổng tiền đơn hàng
  const total = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

  // Kiểm tra tính hợp lệ của biểu mẫu
  const validateOrder = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống! Không thể thanh toán.");
      return false;
    }
    if (!customerName.trim()) {
      alert("Vui lòng nhập tên người nhận!");
      return false;
    }
    if (!customerPhone.trim()) {
      alert("Vui lòng nhập số điện thoại liên hệ!");
      return false;
    }
    if (!deliveryAddress.trim()) {
      alert("Vui lòng nhập chính xác địa chỉ giao hàng!");
      return false;
    }
    return true;
  };

  // Xử lý gửi đơn hàng lên server
  const handleOrder = async (e) => {
    if (e) e.preventDefault(); 
    if (!validateOrder()) return;
    
    setIsOrdering(true);
    
    const order = {
      name: customerName,
      phone: customerPhone,
      // Gửi địa chỉ do khách nhập lên trường location_id (hoặc trường address tùy thuộc vào API của bạn)
      location_id: deliveryAddress, 
      note: orderNote,
      order_items: cart.map(item => ({
        product_id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: total,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      
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

      if (result.code === "success" || result.success || result._id || result.id) {
        const orderId = result._id || result.id || (result.data && result.data._id);
        if (orderId) setCreatedOrderId(orderId);
        
        setCart([]); // Reset giỏ hàng
        setIsSuccess(true); // Hiện màn hình thành công có nút Xem đơn hàng
      } else {
        alert(result.message || "Có lỗi xảy ra khi xử lý đơn hàng!");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Không thể kết nối tới server! Vui lòng thử lại sau.\n" + err.message);
    } finally {
      setIsOrdering(false);
    }
  };

  // 1. GIAO DIỆN ĐẶT HÀNG THÀNH CÔNG
  if (isSuccess) {
    return (
      <main className="container mt-5 pt-5 text-center py-5">
        <div className="card p-5 shadow border-0 d-inline-block rounded-4" style={{ maxWidth: "550px", width: "100%" }}>
          <div className="fs-1 mb-3">🎉</div>
          <h2 className="fw-bold text-success mb-2">Đặt Hàng Thành Công!</h2>
          <p className="text-muted mb-4 px-3">
            Cảm ơn bạn đã tin tưởng lựa chọn sản phẩm của chúng tôi. Đơn hàng của bạn đang được đóng gói và sẽ sớm giao tới địa chỉ của bạn.
          </p>
          
          <div className="d-grid gap-3 px-4">
            <Link 
              href={createdOrderId ? `/orders/${createdOrderId}` : "/orders/history"} 
              className="btn btn-dark btn-lg rounded-pill fw-bold fs-6 shadow-sm py-2"
            >
              Xem đơn hàng ➔
            </Link>
            <Link href="/products" className="btn btn-outline-secondary rounded-pill btn-sm py-2">
              Tiếp tục mua sắm Giày
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 2. GIAO DIỆN GIỎ HÀNG TRỐNG
  if (cart.length === 0) {
    return (
      <main className="container mt-5 pt-5 text-center py-5">
        <h1 className="mb-4 text-secondary fw-bold">Trang Thanh Toán</h1>
        <div className="alert alert-warning d-inline-block p-4 shadow-sm rounded-3" style={{ maxWidth: "500px" }}>
          <h4 className="alert-heading fw-bold">🛒 Chưa có sản phẩm</h4>
          <p className="mb-3 text-muted">Vui lòng chọn mẫu giày yêu thích vào giỏ trước khi thực hiện thanh toán nhé!</p>
          <Link href="/products" className="btn btn-dark px-4 rounded-pill fw-semibold">
            Quay lại cửa hàng Giày
          </Link>
        </div>
      </main>
    );
  }

  // 3. BIỂU MẪU ĐIỀN THÔNG TIN ĐẶT HÀNG (SHIP TẬN NHÀ)
  return (
    <main className="container mt-5 pt-5">
      <div className="row g-4">
        
        {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG */}
        <div className="col-lg-7 col-md-12">
          <div className="card shadow-sm border-0 mb-4 rounded-3">
            <div className="card-body p-4">
              <h4 className="mb-4 text-dark fw-bold">📋 Thông Tin Nhận Hàng</h4>
              
              <form onSubmit={handleOrder}>
                {/* Tên khách hàng */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Họ và tên người nhận <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control form-control-lg fs-6"
                    placeholder="Nhập tên người nhận hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                {/* Số điện thoại */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Số điện thoại liên hệ <span className="text-danger">*</span></label>
                  <input
                    type="tel"
                    className="form-control form-control-lg fs-6"
                    placeholder="Nhập số điện thoại liên hệ"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Ô NHẬP ĐỊA CHỈ GIAO HÀNG TẬN NHÀ */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Địa chỉ giao hàng (Số nhà, Tên đường, Phường/Xã, Quận/Huyện) <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control form-control-lg fs-6"
                    placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Phường 3, Quận 5, TP.HCM"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Ghi chú chọn Size / Màu sắc */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small">Ghi chú đơn hàng (Size giày, màu sắc, lời nhắn...)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Ví dụ: Lấy cho mình size 41, giao vào giờ hành chính..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  ></textarea>
                </div>

                {/* Nút hành động trên Mobile */}
                <div className="d-grid d-lg-none gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-dark btn-lg py-3 fw-bold shadow-sm rounded-pill"
                    disabled={isOrdering || !deliveryAddress}
                  >
                    {isOrdering ? "Đang xử lý đơn hàng..." : `Xác Nhận Đặt Hàng • ${total.toLocaleString("vi-VN")}đ`}
                  </button>
                  <Link href="/cart" className="btn btn-link text-muted small">Quay lại chỉnh sửa giỏ hàng</Link>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT GIỎ HÀNG */}
        <div className="col-lg-5 col-md-12">
          <div className="card shadow-sm border-0 sticky-top rounded-3" style={{ top: "100px", zIndex: 10 }}>
            <div className="card-body p-4">
              <h4 className="mb-4 text-dark fw-bold">🛒 Đơn Hàng Của Bạn ({cart.length})</h4>
              
              <div className="overflow-auto mb-4" style={{ maxHeight: "320px" }}>
                {cart.map((product) => (
                  <div key={product._id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                    <div className="d-flex align-items-center">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="rounded border me-3 object-fit-cover"
                          style={{ width: "50px", height: "50px" }}
                        />
                      )}
                      <div>
                        <h6 className="mb-0 fw-semibold text-truncate" style={{ maxWidth: "180px" }}>{product.name}</h6>
                        <small className="text-muted">Số lượng: {product.quantity}</small>
                      </div>
                    </div>
                    <span className="fw-medium text-dark">
                      {(product.quantity * product.price).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Tạm tính:</span>
                <span className="text-dark fw-medium">{total.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small">
                <span className="text-muted">Phí vận chuyển:</span>
                <span className="text-success fw-medium">Miễn phí (Toàn quốc)</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="h5 mb-0 fw-bold">Tổng thanh toán:</span>
                <span className="h4 mb-0 fw-bold text-danger">{total.toLocaleString("vi-VN")}đ</span>
              </div>

              {/* Nút hành động chính trên Desktop */}
              <div className="d-none d-lg-block">
                <button 
                  onClick={handleOrder}
                  className="btn btn-dark btn-lg w-100 py-3 fw-bold shadow-sm rounded-pill"
                  disabled={isOrdering || !deliveryAddress}
                >
                  {isOrdering ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang xử lý đặt hàng...
                    </>
                  ) : (
                    "XÁC NHẬN ĐẶT HÀNG"
                  )}
                </button>
                <div className="text-center mt-3">
                  <Link href="/cart" className="text-secondary text-decoration-none small">
                    ← Quay lại chỉnh sửa giỏ hàng
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
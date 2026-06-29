// /src/app/(user)/checkout/page.jsx
"use client";
import { CartContext } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import Link from "next/link";

export default function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  
  const [isOrdering, setIsOrdering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  // ── STATE DÀNH RIÊNG CHO VOUCHER ──
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null); 
  const [voucherError, setVoucherError] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const router = useRouter();

  // Tính tổng tiền gốc của đơn hàng
  const total = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

  // Tính số tiền được giảm giá
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discount_type === "fixed") {
      discountAmount = appliedVoucher.discount_value;
    } else if (appliedVoucher.discount_type === "percentage") {
      discountAmount = (total * appliedVoucher.discount_value) / 100;
    }
  }

  // Tổng tiền cuối cùng phải thanh toán
  const finalTotal = Math.max(0, total - discountAmount);

  // Xử lý áp dụng Voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã code!");
      return;
    }

    setVoucherError("");
    setVoucherSuccess("");
    setIsValidatingVoucher(true);

    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode }),
      });

      const result = await res.json();

      if (result.success) {
        if (total < result.min_order_value) {
          setVoucherError(`Đơn hàng phải tối thiểu từ ${result.min_order_value.toLocaleString("vi-VN")}đ để dùng mã này!`);
          setAppliedVoucher(null);
        } else {
          setAppliedVoucher(result);
          setVoucherSuccess(result.message);
        }
      } else {
        setVoucherError(result.message);
        setAppliedVoucher(null);
      }
    } catch (err) {
      setVoucherError("Không thể xác thực mã lúc này.");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // Hủy không dùng mã nữa
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherSuccess("");
    setVoucherError("");
  };

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
      location_id: deliveryAddress, 
      note: orderNote,
      order_items: cart.map(item => ({
        product_id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.selectedColor || null, 
        size: item.selectedSize || null    
      })),
      total: total,
      discount: discountAmount, 
      final_total: finalTotal,  
      applied_voucher: appliedVoucher ? voucherCode.toUpperCase() : null 
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();

      if (result.code === "success" || result.success || result._id || result.id) {
        const orderId = result._id || result.id || (result.data && result.data._id);
        if (orderId) setCreatedOrderId(orderId);
        
        setCart([]);
        localStorage.removeItem("cart");
        setIsSuccess(true);
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

  // 3. BIỂU MẪU ĐIỀN THÔNG TIN ĐẶT HÀNG
  return (
    <main className="container mt-5 pt-5 mb-5">
      <div className="row g-4">
        
        {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG */}
        <div className="col-lg-7 col-md-12">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4">
              <h4 className="mb-4 text-dark fw-bold">📋 Thông Tin Nhận Hàng</h4>
              
              <form onSubmit={handleOrder}>
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

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Địa chỉ giao hàng <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control form-control-lg fs-6"
                    placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Phường 3, Quận 5, TP.HCM"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Ghi chú đơn hàng (Size giày, màu sắc...)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Ví dụ: Giao vào giờ hành chính..."
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
                    {isOrdering ? "Đang xử lý..." : `Xác Nhận Đặt Hàng • ${finalTotal.toLocaleString("vi-VN")}đ`}
                  </button>
                  <Link href="/cart" className="btn btn-link text-muted small">Quay lại giỏ hàng</Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT GIỎ HÀNG & MÃ GIẢM GIÁ */}
        <div className="col-lg-5 col-md-12">
          <div className="card shadow-sm border-0 sticky-top rounded-3" style={{ top: "100px", zIndex: 10 }}>
            <div className="card-body p-4">
              <h4 className="mb-4 text-dark fw-bold">🛒 Đơn Hàng Của Bạn ({cart.length})</h4>
              
              <div className="overflow-auto mb-3 border-bottom" style={{ maxHeight: "320px" }}>
                {cart.map((product) => {
                  // Tạo key độc nhất bằng cách kết hợp ID, màu sắc và kích thước
                  const uniqueKey = `${product._id}-${product.selectedColor || "none"}-${product.selectedSize || "none"}`;

                  return (
                    <div key={uniqueKey} className="d-flex align-items-center justify-content-between py-2 border-bottom">
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
                          <h6 className="mb-0 fw-semibold text-truncate" style={{ maxWidth: "160px" }}>{product.name}</h6>
                          
                          {/* Hiển thị phân loại Size và Màu sắc ngay dưới tên sản phẩm */}
                          <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                            {product.selectedColor && <span>Màu: {product.selectedColor}</span>}
                            {product.selectedColor && product.selectedSize && <span> | </span>}
                            {product.selectedSize && <span>Size: {product.selectedSize}</span>}
                          </div>

                          <small className="text-muted">Số lượng: {product.quantity}</small>
                        </div>
                      </div>
                      <span className="fw-medium text-dark">
                        {(product.quantity * product.price).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ── Ô NHẬP VOUCHER GIẢM GIÁ ── */}
              <div className="mb-4 bg-light p-3 rounded-3">
                <label className="form-label fw-bold text-secondary small mb-2">🎟️ Thẻ giảm giá (Voucher)</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm text-uppercase fw-bold"
                    placeholder="NHẬP MÃ GIẢM GIÁ"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    disabled={!!appliedVoucher} 
                  />
                  {appliedVoucher ? (
                    <button className="btn btn-danger btn-sm" type="button" onClick={handleRemoveVoucher}>
                      Hủy bỏ
                    </button>
                  ) : (
                    <button 
                      className="btn btn-dark btn-sm fw-semibold" 
                      type="button" 
                      onClick={handleApplyVoucher}
                      disabled={isValidatingVoucher}
                    >
                      {isValidatingVoucher ? "Đang check..." : "Áp dụng"}
                    </button>
                  )}
                </div>
                
                {voucherError && <div className="text-danger small fw-medium mt-1">❌ {voucherError}</div>}
                {voucherSuccess && <div className="text-success small fw-medium mt-1">✅ {voucherSuccess}</div>}
              </div>

              {/* Bảng tính toán chi phí */}
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Tạm tính giỏ hàng:</span>
                <span className="text-dark fw-medium">{total.toLocaleString("vi-VN")}đ</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Giảm giá (Voucher):</span>
                  <span className="text-danger fw-bold">-{discountAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-3 small">
                <span className="text-muted">Phí vận chuyển:</span>
                <span className="text-success fw-medium">Miễn phí (Toàn quốc)</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="h5 mb-0 fw-bold">Tổng thanh toán:</span>
                <span className="h4 mb-0 fw-bold text-danger">{finalTotal.toLocaleString("vi-VN")}đ</span>
              </div>

              {/* Nút hành động trên Desktop */}
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
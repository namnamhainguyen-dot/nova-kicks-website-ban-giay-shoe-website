"use client";
import { CartContext } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";

export default function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const [locationList, setLocationList] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [orderNote, setOrderNote] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const router = useRouter();

  // Lấy danh sách bàn/địa điểm từ API
  useEffect(() => {
    async function fetchLocations() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/tables");
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server không trả về JSON");
        }
        
        const locations = await res.json();
        setLocationList(Array.isArray(locations) ? locations : []);
      } catch (err) {
        console.error("Lỗi lấy danh sách cửa hàng:", err);
        setLocationList([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLocations();
  }, []);

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
    if (!inputLocation) {
      alert("Vui lòng chọn vị trí bàn hoặc điểm nhận hàng!");
      return false;
    }
    return true;
  };

  // Xử lý gửi đơn hàng lên server
  const handleOrder = async (e) => {
    e.preventDefault(); // Chặn reload form
    if (!validateOrder()) return;
    
    setIsOrdering(true);
    
    const order = {
      name: customerName,
      phone: customerPhone,
      location_id: inputLocation,
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

      if (result.code === "success" || result.success) {
        setCart([]); // Reset giỏ hàng
        router.push("/success");
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

  // Trường hợp giỏ hàng trống
  if (cart.length === 0) {
    return (
      <main className="container mt-5 pt-5 text-center py-5">
        <h1 className="mb-4 text-secondary">Trang Thanh Toán</h1>
        <div className="alert alert-warning d-inline-block p-4 shadow-sm" style={{ maxWidth: "500px" }}>
          <h4 className="alert-heading">🛒 Chưa có sản phẩm</h4>
          <p className="mb-3 text-muted">Vui lòng chọn món ăn/sản phẩm vào giỏ trước khi thực hiện thanh toán nhé!</p>
          <Link href="/products" className="btn btn-primary px-4">
            Quay lại Menu món ăn
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-5 pt-5">
      <div className="row g-4">
        
        {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & THÀNH TOÁN */}
        <div className="col-lg-7 col-md-12">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h4 className="mb-4 text-primary fw-bold">📋 Thông Tin Nhận Hàng</h4>
              
              <form onSubmit={handleOrder}>
                {/* Tên khách hàng */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Họ và tên <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control form-control-lg fs-6"
                    placeholder="Nhập tên người nhận"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                {/* Số điện thoại */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Số điện thoại <span className="text-danger">*</span></label>
                  <input
                    type="tel"
                    className="form-control form-control-lg fs-6"
                    placeholder="Nhập số điện thoại liên hệ"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Điểm nhận / Bàn ăn */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Chọn bàn / Vị trí nhận món <span className="text-danger">*</span></label>
                  {isLoading ? (
                    <div className="text-muted py-2">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      Đang cập nhật danh sách vị trí...
                    </div>
                  ) : (
                    <select
                      className="form-select form-select-lg fs-6"
                      value={inputLocation}
                      onChange={(e) => setInputLocation(e.target.value)}
                      required
                    >
                      <option value="">-- Chọn số bàn hoặc điểm nhận --</option>
                      {locationList.map((loc) => (
                        <option key={loc._id || loc.id} value={loc._id || loc.id}>
                          {loc.name} {loc.description ? `(${loc.description})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Ghi chú */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Ghi chú đơn hàng (Tùy chọn)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Ví dụ: Không hành, ít cay, mang kèm ly đá..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  ></textarea>
                </div>

                {/* Nút hành động trên Mobile (Ẩn trên Desktop) */}
                <div className="d-grid d-lg-none gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg py-3 fw-bold shadow"
                    disabled={isOrdering || !inputLocation}
                  >
                    {isOrdering ? "Đang xử lý đơn hàng..." : `Xác Nhận Đặt Hàng • ${total.toLocaleString("vi-VN")}đ`}
                  </button>
                  <Link href="/cart" className="btn btn-link text-muted"> Quay lại chỉnh sửa giỏ hàng</Link>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="col-lg-5 col-md-12">
          <div className="card shadow-sm border-0 sticky-top" style={{ top: "100px", zIndex: 10 }}>
            <div className="card-body p-4">
              <h4 className="mb-4 text-dark fw-bold">🛒 Tóm Tắt Đơn Hàng ({cart.length})</h4>
              
              {/* Danh sách sản phẩm thu gọn */}
              <div className="overflow-auto mb-4" style={{ maxHeight: "320px" }}>
                {cart.map((product) => (
                  <div key={product._id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                    <div className="d-flex align-items-center">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="rounded border me-3"
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
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

              {/* Tính toán tổng chi phí */}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính:</span>
                <span className="text-dark fw-medium">{total.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Phí dịch vụ/Phục vụ:</span>
                <span className="text-success fw-medium">Miễn phí</span>
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
                  className="btn btn-success btn-lg w-100 py-3 fw-bold shadow-sm"
                  disabled={isOrdering || !inputLocation}
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
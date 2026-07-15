"use client";

import { useEffect, useState, use } from "react"; 
import { useParams } from "next/navigation";
import Link from "next/link";

// ==========================================
// COMPONENT CON: TỰ ĐỘNG LẤY ẢNH TỪ API SẢN PHẨM NẾU TRONG ĐƠN HÀNG KHÔNG CÓ
// ==========================================
function OrderItemRow({ item, idx, isLast }) {
  const [imgUrl, setImgUrl] = useState("https://placehold.co/100x100?text=Loading...");

  useEffect(() => {
    // 1. Nếu trong item của đơn hàng đã có sẵn ảnh (phòng trường hợp sau này bạn update API đặt hàng)
    const existingImg = item.image || item.img || item.thumbnail || item.product_image;
    if (existingImg) {
      setImgUrl(existingImg);
      return;
    }

    // 2. Nếu không có ảnh, tiến hành fetch thông tin từ API chi tiết sản phẩm bằng product_id
    if (item.product_id) {
      fetch(`/api/products/${item.product_id}`)
        .then((res) => res.json())
        .then((productData) => {
          if (productData && productData.image) {
            setImgUrl(productData.image);
          } else {
            setImgUrl("https://placehold.co/100x100?text=No+Image");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi lấy ảnh sản phẩm:", err);
          setImgUrl("https://placehold.co/100x100?text=No+Image");
        });
    } else {
      setImgUrl("https://placehold.co/100x100?text=No+Image");
    }
  }, [item]);

  const itemKey = `${item.product_id || idx}-${item.color || "none"}-${item.size || "none"}`;

  return (
    <div key={itemKey} className={`d-flex align-items-center justify-content-between py-2 ${isLast ? "" : "border-bottom"}`}>
      <div className="d-flex align-items-center">
        {/* Khung bao bọc ảnh cố định tỷ lệ */}
        <div 
          className="border rounded me-3 overflow-hidden bg-white d-flex align-items-center justify-content-center" 
          style={{ width: "55px", height: "55px", flexShrink: 0 }}
        >
          <img 
            src={imgUrl} 
            alt={item.name} 
            className="img-fluid object-fit-contain" 
            style={{ maxHeight: "100%", maxWidth: "100%" }} 
            onError={(e) => {
              e.target.src = "https://placehold.co/100x100?text=No+Image";
            }}
          />
        </div>
        <div>
          <span className="fw-bold d-block text-dark small">{item.name}</span>
          
          {(item.color || item.size) && (
            <div className="text-muted small mb-1" style={{ fontSize: "0.75rem" }}>
              {item.color && <span>Màu: {item.color}</span>}
              {item.color && item.size && <span> | </span>}
              {item.size && <span>Size: {item.size}</span>}
            </div>
          )}

          <small className="text-muted">Số lượng: x{item.quantity}</small>
        </div>
      </div>
      <span className="fw-bold small text-dark">{((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}đ</span>
    </div>
  );
}

// ==========================================
// COMPONENT CHÍNH: CHI TIẾT ĐƠN HÀNG
// ==========================================
export default function OrderDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Không tìm thấy đơn hàng");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data._id) {
          setOrder(data);
        } else {
          setOrder(null);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusLabels = {
    pending: { text: "Chờ xác nhận hệ thống", color: "text-warning" },
    preparing: { text: "Cửa hàng đang đóng gói sản phẩm", color: "text-info" },
    completed: { text: "Đã giao hàng thành công", color: "text-success" },
    cancelled: { text: "Đơn đặt hàng đã bị hủy", color: "text-danger" }
  };

  if (loading) return <div className="container my-5 text-center">Đang tải dữ liệu đơn hàng...</div>;
  if (!order) return <div className="container my-5 text-center text-danger">⚠️ Không tìm thấy thông tin đơn hàng này!</div>;

  const displayTotal = order.total || 0;
  const displayDiscount = order.discount || 0;
  const displayFinalTotal = order.final_total !== undefined ? order.final_total : (displayTotal - displayDiscount);

  // Kiểm tra trạng thái thanh toán từ Database
  const isPaid = order.isPaid === true;

  return (
    <div className="container my-5" style={{ maxWidth: "700px" }}>
      <div className="mb-3">
        <Link href="/orders/history" className="text-decoration-none text-secondary small">
          ← Quay lại danh sách lịch sử
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        {/* Banner đầu trang */}
        <div className="bg-dark text-white p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-white-50 text-uppercase">MÃ ĐƠN HÀNG</small>
              <h4 className="fw-bold mb-0">#{order._id?.toUpperCase()}</h4>
            </div>
            <div className="text-end">
              <small className="text-white-50">TRẠNG THÁI</small>
              <h6 className={`fw-bold mb-0 ${statusLabels[order.status]?.color || "text-white"}`}>
                {statusLabels[order.status]?.text || "Đang xử lý"}
              </h6>
            </div>
          </div>
        </div>

        {/* BANNER HIỂN THỊ TRẠNG THÁI THANH TOÁN */}
        <div className={`p-3 text-center border-bottom ${isPaid ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning-emphasis"}`}>
          <div className="d-flex align-items-center justify-content-center gap-2 fw-bold">
            {isPaid ? (
              <>
                <span className="fs-5">✓</span>
                <span>ĐÃ THANH TOÁN THÀNH CÔNG ({displayFinalTotal.toLocaleString("vi-VN")}đ)</span>
              </>
            ) : (
              <>
                <span className="spinner-grow spinner-grow-sm text-warning" role="status"></span>
                <span>CHỜ THANH TOÁN CHUYỂN KHOẢN</span>
              </>
            )}
          </div>
        </div>

        {/* Informational Section */}
        <div className="p-4 border-bottom bg-light-subtle">
          <h6 className="fw-bold mb-3 text-secondary">📍 Thông tin nhận hàng</h6>
          <div className="row g-2 small">
            <div className="col-4 text-muted">Người nhận:</div>
            <div className="col-8 fw-semibold text-dark">{order.name}</div>
            
            <div className="col-4 text-muted">Số điện thoại:</div>
            <div className="col-8 fw-semibold text-dark">{order.phone}</div>
            
            <div className="col-4 text-muted">Địa chỉ giao:</div>
            <div className="col-8 fw-semibold text-dark">{order.location_id || "Chưa cập nhật địa chỉ"}</div>
            
            <div className="col-4 text-muted">Ngày đặt hàng:</div>
            <div className="col-8 text-dark">
              {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "---"}
            </div>

            <div className="col-4 text-muted">Thanh toán:</div>
            <div className="col-8 fw-semibold text-dark">
              {isPaid ? "Đã chuyển khoản VietQR" : "Chưa thanh toán"}
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm thực tế */}
        <div className="p-4 border-bottom">
          <h6 className="fw-bold mb-3 text-secondary">👟 Danh sách sản phẩm</h6>
          {order.order_items?.map((item, idx) => {
            const isLast = idx === (order.order_items.length - 1);
            return (
              <OrderItemRow 
                key={item.product_id || idx} 
                item={item} 
                idx={idx} 
                isLast={isLast} 
              />
            );
          })}
        </div>

        {/* Ghi chú khách hàng */}
        {order.note && (
          <div className="p-4 bg-light border-bottom small">
            <strong className="text-secondary">📌 Ghi chú của bạn:</strong>
            <p className="mb-0 mt-1 text-dark-emphasis">{order.note}</p>
          </div>
        )}

        {/* Chi tiết tính tiền & Voucher giảm giá */}
        <div className="p-4 bg-light-subtle border-bottom small">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Tạm tính đơn hàng:</span>
            <span className="text-dark fw-medium">{displayTotal.toLocaleString("vi-VN")}đ</span>
          </div>

          {displayDiscount > 0 && (
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                🎟️ Mã giảm giá {order.applied_voucher ? `(${order.applied_voucher.toUpperCase()})` : ""}:
              </span>
              <span className="text-danger fw-bold">-{displayDiscount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}

          <div className="d-flex justify-content-between">
            <span className="text-muted">Phí vận chuyển:</span>
            <span className="text-success fw-medium">Miễn phí (Toàn quốc)</span>
          </div>
        </div>

        {/* Chân trang tổng tiền cuối cùng */}
        <div className="p-4 bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark fs-5">Tổng tiền thanh toán:</span>
          <span className="h3 fw-bold text-danger mb-0">{displayFinalTotal.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>
    </div>
  );
}
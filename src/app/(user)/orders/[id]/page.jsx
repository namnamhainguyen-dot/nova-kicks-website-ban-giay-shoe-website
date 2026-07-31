"use client";

import { useEffect, useState, use } from "react"; 
import { useParams } from "next/navigation";
import Link from "next/link";

// ==========================================
// COMPONENT CON: TỰ ĐỘNG LẤY ẢNH TỪ API SẢN PHẨM NẾU TRONG ĐƠN HÀNG KHÔNG CÓ
// ==========================================
function OrderItemRow({ item, idx, isLast, orderStatus, onOpenReview }) {
  const [imgUrl, setImgUrl] = useState("https://placehold.co/100x100?text=Loading...");

  useEffect(() => {
    const existingImg = item.image || item.img || item.thumbnail || item.product_image;
    if (existingImg) {
      setImgUrl(existingImg);
      return;
    }

    const prodId = item.product_id || item.productId || item.product || item._id;
    if (prodId) {
      fetch(`/api/products/${prodId}`)
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

  const prodIdKey = item.product_id || item.productId || item.product || item._id || idx;
  const itemKey = `${prodIdKey}-${item.color || "none"}-${item.size || "none"}`;

  return (
    <div key={itemKey} className={`py-3 ${isLast ? "" : "border-bottom"}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
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
        <div className="text-end">
          <span className="fw-bold small text-dark d-block mb-1">
            {((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}đ
          </span>

          {/* ĐIỀU KIỆN: Chỉ hiển thị nút Đánh giá khi đơn hàng ở trạng thái "completed" hoặc "Đã giao" */}
          {(orderStatus === "completed" || orderStatus === "Đã giao") && (
            <button
              onClick={() => onOpenReview(item)}
              className="btn btn-sm btn-outline-primary py-0 px-2"
              style={{ fontSize: "0.75rem" }}
            >
              ⭐ Đánh giá
            </button>
          )}
        </div>
      </div>
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

  // State cho Modal Đánh giá & Bình luận
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentProductToReview, setCurrentProductToReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]); 
  const [submitting, setSubmitting] = useState(false);

  // Hàm fetch dữ liệu chi tiết đơn hàng từ API
  const fetchOrderDetails = () => {
    return fetch(`/api/orders/${id}`)
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
      });
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetchOrderDetails().finally(() => setLoading(false));
  }, [id]);

  // Tự động quét cập nhật trạng thái mới nhất từ Database mỗi 4 giây (nếu đơn chưa thanh toán)
  useEffect(() => {
    if (!id || !order) return;

    const isAlreadyPaid = order.isPaid === true || order.isPaid === "true";
    if (isAlreadyPaid) return;

    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 4000);

    return () => clearInterval(interval);
  }, [id, order]);

  // Xử lý chọn ảnh (Giới hạn tối đa 3 ảnh)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 3) {
      alert("Chỉ được upload tối đa 3 ảnh sản phẩm thực tế!");
      return;
    }

    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newImageUrls]);
  };

  // Hàm gửi đánh giá lên API /api/comments đã được tối ưu hóa độ an toàn
  const handleSubmitReview = async () => {
    if (!currentProductToReview || !order) return;

    const prodId = currentProductToReview.product_id || 
                   currentProductToReview.productId || 
                   currentProductToReview.product || 
                   currentProductToReview._id;
    
    let uId = order.userId || order.user_id || order.user?._id || order.user;
    
    if (!uId) {
      try {
        const storedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          uId = parsedUser._id || parsedUser.id;
        }
      } catch (e) {
        console.error("Không đọc được user từ localStorage", e);
      }
    }

    if (!prodId || !uId) {
      alert(`Thiếu thông tin định danh! (productId: ${prodId}, userId: ${uId})`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uId,
          productId: prodId,
          orderId: order._id,
          rating: Number(rating),
          comment: comment,
          images: images
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Đánh giá sản phẩm thành công!");
        setShowReviewModal(false);
        setComment("");
        setImages([]);
        setCurrentProductToReview(null);
      } else {
        alert(result.error || result.message || "Có lỗi xảy ra khi gửi đánh giá!");
      }
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      alert("Lỗi kết nối đến hệ thống!");
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabels = {
    pending: { text: "Chờ xác nhận hệ thống", color: "text-warning" },
    preparing: { text: "Cửa hàng đang đóng gói sản phẩm", color: "text-info" },
    completed: { text: "Đã giao hàng thành công", color: "text-success" },
    "Đã giao": { text: "Đã giao hàng thành công", color: "text-success" },
    cancelled: { text: "Đơn đặt hàng đã bị hủy", color: "text-danger" }
  };

  if (loading) return <div className="container my-5 text-center">Đang tải dữ liệu đơn hàng...</div>;
  if (!order) return <div className="container my-5 text-center text-danger">⚠️ Không tìm thấy thông tin đơn hàng này!</div>;

  const displayTotal = order.total || 0;
  const displayDiscount = order.discount || 0;
  const displayFinalTotal = order.final_total !== undefined ? order.final_total : (displayTotal - displayDiscount);
  const isPaid = order.isPaid === true || order.isPaid === "true";

  return (
    <div className="container my-5" style={{ maxWidth: "700px" }}>
      <div className="mb-3">
        <Link href="/orders/history" className="text-decoration-none text-secondary small">
          ← Quay lại danh sách lịch sử
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        <div className="bg-dark text-white p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-white-50 text-uppercase">MÃ ĐƠN HÀNG</small>
              <h4 className="fw-bold mb-0">#{order._id?.toUpperCase()}</h4>
            </div>
            <div className="text-end">
              <small className="text-white-50">TRẠNG THÁI GIAO HÀNG</small>
              <h6 className={`fw-bold mb-0 ${statusLabels[order.status]?.color || "text-white"}`}>
                {statusLabels[order.status]?.text || "Đang xử lý"}
              </h6>
            </div>
          </div>
        </div>

        <div className={`p-3 text-center border-bottom ${isPaid ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning-emphasis"}`}>
          <div className="d-flex align-items-center justify-content-center gap-2 fw-bold text-uppercase">
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
            <div className={`col-8 fw-bold ${isPaid ? "text-success" : "text-danger"}`}>
              {isPaid ? "✓ Đã thanh toán thành công" : "Chưa thanh toán"}
            </div>
          </div>
        </div>

        <div className="p-4 border-bottom">
          <h6 className="fw-bold mb-3 text-secondary">👟 Danh sách sản phẩm</h6>
          {order.order_items?.map((item, idx) => {
            const isLast = idx === (order.order_items.length - 1);
            return (
              <OrderItemRow 
                key={item.product_id || item.productId || item.product || item._id || idx} 
                item={item} 
                idx={idx} 
                isLast={isLast} 
                orderStatus={order.status}
                onOpenReview={(prod) => {
                  setCurrentProductToReview(prod);
                  setShowReviewModal(true);
                }}
              />
            );
          })}
        </div>

        {order.note && (
          <div className="p-4 bg-light border-bottom small">
            <strong className="text-secondary">📌 Ghi chú của bạn:</strong>
            <p className="mb-0 mt-1 text-dark-emphasis">{order.note}</p>
          </div>
        )}

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

        <div className="p-4 bg-white d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark fs-5">Tổng tiền thanh toán:</span>
          <span className="h3 fw-bold text-danger mb-0">{displayFinalTotal.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      {/* MODAL ĐÁNH GIÁ VÀ BÌNH LUẬN SẢN PHẨM */}
      {showReviewModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Đánh giá sản phẩm</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="fw-medium text-dark mb-3">Sản phẩm: {currentProductToReview?.name}</p>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Chất lượng sản phẩm:</label>
                  <select 
                    className="form-select" 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ - Tuyệt vời</option>
                    <option value={4}>⭐⭐⭐⭐ - Hài lòng</option>
                    <option value={3}>⭐⭐⭐ - Bình thường</option>
                    <option value={2}>⭐⭐ - Tạm được</option>
                    <option value={1}>⭐ - Không hài lòng</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Nhận xét của bạn:</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Ảnh thực tế sản phẩm (Tối đa 3 ảnh):</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="form-text text-muted">Đã chọn: {images.length}/3 ảnh</div>

                  {images.length > 0 && (
                    <div className="d-flex gap-2 mt-2">
                      {images.map((img, i) => (
                        <div key={i} className="position-relative border rounded overflow-hidden" style={{ width: "60px", height: "60px" }}>
                          <img src={img} alt="preview" className="w-100 h-100 object-fit-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowReviewModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm" 
                  disabled={submitting}
                  onClick={handleSubmitReview}
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
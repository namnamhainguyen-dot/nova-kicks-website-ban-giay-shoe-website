"use client";

import { useEffect, useState } from "react"; 
import { useParams } from "next/navigation";
import Link from "next/link";

// ==========================================
// COMPONENT CON: TỰ ĐỘNG LẤY ẢNH & KIỂM TRA TRẠNG THÁI ĐÁNH GIÁ
// ==========================================
function OrderItemRow({ item, idx, isLast, orderStatus, onOpenReview, reviewedItems }) {
  const [imgUrl, setImgUrl] = useState("https://placehold.co/100x100?text=Loading...");
  
  const prodId = item.product_id || item.productId || item.product || item._id;
  const itemKey = `${prodId}-${item.color || "none"}-${item.size || "none"}`;
  const isReviewed = reviewedItems[itemKey] || reviewedItems[prodId];

  useEffect(() => {
    const existingImg = item.image || item.img || item.thumbnail || item.product_image;
    if (existingImg) {
      setImgUrl(existingImg);
      return;
    }

    if (prodId) {
      fetch(`/api/products/${prodId}`)
        .then((res) => res.json())
        .then((productData) => {
          if (productData && (productData.image || productData.img)) {
            setImgUrl(productData.image || productData.img);
          } else {
            setImgUrl("https://placehold.co/100x100?text=No+Image");
          }
        })
        .catch(() => setImgUrl("https://placehold.co/100x100?text=No+Image"));
    } else {
      setImgUrl("https://placehold.co/100x100?text=No+Image");
    }
  }, [item, prodId]);

  return (
    <div className={`py-3 px-4 d-flex align-items-center justify-content-between ${!isLast ? "border-bottom" : ""}`}>
      <div className="d-flex align-items-center gap-3">
        <div 
          className="border rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" 
          style={{ width: "65px", height: "65px" }}
        >
          <img 
            src={imgUrl} 
            alt={item.name} 
            className="img-fluid object-fit-cover w-100 h-100" 
            onError={(e) => { e.target.src = "https://placehold.co/100x100?text=No+Image"; }}
          />
        </div>
        <div>
          <h6 className="fw-semibold text-dark mb-1 fs-6">{item.name}</h6>
          {(item.color || item.size || item.quantity) && (
            <div className="text-muted small">
              {item.color && <span className="me-2">Màu: <strong>{item.color}</strong></span>}
              {item.color && (item.size || item.quantity) && <span className="text-secondary-subtle me-2">|</span>}
              {item.size && <span className="me-2">Size: <strong>{item.size}</strong></span>}
              {item.size && item.quantity && <span className="text-secondary-subtle me-2">|</span>}
              {item.quantity && <span>SL: <strong>x{item.quantity}</strong></span>}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-end">
        <span className="fw-bold text-dark d-block mb-1">
          {((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}đ
        </span>
        {(orderStatus === "completed" || orderStatus === "Đã giao") && (
          isReviewed ? (
            <span className="badge bg-light text-success border border-success-subtle fw-normal">
              ✓ Đã đánh giá
            </span>
          ) : (
            <button
              onClick={() => onOpenReview(item, imgUrl, itemKey)}
              className="btn btn-sm rounded-pill px-3 py-1 fw-medium text-white shadow-sm"
              style={{ fontSize: "0.8rem", backgroundColor: "#f59e0b" }}
            >
              ⭐ Đánh giá
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT CHÍNH: CHI TIẾT ĐƠN HÀNG
// ==========================================
export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewedItems, setReviewedItems] = useState({});

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentProductToReview, setCurrentProductToReview] = useState(null);
  const [currentItemKey, setCurrentItemKey] = useState(null);
  const [reviewModalImg, setReviewModalImg] = useState("https://placehold.co/100x100?text=Loading...");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]); 
  const [submitting, setSubmitting] = useState(false);

  const fetchOrderDetails = () => {
    return fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
        return res.json();
      })
      .then((data) => {
        if (data && data._id) {
          setOrder(data);
          const uId = data.userId || data.user_id || data.user?._id || data.user;
          if (uId) {
            fetch(`/api/comments?orderId=${data._id}&userId=${uId}`)
              .then(res => res.json())
              .then(comments => {
                if (Array.isArray(comments)) {
                  const reviewedMap = {};
                  comments.forEach(c => {
                    const pId = c.productId || c.product_id;
                    if (pId) reviewedMap[pId] = true;
                    data.order_items?.forEach(item => {
                      const itemPid = item.product_id || item.productId || item.product || item._id;
                      if (itemPid === pId) {
                        const iKey = `${itemPid}-${item.color || "none"}-${item.size || "none"}`;
                        reviewedMap[iKey] = true;
                      }
                    });
                  });
                  setReviewedItems(reviewedMap);
                }
              })
              .catch(err => console.log("Không thể tải đánh giá:", err));
          }
        } else {
          setOrder(null);
        }
      })
      .catch(() => setOrder(null));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchOrderDetails().finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = async () => {
    if (!currentProductToReview || !order) return;
    const prodId = currentProductToReview.product_id || currentProductToReview.productId || currentProductToReview.product || currentProductToReview._id;
    let uId = order.userId || order.user_id || order.user?._id || order.user;
    
    if (!uId) {
      try {
        const storedUser = localStorage.getItem("user") || localStorage.getItem("userInfo");
        if (storedUser) uId = JSON.parse(storedUser)._id || JSON.parse(storedUser).id;
      } catch (e) { console.error(e); }
    }

    if (!prodId || !uId) {
      alert("Thiếu thông tin định danh để đánh giá!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uId, productId: prodId, orderId: order._id, rating: Number(rating), comment, images }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Đánh giá sản phẩm thành công!");
        setReviewedItems(prev => ({ ...prev, [currentItemKey]: true, [prodId]: true }));
        setShowReviewModal(false);
        setComment("");
        setImages([]);
      } else {
        alert(result.error || "Có lỗi xảy ra!");
      }
    } catch (err) {
      alert("Lỗi kết nối hệ thống!");
    } finally {
      setSubmitting(false);
    }
  };

  // Thêm cấu hình trạng thái "processing" (Đang xử lý)
  const statusConfigs = {
    pending: { text: "Chờ xác nhận", badge: "bg-warning text-dark"},
    processing: { text: "Đang xử lý", badge: "bg-primary text-white", icon: "⚙️" },
    preparing: { text: "Đang đóng gói", badge: "bg-info text-dark"},
    completed: { text: "Đã giao hàng", badge: "bg-success text-white", icon: "✓" },
    "Đã giao": { text: "Đã giao hàng", badge: "bg-success text-white", icon: "✓" },
    cancelled: { text: "Đã hủy", badge: "bg-danger text-white", icon: "✕" }
  };

  if (loading) return <div className="container my-5 text-center py-5"><div className="spinner-border" style={{ color: "#f59e0b" }} role="status"></div><p className="mt-2 text-muted">Đang tải chi tiết đơn hàng...</p></div>;
  if (!order) return <div className="container my-5 text-center py-5 text-danger">⚠️ Không tìm thấy thông tin đơn hàng!<br/><Link href="/profile?tab=orders" className="btn text-white mt-3" style={{ backgroundColor: "#f59e0b" }}>Quay lại danh sách</Link></div>;

  const displayTotal = order.total || 0;
  const displayDiscount = order.discount || 0;
  const displayFinalTotal = order.final_total !== undefined ? order.final_total : (displayTotal - displayDiscount);

  // Kiểm tra phương thức thanh toán
  const rawMethod = (order.paymentMethod || order.payment_method || "").toLowerCase();
  const isCod = rawMethod.includes("cod") || rawMethod.includes("khi nhận hàng");
  
  // Ép trạng thái thành "processing" nếu thanh toán bằng QR / Banking / Chuyển khoản
  const isQRPayment = rawMethod.includes("qr") || rawMethod.includes("banking") || rawMethod.includes("chuyển khoản");
  const effectiveStatus = isQRPayment ? "processing" : (order.status || "pending");

  const currentStatus = statusConfigs[effectiveStatus] || { text: order.status || "Đang xử lý", badge: "bg-secondary text-white", icon: "•" };

  // Format tên phương thức thanh toán viết hoa
  let displayPaymentName = "VNPAY";
  if (isCod) {
    displayPaymentName = "COD";
  } else if (rawMethod.includes("momo")) {
    displayPaymentName = "MOMO";
  } else if (isQRPayment) {
    displayPaymentName = "THANH TOÁN QR";
  } else if (order.paymentMethod || order.payment_method) {
    displayPaymentName = (order.paymentMethod || order.payment_method).toUpperCase();
  }

  return (
    <div className="container my-4" style={{ maxWidth: "800px" }}>
      {/* Nút quay lại */}
      <div className="mb-4">
        <Link href="/profile?tab=orders" className="text-decoration-none text-muted fw-medium d-inline-flex align-items-center gap-1">
          ← Trở về danh sách đơn mua
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        {/* Header Đơn hàng */}
        <div className="p-4 d-flex flex-wrap justify-content-between align-items-center gap-3 border-bottom" style={{ backgroundColor: "#fff7ed" }}>
          <div>
            <small className="text-muted text-uppercase fw-semibold tracking-wider">Mã đơn hàng</small>
            <h4 className="fw-bold mb-0 font-monospace text-dark">#{order._id?.toUpperCase()}</h4>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge px-3 py-2 rounded-pill fw-semibold d-flex align-items-center gap-1 ${currentStatus.badge}`}>
              <span>{currentStatus.icon}</span> {currentStatus.text}
            </span>
          </div>
        </div>

        {/* Thanh trạng thái thanh toán linh hoạt có màu sắc nổi bật */}
        <div className="px-4 py-3 d-flex align-items-center justify-content-between border-bottom bg-light">
          <div className="d-flex align-items-center gap-2 fw-semibold small text-success">
            <span className="badge bg-success text-white rounded-circle p-1" style={{ fontSize: "11px" }}>
              {isCod ? "📦" : "✓"}
            </span>
            <span className="fw-bold">
              {isCod ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán chuyển khoản thành công"}
            </span>
          </div>
          <span className="fw-bold text-dark">{displayFinalTotal.toLocaleString("vi-VN")}đ</span>
        </div>

        {/* Thông tin nhận hàng */}
        <div className="p-4 border-bottom bg-light bg-opacity-50">
          <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
            <span>📍</span> Địa Chỉ Nhận Hàng
          </h6>
          <div className="bg-white p-3 rounded-3 border shadow-sm">
            <div className="row g-2 small">
              <div className="col-sm-3 text-muted">Người nhận:</div>
              <div className="col-sm-9 fw-bold text-dark">{order.name} ({order.phone})</div>
              
              <div className="col-sm-3 text-muted">Địa chỉ:</div>
              <div className="col-sm-9 text-dark fw-medium">{order.location_id || "Chưa cập nhật địa chỉ"}</div>
              
              <div className="col-sm-3 text-muted">Ngày đặt:</div>
              <div className="col-sm-9 text-dark">{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "---"}</div>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="py-2">
          <div className="px-4 pt-3 pb-2">
            <h6 className="fw-bold text-dark mb-0">Sản phẩm trong đơn ({order.order_items?.length || 0})</h6>
          </div>
          {order.order_items?.map((item, idx) => (
            <OrderItemRow 
              key={item.product_id || idx} 
              item={item} 
              idx={idx} 
              isLast={idx === (order.order_items.length - 1)} 
              orderStatus={order.status}
              reviewedItems={reviewedItems}
              onOpenReview={(prod, resolvedImg, iKey) => {
                setCurrentProductToReview(prod);
                setReviewModalImg(resolvedImg);
                setCurrentItemKey(iKey);
                setShowReviewModal(true);
              }}
            />
          ))}
        </div>

        {/* Ghi chú */}
        {order.note && (
          <div className="px-4 py-3 bg-light border-top small">
            <span className="fw-semibold text-secondary">Ghi chú đơn hàng:</span>
            <p className="mb-0 text-dark mt-1 fst-italic">"{order.note}"</p>
          </div>
        )}

        {/* Tổng tiền thanh toán & Phương thức thanh toán */}
        <div className="p-4 bg-light bg-opacity-75 border-top">
          <div className="d-flex justify-content-between mb-2 small text-muted">
            <span>Tạm tính:</span>
            <span>{displayTotal.toLocaleString("vi-VN")}đ</span>
          </div>

          {displayDiscount > 0 && (
            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Giảm giá {order.applied_voucher ? `(${order.applied_voucher.toUpperCase()})` : ""}:</span>
              <span className="text-danger fw-semibold">-{displayDiscount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}

          <div className="d-flex justify-content-between mb-2 small text-muted">
            <span>Phí vận chuyển:</span>
            <span className="text-success fw-medium">Miễn phí</span>
          </div>

          <div className="d-flex justify-content-between mb-3 small text-muted">
            <span>Phương thức thanh toán:</span>
            <span className="fw-semibold text-dark text-uppercase">
              {displayPaymentName}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center pt-3 border-top">
            <span className="fw-bold text-dark">Thành tiền:</span>
            <span className="h4 fw-bold mb-0" style={{ color: "#c2410c" }}>{displayFinalTotal.toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </div>

      {/* MODAL ĐÁNH GIÁ SẢN PHẨM */}
      {showReviewModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow border-0">
              <div className="modal-header border-bottom px-4 py-3" style={{ backgroundColor: "#fff7ed" }}>
                <h5 className="modal-title fw-bold fs-6" style={{ color: "#c2410c" }}>Đánh giá sản phẩm</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                  <img src={reviewModalImg} alt="" className="rounded border object-fit-cover" style={{ width: "50px", height: "50px" }} />
                  <div>
                    <h6 className="fw-bold text-dark small mb-1">{currentProductToReview?.name}</h6>
                    <span className="text-muted small">Phân loại: {currentProductToReview?.color || "Mặc định"} / {currentProductToReview?.size || "Mặc định"}</span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <label className="form-label small fw-bold text-muted mb-2">Chất lượng sản phẩm</label>
                  <div className="d-flex justify-content-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" className="btn p-0 border-0 shadow-none fs-3" onClick={() => setRating(star)}>
                        {star <= rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  <span className="badge px-3 py-1 rounded-pill fw-bold" style={{ backgroundColor: "#ffedd5", color: "#c2410c" }}>
                    {rating === 5 && "Tuyệt vời ⭐⭐⭐⭐⭐"}
                    {rating === 4 && "Hài lòng ⭐⭐⭐⭐"}
                    {rating === 3 && "Bình thường ⭐⭐⭐"}
                    {rating === 2 && "Tạm được ⭐⭐"}
                    {rating === 1 && "Không hài lòng ⭐"}
                  </span>
                </div>

                <div className="mb-3">
                  <textarea 
                    className="form-control shadow-none" 
                    rows="3" 
                    placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm nhé..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="form-label small fw-bold text-muted mb-2">Thêm hình ảnh thực tế</label>
                  <div className="d-flex flex-wrap gap-2">
                    {images.map((mediaUrl, i) => (
                      <div key={i} className="position-relative border rounded overflow-hidden" style={{ width: "60px", height: "60px" }}>
                        <img src={mediaUrl} alt="" className="w-100 h-100 object-fit-cover" />
                        <button type="button" className="position-absolute top-0 end-0 btn btn-dark btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: "18px", height: "18px", fontSize: "10px" }} onClick={() => setImages(images.filter((_, index) => index !== i))}>✕</button>
                      </div>
                    ))}
                    <label className="border border-dashed rounded d-flex flex-column align-items-center justify-content-center bg-light text-muted cursor-pointer" style={{ width: "60px", height: "60px", cursor: "pointer" }}>
                      <span className="fs-5">+</span>
                      <input type="file" className="d-none" multiple accept="image/*" onChange={async (e) => {
                        const files = Array.from(e.target.files);
                        const promises = files.map(file => new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result);
                          reader.readAsDataURL(file);
                        }));
                        const base64s = await Promise.all(promises);
                        setImages([...images, ...base64s]);
                      }} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                <button type="button" className="btn btn-outline-secondary px-4 rounded-pill btn-sm" onClick={() => setShowReviewModal(false)}>Hủy</button>
                <button type="button" className="btn px-4 rounded-pill btn-sm fw-bold text-white shadow-sm" style={{ backgroundColor: "#f59e0b" }} disabled={submitting} onClick={handleSubmitReview}>
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
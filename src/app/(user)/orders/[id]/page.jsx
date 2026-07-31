"use client";

import { useEffect, useState } from "react"; 
import { useParams } from "next/navigation";
import Link from "next/link";

// ==========================================
// COMPONENT CON: TỰ ĐỘNG LẤY ẢNH & KIỂM TRA TRẠNG THÁI ĐÁNH GIÁ
// ==========================================
function OrderItemRow({ item, idx, isLast, orderStatus, orderId, userId, onOpenReview, reviewedItems }) {
  const [imgUrl, setImgUrl] = useState("https://placehold.co/100x100?text=Loading...");
  
  const prodId = item.product_id || item.productId || item.product || item._id;
  const itemKey = `${prodId}-${item.color || "none"}-${item.size || "none"}`;
  
  // Kiểm tra xem đã đánh giá chưa
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
        .catch((err) => {
          console.error("Lỗi khi lấy ảnh sản phẩm:", err);
          setImgUrl("https://placehold.co/100x100?text=No+Image");
        });
    } else {
      setImgUrl("https://placehold.co/100x100?text=No+Image");
    }
  }, [item, prodId]);

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

          {(orderStatus === "completed" || orderStatus === "Đã giao") && (
            isReviewed ? (
              <span className="text-muted small fw-medium fst-italic" style={{ fontSize: "0.75rem" }}>
                ✓ Đã đánh giá
              </span>
            ) : (
              <button
                onClick={() => onOpenReview(item, imgUrl, itemKey)}
                className="btn btn-sm btn-outline-primary py-0 px-2"
                style={{ fontSize: "0.75rem" }}
              >
                ⭐ Đánh giá
              </button>
            )
          )}
        </div>
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
              .catch(err => console.log("Không thể tải danh sách đánh giá cũ:", err));
          }
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

  useEffect(() => {
    if (!id || !order) return;
    const isAlreadyPaid = order.isPaid === true || order.isPaid === "true";
    if (isAlreadyPaid) return;

    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 4000);

    return () => clearInterval(interval);
  }, [id, order]);

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
        
        setReviewedItems(prev => ({
          ...prev,
          [currentItemKey]: true,
          [prodId]: true
        }));

        setShowReviewModal(false);
        setComment("");
        setImages([]);
        setCurrentProductToReview(null);
        setCurrentItemKey(null);
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
  const userId = order.userId || order.user_id || order.user?._id || order.user;

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
                orderId={order._id}
                userId={userId}
                reviewedItems={reviewedItems}
                onOpenReview={(prod, resolvedImg, iKey) => {
                  setCurrentProductToReview(prod);
                  setReviewModalImg(resolvedImg);
                  setCurrentItemKey(iKey);
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
            <div className="modal-content rounded-4 shadow border-0">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark fs-6">Đánh Giá Sản Phẩm</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center mb-4 p-2 bg-light rounded-3">
                  <div className="border rounded me-3 overflow-hidden bg-white d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px", flexShrink: 0 }}>
                    <img 
                      src={reviewModalImg} 
                      alt="" 
                      className="img-fluid object-fit-contain" 
                      style={{ maxHeight: "100%", maxWidth: "100%" }}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/100x100?text=No+Image";
                      }}
                    />
                  </div>
                  <div>
                    <span className="fw-bold d-block text-dark small text-truncate" style={{ maxWidth: "350px" }}>
                      {currentProductToReview?.name || currentProductToReview?.product_name || "Sản phẩm"}
                    </span>
                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Phân loại hàng: {currentProductToReview?.color ? `Màu: ${currentProductToReview.color}` : ""} 
                      {currentProductToReview?.color && currentProductToReview?.size ? ", " : ""} 
                      {currentProductToReview?.size ? `Size: ${currentProductToReview.size}` : "Mặc định"}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <label className="form-label small fw-bold text-muted d-block mb-2">Chất lượng sản phẩm</label>
                  <div className="d-flex justify-content-center gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn p-0 border-0 shadow-none"
                        onClick={() => setRating(star)}
                        style={{ fontSize: "1.8rem", transition: "transform 0.1s" }}
                      >
                        {star <= rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  <span className="badge bg-warning-subtle text-warning-emphasis fw-bold px-3 py-1 rounded-pill small">
                    {rating === 5 && "Tuyệt vời ⭐⭐⭐⭐⭐"}
                    {rating === 4 && "Hài lòng ⭐⭐⭐⭐"}
                    {rating === 3 && "Bình thường ⭐⭐⭐"}
                    {rating === 2 && "Tạm được ⭐⭐"}
                    {rating === 1 && "Không hài lòng ⭐"}
                  </span>
                </div>

                <div className="mb-3">
                  <textarea 
                    className="form-control border-secondary-subtle shadow-none" 
                    rows="4" 
                    placeholder="Hãy chia sẻ những cảm nhận của bạn về chất lượng sản phẩm nhé..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ fontSize: "0.9rem" }}
                  ></textarea>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold text-muted mb-2">Thêm Hình Ảnh / Video</label>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    {images.map((mediaUrl, i) => {
                      const isVideo = mediaUrl.includes("data:video") || mediaUrl.match(/\.(mp4|webm|ogg)$/i);
                      return (
                        <div key={i} className="position-relative border rounded overflow-hidden shadow-sm bg-black" style={{ width: "70px", height: "70px" }}>
                          {isVideo ? (
                            <video src={mediaUrl} className="w-100 h-100 object-fit-cover" />
                          ) : (
                            <img src={mediaUrl} alt="preview" className="w-100 h-100 object-fit-cover" />
                          )}
                          <button
                            type="button"
                            className="position-absolute top-0 end-0 btn btn-dark btn-sm p-0 d-flex align-items-center justify-content-center"
                            style={{ width: "20px", height: "20px", fontSize: "10px", opacity: 0.8, zIndex: 2 }}
                            onClick={() => setImages(images.filter((_, index) => index !== i))}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}

                    <label className="border border-dashed rounded d-flex flex-column align-items-center justify-content-center bg-light text-muted cursor-pointer" style={{ width: "70px", height: "70px", cursor: "pointer" }}>
                      <span style={{ fontSize: "1.2rem" }}>📷</span>
                      <span style={{ fontSize: "0.65rem" }}>Thêm</span>
                      <input 
                        type="file" 
                        className="d-none" 
                        multiple 
                        accept="image/*,video/*"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          
                          const base64Promises = files.map((file) => {
                            return new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result);
                              reader.onerror = (error) => reject(error);
                              reader.readAsDataURL(file);
                            });
                          });

                          try {
                            const base64Files = await Promise.all(base64Promises);
                            setImages([...images, ...base64Files]);
                          } catch (error) {
                            console.error("Lỗi đọc file ảnh:", error);
                            alert("Không thể đọc file ảnh vừa chọn!");
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="form-text text-muted mt-1" style={{ fontSize: "0.75rem" }}>Đã tải lên: {images.length} tệp (Ảnh hoặc Video)</div>
                </div>
              </div>

              <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-4 rounded-pill btn-sm" 
                  onClick={() => setShowReviewModal(false)}
                >
                  Trở Lại
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4 rounded-pill btn-sm fw-bold" 
                  disabled={submitting}
                  onClick={handleSubmitReview}
                >
                  {submitting ? "Đang gửi..." : "Hoàn Thành"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
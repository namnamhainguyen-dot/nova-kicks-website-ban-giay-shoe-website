"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useParams();
  const router = useRouter();
  const id = params?.id; // Lấy ID từ URL động [id]

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        // Gọi chính xác sang api/orders của backend
        const res = await fetch(`/api/orders/${id}`);
        
        if (!res.ok) {
          throw new Error("Không tìm thấy đơn hàng trên hệ thống.");
        }

        const data = await res.json();
        // Nếu API trả về cấu trúc bọc { success: true, data: ... }
        if (data && data.data) {
          setOrder(data.data);
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  if (loading) return <div className="text-center my-5 p-5">⏳ Đang tải chi tiết đơn hàng...</div>;
  if (error) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-danger d-inline-block px-5">{error}</div>
        <div className="mt-3">
          <Link href="/admin/order" className="btn btn-dark rounded-pill btn-sm">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const statusTexts = {
    pending: "⏳ Chờ xác nhận",
    preparing: "📦 Đang đóng gói",
    shipping: "🚚 Đang giao hàng",
    completed: "✅ Hoàn thành",
    cancelled: "❌ Đã hủy",
  };

  return (
    <div className="container my-5">
      <div className="mb-4">
        <Link href="/admin/order" className="btn btn-light btn-sm rounded-pill border mb-2">
          ⬅️ Quay lại danh sách
        </Link>
        <h2 className="fw-bold text-uppercase">Chi tiết đơn hàng #{order?._id?.slice(-6)}</h2>
        <p className="text-muted small">ID đầy đủ: {order?._id}</p>
      </div>

      <div className="row g-4">
        {/* Thông tin khách hàng */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-4 rounded-3 h-100">
            <h5 className="fw-bold border-bottom pb-2 mb-3">Thông tin giao nhận</h5>
            <p className="mb-2"><strong>Người nhận:</strong> {order?.name}</p>
            <p className="mb-2"><strong>Số điện thoại:</strong> {order?.phone}</p>
            <p className="mb-2"><strong>Địa chỉ:</strong> {order?.address || "Chưa cập nhật"}</p>
            <p className="mb-2"><strong>Ngày đặt hàng:</strong> {order?.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "---"}</p>
            <div className="mt-3 p-3 bg-light rounded-3">
              <strong>Trạng thái hiện tại: </strong> 
              <span className="fw-bold ms-1">{statusTexts[order?.status] || "Đang xử lý"}</span>
              {order?.status === "cancelled" && order?.cancelReason && (
                <div className="text-danger small mt-2 fw-semibold">
                  ⚠️ Lý do hủy: {order.cancelReason}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0 p-4 rounded-3 h-100">
            <h5 className="fw-bold border-bottom pb-2 mb-3">Danh sách sản phẩm mua</h5>
            {order?.order_items && order.order_items.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-borderless align-middle">
                  <thead>
                    <tr className="table-light small text-muted">
                      <th>Tên sản phẩm</th>
                      <th className="text-center" style={{ width: "80px" }}>SL</th>
                      <th className="text-end" style={{ width: "140px" }}>Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items.map((item, idx) => (
                      <tr key={idx} className="border-bottom-dashed">
                        <td>
                          <span className="fw-semibold small d-block text-truncate" style={{ maxWidth: "280px" }}>
                            {item.name}
                          </span>
                        </td>
                        <td className="text-center fw-bold text-secondary">x{item.quantity}</td>
                        <td className="text-end fw-semibold">
                          {(item.price || 0).toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center py-4">Không tìm thấy dữ liệu sản phẩm.</p>
            )}

            <div className="mt-auto pt-3 border-top text-end">
              <span className="text-muted me-2 fw-medium">Tổng thành tiền:</span>
              <span className="fs-4 fw-bold text-danger">
                {(order?.final_total || order?.total || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

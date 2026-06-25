"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (Array.isArray(data)) {
        setOrders(
          data.sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          )
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        loadOrders();
      }
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại");
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        loadOrders();
      }
    } catch (error) {
      console.error(error);
      alert("Xóa đơn hàng thất bại");
    }
  };

  // ===== Dashboard =====

  const totalOrders = orders.length;

  const totalProducts = orders.reduce(
    (sum, order) =>
      sum +
      (order.order_items?.reduce(
        (s, item) => s + (item.quantity || 0),
        0
      ) || 0),
    0
  );

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce(
      (sum, order) =>
        sum +
        Number(order.final_total || order.total || 0),
      0
    );

  const statusBadges = {
    pending: {
      text: "⏳ Chờ xác nhận",
      class: "bg-warning-subtle text-warning",
    },
    preparing: {
      text: "📦 Đang đóng gói",
      class: "bg-info-subtle text-info",
    },
    shipping: {
      text: "🚚 Đang giao",
      class: "bg-primary-subtle text-primary",
    },
    completed: {
      text: "✅ Hoàn thành",
      class: "bg-success-subtle text-success",
    },
    cancelled: {
      text: "❌ Đã hủy",
      class: "bg-danger-subtle text-danger",
    },
  };

  const filteredOrders = orders.filter((order) =>
    activeTab === "all"
      ? true
      : order.status === activeTab
  );

  if (loading) {
    return (
      <div className="container my-5 text-center">
        Đang tải danh sách đơn hàng...
      </div>
    );
  }

  return (
    <div
      className="container my-5"
      style={{ maxWidth: "1000px" }}
    >
      <div className="text-center mb-4">
        <h3 className="fw-bold">
          📦 Quản Lý Đơn Hàng
        </h3>

        <p className="text-muted">
          Quản lý trạng thái và xử lý đơn hàng
        </p>
      </div>

      {/* Dashboard */}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-uppercase text-secondary">
                Tổng mã đơn hàng
              </small>

              <h3 className="fw-bold mt-3">
                {totalOrders.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-uppercase text-secondary">
                Tổng sản phẩm bán ra
              </small>

              <h3 className="fw-bold mt-3 text-danger">
                {totalProducts.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-uppercase text-secondary">
                Đơn hoàn thành
              </small>

              <h3 className="fw-bold mt-3 text-success">
                {completedOrders.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-uppercase text-secondary">
                Tổng doanh thu
              </small>

              <h3
                className="fw-bold mt-3"
                style={{ fontSize: "1.2rem" }}
              >
                {totalRevenue.toLocaleString("vi-VN")}đ
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}

      <div className="d-flex justify-content-center gap-2 mb-4 overflow-auto py-1">
        {[
          "all",
          "pending",
          "preparing",
          "shipping",
          "completed",
          "cancelled",
        ].map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm rounded-pill px-3 ${
              activeTab === tab
                ? "btn-dark"
                : "btn-light"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all"
              ? "Tất cả"
              : statusBadges[tab]?.text}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-muted">
          Không có đơn hàng nào.
        </p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="card p-3 shadow-sm border-0 rounded-3"
            >
              {/* Header */}

              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <div>
                  <span className="fw-bold text-uppercase small">
                    Mã: #{order._id?.slice(-6)}
                  </span>

                  <small className="text-muted d-block">
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleString("vi-VN")
                      : ""}
                  </small>
                </div>

                <span
                  className={`badge px-3 py-2 rounded-pill ${
                    statusBadges[order.status]
                      ?.class ||
                    "bg-secondary text-white"
                  }`}
                >
                  {statusBadges[order.status]
                    ?.text || "Đang xử lý"}
                </span>
              </div>

              {/* Content */}

              <div className="row g-3">
                <div className="col-md-6">
                  <div>
                    <strong>Khách hàng:</strong>{" "}
                    {order.name}
                  </div>

                  <div>
                    <strong>SĐT:</strong>{" "}
                    {order.phone}
                  </div>

                  <div>
                    <strong>Sản phẩm:</strong>{" "}
                    {order.order_items?.length || 0}
                  </div>

                  <div className="fw-bold text-danger mt-2 fs-5">
                    {(
                      order.final_total ||
                      order.total ||
                      0
                    ).toLocaleString("vi-VN")}
                    đ
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Trạng thái đơn hàng
                  </label>

                  <select
                    className="form-select mb-3"
                    value={
                      order.status || "pending"
                    }
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value
                      )
                    }
                  >
                    <option value="pending">
                      Chờ xác nhận
                    </option>

                    <option value="preparing">
                      Đang đóng gói
                    </option>

                    <option value="shipping">
                      Đang giao hàng
                    </option>

                    <option value="completed">
                      Hoàn thành
                    </option>

                    <option value="cancelled">
                      Đã hủy
                    </option>
                  </select>

                  <div className="d-flex gap-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="btn btn-outline-dark btn-sm rounded-pill"
                    >
                      Xem chi tiết
                    </Link>

                    <button
                      onClick={() =>
                        deleteOrder(order._id)
                      }
                      className="btn btn-danger btn-sm rounded-pill"
                    >
                      Xóa đơn
                    </button>
                  </div>
                </div>
              </div>

              {/* Products */}

              {order.order_items?.length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">
                    Sản phẩm:
                  </small>

                  <div className="mt-2">
                    {order.order_items.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="small"
                        >
                          • {item.name} ×{" "}
                          {item.quantity}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
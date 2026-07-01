"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Profile() {
  // 1. Khởi tạo State lưu thông tin người dùng, đơn hàng và trạng thái loading
  const [user, setUser] = useState({
    _id: "",
    fullname: "",
    email: "",
    phone: "",
    address: ""
  });
  const [orders, setOrders] = useState([]); // Lưu danh sách đơn hàng thực tế
  const [loading, setLoading] = useState(true);

  // 2. Chạy useEffect để lấy thông tin đăng nhập và fetch đơn hàng tương ứng
    useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Chờ kiểm tra nếu có email hợp lệ thì mới gọi API, ngược lại gán mảng rỗng
          if (parsedUser && parsedUser.email) {
            const resOrders = await fetch(`/api/orders?email=${encodeURIComponent(parsedUser.email)}`);
            
            if (resOrders.ok) {
              const ordersData = await resOrders.json();
              
              if (Array.isArray(ordersData)) {
                setOrders(ordersData);
              } else if (ordersData && Array.isArray(ordersData.data)) {
                setOrders(ordersData.data);
              }
            }
          } else {
            setOrders([]); // Không có email cá nhân thì không hiển thị gì cả
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu hệ thống:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndOrders();
  }, []);

  // 3. Hàm xử lý thay đổi dữ liệu khi người dùng gõ vào ô Input
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  // 4. Hàm xử lý khi nhấn nút Cập nhật thông tin
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Đảm bảo dữ liệu gửi đi không bị undefined hoặc null
      const payload = {
        _id: user._id,
        email: user.email,
        fullname: user.fullname?.trim() || "",
        phone: user.phone?.trim() || "",
        address: user.address?.trim() || ""
      };

      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        alert("Cập nhật thông tin tài khoản thành công! 🎉");
        // Lưu lại dữ liệu sạch vào localStorage để đồng bộ trạng thái hiển thị
        localStorage.setItem("user", JSON.stringify({ ...user, ...payload }));
      } else {
        // Hiển thị lý do lỗi cụ thể từ Backend trả về nếu có
        alert(`Lỗi: ${result.error || "Có lỗi xảy ra, vui lòng thử lại!"}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối khi cập nhật profile:", error);
      alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    }
  };

  // Trạng thái chờ tải dữ liệu
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light text-secondary" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ================= NỘI DUNG CHÍNH ================= */}
      <main className="container my-5 pt-5 flex-grow-1">
        <div className="text-center my-4">
          <h1 className="fw-bold text-dark mb-2">Hồ sơ cá nhân</h1>
          <p className="text-muted">Quản lý thông tin tài khoản và lịch sử mua sắm của bạn</p>
        </div>

        <div className="row g-4">
          {/* Khối Thông tin cá nhân */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", fontSize: "20px" }}>
                    👤
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0">Thông tin cá nhân</h4>
                    <small className="text-muted">Cập nhật thông tin liên hệ</small>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control rounded-3 border-light bg-light" id="fullname" placeholder="Họ và tên" value={user.fullname || ""} onChange={handleInputChange} />
                    <label htmlFor="fullname" className="text-muted">Họ và tên</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input type="email" className="form-control rounded-3 border-light bg-light" id="email" placeholder="Email" value={user.email || ""} onChange={handleInputChange} disabled />
                    <label htmlFor="email" className="text-muted">Email</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control rounded-3 border-light bg-light" id="phone" placeholder="Số điện thoại" value={user.phone || ""} onChange={handleInputChange} />
                    <label htmlFor="phone" className="text-muted">Số điện thoại</label>
                  </div>
                  <div className="form-floating mb-4">
                    <input type="text" className="form-control rounded-3 border-light bg-light" id="address" placeholder="Địa chỉ" value={user.address || ""} onChange={handleInputChange} />
                    <label htmlFor="address" className="text-muted">Địa chỉ giao hàng</label>
                  </div>
                  <button type="submit" className="btn btn-dark w-100 py-2.5 rounded-3 fw-semibold shadow-sm transition">
                    Cập nhật thông tin
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Khối Đơn hàng đã đặt (ĐỘNG) */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", fontSize: "20px" }}>
                    📦
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0">Đơn hàng đã đặt</h4>
                    <small className="text-muted">Lịch sử giao dịch gần đây</small>
                  </div>
                </div>

                <div className="table-responsive">
                  {orders.length > 0 ? (
                    <table className="table table-hover align-middle custom-table">
                      <thead>
                        <tr className="text-muted small text-uppercase">
                          <th className="border-0 pb-3">Mã đơn</th>
                          <th className="border-0 pb-3">Tổng tiền</th>
                          <th className="border-0 pb-3">Ngày đặt</th>
                          <th className="border-0 pb-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="fw-bold text-dark py-3">
                              #{order._id?.slice(-6).toUpperCase()}
                            </td>
                            <td className="py-3 text-danger fw-semibold">
                              {Number(order.final_total || order.totalPrice || order.total)?.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="text-muted py-3">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "Vừa xong"}
                            </td>
                            <td className="py-3">
                              <span className={`badge rounded-pill px-3 py-2 fw-medium ${
                                order.status === "Hoàn thành" || order.status === "completed" ? "bg-success-subtle text-success" :
                                order.status === "Đang xử lý" || order.status === "pending" ? "bg-warning-subtle text-warning" : 
                                "bg-info-subtle text-info"
                              }`}>
                                {order.status === "completed" ? "Hoàn thành" : order.status === "pending" ? "Đang xử lý" : order.status || "Chờ xử lý"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted m-0">Bạn chưa có đơn hàng nào.</p>
                      <Link href="/products" className="btn btn-sm btn-outline-dark rounded-pill px-4 mt-3">
                        Mua sắm ngay 🛒
                      </Link>
                    </div>
                  )}
                </div>

                {orders.length > 0 && (
                  <Link href="/orders/history" className="btn btn-outline-dark w-100 py-2.5 rounded-3 fw-semibold mt-3 text-center d-block text-decoration-none">
                    Xem toàn bộ chi tiết đơn hàng
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-top text-muted py-4 mt-auto">
        <div className="container text-center">
          <p className="fw-bold text-dark mb-1">Nova-kicks</p>
          <p className="small mb-2">123 CVPM Quang Trung, Quận 12, TP.HCM | Hotline: 0123 456 789</p>
          <p className="small mb-0 text-light-emphasis">&copy; 2026 Nova-kicks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
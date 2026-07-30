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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State thông báo lỗi validation số điện thoại
  const [phoneError, setPhoneError] = useState("");

  // --- STATE DÀNH CHO BỘ CHỌN ĐỊA CHỈ ---
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  // 2. Tải thông tin người dùng & đơn hàng
  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

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
            setOrders([]);
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

  // 3. API Địa chính Mới: Lấy danh sách Tỉnh / Thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
        const data = await res.json();
        if (data.error === 0) {
          setProvinces(data.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách Tỉnh/Thành:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Khi chọn Tỉnh/Thành -> Lấy danh sách Quận/Huyện
  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);

    if (provinceId) {
      try {
        const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
        const data = await res.json();
        if (data.error === 0) {
          setDistricts(data.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải Quận/Huyện:", error);
      }
    }
  };

  // Khi chọn Quận/Huyện -> Lấy danh sách Xã/Phường
  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedWard("");
    setWards([]);

    if (districtId) {
      try {
        const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
        const data = await res.json();
        if (data.error === 0) {
          setWards(data.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải Xã/Phường:", error);
      }
    }
  };

  // 4. Hàm xử lý thay đổi dữ liệu các ô Input cơ bản
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === "phone") {
      // Chỉ cho phép nhập chữ số
      const numericValue = value.replace(/\D/g, "");
      setUser((prev) => ({ ...prev, phone: numericValue }));

      // Validate định dạng số điện thoại Việt Nam
      const phoneRegex = /^0\d{9}$/;
      if (numericValue && !phoneRegex.test(numericValue)) {
        setPhoneError("Số điện thoại phải bao gồm đúng 10 chữ số (bắt đầu bằng 0).");
      } else {
        setPhoneError("");
      }
      return;
    }

    setUser((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  // 5. Hàm xử lý khi nhấn nút Cập nhật thông tin
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Kiểm tra số điện thoại bắt buộc 10 số
    const phoneRegex = /^0\d{9}$/;
    if (!user.phone || !phoneRegex.test(user.phone)) {
      setPhoneError("Vui lòng nhập số điện thoại hợp lệ (10 chữ số).");
      return;
    }

    // Lấy tên đơn vị hành chính từ id đã chọn
    const provinceObj = provinces.find((p) => String(p.id) === String(selectedProvince));
    const districtObj = districts.find((d) => String(d.id) === String(selectedDistrict));
    const wardObj = wards.find((w) => String(w.id) === String(selectedWard));

    // Ghép các thành phần địa chỉ lại thành chuỗi hoàn chỉnh
    let fullAddress = user.address || "";
    if (houseNumber.trim() || provinceObj || districtObj || wardObj) {
      const parts = [
        houseNumber.trim(),
        wardObj ? wardObj.full_name : "",
        districtObj ? districtObj.full_name : "",
        provinceObj ? provinceObj.full_name : ""
      ].filter(Boolean);
      fullAddress = parts.join(", ");
    }

    try {
      const payload = {
        _id: user._id,
        email: user.email,
        fullname: user.fullname?.trim() || "",
        phone: user.phone?.trim() || "",
        address: fullAddress
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
        setUser((prev) => ({ ...prev, address: fullAddress }));
        localStorage.setItem("user", JSON.stringify({ ...user, ...payload }));

        // Reset các ô nhập địa chỉ sau khi lưu thành công
        setHouseNumber("");
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedWard("");
        setDistricts([]);
        setWards([]);
      } else {
        alert(`Lỗi: ${result.error || "Có lỗi xảy ra, vui lòng thử lại!"}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối khi cập nhật profile:", error);
      alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    }
  };

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

                  {/* Input Số điện thoại với Validation 10 số */}
                  <div className="form-floating mb-1">
                    <input
                      type="tel"
                      maxLength={10}
                      className={`form-control rounded-3 border-light bg-light ${phoneError ? "is-invalid" : ""}`}
                      id="phone"
                      placeholder="Số điện thoại"
                      value={user.phone || ""}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="phone" className="text-muted">Số điện thoại</label>
                  </div>
                  {phoneError ? (
                    <div className="text-danger small mb-3 ms-1" style={{ fontSize: "0.8rem" }}>
                      {phoneError}
                    </div>
                  ) : (
                    <div className="mb-3"></div>
                  )}

                  {/* --- BỘ CHỌN ĐỊA CHỈ HÀNH CHÍNH (ĐÃ TỐI ƯU GỌN GÀNG) --- */}
                  <div className="mb-3 p-3 bg-light rounded-3 border border-light">
                    <label className="form-label small fw-semibold text-dark mb-2">Thêm / Đổi địa chỉ mới</label>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <select className="form-select form-select-sm rounded-3 border-secondary-subtle py-2" value={selectedProvince} onChange={handleProvinceChange}>
                          <option value="">-- Chọn Tỉnh/Thành --</option>
                          {provinces.map((prov) => (
                            <option key={prov.id} value={prov.id}>
                              {prov.full_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <select className="form-select form-select-sm rounded-3 border-secondary-subtle py-2" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince}>
                          <option value="">-- Chọn Quận/Huyện --</option>
                          {districts.map((dist) => (
                            <option key={dist.id} value={dist.id}>
                              {dist.full_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <select className="form-select form-select-sm rounded-3 border-secondary-subtle py-2" value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict}>
                          <option value="">-- Chọn Phường/Xã --</option>
                          {wards.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.full_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control form-control-sm rounded-3 border-secondary-subtle py-2"
                          placeholder="Số nhà, tên đường"
                          value={houseNumber}
                          onChange={(e) => setHouseNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hiển thị địa chỉ hiện tại đã lưu */}
                  {user.address && (
                    <div className="mb-3 p-2.5 rounded-3 bg-light border border-light">
                      <small className="text-muted d-block fw-semibold mb-1">Địa chỉ hiện tại:</small>
                      <small className="text-dark">{user.address}</small>
                    </div>
                  )}

                  <button type="submit" className="btn btn-dark w-100 py-2.5 rounded-3 fw-semibold shadow-sm transition">
                    Cập nhật thông tin
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Khối Đơn hàng đã đặt */}
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
          <p className="small mb-2">123 CVPM Quang Trung, Quận 12, TP.HCM | Hotline: 0931839732</p>
          <p className="small mb-0 text-light-emphasis">&copy; 2026 Nova-kicks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
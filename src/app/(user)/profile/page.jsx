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
    addresses: [],
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Thêm state loading khi submit modal

  // Validation
  const [phoneError, setPhoneError] = useState("");

  // --- STATE DÀNH CHO QUẢN LÝ ĐA ĐỊA CHỈ (MODAL CRUD) ---
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null = Thêm mới, string = ID sửa

  // Input fields của Modal địa chỉ
  const [addressLabel, setAddressLabel] = useState("Nhà riêng");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // State API Địa chính esgoo.net
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // 2. Tải thông tin người dùng & đơn hàng
  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);

          // Tự động tương thích nếu user cũ chỉ có 'address' dạng string
          let userAddresses = parsedUser.addresses || [];
          if (userAddresses.length === 0 && parsedUser.address && parsedUser.address.trim() !== "") {
            userAddresses = [
              {
                _id: "addr_default_legacy",
                label: "Nhà riêng",
                receiverName: parsedUser.fullname || "",
                receiverPhone: parsedUser.phone || "",
                fullAddress: parsedUser.address,
                isDefault: true,
              },
            ];
          }

          setUser({
            ...parsedUser,
            addresses: userAddresses,
          });

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

  // 3. API Địa chính: Lấy danh sách Tỉnh / Thành phố
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

  // 4. Xử lý đổi tên, sđt cá nhân
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setUser((prev) => ({ ...prev, phone: numericValue }));

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
      [id]: value,
    }));
  };

  // 5. Cập nhật thông tin cơ bản (Tên & SĐT)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    let rawId = user._id || user.id;

    // Xử lý phòng hờ trường hợp _id bị lưu dạng Object của MongoDB
    if (typeof rawId === "object" && rawId !== null) {
      rawId = rawId.$oid || rawId.toString();
    }
    
    const currentUserId = String(rawId || "").trim();

    if (!currentUserId || currentUserId === "undefined" || currentUserId === "[object Object]") {
      alert("Lỗi định danh: Không tìm thấy ID người dùng hợp lệ. Vui lòng đăng nhập lại!");
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!user.phone || !phoneRegex.test(user.phone)) {
      setPhoneError("Vui lòng nhập số điện thoại hợp lệ (10 chữ số).");
      return;
    }

    try {
      const payload = {
        fullname: user.fullname?.trim() || "",
        phone: user.phone?.trim() || "",
        addresses: user.addresses || [],
      };

      const res = await fetch(`/api/users/${currentUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Cập nhật thông tin cá nhân thành công! 🎉");
        
        const updatedUserData = { ...user, ...payload, _id: currentUserId };
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // Tự động làm mới lại trang để Header và mọi component đồng bộ ngay lập tức dữ liệu mới
        window.location.reload();
      } else {
        alert(`Lỗi từ server: ${result.error || "Có lỗi xảy ra, vui lòng thử lại!"}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối khi cập nhật profile:", error);
      alert("Không thể kết nối đến máy chủ! Vui lòng kiểm tra lại terminal backend.");
    }
  };

  // ── 6. QUẢN LÝ DỮ LIỆU ĐA ĐỊA CHỈ ──
  const syncAddressesToStorageAndServer = async (newAddresses) => {
    const updatedUser = { ...user, addresses: newAddresses };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    try {
      await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: user.fullname?.trim() || "",
          phone: user.phone?.trim() || "",
          addresses: newAddresses,
        }),
      });
    } catch (err) {
      console.error("Lỗi đồng bộ danh sách địa chỉ:", err);
    }
  };

  // Mở Modal Thêm mới
  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setAddressLabel("Nhà riêng");
    setReceiverName(user.fullname || "");
    setReceiverPhone(user.phone || "");
    setHouseNumber("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    setIsDefaultAddress((user.addresses || []).length === 0);
    setShowAddressModal(true);
  };

  // Mở Modal Sửa
  const handleOpenEditModal = async (addr) => {
    setEditingAddressId(addr._id);
    setAddressLabel(addr.label || "Nhà riêng");
    setReceiverName(addr.receiverName || "");
    setReceiverPhone(addr.receiverPhone || "");
    setHouseNumber(addr.detailAddress || addr.houseNumber || "");
    setIsDefaultAddress(!!addr.isDefault);

    setSelectedProvince(addr.provinceId || "");
    if (addr.provinceId) {
      try {
        const resD = await fetch(`https://esgoo.net/api-tinhthanh/2/${addr.provinceId}.htm`);
        const dataD = await resD.json();
        if (dataD.error === 0) setDistricts(dataD.data || []);

        if (addr.districtId) {
          setSelectedDistrict(addr.districtId);
          const resW = await fetch(`https://esgoo.net/api-tinhthanh/3/${addr.districtId}.htm`);
          const dataW = await resW.json();
          if (dataW.error === 0) setWards(dataW.data || []);
          setSelectedWard(addr.wardId || "");
        }
      } catch (e) {
        console.error("Lỗi load lại đơn vị hành chính khi sửa:", e);
      }
    }
    setShowAddressModal(true);
  };

  // Lưu Địa chỉ (Thêm hoặc Sửa)
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!receiverName.trim() || !receiverPhone.trim() || !houseNumber.trim()) {
      alert("Vui lòng điền đầy đủ Tên, Số điện thoại người nhận và Số nhà!");
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(receiverPhone)) {
      alert("Số điện thoại người nhận không hợp lệ (cần đúng 10 số)!");
      return;
    }

    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      alert("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã!");
      return;
    }

    setSubmitting(true);

    const provinceObj = provinces.find((p) => String(p.id) === String(selectedProvince));
    const districtObj = districts.find((d) => String(d.id) === String(selectedDistrict));
    const wardObj = wards.find((w) => String(w.id) === String(selectedWard));

    const fullAddrString = [
      houseNumber.trim(),
      wardObj ? wardObj.full_name : "",
      districtObj ? districtObj.full_name : "",
      provinceObj ? provinceObj.full_name : "",
    ]
      .filter(Boolean)
      .join(", ");

    let updatedList = [...(user.addresses || [])];

    if (isDefaultAddress) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingAddressId) {
      updatedList = updatedList.map((a) =>
        a._id === editingAddressId
          ? {
              ...a,
              label: addressLabel,
              receiverName,
              receiverPhone,
              detailAddress: houseNumber,
              provinceId: selectedProvince,
              districtId: selectedDistrict,
              wardId: selectedWard,
              fullAddress: fullAddrString,
              isDefault: isDefaultAddress,
            }
          : a
      );
    } else {
      const newAddressItem = {
        _id: "addr_" + Date.now(),
        label: addressLabel,
        receiverName,
        receiverPhone,
        detailAddress: houseNumber,
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        wardId: selectedWard,
        fullAddress: fullAddrString,
        isDefault: isDefaultAddress || updatedList.length === 0,
      };
      updatedList.push(newAddressItem);
    }

    await syncAddressesToStorageAndServer(updatedList);
    setSubmitting(false);
    setShowAddressModal(false);
  };

  // Xóa Địa chỉ
  const handleDeleteAddress = (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    const updatedList = user.addresses.filter((a) => a._id !== id);
    syncAddressesToStorageAndServer(updatedList);
  };

  // Đặt làm mặc định
  const handleSetDefault = (id) => {
    const updatedList = user.addresses.map((a) => ({
      ...a,
      isDefault: a._id === id,
    }));
    syncAddressesToStorageAndServer(updatedList);
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
          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & ĐA ĐỊA CHỈ */}
          <div className="col-lg-6">
            {/* Khối Thông tin tài khoản */}
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", fontSize: "20px" }}>
                    👤
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0">Thông tin cá nhân</h4>
                    <small className="text-muted">Cập nhật thông tin liên hệ chính</small>
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

                  <button type="submit" className="btn btn-dark w-100 py-2.5 rounded-3 fw-semibold shadow-sm">
                    Lưu thông tin cá nhân
                  </button>
                </form>
              </div>
            </div>

            {/* Khối Danh Sách Địa Chỉ Giao Hàng */}
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", fontSize: "20px" }}>
                      📍
                    </div>
                    <div>
                      <h4 className="fw-bold text-dark mb-0">Địa chỉ giao hàng</h4>
                      <small className="text-muted">Quản lý sổ địa chỉ của bạn</small>
                    </div>
                  </div>
                  <button className="btn btn-outline-dark btn-sm rounded-pill fw-semibold px-3" onClick={handleOpenAddModal}>
                    + Thêm địa chỉ
                  </button>
                </div>

                {/* Danh sách địa chỉ đã lưu */}
                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="text-center py-4 bg-light rounded-3">
                    <p className="text-muted small mb-0">Bạn chưa lưu địa chỉ nhận hàng nào.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {user.addresses.map((addr) => (
                      <div key={addr._id} className="p-3 border rounded-3 bg-light position-relative">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="badge bg-secondary">{addr.label || "Địa chỉ"}</span>
                              {addr.isDefault && <span className="badge bg-success">Mặc định</span>}
                            </div>
                            <div className="fw-bold text-dark small">
                              {addr.receiverName || user.fullname} <span className="text-muted fw-normal">({addr.receiverPhone || user.phone})</span>
                            </div>
                            <div className="small text-secondary mt-1">{addr.fullAddress}</div>
                          </div>

                          <div className="d-flex gap-2">
                            <button className="btn btn-link text-primary p-0 btn-sm text-decoration-none" onClick={() => handleOpenEditModal(addr)}>
                              Sửa
                            </button>
                            <button className="btn btn-link text-danger p-0 btn-sm text-decoration-none" onClick={() => handleDeleteAddress(addr._id)}>
                              Xóa
                            </button>
                          </div>
                        </div>

                        {!addr.isDefault && (
                          <button className="btn btn-sm btn-white border border-secondary-subtle text-dark mt-2 py-0 px-2" style={{ fontSize: "0.75rem" }} onClick={() => handleSetDefault(addr._id)}>
                            Thiết lập mặc định
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: ĐƠN HÀNG ĐÃ ĐẶT */}
          <div className="col-lg-6">
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

      {/* MODAL THÊM / SỬA ĐỊA CHỈ GIAO HÀNG */}
      {showAddressModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  {editingAddressId ? "Cập Nhật Địa Chỉ" : "Thêm Địa Chỉ Mới"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddressModal(false)}></button>
              </div>
              <form onSubmit={handleSaveAddress}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Họ và tên người nhận *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Nhập tên người nhận"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Số điện thoại *</label>
                      <input
                        type="tel"
                        maxLength={10}
                        className="form-control rounded-3"
                        placeholder="Nhập số điện thoại 10 số"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Tỉnh / Thành phố *</label>
                      <select className="form-select rounded-3" value={selectedProvince} onChange={handleProvinceChange} required>
                        <option value="">-- Chọn Tỉnh/Thành --</option>
                        {provinces.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Quận / Huyện *</label>
                      <select className="form-select rounded-3" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} required>
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Phường / Xã *</label>
                      <select className="form-select rounded-3" value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} required>
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Số nhà, tên đường *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Ví dụ: 123 Đường CVPM Quang Trung"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Loại địa chỉ</label>
                      <select className="form-select rounded-3" value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)}>
                        <option value="Nhà riêng">Nhà riêng</option>
                        <option value="Công ty">Công ty / Văn phòng</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className="col-12 mt-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="defaultCheck"
                          checked={isDefaultAddress}
                          onChange={(e) => setIsDefaultAddress(e.target.checked)}
                        />
                        <label className="form-check-label small text-dark" htmlFor="defaultCheck">
                          Đặt làm địa chỉ nhận hàng mặc định
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAddressModal(false)} disabled={submitting}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-dark rounded-pill px-4 fw-bold" disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Lưu địa chỉ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
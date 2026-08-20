"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();

  // 1. Khởi tạo State lưu thông tin người dùng, đơn hàng và trạng thái loading
  const [user, setUser] = useState({
    _id: "",
    fullname: "",
    email: "",
    phone: "",
    avatar: "",
    addresses: [],
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Thêm state lọc trạng thái đơn hàng
  const [orderFilter, setOrderFilter] = useState("all");

  // Validation
  const [phoneError, setPhoneError] = useState("");

  // State kiểm soát chế độ chỉnh sửa thông tin cá nhân
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- STATE DÀNH CHO QUẢN LÝ ĐA ĐỊA CHỈ (MODAL CRUD) ---
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

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

  // --- STATE CHO MODAL HỦY ĐƠN HÀNG ---
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderIdToCancel, setSelectedOrderIdToCancel] = useState(null);
  const [cancelReasonOption, setCancelReasonOption] = useState("Đổi ý, không muốn mua nữa");
  const [customCancelReason, setCustomCancelReason] = useState("");

  // --- STATE CHO TAB ĐỔI MẬT KHẨU ---
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Tab điều hướng
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Từ điển ánh xạ trạng thái đơn hàng chuẩn quy trình
  const statusBadges = {
    pending: { text: "Đang chờ xác nhận", class: "bg-warning-subtle text-warning-emphasis fw-bold", icon: "bi bi-clock-history" },
    processing: { text: "Đang xử lý", class: "bg-primary-subtle text-primary-emphasis fw-bold", icon: "bi bi-gear-wide-connected" },
    preparing: { text: "Đang đóng gói", class: "bg-info-subtle text-info-emphasis fw-bold", icon: "bi bi-box-seam" },
    shipping: { text: "Đang giao", class: "bg-primary-subtle text-primary-emphasis fw-bold", icon: "bi bi-truck" },
    completed: { text: "Hoàn thành", class: "bg-success-subtle text-success-emphasis fw-bold", icon: "bi bi-check-circle" },
    cancelled: { text: "Đã hủy", class: "bg-danger-subtle text-danger-emphasis fw-bold", icon: "bi bi-x-circle" },
  };

  const getStatusInfo = (statusKey) => {
    const key = (statusKey || "").toLowerCase().trim();
    if (key === "pending" || key === "đang chờ xác nhận" || key === "chờ xác nhận") {
      return statusBadges.pending;
    }
    if (key === "processing" || key === "đang xử lý" || key === "chờ xử lý") {
      return statusBadges.processing;
    }
    if (key === "preparing" || key === "đang đóng gói") {
      return statusBadges.preparing;
    }
    if (key === "shipping" || key === "đang giao") {
      return statusBadges.shipping;
    }
    if (key === "completed" || key === "hoàn thành" || key === "đã giao hàng") {
      return statusBadges.completed;
    }
    if (key === "cancelled" || key === "đã hủy") {
      return statusBadges.cancelled;
    }
    return { text: statusKey || "Đang chờ xác nhận", class: "bg-secondary-subtle text-secondary-emphasis fw-bold", icon: "bi bi-question-circle" };
  };

  // 2. Tải thông tin người dùng từ API Server & đơn hàng
  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          let rawId = parsedUser._id || parsedUser.id;
          if (typeof rawId === "object" && rawId !== null) {
            rawId = rawId.$oid || rawId.toString();
          }
          const currentUserId = String(rawId || "").trim();

          if (currentUserId && currentUserId !== "undefined") {
            try {
              const resUser = await fetch(`/api/users/${currentUserId}`);
              if (resUser.ok) {
                const freshUserData = await resUser.json();
                if (freshUserData) {
                  parsedUser.addresses = freshUserData.addresses || parsedUser.addresses || [];
                  parsedUser.phone = freshUserData.phone || parsedUser.phone;
                  parsedUser.fullname = freshUserData.fullname || parsedUser.fullname;
                  parsedUser.avatar = freshUserData.avatar || parsedUser.avatar;
                  localStorage.setItem("user", JSON.stringify(parsedUser));
                }
              }
            } catch (err) {
              console.error("Không thể đồng bộ user từ server, dùng tạm dữ liệu local:", err);
            }
          }

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

  // --- XỬ LÝ HỦY ĐƠN HÀNG QUA MODAL ---
  const openCancelModal = (orderId) => {
    setSelectedOrderIdToCancel(orderId);
    setCancelReasonOption("Đổi ý, không muốn mua nữa");
    setCustomCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = async (e) => {
    e.preventDefault();

    const finalReason = cancelReasonOption === "Khác (Nhập cụ thể)" 
      ? customCancelReason.trim() 
      : cancelReasonOption;

    if (cancelReasonOption === "Khác (Nhập cụ thể)" && !finalReason) {
      alert("Vui lòng nhập cụ thể lý do hủy đơn hàng.");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${selectedOrderIdToCancel}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "cancelled", 
          cancelReason: finalReason 
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Đã hủy đơn hàng thành công!");
        setOrders((prevOrders) =>
          prevOrders.map((ord) =>
            (ord._id === selectedOrderIdToCancel || ord.id === selectedOrderIdToCancel) 
              ? { ...ord, status: "cancelled", cancelReason: finalReason } 
              : ord
          )
        );
        setShowCancelModal(false);
      } else {
        alert(`Lỗi: ${result.error || "Không thể hủy đơn hàng này."}`);
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Không thể kết nối đến máy chủ để hủy đơn hàng.");
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    let rawId = user._id || user.id;
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
        avatar: user.avatar?.trim() || "",
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
        
        window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updatedUserData }));

        setIsEditingProfile(false);
      } else {
        alert(`Lỗi từ server: ${result.error || "Có lỗi xảy ra, vui lòng thử lại!"}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối khi cập nhật profile:", error);
      alert("Không thể kết nối đến máy chủ!");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng điền đầy đủ thông tin mật khẩu!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      setPasswordLoading(true);
      let rawId = user._id || user.id;
      if (typeof rawId === "object" && rawId !== null) {
        rawId = rawId.$oid || rawId.toString();
      }

      const res = await fetch("/api/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(rawId).trim(),
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đổi mật khẩu thành công!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(`Lỗi: ${data.error || "Không thể đổi mật khẩu"}`);
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const syncAddressesToStorageAndServer = async (newAddresses) => {
    const updatedUser = { ...user, addresses: newAddresses };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    try {
      let rawId = user._id || user.id;
      if (typeof rawId === "object" && rawId !== null) {
        rawId = rawId.$oid || rawId.toString();
      }
      await fetch(`/api/users/${String(rawId).trim()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: user.fullname?.trim() || "",
          phone: user.phone?.trim() || "",
          avatar: user.avatar?.trim() || "",
          addresses: newAddresses,
        }),
      });
    } catch (err) {
      console.error("Lỗi đồng bộ danh sách địa chỉ:", err);
    }
  };

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

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!receiverName.trim() || !receiverPhone.trim() || !houseNumber.trim()) {
      alert("Vui lòng điền đầy đủ Tên, Số điện thoại người nhận và Số nhà!");
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

    try {
      let rawId = user._id || user.id;
      if (typeof rawId === "object" && rawId !== null) {
        rawId = rawId.$oid || rawId.toString();
      }
      const currentUserId = String(rawId || "").trim();

      const res = await fetch(`/api/users/${currentUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: user.fullname,
          phone: user.phone,
          avatar: user.avatar,
          addresses: updatedList,
        }),
      });

      if (res.ok) {
        const updatedUser = { ...user, addresses: updatedList };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        alert("Lưu địa chỉ thành công!");
        setShowAddressModal(false);
      } else {
        const errData = await res.json();
        alert(`Lỗi lưu địa chỉ: ${errData.error || "Không thể lưu vào cơ sở dữ liệu"}`);
      }
    } catch (err) {
      console.error("Lỗi khi kết nối server:", err);
      alert("Không thể kết nối đến máy chủ để lưu địa chỉ!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    const updatedList = user.addresses.filter((a) => a._id !== id);
    syncAddressesToStorageAndServer(updatedList);
  };

  const handleSetDefault = (id) => {
    const updatedList = user.addresses.map((a) => ({
      ...a,
      isDefault: a._id === id,
    }));
    syncAddressesToStorageAndServer(updatedList);
  };

  // Logic lọc đơn hàng dựa trên trạng thái được chọn
  const filteredOrders = orders.filter((order) => {
    const rawPayment = (order.paymentMethod || order.payment_method || "").toLowerCase();
    const isQRPayment = rawPayment.includes("vnpay") || rawPayment.includes("qr") || rawPayment.includes("banking") || rawPayment.includes("chuyển khoản");
    const st = isQRPayment ? "processing" : (order.status || "").toLowerCase().trim();

    if (orderFilter === "all") return true;
    if (orderFilter === "pending") return st === "pending" || st === "đang chờ xác nhận";
    if (orderFilter === "processing") return st === "processing" || st === "đang xử lý";
    if (orderFilter === "preparing") return st === "preparing" || st === "đang đóng gói";
    if (orderFilter === "shipping") return st === "shipping" || st === "đang giao";
    if (orderFilter === "completed") return st === "completed" || st === "hoàn thành";
    if (orderFilter === "cancelled") return st === "cancelled" || st === "đã hủy";
    return true;
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
        <div className="spinner-border" role="status" style={{ color: "#d97706" }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column text-secondary bg-white">

      <main className="container mb-5 flex-grow-1" style={{ marginTop: "-110px" }}>
        <div className="mb-4">
          <h2 className="fw-bold mb-1 text-dark">Trang Tài Khoản</h2>
          <p className="text-muted small mb-0">Quản lý thông tin cá nhân và lịch sử mua sắm của bạn</p>
        </div>

        <div className="row g-3">
          
          {/* CỘT TRÁI: SIDEBAR MENU TÀI KHOẢN */}
          <div className="col-lg-3">
            <div className="card border shadow-sm rounded-4 p-4 mb-3 bg-white">
              <div className="d-flex align-items-center gap-3 px-2">
                <div className="position-relative flex-shrink-0">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="rounded-circle border object-fit-cover shadow-sm"
                      style={{ width: "55px", height: "55px" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: "55px", height: "55px", fontSize: "20px", backgroundColor: "#d97706" }}>
                      {user.fullname ? user.fullname.charAt(0).toUpperCase() : <i className="bi bi-person-fill"></i>}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="text-muted small">Xin chào,</div>
                  <div className="fw-bold text-dark text-truncate">{user.fullname || "Tài khoản của tôi"}</div>
                </div>
              </div>
            </div>

            <div className="card border shadow-sm rounded-4 p-2 bg-white">
              <div className="d-flex flex-column gap-1">
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setIsEditingProfile(false);
                  }}
                  className={`btn text-start border-0 py-2.5 px-3 rounded-3 fw-semibold transition-all d-flex align-items-center gap-2 ${activeTab === "profile" ? "text-dark shadow-sm" : "text-secondary bg-transparent"}`}
                  style={activeTab === "profile" ? { color: "#d97706", backgroundColor: "#fff7ed" } : {}}
                >
                  <i className="bi bi-person-badge"></i> Hồ Sơ Của Tôi
                </button>
                <button
                  onClick={() => setActiveTab("address")}
                  className={`btn text-start border-0 py-2.5 px-3 rounded-3 fw-semibold transition-all d-flex align-items-center gap-2 ${activeTab === "address" ? "text-dark shadow-sm" : "text-secondary bg-transparent"}`}
                  style={activeTab === "address" ? { color: "#d97706", backgroundColor: "#fff7ed" } : {}}
                >
                  <i className="bi bi-geo-alt"></i> Địa Chỉ Nhận Hàng
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`btn text-start border-0 py-2.5 px-3 rounded-3 fw-semibold transition-all d-flex align-items-center gap-2 ${activeTab === "orders" ? "text-dark shadow-sm" : "text-secondary bg-transparent"}`}
                  style={activeTab === "orders" ? { color: "#d97706", backgroundColor: "#fff7ed" } : {}}
                >
                  <i className="bi bi-bag-check"></i> Đơn Hàng Của Tôi
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`btn text-start border-0 py-2.5 px-3 rounded-3 fw-semibold transition-all d-flex align-items-center gap-2 ${activeTab === "password" ? "text-dark shadow-sm" : "text-secondary bg-transparent"}`}
                  style={activeTab === "password" ? { color: "#d97706", backgroundColor: "#fff7ed" } : {}}
                >
                  <i className="bi bi-shield-lock"></i> Đổi Mật Khẩu
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG CHÍNH */}
          <div className="col-lg-9">
            
            {/* TAB 1: HỒ SƠ CÁ NHÂN */}
            {activeTab === "profile" && (
              <div className="card border shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <div className="border-bottom pb-3 mb-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold text-dark mb-1">Hồ Sơ Của Tôi</h4>
                    <p className="text-muted small mb-0">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                  </div>
                  {!isEditingProfile && (
                    <button 
                      type="button" 
                      className="btn btn-sm px-3 rounded-2 fw-semibold d-flex align-items-center gap-1"
                      style={{ color: "#d97706", borderColor: "#d97706", backgroundColor: "#fff7ed" }}
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <i className="bi bi-pencil-square"></i> Chỉnh sửa thông tin
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile} style={{ maxWidth: "650px" }}>
                  <div className="mb-4 row align-items-center">
                    <label className="col-sm-3 col-form-label text-muted text-sm-end fw-medium">Ảnh đại diện</label>
                    <div className="col-sm-9 d-flex align-items-center gap-3">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Avatar preview" 
                          className="rounded-circle border object-fit-cover shadow-sm"
                          style={{ width: "70px", height: "70px" }}
                          onError={(e) => { e.target.src = "https://placehold.co/70x70?text=Avatar"; }}
                        />
                      ) : (
                        <div className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: "70px", height: "70px", fontSize: "24px", backgroundColor: "#d97706" }}>
                          {user.fullname ? user.fullname.charAt(0).toUpperCase() : <i className="bi bi-person-fill"></i>}
                        </div>
                      )}

                      {isEditingProfile && (
                        <div className="flex-grow-1">
                          <label className="form-label small text-muted mb-1">Chọn ảnh từ máy tính:</label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="form-control rounded-2 shadow-none py-1.5 px-3 small mb-2" 
                            onChange={handleFileChange}
                            style={{ borderColor: "#d97706" }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 row align-items-center">
                    <label htmlFor="email" className="col-sm-3 col-form-label text-muted text-sm-end fw-medium">Tên đăng nhập</label>
                    <div className="col-sm-9">
                      <p className="mb-0 text-dark fw-medium py-2">{user.email || ""}</p>
                    </div>
                  </div>

                  <div className="mb-3 row align-items-center">
                    <label htmlFor="fullname" className="col-sm-3 col-form-label text-muted text-sm-end fw-medium">Họ và tên</label>
                    <div className="col-sm-9">
                      {isEditingProfile ? (
                        <input type="text" className="form-control rounded-2 shadow-none py-2 px-3" id="fullname" value={user.fullname || ""} onChange={handleInputChange} required style={{ borderColor: "#d97706" }} />
                      ) : (
                        <p className="mb-0 text-dark fw-medium py-2">{user.fullname || ""}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 row align-items-center">
                    <label htmlFor="phone" className="col-sm-3 col-form-label text-muted text-sm-end fw-medium">Số điện thoại</label>
                    <div className="col-sm-9">
                      {isEditingProfile ? (
                        <>
                          <input
                            type="tel"
                            maxLength={10}
                            className={`form-control rounded-2 shadow-none py-2 px-3 ${phoneError ? "is-invalid" : ""}`}
                            id="phone"
                            value={user.phone || ""}
                            onChange={handleInputChange}
                            required
                            style={{ borderColor: phoneError ? undefined : "#d97706" }}
                          />
                          {phoneError && <div className="invalid-feedback">{phoneError}</div>}
                        </>
                      ) : (
                        <p className="mb-0 text-dark fw-medium py-2">{user.phone || "Chưa cập nhật"}</p>
                      )}
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="row mt-4">
                      <div className="offset-sm-3 col-sm-9 d-flex gap-2">
                        <button type="submit" className="btn text-white px-4 py-2 rounded-2 fw-semibold shadow-sm d-flex align-items-center gap-1" style={{ backgroundColor: "#d97706" }}>
                          <i className="bi bi-check-lg"></i> Lưu Thay Đổi
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-light px-4 py-2 rounded-2 border text-secondary"
                          onClick={() => {
                            setIsEditingProfile(false);
                            window.location.reload();
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* TAB 2: ĐỊA CHỈ NHẬN HÀNG */}
            {activeTab === "address" && (
              <div className="card border shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                  <div>
                    <h4 className="fw-bold text-dark mb-1">Địa Chỉ Nhận Hàng</h4>
                    <p className="text-muted small mb-0">Quản lý các địa chỉ giao hàng đã lưu</p>
                  </div>
                  <button className="btn text-white btn-sm rounded-2 fw-semibold px-3 py-2 shadow-sm d-flex align-items-center gap-1" style={{ backgroundColor: "#d97706" }} onClick={handleOpenAddModal}>
                    <i className="bi bi-plus-lg"></i> Thêm Địa Chỉ Mới
                  </button>
                </div>

                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="text-center py-5 bg-light rounded-4">
                    <p className="text-muted mb-0">Bạn chưa có địa chỉ nhận hàng nào.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {user.addresses.map((addr) => (
                      <div key={addr._id} className="p-4 border rounded-4 bg-white shadow-sm position-relative transition-all">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                          
                          <div className="flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                              <span className="fw-bold text-dark fs-6">{addr.receiverName || user.fullname}</span>
                              <span className="text-muted">|</span>
                              <span className="text-secondary fw-medium">{addr.receiverPhone || user.phone}</span>
                              {addr.isDefault && (
                                <span className="badge rounded-pill px-2.5 py-1 text-white ms-1" style={{ backgroundColor: "#d97706", fontSize: "0.75rem" }}>
                                  Mặc định
                                </span>
                              )}
                              {addr.label && !addr.isDefault && (
                                <span className="badge rounded-pill px-2.5 py-1 bg-light text-secondary border ms-1" style={{ fontSize: "0.75rem" }}>
                                  {addr.label}
                                </span>
                              )}
                            </div>
                            <div className="text-secondary small line-clamp-2" style={{ lineHeight: "1.6" }}>
                              {addr.fullAddress}
                            </div>
                          </div>

                          <div className="d-flex flex-row flex-md-column align-items-md-end justify-content-between justify-content-md-end gap-2 pt-2 pt-md-0 border-top border-md-top-0">
                            <div className="d-flex align-items-center gap-2">
                              <button 
                                className="btn btn-sm btn-light border px-3 py-1 rounded-2 text-dark fw-medium bg-white"
                                style={{ fontSize: "0.85rem" }}
                                onClick={() => handleOpenEditModal(addr)}
                              >
                                Cập nhật
                              </button>
                              {!addr.isDefault && (
                                <button 
                                  className="btn btn-sm btn-outline-danger px-3 py-1 rounded-2 fw-medium"
                                  style={{ fontSize: "0.85rem" }}
                                  onClick={() => handleDeleteAddress(addr._id)}
                                >
                                  Xóa
                                </button>
                              )}
                            </div>
                            
                            {!addr.isDefault && (
                              <button 
                                className="btn btn-link text-decoration-none p-0 text-muted small fw-medium mt-md-1"
                                style={{ fontSize: "0.8rem", color: "#d97706" }}
                                onClick={() => handleSetDefault(addr._id)}
                              >
                                Thiết lập mặc định
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ĐƠN MUA */}
            {activeTab === "orders" && (
              <div className="card border shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <div className="border-bottom pb-3 mb-4">
                  <h4 className="fw-bold text-dark mb-1">Đơn Hàng Của Tôi</h4>
                  <p className="text-muted small mb-0">Danh sách toàn bộ các đơn hàng bạn đã đặt mua</p>
                </div>

                {/* THANH LỌC TRẠNG THÁI ĐƠN HÀNG */}
                <div className="d-flex flex-wrap gap-2 mb-4 pb-3 border-bottom">
                  {[
                    { key: "all", label: "Tất cả" },
                    { key: "pending", label: "Chờ xác nhận" },
                    { key: "processing", label: "Đang xử lý" },
                    { key: "preparing", label: "Đang đóng gói" },
                    { key: "shipping", label: "Đang giao" },
                    { key: "completed", label: "Hoàn thành" },
                    { key: "cancelled", label: "Đã hủy" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setOrderFilter(tab.key)}
                      className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold transition-all ${
                        orderFilter === tab.key ? "text-white shadow-sm" : "btn-light text-secondary border"
                      }`}
                      style={orderFilter === tab.key ? { backgroundColor: "#d97706" } : {}}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="d-flex flex-column gap-3">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const itemsList = order.order_items || order.items || order.products || [];
                      
                      const rawPayment = (order.paymentMethod || order.payment_method || "cod").toLowerCase().trim();
                      const isQRPayment = rawPayment.includes("vnpay") || rawPayment.includes("qr") || rawPayment.includes("banking") || rawPayment.includes("chuyển khoản");
                      const displayPayment = isQRPayment ? "VNPAY" : (rawPayment === "cod" ? "COD" : rawPayment.toUpperCase());
                      
                      const effectiveStatus = isQRPayment ? "processing" : order.status;
                      const badge = getStatusInfo(effectiveStatus);
                      
                      const rawStatus = (effectiveStatus || "").toLowerCase().trim();
                      const isPending = rawStatus === "pending" || rawStatus === "đang chờ xác nhận" || rawStatus === "chờ xác nhận" || rawStatus === "chờ xử lý";
                      const isCancelled = rawStatus === "cancelled" || rawStatus === "đã hủy";

                      const orderDiscount = Number(order.discountAmount || order.discount || 0);

                      return (
                        <div 
                          key={order._id || order.id}
                          className="border rounded-4 p-3 p-md-4 bg-white shadow-sm transition-all"
                        >
                          <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted fw-medium d-flex align-items-center gap-1">
                                <i className="bi bi-calendar3"></i> {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ""}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              {orderDiscount > 0 && (
                                <span className="badge bg-danger-subtle text-danger px-2.5 py-1.5 fw-medium d-flex align-items-center gap-1" style={{ fontSize: "0.8rem" }}>
                                  <i className="bi bi-tag-fill"></i> Đã giảm {orderDiscount.toLocaleString("vi-VN")}đ
                                </span>
                              )}
                              <span className={`badge px-3 py-2 ${badge.class || ""}`} style={badge.style || {}}>
                                <i className={badge.icon}></i> {badge.text}
                              </span>
                            </div>
                          </div>

                          <div className="d-flex flex-column gap-3 mb-3">
                            {itemsList.length > 0 ? (
                              itemsList.map((item, idx) => {
                                const itemName = item.name || item.productName || item.title || "Sản phẩm thời trang";
                                const itemImage = item.image || item.img || item.imageUrl || item.photo || "https://placehold.co/80x80?text=No+Image";
                                
                                const itemPrice = Number(item.price || item.productPrice || 0);
                                const originalPrice = Number(item.originalPrice || item.oldPrice || item.listPrice || 0);
                                const discountAmount = originalPrice > itemPrice ? originalPrice - itemPrice : Number(item.discountAmount || item.discount || 0);
                                
                                const itemQuantity = Number(item.quantity || item.qty || 1);
                                
                                const itemColor = item.color || "";
                                const itemSize = item.size || item.variant || "";

                                const detailsArray = [
                                  itemColor && `Màu: ${itemColor}`,
                                  itemSize && `Size: ${itemSize}`
                                ].filter(Boolean);

                                return (
                                  <div key={idx} className="d-flex align-items-center justify-content-between gap-3 py-2">
                                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                                      <img 
                                        src={itemImage} 
                                        alt={itemName} 
                                        className="rounded-2 border flex-shrink-0 object-fit-cover"
                                        style={{ width: "60px", height: "60px" }}
                                        onError={(e) => { e.target.src = "https://placehold.co/80x80?text=Product"; }}
                                      />
                                      <div className="overflow-hidden">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                          <h6 className="fw-semibold text-dark text-truncate mb-0" style={{ fontSize: "0.95rem" }}>
                                            {itemName}
                                          </h6>
                                          <span className="text-muted small fw-medium flex-shrink-0" style={{ fontSize: "0.85rem" }}>
                                            x{itemQuantity}
                                          </span>
                                        </div>
                                        
                                        {detailsArray.length > 0 && (
                                          <div className="text-muted small mb-0">
                                            Phân loại: <span className="text-dark">{detailsArray.join(" | ")}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="text-end flex-shrink-0">
                                      {discountAmount > 0 && (
                                        <div className="d-flex align-items-center justify-content-end gap-2 mb-1" style={{ fontSize: "0.8rem" }}>
                                          {originalPrice > 0 && (
                                            <span className="text-muted text-decoration-line-through">
                                              {originalPrice.toLocaleString("vi-VN")}đ
                                            </span>
                                          )}
                                          <span className="badge bg-danger-subtle text-danger px-1.5 py-0.5 fw-medium">
                                            Giảm {discountAmount.toLocaleString("vi-VN")}đ
                                          </span>
                                        </div>
                                      )}

                                      <div className="fw-semibold text-dark">
                                        {(itemPrice * itemQuantity).toLocaleString("vi-VN")}đ
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-muted small italic">Không có thông tin chi tiết sản phẩm trong đơn hàng này.</div>
                            )}
                          </div>

                          {isCancelled && (
                            <div className="bg-light p-3 rounded-3 text-sm my-3 border border-light-subtle d-flex align-items-center gap-2">
                              <i className="bi bi-info-circle text-danger"></i>
                              <div>
                                <span className="fw-bold text-dark">Lý do hủy: </span>
                                <span className="text-secondary">{order.cancelReason || "Không có lý do cụ thể"}</span>
                              </div>
                            </div>
                          )}

                          <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top gap-2">
                            <div className="small text-muted d-flex align-items-center gap-1">
                              <i className="bi bi-credit-card"></i> Phương thức thanh toán: <span className="fw-medium text-dark">{displayPayment}</span>
                            </div>
                            
                            <div className="d-flex flex-column align-items-end gap-1">
                              <div className="d-flex align-items-center gap-3">
                                <div>
                                  <span className="small text-muted me-2">Tổng tiền:</span>
                                  <span className="fw-bold fs-5" style={{ color: "#d97706" }}>
                                    {Number(order.final_total || order.totalPrice || order.total || 0).toLocaleString("vi-VN")}đ
                                  </span>
                                </div>

                                <div className="d-flex gap-2">
                                  {isPending && (
                                    <button 
                                      onClick={() => openCancelModal(order._id || order.id)}
                                      className="btn btn-sm btn-outline-danger px-3 py-2 rounded-2 fw-semibold d-flex align-items-center gap-1"
                                    >
                                      <i className="bi bi-x-lg"></i> Hủy đơn
                                    </button>
                                  )}

                                  <button 
                                    onClick={() => router.push(`/orders/${order._id || order.id}`)}
                                    className="btn btn-sm text-white px-3 py-2 rounded-2 fw-semibold shadow-sm d-flex align-items-center gap-1"
                                    style={{ backgroundColor: "#d97706" }}
                                  >
                                    <i className="bi bi-eye"></i> Xem chi tiết
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted m-0">Không tìm thấy đơn hàng nào ở trạng thái này.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: ĐỔI MẬT KHẨU */}
            {activeTab === "password" && (
              <div className="card border shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <div className="border-bottom pb-3 mb-4">
                  <h4 className="fw-bold text-dark mb-1">Đổi Mật Khẩu</h4>
                  <p className="text-muted small mb-0">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                </div>

                <form onSubmit={handleChangePassword} style={{ maxWidth: "550px" }}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Mật khẩu hiện tại *</label>
                    <input
                      type="password"
                      className="form-control rounded-2 shadow-none py-2 px-3"
                      placeholder="Nhập mật khẩu cũ"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      style={{ borderColor: "#d97706" }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Mật khẩu mới *</label>
                    <input
                      type="password"
                      className="form-control rounded-2 shadow-none py-2 px-3"
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ borderColor: "#d97706" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted">Xác nhận mật khẩu mới *</label>
                    <input
                      type="password"
                      className="form-control rounded-2 shadow-none py-2 px-3"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ borderColor: "#d97706" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn text-white px-4 py-2 rounded-2 fw-semibold shadow-sm d-flex align-items-center gap-1"
                    style={{ backgroundColor: "#d97706" }}
                    disabled={passwordLoading}
                  >
                    <i className="bi bi-check-lg"></i> {passwordLoading ? "Đang xử lý..." : "Xác Nhận Đổi Mật Khẩu"}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* MODAL THÊM / SỬA ĐỊA CHỈ GIAO HÀNG */}
      {showAddressModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-warning"></i> {editingAddressId ? "Cập Nhật Địa Chỉ" : "Thêm Địa Chỉ Mới"}
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowAddressModal(false)}></button>
              </div>
              <form onSubmit={handleSaveAddress}>
                <div className="modal-body p-3 p-md-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Họ và tên người nhận *</label>
                      <input
                        type="text"
                        className="form-control rounded-2 shadow-none py-2 px-3"
                        placeholder="Nhập tên người nhận"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        required
                        style={{ borderColor: "#d97706" }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Số điện thoại *</label>
                      <input
                        type="tel"
                        maxLength={10}
                        className="form-control rounded-2 shadow-none py-2 px-3"
                        placeholder="Nhập số điện thoại 10 số"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, ""))}
                        required
                        style={{ borderColor: "#d97706" }}
                      />
                    </div>

                    {/* TỈNH / THÀNH PHỐ */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Tỉnh / Thành phố *</label>
                      <select 
                        className="form-select rounded-2 shadow-none py-2 px-3" 
                        value={selectedProvince} 
                        onChange={handleProvinceChange} 
                        required 
                        style={{ borderColor: "#d97706" }}
                      >
                        <option value="">-- Chọn Tỉnh/Thành --</option>
                        {provinces.map((p) => (
                          <option key={p.id} value={p.id}>{p.full_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* QUẬN / HUYỆN */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Quận / Huyện *</label>
                      <select 
                        className="form-select rounded-2 shadow-none py-2 px-3" 
                        value={selectedDistrict} 
                        onChange={handleDistrictChange} 
                        disabled={!selectedProvince} 
                        required 
                        style={{ borderColor: "#d97706" }}
                      >
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>{d.full_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* PHƯỜNG / XÃ */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Phường / Xã *</label>
                      <select 
                        className="form-select rounded-2 shadow-none py-2 px-3" 
                        value={selectedWard} 
                        onChange={(e) => setSelectedWard(e.target.value)} 
                        disabled={!selectedDistrict} 
                        required 
                        style={{ borderColor: "#d97706" }}
                      >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>{w.full_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Số nhà, tên đường *</label>
                      <input
                        type="text"
                        className="form-control rounded-2 shadow-none py-2 px-3"
                        placeholder="Ví dụ: 123 Đường CVPM Quang Trung"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        required
                        style={{ borderColor: "#d97706" }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Loại địa chỉ</label>
                      <select className="form-select rounded-2 shadow-none py-2 px-3" value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} style={{ borderColor: "#d97706" }}>
                        <option value="Nhà riêng">Nhà riêng</option>
                        <option value="Công ty">Công ty / Văn phòng</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className="col-12 mt-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input shadow-none"
                          id="defaultCheck"
                          checked={isDefaultAddress}
                          onChange={(e) => setIsDefaultAddress(e.target.checked)}
                          style={{ accentColor: "#d97706" }}
                        />
                        <label className="form-check-label small text-dark fw-medium" htmlFor="defaultCheck">
                          Đặt làm địa chỉ nhận hàng mặc định
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0 pb-3 px-4">
                  <button type="button" className="btn btn-light rounded-2 px-4 text-secondary fw-medium" onClick={() => setShowAddressModal(false)} disabled={submitting}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn text-white rounded-2 px-4 fw-bold shadow-sm d-flex align-items-center gap-1" style={{ backgroundColor: "#d97706" }} disabled={submitting}>
                    <i className="bi bi-check-lg"></i> {submitting ? "Đang lưu..." : "Lưu địa chỉ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN LÝ DO HỦY ĐƠN HÀNG */}
      {showCancelModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle text-danger"></i> Lý do hủy đơn hàng
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowCancelModal(false)}></button>
              </div>
              
              <form onSubmit={handleConfirmCancelOrder}>
                <div className="modal-body py-3">
                  <p className="text-muted small mb-3">Vui lòng chọn lý do bạn muốn hủy đơn hàng này:</p>
                  
                  <div className="d-flex flex-column gap-2 mb-3">
                    {[
                      "Đổi ý, không muốn mua nữa",
                      "Sai địa chỉ, sai số điện thoại",
                      "Đặt nhầm sản phẩm / phân loại (size, màu)",
                      "Thủ tục thanh toán gặp rắc rối",
                      "Khác (Nhập cụ thể)"
                    ].map((reason, idx) => (
                      <div className="form-check" key={idx}>
                        <input 
                          type="radio" 
                          className="form-check-input shadow-none" 
                          name="cancelReasonGroup" 
                          id={`reason_${idx}`}
                          value={reason}
                          checked={cancelReasonOption === reason}
                          onChange={(e) => setCancelReasonOption(e.target.value)}
                          style={{ accentColor: "#d97706" }}
                        />
                        <label className="form-check-label text-dark small fw-medium" htmlFor={`reason_${idx}`}>
                          {reason}
                        </label>
                      </div>
                    ))}
                  </div>

                  {cancelReasonOption === "Khác (Nhập cụ thể)" && (
                    <div className="mt-2">
                      <label className="form-label small fw-semibold text-muted">Nhập lý do cụ thể của bạn:</label>
                      <textarea 
                        className="form-control rounded-3 shadow-none" 
                        rows="3" 
                        value={customCancelReason}
                        onChange={(e) => setCustomCancelReason(e.target.value)}
                        placeholder="Nhập lý do hủy đơn..."
                        required
                        style={{ borderColor: "#d97706" }}
                      ></textarea>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0 pt-0 pb-3 px-3">
                  <button type="button" className="btn btn-light rounded-2 px-4 text-secondary fw-medium" onClick={() => setShowCancelModal(false)}>
                    Đóng
                  </button>
                  <button type="submit" className="btn btn-danger rounded-2 px-4 fw-semibold shadow-sm d-flex align-items-center gap-1">
                    <i className="bi bi-trash"></i> Xác nhận hủy đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
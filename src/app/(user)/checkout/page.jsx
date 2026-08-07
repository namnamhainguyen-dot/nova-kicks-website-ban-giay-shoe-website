"use client";

import { CartContext } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const router = useRouter();

  // ── 1. THÔNG TIN KHÁCH HÀNG ──
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // ── 2. ĐỊA CHỈ HÀNH CHÍNH & DANH SÁCH ĐỊA CHỈ ĐÃ LƯU ──
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  // ── 3. THANH TOÁN & ĐƠN HÀNG ──
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isOrdering, setIsOrdering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [checkoutItems, setCheckoutItems] = useState([]);
  const hasClearedCart = useRef(false);

  // ── 4. VOUCHER ──
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);
  
  // Thêm ref để quản lý click outside
  const dropdownRef = useRef(null);

  // Xử lý ẩn dropdown khi click ra ngoài component
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowVoucherDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ── FETCH TỈNH / THÀNH PHỐ (Dùng chung API esgoo.net với Profile) ──
  useEffect(() => {
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) {
          setProvinces(data.data || []);
        }
      })
      .catch((err) => console.error("Lỗi lấy danh sách tỉnh thành:", err));
  }, []);

  // ── FETCH DANH SÁCH VOUCHER KHẢ DỤNG ──
  useEffect(() => {
    fetch("/api/vouchers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableVouchers(data);
        } else if (data.vouchers && Array.isArray(data.vouchers)) {
          setAvailableVouchers(data.vouchers);
        }
      })
      .catch((err) => console.error("Lỗi lấy danh sách voucher:", err));
  }, []);

  // ── FETCH QUẬN / HUYỆN ──
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
      } catch (err) {
        console.error("Lỗi lấy danh sách quận huyện:", err);
      }
    }
  };

  // ── FETCH PHƯỜNG / XÃ ──
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
      } catch (err) {
        console.error("Lỗi lấy danh sách phường xã:", err);
      }
    }
  };

  // ── KHỞI TẠO DỮ LIỆU USER & CHECKOUT ITEMS ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedItems = sessionStorage.getItem("checkout_items");
    let parsedCheckoutItems = [];
    
    if (storedItems) {
      try {
        parsedCheckoutItems = JSON.parse(storedItems);
        if (Array.isArray(parsedCheckoutItems) && parsedCheckoutItems.length > 0) {
          setCheckoutItems(parsedCheckoutItems);
        }
      } catch (e) {
        console.error("Lỗi đọc checkout_items từ sessionStorage:", e);
      }
    } else if (cart && cart.length > 0) {
      setCheckoutItems(cart);
    }

    const queryParams = new URLSearchParams(window.location.search);
    const successSimulated = queryParams.get("success_simulated");
    const urlOrderId = queryParams.get("orderId");

    if (successSimulated === "true" && urlOrderId && !hasClearedCart.current) {
      hasClearedCart.current = true;
      setCreatedOrderId(urlOrderId);
      setIsSuccess(true);

      if (parsedCheckoutItems.length > 0) {
        setCart((prevCart) => {
          const remainingCart = prevCart.filter(
            (cartItem) =>
              !parsedCheckoutItems.some(
                (checkoutItem) =>
                  checkoutItem._id === cartItem._id &&
                  checkoutItem.selectedColor === cartItem.selectedColor &&
                  checkoutItem.selectedSize === cartItem.selectedSize
              )
          );
          localStorage.setItem("cart", JSON.stringify(remainingCart));
          return remainingCart;
        });
      }
      sessionStorage.removeItem("checkout_items");
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);

        let userAddrs = [];
        if (Array.isArray(parsedUser.addresses) && parsedUser.addresses.length > 0) {
          userAddrs = parsedUser.addresses;
        } else if (parsedUser.address && parsedUser.address.trim() !== "") {
          userAddrs = [
            {
              _id: "default_single",
              label: "Nhà riêng",
              receiverName: parsedUser.fullname || "",
              receiverPhone: parsedUser.phone || "",
              fullAddress: parsedUser.address,
              isDefault: true,
            },
          ];
        }

        setSavedAddresses(userAddrs);

        if (userAddrs.length > 0) {
          const defaultAddr = userAddrs.find((a) => a.isDefault) || userAddrs[0];
          setSelectedAddressId(defaultAddr._id);
          setCustomerName(defaultAddr.receiverName || parsedUser.fullname || "");
          setCustomerPhone(defaultAddr.receiverPhone || parsedUser.phone || "");
        } else {
          if (parsedUser.fullname) setCustomerName(parsedUser.fullname);
          if (parsedUser.phone) setCustomerPhone(parsedUser.phone);
        }
      } catch (e) {
        console.error("Lỗi đọc dữ liệu user từ localStorage:", e);
      }
    }
  }, [setCart, cart]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setCustomerName(addr.receiverName || currentUser?.fullname || "");
    setCustomerPhone(addr.receiverPhone || currentUser?.phone || "");
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId("new");
    if (currentUser) {
      setCustomerName(currentUser.fullname || "");
      setCustomerPhone(currentUser.phone || "");
    }
  };

  const total = checkoutItems.reduce((sum, product) => sum + product.price * product.quantity, 0);

  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discount_type === "fixed") {
      discountAmount = appliedVoucher.discount_value;
    } else if (appliedVoucher.discount_type === "percentage") {
      discountAmount = (total * appliedVoucher.discount_value) / 100;
    }
  }

  const finalTotal = Math.max(0, total - discountAmount);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setCustomerPhone(value);
    }
  };

  const executeApplyVoucherCode = async (codeToApply) => {
    if (!codeToApply.trim()) {
      setVoucherError("Vui lòng nhập mã giảm giá!");
      return;
    }

    setVoucherError("");
    setVoucherSuccess("");
    setIsValidatingVoucher(true);

    try {
      const res = await fetch("/api/vouchers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToApply.trim().toUpperCase() }),
      });

      const result = await res.json();

      if (result.success || res.ok) {
        const startDateKey = result.start_date || result.startDate;

        if (startDateKey) {
          const startDate = new Date(startDateKey);
          const now = new Date();

          if (now < startDate) {
            const formattedDate = startDate.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            setVoucherError(`Mã giảm giá có hiệu lực từ ngày ${formattedDate}!`);
            setAppliedVoucher(null);
            return;
          }
        }

        if (total < result.min_order_value) {
          setVoucherError(
            `Đơn hàng tối thiểu ${result.min_order_value.toLocaleString("vi-VN")}đ để dùng mã này!`
          );
          setAppliedVoucher(null);
        } else {
          setAppliedVoucher(result);
          setVoucherSuccess(result.message || "Áp dụng mã giảm giá thành công!");
        }
      } else {
        setVoucherError(result.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        setAppliedVoucher(null);
      }
    } catch (err) {
      setVoucherError("Không thể xác thực mã lúc này.");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleApplyVoucher = (e) => {
    if (e) e.preventDefault();
    executeApplyVoucherCode(voucherCode);
  };

  const handleSelectSuggestedVoucher = (code) => {
    setVoucherCode(code);
    setShowVoucherDropdown(false);
    executeApplyVoucherCode(code);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherSuccess("");
    setVoucherError("");
  };

  const validateOrder = () => {
    if (checkoutItems.length === 0) {
      alert("Không tìm thấy sản phẩm nào để thanh toán!");
      return false;
    }
    if (!customerName.trim()) {
      alert("Vui lòng điền đầy đủ Họ và tên người nhận!");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone)) {
      alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.");
      return false;
    }

    if (selectedAddressId !== "new") {
      const matchedAddr = savedAddresses.find((a) => a._id === selectedAddressId);
      if (!matchedAddr || !matchedAddr.fullAddress) {
        alert("Địa chỉ được chọn không hợp lệ!");
        return false;
      }
    } else {
      if (!detailAddress.trim()) {
        alert("Vui lòng nhập số nhà, tên đường chi tiết!");
        return false;
      }
      if (!selectedProvince || !selectedDistrict || !selectedWard) {
        alert("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện và Phường/Xã!");
        return false;
      }
    }

    return true;
  };

  const getFullDeliveryAddress = () => {
    if (selectedAddressId !== "new") {
      const matchedAddr = savedAddresses.find((a) => a._id === selectedAddressId);
      return matchedAddr ? matchedAddr.fullAddress : "";
    }

    const provinceObj = provinces.find((p) => String(p.id) === String(selectedProvince));
    const districtObj = districts.find((d) => String(d.id) === String(selectedDistrict));
    const wardObj = wards.find((w) => String(w.id) === String(selectedWard));

    return [
      detailAddress.trim(),
      wardObj ? wardObj.full_name : "",
      districtObj ? districtObj.full_name : "",
      provinceObj ? provinceObj.full_name : "",
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleOrder = async (e) => {
    if (e) e.preventDefault();
    if (!validateOrder()) return;

    setIsOrdering(true);
    const fullAddress = getFullDeliveryAddress();

    let updatedAddressesList = savedAddresses;
    let updatedUserPhone = currentUser?.phone || customerPhone;

    if (currentUser && selectedAddressId === "new") {
      const provinceObj = provinces.find((p) => String(p.id) === String(selectedProvince));
      const districtObj = districts.find((d) => String(d.id) === String(selectedDistrict));
      const wardObj = wards.find((w) => String(w.id) === String(selectedWard));

      const newAddrObj = {
        _id: "addr_" + Date.now(),
        label: "Nhà riêng",
        receiverName: customerName,
        receiverPhone: customerPhone,
        detailAddress: detailAddress.trim(),
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        wardId: selectedWard,
        fullAddress: fullAddress,
        isDefault: savedAddresses.length === 0,
      };

      updatedAddressesList = [...savedAddresses, newAddrObj];
      if (!currentUser.phone) {
        updatedUserPhone = customerPhone;
      }

      // Chuẩn hóa User ID giống bên Profile để gọi đúng endpoint PUT /api/users/[id]
      let rawId = currentUser._id || currentUser.id;
      if (typeof rawId === "object" && rawId !== null) {
        rawId = rawId.$oid || rawId.toString();
      }
      const currentUserId = String(rawId || "").trim();

      if (currentUserId && currentUserId !== "undefined") {
        try {
          await fetch(`/api/users/${currentUserId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullname: currentUser.fullname?.trim() || customerName,
              phone: updatedUserPhone,
              addresses: updatedAddressesList,
            }),
          });

          const updatedUserPayload = {
            ...currentUser,
            phone: updatedUserPhone,
            addresses: updatedAddressesList,
          };
          localStorage.setItem("user", JSON.stringify(updatedUserPayload));
          setCurrentUser(updatedUserPayload);
          setSavedAddresses(updatedAddressesList);
        } catch (err) {
          console.error("Lỗi tự động lưu địa chỉ mới vào profile:", err);
        }
      }
    }

    const orderData = {
      email: currentUser?.email || "guest",
      userId: currentUser?._id || currentUser?.id || null,
      name: customerName,
      phone: customerPhone,
      location_id: fullAddress,
      note: orderNote,
      order_items: checkoutItems.map((item) => ({
        product_id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.selectedColor || null,
        size: item.selectedSize || null,
        image: item.image || "",
      })),
      total: total,
      discount: discountAmount,
      final_total: finalTotal,
      applied_voucher: appliedVoucher ? voucherCode.toUpperCase() : null,
      paymentMethod: paymentMethod,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      if (result.code === "success" || result.success || result._id || result.id) {
        const orderId = result._id || result.id || (result.data && result.data._id);
        if (orderId) setCreatedOrderId(orderId);

        const remainingCart = cart.filter(
          (cartItem) =>
            !checkoutItems.some(
              (checkoutItem) =>
                checkoutItem._id === cartItem._id &&
                checkoutItem.selectedColor === cartItem.selectedColor &&
                checkoutItem.selectedSize === cartItem.selectedSize
            )
        );

        setCart(remainingCart);
        if (typeof window !== "undefined") {
          localStorage.setItem("cart", JSON.stringify(remainingCart));
        }

        sessionStorage.removeItem("checkout_items");
        setIsSuccess(true);
      } else {
        alert(result.message || "Có lỗi xảy ra khi xử lý đơn hàng!");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Không thể kết nối tới server! Vui lòng thử lại sau.\n" + err.message);
    } finally {
      setIsOrdering(false);
    }
  };

  // ── VIEW 1: ĐẶT HÀNG THÀNH CÔNG ──
  if (isSuccess) {
    return (
      <main className="container mt-5 pt-5 text-center py-5">
        <div className="card p-5 shadow border-0 d-inline-block rounded-4" style={{ maxWidth: "550px", width: "100%" }}>
          <div className="fs-1 mb-3">🎉</div>
          <h2 className="fw-bold text-success mb-2">Đặt Hàng Thành Công!</h2>
          <p className="text-muted mb-4 px-3">
            Cảm ơn bạn đã tin tưởng lựa chọn sản phẩm của chúng tôi. Đơn hàng đang được đóng gói và sẽ sớm giao tới bạn.
          </p>
          <div className="d-grid gap-3 px-4">
            <Link
              href={createdOrderId ? `/orders/${createdOrderId}` : "/orders/history"}
              className="btn btn-dark btn-lg rounded-pill fw-bold fs-6 shadow-sm py-2"
            >
              Xem đơn hàng ➔
            </Link>
            <Link href="/products" className="btn btn-outline-secondary rounded-pill btn-sm py-2">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── VIEW 2: GIỎ HÀNG TRỐNG ──
  if (checkoutItems.length === 0) {
    return (
      <main className="container mt-5 pt-5 text-center py-5">
        <h1 className="mb-4 text-secondary fw-bold">Trang Thanh Toán</h1>
        <div className="alert alert-warning d-inline-block p-4 shadow-sm rounded-3" style={{ maxWidth: "500px" }}>
          <h4 className="alert-heading fw-bold">🛒 Chưa có sản phẩm</h4>
          <p className="mb-3 text-muted">Vui lòng chọn sản phẩm vào giỏ trước khi thực hiện thanh toán nhé!</p>
          <Link href="/products" className="btn btn-dark px-4 rounded-pill fw-semibold">
            Quay lại cửa hàng
          </Link>
        </div>
      </main>
    );
  }

  // ── VIEW 3: FORM THANH TOÁN ──
  return (
    <main className="container mt-5 pt-5 mb-5">
      <form onSubmit={handleOrder}>
        <div className="row g-4">
          
          {/* TÓM TẮT ĐƠN HÀNG & VOUCHER */}
          <div className="col-lg-5 col-md-12 order-1 order-lg-2">
            <div className="card shadow-sm border-0 sticky-top rounded-3" style={{ top: "100px", zIndex: 10 }}>
              <div className="card-body p-4">
                <h4 className="mb-4 text-dark fw-bold">🛒 Đơn Hàng Của Bạn ({checkoutItems.length})</h4>

                {/* Danh sách SP */}
                <div className="overflow-auto mb-3 border-bottom" style={{ maxHeight: "320px" }}>
                  {checkoutItems.map((product, index) => {
                    const uniqueKey = `checkout-${product._id}-${product.selectedColor || "none"}-${
                      product.selectedSize || "none"
                    }-${index}`;

                    return (
                      <div key={uniqueKey} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                        <div className="d-flex align-items-center">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="rounded border me-3 object-fit-cover"
                              style={{ width: "50px", height: "50px" }}
                            />
                          )}
                          <div>
                            <h6 className="mb-0 fw-semibold text-truncate" style={{ maxWidth: "160px" }}>
                              {product.name}
                            </h6>
                            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                              {product.selectedColor && <span>Màu: {product.selectedColor}</span>}
                              {product.selectedColor && product.selectedSize && <span> | </span>}
                              {product.selectedSize && <span>Size: {product.selectedSize}</span>}
                            </div>
                            <small className="text-muted">Số lượng: {product.quantity}</small>
                          </div>
                        </div>
                        <span className="fw-medium text-dark">
                          {(product.quantity * product.price).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* PHẦN VOUCHER ĐÃ FIX - SỬ DỤNG onCLick VÀ useRef */}
                <div className="mb-4 bg-light p-3 rounded-3 position-relative">
                  <div className="mb-2">
                    <label className="form-label fw-bold text-secondary small mb-0">🎟️ Mã giảm giá (Voucher)</label>
                  </div>

                  {/* Thêm ref để quản lý click outside */}
                  <div className="position-relative" ref={dropdownRef}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase fw-bold"
                        placeholder="NHẬP HOẶC CHỌN MÃ"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        // Đổi thành click để bật dropdown thay vì onFocus hoặc hover
                        onClick={() => !appliedVoucher && setShowVoucherDropdown(!showVoucherDropdown)}
                        disabled={!!appliedVoucher}
                      />
                      {appliedVoucher ? (
                        <button className="btn btn-danger btn-sm" type="button" onClick={handleRemoveVoucher}>
                          Hủy bỏ
                        </button>
                      ) : (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            onClick={() => setShowVoucherDropdown(!showVoucherDropdown)}
                          >
                            {showVoucherDropdown ? "▲" : "▼"}
                          </button>
                          <button
                            className="btn btn-dark btn-sm fw-semibold"
                            type="button"
                            onClick={handleApplyVoucher}
                            disabled={isValidatingVoucher}
                          >
                            {isValidatingVoucher ? "Đang check..." : "Áp dụng"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DROPDOWN POPUP VOUCHER */}
                    {showVoucherDropdown && !appliedVoucher && availableVouchers.length > 0 && (
                      <div 
                        className="position-absolute start-0 w-100 bg-white shadow-lg border rounded-3 p-2 mt-1 z-3"
                        style={{ maxHeight: "250px", overflowY: "auto", top: "100%" }}
                      >
                        <div className="small fw-bold text-muted mb-2 px-1">💡 Voucher gợi ý cho bạn:</div>
                        
                        {[...availableVouchers]
                          .sort((a, b) => {
                            const aEligible = total >= (a.min_order_value || 0);
                            const bEligible = total >= (b.min_order_value || 0);
                            return bEligible - aEligible;
                          })
                          .map((v) => {
                            const isEligible = total >= (v.min_order_value || 0);
                            return (
                              <div
                                key={v._id || v.code}
                                className={`p-2 mb-1 rounded border d-flex align-items-center justify-content-between ${
                                  isEligible ? "bg-light border-success" : "opacity-50 border-secondary"
                                }`}
                                style={{ cursor: isEligible ? "pointer" : "not-allowed" }}
                                onClick={() => {
                                  if (isEligible) {
                                    handleSelectSuggestedVoucher(v.code);
                                    setShowVoucherDropdown(false); // Đóng dropdown sau khi chọn
                                  }
                                }}
                              >
                                <div>
                                  <div className="fw-bold text-primary small d-flex align-items-center gap-1">
                                    🏷️ {v.code}
                                    {isEligible && <span className="badge bg-success" style={{ fontSize: "0.65rem" }}>Phù hợp</span>}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                    {v.discount_type === "percentage" 
                                      ? `Giảm ${v.discount_value}%` 
                                      : `Giảm ${v.discount_value?.toLocaleString("vi-VN")}đ`}
                                    {v.min_order_value > 0 && ` (Đơn từ ${v.min_order_value.toLocaleString("vi-VN")}đ)`}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={`btn btn-sm ${isEligible ? "btn-outline-primary" : "btn-secondary"}`}
                                  style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                                  disabled={!isEligible}
                                >
                                  {isEligible ? "Dùng ngay" : "Chưa đủ điều kiện"}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {voucherError && <div className="text-danger small fw-medium mt-1">❌ {voucherError}</div>}
                  {voucherSuccess && <div className="text-success small fw-medium mt-1">✅ {voucherSuccess}</div>}
                </div>

                {/* TỔNG TIỀN */}
                <div className="pt-2">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tạm tính:</span>
                    <span className="fw-semibold">{total.toLocaleString("vi-VN")}đ</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Giảm giá (Voucher):</span>
                      <span className="fw-semibold">-{discountAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-0 pt-2 border-top">
                    <span className="fw-bold fs-5">Tổng cộng:</span>
                    <span className="fw-bold fs-5 text-danger">{finalTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* THÔNG TIN KHÁCH HÀNG & ĐỊA CHỈ */}
          <div className="col-lg-7 col-md-12 order-2 order-lg-1">
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body p-4">
                <h4 className="mb-4 text-dark fw-bold">📋 Thông Tin Nhận Hàng</h4>

                {/* Họ tên */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Họ và tên người nhận <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg fs-6"
                    placeholder="Nhập tên người nhận hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                {/* Số điện thoại */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Số điện thoại liên hệ <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-lg fs-6"
                    placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                  />
                  {customerPhone && customerPhone.length !== 10 && (
                    <div className="text-danger small mt-1">
                      ⚠️ Số điện thoại chưa đủ 10 chữ số.
                    </div>
                  )}
                </div>

                {/* Địa chỉ giao hàng */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small">
                    Địa chỉ giao hàng <span className="text-danger">*</span>
                  </label>

                  {/* Danh sách địa chỉ đã lưu */}
                  {savedAddresses.length > 0 && (
                    <div className="d-flex flex-column gap-2 mb-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`p-3 border rounded user-select-none ${
                            selectedAddressId === addr._id ? "border-dark bg-light fw-medium" : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectSavedAddress(addr)}
                        >
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <input
                              type="radio"
                              name="savedAddressOption"
                              checked={selectedAddressId === addr._id}
                              onChange={() => handleSelectSavedAddress(addr)}
                            />
                            <span className="badge bg-secondary">{addr.label || "Địa chỉ"}</span>
                            {addr.isDefault && <span className="badge bg-success">Mặc định</span>}
                          </div>
                          <div className="small text-dark ms-4">
                            <strong>{addr.receiverName || customerName}</strong> ({addr.receiverPhone || customerPhone}) <br />
                            {addr.fullAddress}
                          </div>
                        </div>
                      ))}

                      {/* Option Nhập địa chỉ mới */}
                      <div
                        className={`p-3 border rounded user-select-none ${
                          selectedAddressId === "new" ? "border-dark bg-light fw-medium" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={handleSelectNewAddress}
                      >
                        <input
                          type="radio"
                          name="savedAddressOption"
                          checked={selectedAddressId === "new"}
                          onChange={handleSelectNewAddress}
                        />
                        <span className="ms-2 small fw-bold text-primary">+ Giao đến địa chỉ khác / Địa chỉ mới</span>
                      </div>
                    </div>
                  )}

                  {/* Form chọn Địa chính: Phường/Xã -> Quận/Huyện -> Tỉnh/Thành (Chuẩn trật tự như Profile) */}
                  {(selectedAddressId === "new" || savedAddresses.length === 0) && (
                    <div className="border p-3 rounded bg-light">
                      <div className="row g-2">
                        {/* 1. Phường/Xã */}
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold text-muted mb-1">1. Phường / Xã *</label>
                          <select
                            className="form-select form-select-lg fs-6"
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            disabled={!selectedDistrict}
                          >
                            <option value="">
                              {!selectedDistrict ? "-- Chọn Quận/Huyện trước --" : "-- Chọn Phường/Xã --"}
                            </option>
                            {wards.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.full_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Quận/Huyện */}
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold text-muted mb-1">2. Quận / Huyện *</label>
                          <select
                            className="form-select form-select-lg fs-6"
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            disabled={!selectedProvince}
                          >
                            <option value="">
                              {!selectedProvince ? "-- Chọn Tỉnh/Thành trước --" : "-- Chọn Quận/Huyện --"}
                            </option>
                            {districts.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.full_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Tỉnh/Thành phố */}
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold text-muted mb-1">3. Tỉnh / Thành phố *</label>
                          <select
                            className="form-select form-select-lg fs-6"
                            value={selectedProvince}
                            onChange={handleProvinceChange}
                          >
                            <option value="">-- Chọn Tỉnh/Thành --</option>
                            {provinces.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.full_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Số nhà, tên đường *</label>
                        <input
                          type="text"
                          className="form-control form-control-lg fs-6"
                          placeholder="Ví dụ: Số 123, đường Nguyễn Trãi..."
                          value={detailAddress}
                          onChange={(e) => setDetailAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Phương thức thanh toán */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small">
                    Chọn phương thức thanh toán <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex flex-column gap-2">
                    <div
                      className={`p-3 border rounded user-select-none ${
                        paymentMethod === "cod" ? "border-dark bg-light fw-medium" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <span className="ms-2">Thanh toán khi nhận hàng (COD)</span>
                    </div>

                    <div
                      className={`p-3 border rounded user-select-none ${
                        paymentMethod === "vnpay" ? "border-dark bg-light fw-medium" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setPaymentMethod("vnpay")}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="vnpay"
                        checked={paymentMethod === "vnpay"}
                        onChange={() => setPaymentMethod("vnpay")}
                      />
                      <span className="ms-2">Thanh toán qua VNPay (Thẻ/QR Code)</span>
                    </div>
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small">Ghi chú đơn hàng (Kích cỡ, màu sắc...)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Ví dụ: Giao vào giờ hành chính..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  ></textarea>
                </div>

                {/* Nút Đặt Hàng */}
                <div className="d-grid gap-2 pt-2">
                  <button
                    type="submit"
                    className="btn btn-dark btn-lg py-3 fw-bold shadow-sm rounded-pill"
                    disabled={isOrdering}
                  >
                    {isOrdering
                      ? "Đang xử lý đơn hàng..."
                      : `Xác Nhận Đặt Hàng • ${finalTotal.toLocaleString("vi-VN")}đ`}
                  </button>
                  <Link href="/cart" className="btn btn-link text-muted small text-center">
                    Quay lại giỏ hàng
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </form>
    </main>
  );
}
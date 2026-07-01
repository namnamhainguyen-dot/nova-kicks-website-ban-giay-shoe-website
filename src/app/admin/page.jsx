"use client";

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Đăng ký các thành phần bắt buộc của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminPanel() {
  // --- QUẢN LÝ TAB HỆ THỐNG ---
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- MOCK DATABASE STATE (DỮ LIỆU ĐỂ CHẠY TÍNH NĂNG CHỨC NĂNG) ---
  
  // 1. Danh mục sản phẩm
  const [categories] = useState([
    { id: "cat1", name: "Giày Sneaker" },
    { id: "cat2", name: "Giày Chạy Bộ" },
    { id: "cat3", name: "Giày Tây Nam" }
  ]);

  // 2. Sản phẩm (Sửa lỗi N/A danh mục, hỗ trợ xem biến thể màu/size/kho)
  const [products] = useState([
    {
      id: "p1",
      name: "Nike Air Max 90 Premium",
      category: "Giày Sneaker",
      price: 3200000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
      variants: [
        { color: "Đỏ", size: "40", stock: 3 },
        { color: "Đỏ", size: "41", stock: 2 },
        { color: "Đen", size: "42", stock: 5 },
      ]
    },
    {
      id: "p2",
      name: "Adidas Ultraboost Light",
      category: "Giày Chạy Bộ",
      price: 4500000,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200",
      variants: [
        { color: "Trắng", size: "41", stock: 4 },
        { color: "Xám", size: "43", stock: 4 },
      ]
    },
    {
      id: "p3",
      name: "Giày lười Da cá sấu lỗi xước",
      category: "", // Trống để kiểm tra logic N/A
      price: 1800000,
      image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=200",
      variants: [
        { color: "Nâu", size: "39", stock: 2 },
      ]
    }
  ]);

  // Bộ lọc sản phẩm
  const [prodSearchName, setProdSearchName] = useState("");
  const [prodSelectCat, setProdSelectCat] = useState("");
  const [expandedProdId, setExpandedProdId] = useState(null);

  // 3. Đơn hàng (Chỉ Tiến Không Lùi, Ẩn/Hiện đơn, Gắn Voucher, Bỏ xem chi tiết & xóa)
  const ORDER_STATUS_FLOW = ["Chờ xử lý", "Đang giao", "Đã hoàn thành", "Đã hủy"];
  const [orders, setOrders] = useState([
    { id: "HD9021", customerName: "Nguyễn Văn Huy", voucherCode: "HELLOSUMMER", discountValue: 150000, status: "Chờ xử lý", isHidden: false, totalAmount: 2950000 },
    { id: "HD9022", customerName: "Lê Thị Thu Hà", voucherCode: "", discountValue: 0, status: "Đang giao", isHidden: false, totalAmount: 4500000 }
  ]);

  // 4. Người dùng (Users)
  const [users] = useState([
    { id: "u1", fullname: "Nguyễn Văn Huy", email: "huy.le@student.it.edu", role: "customer", createdAt: "2026-05-12" },
    { id: "u2", fullname: "Admin Tuyển Dụng", email: "admin.shoestation@gmail.com", role: "admin", createdAt: "2026-01-01" }
  ]);

  // 5. Quản lý Voucher (Validate % <= 50, ngày bắt đầu > 1 tuần)
  const [vouchers, setVouchers] = useState([
    { code: "HELLOSUMMER", type: "percentage", value: 10, startDate: "2026-07-15", minOrder: 500000, maxDiscount: 200000 }
  ]);
  const [newVoucher, setNewVoucher] = useState({ code: "", type: "percentage", value: "", startDate: "", minOrder: "", maxDiscount: "" });
  const [voucherError, setVoucherError] = useState("");

  // --- DASHBOARD LIVE POLLING DATA ---
  const [stats, setStats] = useState({ totalRevenue: '0', revenueTrend: '+0%', newMembers: 0, memberTrend: '+0%', totalOrders: 0, pendingOrders: 0 });
  const [chartData, setChartData] = useState({ labels: ['Tuần 01', 'Tuần 02', 'Tuần 03', 'Tuần 04'], datasets: [] });
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemStats, setSystemStats] = useState({ serverLoad: 0, apiUptime: '100%', activeSessions: 0, errorRate: '0%' });
  const [loading, setLoading] = useState(true);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'sans-serif', size: 12 }, boxWidth: 12, usePointStyle: true, pointStyle: 'circle' } },
      tooltip: {
        padding: 12, backgroundColor: '#1e293b', titleFont: { size: 13, weight: 'bold' }, bodyFont: { size: 13 },
        callbacks: { label: (context) => ` ${context.dataset.label}: ${context.raw} tr. VND` }
      }
    },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, max: 400, ticks: { callback: (value) => value + ' tr' }, grid: { color: '#f1f5f9' } } }
  };

  const fetchDashboardData = async () => {
    try {
      const randomWeek4Revenue = 250 + Math.floor(Math.random() * 100);
      const randomServerLoad = 15 + Math.floor(Math.random() * 20);
      const mockData = {
        stats: {
          totalRevenue: (999000000 + Math.floor(Math.random() * 5000000)).toLocaleString('vi-VN'),
          revenueTrend: '+12.4%', newMembers: 450 + Math.floor(Math.random() * 5), memberTrend: '+5.2%',
          totalOrders: 3200 + Math.floor(Math.random() * 3), pendingOrders: orders.filter(o => o.status === "Chờ xử lý").length + 4,
        },
        chartDatasets: [
          { label: 'Doanh thu', data: [250, 380, 370, randomWeek4Revenue], backgroundColor: '#1e293b', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.7 },
          { label: 'Dự báo', data: [220, 350, 330, 260], backgroundColor: '#cbd5e1', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.7 }
        ],
        recentActivities: [
          { id: 1, title: `#${9020 + Math.floor(Math.random() * 10)} hoàn thành`, desc: 'Jordan Retro 4 Fresh - Vừa xong' },
          { id: 2, title: 'Người dùng mới đăng ký', desc: 'marcus.stylenew@gmail.com - 15 phút trước' },
          { id: 3, title: 'Cập nhật hệ thống dữ liệu', desc: 'Đã đồng bộ cơ sở dữ liệu phân hệ Users' },
        ],
        systemStats: { serverLoad: randomServerLoad, apiUptime: '99.9%', activeSessions: 1400 + Math.floor(Math.random() * 50), errorRate: '0.02%' }
      };
      setStats(mockData.stats);
      setChartData({ labels: ['Tuần 01', 'Tuần 02', 'Tuần 03', 'Tuần 04'], datasets: mockData.chartDatasets });
      setRecentActivities(mockData.recentActivities);
      setSystemStats(mockData.systemStats);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => { fetchDashboardData(); }, 5000);
    return () => clearInterval(interval);
  }, [orders]);

  const handleUpdateOrderStatus = (orderId, currentStatus, nextStatus) => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
    const nextIndex = ORDER_STATUS_FLOW.indexOf(nextStatus);
    if (nextIndex <= currentIndex) {
      alert("❌ Lỗi nghiệp vụ: Trạng thái đơn hàng chỉ có thể TIẾN về phía trước quy trình, không được phép QUAY LÙI lại!");
      return;
    }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  const toggleHideOrder = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, isHidden: !o.isHidden } : o));
  };

  const handleCreateVoucher = (e) => {
    e.preventDefault();
    setVoucherError("");
    const { code, type, value, startDate, minOrder, maxDiscount } = newVoucher;
    if (!code || !value || !startDate || !minOrder || !maxDiscount) {
      setVoucherError("Vui lòng nhập đầy đủ toàn bộ các trường thông tin Voucher!");
      return;
    }
    if (type === "percentage" && Number(value) > 50) {
      setVoucherError("Lỗi: Giá trị phần trăm giảm giá (%) không được vượt quá giới hạn 50%!");
      return;
    }
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const selectedDate = new Date(startDate);
    if (selectedDate < oneWeekFromNow) {
      setVoucherError("Lỗi: Ngày bắt đầu kích hoạt Voucher phải cách thời điểm hiện tại ít nhất 1 tuần (7 ngày) để chuẩn bị chiến dịch!");
      return;
    }
    setVouchers([...vouchers, { code: code.toUpperCase().trim(), type, value: Number(value), startDate, minOrder: Number(minOrder), maxDiscount: Number(maxDiscount) }]);
    setNewVoucher({ code: "", type: "percentage", value: "", startDate: "", minOrder: "", maxDiscount: "" });
    alert("🎉 Tạo Voucher thành công và đã áp dụng bộ lọc kiểm tra nghiêm ngặt!");
  };

  // --- HÀM RENDER NỘI DUNG TỪNG TAB DỮ LIỆU ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (loading) return <div className="text-center py-5"><div className="spinner-border text-dark"></div></div>;
        return (
          <>
            {/* 4 Khung số liệu chính */}
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-3">
                    <div className="text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Tổng doanh thu</div>
                    <h5 className="fw-bold mt-1 mb-0 text-dark">{stats.totalRevenue} đ</h5>
                    <div className="text-success small" style={{ fontSize: "0.75rem" }}>{stats.revenueTrend}</div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-3">
                    <div className="text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Thành viên mới</div>
                    <h5 className="fw-bold mt-1 mb-0 text-dark">{stats.newMembers}</h5>
                    <div className="text-success small" style={{ fontSize: "0.75rem" }}>{stats.memberTrend}</div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-3">
                    <div className="text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Tổng đơn hàng</div>
                    <h5 className="fw-bold mt-1 mb-0 text-dark">{stats.totalOrders}</h5>
                    <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Đã đồng bộ</div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0 bg-dark text-white">
                  <div className="card-body p-3">
                    <div className="text-uppercase text-white-50 fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Đơn chờ giao</div>
                    <h5 className="fw-bold mt-1 mb-0 text-warning">{stats.pendingOrders}</h5>
                    <div className="text-warning small" style={{ fontSize: "0.75rem" }}>Cần xử lý gấp</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biểu đồ tổng quan */}
            <div className="row gy-4 mb-4">
              <div className="col-xl-8">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h6 className="mb-3 fw-bold">Tổng quan doanh số tuần</h6>
                    <div style={{ height: '280px', position: 'relative' }}>
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Hoạt động live hệ thống</h6>
                    <ul className="list-unstyled mb-0">
                      {recentActivities.map((act) => (
                        <li key={act.id} className="mb-2 border-bottom pb-2 small">
                          <strong className="text-dark">{act.title}</strong>
                          <div className="text-muted">{act.desc}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'products':
        const filteredProds = products.filter(p => {
          const matchName = p.name.toLowerCase().includes(prodSearchName.toLowerCase());
          const categoryCheck = p.category && p.category.trim() !== "" ? p.category : "N/A";
          const matchCat = prodSelectCat === "" || categoryCheck === prodSelectCat;
          return matchName && matchCat;
        });
        return (
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-3">📦 Quản lý sản phẩm</h5>
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <input type="text" className="form-control form-control-sm" placeholder="Tìm kiếm sản phẩm theo tên..." value={prodSearchName} onChange={(e) => setProdSearchName(e.target.value)} />
              </div>
              <div className="col-md-4">
                <select className="form-select form-select-sm" value={prodSelectCat} onChange={(e) => setProdSelectCat(e.target.value)}>
                  <option value="">Tất cả danh mục</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="N/A">Chưa phân loại (N/A)</option>
                </select>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Tổng tồn kho</th>
                    <th>Biến thể sản phẩm</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProds.map(p => {
                    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                    return (
                      <React.Fragment key={p.id}>
                        <tr>
                          <td><img src={p.image} alt={p.name} className="rounded border" style={{ width: "45px", height: "45px", objectFit: "cover" }} /></td>
                          <td className="fw-semibold text-dark">{p.name}</td>
                          <td>{p.category ? <span className="badge bg-secondary">{p.category}</span> : <span className="badge bg-danger fw-bold">N/A</span>}</td>
                          <td>{p.price.toLocaleString()} đ</td>
                          <td><span className="fw-bold">{totalStock}</span> đôi</td>
                          <td>
                            <button className="btn btn-xs btn-outline-dark btn-sm py-0 px-2" onClick={() => setExpandedProdId(expandedProdId === p.id ? null : p.id)}>
                              {expandedProdId === p.id ? "▲ Ẩn" : "👁️ Xem chi tiết"}
                            </button>
                          </td>
                        </tr>
                        {expandedProdId === p.id && (
                          <tr>
                            <td colSpan="6" className="bg-light p-3">
                              <div className="bg-white border rounded p-3 shadow-sm">
                                <div className="fw-bold text-secondary mb-2">📊 Chi tiết phân rã thuộc tính biến thể kho:</div>
                                <div className="row g-2">
                                  {p.variants.map((v, idx) => (
                                    <div className="col-md-4" key={idx}>
                                      <div className="p-2 border rounded bg-light text-center small">
                                        Màu: <strong className="text-danger">{v.color}</strong> | Size: <strong>{v.size}</strong> <br/>
                                        Còn lại: <span className="badge bg-dark mt-1">{v.stock} sản phẩm</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-3">🗂️ Danh mục sản phẩm</h5>
            <div className="row g-3">
              {categories.map(c => {
                const innerProducts = products.filter(p => p.category === c.name);
                return (
                  <div className="col-md-6" key={c.id}>
                    <div className="border rounded p-3 bg-white shadow-sm">
                      <h6 className="fw-bold text-primary mb-2">📁 Thư mục: {c.name}</h6>
                      <span className="badge bg-dark mb-3">Số lượng: {innerProducts.length} sản phẩm trực thuộc</span>
                      <ul className="list-group list-group-flush small">
                        {innerProducts.length > 0 ? (
                          innerProducts.map(p => (
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0" key={p.id}>
                              <span>{p.name}</span>
                              <span className="text-muted">{p.price.toLocaleString()} đ</span>
                            </li>
                          ))
                        ) : (
                          <li className="list-group-item text-muted px-0 italic">Không có sản phẩm nào thuộc danh mục này.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-3">📜 Điều hành đơn hàng (Chỉ Tiến Không Lùi)</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách hàng</th>
                    <th>Voucher</th>
                    <th>Giảm giá</th>
                    <th>Tổng thu thanh toán</th>
                    <th>Trạng thái (Chỉ Tiến)</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ display: o.isHidden ? 'none' : 'table-row' }}>
                      <td className="fw-bold">#{o.id}</td>
                      <td>{o.customerName}</td>
                      <td>{o.voucherCode ? <span className="badge bg-success">{o.voucherCode}</span> : <span className="text-muted">-</span>}</td>
                      <td className="text-danger">-{o.discountValue.toLocaleString()} đ</td>
                      <td className="fw-bold text-primary">{(o.totalAmount - o.discountValue).toLocaleString()} đ</td>
                      <td>
                        <select className="form-select form-select-sm w-auto" value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, o.status, e.target.value)}>
                          {ORDER_STATUS_FLOW.map((st, i) => {
                            const currentIdx = ORDER_STATUS_FLOW.indexOf(o.status);
                            return <option key={st} value={st} disabled={i < currentIdx}>{st}</option>;
                          })}
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-xs btn-outline-secondary btn-sm" onClick={() => toggleHideOrder(o.id)}>❌ Ẩn đơn</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-top">
              <h6 className="fw-bold text-secondary">🗄️ Thùng rác (Đơn hàng đã ẩn):</h6>
              <div className="d-flex gap-2 flex-wrap mt-2">
                {orders.filter(o => o.isHidden).map(o => (
                  <span className="badge bg-light text-dark border p-2" key={o.id}>
                    Đơn #{o.id} ({o.customerName}) - 
                    <button className="btn btn-link btn-sm p-0 ms-2 text-primary text-decoration-none small" onClick={() => toggleHideOrder(o.id)}>Khôi phục 👁️</button>
                  </span>
                ))}
                {orders.filter(o => o.isHidden).length === 0 && <span className="text-muted small italic">Không có đơn hàng nào bị ẩn.</span>}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-3">👥 Quản lý người dùng (Users)</h5>
            <table className="table table-bordered align-middle small">
              <thead className="table-light">
                <tr>
                  <th>Mã ID</th>
                  <th>Họ và Tên</th>
                  <th>Email liên hệ</th>
                  <th>Quyền (Role)</th>
                  <th>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="font-monospace">{u.id}</td>
                    <td className="fw-semibold">{u.fullname}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>{u.role}</span></td>
                    <td>{u.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'vouchers':
        return (
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-3">🎟️ Cấu hình & Validate kiểm bẫy lỗi Voucher</h5>
            <form onSubmit={handleCreateVoucher} className="bg-light p-3 rounded border mb-4">
              <h6 className="fw-bold text-dark mb-3">➕ Tạo mã khuyến mãi mới</h6>
              {voucherError && <div className="alert alert-danger py-2 small fw-bold">{voucherError}</div>}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Mã giảm giá (Code)</label>
                  <input type="text" className="form-control form-control-sm" placeholder="SUMMER50" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Loại giảm giá</label>
                  <select className="form-select form-select-sm" value={newVoucher.type} onChange={e => setNewVoucher({...newVoucher, type: e.target.value})}>
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Giá trị giảm</label>
                  <input type="number" className="form-control form-control-sm" placeholder="Nhập số..." value={newVoucher.value} onChange={e => setNewVoucher({...newVoucher, value: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Ngày bắt đầu chiến dịch</label>
                  <input type="date" className="form-control form-control-sm" value={newVoucher.startDate} onChange={e => setNewVoucher({...newVoucher, startDate: e.target.value})} />
                  {/* 🌟 ĐÃ SỬA LỖI DẤU TOKEN > THÀNH &gt; TẠI ĐÂY */}
                  <span className="text-muted d-block mt-1" style={{ fontSize: "0.68rem" }}>⚠️ Yêu cầu lớn hơn ngày hiện tại &gt; 1 tuần</span>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Đơn tối thiểu</label>
                  <input type="number" className="form-control form-control-sm" placeholder="200000" value={newVoucher.minOrder} onChange={e => setNewVoucher({...newVoucher, minOrder: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Mức giảm tối đa</label>
                  <input type="number" className="form-control form-control-sm" placeholder="100000" value={newVoucher.maxDiscount} onChange={e => setNewVoucher({...newVoucher, maxDiscount: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-dark btn-sm mt-3 px-4">Xác nhận Lưu Voucher 🚀</button>
            </form>

            <h6 className="fw-bold">🎟️ Danh sách Voucher đang kích hoạt</h6>
            <table className="table table-striped align-middle small">
              <thead className="table-dark">
                <tr>
                  <th>Mã Code</th>
                  <th>Loại hình</th>
                  <th>Mức giảm</th>
                  <th>Ngày bắt đầu</th>
                  <th>Đơn tối thiểu</th>
                  <th>Giảm tối đa</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v, i) => (
                  <tr key={i}>
                    <td className="fw-bold text-success">{v.code}</td>
                    <td>{v.type === 'percentage' ? "Phần trăm (%)" : "Tiền mặt (đ)"}</td>
                    <td>{v.value} {v.type === 'percentage' ? "%" : "đ"}</td>
                    <td>{v.startDate}</td>
                    <td>{v.minOrder.toLocaleString()} đ</td>
                    <td>{v.maxDiscount.toLocaleString()} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div>Trang không tồn tại.</div>;
    }
  };

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      
      {/* --- TOP NAVBAR CHỨA BỘ CHUYỂN TAB ĐỂ PHỐI HỢP VỚI SIDEBAR CÓ SẴN --- */}
      <div className="bg-white border-bottom sticky-top px-4 py-2.5 d-flex justify-content-between align-items-center">
        <div className="fw-semibold text-secondary small text-uppercase">
          Hệ thống quản trị / Phân hệ: {activeTab}
        </div>
        
        {/* Do Sidebar gốc nằm ở layout.jsx không quản lý được State của trang này, 
            nên tui cung cấp thêm một Menu Thả nhanh ngay đây để ông chuyển đổi qua lại test tính năng */}
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm fw-bold text-dark border-secondary"
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="dashboard">📊 Bảng điều khiển</option>
            <option value="products">📦 Quản lý sản phẩm</option>
            <option value="categories">🗂️ Quản lý danh mục</option>
            <option value="orders">📜 Quản lý đơn hàng</option>
            <option value="users">👥 Quản lý người dùng</option>
            <option value="vouchers">🎟️ Quản lý Voucher</option>
          </select>

          {activeTab === 'dashboard' && (
            <button className="btn btn-dark btn-sm px-3 text-xs" onClick={fetchDashboardData}>
              Làm mới số liệu
            </button>
          )}
        </div>
      </div>

      {/* --- VÙNG CHỨA NỘI DUNG ĐỘNG CHÍNH --- */}
      <div className="p-4">
        {renderContent()}
      </div>

    </div>
  );
}
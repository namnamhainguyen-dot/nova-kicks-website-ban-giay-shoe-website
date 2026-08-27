"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Đăng ký các thành phần bắt buộc của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  // --- DASHBOARD LIVE DATA STATE ---
  const [stats, setStats] = useState({ 
    totalRevenue: '0', 
    revenueTrend: '+0%', 
    newMembers: 0, 
    memberTrend: '+0%', 
    totalOrders: 0, 
    pendingOrders: 0 
  });
  const [chartData, setChartData] = useState({ 
    labels: ['Tuần 01', 'Tuần 02', 'Tuần 03', 'Tuần 04'], 
    datasets: [] 
  });
  
  // Các state biểu đồ nâng cao mới thêm
  const [statusChartData, setStatusChartData] = useState({ labels: [], datasets: [] });
  const [topProductsChartData, setTopProductsChartData] = useState({ labels: [], datasets: [] });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE BỘ LỌC NGÀY (DATE RANGE FILTER) ---
  // Mặc định lấy từ đầu tháng hiện tại đến ngày hôm nay
  const getTodayFormatted = () => new Date().toISOString().split('T')[0];
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayFormatted());
  
  // Ref kiểm tra xem có phải lần đầu tiên tải trang hay không
  const isFirstLoad = useRef(true);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
        labels: { font: { family: 'sans-serif', size: 12 }, boxWidth: 12, usePointStyle: true, pointStyle: 'circle' } 
      },
      tooltip: {
        padding: 12, 
        backgroundColor: '#1e293b', 
        titleFont: { size: 13, weight: 'bold' }, 
        bodyFont: { size: 13 },
        callbacks: { 
          label: (context) => ` ${context.dataset.label}: ${context.raw} tr. VND` 
        }
      }
    },
    scales: { 
      x: { grid: { display: false } }, 
      y: { 
        beginAtZero: true, 
        ticks: { callback: (value) => value + ' tr' }, 
        grid: { color: '#f1f5f9' } 
      } 
    }
  };

  // Hàm lấy dữ liệu THỰC TẾ từ API hệ thống (có kèm bộ lọc ngày)
  const fetchDashboardData = async () => {
    try {
      // Chỉ hiện spinner loading toàn màn hình ở lần tải đầu tiên
      if (isFirstLoad.current) {
        setLoading(true);
      }

      // Đính kèm query params startDate và endDate vào API
      const queryParams = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
      });

      const response = await fetch(`/api/admin/dashboard?${queryParams.toString()}`, {
        cache: 'no-store' // Bỏ qua bộ nhớ đệm để nhận dữ liệu thời gian thực
      });
      
      if (!response.ok) throw new Error("Không thể tải dữ liệu dashboard");
      
      const data = await response.json();

      const rawRevenue = data?.stats?.totalRevenue || 0;

      // Cập nhật dữ liệu vào State hiển thị
      setStats({
        totalRevenue: rawRevenue.toLocaleString('vi-VN'),
        revenueTrend: data?.stats?.revenueTrend || '+0%', 
        newMembers: data?.stats?.newMembers || 0,
        memberTrend: data?.stats?.memberTrend || '+0%',
        totalOrders: data?.stats?.totalOrders || 0,
        pendingOrders: data?.stats?.pendingOrders || 0,
      });

      // Cập nhật dữ liệu cho biểu đồ cột doanh thu
      setChartData({
        labels: data?.chartDatasets?.labels || ['Tuần 01', 'Tuần 02', 'Tuần 03', 'Tuần 04'],
        datasets: [
          {
            label: 'Doanh thu',
            data: data?.chartDatasets?.revenue || [0, 0, 0, 0],
            backgroundColor: '#1e293b',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: 'Dự báo',
            data: data?.chartDatasets?.forecast || [0, 0, 0, 0],
            backgroundColor: '#cbd5e1',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      });
      
      // Biểu đồ tròn: Trạng thái đơn hàng
      const orderStatus = data?.advancedCharts?.orderStatus;
      setStatusChartData({
        labels: ['Chờ xử lý (Pending)', 'Thành công (Completed)', 'Đã hủy (Cancelled)'],
        datasets: [{
          data: [
            orderStatus?.pending || 0, 
            orderStatus?.completed || 0, 
            orderStatus?.cancelled || 0
          ],
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
          borderWidth: 1
        }]
      });

      // Biểu đồ thanh ngang: Top 5 sản phẩm bán chạy
      const topProducts = data?.advancedCharts?.topProducts;
      setTopProductsChartData({
        labels: topProducts?.labels || [],
        datasets: [{
          label: 'Số lượng bán ra',
          data: topProducts?.values || [],
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.6
        }]
      });

      setRecentActivities(data?.recentActivities || []);
      
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu Live:", error);
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  };

  // Tự động tải lại dữ liệu khi thay đổi khoảng ngày bộ lọc hoặc chạy interval
  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000); // Tăng thời gian polling lên 15s khi dùng filter ngày để tránh gián đoạn trải nghiệm chọn ngày của user

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      
      {/* --- TOP NAVBAR CHỨA TIÊU ĐỀ VÀ TRẠNG THÁI REALTIME --- */}
      <div className="bg-white border-bottom sticky-top px-4 py-2.5 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="fw-semibold text-secondary small text-uppercase">
          Hệ thống quản trị / Bảng điều khiển tổng quan
        </div>

        {/* --- KHU VỰC BỘ LỌC NGÀY VÀ NÚT TÁC VỤ --- */}
        <div className="d-flex align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center bg-light border rounded px-2 py-1 gap-1">
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Từ:</span>
            <input 
              type="date" 
              className="form-control form-control-sm border-0 bg-transparent p-0 text-dark shadow-none" 
              style={{ fontSize: '0.8rem', width: '110px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>Đến:</span>
            <input 
              type="date" 
              className="form-control form-control-sm border-0 bg-transparent p-0 text-dark shadow-none" 
              style={{ fontSize: '0.8rem', width: '110px' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1.5 small d-flex align-items-center gap-1">
            <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: '0.5rem', height: '0.5rem' }}></span>
            Trực tiếp
          </span>

          <button className="btn btn-dark btn-sm px-3 text-xs" onClick={fetchDashboardData}>
            Làm mới 🔄
          </button>
        </div>
      </div>

      {/* --- VÙNG CHỨA NỘI DUNG CHÍNH --- */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
            <div className="text-muted small mt-2">Đang đồng bộ dữ liệu theo khoảng thời gian...</div>
          </div>
        ) : (
          <>
            {/* 4 Khung số liệu thống kê chính */}
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-3">
                    <div className="text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Tổng doanh thu</div>
                    <h5 className="fw-bold mt-1 mb-0 text-dark">{stats.totalRevenue} đ</h5>
                    <div className="text-success small" style={{ fontSize: "0.75rem" }}>{stats.revenueTrend} so với kỳ trước</div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-3">
                    <div className="text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Thành viên mới</div>
                    <h5 className="fw-bold mt-1 mb-0 text-dark">{stats.newMembers}</h5>
                    <div className="text-success small" style={{ fontSize: "0.75rem" }}>{stats.memberTrend} so với kỳ trước</div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-3">
                    <div className="text-uppercase text-secondary fw-semibold" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Tổng đơn hàng</div>
                    <h5 className="fw-bold mt-1 mb-0 text-dark">{stats.totalOrders}</h5>
                    <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Trong khoảng lọc</div>
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

            {/* Vùng biểu đồ doanh số & Hoạt động live */}
            <div className="row gy-4 mb-4">
              <div className="col-xl-8">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h6 className="mb-3 fw-bold">Tổng quan doanh số theo thời gian</h6>
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
                    <ul className="list-unstyled mb-0" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {recentActivities.length > 0 ? (
                        recentActivities.map((act) => (
                          <li key={act.id} className="mb-2 border-bottom pb-2 small">
                            <strong className="text-dark">{act.title}</strong>
                            <div className="text-muted">{act.desc}</div>
                          </li>
                        ))
                      ) : (
                        <li className="text-center py-4 text-muted small">
                          Không có hoạt động nào trong khoảng thời gian này.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Hàng biểu đồ phân tích chuyên sâu */}
            <div className="row g-4 mb-4">
              {/* Biểu đồ tròn: Tỷ lệ trạng thái đơn hàng */}
              <div className="col-xl-5">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body d-flex flex-column align-items-center">
                    <h6 className="fw-bold mb-3 w-100 text-start">Tỷ lệ trạng thái đơn hàng</h6>
                    <div style={{ height: '250px', width: '100%', position: 'relative' }} className="d-flex justify-content-center">
                      <Doughnut 
                        data={statusChartData} 
                        options={{ 
                          responsive: true, 
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } } }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Biểu đồ cột ngang: Top 5 sản phẩm bán chạy nhất */}
              <div className="col-xl-7">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Top 5 sản phẩm bán chạy nhất</h6>
                    <div style={{ height: '250px', position: 'relative' }}>
                      <Bar 
                        data={topProductsChartData} 
                        options={{ 
                          indexAxis: 'y',
                          responsive: true, 
                          maintainAspectRatio: false,
                          plugins: { 
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: (context) => ` Số lượng: ${context.raw} sản phẩm`
                              }
                            }
                          },
                          scales: { 
                            x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } }, 
                            y: { grid: { display: false } } 
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
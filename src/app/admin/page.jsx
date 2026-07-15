"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // Hàm lấy dữ liệu THỰC TẾ từ API hệ thống
  const fetchDashboardData = async () => {
    try {
      // Chỉ hiện spinner loading toàn màn hình ở lần tải đầu tiên
      if (isFirstLoad.current) {
        setLoading(true);
      }

      // 1. Gọi API lấy số liệu tổng hợp trực tiếp
      const response = await fetch('/api/admin/dashboard', {
        cache: 'no-store' // Bỏ qua bộ nhớ đệm (cache) để nhận dữ liệu thực tế thời gian thực
      });
      
      if (!response.ok) throw new Error("Không thể tải dữ liệu dashboard");
      
      const data = await response.json();

      // Phòng hờ API trả về rỗng hoặc sai cấu trúc bằng toán tử optional chaining (?.) và giá trị mặc định (||)
      const rawRevenue = data?.stats?.totalRevenue || 0;

      // 2. Cập nhật dữ liệu thực tế vào State hiển thị
      setStats({
        totalRevenue: rawRevenue.toLocaleString('vi-VN'), // Định dạng số tiền có dấu chấm phân cách
        revenueTrend: data?.stats?.revenueTrend || '+0%', 
        newMembers: data?.stats?.newMembers || 0,
        memberTrend: data?.stats?.memberTrend || '+0%',
        totalOrders: data?.stats?.totalOrders || 0,
        pendingOrders: data?.stats?.pendingOrders || 0,
      });

      // 3. Cập nhật dữ liệu cho biểu đồ cột doanh thu
      setChartData({
        labels: ['Tuần 01', 'Tuần 02', 'Tuần 03', 'Tuần 04'],
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

      // 4. Cập nhật danh sách hoạt động vừa diễn ra trên web
      setRecentActivities(data?.recentActivities || []);
      
    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu Live:", error);
    } finally {
      setLoading(false);
      isFirstLoad.current = false; // Đánh dấu đã hoàn thành lượt tải đầu tiên
    }
  };

  // Tự động đồng bộ và lấy dữ liệu mới sau mỗi 5 giây (Live Polling)
  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    // Thu dọn tiến trình ngầm khi thoát khỏi trang Admin
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      
      {/* --- TOP NAVBAR CHỨA TIÊU ĐỀ VÀ TRẠNG THÁI REALTIME --- */}
      <div className="bg-white border-bottom sticky-top px-4 py-2.5 d-flex justify-content-between align-items-center">
        <div className="fw-semibold text-secondary small text-uppercase">
          Hệ thống quản trị / Bảng điều khiển tổng quan
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* Huy hiệu nhỏ hiển thị tín hiệu kết nối Realtime cập nhật sau mỗi 5s */}
          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1.5 small d-flex align-items-center gap-1">
            <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: '0.5rem', height: '0.5rem' }}></span>
            Trực tiếp (5s)
          </span>
          <button className="btn btn-dark btn-sm px-3 text-xs" onClick={fetchDashboardData}>
            Làm mới ngay 🔄
          </button>
        </div>
      </div>

      {/* --- VÙNG CHỨA NỘI DUNG CHÍNH --- */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
            <div className="text-muted small mt-2">Đang kết nối hệ thống dữ liệu...</div>
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

            {/* Vùng biểu đồ doanh số & Hoạt động live */}
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
                          Chưa ghi nhận hoạt động tương tác nào mới.
                        </li>
                      )}
                    </ul>
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
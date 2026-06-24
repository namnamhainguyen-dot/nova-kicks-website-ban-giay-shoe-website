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
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  // 1. Khởi tạo trạng thái cho các thẻ chỉ số
  const [stats, setStats] = useState({
    totalRevenue: '0',
    revenueTrend: '+0%',
    newMembers: 0,
    memberTrend: '+0%',
    totalOrders: 0,
    pendingOrders: 0,
  });

  // 2. Khởi tạo trạng thái cho dữ liệu biểu đồ Chart.js
  const [chartData, setChartData] = useState({
    labels: ['Tuần 01', 'Tuần 02', 'Tuần 03', 'Tuần 04'],
    datasets: [],
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [systemStats, setSystemStats] = useState({
    serverLoad: 0,
    apiUptime: '100%',
    activeSessions: 0,
    errorRate: '0%',
  });

  const [loading, setLoading] = useState(true);

  // Cấu hình hiển thị (Options) cho Chart.js để giao diện tối giản, hiện đại
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'sans-serif', size: 12 },
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        padding: 12,
        backgroundColor: '#1e293b',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ${context.raw} tr. VND`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        max: 400,
        ticks: {
          callback: function(value) { return value + ' tr'; }
        },
        grid: {
          color: '#f1f5f9'
        }
      }
    }
  };

  // 3. Hàm fetch dữ liệu từ Backend API hoặc sinh ngẫu nhiên (Live Polling)
  const fetchDashboardData = async () => {
    try {
      // GIẢ LẬP: Thay đổi số liệu ngẫu nhiên để thấy biểu đồ nhảy tự động sau mỗi 5s
      const randomWeek4Revenue = 250 + Math.floor(Math.random() * 100);
      const randomServerLoad = 15 + Math.floor(Math.random() * 20);

      const mockData = {
        stats: {
          totalRevenue: (999000000 + Math.floor(Math.random() * 5000000)).toLocaleString('vi-VN'),
          revenueTrend: '+12.4%',
          newMembers: 450 + Math.floor(Math.random() * 5),
          memberTrend: '+5.2%',
          totalOrders: 3200 + Math.floor(Math.random() * 3),
          pendingOrders: Math.floor(Math.random() * 10),
        },
        // Cấu hình cấu trúc datasets mới cho Chart.js
        chartDatasets: [
          {
            label: 'Doanh thu',
            data: [250, 380, 370, randomWeek4Revenue], // Tuần 4 nhảy động
            backgroundColor: '#1e293b', // Màu đen xám thanh lịch giống thiết kế mẫu
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          },
          {
            label: 'Dự báo',
            data: [220, 350, 330, 260],
            backgroundColor: '#cbd5e1', // Màu xám nhạt làm nền dự báo
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          }
        ],
        recentActivities: [
          { id: 1, title: `#${9020 + Math.floor(Math.random() * 10)} hoàn thành`, desc: 'Jordan Retro 4 Fresh - Vừa xong' },
          { id: 2, title: 'Người dùng mới đăng ký', desc: 'marcus.stylenew@gmail.com - 15 phút trước' },
          { id: 3, title: 'Cảnh báo tồn kho: sắp hết hàng', desc: 'Nike Dunk Low Panda - size 10' },
          { id: 4, title: 'Cập nhật giá thành công', desc: 'Adidas Yeezy Boost 350 V2 - 1 tiếng trước' },
        ],
        bestSellers: [
          { name: 'Nike Air Max 90', sales: 121, trend: '+12%', revenue: '372.000.000 VND' },
          { name: 'Adidas Forum Hi', sales: 98, trend: '+4%', revenue: '362.600.000 VND' },
        ],
        systemStats: {
          serverLoad: randomServerLoad,
          apiUptime: '99.9%',
          activeSessions: 1400 + Math.floor(Math.random() * 50),
          errorRate: '0.02%',
        }
      };

      // Cập nhật State
      setStats(mockData.stats);
      setChartData({
        labels: ['Tuần 01', 'Tuần 02', 'Tuần 03', 'Tuần 04'],
        datasets: mockData.chartDatasets
      });
      setRecentActivities(mockData.recentActivities);
      setBestSellers(mockData.bestSellers);
      setSystemStats(mockData.systemStats);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải dữ liệu dashboard:", error);
    }
  };

  // 4. Thiết lập Polling lặp lại sau mỗi 5 giây
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content admin-dashboard-page p-4 bg-light">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-2">Dashboard</h1>
          <p className="text-muted mb-0">Bảng điều khiển tổng quan kết nối Chart.js (Tự động cập nhật 5 giây/lần).</p>
        </div>
        <button className="btn btn-dark btn-lg px-4" onClick={fetchDashboardData}>
          Làm mới ngay
        </button>
      </div>

      {/* 4 Thẻ chỉ số chính */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 card-value">
            <div className="card-body">
              <small className="text-uppercase text-secondary">Tổng doanh thu</small>
              <h2 className="fw-bold mt-3 text-dark">{stats.totalRevenue} đ</h2>
              <div className="text-success small mt-2">{stats.revenueTrend}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 card-value">
            <div className="card-body">
              <small className="text-uppercase text-secondary">Thành viên mới</small>
              <h2 className="fw-bold mt-3 text-dark">{stats.newMembers}</h2>
              <div className="text-success small mt-2">{stats.memberTrend}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 card-value">
            <div className="card-body">
              <small className="text-uppercase text-secondary">Tổng đơn hàng</small>
              <h2 className="fw-bold mt-3 text-dark">{stats.totalOrders}</h2>
              <div className="text-muted small mt-2">Đã đồng bộ</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 bg-dark text-white">
            <div className="card-body">
              <small className="text-uppercase text-white-50">Đơn hàng chờ giao</small>
              <h2 className="fw-bold mt-3 text-warning">{stats.pendingOrders < 10 ? `0${stats.pendingOrders}` : stats.pendingOrders}</h2>
              <div className="text-warning small mt-2">Cần xử lý ngay</div>
            </div>
          </div>
        </div>
      </div>

      {/* BIỂU ĐỒ CHART.JS & HOẠT ĐỘNG GẦN ĐÂY */}
      <div className="row gy-4 mb-4">
        <div className="col-xl-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-semibold">Tổng quan doanh số</h5>
                <div className="text-muted small">Doanh thu / Dự báo</div>
              </div>
              
              {/* Vùng chứa Chart.js - bắt buộc định nghĩa chiều cao */}
              <div style={{ height: '320px', position: 'relative' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>

            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-semibold">Hoạt động gần đây</h5>
                <span className="badge bg-danger animate-pulse">Live</span>
              </div>
              <ul className="list-unstyled activity-list mb-0">
                {recentActivities.map((act) => (
                  <li key={act.id} className="mb-3 border-bottom pb-2">
                    <strong className="text-dark">{act.title}</strong>
                    <div className="text-muted small">{act.desc}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* BÁN CHẠY & CHỈ SỐ HỆ THỐNG */}
      <div className="row gy-4">
        <div className="col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Bán chạy nhất</h5>
              <div className="best-sellers">
                {bestSellers.map((item, index) => (
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom" key={index}>
                    <div>
                      <div className="fw-semibold text-dark">{item.name}</div>
                      <div className="text-muted small">{item.sales} sales · {item.trend}</div>
                    </div>
                    <div className="fw-bold text-slate-700">{item.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Chỉ số hệ thống</h5>
              <div className="system-stats">
                <div className="stat-row mb-3">
                  <div className="d-flex justify-content-between text-sm mb-1">
                    <span className="stat-label">Tải máy chủ</span>
                    <span className="stat-value font-monospace">{systemStats.serverLoad}%</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-dark" style={{ width: `${systemStats.serverLoad}%`, transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <div className="stat-row mb-3">
                  <div className="d-flex justify-content-between text-sm mb-1">
                    <span className="stat-label">Tỷ lệ hoạt động API</span>
                    <span className="stat-value text-success">{systemStats.apiUptime}</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-success" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="d-flex justify-content-between small text-muted pt-2 border-top">
                  <span>Phiên hoạt động: <strong>{systemStats.activeSessions.toLocaleString()}</strong></span>
                  <span>Tỷ lệ lỗi: <strong className="text-danger">{systemStats.errorRate}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime, storageKey = "flash_sale_end_time", onExpire }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const getTargetTime = () => {
      // 1. Ưu tiên tuyệt đối mốc thời gian cụ thể được truyền từ props (Thường lấy từ Server/API sản phẩm)
      // Cách này giúp TẤT CẢ mọi người dùng đều nhìn thấy chung một thời gian kết thúc.
      if (endTime) {
        return new Date(endTime).getTime();
      }

      // 2. Nếu không truyền endTime từ ngoài vào, ta dùng chung một mốc tính toán đồng bộ 
      // (Ví dụ: Cố định kết thúc vào 00:00:00 ngày Chủ Nhật tới hoặc một mốc giờ thống nhất)
      // Ở đây dùng mốc thời gian cố định hoặc lấy từ localStorage nếu bạn muốn lưu khoá chung
      const savedTargetTime = localStorage.getItem(storageKey);
      if (savedTargetTime) {
        const parsedTime = Number(savedTargetTime);
        if (parsedTime > Date.now()) {
          return parsedTime;
        }
      }

      // Mặc định tạo mốc 7 ngày mới nếu chưa có
      const target = new Date();
      target.setDate(target.getDate() + 7);
      const newTargetTime = target.getTime();
      
      localStorage.setItem(storageKey, newTargetTime.toString());
      return newTargetTime;
    };

    const targetTime = getTargetTime();
    setTimeLeft(Math.max(0, targetTime - Date.now()));

    const timer = setInterval(() => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, storageKey, onExpire]);

  if (!mounted) {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">00</div>
        <span className="fw-bold text-white">:</span>
        <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">00</div>
        <span className="fw-bold text-white">:</span>
        <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">00</div>
        <span className="fw-bold text-white">:</span>
        <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">00</div>
      </div>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formatNum = (num) => String(Math.max(0, num)).padStart(2, "0");

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm" title="Ngày">
        {formatNum(days)}
      </div>
      <span className="fw-bold text-white">:</span>
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm" title="Giờ">
        {formatNum(hours)}
      </div>
      <span className="fw-bold text-white">:</span>
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm" title="Phút">
        {formatNum(minutes)}
      </div>
      <span className="fw-bold text-white">:</span>
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm" title="Giây">
        {formatNum(seconds)}
      </div>
    </div>
  );
}
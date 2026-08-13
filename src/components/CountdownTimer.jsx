"use client";
import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime, storageKey = "flash_sale_end_time" }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const getTargetTime = () => {
      let baseTime = endTime 
        ? new Date(endTime).getTime() 
        : Date.now() + (2 * 60 * 1000); // Mốc test 2 phút

      const now = Date.now();
      const cycleDuration = 2 * 60 * 1000; // Chu kỳ (Đổi thành 7 * 24 * 60 * 60 * 1000 khi chạy thật)

      while (baseTime <= now) {
        baseTime += cycleDuration;
      }

      return baseTime;
    };

    let currentTargetTime = getTargetTime();
    setTimeLeft(Math.max(0, currentTargetTime - Date.now()));

    const timer = setInterval(() => {
      let remaining = currentTargetTime - Date.now();
      
      if (remaining <= 0) {
        // Khi hết giờ, tự động tải lại trang ở phía Client để lấy sản phẩm Flash Sale mới từ DB
        window.location.reload();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, storageKey]);

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
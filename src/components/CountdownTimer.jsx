"use client";
import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime, storageKey = "flash_sale_end_time", onExpire }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const getTargetTime = () => {
      let baseTime = endTime 
        ? new Date(endTime).getTime() 
        : Date.now() + (2 * 60 * 1000); // Thay bằng 2 phút để test

      const now = Date.now();
      const cycleDuration = 2 * 60 * 1000; // Chu kỳ (2 phút hoặc 7 * 24 * 60 * 60 * 1000 khi chạy thật)

      while (baseTime <= now) {
        baseTime += cycleDuration;
      }

      return baseTime;
    };

    // Khởi tạo mốc thời gian mục tiêu ban đầu
    let currentTargetTime = getTargetTime();
    setTimeLeft(Math.max(0, currentTargetTime - Date.now()));

    const timer = setInterval(() => {
      let remaining = currentTargetTime - Date.now();
      
      // Nếu hết giờ, tự động tính lại mốc targetTime mới (vòng lặp tiếp theo)
      if (remaining <= 0) {
        currentTargetTime = getTargetTime();
        remaining = currentTargetTime - Date.now();
        if (onExpire) onExpire();
      }
      
      setTimeLeft(remaining);
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
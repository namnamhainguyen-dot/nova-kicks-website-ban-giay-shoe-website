"use client";
import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Xác định thời gian kết thúc: Lấy từ prop endTime hoặc mặc định là cuối ngày hôm nay
    const getTargetTime = () => {
      if (endTime) {
        return new Date(endTime).getTime();
      }
      const target = new Date();
      target.setHours(23, 59, 59, 999);
      return target.getTime();
    };

    const targetTime = getTargetTime();
    setTimeLeft(Math.max(0, targetTime - Date.now()));

    const timer = setInterval(() => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // Tránh lệch SSR/Client trong lần render đầu tiên
  if (!mounted) {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">00</div>
        <span className="fw-bold text-white">:</span>
        <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">00</div>
        <span className="fw-bold text-white">:</span>
        <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">00</div>
      </div>
    );
  }

  // Tính tổng số giờ, phút, giây còn lại
  const totalHours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formatNum = (num) => String(Math.max(0, num)).padStart(2, "0");

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">
        {formatNum(totalHours)}
      </div>
      <span className="fw-bold text-white">:</span>
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">
        {formatNum(minutes)}
      </div>
      <span className="fw-bold text-white">:</span>
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm">
        {formatNum(seconds)}
      </div>
    </div>
  );
}
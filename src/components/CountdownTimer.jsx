"use client";
import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime, storageKey = "flash_sale_end_time" }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const getTargetTime = () => {
      // 1. Nếu có truyền prop endTime trực tiếp thì ưu tiên dùng
      if (endTime) {
        return new Date(endTime).getTime();
      }

      // 2. Nếu không, kiểm tra trong localStorage xem đã lưu mốc thời gian trước đó chưa
      const savedTargetTime = localStorage.getItem(storageKey);
      if (savedTargetTime) {
        const parsedTime = Number(savedTargetTime);
        // Kiểm tra nếu thời gian đã lưu vẫn còn trong tương lai thì dùng tiếp
        if (parsedTime > Date.now()) {
          return parsedTime;
        }
      }

      // 3. Nếu chưa có hoặc đã hết hạn, tạo mới 7 ngày kể từ bây giờ
      const target = new Date();
      target.setDate(target.getDate() + 7);
      const newTargetTime = target.getTime();
      
      // Lưu lại vào localStorage
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
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, storageKey]);

  // Tránh lệch SSR/Client trong lần render đầu tiên
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

  // Tính toán số ngày, giờ, phút, giây còn lại
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formatNum = (num) => String(Math.max(0, num)).padStart(2, "0");

  return (
    <div className="d-flex align-items-center gap-2">
      {/* Ô Ngày */}
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm" title="Ngày">
        {formatNum(days)}
      </div>
      <span className="fw-bold text-white">:</span>
      {/* Ô Giờ */}
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm" title="Giờ">
        {formatNum(hours)}
      </div>
      <span className="fw-bold text-white">:</span>
      {/* Ô Phút */}
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm" title="Phút">
        {formatNum(minutes)}
      </div>
      <span className="fw-bold text-white">:</span>
      {/* Ô Giây */}
      <div className="bg-white text-dark px-2 py-1 rounded fw-black fs-6 shadow-sm" title="Giây">
        {formatNum(seconds)}
      </div>
    </div>
  );
}
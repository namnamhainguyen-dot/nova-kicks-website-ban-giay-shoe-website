"use client";
import { useState, useEffect } from "react";

export default function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const now = new Date();
      
      // Tính thời điểm bắt đầu của tuần hiện tại (ví dụ: Thứ Hai đầu tuần lúc 00:00:00)
      // Hoặc tính mốc kết thúc tuần (Chủ Nhật lúc 23:59:59) để reset đúng hạn
      const currentDay = now.getDay(); // 0 là Chủ Nhật, 1 là Thứ Hai,...
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + distanceToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      // Chu kỳ 1 tuần tính bằng mili-giây
      const weekDuration = 7 * 24 * 60 * 60 * 1000;
      
      // Mốc kết thúc tuần này = Mốc đầu tuần + 7 ngày
      let targetTime = startOfWeek.getTime() + weekDuration;

      // Nếu vì lý do nào đó targetTime đã qua, dịch lên tuần tiếp theo
      while (targetTime <= now.getTime()) {
        targetTime += weekDuration;
      }

      return targetTime - now.getTime();
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      
      if (remaining <= 0) {
        // Hết tuần -> Reload lại trang để Server nhận diện số tuần mới (currentWeekNumber) và đổi sản phẩm Flash Sale
        window.location.reload();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
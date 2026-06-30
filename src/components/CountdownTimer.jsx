"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer() {
  // Đặt thời gian đếm ngược ban đầu (Ví dụ: 4 giờ, 20 phút, 13 giây tính ra giây)
  const [timeLeft, setTimeLeft] = useState(4 * 3600 + 20 * 60 + 13);

  useEffect(() => {
    if (timeLeft <= 0) return;

    // Cứ mỗi 1000ms (1 giây) thì trừ đi 1 giây
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Hàm biến đổi tổng số giây thành định dạng Giờ : Phút : Giây
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Thêm số 0 phía trước nếu số < 10 (ví dụ: 04, 09)
    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const time = formatTime(timeLeft);

  return (
    <div className="d-flex gap-2 font-monospace small fw-bold">
      <span className="bg-dark text-white px-2 py-1">{time.hours}</span>:
      <span className="bg-dark text-white px-2 py-1">{time.minutes}</span>:
      <span className="bg-dark text-white px-2 py-1">{time.seconds}</span>
    </div>
  );
}
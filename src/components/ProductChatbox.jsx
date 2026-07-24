"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductChatbox({ products }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Xin chào Nam! Mình là trợ lý AI. Cứ nói cho mình biết gu giày của bạn (màu sắc, kích cỡ, tầm giá ), mình tìm cho liền nhé! 🤖" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Trạng thái chờ AI phản hồi
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Gọi API Route lên Server để xử lý thông tin qua AI
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: userText, products }),
      });

      if (!res.ok) throw new Error("Giao tiếp AI thất bại");

      const data = await res.json(); // Nhận về { reply, matchedIds }

      // 2. Thêm câu trả lời của AI vào khung chat
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);

      // 3. Nếu tìm thấy sản phẩm, đồng bộ bộ lọc lên URL/Giao diện
      if (data.matchedIds && data.matchedIds.length > 0) {
        const params = new URLSearchParams(searchParams.toString());
        
        // Truyền mảng ID sản phẩm lên URL dưới dạng chuỗi phân cách dấu phẩy
        params.set("filterIds", data.matchedIds.join(","));
        
        // Xóa bớt chữ tìm kiếm text cũ để tránh xung đột bộ lọc
        params.delete("search"); 
        
        router.push(`?${params.toString()}`);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "Ối, có chút lỗi kết nối với AI rồi. Bạn thử lại nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
      {/* Bong bóng mở chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center animate-bounce"
          style={{ width: "60px", height: "60px", backgroundColor: "#d87c3c", borderColor: "#d87c3c" }}
        >
          🤖
        </button>
      )}

      {/* Khung Chatbox */}
      {isOpen && (
        <div className="card shadow-lg" style={{ width: "360px", height: "480px", borderRadius: "16px", overflow: "hidden" }}>
          {/* Header */}
          <div className="card-header text-white d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: "#d87c3c" }}>
            <div className="d-flex align-items-center gap-2">
              <span className="spinner-grow spinner-grow-sm text-light" role="status" style={{ display: isLoading ? "inline-block" : "none" }}></span>
              <h6 className="m-0 fw-bold">Trợ Lý  Khách Hàng ⚡</h6>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn-close btn-close-white"></button>
          </div>

          {/* Ô Chat content */}
          <div className="card-body p-3 overflow-auto d-flex flex-column gap-2" style={{ height: "calc(100% - 125px)", backgroundColor: "#f8f9fa" }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                <div
                  className={`p-2 rounded-3 text-sm shadow-sm ${
                    msg.role === "user" ? "bg-dark text-white" : "bg-white border text-dark"
                  }`}
                  style={{ fontSize: "0.9rem", maxWidth: "85%", lineHeight: "1.4" }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="d-flex justify-content-start">
                <div className="p-2 rounded-3 bg-white border text-muted" style={{ fontSize: "0.85rem" }}>
                  Đang phân tích sản phẩm phù hợp... 🤔
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="card-footer p-2 bg-white border-top d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder={isLoading ? "AI đang tính, đợi tí nhé..." : "Tìm đôi nào đi êm, màu trắng size 41..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="btn btn-sm btn-dark" disabled={isLoading} style={{ backgroundColor: "#d87c3c", borderColor: "#d87c3c" }}>
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
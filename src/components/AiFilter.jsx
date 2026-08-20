"use client";

import { useState } from "react";
import ProductFilter from "@/components/ProductFilter"; // Đường dẫn đến file ProductFilter của bạn

export default function ShopPage({ initialProducts }) {
  const [aiFilteredIds, setAiFilteredIds] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Gửi tin nhắn tới API route chat AI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput;
    setChatInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", { // Khớp với route API bạn vừa gửi
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage, products: initialProducts }),
      });

      const data = await res.json();
      // API trả về: { reply: "...", matchedIds: ["id1", "id2"] }

      // Thêm câu trả lời của AI vào khung chat
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);

      // Cập nhật danh sách ID để bộ lọc tự động khoanh vùng sản phẩm
      if (data.matchedIds && data.matchedIds.length > 0) {
        setAiFilteredIds(data.matchedIds);
      }
    } catch (error) {
      console.error("Lỗi khi trò chuyện với AI:", error);
    } finally {
      setLoading(false);
    }
  };

  // Nút hủy lọc AI để xem lại toàn bộ sản phẩm
  const handleResetAi = () => {
    setAiFilteredIds(null);
    setMessages([]);
  };

  return (
    <div className="container py-4">
      {/* Khung chat AI minh họa */}
      <div className="card shadow-sm p-3 mb-4 bg-light border-0">
        <h5 className="fw-bold mb-2">🤖 Trợ lý AI Nova Kicks</h5>
        <div className="bg-white p-3 rounded mb-2 border" style={{ maxHeight: "160px", overflowY: "auto" }}>
          {messages.length === 0 ? (
            <p className="text-muted small mb-0">Hỏi AI ví dụ: "Tìm giúp mình giày màu trắng size 42 giá dưới 1 triệu"</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`mb-2 small ${msg.sender === "user" ? "text-end text-primary fw-bold" : "text-start text-dark"}`}>
                <span>{msg.text}</span>
              </div>
            ))
          )}
          {loading && <div className="text-muted small italic">AI đang tìm kiếm sản phẩm phù hợp...</div>}
        </div>

        <form onSubmit={handleSendMessage} className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Nhập yêu cầu tìm giày..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button className="btn btn-dark btn-sm" type="submit" disabled={loading}>
            Gửi
          </button>
          {aiFilteredIds && (
            <button className="btn btn-outline-danger btn-sm" type="button" onClick={handleResetAi}>
              Xóa gợi ý AI
            </button>
          )}
        </form>
      </div>

      {/* Truyền mảng matchedIds từ state vào ProductFilter */}
      <ProductFilter products={initialProducts} aiFilteredIds={aiFilteredIds} />
    </div>
  );
}
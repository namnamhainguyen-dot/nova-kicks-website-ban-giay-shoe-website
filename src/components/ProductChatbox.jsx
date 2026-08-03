"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Tin nhắn chào mặc định
const WELCOME_MESSAGE = {
  role: "bot",
  text: "Xin chào! Mình là trợ lý AI. Cứ nói cho mình biết gu giày của bạn (màu sắc, kích cỡ, tầm giá...), mình tìm cho liền nhé! 🤖",
};

export default function ProductChatbox({ products }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [replyMode, setReplyMode] = useState("bot");

  // Tạo cố định 1 sessionId duy nhất cho phiên chat của khách hàng
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let savedId = localStorage.getItem("chat_session_id");
      if (!savedId) {
        savedId = "session_" + Math.floor(Math.random() * 100000);
        localStorage.setItem("chat_session_id", savedId);
      }
      return savedId;
    }
    return "session_" + Math.floor(Math.random() * 100000);
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const chatEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // CƠ CHẾ POLLING + REFRESH TỨC THỜI: tải tin nhắn mới từ Admin/DB
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessagesFromAdmin = async () => {
      try {
        const res = await fetch(`/api/messages?sessionId=${sessionId}`);
        if (!res.ok) return;

        const dbMessages = await res.json();

        if (dbMessages && Array.isArray(dbMessages)) {
          if (dbMessages.length > 0) {
            const formattedDbMsgs = dbMessages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "bot",
              // Hỗ trợ linh hoạt nhiều tên trường text từ DB tránh bị bong bóng rỗng
              text: msg.text || msg.content || msg.message || "",
            }));

            setMessages((prev) => {
              const prevText = prev.map((msg) => `${msg.role}:${msg.text}`).join("||");
              const nextText = formattedDbMsgs.map((msg) => `${msg.role}:${msg.text}`).join("||");

              if (prevText === nextText) return prev;
              return formattedDbMsgs;
            });
          } else {
            // Giữ nguyên tin nhắn xin chào nếu DB rỗng
            setMessages([WELCOME_MESSAGE]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra tin nhắn mới:", error);
      }
    };

    const handleRefresh = () => {
      fetchMessagesFromAdmin();
    };

    fetchMessagesFromAdmin();
    const interval = setInterval(fetchMessagesFromAdmin, 1000);
    window.addEventListener("chat-updated", handleRefresh);
    window.addEventListener("storage", (event) => {
      if (event.key === "chat_refresh") {
        handleRefresh();
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("chat-updated", handleRefresh);
    };
  }, [isOpen, sessionId]);

  // XỬ LÝ GỬI TIN NHẮN
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const updatedMessages = [...messages, { role: "user", text: userText, mode: replyMode }];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // 1. Đồng bộ tin nhắn của khách lên DB
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          user: "Khách hàng",
          sender: "user",
          text: userText,
          mode: replyMode,
        }),
      });
    } catch (err) {
      console.error("Lỗi đồng bộ tin nhắn lên Admin:", err);
    }

    // 2. NẾU CHỌN GỬI CHO ADMIN -> Chỉ gửi thông báo xác nhận, không lặp lại tin nhắn
    if (replyMode === "admin") {
      const confirmText = "Đã chuyển tin nhắn của bạn đến Admin. Admin sẽ phản hồi sớm nhất có thể! 👨‍💼";

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: confirmText },
      ]);

      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId,
            user: "Khách hàng",
            sender: "admin",
            text: confirmText,
            mode: "admin",
          }),
        });
      } catch (err) {
        console.error("Lỗi gửi phản hồi tự động:", err);
      }

      setIsLoading(false);
      return;
    }

    // 3. NẾU CHỌN BOT TRẢ LỜI -> Gửi sang AI Gemini
    const historyForAPI = updatedMessages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userText,
          products,
          history: historyForAPI,
        }),
      });

      if (!res.ok) throw new Error("Giao tiếp AI thất bại");

      const data = await res.json();

      // Hiển thị câu trả lời AI
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);

      // Đồng bộ câu trả lời AI lên DB
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          user: "Khách hàng",
          sender: "admin",
          text: data.reply,
          mode: "bot",
        }),
      });

      // Lọc sản phẩm trên giao diện nếu AI tìm thấy
      if (data.matchedIds && data.matchedIds.length > 0) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("filterIds", data.matchedIds.join(","));
        params.delete("search");

        router.push(`?${params.toString()}`);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Ối, có chút lỗi kết nối với AI rồi. Bạn thử lại nhé!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
      {/* Nút Bong Bóng Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn shadow-lg d-flex align-items-center justify-content-center"
          style={{ width: "60px", height: "60px", backgroundColor: "#d87c3c", borderColor: "#d87c3c", borderRadius: "50%" }}
        >
          <span style={{ fontSize: "1.5rem" }}>🤖</span>
        </button>
      )}

      {/* Khung Chatbox */}
      {isOpen && (
        <div className="card shadow-lg border-0" style={{ width: "360px", height: "480px", borderRadius: "16px", overflow: "hidden" }}>
          {/* Header */}
          <div className="card-header text-white d-flex justify-content-between align-items-center py-3 border-0" style={{ backgroundColor: "#d87c3c" }}>
            <div className="d-flex align-items-center gap-2">
              <span className="spinner-grow spinner-grow-sm text-light" role="status" style={{ display: isLoading ? "inline-block" : "none" }}></span>
              <h6 className="m-0 fw-bold">Trợ Lý Khách Hàng ⚡</h6>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn-close btn-close-white"></button>
          </div>

          {/* Khung chứa Nội dung Tin nhắn */}
          <div className="card-body p-3 overflow-auto d-flex flex-column gap-2" style={{ height: "calc(100% - 125px)", backgroundColor: "#f8f9fa" }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                <div
                  className={`p-2 rounded-3 text-sm shadow-sm ${
                    msg.role === "user" ? "text-white" : "bg-white border text-dark"
                  }`}
                  style={{
                    fontSize: "0.9rem",
                    maxWidth: "85%",
                    lineHeight: "1.4",
                    backgroundColor: msg.role === "user" ? "#d87c3c" : "#fff",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="d-flex justify-content-start">
                <div className="p-2 rounded-3 bg-white border text-muted" style={{ fontSize: "0.85rem" }}>
                  Đang xử lý... 🤔
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Ô Nhập Tin Nhắn & Nút Gửi */}
          <form onSubmit={handleSendMessage} className="card-footer p-2 bg-white border-top" style={{ borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
            <div className="d-flex gap-2 mb-2">
              <button
                type="button"
                className={`btn btn-sm flex-grow-1 ${replyMode === "bot" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setReplyMode("bot")}
              >
                Bot trả lời
              </button>
              <button
                type="button"
                className={`btn btn-sm flex-grow-1 ${replyMode === "admin" ? "btn-warning" : "btn-outline-warning"}`}
                onClick={() => setReplyMode("admin")}
              >
                Gửi cho Admin
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control form-control-sm rounded-pill px-3 py-2"
                placeholder={isLoading ? "Đang xử lý..." : replyMode === "admin" ? "Nhập câu hỏi cho admin..." : "Nhập tin nhắn..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                style={{ border: "1px solid #dee2e6", boxShadow: "none" }}
              />
              <button
                type="submit"
                className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle"
                disabled={isLoading || !input.trim()}
                style={{
                  backgroundColor: isLoading || !input.trim() ? "#e9ecef" : "#d87c3c",
                  borderColor: isLoading || !input.trim() ? "#e9ecef" : "#d87c3c",
                  color: isLoading || !input.trim() ? "#adb5bd" : "white",
                  width: "40px",
                  height: "40px",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
                title="Gửi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: "-2px", marginTop: "1px" }}>
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
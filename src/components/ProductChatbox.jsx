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
              text: msg.text || msg.content || msg.message || "",
            }));

            setMessages((prev) => {
              const prevText = prev.map((msg) => `${msg.role}:${msg.text}`).join("||");
              const nextText = formattedDbMsgs.map((msg) => `${msg.role}:${msg.text}`).join("||");

              if (prevText === nextText) return prev;
              return formattedDbMsgs;
            });
          } else {
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

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);

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
      {/* Nút Bong Bóng Chat (Floating Button) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn text-white shadow-lg d-flex align-items-center justify-content-center position-relative"
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "#d87c3c",
            borderColor: "#d87c3c",
            borderRadius: "50%",
            transition: "transform 0.2s ease",
          }}
          title="Trò chuyện với Trợ lý AI"
        >
          <i className="fas fa-robot fs-4"></i>
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle">
            <span className="visually-hidden">New alerts</span>
          </span>
        </button>
      )}

      {/* Khung Chatbox Giao Diện Hiện Đại */}
      {isOpen && (
        <div
          className="card shadow-lg border-0 d-flex flex-column"
          style={{
            width: "380px",
            height: "540px",
            borderRadius: "20px",
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 text-white d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#212529" }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{ width: "38px", height: "38px", backgroundColor: "#d87c3c", fontSize: "1rem" }}
              >
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h6 className="m-0 fw-bold fs-6">Nova Assistant</h6>
                <div className="d-flex align-items-center gap-1 mt-0.5">
                  <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: "7px", height: "7px", display: isLoading ? "inline-block" : "none" }}></span>
                  <span className="text-success" style={{ fontSize: "0.75rem", fontWeight: "500" }}>
                    {isLoading ? "Đang trả lời..." : "● Sẵn sàng tư vấn"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm text-white-50 hover-text-white border-0 bg-transparent p-1"
              style={{ fontSize: "1.1rem" }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Thanh chuyển chế độ (Mode Switcher) */}
          <div className="bg-light px-3 py-2 border-bottom d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm flex-grow-1 rounded-pill fw-semibold py-1.5 transition-all ${
                replyMode === "bot" ? "btn-dark shadow-sm" : "btn-light text-muted border-0"
              }`}
              style={{ fontSize: "0.8rem" }}
              onClick={() => setReplyMode("bot")}
            >
              <i className="fas fa-bolt me-1 text-warning"></i> Bot AI tư vấn
            </button>
            <button
              type="button"
              className={`btn btn-sm flex-grow-1 rounded-pill fw-semibold py-1.5 transition-all ${
                replyMode === "admin" ? "btn-warning text-dark shadow-sm" : "btn-light text-muted border-0"
              }`}
              style={{ fontSize: "0.8rem" }}
              onClick={() => setReplyMode("admin")}
            >
              <i className="fas fa-user-shield me-1"></i> Gửi cho Admin
            </button>
          </div>

          {/* Khung chứa Nội dung Tin nhắn */}
          <div
            className="card-body p-3 overflow-auto d-flex flex-column gap-3"
            style={{ flex: 1, backgroundColor: "#fcfcfc" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex align-items-end gap-2 ${
                  msg.role === "user" ? "justify-content-end" : "justify-content-start"
                }`}
              >
                {msg.role !== "user" && (
                  <div
                    className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center flex-shrink-0 mb-1"
                    style={{ width: "26px", height: "26px", fontSize: "0.7rem" }}
                  >
                    AI
                  </div>
                )}
                <div
                  className={`p-3 shadow-sm ${
                    msg.role === "user"
                      ? "text-white rounded-4 rounded-bottom-end-0"
                      : "bg-white text-dark rounded-4 rounded-bottom-start-0 border border-light-subtle"
                  }`}
                  style={{
                    fontSize: "0.875rem",
                    maxWidth: "80%",
                    lineHeight: "1.5",
                    backgroundColor: msg.role === "user" ? "#d87c3c" : "#ffffff",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="d-flex align-items-end gap-2 justify-content-start">
                <div
                  className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center flex-shrink-0 mb-1"
                  style={{ width: "26px", height: "26px", fontSize: "0.7rem" }}
                >
                  AI
                </div>
                <div className="p-3 rounded-4 rounded-bottom-start-0 bg-white border border-light-subtle text-muted shadow-sm" style={{ fontSize: "0.85rem" }}>
                  <span className="spinner-border spinner-border-sm me-2 text-warning" role="status"></span>
                  Đang tìm kiếm giày phù hợp...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Ô Nhập Tin Nhắn & Nút Gửi */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-top d-flex align-items-center gap-2"
          >
            <input
              type="text"
              className="form-control form-control-sm rounded-pill px-3 py-2 bg-light border-0"
              placeholder={
                replyMode === "admin"
                  ? "Nhập nội dung cần hỏi Admin..."
                  : "Nhập gu giày của bạn (màu, giá...)..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              style={{ fontSize: "0.875rem", boxShadow: "none" }}
            />
            <button
              type="submit"
              className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-sm"
              disabled={isLoading || !input.trim()}
              style={{
                backgroundColor: isLoading || !input.trim() ? "#e9ecef" : "#d87c3c",
                borderColor: isLoading || !input.trim() ? "#e9ecef" : "#d87c3c",
                color: isLoading || !input.trim() ? "#adb5bd" : "white",
                width: "38px",
                height: "38px",
                transition: "all 0.2s",
              }}
              title="Gửi"
            >
              <i className="fas fa-paper-plane" style={{ fontSize: "0.85rem", marginLeft: "-1px" }}></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
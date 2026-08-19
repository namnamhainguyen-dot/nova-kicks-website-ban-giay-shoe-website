"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const chatEndRef = useRef(null);

  // 1. Hàm lấy thông tin User từ LocalStorage
  const getLoggedInCustomer = useCallback(() => {
    if (typeof window === "undefined") return { id: "", name: "" };

    const candidateKeys = ["user", "userInfo", "currentUser", "account", "auth"];

    for (const key of candidateKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const parsedUser = JSON.parse(raw);
        if (!parsedUser || typeof parsedUser !== "object") continue;

        const customerName =
          parsedUser.fullname ||
          parsedUser.fullName ||
          parsedUser.name ||
          parsedUser.username ||
          parsedUser.displayName ||
          parsedUser.email ||
          "";

        const customerId = parsedUser._id || parsedUser.id || parsedUser.userId || parsedUser.email || "";

        if (customerName) {
          return { id: String(customerId), name: customerName };
        }
      } catch (e) {
        // Bỏ qua lỗi parse JSON
      }
    }

    return { id: "", name: "" };
  }, []);

  // 2. Khởi tạo Session Info
  const [sessionInfo, setSessionInfo] = useState(() => {
    if (typeof window !== "undefined") {
      const currentUser = getLoggedInCustomer();
      if (currentUser.id) {
        return {
          id: `session_user_${currentUser.id}`,
          name: currentUser.name,
        };
      }

      let guestSession = sessionStorage.getItem("guest_chat_session");
      let guestName = sessionStorage.getItem("guest_chat_name");
      if (!guestSession) {
        guestSession = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        guestName = `Khách hàng ${Math.floor(1000 + Math.random() * 9000)}`;
        sessionStorage.setItem("guest_chat_session", guestSession);
        sessionStorage.setItem("guest_chat_name", guestName);
      }
      return { id: guestSession, name: guestName };
    }
    return { id: "session_guest", name: "Khách hàng" };
  });

  // 3. Lắng nghe thay đổi trạng thái đăng nhập
  useEffect(() => {
    const updateAuthStatus = () => {
      const currentUser = getLoggedInCustomer();
      if (currentUser.id) {
        setSessionInfo({
          id: `session_user_${currentUser.id}`,
          name: currentUser.name,
        });
      }
    };

    updateAuthStatus();
    window.addEventListener("storage", updateAuthStatus);
    window.addEventListener("userLogin", updateAuthStatus);

    return () => {
      window.removeEventListener("storage", updateAuthStatus);
      window.removeEventListener("userLogin", updateAuthStatus);
    };
  }, [getLoggedInCustomer]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 4. Lấy danh sách tin nhắn định kỳ
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessagesFromAdmin = async () => {
      try {
        const res = await fetch(`/api/messages?sessionId=${sessionInfo.id}`);
        if (!res.ok) return;

        const dbMessages = await res.json();

        if (Array.isArray(dbMessages)) {
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

    fetchMessagesFromAdmin();
    const interval = setInterval(fetchMessagesFromAdmin, 2500);

    const handleRefresh = () => fetchMessagesFromAdmin();
    window.addEventListener("chat-updated", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("chat-updated", handleRefresh);
    };
  }, [isOpen, sessionInfo.id]);

  // Hàm xử lý gửi tin nhắn chung (dùng cho cả ô input và dải gợi ý)
  const submitMessage = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    const userText = textToSend.trim();
    const updatedMessages = [...messages, { role: "user", text: userText, mode: replyMode }];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionInfo.id,
          user: sessionInfo.name,
          sender: "user",
          text: userText,
          mode: replyMode,
        }),
      });
      window.dispatchEvent(new Event("chat-updated"));
    } catch (err) {
      console.error("Lỗi đồng bộ tin nhắn:", err);
    }

    if (replyMode === "admin") {
      const adminNotice = "Đã chuyển tin nhắn của bạn đến Admin. Admin sẽ phản hồi sớm nhất có thể! 👨‍💼";
      setMessages((prev) => [...prev, { role: "bot", text: adminNotice }]);

      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionInfo.id,
          user: sessionInfo.name,
          sender: "bot",
          text: adminNotice,
          mode: "admin",
        }),
      });

      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userText,
          products,
          history: [], // Truyền mảng rỗng để mỗi lần hỏi là một lượt tư vấn độc lập, tránh việc AI bị lặp lại kết quả cũ
        }),
      });

      if (!res.ok) throw new Error("Giao tiếp AI thất bại");

      const data = await res.json();

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);

      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionInfo.id,
          user: sessionInfo.name,
          sender: "bot",
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

  // 5. Gửi tin nhắn từ form
  const handleSendMessage = (e) => {
    e.preventDefault();
    submitMessage(input);
  };

  return (
    <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
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

      {isOpen && (
        <div
          className="card shadow-lg border-0 d-flex flex-column"
          style={{
            width: "380px",
            height: "580px", // Tăng nhẹ chiều cao để chứa dải gợi ý thoải mái hơn
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
                  <span
                    className="spinner-grow spinner-grow-sm text-success"
                    role="status"
                    style={{ width: "7px", height: "7px", display: isLoading ? "inline-block" : "none" }}
                  ></span>
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

          {/* Thanh chuyển chế độ */}
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

          {/* Khung tin nhắn */}
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
                <div
                  className="p-3 rounded-4 rounded-bottom-start-0 bg-white border border-light-subtle text-muted shadow-sm"
                  style={{ fontSize: "0.85rem" }}
                >
                  <span className="spinner-border spinner-border-sm me-2 text-warning" role="status"></span>
                  Đang xử lý...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Dải gợi ý nhanh (Chip Suggestions) */}
          <div className="px-3 py-2 bg-white border-top d-flex gap-1.5 overflow-x-auto" style={{ whiteSpace: "nowrap" }}>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 flex-shrink-0"
              style={{ fontSize: "0.75rem", borderColor: "#dee2e6", color: "#495057" }}
              onClick={() => {
                setInput("giày để đi ăn cưới, ăn tiệc");
                submitMessage("giày để đi ăn cưới, ăn tiệc");
              }}
            >
              🎉 Đi ăn cưới, ăn tiệc
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 flex-shrink-0"
              style={{ fontSize: "0.75rem", borderColor: "#dee2e6", color: "#495057" }}
              onClick={() => {
                setInput("giày để đi leo núi");
                submitMessage("giày để đi leo núi");
              }}
            >
              ⛰️ Đi leo núi
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 flex-shrink-0"
              style={{ fontSize: "0.75rem", borderColor: "#dee2e6", color: "#495057" }}
              onClick={() => {
                setInput("giày để đi học");
                submitMessage("giày để đi học");
              }}
            >
              📚 Đi học
            </button>
          </div>

          {/* Ô nhập tin nhắn */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-top d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm rounded-pill px-3 py-2 bg-light border-0"
              placeholder={
                replyMode === "admin" ? "Nhập nội dung cần hỏi Admin..." : "Nhập gu giày của bạn (màu, giá...)..."
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
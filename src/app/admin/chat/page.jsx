"use client";
import { useState, useEffect, useRef } from "react";

export default function AdminDirectReplyPage() {
  const [conversations, setConversations] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const chatEndRef = useRef(null);

  // 1. POLLING: Lấy danh sách cuộc hội thoại & tin nhắn từ Server mỗi 3 giây
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/messages");
        if (!res.ok) return;

        const data = await res.json();
        if (Array.isArray(data)) {
          // So sánh để tránh re-render trùng lặp gây giật giao diện
          setConversations((prev) => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(data);
            if (prevStr === nextStr) return prev;
            return data;
          });

          // Tự động chọn cuộc trò chuyện đầu tiên nếu chưa chọn
          setActiveSessionId((prevId) => {
            if (!prevId && data.length > 0) {
              return data[0].sessionId;
            }
            return prevId;
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách tin nhắn:", error);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);

    const handleStorageChange = (e) => {
      if (e.key === "chat_refresh") fetchConversations();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("chat-updated", fetchConversations);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("chat-updated", fetchConversations);
    };
  }, []);

  // Chỉ cuộn xuống tin nhắn cuối cùng khi đổi Session hoặc khi tổng số tin nhắn thay đổi
  const activeChat = conversations.find((c) => c.sessionId === activeSessionId);
  const totalMessagesCount = activeChat?.messages?.length || 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSessionId, totalMessagesCount]);

  // Lọc danh sách khách hàng theo ô tìm kiếm
  const filteredConversations = conversations.filter(
    (conv) =>
      (conv.user || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.sessionId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. XỬ LÝ GỬI TIN NHẮN TRẢ LỜI CỦA ADMIN
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSessionId) return;

    const currentText = replyText.trim();
    setReplyText("");

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Optimistic Update
    const newMessage = { id: Date.now(), sender: "admin", text: currentText };
    setConversations((prev) =>
      prev.map((chat) =>
        chat.sessionId === activeSessionId
          ? {
              ...chat,
              messages: [...(chat.messages || []), newMessage],
              time: nowTime,
            }
          : chat
      )
    );

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          sender: "admin",
          user: activeChat?.user || "Khách hàng",
          text: currentText,
          mode: "admin",
        }),
      });

      if (res.ok) {
        localStorage.setItem("chat_refresh", `${Date.now()}`);
        window.dispatchEvent(new Event("chat-updated"));
      }
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Tiêu đề trang */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "1.75rem" }}>
          Hỗ trợ trực tiếp
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
          Quản lý và trả lời tin nhắn trực tiếp từ khách hàng theo thời gian thực.
        </p>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ height: "calc(100vh - 150px)" }}>
        <div className="row g-0 h-100">
          {/* Cột trái: Danh sách cuộc hội thoại */}
          <div className="col-4 border-end bg-white h-100 d-flex flex-column">
            <div className="p-3 border-bottom bg-light">
              <input
                type="text"
                className="form-control rounded-pill"
                placeholder="Tìm kiếm khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "0.9rem" }}
              />
            </div>

            <div className="overflow-auto flex-grow-1">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const lastMsgObj = conv.messages?.[conv.messages.length - 1];
                  const lastMsgText = lastMsgObj
                    ? lastMsgObj.text || lastMsgObj.content || lastMsgObj.message
                    : "Chưa có tin nhắn";
                  const isSelected = activeSessionId === conv.sessionId;

                  return (
                    <div
                      key={conv.sessionId}
                      onClick={() => setActiveSessionId(conv.sessionId)}
                      className={`p-3 border-bottom d-flex justify-content-between align-items-center ${
                        isSelected ? "bg-light border-start border-4 border-warning" : "bg-white"
                      }`}
                      style={{ cursor: "pointer", transition: "0.2s" }}
                    >
                      <div className="w-100 me-2" style={{ overflow: "hidden" }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: "0.95rem" }}>
                            {conv.user || "Khách hàng"}
                          </h6>
                          <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {conv.time || ""}
                          </small>
                        </div>
                        <p className="mb-0 text-muted text-truncate" style={{ fontSize: "0.85rem" }}>
                          {lastMsgObj?.sender === "admin" ? "Bạn: " : ""}
                          {lastMsgText}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted" style={{ fontSize: "0.9rem" }}>
                  Chưa có cuộc trò chuyện nào
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Khung Chat Chi Tiết */}
          <div className="col-8 d-flex flex-column h-100 bg-white">
            {activeChat ? (
              <>
                {/* Header Chat */}
                <div className="p-3 border-bottom d-flex align-items-center gap-3 bg-white">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                    style={{ width: "42px", height: "42px", backgroundColor: "#d87c3c" }}
                  >
                    {(activeChat.user || "K").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h6 className="m-0 fw-bold">{activeChat.user || "Khách hàng"}</h6>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {activeChat.status === "online" ? "Đang hoạt động" : "Không hoạt động"}
                    </small>
                  </div>
                </div>

                {/* Nội dung tin nhắn */}
                <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column gap-3" style={{ backgroundColor: "#f8f9fa" }}>
                  {activeChat.messages && activeChat.messages.length > 0 ? (
                    activeChat.messages.map((msg, index) => {
                      const isAdmin = msg.sender === "admin";
                      const isBot = msg.sender === "bot";
                      const msgContent = msg.text || msg.content || msg.message || "";

                      return (
                        <div key={msg.id || index} className={`d-flex flex-column ${isAdmin ? "align-items-end" : "align-items-start"}`}>
                          <span className="text-muted mb-1 px-1" style={{ fontSize: "0.7rem" }}>
                            {isAdmin ? "Admin" : isBot ? "Bot AI" : activeChat.user || "Khách hàng"}
                          </span>
                          <div
                            className={`p-2 px-3 rounded-3 shadow-sm ${
                              isAdmin
                                ? "text-white"
                                : isBot
                                ? "bg-light border text-secondary"
                                : "bg-white border text-dark"
                            }`}
                            style={{
                              backgroundColor: isAdmin ? "#d87c3c" : undefined,
                              maxWidth: "70%",
                              fontSize: "0.95rem",
                              lineHeight: "1.4",
                            }}
                          >
                            {msgContent}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted my-auto">Chưa có nội dung tin nhắn</div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Form nhập liệu */}
                <div className="p-3 border-top bg-white">
                  <form onSubmit={handleSendReply} className="d-flex gap-2 align-items-center">
                    <input
                      type="text"
                      className="form-control rounded-pill px-3 py-2"
                      placeholder={`Trả lời ${activeChat.user || "khách hàng"}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{ border: "1px solid #dee2e6", boxShadow: "none" }}
                    />
                    <button
                      type="submit"
                      className="btn d-flex align-items-center justify-content-center rounded-circle"
                      disabled={!replyText.trim()}
                      style={{
                        backgroundColor: !replyText.trim() ? "#e9ecef" : "#d87c3c",
                        borderColor: !replyText.trim() ? "#e9ecef" : "#d87c3c",
                        color: !replyText.trim() ? "#adb5bd" : "white",
                        width: "45px",
                        height: "45px",
                        flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                      title="Gửi phản hồi"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: "-2px" }}>
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                Hãy chọn một cuộc hội thoại để bắt đầu hỗ trợ
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
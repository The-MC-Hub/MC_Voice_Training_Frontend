import React from "react";
import { CheckCheck, Loader2, MessageCircle } from "lucide-react";

const formatSystemLabel = (message) => {
  const rawId = message.bookingId?._id || message.bookingId || "";
  const bookingId = rawId ? String(rawId).slice(-8) : "N/A";
  const dateText = message.createdAt
    ? new Date(message.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "TBD";

  return `Booking moi #${bookingId} - ${dateText}`;
};

const MessageList = ({
  loadingMessages,
  messages,
  userId,
  getReadStatus,
  formatMsgTime,
  formatDateDivider,
  typingUser,
  activeChat,
  messagesEndRef,
}) => {
  return (
    <div className="chat-messages-area flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative">
      {loadingMessages ? (
        <div className="flex items-center justify-center h-full opacity-40">
          <Loader2 size={32} className="animate-spin text-gold" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
          <MessageCircle size={48} className="mb-4" />
          <p className="text-sm font-bold text-muted">
            No messages yet. Say hello!
          </p>
        </div>
      ) : (
        <>
          {messages.length > 0 && (
            <div className="date-stamp-divider flex items-center justify-center gap-6 opacity-30 my-6">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-tiny font-black uppercase tracking-300 text-muted">
                {formatDateDivider(messages[0]?.createdAt)}
              </span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div key={msg._id} className="my-4">
                  <div className="flex items-center gap-4 opacity-70">
                    <div className="h-px bg-gold/25 flex-1"></div>
                    <span className="text-tiny font-black uppercase tracking-[0.2em] text-gold/90">
                      {formatSystemLabel(msg)}
                    </span>
                    <div className="h-px bg-gold/25 flex-1"></div>
                  </div>
                </div>
              );
            }

            const isSelf = (msg.senderId?._id || msg.senderId) === userId;
            const readStatus = getReadStatus(msg);

            return (
              <div
                key={msg._id}
                className={`msg-bubble-wrapper flex ${isSelf ? "justify-end" : "justify-start"} group`}
              >
                <div
                  className={`msg-bubble p-5 px-6 rounded-3xl max-w-[65%] space-y-2 relative transition-all duration-300 hover:scale-[1.01] ${
                    isSelf
                      ? "bg-gold text-slate-950 shadow-2xl shadow-gold/10"
                      : "bg-slate-900 border border-white/5 text-slate-200"
                  }`}
                >
                  <p className="text-sm font-medium leading-relaxed">
                    {msg.content}
                  </p>
                  <div
                    className={`msg-meta flex items-center gap-2 text-micro font-black uppercase tracking-widest ${
                      isSelf ? "text-slate-950/60" : "text-slate-500 opacity-60"
                    }`}
                  >
                    {formatMsgTime(msg.createdAt)}
                    {isSelf && readStatus && (
                      <CheckCheck
                        size={14}
                        className={
                          readStatus === "read"
                            ? "text-blue-600"
                            : "text-slate-950/40"
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {typingUser && typingUser.conversationId === activeChat._id && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-4 px-6">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="font-medium">
                    {typingUser.name || "Someone"}
                  </span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;

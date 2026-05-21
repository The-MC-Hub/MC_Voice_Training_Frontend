import React from "react";
import {
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  ShieldCheck,
} from "lucide-react";
import ConversationHeader from "./ConversationHeader";
import MessageList from "./MessageList";

const ChatWindow = ({
  activeChat,
  otherUser,
  online,
  loadingMessages,
  messages,
  userId,
  getReadStatus,
  formatMsgTime,
  formatDateDivider,
  typingUser,
  messagesEndRef,
  message,
  onInputChange,
  onKeyDown,
  onSend,
  sending,
}) => {
  return (
    <>
      <ConversationHeader
        activeChat={activeChat}
        otherUser={otherUser}
        online={online}
      />

      <MessageList
        loadingMessages={loadingMessages}
        messages={messages}
        userId={userId}
        getReadStatus={getReadStatus}
        formatMsgTime={formatMsgTime}
        formatDateDivider={formatDateDivider}
        typingUser={typingUser}
        activeChat={activeChat}
        messagesEndRef={messagesEndRef}
      />

      <div className="chat-input-bar p-8 px-10 border-t border-white/5 bg-slate-900/40 relative z-20">
        <div className="input-field-wrapper glass-effect p-2 rounded-6xl border border-white/10 flex items-center gap-2 group-focus-within:border-gold/40 transition-all shadow-2xl">
          <div className="input-actions-left flex gap-1 pl-2">
            <button className="icon-btn sm h-11 w-11 rounded-full text-muted hover:text-gold transition-all">
              <Paperclip size={20} />
            </button>
            <button className="icon-btn sm h-11 w-11 rounded-full text-muted hover:text-gold transition-all">
              <ImageIcon size={20} />
            </button>
          </div>
          <input
            type="text"
            placeholder={
              activeChat.isActive === false
                ? "Booking rejected. Conversation is closed."
                : "Type a secure message..."
            }
            className="bg-transparent border-none outline-none flex-1 p-3 text-sm font-bold text-primary placeholder:text-muted/40 disabled:opacity-50"
            value={message}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            disabled={sending || activeChat.isActive === false}
          />
          <button
            onClick={onSend}
            disabled={
              !message.trim() || sending || activeChat.isActive === false
            }
            className="btn btn-primary rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} className="ml-1" />
            )}
          </button>
        </div>
        <div className="input-under-text flex justify-center mt-4">
          <p className="flex items-center gap-2 text-micro font-bold uppercase tracking-widest text-slate-500 opacity-60">
            <ShieldCheck size={12} className="text-gold/50" /> End-to-end
            encrypted stage communication channel
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;

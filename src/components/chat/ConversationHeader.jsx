import React from "react";
import { ChevronLeft, MoreVertical, Phone, Video } from "lucide-react";

const shortBookingId = (bookingId) => {
  if (!bookingId) return "N/A";
  const value = String(bookingId);
  return value.length > 8 ? value.slice(-8) : value;
};

const formatBookingDate = (dateStr) => {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const ConversationHeader = ({ activeChat, otherUser, online }) => {
  const currentBooking = activeChat?.currentBooking || activeChat?.bookingId;
  const currentBookingId =
    activeChat?.currentBookingId ||
    currentBooking?._id ||
    activeChat?.bookingId?._id;

  return (
    <div className="chat-view-header p-6 px-10 flex justify-between items-center border-b border-white/5 bg-slate-900/20">
      <div className="header-user-info flex items-center gap-6">
        <button className="md:hidden icon-btn h-10 w-10 glass-effect rounded-md mr-2">
          <ChevronLeft size={20} />
        </button>
        <div className="avatar-preview-sm relative">
          <div className="w-12 h-12 rounded-md bg-gold text-slate-950 flex items-center justify-center font-black shadow-xl shadow-gold/20 active:scale-95 transition-transform">
            {otherUser?.name?.[0] || "?"}
          </div>
        </div>
        <div className="user-text-meta">
          <h3 className="text-xl font-black text-white">
            {otherUser?.name || "Unknown"}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className={`flex justify-center items-center gap-2 text-micro font-black uppercase tracking-widest w-max px-2 py-0.5 rounded-md border ${
                online
                  ? "text-green-400 bg-green-400/5 border-green-400/10"
                  : "text-slate-500 bg-slate-500/5 border-slate-500/10"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-500" : "bg-slate-600"}`}
              ></span>
              {online ? "Online" : "Offline"}
            </div>

            {currentBookingId && (
              <div className="flex items-center gap-2 text-micro font-black uppercase tracking-widest text-gold border border-gold/30 bg-gold/10 px-2 py-0.5 rounded-md">
                <span>Booking #{shortBookingId(currentBookingId)}</span>
                <span className="text-gold/60">|</span>
                <span>{currentBooking?.status || "Pending"}</span>
                <span className="text-gold/60">|</span>
                <span>{formatBookingDate(currentBooking?.eventDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="header-actions-chat flex gap-4">
        <button className="icon-btn h-12 w-12 glass-effect rounded-md border border-white/10 text-muted hover:text-gold hover:border-gold/30 transition-all active:scale-95">
          <Phone size={22} />
        </button>
        <button className="icon-btn h-12 w-12 glass-effect rounded-md border border-white/10 text-muted hover:text-gold hover:border-gold/30 transition-all active:scale-95">
          <Video size={22} />
        </button>
        <button className="icon-btn h-12 w-12 glass-effect rounded-md border border-white/10 text-muted hover:text-gold hover:border-gold/30 transition-all active:scale-95">
          <MoreVertical size={22} />
        </button>
      </div>
    </div>
  );
};

export default ConversationHeader;

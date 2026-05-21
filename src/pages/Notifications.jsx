import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell, Calendar, MessageSquare, Star, ShieldCheck,
  CheckCircle2, Clock, ArrowRight, Trash2, Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, clearAll } from "../controllers/notificationController";
import { fetchMCBookings } from "../controllers/bookingController";
import { useAuthStore } from "../store/useAuthStore";

const typeConfig = {
  booking_request:   { icon: <Calendar size={18} />, color: "gold",  label: "Booking" },
  booking_confirmed: { icon: <Calendar size={18} />, color: "gold",  label: "Booking" },
  booking_cancelled: { icon: <Calendar size={18} />, color: "gold",  label: "Booking" },
  payment_escrowed:  { icon: <ShieldCheck size={18} />, color: "green",  label: "Payment" },
  payment_released:  { icon: <ShieldCheck size={18} />, color: "green",  label: "Payment" },
  system:            { icon: <CheckCircle2 size={18} />, color: "blue",   label: "System" },
  new_review:        { icon: <Star size={18} />, color: "yellow", label: "Social" },
  message_received:  { icon: <MessageSquare size={18} />, color: "blue",   label: "Chat" },
};

const filterMap = {
  "All": null,
  "Bookings": ["booking_request", "booking_confirmed", "booking_cancelled"],
  "Financials": ["payment_escrowed", "payment_released"],
  "Social": ["new_review"],
};

const formatTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  if (Math.floor(diff / 86400000) === 1) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

const iconBgClass = (color) => {
  if (color === "gold")   return "bg-[#f5a623]/[0.08] text-[#f5a623] border border-[#f5a623]/20";
  if (color === "green")  return "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20";
  if (color === "yellow") return "bg-yellow-500/[0.08] text-yellow-400 border border-yellow-500/20";
  return "bg-blue-500/[0.08] text-blue-400 border border-blue-500/20";
};

const badgeClass = (color) => {
  if (color === "gold")   return "bg-[#f5a623]/[0.08] text-[#f5a623] border-[#f5a623]/20";
  if (color === "green")  return "bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/20";
  if (color === "yellow") return "bg-yellow-500/[0.08] text-yellow-400 border-yellow-500/20";
  return "bg-blue-500/[0.08] text-blue-400 border-blue-500/20";
};

const Notifications = () => {
  const { role } = useAuthStore();
  const { on } = useSocket();
  const [activeTab, setActiveTab] = useState("All");

  const { data: mcBookings } = useApi(
    () => ((role || "").toLowerCase() === "mc" ? fetchMCBookings() : Promise.resolve([])), [role]
  );
  const pendingCount = useMemo(() => (mcBookings ?? []).filter(b => b.status === "Pending").length, [mcBookings]);

  const { data: notifData, loading } = useApi(() => fetchNotifications(1), []);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (notifData?.notifications) setNotifications(notifData.notifications.map(n => ({ ...n, _fromApi: true })));
  }, [notifData]);

  useEffect(() => {
    const cleanup = on("notification_push", (n) => setNotifications(prev => [n, ...prev]));
    return cleanup;
  }, [on]);

  const unreadCount = useMemo(() => {
    if (notifData?.unreadCount !== undefined) {
      const readLocally = notifications.filter(n => n.isRead && n._fromApi).length;
      const unreadPush = notifications.filter(n => !n.isRead && !n._fromApi).length;
      return Math.max(0, notifData.unreadCount - readLocally + unreadPush);
    }
    return notifications.filter(n => !n.isRead).length;
  }, [notifications, notifData?.unreadCount]);

  const filtered = useMemo(() => {
    const types = filterMap[activeTab];
    return types ? notifications.filter(n => types.includes(n.type)) : notifications;
  }, [notifications, activeTab]);

  const handleMarkRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  }, []);

  const handleClearAll = useCallback(async () => {
    try { await clearAll(); setNotifications([]); } catch {}
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  }, []);

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Booking alert banner */}
      {(role || "").toLowerCase() === "mc" && pendingCount > 0 && (
        <Link to="/m/booking-requests"
          className="flex items-center justify-between gap-4 p-4 mb-6 bg-[#f5a623]/[0.06] border border-[#f5a623]/20 rounded-xl hover:border-[#f5a623]/30 transition-colors">
          <div>
            <p className="text-[11px] font-medium text-[#f5a623] uppercase tracking-wider mb-0.5">Booking Alert</p>
            <p className="text-[13px] text-zinc-300">
              You have <span className="font-semibold text-[#f5a623]">{pendingCount}</span> pending booking request{pendingCount > 1 ? "s" : ""}.
            </p>
          </div>
          <span className="shrink-0 px-4 py-1.5 bg-[#f5a623] text-black text-[12px] font-semibold rounded-lg">Review</span>
        </Link>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-6 mb-6 border-b border-white/[0.07]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            All Alerts
            {unreadCount > 0 && (
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-red-500/[0.12] text-red-400 border border-red-500/20 font-medium">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1">Stage bookings, escrow status, and system updates.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.14] text-[12px] font-medium transition-colors">
              <CheckCircle2 size={13} /> Mark all read
            </button>
          )}
          <button onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/[0.06] text-[12px] font-medium transition-colors">
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-6">
        {Object.keys(filterMap).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
              activeTab === tab
                ? "bg-[#f5a623]/[0.08] text-[#f5a623] border-[#f5a623]/20"
                : "text-zinc-500 border-white/[0.06] hover:text-white hover:border-white/[0.1]"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#f5a623]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full border border-dashed border-white/[0.1] mx-auto mb-4 flex items-center justify-center">
            <Bell size={24} className="text-zinc-700" />
          </div>
          <p className="text-[13px] text-zinc-600">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert) => {
            const cfg = typeConfig[alert.type] || typeConfig.system;
            return (
              <div key={alert._id} onClick={() => !alert.isRead && handleMarkRead(alert._id)}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                  !alert.isRead
                    ? "bg-[#111113] border-white/[0.07] hover:border-white/[0.12]"
                    : "bg-[#09090b] border-white/[0.04] hover:border-white/[0.07]"
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass(cfg.color)}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`text-[14px] font-medium ${!alert.isRead ? "text-white" : "text-zinc-400"}`}>
                      {alert.title}
                    </h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${badgeClass(cfg.color)}`}>
                      {cfg.label}
                    </span>
                    {!alert.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] shrink-0" />}
                  </div>
                  <p className="text-[13px] text-zinc-600 group-hover:text-zinc-500 transition-colors leading-relaxed">
                    {alert.body}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] text-zinc-700">{formatTime(alert.createdAt)}</span>
                  {alert.linkAction && (
                    <Link to={alert.linkAction} onClick={e => e.stopPropagation()}
                      className="w-7 h-7 rounded-lg border border-white/[0.07] flex items-center justify-center text-zinc-600 hover:text-[#f5a623] hover:border-[#f5a623]/20 transition-colors opacity-0 group-hover:opacity-100">
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="flex justify-center pt-10">
          <button className="px-6 py-2 rounded-lg border border-white/[0.07] text-[12px] text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors">
            Load older
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;

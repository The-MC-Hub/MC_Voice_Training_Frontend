import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, CheckCircle, XCircle, ShieldAlert, ShieldCheck, Eye, Loader2,
  UserPlus, Mail, Key, Trash2, X, BarChart2, Bell, User as UserIcon,
  TrendingUp, Zap, Clock, Award, Send, Sparkles, ChevronRight,
} from "lucide-react";
import { getMCProfile } from "../../../services/publicService";
import api from "../../../services/api";

const fmtDate = (v) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return "—"; }
};
const fmtDateTime = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
};
const fmtScore = (v) => v != null ? Math.round(v * 10) / 10 : 0;

const AVATAR_COLORS = [
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-orange-100 text-orange-700",
];
const avatarColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};
const isEmoji = (s) => s && [...s].length === 1 && s.codePointAt(0) > 127;

const ROLE_BADGE = {
  admin:  "bg-violet-100 text-violet-700 border-violet-200",
  mc:     "bg-amber-100 text-amber-700 border-amber-200",
  client: "bg-sky-100 text-sky-700 border-sky-200",
};
const PLAN_BADGE = {
  FREE:   "bg-gray-100 text-gray-500 border-gray-200",
  BASIC:  "bg-blue-100 text-blue-700 border-blue-200",
  FULL:   "bg-amber-100 text-amber-700 border-amber-200",
  ANNUAL: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const Badge = ({ cls, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-md ${cls}`}>
    {children}
  </span>
);

const StatCard = ({ label, value, sub, color = "text-gray-900" }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4">
    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-[22px] font-bold tabular-nums leading-none ${color}`}>{value}</p>
    {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
  </div>
);

const TIER_COLOR = {
  BRONZE: "text-orange-600 bg-orange-50 border-orange-200",
  SILVER: "text-gray-500 bg-gray-50 border-gray-200",
  GOLD: "text-amber-600 bg-amber-50 border-amber-200",
  PLATINUM: "text-cyan-600 bg-cyan-50 border-cyan-200",
  DIAMOND: "text-blue-600 bg-blue-50 border-blue-200",
  ELITE_LEGEND: "text-violet-600 bg-violet-50 border-violet-200",
};

// Smart notification suggestions
const buildSuggestions = (stats) => {
  if (!stats) return [];
  const suggestions = [];
  const now = Date.now();

  // Last login check
  if (stats.lastLoginAt) {
    const daysSinceLogin = Math.floor((now - new Date(stats.lastLoginAt).getTime()) / 86400000);
    if (daysSinceLogin > 14) {
      suggestions.push({
        id: "inactive",
        icon: "😴",
        label: `Lâu rồi chưa đăng nhập (${daysSinceLogin} ngày)`,
        subject: "Chúng tôi nhớ bạn! — MCHub Voice Training",
        content: `Xin chào ${stats.userName},\n\nChúng tôi nhận thấy bạn chưa đăng nhập MCHub Voice Training trong ${daysSinceLogin} ngày qua.\n\nHãy quay lại luyện tập hôm nay — mỗi ngày 15 phút sẽ giúp bạn cải thiện đáng kể giọng MC chuyên nghiệp!\n\nTruy cập: https://mchub.vn\n\nMCHub Team`,
      });
    }
  }

  // High sessions
  if (stats.totalSessions > 20) {
    suggestions.push({
      id: "active_learner",
      icon: "🔥",
      label: `Học viên tích cực (${stats.totalSessions} buổi)`,
      subject: "Bạn đang tiến bộ rất nhanh! — MCHub",
      content: `Xin chào ${stats.userName},\n\nBạn đã hoàn thành ${stats.totalSessions} buổi luyện tập — thật tuyệt vời!\n\nĐiểm trung bình của bạn là ${fmtScore(stats.avgScore)}/100. Hãy tiếp tục duy trì phong độ này.\n\nNếu bạn cần tư vấn thêm về lộ trình phát triển MC, đội ngũ MCHub luôn sẵn sàng hỗ trợ.\n\nMCHub Team`,
    });
  }

  // Low score encouragement
  if (stats.totalSessions > 3 && stats.avgScore < 65) {
    suggestions.push({
      id: "low_score",
      icon: "💪",
      label: `Điểm trung bình thấp (${fmtScore(stats.avgScore)}/100)`,
      subject: "Mẹo cải thiện giọng nói MC — MCHub",
      content: `Xin chào ${stats.userName},\n\nChúng tôi nhận thấy bạn đang nỗ lực luyện tập. Điểm trung bình hiện tại: ${fmtScore(stats.avgScore)}/100.\n\nMột số mẹo để cải thiện:\n• Luyện tập đều đặn mỗi ngày, ít nhất 10 phút\n• Tập trung vào bài học nhịp điệu và ngữ điệu\n• Nghe lại bản ghi âm để tự đánh giá\n\nChúc bạn sớm đạt điểm cao!\n\nMCHub Team`,
    });
  }

  // High score praise
  if (stats.avgScore >= 85 && stats.totalSessions > 5) {
    suggestions.push({
      id: "high_score",
      icon: "⭐",
      label: `Điểm xuất sắc (${fmtScore(stats.avgScore)}/100)`,
      subject: "Chúc mừng thành tích của bạn! — MCHub",
      content: `Xin chào ${stats.userName},\n\nBạn đang đạt điểm trung bình ${fmtScore(stats.avgScore)}/100 — thuộc nhóm top học viên trên nền tảng!\n\nMCHub trân trọng sự nỗ lực của bạn. Hãy chia sẻ hành trình của bạn với cộng đồng MC để truyền cảm hứng cho những người khác nhé.\n\nMCHub Team`,
    });
  }

  // Streak encouragement
  if (stats.currentStreak >= 3) {
    suggestions.push({
      id: "streak",
      icon: "🏆",
      label: `Chuỗi ${stats.currentStreak} ngày liên tiếp`,
      subject: `Chuỗi ${stats.currentStreak} ngày — Tiếp tục phá vỡ giới hạn!`,
      content: `Xin chào ${stats.userName},\n\nBạn đang có chuỗi luyện tập ${stats.currentStreak} ngày liên tiếp — thật ấn tượng!\n\nKỷ lục cá nhân của bạn là ${stats.longestStreak} ngày. Hãy tiếp tục duy trì để phá kỷ lục nhé!\n\nMCHub Team`,
    });
  }

  // Plan upgrade suggestion
  if (stats.plan === "FREE") {
    suggestions.push({
      id: "upgrade",
      icon: "🚀",
      label: "Đang dùng gói FREE — gợi ý nâng cấp",
      subject: "Mở khóa toàn bộ tính năng MCHub",
      content: `Xin chào ${stats.userName},\n\nBạn đang sử dụng gói FREE của MCHub. Để tận dụng toàn bộ bài học, phân tích AI nâng cao và không giới hạn buổi luyện tập, hãy khám phá các gói Premium của chúng tôi.\n\nXem chi tiết tại: https://mchub.vn/pricing\n\nMCHub Team`,
    });
  }

  return suggestions;
};

// ── Side Panel ─────────────────────────────────────────────────────────────────
const UserPanel = ({ user, onClose, onRefresh, handleVerify, handleSuspend }) => {
  const [tab, setTab] = useState("info"); // info | stats | notify
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [mcProfile, setMcProfile] = useState(null);

  // Notify state
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyContent, setNotifyContent] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState("");

  const flashNotify = (msg) => { setNotifyMsg(msg); setTimeout(() => setNotifyMsg(""), 3500); };

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get(`/admin/users/${user._id}/stats`);
      setStats(res.data.data);
    } catch {}
    finally { setStatsLoading(false); }
  }, [user._id]);

  useEffect(() => {
    setTab("info");
    setStats(null);
    setMcProfile(null);
    setNotifySubject(""); setNotifyContent(""); setNotifyMsg("");

    if ((user.role || "").toLowerCase() === "mc") {
      getMCProfile(user._id).then(d => { if (d?.profile) setMcProfile(d.profile); }).catch(() => {});
    }
  }, [user._id, user.role]);

  useEffect(() => {
    if (tab === "stats" && !stats) loadStats();
  }, [tab, stats, loadStats]);

  const applySuggestion = (s) => {
    setNotifySubject(s.subject);
    setNotifyContent(s.content);
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    if (!notifySubject.trim() || !notifyContent.trim()) return;
    setNotifyLoading(true);
    try {
      await api.post(`/admin/users/${user._id}/notify-email`, { subject: notifySubject, content: notifyContent });
      flashNotify("✓ Email đã được gửi thành công.");
    } catch (err) {
      flashNotify("✗ " + (err.response?.data?.message || "Gửi email thất bại."));
    } finally {
      setNotifyLoading(false);
    }
  };

  const roleCls = (role) => ROLE_BADGE[(role || "client").toLowerCase()] || ROLE_BADGE.client;
  const suggestions = buildSuggestions(stats);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          {isEmoji(user.avatar) ? (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl bg-gray-100 border border-gray-200 shrink-0">
              {user.avatar}
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] border shrink-0 ${avatarColor(user.name)}`}>
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <p className="text-[14px] font-semibold text-gray-900 leading-tight">{user.name || "—"}</p>
            <p className="text-[11px] text-gray-400 font-mono">{user.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 shrink-0">
        {[
          { id: "info", icon: UserIcon, label: "Thông tin" },
          { id: "stats", icon: BarChart2, label: "Thống kê" },
          { id: "notify", icon: Bell, label: "Thông báo" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-medium transition-all border-b-2 ${
              tab === id
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Info tab ─────────────────────────────────────────────── */}
        {tab === "info" && (
          <div className="p-5 space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <Badge cls={roleCls(user.role)}>{(user.role || "CLIENT").toUpperCase()}</Badge>
              <Badge cls={PLAN_BADGE[user.plan] || PLAN_BADGE.FREE}>{user.plan || "FREE"}</Badge>
              {user.isActive
                ? <Badge cls="bg-emerald-50 text-emerald-600 border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hoạt động</Badge>
                : <Badge cls="bg-red-50 text-red-600 border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Bị khóa</Badge>
              }
              {user.isVerified && <Badge cls="bg-emerald-50 text-emerald-700 border-emerald-200"><ShieldCheck size={10} /> Certified</Badge>}
            </div>

            {/* Fields */}
            <div className="space-y-2">
              {[
                ["User ID", user._id, true],
                ["Email", user.email, false],
                ["Số điện thoại", user.phoneNumber, false],
                ["Ngày đăng ký", fmtDate(user.createdAt), false],
                ["AI Sessions đã dùng", user.aiSessionsUsed || 0, true],
                ["Hết hạn gói", fmtDate(user.planExpiresAt), false],
              ].map(([label, value, mono]) => (
                <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className={`text-gray-900 text-[12px] font-medium ${mono ? "font-mono text-[11px]" : ""}`}>{value || "—"}</p>
                </div>
              ))}
            </div>

            {/* MC Profile */}
            {user.role?.toLowerCase() === "mc" && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Hồ sơ MC</p>
                {!mcProfile ? (
                  <p className="text-[12px] text-gray-400 italic">Chưa có hồ sơ MC.</p>
                ) : (
                  <div className="space-y-2">
                    {[
                      ["Tên nghệ danh", mcProfile.stageName || user.name],
                      ["Địa điểm", mcProfile.location],
                      ["Kinh nghiệm", mcProfile.experience ? `${mcProfile.experience} năm` : null],
                      ["Mức giá", mcProfile.rates?.min ? `${mcProfile.rates.min.toLocaleString("vi-VN")} VND` : null],
                    ].map(([l, v]) => v ? (
                      <div key={l} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">{l}</p>
                        <p className="text-gray-900 text-[12px] font-medium">{v}</p>
                      </div>
                    ) : null)}
                    {mcProfile.specialties?.length > 0 && (
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5">Chuyên môn</p>
                        <div className="flex flex-wrap gap-1">
                          {mcProfile.specialties.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-white border border-gray-200 text-[10px] text-gray-700 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick actions */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Thao tác nhanh</p>
              {user.role?.toLowerCase() === "mc" && (
                <button onClick={() => handleVerify(user._id, user.isVerified)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-[12px] font-medium border border-gray-200 hover:border-amber-300 hover:bg-amber-50 rounded-lg transition-colors text-gray-700">
                  <span className="flex items-center gap-2"><ShieldAlert size={13} />{user.isVerified ? "Thu hồi chứng nhận" : "Cấp chứng nhận MC"}</span>
                  <ChevronRight size={12} className="text-gray-400" />
                </button>
              )}
              <button onClick={() => handleSuspend(user._id, user.isActive)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-[12px] font-medium border border-gray-200 hover:border-gray-400 rounded-lg transition-colors text-gray-700">
                <span className="flex items-center gap-2">{user.isActive ? <XCircle size={13} /> : <CheckCircle size={13} />}{user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}</span>
                <ChevronRight size={12} className="text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* ── Stats tab ────────────────────────────────────────────── */}
        {tab === "stats" && (
          <div className="p-5">
            {statsLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[12px]">Đang tải thống kê...</span>
              </div>
            ) : !stats ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BarChart2 size={32} className="text-gray-200" />
                <p className="text-[12px] text-gray-400">Không có dữ liệu thống kê</p>
                <button onClick={loadStats} className="px-4 py-2 bg-amber-500 text-white text-[11px] font-semibold rounded-lg hover:bg-amber-600">Tải lại</button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Tier badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border rounded-full ${TIER_COLOR[stats.currentTier] || TIER_COLOR.BRONZE}`}>
                    <Award size={11} /> {stats.currentTier || "BRONZE"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    <span className="font-semibold text-amber-600">{Math.round(stats.cumulativeXP || 0)}</span> XP tổng
                  </span>
                </div>

                {/* Key stats grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <StatCard label="Tổng buổi luyện" value={stats.totalSessions} color="text-gray-900" />
                  <StatCard label="Điểm trung bình" value={fmtScore(stats.avgScore)} sub="/100" color={stats.avgScore >= 80 ? "text-emerald-600" : stats.avgScore >= 60 ? "text-amber-600" : "text-red-500"} />
                  <StatCard label="Điểm cao nhất" value={fmtScore(stats.bestScore)} sub="/100" color="text-violet-600" />
                  <StatCard label="AI Sessions" value={stats.aiSessionsUsed || 0} color="text-sky-600" />
                  <StatCard label="Chuỗi hiện tại" value={`${stats.currentStreak}🔥`} sub={`Kỷ lục: ${stats.longestStreak} ngày`} />
                  <StatCard label="Tuần này" value={`${Math.round(stats.weeklyXP || 0)} XP`} color="text-amber-600" />
                </div>

                {/* Last practice */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Clock size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Lần luyện cuối</p>
                    <p className="text-[12px] font-medium text-gray-700">{fmtDateTime(stats.lastPracticeTime)}</p>
                  </div>
                </div>

                {/* Practice hours */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <TrendingUp size={14} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-amber-600 uppercase tracking-wider">Tổng giờ luyện tập</p>
                    <p className="text-[18px] font-bold text-amber-700">{(stats.totalPracticeHours || 0).toFixed(1)} giờ</p>
                  </div>
                </div>

                {/* Recent sessions */}
                {stats.recentSessions?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">5 buổi gần nhất</p>
                    <div className="space-y-2">
                      {stats.recentSessions.map((s, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-lg px-3 py-2.5 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-gray-500 font-mono">{s.lessonId?.slice(-8) || "—"}</p>
                            <p className="text-[10px] text-gray-400">{fmtDate(s.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-[16px] font-bold tabular-nums ${fmtScore(s.overallScore) >= 80 ? "text-emerald-600" : fmtScore(s.overallScore) >= 60 ? "text-amber-600" : "text-red-500"}`}>
                              {fmtScore(s.overallScore)}
                            </p>
                            <p className="text-[9px] text-gray-400">/ 100</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Notify tab ───────────────────────────────────────────── */}
        {tab === "notify" && (
          <div className="p-5 space-y-4">
            {/* Load stats if needed for suggestions */}
            {!stats && !statsLoading && (
              <button onClick={loadStats} className="w-full py-2 text-[11px] text-amber-600 border border-dashed border-amber-200 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5">
                <Sparkles size={11} /> Tải thống kê để nhận gợi ý thông minh
              </button>
            )}

            {/* Smart suggestions */}
            {stats && suggestions.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Gợi ý thông minh</p>
                <div className="space-y-1.5">
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => applySuggestion(s)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-100 hover:border-amber-300 hover:bg-amber-50 rounded-lg transition-all text-left group"
                    >
                      <span className="text-base shrink-0">{s.icon}</span>
                      <span className="text-[11px] text-gray-600 group-hover:text-amber-700 flex-1 leading-snug">{s.label}</span>
                      <ChevronRight size={11} className="text-gray-300 group-hover:text-amber-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {statsLoading && (
              <div className="flex items-center gap-2 py-3 text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[11px]">Đang phân tích...</span>
              </div>
            )}

            {/* Compose form */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Soạn email</p>
              <form onSubmit={sendNotification} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề</label>
                  <input
                    type="text" value={notifySubject} onChange={e => setNotifySubject(e.target.value)}
                    placeholder="Chủ đề email..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[12px] focus:outline-none focus:border-amber-400 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Nội dung</label>
                  <textarea
                    value={notifyContent} onChange={e => setNotifyContent(e.target.value)}
                    placeholder="Nội dung email..."
                    rows={8}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[12px] focus:outline-none focus:border-amber-400 text-gray-900 placeholder:text-gray-400 resize-none leading-relaxed"
                    required
                  />
                </div>

                {notifyMsg && (
                  <div className={`text-[12px] px-3 py-2 rounded-lg border ${notifyMsg.startsWith("✓") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                    {notifyMsg}
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 flex items-start gap-2">
                  <Mail size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Email sẽ được gửi đến <strong>{user.email}</strong>
                  </p>
                </div>

                <button
                  type="submit" disabled={notifyLoading || !notifySubject.trim() || !notifyContent.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg disabled:opacity-50 transition-colors"
                >
                  {notifyLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {notifyLoading ? "Đang gửi..." : "Gửi email"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const UserManagement = ({ users, handleVerify, handleSuspend, onRefresh }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("ALL");
  const [selectedUser, setSelectedUser] = React.useState(null);

  // Add user modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "CLIENT" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Change password modal
  const [pwdModal, setPwdModal] = useState(null);
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const [actionMsg, setActionMsg] = useState("");
  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

  const [panelWidth, setPanelWidth] = useState(380);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onDragStart = useCallback((e) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [panelWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      const next = Math.min(600, Math.max(280, startWidth.current + delta));
      setPanelWidth(next);
    };
    const onUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!addForm.name || !addForm.email || !addForm.password) { setAddError("Vui lòng điền đầy đủ thông tin."); return; }
    setAddLoading(true);
    try {
      await api.post("/admin/users", addForm);
      setShowAddModal(false);
      setAddForm({ name: "", email: "", password: "", role: "CLIENT" });
      flash("Đã tạo tài khoản thành công.");
      onRefresh?.();
    } catch (err) {
      setAddError(err.response?.data?.message || "Tạo tài khoản thất bại.");
    } finally { setAddLoading(false); }
  };

  const handleSendResetEmail = async (userId, userName) => {
    try {
      await api.post(`/admin/users/${userId}/send-reset-email`);
      flash(`Đã gửi email đặt lại mật khẩu cho ${userName}.`);
    } catch (err) {
      flash(`Lỗi: ${err.response?.data?.message || "Không thể gửi email."}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError("");
    if (!newPwd || newPwd.length < 6) { setPwdError("Mật khẩu tối thiểu 6 ký tự."); return; }
    setPwdLoading(true);
    try {
      await api.post(`/admin/users/${pwdModal}/change-password`, { newPassword: newPwd });
      setPwdModal(null); setNewPwd("");
      flash("Đã đổi mật khẩu thành công.");
    } catch (err) {
      setPwdError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally { setPwdLoading(false); }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Xóa tài khoản "${userName}"? Hành động không thể hoàn tác.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      flash(`Đã xóa tài khoản ${userName}.`);
      if (selectedUser?._id === userId) setSelectedUser(null);
      onRefresh?.();
    } catch (err) {
      flash(`Lỗi: ${err.response?.data?.message || "Không thể xóa tài khoản."}`);
    }
  };

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setSelectedUser(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const filtered = React.useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const q = searchTerm.toLowerCase();
      const matchQ = !q
        || (u.name || "").toLowerCase().includes(q)
        || (u.email || "").toLowerCase().includes(q)
        || (u.phoneNumber || "").includes(q);
      const matchRole = filterRole === "ALL" || (u.role || "").toLowerCase() === filterRole.toLowerCase();
      return matchQ && matchRole;
    });
  }, [users, searchTerm, filterRole]);

  const counts = React.useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, u) => {
      const r = (u.role || "client").toLowerCase();
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  const roleCls = (role) => ROLE_BADGE[(role || "client").toLowerCase()] || ROLE_BADGE.client;

  return (
    <div className="flex gap-0 w-full min-h-0" style={{ height: "calc(100vh - 8rem)" }}>

      {/* ── Left: table area ─────────────────────────────────────── */}
      <div className={`flex flex-col min-w-0 transition-all duration-300 ${selectedUser ? "flex-1" : "w-full"}`}>

        {/* Flash */}
        {actionMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] px-4 py-3 rounded-xl shrink-0">
            {actionMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 shrink-0">
          <div>
            <h2 className="text-[16px] font-semibold text-gray-900">Quản lý người dùng</h2>
            <p className="text-[12px] text-gray-400 mt-1">
              Tổng <span className="font-semibold text-gray-700">{users?.length ?? 0}</span> tài khoản
              &nbsp;·&nbsp; <span className="font-medium text-amber-600">{counts.mc ?? 0} MC</span>
              &nbsp;·&nbsp; <span className="font-medium text-sky-600">{counts.client ?? 0} Client</span>
              &nbsp;·&nbsp; <span className="font-medium text-violet-600">{counts.admin ?? 0} Admin</span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text" placeholder="Tìm theo tên, email..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-[13px] focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 placeholder:text-gray-400 shadow-sm"
              />
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg transition-colors shrink-0">
              <UserPlus size={13} /> Thêm
            </button>
          </div>
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-2 flex-wrap pb-3 shrink-0">
          {[
            { key: "ALL", label: "Tất cả", count: users?.length ?? 0 },
            { key: "ADMIN", label: "Admin", count: counts.admin ?? 0 },
            { key: "MC", label: "MC", count: counts.mc ?? 0 },
            { key: "CLIENT", label: "Client", count: counts.client ?? 0 },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilterRole(key)}
              className={`px-3.5 py-1.5 text-[12px] font-semibold border transition-all rounded-lg ${
                filterRole === key ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-500 border-gray-200 hover:border-amber-300"
              }`}>
              {label} <span className={`ml-1 text-[11px] ${filterRole === key ? "opacity-80" : "text-gray-400"}`}>({count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 overflow-auto rounded-xl shadow-sm flex-1">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider sticky top-0">
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Gói</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-[13px]">Không tìm thấy người dùng</td></tr>
              )}
              {filtered.map(u => {
                const isSelected = selectedUser?._id === u._id;
                return (
                  <tr key={u._id}
                    onClick={() => setSelectedUser(isSelected ? null : u)}
                    className={`transition-colors cursor-pointer ${isSelected ? "bg-amber-50 border-l-2 border-l-amber-400" : "hover:bg-amber-50/40"}`}>
                    {/* User info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {isEmoji(u.avatar) ? (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-gray-100 border border-gray-200 shrink-0">{u.avatar}</div>
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] border shrink-0 ${avatarColor(u.name)}`}>
                            {u.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-900 block text-[12px] truncate">{u.name || "—"}</span>
                          <span className="text-[10px] text-gray-400 font-mono truncate block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge cls={roleCls(u.role)}>{(u.role || "CLIENT").toUpperCase()}</Badge></td>
                    <td className="px-4 py-3"><Badge cls={PLAN_BADGE[u.plan] || PLAN_BADGE.FREE}>{u.plan || "FREE"}</Badge></td>
                    <td className="px-4 py-3"><span className="font-mono text-[11px] text-gray-600">{u.aiSessionsUsed || 0}</span></td>
                    <td className="px-4 py-3">
                      {u.isActive
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</span>
                        : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Locked</span>
                      }
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 flex-wrap">
                        <button onClick={() => setSelectedUser(isSelected ? null : u)} title="Xem chi tiết"
                          className={`p-1.5 border transition-colors rounded ${isSelected ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-white text-gray-400 hover:text-gray-700 border-gray-200"}`}>
                          <Eye size={12} />
                        </button>
                        <button onClick={() => handleSendResetEmail(u._id, u.name)} title="Gửi email reset"
                          className="p-1.5 bg-white text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-colors rounded">
                          <Mail size={12} />
                        </button>
                        <button onClick={() => { setPwdModal(u._id); setNewPwd(""); setPwdError(""); }} title="Đổi mật khẩu"
                          className="p-1.5 bg-white text-gray-400 hover:text-amber-600 border border-gray-200 hover:border-amber-300 transition-colors rounded">
                          <Key size={12} />
                        </button>
                        {u.role?.toLowerCase() === "mc" && (
                          <button onClick={() => handleVerify(u._id, u.isVerified)} title={u.isVerified ? "Thu hồi" : "Chứng nhận"}
                            className={`p-1.5 border transition-colors rounded ${u.isVerified ? "bg-white text-gray-400 border-gray-200" : "bg-gray-800 text-white border-gray-800"}`}>
                            <ShieldAlert size={12} />
                          </button>
                        )}
                        <button onClick={() => handleSuspend(u._id, u.isActive)} title={u.isActive ? "Khóa" : "Mở khóa"}
                          className="p-1.5 bg-white text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 transition-colors rounded">
                          {u.isActive ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        </button>
                        <button onClick={() => handleDeleteUser(u._id, u.name)} title="Xóa"
                          className="p-1.5 bg-white text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-300 transition-colors rounded">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right: User Panel (split-screen) ─────────────────────── */}
      {selectedUser && (
        <>
          {/* Drag handle */}
          <div
            onMouseDown={onDragStart}
            className="w-1.5 shrink-0 cursor-col-resize bg-transparent hover:bg-amber-300/60 active:bg-amber-400/80 transition-colors relative group"
            style={{ height: "calc(100vh - 8rem)" }}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 group-hover:bg-amber-300 transition-colors" />
          </div>

          <div className="shrink-0 border-l border-gray-200 overflow-hidden" style={{ width: panelWidth, height: "calc(100vh - 8rem)" }}>
            <UserPanel
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onRefresh={onRefresh}
              handleVerify={(id, cur) => { handleVerify(id, cur); onRefresh?.(); }}
              handleSuspend={(id, cur) => { handleSuspend(id, cur); onRefresh?.(); }}
            />
          </div>
        </>
      )}

      {/* ── Add User Modal ────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-gray-200 w-full max-w-md shadow-xl rounded-xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-900">Thêm tài khoản mới</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddUser} className="px-6 py-5 space-y-4">
              {addError && <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-lg p-3">{addError}</div>}
              {[["Tên hiển thị", "name", "text", "Nguyễn Văn A"], ["Email", "email", "email", "user@example.com"], ["Mật khẩu", "password", "password", "Tối thiểu 6 ký tự"]].map(([label, key, type, ph]) => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
                  <input type={type} value={addForm[key]} onChange={e => setAddForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-amber-400" placeholder={ph} required />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vai trò</label>
                <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-amber-400 bg-white">
                  <option value="CLIENT">Client</option>
                  <option value="MC">MC</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-[12px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={addLoading} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg disabled:opacity-50">
                  {addLoading ? "Đang tạo..." : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ─────────────────────────────────── */}
      {pwdModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-gray-200 w-full max-w-sm shadow-xl rounded-xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-900">Đổi mật khẩu</h2>
              <button onClick={() => setPwdModal(null)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
              {pwdError && <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-lg p-3">{pwdError}</div>}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Mật khẩu mới</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-amber-400" placeholder="Tối thiểu 6 ký tự" required />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setPwdModal(null)} className="px-4 py-2 text-[12px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={pwdLoading} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg disabled:opacity-50">
                  {pwdLoading ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

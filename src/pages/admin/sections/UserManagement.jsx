import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Search, CheckCircle, XCircle, ShieldAlert, ShieldCheck, Eye, Loader2,
  UserPlus, Mail, Key, Trash2, X, BarChart2, Bell, User as UserIcon,
  TrendingUp, Zap, Clock, Award, Send, Sparkles, ChevronRight, RefreshCw,
} from "lucide-react";
import { getMCProfile } from "../../../services/publicService";
import api from "../../../services/api";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/animate-ui/components/radix/dialog";
import { Input } from "@/components/ui/input";

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
const buildSuggestions = (stats, t) => {
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
        label: t("admin.userManagement.suggestions.inactiveLabel", { days: daysSinceLogin }),
        subject: t("admin.userManagement.suggestions.inactiveSubject"),
        content: t("admin.userManagement.suggestions.inactiveContent", { name: stats.userName, days: daysSinceLogin }),
      });
    }
  }

  // High sessions
  if (stats.totalSessions > 20) {
    suggestions.push({
      id: "active_learner",
      icon: "🔥",
      label: t("admin.userManagement.suggestions.activeLearnerLabel", { count: stats.totalSessions }),
      subject: t("admin.userManagement.suggestions.activeLearnerSubject"),
      content: t("admin.userManagement.suggestions.activeLearnerContent", { name: stats.userName, count: stats.totalSessions, score: fmtScore(stats.avgScore) }),
    });
  }

  // Low score encouragement
  if (stats.totalSessions > 3 && stats.avgScore < 65) {
    suggestions.push({
      id: "low_score",
      icon: "💪",
      label: t("admin.userManagement.suggestions.lowScoreLabel", { score: fmtScore(stats.avgScore) }),
      subject: t("admin.userManagement.suggestions.lowScoreSubject"),
      content: t("admin.userManagement.suggestions.lowScoreContent", { name: stats.userName, score: fmtScore(stats.avgScore) }),
    });
  }

  // High score praise
  if (stats.avgScore >= 85 && stats.totalSessions > 5) {
    suggestions.push({
      id: "high_score",
      icon: "⭐",
      label: t("admin.userManagement.suggestions.highScoreLabel", { score: fmtScore(stats.avgScore) }),
      subject: t("admin.userManagement.suggestions.highScoreSubject"),
      content: t("admin.userManagement.suggestions.highScoreContent", { name: stats.userName, score: fmtScore(stats.avgScore) }),
    });
  }

  // Streak encouragement
  if (stats.currentStreak >= 3) {
    suggestions.push({
      id: "streak",
      icon: "🏆",
      label: t("admin.userManagement.suggestions.streakLabel", { count: stats.currentStreak }),
      subject: t("admin.userManagement.suggestions.streakSubject", { count: stats.currentStreak }),
      content: t("admin.userManagement.suggestions.streakContent", { name: stats.userName, count: stats.currentStreak, longest: stats.longestStreak }),
    });
  }

  // Plan upgrade suggestion
  if (stats.plan === "FREE") {
    suggestions.push({
      id: "upgrade",
      icon: "🚀",
      label: t("admin.userManagement.suggestions.upgradeLabel"),
      subject: t("admin.userManagement.suggestions.upgradeSubject"),
      content: t("admin.userManagement.suggestions.upgradeContent", { name: stats.userName }),
    });
  }

  return suggestions;
};

// ── Side Panel ─────────────────────────────────────────────────────────────────
const UserPanel = ({ user, onClose, onRefresh, handleVerify, handleSuspend }) => {
  const { t } = useTranslation();
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
      await api.post("/admin/announcements", {
        title: notifySubject,
        emailSubject: notifySubject,
        content: notifyContent,
        type: "GENERAL",
        targetPlans: [],
        recipientIds: [user._id || user.id],
      });
      flashNotify(t("admin.userManagement.draftCreatedFlash"));
      setNotifySubject("");
      setNotifyContent("");
    } catch (err) {
      flashNotify("✗ " + (err.response?.data?.message || t("admin.userManagement.createFailed")));
    } finally {
      setNotifyLoading(false);
    }
  };

  const roleCls = (role) => ROLE_BADGE[(role || "client").toLowerCase()] || ROLE_BADGE.client;
  const suggestions = buildSuggestions(stats, t);

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
        <Button onClick={onClose} className="h-auto p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={16} />
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 shrink-0">
        {[
          { id: "info", icon: UserIcon, label: t("admin.userManagement.tabInfo") },
          { id: "stats", icon: BarChart2, label: t("admin.userManagement.tabStats") },
          { id: "notify", icon: Bell, label: t("admin.userManagement.tabNotify") },
        ].map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            onClick={() => setTab(id)}
            hoverScale={1}
            className={`h-auto flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-medium transition-all border-b-2 ${
              tab === id
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon size={13} />
            {label}
          </Button>
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
                ? <Badge cls="bg-emerald-50 text-emerald-600 border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t("admin.userManagement.active")}</Badge>
                : <Badge cls="bg-red-50 text-red-600 border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {t("admin.userManagement.locked")}</Badge>
              }
              {user.isVerified && <Badge cls="bg-emerald-50 text-emerald-700 border-emerald-200"><ShieldCheck size={10} /> {t("admin.userManagement.certified")}</Badge>}
            </div>

            {/* Fields */}
            <div className="space-y-2">
              {[
                ["User ID", user._id, true],
                [t("admin.userManagement.email"), user.email, false],
                [t("admin.userManagement.phoneNumber"), user.phoneNumber, false],
                [t("admin.userManagement.registeredAt"), fmtDate(user.createdAt), false],
                [t("admin.userManagement.aiSessionsUsed"), user.aiSessionsUsed || 0, true],
                [t("admin.userManagement.planExpiresAt"), fmtDate(user.planExpiresAt), false],
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
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">{t("admin.userManagement.mcProfile")}</p>
                {!mcProfile ? (
                  <p className="text-[12px] text-gray-400 italic">{t("admin.userManagement.noMcProfile")}</p>
                ) : (
                  <div className="space-y-2">
                    {[
                      [t("admin.userManagement.stageName"), mcProfile.stageName || user.name],
                      [t("admin.userManagement.location"), mcProfile.location],
                      [t("admin.userManagement.experience"), mcProfile.experience ? t("admin.userManagement.yearsUnit", { count: mcProfile.experience }) : null],
                      [t("admin.userManagement.rate"), mcProfile.rates?.min ? `${mcProfile.rates.min.toLocaleString("vi-VN")} VND` : null],
                    ].map(([l, v]) => v ? (
                      <div key={l} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">{l}</p>
                        <p className="text-gray-900 text-[12px] font-medium">{v}</p>
                      </div>
                    ) : null)}
                    {mcProfile.specialties?.length > 0 && (
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5">{t("admin.userManagement.specialties")}</p>
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
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{t("admin.userManagement.quickActions")}</p>
              {user.role?.toLowerCase() === "mc" && (
                <Button onClick={() => handleVerify(user._id, user.isVerified)} hoverScale={1}
                  className="h-auto w-full flex items-center justify-between px-3 py-2.5 text-[12px] font-medium border border-gray-200 hover:border-amber-300 hover:bg-amber-50 rounded-lg transition-colors text-gray-700">
                  <span className="flex items-center gap-2"><ShieldAlert size={13} />{user.isVerified ? t("admin.userManagement.revokeCertification") : t("admin.userManagement.grantCertification")}</span>
                  <ChevronRight size={12} className="text-gray-400" />
                </Button>
              )}
              <Button onClick={() => handleSuspend(user._id, user.isActive)} hoverScale={1}
                className="h-auto w-full flex items-center justify-between px-3 py-2.5 text-[12px] font-medium border border-gray-200 hover:border-gray-400 rounded-lg transition-colors text-gray-700">
                <span className="flex items-center gap-2">{user.isActive ? <XCircle size={13} /> : <CheckCircle size={13} />}{user.isActive ? t("admin.userManagement.lockAccount") : t("admin.userManagement.unlockAccount")}</span>
                <ChevronRight size={12} className="text-gray-400" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Stats tab ────────────────────────────────────────────── */}
        {tab === "stats" && (
          <div className="p-5">
            {statsLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[12px]">{t("admin.userManagement.loadingStats")}</span>
              </div>
            ) : !stats ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BarChart2 size={32} className="text-gray-200" />
                <p className="text-[12px] text-gray-400">{t("admin.userManagement.noStatsData")}</p>
                <Button onClick={loadStats} className="h-auto px-4 py-2 bg-amber-500 text-white text-[11px] font-semibold rounded-lg hover:bg-amber-600">{t("admin.userManagement.reload")}</Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Tier badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border rounded-full ${TIER_COLOR[stats.currentTier] || TIER_COLOR.BRONZE}`}>
                    <Award size={11} /> {stats.currentTier || "BRONZE"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    <span className="font-semibold text-amber-600">{Math.round(stats.cumulativeXP || 0)}</span> {t("admin.userManagement.totalXp")}
                  </span>
                </div>

                {/* Key stats grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <StatCard label={t("admin.userManagement.totalSessions")} value={stats.totalSessions} color="text-gray-900" />
                  <StatCard label={t("admin.userManagement.avgScore")} value={fmtScore(stats.avgScore)} sub="/100" color={stats.avgScore >= 80 ? "text-emerald-600" : stats.avgScore >= 60 ? "text-amber-600" : "text-red-500"} />
                  <StatCard label={t("admin.userManagement.bestScore")} value={fmtScore(stats.bestScore)} sub="/100" color="text-violet-600" />
                  <StatCard label="AI Sessions" value={stats.aiSessionsUsed || 0} color="text-sky-600" />
                  <StatCard label={t("admin.userManagement.currentStreak")} value={`${stats.currentStreak}🔥`} sub={t("admin.userManagement.recordDays", { count: stats.longestStreak })} />
                  <StatCard label={t("admin.userManagement.thisWeek")} value={`${Math.round(stats.weeklyXP || 0)} XP`} color="text-amber-600" />
                </div>

                {/* Last practice */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Clock size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t("admin.userManagement.lastPractice")}</p>
                    <p className="text-[12px] font-medium text-gray-700">{fmtDateTime(stats.lastPracticeTime)}</p>
                  </div>
                </div>

                {/* Practice hours */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <TrendingUp size={14} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-amber-600 uppercase tracking-wider">{t("admin.userManagement.totalPracticeHours")}</p>
                    <p className="text-[18px] font-bold text-amber-700">{t("admin.userManagement.hoursValue", { hours: (stats.totalPracticeHours || 0).toFixed(1) })}</p>
                  </div>
                </div>

                {/* Recent sessions */}
                {stats.recentSessions?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{t("admin.userManagement.last5Sessions")}</p>
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
              <Button onClick={loadStats} hoverScale={1} className="h-auto w-full py-2 text-[11px] text-amber-600 border border-dashed border-amber-200 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5">
                <Sparkles size={11} /> {t("admin.userManagement.loadStatsForSuggestions")}
              </Button>
            )}

            {/* Smart suggestions */}
            {stats && suggestions.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{t("admin.userManagement.smartSuggestions")}</p>
                <div className="space-y-1.5">
                  {suggestions.map(s => (
                    <Button
                      key={s.id}
                      onClick={() => applySuggestion(s)}
                      hoverScale={1}
                      className="h-auto w-full flex items-center gap-2.5 px-3 py-2.5 bg-white border border-gray-100 hover:border-amber-300 hover:bg-amber-50 rounded-lg transition-all text-left group"
                    >
                      <span className="text-base shrink-0">{s.icon}</span>
                      <span className="text-[11px] text-gray-600 group-hover:text-amber-700 flex-1 leading-snug">{s.label}</span>
                      <ChevronRight size={11} className="text-gray-300 group-hover:text-amber-400 shrink-0" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {statsLoading && (
              <div className="flex items-center gap-2 py-3 text-gray-400">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[11px]">{t("admin.userManagement.analyzing")}</span>
              </div>
            )}

            {/* Compose form */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">{t("admin.userManagement.composeEmail")}</p>
              <form onSubmit={sendNotification} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t("admin.userManagement.subject")}</label>
                  <Input
                    type="text" value={notifySubject} onChange={e => setNotifySubject(e.target.value)}
                    placeholder={t("admin.userManagement.emailSubjectPlaceholder")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[12px] focus:outline-none focus:border-amber-400 text-gray-900 placeholder:text-gray-400 h-auto focus-visible:ring-0"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t("admin.userManagement.content")}</label>
                  <textarea
                    value={notifyContent} onChange={e => setNotifyContent(e.target.value)}
                    placeholder={t("admin.userManagement.emailContentPlaceholder")}
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
                    {t("admin.userManagement.draftHintPrefix")} <strong>{user.email}</strong> · {t("admin.userManagement.draftHintSuffix")}
                  </p>
                </div>

                <Button
                  type="submit" disabled={notifyLoading || !notifySubject.trim() || !notifyContent.trim()}
                  hoverScale={1}
                  className="h-auto w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg disabled:opacity-50 transition-colors"
                >
                  {notifyLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {notifyLoading ? t("admin.userManagement.creating") : t("admin.userManagement.createDraft")}
                </Button>
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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("ALL");
  const [filterPlan, setFilterPlan] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState("newest");
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Auto-refresh on mount to pick up any new payments
  useEffect(() => { onRefresh?.(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await onRefresh?.(); } finally { setRefreshing(false); }
  };

  // Add user modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "CLIENT", phoneNumber: "", adminNote: "", plan: "", couponId: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [discounts, setDiscounts] = useState([]);
  const [discountsLoaded, setDiscountsLoaded] = useState(false);

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

  const openAddModal = async () => {
    setShowAddModal(true);
    if (!discountsLoaded) {
      try {
        const res = await api.get("/admin/plans/discounts");
        setDiscounts((res.data.data || []).filter(d => d.active));
        setDiscountsLoaded(true);
      } catch {}
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!addForm.name || !addForm.email || !addForm.password) { setAddError(t("admin.userManagement.fillAllFields")); return; }
    setAddLoading(true);
    try {
      const payload = { ...addForm };
      if (!payload.plan) delete payload.plan;
      if (!payload.couponId) delete payload.couponId;
      if (!payload.phoneNumber) delete payload.phoneNumber;
      if (!payload.adminNote) delete payload.adminNote;
      await api.post("/admin/users", payload);
      setShowAddModal(false);
      setAddForm({ name: "", email: "", password: "", role: "CLIENT", phoneNumber: "", adminNote: "", plan: "", couponId: "" });
      flash(t("admin.userManagement.createAccountSuccess"));
      onRefresh?.();
    } catch (err) {
      setAddError(err.response?.data?.message || t("admin.userManagement.createAccountFailed"));
    } finally { setAddLoading(false); }
  };

  const handleSendResetEmail = async (userId, userName) => {
    try {
      await api.post(`/admin/users/${userId}/send-reset-email`);
      flash(t("admin.userManagement.resetEmailSentFlash", { name: userName }));
    } catch (err) {
      flash(t("admin.userManagement.errorPrefix", { message: err.response?.data?.message || t("admin.userManagement.sendEmailFailed") }));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError("");
    if (!newPwd || newPwd.length < 6) { setPwdError(t("admin.userManagement.passwordMinLength")); return; }
    setPwdLoading(true);
    try {
      await api.post(`/admin/users/${pwdModal}/change-password`, { newPassword: newPwd });
      setPwdModal(null); setNewPwd("");
      flash(t("admin.userManagement.changePasswordSuccess"));
    } catch (err) {
      setPwdError(err.response?.data?.message || t("admin.userManagement.changePasswordFailed"));
    } finally { setPwdLoading(false); }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(t("admin.userManagement.confirmDisableAccount", { name: userName }))) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      flash(t("admin.userManagement.disableAccountSuccess", { name: userName }));
      if (selectedUser?._id === userId) setSelectedUser(null);
      onRefresh?.();
    } catch (err) {
      flash(t("admin.userManagement.errorPrefix", { message: err.response?.data?.message || t("admin.userManagement.disableAccountFailed") }));
    }
  };

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setSelectedUser(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const filtered = React.useMemo(() => {
    if (!users) return [];
    let list = users.filter(u => {
      const q = searchTerm.toLowerCase();
      const matchQ = !q
        || (u.name || "").toLowerCase().includes(q)
        || (u.email || "").toLowerCase().includes(q)
        || (u.phoneNumber || "").includes(q);
      const matchRole = filterRole === "ALL" || (u.role || "").toLowerCase() === filterRole.toLowerCase();
      const matchPlan = filterPlan === "ALL" || (u.plan || "FREE").toUpperCase() === filterPlan;
      return matchQ && matchRole && matchPlan;
    });
    if (sortBy === "name") list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sortBy === "sessions") list = [...list].sort((a, b) => (b.aiSessionsUsed || 0) - (a.aiSessionsUsed || 0));
    if (sortBy === "plan") {
      const ORDER = { ANNUAL: 0, FULL: 1, BASIC: 2, FREE: 3 };
      list = [...list].sort((a, b) => (ORDER[(a.plan || "FREE").toUpperCase()] ?? 9) - (ORDER[(b.plan || "FREE").toUpperCase()] ?? 9));
    }
    return list;
  }, [users, searchTerm, filterRole, filterPlan, sortBy]);

  const counts = React.useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, u) => {
      const r = (u.role || "client").toLowerCase();
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  const planCounts = React.useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, u) => {
      const p = (u.plan || "FREE").toUpperCase();
      acc[p] = (acc[p] || 0) + 1;
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
            <h2 className="text-[16px] font-semibold text-gray-900">{t("admin.userManagement.title")}</h2>
            <p className="text-[12px] text-gray-400 mt-1">
              {t("admin.userManagement.totalPrefix")} <span className="font-semibold text-gray-700">{users?.length ?? 0}</span> {t("admin.userManagement.accountsUnit")}
              &nbsp;·&nbsp; <span className="font-medium text-amber-600">{counts.mc ?? 0} MC</span>
              &nbsp;·&nbsp; <span className="font-medium text-sky-600">{counts.client ?? 0} Client</span>
              &nbsp;·&nbsp; <span className="font-medium text-violet-600">{counts.admin ?? 0} Admin</span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                type="text" placeholder={t("admin.userManagement.searchPlaceholder")}
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-[13px] focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 placeholder:text-gray-400 shadow-sm h-auto focus-visible:ring-0"
              />
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}
              className="h-auto flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 text-[12px] font-medium rounded-lg transition-colors shrink-0 disabled:opacity-50"
              title={t("admin.userManagement.refreshList")}>
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            </Button>
            <Button onClick={openAddModal}
              className="h-auto flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg transition-colors shrink-0">
              <UserPlus size={13} /> {t("admin.userManagement.add")}
            </Button>
          </div>
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-2 flex-wrap pb-3 shrink-0">
          {[
            { key: "ALL", label: t("admin.userManagement.all"), count: users?.length ?? 0 },
            { key: "ADMIN", label: "Admin", count: counts.admin ?? 0 },
            { key: "MC", label: "MC", count: counts.mc ?? 0 },
            { key: "CLIENT", label: "Client", count: counts.client ?? 0 },
          ].map(({ key, label, count }) => (
            <Button key={key} onClick={() => setFilterRole(key)}
              className={`h-auto px-3.5 py-1.5 text-[12px] font-semibold border transition-all rounded-lg ${
                filterRole === key ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-500 border-gray-200 hover:border-amber-300"
              }`}>
              {label} <span className={`ml-1 text-[11px] ${filterRole === key ? "opacity-80" : "text-gray-400"}`}>({count})</span>
            </Button>
          ))}
        </div>

        {/* Plan filter + Sort */}
        <div className="flex items-center justify-between gap-3 pb-3 shrink-0 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: "ALL", label: t("admin.userManagement.allPlans") },
              { key: "FREE", label: "Free" },
              { key: "BASIC", label: "Basic" },
              { key: "FULL", label: "Full" },
              { key: "ANNUAL", label: "Annual" },
            ].map(({ key, label }) => (
              <Button key={key} onClick={() => setFilterPlan(key)}
                className={`h-auto px-3 py-1 text-[11px] font-semibold border transition-all rounded-full ${
                  filterPlan === key
                    ? "bg-sky-500 text-white border-sky-500"
                    : "bg-white text-gray-500 border-gray-200 hover:border-sky-300"
                }`}>
                {label}{key !== "ALL" && planCounts[key] != null ? ` (${planCounts[key]})` : ""}
              </Button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-[12px] border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:border-amber-400 cursor-pointer shrink-0">
            <option value="newest">{t("admin.userManagement.sortNewest")}</option>
            <option value="name">{t("admin.userManagement.sortNameAZ")}</option>
            <option value="sessions">{t("admin.userManagement.sortSessions")}</option>
            <option value="plan">{t("admin.userManagement.sortHighestPlan")}</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 overflow-auto rounded-xl shadow-sm flex-1">
          <Table className="w-full text-left border-collapse text-[12px]">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 hover:bg-gray-50">
                <TableHead className="px-4 py-3 h-auto text-gray-500">{t("admin.userManagement.colUser")}</TableHead>
                <TableHead className="px-4 py-3 h-auto text-gray-500">{t("admin.userManagement.colRole")}</TableHead>
                <TableHead className="px-4 py-3 h-auto text-gray-500">{t("admin.userManagement.colPlan")}</TableHead>
                <TableHead className="px-4 py-3 h-auto text-gray-500">{t("admin.userManagement.colReferralCode")}</TableHead>
                <TableHead className="px-4 py-3 h-auto text-gray-500 text-center">{t("admin.userManagement.colReferred")}</TableHead>
                <TableHead className="px-4 py-3 h-auto text-gray-500">Sessions</TableHead>
                <TableHead className="px-4 py-3 h-auto text-gray-500">{t("admin.userManagement.colStatus")}</TableHead>
                <TableHead className="px-4 py-3 h-auto text-gray-500 text-right">{t("admin.userManagement.colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <TableRow className="hover:bg-transparent"><TableCell colSpan={8} className="px-6 py-12 text-center text-gray-400 text-[13px] whitespace-normal">{t("admin.userManagement.noUsersFound")}</TableCell></TableRow>
              )}
              {filtered.map(u => {
                const isSelected = selectedUser?._id === u._id;
                return (
                  <TableRow key={u._id}
                    onClick={() => setSelectedUser(isSelected ? null : u)}
                    className={`transition-colors cursor-pointer ${isSelected ? "bg-amber-50 border-l-2 border-l-amber-400 hover:bg-amber-50" : "hover:bg-amber-50/40"}`}>
                    {/* User info */}
                    <TableCell className="px-4 py-3 whitespace-normal">
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
                    </TableCell>
                    <TableCell className="px-4 py-3"><Badge cls={roleCls(u.role)}>{(u.role || "CLIENT").toUpperCase()}</Badge></TableCell>
                    <TableCell className="px-4 py-3"><Badge cls={PLAN_BADGE[u.plan] || PLAN_BADGE.FREE}>{u.plan || "FREE"}</Badge></TableCell>
                    <TableCell className="px-4 py-3">
                      {u.referralCode
                        ? <span className="font-mono text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">{u.referralCode}</span>
                        : <span className="text-gray-300 text-[11px]">—</span>}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {u.referralCount > 0
                        ? <span className="font-semibold text-emerald-600 text-[12px]">{u.referralCount}</span>
                        : <span className="text-gray-300 text-[11px]">0</span>}
                    </TableCell>
                    <TableCell className="px-4 py-3"><span className="font-mono text-[11px] text-gray-600">{u.aiSessionsUsed || 0}</span></TableCell>
                    <TableCell className="px-4 py-3">
                      {u.isActive
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t("admin.userManagement.active")}</span>
                        : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {t("admin.userManagement.locked")}</span>
                      }
                    </TableCell>
                    {/* Actions */}
                    <TableCell className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 flex-wrap">
                        <Button onClick={() => setSelectedUser(isSelected ? null : u)} title={t("admin.userManagement.viewDetails")}
                          className={`p-1.5 border transition-colors rounded ${isSelected ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-white text-gray-400 hover:text-gray-700 border-gray-200"}`}>
                          <Eye size={12} />
                        </Button>
                        <Button onClick={() => handleSendResetEmail(u._id, u.name)} title={t("admin.userManagement.sendResetEmail")}
                          className="p-1.5 bg-white text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-colors rounded">
                          <Mail size={12} />
                        </Button>
                        <Button onClick={() => { setPwdModal(u._id); setNewPwd(""); setPwdError(""); }} title={t("admin.userManagement.changePassword")}
                          className="p-1.5 bg-white text-gray-400 hover:text-amber-600 border border-gray-200 hover:border-amber-300 transition-colors rounded">
                          <Key size={12} />
                        </Button>
                        {u.role?.toLowerCase() === "mc" && (
                          <Button onClick={() => handleVerify(u._id, u.isVerified)} title={u.isVerified ? t("admin.userManagement.revoke") : t("admin.userManagement.certify")}
                            className={`p-1.5 border transition-colors rounded ${u.isVerified ? "bg-white text-gray-400 border-gray-200" : "bg-gray-800 text-white border-gray-800"}`}>
                            <ShieldAlert size={12} />
                          </Button>
                        )}
                        <Button onClick={() => handleSuspend(u._id, u.isActive)} title={u.isActive ? t("admin.userManagement.lock") : t("admin.userManagement.unlock")}
                          className="p-1.5 bg-white text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 transition-colors rounded">
                          {u.isActive ? <XCircle size={12} /> : <CheckCircle size={12} />}
                        </Button>
                        <Button onClick={() => handleDeleteUser(u._id, u.name)} title={t("admin.userManagement.disable")}
                          className="p-1.5 bg-white text-gray-400 hover:text-orange-600 border border-gray-200 hover:border-orange-300 transition-colors rounded">
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
      <Dialog open={showAddModal} onOpenChange={(open) => { if (!open) setShowAddModal(false); }}>
        <DialogContent showCloseButton={false} className="bg-white border border-gray-200 w-full max-w-md shadow-xl rounded-xl overflow-hidden p-0 gap-0">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-900">{t("admin.userManagement.addNewAccount")}</h2>
              <Button onClick={() => setShowAddModal(false)} className="h-auto text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></Button>
            </div>
            <form onSubmit={handleAddUser} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {addError && <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-lg p-3">{addError}</div>}
              {[[t("admin.userManagement.displayName"), "name", "text", t("admin.userManagement.displayNamePlaceholder"), true], ["Email", "email", "email", "user@example.com", true], [t("admin.userManagement.password"), "password", "password", t("admin.userManagement.passwordMinPlaceholder"), true], [t("admin.userManagement.phoneNumber"), "phoneNumber", "tel", "0901234567", false]].map(([label, key, type, ph, req]) => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
                  <Input type={type} value={addForm[key]} onChange={e => setAddForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-amber-400 h-auto focus-visible:ring-0" placeholder={ph} required={req} />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t("admin.userManagement.role")}</label>
                <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-amber-400 bg-white">
                  <option value="CLIENT">Client</option>
                  <option value="MC">MC</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t("admin.userManagement.internalNote")}</label>
                <textarea value={addForm.adminNote} onChange={e => setAddForm(p => ({ ...p, adminNote: e.target.value }))}
                  rows={2} placeholder={t("admin.userManagement.internalNotePlaceholder")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-amber-400 resize-none" />
              </div>
              {/* Plan activation */}
              <div className="border border-amber-100 rounded-xl p-4 bg-amber-50/50 space-y-3">
                <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">{t("admin.userManagement.activatePlanNow")}</p>
                <select value={addForm.plan} onChange={e => setAddForm(p => ({ ...p, plan: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-amber-400 bg-white">
                  <option value="">{t("admin.userManagement.noPlanActivation")}</option>
                  <option value="BASIC">{t("admin.userManagement.basic30Days")}</option>
                  <option value="FULL">{t("admin.userManagement.full30Days")}</option>
                  <option value="ANNUAL">{t("admin.userManagement.annual365Days")}</option>
                </select>
                {addForm.plan && <p className="text-[11px] text-amber-600">{t("admin.userManagement.bypassPayosHint")}</p>}
              </div>
              {/* Coupon */}
              <div className="border border-sky-100 rounded-xl p-4 bg-sky-50/50 space-y-3">
                <p className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">{t("admin.userManagement.giftDiscountCode")}</p>
                <select value={addForm.couponId} onChange={e => setAddForm(p => ({ ...p, couponId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-sky-400 bg-white">
                  <option value="">{t("admin.userManagement.noCoupon")}</option>
                  {discounts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.type === "PERCENT" ? `${d.discountValue}%` : `${d.discountValue.toLocaleString("vi-VN")}đ`} off{d.description ? ` · ${d.description}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-sky-600">{t("admin.userManagement.couponUseOnceHint")}</p>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
                <Button type="button" onClick={() => setShowAddModal(false)} className="h-auto px-4 py-2 text-[12px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">{t("admin.userManagement.cancel")}</Button>
                <Button type="submit" disabled={addLoading} className="h-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg disabled:opacity-50">
                  {addLoading ? t("admin.userManagement.creating") : t("admin.userManagement.createAccount")}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      {/* ── Change Password Modal ─────────────────────────────────── */}
      <Dialog open={!!pwdModal} onOpenChange={(open) => { if (!open) setPwdModal(null); }}>
        <DialogContent showCloseButton={false} className="bg-white border border-gray-200 w-full max-w-sm shadow-xl rounded-xl overflow-hidden p-0 gap-0">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-900">{t("admin.userManagement.changePassword")}</h2>
              <Button onClick={() => setPwdModal(null)} className="h-auto text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></Button>
            </div>
            <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
              {pwdError && <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-lg p-3">{pwdError}</div>}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{t("admin.userManagement.newPassword")}</label>
                <Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-amber-400 h-auto focus-visible:ring-0" placeholder={t("admin.userManagement.passwordMinPlaceholder")} required />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button type="button" onClick={() => setPwdModal(null)} className="h-auto px-4 py-2 text-[12px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">{t("admin.userManagement.cancel")}</Button>
                <Button type="submit" disabled={pwdLoading} className="h-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold rounded-lg disabled:opacity-50">
                  {pwdLoading ? t("admin.userManagement.saving") : t("admin.userManagement.update")}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;

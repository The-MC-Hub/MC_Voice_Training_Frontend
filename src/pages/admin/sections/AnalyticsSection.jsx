import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
} from "recharts";
import {
  Users, Activity, Zap, TrendingUp, Clock, UserCheck,
  UserX, Mic, CreditCard, Star, FileText, ExternalLink,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import ga4ReportMd from "../../../../GA4_TRACKING_REPORT.md?raw";
import { Button } from "@/components/animate-ui/components/buttons/button";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt   = (v) => (v ?? 0).toLocaleString("vi-VN");
const empty = (arr) => !arr || arr.length === 0;

const TIP_STYLE = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "10px",
  padding: "0.55rem 0.85rem",
};
const LABEL_STYLE = { color: "var(--text-muted)", fontSize: 11 };
const ITEM_STYLE  = { color: "var(--text-primary)", fontSize: 12 };

const PLAN_COLORS = { FREE:"#52525b", BASIC:"#3B82F6", FULL:"#10B981", ANNUAL:"gold" };
const ROLE_COLORS = { MC:"#3B82F6", CLIENT:"#10B981", ADMIN:"#EF4444" };

// ── reusable card shell ───────────────────────────────────────────────────────
const Card = ({ title, subtitle, icon: Icon, children, className = "" }) => (
  <div className={`bg-[--bg-surface] border border-[--border-subtle] rounded-xl p-5 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={15} className="text-[--text-muted] shrink-0" />}
      <div>
        <h3 className="text-[13px] font-semibold text-[--text-primary] leading-none">{title}</h3>
        {subtitle && <p className="text-[11px] text-[--text-muted] mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ── stat pill ────────────────────────────────────────────────────────────────
const Stat = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-[--bg-surface] border border-[--border-subtle] rounded-xl p-4">
    <div className="flex justify-between items-start mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-[--bg-elevated] border border-[--border-subtle] ${color}`}>
        <Icon size={16} />
      </div>
      {sub && <span className="text-[10px] text-[--text-muted] text-right max-w-[90px] leading-tight">{sub}</span>}
    </div>
    <div className="text-[22px] font-bold text-[--text-primary]">{fmt(value)}</div>
    <div className="text-[11px] text-[--text-muted] mt-0.5 uppercase tracking-wider">{label}</div>
  </div>
);

// ── empty placeholder ────────────────────────────────────────────────────────
const Empty = ({ h = 200 }) => {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center justify-center text-[--text-muted] text-[12px]`} style={{ height: h }}>
      {t("admin.analyticsSection.noData")}
    </div>
  );
};

// ── tab buttons ───────────────────────────────────────────────────────────────
const Tabs = ({ value, onChange, options }) => (
  <div className="flex gap-1 bg-[--bg-elevated] border border-[--border-subtle] rounded-lg p-1 w-fit">
    {options.map(o => (
      <Button key={o.value} onClick={() => onChange(o.value)}
        className={`h-auto px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
          value === o.value
            ? "bg-[gold] text-black"
            : "text-[--text-muted] hover:text-[--text-primary]"
        }`}>
        {o.label}
      </Button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ── GA4 Report tab ────────────────────────────────────────────────────────────
const GA4ReportTab = () => {
  const { t } = useTranslation();
  return (
  <div className="bg-[--bg-surface] border border-[--border-subtle] rounded-xl p-6 lg:p-8">
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[--border-subtle]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[--bg-elevated] border border-[--border-subtle] flex items-center justify-center">
          <FileText size={16} className="text-[gold]" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[--text-primary]">{t("admin.analyticsSection.ga4ReportTitle")}</h2>
          <p className="text-[11px] text-[--text-muted] mt-0.5">{t("admin.analyticsSection.ga4MeasurementId")}</p>
        </div>
      </div>
      <a
        href="https://analytics.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[--bg-elevated] border border-[--border-subtle] text-[11px] text-[--text-muted] hover:text-[--text-primary] transition-colors"
      >
        <ExternalLink size={12} />
        {t("admin.analyticsSection.openGa4")}
      </a>
    </div>
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:text-[--text-primary] prose-headings:font-semibold
      prose-h1:text-[18px] prose-h1:mb-4 prose-h1:hidden
      prose-h2:text-[15px] prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-[gold]
      prose-h3:text-[13px] prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-[--text-secondary]
      prose-p:text-[12px] prose-p:text-[--text-muted] prose-p:leading-relaxed
      prose-strong:text-[--text-primary] prose-strong:font-semibold
      prose-code:text-[11px] prose-code:bg-[--bg-elevated] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-amber-400 prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[--bg-elevated] prose-pre:border prose-pre:border-[--border-subtle] prose-pre:rounded-lg prose-pre:text-[11px]
      prose-table:text-[11px] prose-table:w-full
      prose-th:text-[--text-muted] prose-th:font-semibold prose-th:text-left prose-th:pb-2 prose-th:border-b prose-th:border-[--border-subtle]
      prose-td:text-[--text-muted] prose-td:py-2 prose-td:border-b prose-td:border-[--border-subtle]/50
      prose-li:text-[12px] prose-li:text-[--text-muted]
      prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
      prose-hr:border-[--border-subtle]
      prose-blockquote:border-l-amber-400 prose-blockquote:text-[--text-muted] prose-blockquote:bg-[--bg-elevated] prose-blockquote:rounded-r-lg prose-blockquote:py-1
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {ga4ReportMd}
      </ReactMarkdown>
    </div>
  </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const AnalyticsSection = ({ analytics }) => {
  const { t } = useTranslation();
  const [loginRange, setLoginRange] = useState("day");
  const [sessionRange, setSessionRange] = useState("day");
  const [mainTab, setMainTab] = useState("data");

  // Fallback to empty object — render charts with empty data instead of blocking
  const a = analytics || {};

  // pick right dataset based on tab
  const loginData = loginRange === "hour"  ? a.loginsByHour
                  : loginRange === "month" ? a.loginsByMonth
                  : a.loginsByDay;
  const loginKey  = loginRange === "hour" ? "hour" : loginRange === "month" ? "month" : "date";

  const sessionData = sessionRange === "hour"  ? a.sessionsByHour
                    : sessionRange === "month" ? null   // no monthly sessions endpoint yet
                    : a.sessionsByDay;
  const sessionKey  = sessionRange === "hour" ? "hour" : "date";

  // Plan distribution → pie data
  const planData = a.planDistribution
    ? Object.entries(a.planDistribution)
        .filter(([, v]) => v > 0)
        .map(([plan, value]) => ({ name: plan, value, color: PLAN_COLORS[plan] || "#6366f1" }))
    : [];

  // Role distribution → pie data
  const roleData = a.roleDistribution
    ? Object.entries(a.roleDistribution)
        .filter(([, v]) => v > 0)
        .map(([role, value]) => ({ name: role, value, color: ROLE_COLORS[role] || "#a855f7" }))
    : [];

  // Peak hours (30d logins) → top 5 for highlight
  const peakHours = a.loginsByHour30d
    ? [...a.loginsByHour30d].sort((x, y) => y.count - x.count).slice(0, 5)
    : [];

  // Active vs inactive radial
  const activityData = [
    { name: t("admin.analyticsSection.activeStatus"), value: a.activeUsers     || 0, fill: "#10B981" },
    { name: t("admin.analyticsSection.inactiveStatus"), value: a.inactiveUsers  || 0, fill: "#EF4444" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Main tab switcher ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Tabs
          value={mainTab}
          onChange={setMainTab}
          options={[
            { value: "data",   label: t("admin.analyticsSection.tabData") },
            { value: "ga4",    label: t("admin.analyticsSection.tabGa4") },
          ]}
        />
      </div>

      {mainTab === "ga4" && <GA4ReportTab />}
      {mainTab === "data" && <>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label={t("admin.analyticsSection.usersToday")} value={a.registrationsToday} icon={Users}     color="text-[--text-primary]"   sub={t("admin.analyticsSection.newRegistrations")} />
        <Stat label={t("admin.analyticsSection.loginsToday")}  value={a.loginsToday}        icon={Activity}  color="text-emerald-400" sub={t("admin.analyticsSection.activeSessions")} />
        <Stat label={t("admin.analyticsSection.sessionsToday")}  value={a.sessionsToday}      icon={Mic}       color="text-[gold]"  sub={t("admin.analyticsSection.aiSessions")} />
        <Stat label={t("admin.analyticsSection.premiumUsers")} value={a.premiumUsers}       icon={Star}      color="text-purple-400" sub={t("admin.analyticsSection.payingUsers")} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label={t("admin.analyticsSection.totalUsers")}     value={a.totalUsers}          icon={Users}     color="text-[--text-primary]"   sub={t("admin.analyticsSection.allTime")} />
        <Stat label={t("admin.analyticsSection.active7d")}     value={a.activeUsersLast7d}   icon={UserCheck} color="text-emerald-400" sub={t("admin.analyticsSection.hasLoggedIn")} />
        <Stat label={t("admin.analyticsSection.totalLogins30d")}  value={a.totalLogins30d}      icon={Zap}       color="text-amber-400"  sub={t("admin.analyticsSection.last30Days")} />
        <Stat label={t("admin.analyticsSection.sessions30d")}   value={a.totalSessions30d}    icon={TrendingUp} color="text-indigo-400" sub={t("admin.analyticsSection.aiSessions")} />
      </div>

      {/* ── Login trend ─────────────────────────────────────────────────── */}
      <Card title={t("admin.analyticsSection.loginTrend")} subtitle={t("admin.analyticsSection.loginTrendSub")} icon={Activity}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] text-[--text-muted]">
            {loginRange === "hour" ? t("admin.analyticsSection.todayByHour") : loginRange === "month" ? t("admin.analyticsSection.last12Months") : t("admin.analyticsSection.last30DaysShort")}
          </span>
          <Tabs value={loginRange} onChange={setLoginRange} options={[
            { value: "hour", label: t("admin.analyticsSection.hour") }, { value: "day", label: t("admin.analyticsSection.day") }, { value: "month", label: t("admin.analyticsSection.month") }
          ]} />
        </div>
        {empty(loginData) ? <Empty h={240} /> : (
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loginData}>
                <defs>
                  <linearGradient id="gradLogin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey={loginKey} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                  tickFormatter={v => loginRange === "day" ? v.slice(5) : v} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                  formatter={v => [fmt(v), t("admin.analyticsSection.loginsTooltip")]} />
                <Area type="monotone" dataKey="count" stroke="#10B981" fill="url(#gradLogin)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── Session trend ────────────────────────────────────────────────── */}
      <Card title={t("admin.analyticsSection.aiSessionTrend")} subtitle={t("admin.analyticsSection.aiSessionTrendSub")} icon={Mic}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] text-[--text-muted]">
            {sessionRange === "hour" ? t("admin.analyticsSection.todayByHour") : t("admin.analyticsSection.last30DaysShort")}
          </span>
          <Tabs value={sessionRange} onChange={setSessionRange} options={[
            { value: "hour", label: t("admin.analyticsSection.hour") }, { value: "day", label: t("admin.analyticsSection.day") },
          ]} />
        </div>
        {empty(sessionData) ? <Empty h={240} /> : (
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData} barSize={loginRange === "hour" ? 14 : 8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey={sessionKey} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                  tickFormatter={v => sessionRange === "day" ? v.slice(5) : v} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                  formatter={v => [fmt(v), t("admin.analyticsSection.sessionsTooltip")]} />
                <Bar dataKey="count" fill="gold" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── New users trend ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title={t("admin.analyticsSection.newUsersByDay")} subtitle={t("admin.analyticsSection.last30DaysShort")} icon={Users}>
          {empty(a.newUsersByDay) ? <Empty h={200} /> : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={a.newUsersByDay}>
                  <defs>
                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                    tickFormatter={v => v.slice(5)} interval={4} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={24} />
                  <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                    formatter={v => [fmt(v), t("admin.analyticsSection.newUsersTooltip")]} />
                  <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="url(#gradUsers)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title={t("admin.analyticsSection.newUsersByMonth")} subtitle={t("admin.analyticsSection.last12Months")} icon={TrendingUp}>
          {empty(a.newUsersByMonth) ? <Empty h={200} /> : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.newUsersByMonth} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                    tickFormatter={v => v.slice(5)} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={24} />
                  <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                    formatter={v => [fmt(v), t("admin.analyticsSection.newUsersTooltip")]} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ── Peak hours + Active/Inactive ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Peak hours heatmap-style bar */}
        <div className="lg:col-span-2">
          <Card title={t("admin.analyticsSection.peakHoursTitle")} subtitle={t("admin.analyticsSection.peakHoursSub")} icon={Clock}>
            {empty(a.loginsByHour30d) ? <Empty h={220} /> : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={a.loginsByHour30d} barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                      tickFormatter={v => v.slice(0,2)} interval={1} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                      formatter={v => [fmt(v), t("admin.analyticsSection.loginsTooltip")]} />
                    <Bar dataKey="count" radius={[3,3,0,0]}>
                      {(a.loginsByHour30d || []).map((entry, i) => {
                        const isTop = peakHours.some(p => p.hour === entry.hour);
                        return <Cell key={i} fill={isTop ? "gold" : "#3B82F6"} fillOpacity={isTop ? 1 : 0.5} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {peakHours.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] text-[--text-muted] uppercase tracking-wider self-center">{t("admin.analyticsSection.topHour")}</span>
                {peakHours.map((p, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-[gold]/10 border border-[gold]/20 text-[gold] text-[11px] font-medium">
                    {p.hour} · {fmt(p.count)} {t("admin.analyticsSection.usesUnit")}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Active vs inactive */}
        <Card title={t("admin.analyticsSection.accountStatus")} subtitle={t("admin.analyticsSection.accountStatusSub")} icon={UserCheck}>
          <div className="flex flex-col items-center">
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activityData} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {activityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={TIP_STYLE} itemStyle={ITEM_STYLE}
                    formatter={v => [fmt(v), ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 w-full mt-1">
              {activityData.map((e, i) => (
                <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-subtle]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.fill }} />
                    <span className="text-[12px] text-[--text-muted]">{e.name}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[--text-primary]">{fmt(e.value)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-[gold]/[0.05] border border-[gold]/15">
                <span className="text-[11px] text-[--text-muted]">{t("admin.analyticsSection.active7dLabel")}</span>
                <span className="text-[13px] font-semibold text-[gold]">{fmt(a.activeUsersLast7d)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Plan + Role distribution ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <Card title={t("admin.analyticsSection.planDistribution")} subtitle={t("admin.analyticsSection.planDistributionSub")} icon={CreditCard}>
          {empty(planData) ? <Empty h={200} /> : (
            <div className="flex gap-4 items-center">
              <div className="h-[180px] w-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planData} cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {planData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TIP_STYLE} itemStyle={ITEM_STYLE} formatter={v => [fmt(v), t("admin.analyticsSection.usersTooltip")]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {planData.map((e, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-subtle]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: e.color }} />
                      <span className="text-[12px] text-[--text-muted] font-medium">{e.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 rounded-full bg-[--bg-elevated] w-20 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          backgroundColor: e.color,
                          width: `${planData.reduce((s,x) => s+x.value, 0) > 0 ? Math.round(e.value / planData.reduce((s,x) => s+x.value, 0) * 100) : 0}%`
                        }} />
                      </div>
                      <span className="text-[13px] font-bold text-[--text-primary] w-8 text-right">{fmt(e.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card title={t("admin.analyticsSection.roleDistribution")} subtitle={t("admin.analyticsSection.roleDistributionSub")} icon={Users}>
          {empty(roleData) ? <Empty h={200} /> : (
            <div className="flex gap-4 items-center">
              <div className="h-[180px] w-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {roleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TIP_STYLE} itemStyle={ITEM_STYLE} formatter={v => [fmt(v), t("admin.analyticsSection.usersTooltip")]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {roleData.map((e, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-subtle]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: e.color }} />
                      <span className="text-[12px] text-[--text-muted] font-medium">{e.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 rounded-full bg-[--bg-elevated] w-20 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          backgroundColor: e.color,
                          width: `${roleData.reduce((s,x) => s+x.value, 0) > 0 ? Math.round(e.value / roleData.reduce((s,x) => s+x.value, 0) * 100) : 0}%`
                        }} />
                      </div>
                      <span className="text-[13px] font-bold text-[--text-primary] w-8 text-right">{fmt(e.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Logins per month line chart ──────────────────────────────────── */}
      <Card title={t("admin.analyticsSection.loginsByMonth")} subtitle={t("admin.analyticsSection.last12Months")} icon={TrendingUp}>
        {empty(a.loginsByMonth) ? <Empty h={200} /> : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={a.loginsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                  tickFormatter={v => v.slice(5)} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                  formatter={v => [fmt(v), t("admin.analyticsSection.loginsTooltip")]} />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      </>}
    </div>
  );
};

export default AnalyticsSection;

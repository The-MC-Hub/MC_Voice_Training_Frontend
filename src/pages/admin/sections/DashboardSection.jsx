import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Users, CreditCard, CheckCircle2, Clock, XCircle,
  TrendingUp, Activity, BarChart3, ArrowUpRight,
  Zap, UserCheck, UserX, Mic, Star,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt  = (v) => (v ?? 0).toLocaleString("vi-VN");
const fmtM = (v) => { const m = (v ?? 0) / 1_000_000; return m >= 1 ? `${m.toFixed(1)}tr` : `${((v ?? 0) / 1000).toFixed(0)}k`; };
const empty = (arr) => !arr || arr.length === 0;

const TIP_STYLE   = { backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "0.55rem 0.85rem" };
const LABEL_STYLE = { color: "var(--text-muted)", fontSize: 11 };
const ITEM_STYLE  = { color: "var(--text-primary)", fontSize: 12 };
const PLAN_COLORS = { FREE: "#52525b", BASIC: "#3B82F6", FULL: "#10B981", ANNUAL: "#f5a623" };
const ROLE_COLORS = { MC: "#3B82F6", CLIENT: "#10B981", ADMIN: "#EF4444" };

// ── sub-nav config ────────────────────────────────────────────────────────────
const NAV = [
  { id: "tong-quan",          label: "Tổng quan" },
  { id: "doanh-thu",          label: "Doanh thu" },
  { id: "nguoi-dung-hom-nay", label: "Hôm nay" },
  { id: "xu-huong",           label: "Xu hướng" },
  { id: "gio-cao-diem",       label: "Giờ cao điểm" },
  { id: "phan-bo",            label: "Phân bổ" },
];

// ── shared sub-components ────────────────────────────────────────────────────

const KPI = ({ label, value, sub, icon: Icon, color, isMoney, delta }) => (
  <div className="rounded-2xl p-6 flex flex-col gap-4 border" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${color}`} style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
        <Icon size={20} />
      </div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 text-emerald-400 text-[12px] font-medium">
          <ArrowUpRight size={13} /> {delta}
        </div>
      )}
    </div>
    <div>
      <p className="text-[12px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold leading-none" style={{ color: "var(--text-primary)" }}>
          {isMoney ? fmt(value) : (value ?? 0).toLocaleString()}
        </span>
        {isMoney && <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>VND</span>}
      </div>
      {sub && <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  </div>
);

const RevCard = ({ icon: Icon, label, colorCls, borderCls, revenue, count }) => (
  <div className={`rounded-2xl p-5 border ${borderCls} flex flex-col gap-3`} style={{ background: "var(--bg-surface)" }}>
    <div className="flex items-center gap-2">
      <Icon size={16} className={colorCls} />
      <span className={`text-[12px] font-semibold uppercase tracking-wider ${colorCls}`}>{label}</span>
    </div>
    <div>
      <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        {fmt(revenue)} <span className="text-[12px] font-normal" style={{ color: "var(--text-muted)" }}>VND</span>
      </div>
      <div className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{count ?? 0} giao dịch</div>
    </div>
  </div>
);

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

const Tabs = ({ value, onChange, options }) => (
  <div className="flex gap-1 bg-[--bg-elevated] border border-[--border-subtle] rounded-lg p-1 w-fit">
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)}
        className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
          value === o.value
            ? "bg-[#f5a623] text-black"
            : "text-[--text-muted] hover:text-[--text-primary]"
        }`}>
        {o.label}
      </button>
    ))}
  </div>
);

const Empty = ({ h = 200 }) => (
  <div className="flex items-center justify-center text-[--text-muted] text-[12px]" style={{ height: h }}>
    Chưa có dữ liệu
  </div>
);

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

// ── section components ────────────────────────────────────────────────────────

const KpiCardsSection = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <KPI label="Tong nguoi dung"   value={stats[0]?.value} icon={stats[0]?.icon ?? Users}        color={stats[0]?.color ?? "text-blue-400"}    sub={stats[0]?.trend} />
    <KPI label="GD thanh cong"     value={stats[1]?.value} icon={stats[1]?.icon ?? CheckCircle2}  color={stats[1]?.color ?? "text-emerald-400"}  sub={stats[1]?.trend} />
    <KPI label="Tong giao dich"    value={stats[2]?.value} icon={stats[2]?.icon ?? CreditCard}    color={stats[2]?.color ?? "text-amber-400"}    sub={stats[2]?.trend} />
    <KPI label="Doanh thu thuc te" value={stats[3]?.value} icon={stats[3]?.icon ?? TrendingUp}    color={stats[3]?.color ?? "text-purple-400"}   sub={stats[3]?.trend} isMoney />
  </div>
);

const RevenueSummarySection = ({ revenueData, revenueStats, userData, totalUsers }) => {
  const statusRevenue = revenueStats?.revenueByStatus || {};
  const countByStatus = revenueStats?.countByStatus   || {};

  const planData = revenueStats?.revenueByPlan
    ? Object.entries(revenueStats.revenueByPlan).map(([name, revenue]) => ({ name, revenue }))
    : [];

  return (
    <div className="space-y-6">
      {/* Revenue by status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RevCard icon={CheckCircle2} label="Hoan thanh" colorCls="text-emerald-400" borderCls="border-emerald-200"
          revenue={statusRevenue.COMPLETED} count={countByStatus.COMPLETED} />
        <RevCard icon={Clock}        label="Dang cho"   colorCls="text-amber-400"   borderCls="border-amber-200"
          revenue={statusRevenue.PENDING}   count={countByStatus.PENDING} />
        <RevCard icon={XCircle}      label="That bai"   colorCls="text-red-400"     borderCls="border-red-200"
          revenue={statusRevenue.FAILED}    count={countByStatus.FAILED} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Area chart — monthly revenue */}
        <div className="lg:col-span-8 rounded-2xl p-6 border" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} style={{ color: "var(--text-muted)" }} />
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>Doanh thu theo thang</h3>
            </div>
            <span className="text-[12px] px-3 py-1 rounded-lg border" style={{ color: "var(--text-muted)", background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
              Chi GD hoan thanh
            </span>
          </div>
          {revenueData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-2" style={{ color: "var(--text-muted)" }}>
              <BarChart3 size={28} className="opacity-30" />
              <span className="text-[13px]">Chua co du lieu doanh thu</span>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f5a623" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtM} width={36} />
                  <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                    cursor={{ stroke: "#f5a623", strokeWidth: 1, strokeDasharray: "3 3" }}
                    formatter={(v) => [`${fmt(v)} VND`, "Doanh thu"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#f5a623" fill="url(#gRev)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Donut — user distribution */}
        <div className="lg:col-span-4 rounded-2xl p-6 flex flex-col border" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} style={{ color: "var(--text-muted)" }} />
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>Phan bo nguoi dung</h3>
          </div>
          <div className="relative flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userData} cx="50%" cy="50%" innerRadius={58} outerRadius={82}
                  paddingAngle={3} dataKey="value" stroke="none">
                  {userData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TIP_STYLE} itemStyle={ITEM_STYLE} formatter={(v) => [v, "Nguoi dung"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Tong</span>
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{totalUsers}</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {userData.map((e, i) => {
              const pct = totalUsers > 0 ? Math.round(e.value / totalUsers * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: e.color }} />
                  <span className="text-[13px] flex-1" style={{ color: "var(--text-secondary)" }}>{e.name}</span>
                  <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{pct}%</span>
                  <span className="text-[14px] font-bold w-8 text-right" style={{ color: "var(--text-primary)" }}>{e.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue by plan */}
      {planData.length > 0 && (
        <div className="rounded-2xl p-6 border" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: "var(--text-muted)" }} />
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>Doanh thu theo goi dich vu</h3>
            </div>
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>Chi GD hoan thanh</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planData} barSize={52}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={13} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtM} width={40} />
                  <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                    formatter={(v) => [`${fmt(v)} VND`, "Doanh thu"]} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {planData.map((e, i) => <Cell key={i} fill={PLAN_COLORS[e.name] || "#6366f1"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {planData.map((e, i) => {
                const total = planData.reduce((s, x) => s + x.revenue, 0);
                const pct   = total > 0 ? Math.round(e.revenue / total * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PLAN_COLORS[e.name] || "#6366f1" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{e.name}</span>
                        <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{pct}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-subtle)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: PLAN_COLORS[e.name] || "#6366f1" }} />
                      </div>
                      <div className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>{fmt(e.revenue)} VND</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsKpiSection = ({ analytics }) => {
  const a = analytics || {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Người dùng hôm nay" value={a.registrationsToday} icon={Users}     color="text-blue-400"    sub="Đăng ký mới" />
        <Stat label="Đăng nhập hôm nay"  value={a.loginsToday}        icon={Activity}  color="text-emerald-400" sub="Phiên hoạt động" />
        <Stat label="Luyện tập hôm nay"  value={a.sessionsToday}      icon={Mic}       color="text-[#f5a623]"   sub="Sessions AI" />
        <Stat label="Người dùng Premium" value={a.premiumUsers}       icon={Star}      color="text-purple-400"  sub="Đang trả phí" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Tổng người dùng"    value={a.totalUsers}          icon={Users}      color="text-blue-400"    sub="Toàn thời gian" />
        <Stat label="Active (7 ngày)"    value={a.activeUsersLast7d}   icon={UserCheck}  color="text-emerald-400" sub="Có đăng nhập" />
        <Stat label="Tổng đăng nhập 30n" value={a.totalLogins30d}      icon={Zap}        color="text-amber-400"   sub="30 ngày qua" />
        <Stat label="Luyện tập 30 ngày"  value={a.totalSessions30d}    icon={TrendingUp} color="text-indigo-400"  sub="Sessions AI" />
      </div>
    </div>
  );
};

const TrendChartsSection = ({ analytics }) => {
  const [loginRange,   setLoginRange]   = useState("day");
  const [sessionRange, setSessionRange] = useState("day");
  const a = analytics || {};

  const loginData = loginRange === "hour"  ? a.loginsByHour
                  : loginRange === "month" ? a.loginsByMonth
                  : a.loginsByDay;
  const loginKey  = loginRange === "hour" ? "hour" : loginRange === "month" ? "month" : "date";

  const sessionData = sessionRange === "hour" ? a.sessionsByHour : a.sessionsByDay;
  const sessionKey  = sessionRange === "hour" ? "hour" : "date";

  return (
    <div className="space-y-6">
      {/* Login trend */}
      <Card title="Lượt đăng nhập" subtitle="Số phiên đăng nhập theo thời gian" icon={Activity}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] text-[--text-muted]">
            {loginRange === "hour" ? "Hôm nay theo giờ" : loginRange === "month" ? "12 tháng gần nhất" : "30 ngày gần nhất"}
          </span>
          <Tabs value={loginRange} onChange={setLoginRange} options={[
            { value: "hour", label: "Giờ" }, { value: "day", label: "Ngày" }, { value: "month", label: "Tháng" }
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
                  formatter={v => [fmt(v), "Đăng nhập"]} />
                <Area type="monotone" dataKey="count" stroke="#10B981" fill="url(#gradLogin)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Session trend */}
      <Card title="Phiên luyện tập AI" subtitle="Số lần người dùng luyện giọng theo thời gian" icon={Mic}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] text-[--text-muted]">
            {sessionRange === "hour" ? "Hôm nay theo giờ" : "30 ngày gần nhất"}
          </span>
          <Tabs value={sessionRange} onChange={setSessionRange} options={[
            { value: "hour", label: "Giờ" }, { value: "day", label: "Ngày" },
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
                  formatter={v => [fmt(v), "Sessions"]} />
                <Bar dataKey="count" fill="#f5a623" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* New users trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Người dùng mới theo ngày" subtitle="30 ngày gần nhất" icon={Users}>
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
                    formatter={v => [fmt(v), "Người dùng mới"]} />
                  <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="url(#gradUsers)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Người dùng mới theo tháng" subtitle="12 tháng gần nhất" icon={TrendingUp}>
          {empty(a.newUsersByMonth) ? <Empty h={200} /> : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.newUsersByMonth} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                    tickFormatter={v => v.slice(5)} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={24} />
                  <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                    formatter={v => [fmt(v), "Người dùng mới"]} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const PeakHoursSection = ({ analytics }) => {
  const a = analytics || {};

  const peakHours = a.loginsByHour30d
    ? [...a.loginsByHour30d].sort((x, y) => y.count - x.count).slice(0, 5)
    : [];

  const activityData = [
    { name: "Đang hoạt động",  value: a.activeUsers   || 0, fill: "#10B981" },
    { name: "Không hoạt động", value: a.inactiveUsers || 0, fill: "#EF4444" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Peak hours bar */}
      <div className="lg:col-span-2">
        <Card title="Giờ cao điểm truy cập" subtitle="Phân bổ lượt đăng nhập theo giờ trong ngày (30 ngày)" icon={Clock}>
          {empty(a.loginsByHour30d) ? <Empty h={220} /> : (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.loginsByHour30d} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                    tickFormatter={v => v.slice(0, 2)} interval={1} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                    formatter={v => [fmt(v), "Đăng nhập"]} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {(a.loginsByHour30d || []).map((entry, i) => {
                      const isTop = peakHours.some(p => p.hour === entry.hour);
                      return <Cell key={i} fill={isTop ? "#f5a623" : "#3B82F6"} fillOpacity={isTop ? 1 : 0.5} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {peakHours.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[10px] text-[--text-muted] uppercase tracking-wider self-center">Top giờ:</span>
              {peakHours.map((p, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-[#f5a623]/10 border border-[#f5a623]/20 text-[#f5a623] text-[11px] font-medium">
                  {p.hour} · {fmt(p.count)} lượt
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Active vs inactive */}
      <Card title="Trạng thái tài khoản" subtitle="Active vs không hoạt động" icon={UserCheck}>
        <div className="flex flex-col items-center">
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activityData} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                  paddingAngle={3} dataKey="value" stroke="none">
                  {activityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={TIP_STYLE} itemStyle={ITEM_STYLE} formatter={v => [fmt(v), ""]} />
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
            <div className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-[#f5a623]/[0.05] border border-[#f5a623]/15">
              <span className="text-[11px] text-[--text-muted]">Active 7 ngày</span>
              <span className="text-[13px] font-semibold text-[#f5a623]">{fmt(a.activeUsersLast7d)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const DistributionSection = ({ analytics }) => {
  const a = analytics || {};

  const planData = a.planDistribution
    ? Object.entries(a.planDistribution)
        .filter(([, v]) => v > 0)
        .map(([plan, value]) => ({ name: plan, value, color: PLAN_COLORS[plan] || "#6366f1" }))
    : [];

  const roleData = a.roleDistribution
    ? Object.entries(a.roleDistribution)
        .filter(([, v]) => v > 0)
        .map(([role, value]) => ({ name: role, value, color: ROLE_COLORS[role] || "#a855f7" }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Plan distribution */}
        <Card title="Phân bổ gói dịch vụ" subtitle="Số người dùng theo từng gói" icon={CreditCard}>
          {empty(planData) ? <Empty h={200} /> : (
            <div className="flex gap-4 items-center">
              <div className="h-[180px] w-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planData} cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {planData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TIP_STYLE} itemStyle={ITEM_STYLE} formatter={v => [fmt(v), "Người dùng"]} />
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
                          width: `${planData.reduce((s, x) => s + x.value, 0) > 0 ? Math.round(e.value / planData.reduce((s, x) => s + x.value, 0) * 100) : 0}%`
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

        {/* Role distribution */}
        <Card title="Phân bổ vai trò" subtitle="Số người dùng theo vai trò trong hệ thống" icon={Users}>
          {empty(roleData) ? <Empty h={200} /> : (
            <div className="flex gap-4 items-center">
              <div className="h-[180px] w-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {roleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TIP_STYLE} itemStyle={ITEM_STYLE} formatter={v => [fmt(v), "Người dùng"]} />
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
                          width: `${roleData.reduce((s, x) => s + x.value, 0) > 0 ? Math.round(e.value / roleData.reduce((s, x) => s + x.value, 0) * 100) : 0}%`
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

      {/* Monthly logins line chart */}
      <Card title="Đăng nhập theo tháng" subtitle="12 tháng gần nhất" icon={TrendingUp}>
        {empty(a.loginsByMonth) ? <Empty h={200} /> : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={a.loginsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={8}
                  tickFormatter={v => v.slice(5)} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={TIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={ITEM_STYLE}
                  formatter={v => [fmt(v), "Đăng nhập"]} />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#10B981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const DashboardSection = ({ stats, revenueData, revenueStats, userData, totalUsers, analytics }) => {
  const [activeId, setActiveId] = useState("tong-quan");

  useEffect(() => {
    const observers = [];
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky sub-nav */}
      <nav className="sticky top-0 z-10 bg-[--bg-base] border-b border-[--border-subtle]">
        <ul className="flex items-center overflow-x-auto">
          {NAV.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                className={`px-4 py-3 text-[13px] transition-colors whitespace-nowrap ${
                  activeId === id
                    ? "border-b-2 border-[#f5a623] text-gray-900 font-semibold"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Scrollable content */}
      <div className="flex-1 px-1">

        <section id="tong-quan" className="pt-2 pb-8">
          <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tổng quan</h2>
          <KpiCardsSection stats={stats} />
        </section>

        <section id="doanh-thu" className="pt-2 pb-8">
          <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">Doanh thu</h2>
          <RevenueSummarySection
            revenueData={revenueData}
            revenueStats={revenueStats}
            userData={userData}
            totalUsers={totalUsers}
          />
        </section>

        <section id="nguoi-dung-hom-nay" className="pt-2 pb-8">
          <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">Hôm nay</h2>
          <AnalyticsKpiSection analytics={analytics} />
        </section>

        <section id="xu-huong" className="pt-2 pb-8">
          <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">Xu hướng</h2>
          <TrendChartsSection analytics={analytics} />
        </section>

        <section id="gio-cao-diem" className="pt-2 pb-8">
          <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">Giờ cao điểm</h2>
          <PeakHoursSection analytics={analytics} />
        </section>

        <section id="phan-bo" className="pt-2 pb-8">
          <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">Phân bổ</h2>
          <DistributionSection analytics={analytics} />
        </section>

      </div>
    </div>
  );
};

export default DashboardSection;

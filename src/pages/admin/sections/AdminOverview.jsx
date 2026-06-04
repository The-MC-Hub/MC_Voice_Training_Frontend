import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Users, CreditCard, CheckCircle2, Clock, XCircle,
  TrendingUp, Activity, BarChart3, ArrowUpRight,
} from "lucide-react";

const fmt    = (v) => (v ?? 0).toLocaleString("vi-VN");
const fmtM   = (v) => { const m = (v ?? 0) / 1_000_000; return m >= 1 ? `${m.toFixed(1)}tr` : `${((v??0)/1000).toFixed(0)}k`; };

const TIP = {
  contentStyle: { backgroundColor: "#111113", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px" },
  labelStyle:   { color: "#a1a1aa", fontSize: 11 },
  itemStyle:    { color: "#fafafa", fontSize: 13 },
};

const PLAN_COLORS = { BASIC: "#3B82F6", FULL: "#10B981", ANNUAL: "#f5a623", FREE: "#52525b" };

// ── KPI card ─────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, icon: Icon, color, isMoney, delta }) => (
  <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-[#09090b] border border-white/[0.07] ${color}`}>
        <Icon size={20} />
      </div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 text-emerald-400 text-[12px] font-medium">
          <ArrowUpRight size={13} /> {delta}
        </div>
      )}
    </div>
    <div>
      <p className="text-[12px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-white leading-none">
          {isMoney ? fmt(value) : (value ?? 0).toLocaleString()}
        </span>
        {isMoney && <span className="text-[12px] text-zinc-500">VND</span>}
      </div>
      {sub && <p className="text-[12px] text-zinc-600 mt-1">{sub}</p>}
    </div>
  </div>
);

// ── Revenue status card ───────────────────────────────────────────────────────
const RevCard = ({ icon: Icon, label, colorCls, borderCls, revenue, count }) => (
  <div className={`bg-[#111113] rounded-2xl p-5 border ${borderCls} flex flex-col gap-3`}>
    <div className="flex items-center gap-2">
      <Icon size={16} className={colorCls} />
      <span className={`text-[12px] font-semibold uppercase tracking-wider ${colorCls}`}>{label}</span>
    </div>
    <div>
      <div className="text-2xl font-bold text-white">
        {fmt(revenue)} <span className="text-[12px] text-zinc-500 font-normal">VND</span>
      </div>
      <div className="text-[12px] text-zinc-500 mt-0.5">{count ?? 0} giao dịch</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const AdminOverview = ({ stats, revenueData, revenueStats, userData, totalUsers }) => {
  const statusRevenue = revenueStats?.revenueByStatus || {};
  const countByStatus = revenueStats?.countByStatus   || {};

  const planData = revenueStats?.revenueByPlan
    ? Object.entries(revenueStats.revenueByPlan).map(([name, revenue]) => ({ name, revenue }))
    : [];

  return (
    <div className="space-y-6">

      {/* ── KPI grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Tong nguoi dung"      value={stats[0]?.value} icon={stats[0]?.icon ?? Users}       color={stats[0]?.color ?? "text-blue-400"}   sub={stats[0]?.trend} />
        <KPI label="GD thanh cong"        value={stats[1]?.value} icon={stats[1]?.icon ?? CheckCircle2} color={stats[1]?.color ?? "text-emerald-400"} sub={stats[1]?.trend} />
        <KPI label="Tong giao dich"       value={stats[2]?.value} icon={stats[2]?.icon ?? CreditCard}  color={stats[2]?.color ?? "text-amber-400"}  sub={stats[2]?.trend} />
        <KPI label="Doanh thu thuc te"    value={stats[3]?.value} icon={stats[3]?.icon ?? TrendingUp}  color={stats[3]?.color ?? "text-purple-400"} sub={stats[3]?.trend} isMoney />
      </div>

      {/* ── Revenue by status ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RevCard icon={CheckCircle2} label="Hoan thanh" colorCls="text-emerald-400" borderCls="border-emerald-900/40"
          revenue={statusRevenue.COMPLETED} count={countByStatus.COMPLETED} />
        <RevCard icon={Clock}        label="Dang cho"   colorCls="text-amber-400"   borderCls="border-amber-900/40"
          revenue={statusRevenue.PENDING}   count={countByStatus.PENDING} />
        <RevCard icon={XCircle}      label="That bai"   colorCls="text-red-400"     borderCls="border-red-900/40"
          revenue={statusRevenue.FAILED}    count={countByStatus.FAILED} />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Area chart — monthly revenue */}
        <div className="lg:col-span-8 bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-zinc-500" />
              <h3 className="text-[15px] font-semibold text-white">Doanh thu theo thang</h3>
            </div>
            <span className="text-[12px] text-zinc-600 bg-[#09090b] border border-white/[0.06] px-3 py-1 rounded-lg">
              Chi GD hoan thanh
            </span>
          </div>
          {revenueData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-2 text-zinc-600">
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
                  <Tooltip {...TIP} cursor={{ stroke: "#f5a623", strokeWidth: 1, strokeDasharray: "3 3" }}
                    formatter={(v) => [`${fmt(v)} VND`, "Doanh thu"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#f5a623" fill="url(#gRev)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Donut — user distribution */}
        <div className="lg:col-span-4 bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-zinc-500" />
            <h3 className="text-[15px] font-semibold text-white">Phan bo nguoi dung</h3>
          </div>
          <div className="relative flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userData} cx="50%" cy="50%" innerRadius={58} outerRadius={82}
                  paddingAngle={3} dataKey="value" stroke="none">
                  {userData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...TIP} formatter={(v) => [v, "Nguoi dung"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Tong</span>
              <span className="text-2xl font-bold text-white">{totalUsers}</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {userData.map((e, i) => {
              const pct = totalUsers > 0 ? Math.round(e.value / totalUsers * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#09090b] border border-white/[0.05]">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: e.color }} />
                  <span className="text-[13px] text-zinc-300 flex-1">{e.name}</span>
                  <span className="text-[12px] text-zinc-500">{pct}%</span>
                  <span className="text-[14px] font-bold text-white w-8 text-right">{e.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Revenue by plan ───────────────────────────────────────────── */}
      {planData.length > 0 && (
        <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-zinc-500" />
              <h3 className="text-[15px] font-semibold text-white">Doanh thu theo goi dich vu</h3>
            </div>
            <span className="text-[12px] text-zinc-600">Chi GD hoan thanh</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Bar chart */}
            <div className="lg:col-span-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planData} barSize={52}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={13} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtM} width={40} />
                  <Tooltip {...TIP} formatter={(v) => [`${fmt(v)} VND`, "Doanh thu"]} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {planData.map((e, i) => <Cell key={i} fill={PLAN_COLORS[e.name] || "#6366f1"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Plan breakdown list */}
            <div className="flex flex-col justify-center gap-3">
              {planData.map((e, i) => {
                const total = planData.reduce((s, x) => s + x.revenue, 0);
                const pct   = total > 0 ? Math.round(e.revenue / total * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#09090b] border border-white/[0.05]">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PLAN_COLORS[e.name] || "#6366f1" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[13px] font-semibold text-white">{e.name}</span>
                        <span className="text-[12px] text-zinc-500">{pct}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: PLAN_COLORS[e.name] || "#6366f1" }} />
                      </div>
                      <div className="text-[12px] text-zinc-400 mt-1">{fmt(e.revenue)} VND</div>
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

export default AdminOverview;

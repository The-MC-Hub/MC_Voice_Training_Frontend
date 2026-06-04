import React from "react";
import { useTheme } from '../../../contexts/ThemeContext';
import { Activity, BarChart3, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const fmt = (v) => v?.toLocaleString("vi-VN") ?? "0";

const PLAN_COLORS = {
  BASIC: '#3B82F6',
  FULL:  '#10B981',
  ANNUAL:'#f5a623',
  FREE:  '#52525b',
};

const STATUS_COLORS = {
  COMPLETED: '#10B981',
  PENDING:   '#f5a623',
  FAILED:    '#EF4444',
};

const AdminOverview = ({ stats, revenueData, revenueStats, userData, totalUsers }) => {
  const { theme } = useTheme();
  const tooltipBg     = theme === 'light' ? '#ffffff' : '#111113';
  const tooltipBorder = theme === 'light' ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.07)';
  const tooltipText   = theme === 'light' ? '#111113' : '#fafafa';
  const tooltipLabel  = theme === 'light' ? '#52525b' : '#a1a1aa';

  // Revenue by plan chart data
  const planData = revenueStats?.revenueByPlan
    ? Object.entries(revenueStats.revenueByPlan).map(([plan, revenue]) => ({ name: plan, revenue }))
    : [];

  // Revenue by status summary cards
  const statusRevenue = revenueStats?.revenueByStatus || {};
  const countByStatus = revenueStats?.countByStatus || {};

  return (
    <div className="space-y-6 w-full">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111113] border border-white/[0.07] rounded-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-[#09090b] border border-white/[0.06] ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider text-right max-w-[100px] leading-tight">{stat.trend}</span>
            </div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="text-2xl font-bold text-white flex items-baseline gap-1">
              <span>{stat.isMoney ? fmt(stat.value) : stat.value}</span>
              {stat.isMoney && <span className="text-[11px] text-zinc-600 font-normal">VND</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111113] border border-emerald-900/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider">Hoàn thành</span>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(statusRevenue.COMPLETED)} <span className="text-[11px] text-zinc-500 font-normal">VND</span></div>
          <div className="text-[11px] text-zinc-500 mt-1">{countByStatus.COMPLETED ?? 0} giao dịch</div>
        </div>
        <div className="bg-[#111113] border border-amber-900/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-amber-400" />
            <span className="text-[12px] font-semibold text-amber-400 uppercase tracking-wider">Đang chờ</span>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(statusRevenue.PENDING)} <span className="text-[11px] text-zinc-500 font-normal">VND</span></div>
          <div className="text-[11px] text-zinc-500 mt-1">{countByStatus.PENDING ?? 0} giao dịch</div>
        </div>
        <div className="bg-[#111113] border border-red-900/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={15} className="text-red-400" />
            <span className="text-[12px] font-semibold text-red-400 uppercase tracking-wider">Thất bại</span>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(statusRevenue.FAILED)} <span className="text-[11px] text-zinc-500 font-normal">VND</span></div>
          <div className="text-[11px] text-zinc-500 mt-1">{countByStatus.FAILED ?? 0} giao dịch</div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly revenue area chart */}
        <div className="lg:col-span-8 bg-[#111113] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-zinc-500" />
            <h3 className="text-[14px] font-semibold text-white">Doanh thu theo tháng</h3>
            <span className="ml-auto text-[11px] text-zinc-600">Chỉ giao dịch hoàn thành</span>
          </div>
          {revenueData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-zinc-600 text-[13px]">Chưa có dữ liệu doanh thu</div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={1}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5a623" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}tr`} />
                  <Tooltip
                    cursor={{ stroke: '#f5a623', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', padding: '0.625rem 0.875rem' }}
                    labelStyle={{ color: tooltipLabel, fontSize: 11 }}
                    itemStyle={{ color: tooltipText, fontSize: 12 }}
                    formatter={(v) => [`${fmt(v)} VND`, 'Doanh thu']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f5a623" fillOpacity={1} fill="url(#colorRev)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* User distribution pie */}
        <div className="lg:col-span-4 bg-[#111113] border border-white/[0.07] rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-zinc-500" />
            <h3 className="text-[14px] font-semibold text-white">Phân bổ người dùng</h3>
          </div>

          <div className="relative w-full aspect-square max-w-[200px] mx-auto my-2">
            <ResponsiveContainer width="100%" height="100%" minHeight={1}>
              <PieChart>
                <Pie data={userData} cx="50%" cy="50%" innerRadius={62} outerRadius={84} paddingAngle={3} dataKey="value" stroke="none">
                  {userData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Tổng</span>
              <span className="text-xl font-bold text-white">{totalUsers}</span>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {userData.map((entry, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-[#09090b] border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[12px] text-zinc-400">{entry.name}</span>
                </div>
                <span className="text-[13px] font-semibold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by plan bar chart */}
      {planData.length > 0 && (
        <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-zinc-500" />
            <h3 className="text-[14px] font-semibold text-white">Doanh thu theo gói</h3>
            <span className="ml-auto text-[11px] text-zinc-600">Giao dịch hoàn thành</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={1}>
              <BarChart data={planData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}tr`} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', padding: '0.625rem 0.875rem' }}
                  labelStyle={{ color: tooltipLabel, fontSize: 11 }}
                  itemStyle={{ color: tooltipText, fontSize: 12 }}
                  formatter={(v) => [`${fmt(v)} VND`, 'Doanh thu']}
                />
                <Bar dataKey="revenue" radius={[6,6,0,0]}>
                  {planData.map((entry, index) => (
                    <Cell key={index} fill={PLAN_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {planData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PLAN_COLORS[entry.name] || '#6366f1' }} />
                <span className="text-[12px] text-zinc-400">{entry.name}</span>
                <span className="text-[12px] font-semibold text-white">{fmt(entry.revenue)} VND</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;

import React from "react";
import { Activity, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const AdminOverview = ({ stats, revenueData, userData, totalUsers }) => {
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
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{stat.trend}</span>
            </div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="text-2xl font-bold text-white flex items-baseline gap-1">
              <span>{stat.isMoney ? stat.value.toLocaleString("vi-VN") : stat.value}</span>
              {stat.isMoney && <span className="text-[11px] text-zinc-600 font-normal">VND</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-8">
        {/* Revenue */}
        <div className="lg:col-span-8 bg-[#111113] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-zinc-500" />
            <h3 className="text-[14px] font-semibold text-white">Revenue Development</h3>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={1}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toLocaleString("vi-VN")}đ`} />
                <Tooltip
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.625rem 0.875rem' }}
                  labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
                  itemStyle={{ color: '#fafafa', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie */}
        <div className="lg:col-span-4 bg-[#111113] border border-white/[0.07] rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-zinc-500" />
            <h3 className="text-[14px] font-semibold text-white">Membership Distribution</h3>
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
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</span>
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
    </div>
  );
};

export default AdminOverview;

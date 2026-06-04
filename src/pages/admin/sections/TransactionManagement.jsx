import React, { useState, useMemo } from "react";
import { Download, CheckCircle2, Clock, XCircle, TrendingUp, Filter } from "lucide-react";

const fmt = (v) => (v ?? 0).toLocaleString("vi-VN");

const STATUS_CONFIG = {
  COMPLETED: { label: "Hoàn thành", color: "bg-emerald-950/40 text-emerald-400 border-emerald-900/40", icon: CheckCircle2 },
  PENDING:   { label: "Đang chờ",   color: "bg-amber-950/40 text-amber-400 border-amber-900/40",     icon: Clock },
  FAILED:    { label: "Thất bại",   color: "bg-red-950/40 text-red-400 border-red-900/40",           icon: XCircle },
};

const PLAN_CONFIG = {
  BASIC:  { color: "bg-blue-950/40 text-blue-400 border-blue-900/40" },
  FULL:   { color: "bg-emerald-950/40 text-emerald-400 border-emerald-900/40" },
  ANNUAL: { color: "bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30" },
  FREE:   { color: "bg-zinc-900 text-zinc-500 border-white/[0.06]" },
};

const TransactionManagement = ({ transactions, revenueStats }) => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch = !q
        || t.userName?.toLowerCase().includes(q)
        || t.userEmail?.toLowerCase().includes(q)
        || t.plan?.toLowerCase().includes(q)
        || String(t.orderCode || "").includes(q);
      return matchStatus && matchSearch;
    });
  }, [transactions, filterStatus, search]);

  const statusRevenue = revenueStats?.revenueByStatus || {};
  const countByStatus = revenueStats?.countByStatus || {};

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["ID","Order Code","Người dùng","Email","Gói","Số tiền (VND)","Trạng thái","Ngân hàng Ref","Ngày tạo","Ngày hoàn thành"];
    const rows = filtered.map(t => [
      t.id, t.orderCode, t.userName, t.userEmail, t.plan, t.amount, t.status,
      t.bankRef || "", t.createdAt || "", t.completedAt || ""
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ""}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Lịch sử giao dịch</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">Toàn bộ giao dịch thanh toán gói dịch vụ từ người dùng.</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-[#111113] border border-white/[0.07] hover:border-white/[0.14] text-white rounded-xl text-[12px] font-medium transition-colors"
        >
          <Download size={13} /> Xuất CSV
        </button>
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? "ALL" : key)}
              className={`bg-[#111113] border rounded-xl p-4 cursor-pointer transition-all ${
                filterStatus === key ? "border-[#f5a623]/40 ring-1 ring-[#f5a623]/20" : "border-white/[0.07] hover:border-white/[0.14]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={key === "COMPLETED" ? "text-emerald-400" : key === "PENDING" ? "text-amber-400" : "text-red-400"} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{cfg.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{fmt(statusRevenue[key])} <span className="text-[10px] text-zinc-600 font-normal">VND</span></div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{countByStatus[key] ?? 0} giao dịch</div>
            </div>
          );
        })}
      </div>

      {/* Revenue by plan */}
      {revenueStats?.revenueByPlan && Object.keys(revenueStats.revenueByPlan).length > 0 && (
        <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-zinc-500" />
            <span className="text-[13px] font-semibold text-white">Doanh thu theo gói (hoàn thành)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(revenueStats.revenueByPlan).map(([plan, revenue]) => (
              <div key={plan} className={`rounded-xl p-3 border ${PLAN_CONFIG[plan]?.color || "bg-zinc-900 text-zinc-400 border-white/[0.06]"}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">{plan}</div>
                <div className="text-[15px] font-bold">{fmt(revenue)}</div>
                <div className="text-[10px] opacity-70">VND</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <input
          type="text"
          placeholder="Tìm theo tên, email, gói, mã đơn..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#111113] border border-white/[0.07] focus:border-white/20 rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 outline-none transition-colors"
        />
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-zinc-600" />
          {["ALL", "COMPLETED", "PENDING", "FAILED"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
                filterStatus === s
                  ? "bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30"
                  : "text-zinc-500 border-white/[0.07] hover:text-white"
              }`}
            >
              {s === "ALL" ? "Tất cả" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111113] border border-white/[0.07] rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="bg-[#09090b] border-b border-white/[0.06] text-zinc-500 uppercase text-[10px] font-semibold tracking-wider">
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Gói</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Bank Ref</th>
              <th className="px-4 py-3 text-right">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-zinc-300">
            {!transactions ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Không có giao dịch nào</td></tr>
            ) : filtered.map((t, i) => {
              const statusCfg = STATUS_CONFIG[t.status] || {};
              const planCfg = PLAN_CONFIG[t.plan] || {};
              const date = t.createdAt ? new Date(t.createdAt).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" }) : "—";
              return (
                <tr key={t.id || i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-zinc-500">#{String(t.orderCode || t.id || "").slice(-8)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-white block text-[13px]">{t.userName || "—"}</span>
                    <span className="text-[11px] text-zinc-500">{t.userEmail || ""}</span>
                  </td>
                  <td className="px-4 py-3">
                    {t.plan ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${planCfg.color || "bg-zinc-900 text-zinc-400 border-white/[0.06]"}`}>
                        {t.plan}
                      </span>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {fmt(t.amount)} <span className="text-[10px] text-zinc-500 font-normal">VND</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${statusCfg.color || "bg-[#09090b] text-zinc-500 border-white/[0.06]"}`}>
                      {statusCfg.label || t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                    {t.bankRef || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500 text-[11px]">{date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-white/[0.04] text-[11px] text-zinc-600">
            Hiển thị {filtered.length} / {transactions?.length ?? 0} giao dịch
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionManagement;

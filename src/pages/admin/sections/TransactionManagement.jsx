import React, { useState, useMemo } from "react";
import { Download, CheckCircle2, Clock, XCircle, TrendingUp, Filter, ArrowUpDown, CheckCheck } from "lucide-react";
import api from "../../../services/api";

const fmt = (v) => (v ?? 0).toLocaleString("vi-VN");

const STATUS_CONFIG = {
  COMPLETED: { label: "Hoàn thành", color: "bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]", icon: CheckCircle2 },
  PENDING:   { label: "Đang chờ",   color: "bg-gold/10 text-gold border-gold/30",     icon: Clock },
  FAILED:    { label: "Thất bại",   color: "bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]",           icon: XCircle },
};

const PLAN_CONFIG = {
  BASIC:  { color: "bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]" },
  FULL:   { color: "bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]" },
  ANNUAL: { color: "bg-gold/10 text-gold border-gold/30" },
  FREE:   { color: "bg-[--bg-elevated] text-[--text-muted] border-[--border-subtle]" },
};

const TransactionManagement = ({ transactions, revenueStats, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", order: "desc" }); // desc = NEWEST
  const [completing, setCompleting] = useState(null); // transactionId being completed
  const [flash, setFlash] = useState("");
  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 4000); };

  const handleComplete = async (txId) => {
    if (!window.confirm("Xác nhận hoàn thành giao dịch này và kích hoạt gói cho người dùng?")) return;
    setCompleting(txId);
    try {
      await api.post(`/payment/admin/complete/${txId}`);
      showFlash("Giao dịch đã được xác nhận. Gói người dùng đã kích hoạt.");
      onRefresh?.();
    } catch (err) {
      showFlash(`Lỗi: ${err.response?.data?.message || "Không thể xác nhận giao dịch."}`);
    } finally {
      setCompleting(null);
    }
  };

  const filtered = useMemo(() => {
    if (!transactions) return [];
    let res = transactions.filter(t => {
      const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch = !q
        || t.userName?.toLowerCase().includes(q)
        || t.userEmail?.toLowerCase().includes(q)
        || t.plan?.toLowerCase().includes(q)
        || t.memo?.toLowerCase().includes(q)
        || String(t.orderCode || "").includes(q);
      return matchStatus && matchSearch;
    });

    res.sort((a, b) => {
      if (sortConfig.key === "amount") {
        return sortConfig.order === "asc" ? (a.amount || 0) - (b.amount || 0) : (b.amount || 0) - (a.amount || 0);
      }
      if (sortConfig.key === "createdAt") {
        const dA = new Date(a.createdAt || 0).getTime();
        const dB = new Date(b.createdAt || 0).getTime();
        return sortConfig.order === "asc" ? dA - dB : dB - dA;
      }
      return 0;
    });

    return res;
  }, [transactions, filterStatus, search, sortConfig]);

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
          <h2 className="text-[15px] font-semibold text-[--text-primary]">Lịch sử giao dịch</h2>
          <p className="text-[12px] text-[--text-muted] mt-0.5">Toàn bộ giao dịch thanh toán gói dịch vụ từ người dùng.</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-[--bg-surface] border border-[--border-subtle] hover:border-[--border-subtle] text-[--text-primary] text-[12px] font-medium transition-colors"
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
              className={`bg-[--bg-surface] border p-4 cursor-pointer transition-all ${
                filterStatus === key ? "border-gold/40 ring-1 ring-gold/20" : "border-[--border-subtle] hover:border-[--border-subtle]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={key === "COMPLETED" ? "text-[--text-primary]" : key === "PENDING" ? "text-gold" : "text-[--text-primary]"} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[--text-secondary]">{cfg.label}</span>
              </div>
              <div className="text-xl font-bold text-[--text-primary]">{fmt(statusRevenue[key])} <span className="text-[10px] text-[--text-muted] font-normal">VND</span></div>
              <div className="text-[11px] text-[--text-muted] mt-0.5">{countByStatus[key] ?? 0} giao dịch</div>
            </div>
          );
        })}
      </div>

      {/* Revenue by plan */}
      {revenueStats?.revenueByPlan && Object.keys(revenueStats.revenueByPlan).length > 0 && (
        <div className=" mt-4 bg-[--bg-surface] border border-[--border-subtle] p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-[--text-muted]" />
            <span className="text-[13px] font-semibold text-[--text-primary]">Doanh thu theo gói (hoàn thành)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(revenueStats.revenueByPlan).map(([plan, revenue]) => (
              <div key={plan} className={`p-3 border ${PLAN_CONFIG[plan]?.color || "bg-[--bg-elevated] text-[--text-secondary] border-[--border-subtle]"}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">{plan}</div>
                <div className="text-[15px] font-bold">{fmt(revenue)}</div>
                <div className="text-[10px] opacity-70">VND</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên, email, gói, nội dung, mã đơn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[250px] bg-[--bg-surface] border border-[--border-subtle] focus:border-[--border-subtle] px-3 py-2 text-[13px] text-[--text-primary] placeholder:text-zinc-400 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 border-r border-[--border-subtle] pr-3 shrink-0">
            <Filter size={13} className="text-[--text-muted]" />
            {["ALL", "COMPLETED", "PENDING", "FAILED"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-[11px] font-medium transition-colors border whitespace-nowrap ${
                  filterStatus === s
                    ? "bg-gold/10 text-gold border-gold/30"
                    : "text-[--text-muted] border-[--border-subtle] hover:text-[--text-primary]"
                }`}
              >
                {s === "ALL" ? "Tất cả" : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown size={13} className="text-[--text-muted]" />
            <select
              value={`${sortConfig.key}-${sortConfig.order}`}
              onChange={e => {
                const [k, o] = e.target.value.split("-");
                setSortConfig({ key: k, order: o });
              }}
              className="bg-[--bg-surface] border border-[--border-subtle] text-[11px] text-[--text-secondary] px-2 py-1.5 outline-none cursor-pointer hover:border-[--text-muted]"
            >
              <option value="createdAt-desc">Mới nhất trước</option>
              <option value="createdAt-asc">Cũ nhất trước</option>
              <option value="amount-desc">Số tiền: Cao → Thấp</option>
              <option value="amount-asc">Số tiền: Thấp → Cao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flash */}
      {flash && (
        <div className="bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-[12px] px-4 py-3 rounded-lg">
          {flash}
        </div>
      )}

      {/* Table */}
      <div className="bg-[--bg-surface] border border-[--border-subtle] overflow-x-auto">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="bg-[--bg-elevated] border-b border-[--border-subtle] text-[--text-muted] uppercase text-[10px] font-semibold tracking-wider">
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Gói</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Nội dung (Memo)</th>
              <th className="px-4 py-3">Bank Ref</th>
              <th className="px-4 py-3 text-right">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Hoàn thành</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border-subtle] text-[--text-secondary]">
            {!transactions ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-[--text-muted]">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-[--text-muted]">Không có giao dịch nào</td></tr>
            ) : filtered.map((t, i) => {
              const statusCfg = STATUS_CONFIG[t.status] || {};
              const planCfg = PLAN_CONFIG[t.plan] || {};
              const date = t.createdAt ? new Date(t.createdAt).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" }) : "—";
              return (
                <tr key={t.id || i} className="hover:bg-[--bg-elevated] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-[--text-muted]">#{String(t.orderCode || t.id || "").slice(-8)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[--text-primary] block text-[13px]">{t.userName || "—"}</span>
                    <span className="text-[11px] text-[--text-muted]">{t.userEmail || ""}</span>
                  </td>
                  <td className="px-4 py-3">
                    {t.plan ? (
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold border uppercase ${planCfg.color || "bg-[--bg-elevated] text-[--text-secondary] border-[--border-subtle]"}`}>
                        {t.plan}
                      </span>
                    ) : <span className="text-[--text-muted]">—</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[--text-primary]">
                    {fmt(t.amount)} <span className="text-[10px] text-[--text-muted] font-normal">VND</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium border ${statusCfg.color || "bg-[--bg-elevated] text-[--text-muted] border-[--border-subtle]"}`}>
                      {statusCfg.label || t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[11px] text-[--text-secondary] max-w-[150px] truncate" title={t.memo}>
                      {t.memo || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[--text-muted]">
                    {t.bankRef || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-[--text-muted] text-[11px]">{date}</td>
                  <td className="px-4 py-3 text-right text-[--text-muted] text-[11px]">
                    {t.completedAt ? new Date(t.completedAt).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.status === "PENDING" && (
                      <button
                        onClick={() => handleComplete(t.id)}
                        disabled={completing === t.id}
                        title="Xác nhận giao dịch thủ công"
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/60 transition-colors disabled:opacity-50"
                      >
                        <CheckCheck size={11} className={completing === t.id ? "animate-spin" : ""} />
                        {completing === t.id ? "..." : "Xác nhận"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[--border-subtle] text-[11px] text-[--text-muted]">
            Hiển thị {filtered.length} / {transactions?.length ?? 0} giao dịch
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionManagement;

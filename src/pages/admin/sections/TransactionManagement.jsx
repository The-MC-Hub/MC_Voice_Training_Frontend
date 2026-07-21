import React, { useState, useMemo } from "react";
import { Download, CheckCircle2, Clock, XCircle, TrendingUp, Filter, ArrowUpDown, CheckCheck } from "lucide-react";
import api from "../../../services/api";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const fmt = (v) => (v ?? 0).toLocaleString("vi-VN");

function useStatusConfig(t) {
  return {
    COMPLETED: { label: t("admin.transactionManagement.status.completed"), color: "bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]", icon: CheckCircle2 },
    PENDING:   { label: t("admin.transactionManagement.status.pending"),   color: "bg-gold/10 text-gold border-gold/30",     icon: Clock },
    FAILED:    { label: t("admin.transactionManagement.status.failed"),   color: "bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]",           icon: XCircle },
  };
}

const PLAN_CONFIG = {
  BASIC:  { color: "bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]" },
  FULL:   { color: "bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]" },
  ANNUAL: { color: "bg-gold/10 text-gold border-gold/30" },
  FREE:   { color: "bg-[--bg-elevated] text-[--text-muted] border-[--border-subtle]" },
};

const TransactionManagement = ({ transactions, revenueStats, onRefresh }) => {
  const { t } = useTranslation();
  const STATUS_CONFIG = useStatusConfig(t);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", order: "desc" }); // desc = NEWEST
  const [completing, setCompleting] = useState(null); // transactionId being completed
  const [flash, setFlash] = useState("");
  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 4000); };

  const handleComplete = async (txId) => {
    if (!window.confirm(t("admin.transactionManagement.confirms.completeTransaction"))) return;
    setCompleting(txId);
    try {
      await api.post(`/payment/admin/complete/${txId}`);
      showFlash(t("admin.transactionManagement.flash.completeSuccess"));
      onRefresh?.();
    } catch (err) {
      showFlash(t("admin.transactionManagement.flash.completeError", { message: err.response?.data?.message || t("admin.transactionManagement.flash.completeErrorDefault") }));
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
    const headers = [
      "ID", "Order Code",
      t("admin.transactionManagement.csv.user"),
      t("admin.transactionManagement.csv.email"),
      t("admin.transactionManagement.csv.plan"),
      t("admin.transactionManagement.csv.amount"),
      t("admin.transactionManagement.csv.status"),
      t("admin.transactionManagement.csv.bankRef"),
      t("admin.transactionManagement.csv.createdAt"),
      t("admin.transactionManagement.csv.completedAt"),
    ];
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
          <h2 className="text-[15px] font-semibold text-[--text-primary]">{t("admin.transactionManagement.title")}</h2>
          <p className="text-[12px] text-[--text-muted] mt-0.5">{t("admin.transactionManagement.subtitle")}</p>
        </div>
        <Button
          onClick={exportCSV}
          className="h-auto flex items-center gap-2 px-3 py-2 bg-[--bg-surface] border border-[--border-subtle] hover:border-[--border-subtle] text-[--text-primary] text-[12px] font-medium transition-colors"
        >
          <Download size={13} /> {t("admin.transactionManagement.exportCsv")}
        </Button>
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Card
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? "ALL" : key)}
              className={`bg-[--bg-surface] border p-4 gap-0 rounded-none shadow-none cursor-pointer transition-all ${
                filterStatus === key ? "border-gold/40 ring-1 ring-gold/20" : "border-[--border-subtle] hover:border-[--border-subtle]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={key === "COMPLETED" ? "text-[--text-primary]" : key === "PENDING" ? "text-gold" : "text-[--text-primary]"} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[--text-secondary]">{cfg.label}</span>
              </div>
              <div className="text-xl font-bold text-[--text-primary]">{fmt(statusRevenue[key])} <span className="text-[10px] text-[--text-muted] font-normal">VND</span></div>
              <div className="text-[11px] text-[--text-muted] mt-0.5">{t("admin.transactionManagement.transactionsCount", { count: countByStatus[key] ?? 0 })}</div>
            </Card>
          );
        })}
      </div>

      {/* Revenue by plan */}
      {revenueStats?.revenueByPlan && Object.keys(revenueStats.revenueByPlan).length > 0 && (
        <Card className=" mt-4 bg-[--bg-surface] border border-[--border-subtle] p-4 gap-0 rounded-none shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-[--text-muted]" />
            <span className="text-[13px] font-semibold text-[--text-primary]">{t("admin.transactionManagement.revenueByPlanTitle")}</span>
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
        </Card>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <Input
            type="text"
            placeholder={t("admin.transactionManagement.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[250px] bg-[--bg-surface] border border-[--border-subtle] focus:border-[--border-subtle] px-3 py-2 text-[13px] text-[--text-primary] placeholder:text-zinc-400 outline-none transition-colors h-auto rounded-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 border-r border-[--border-subtle] pr-3 shrink-0">
            <Filter size={13} className="text-[--text-muted]" />
            {["ALL", "COMPLETED", "PENDING", "FAILED"].map(s => (
              <Button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`h-auto px-3 py-1.5 text-[11px] font-medium transition-colors border whitespace-nowrap ${
                  filterStatus === s
                    ? "bg-gold/10 text-gold border-gold/30"
                    : "text-[--text-muted] border-[--border-subtle] hover:text-[--text-primary]"
                }`}
              >
                {s === "ALL" ? t("admin.transactionManagement.filters.all") : STATUS_CONFIG[s]?.label}
              </Button>
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
              <option value="createdAt-desc">{t("admin.transactionManagement.sort.newestFirst")}</option>
              <option value="createdAt-asc">{t("admin.transactionManagement.sort.oldestFirst")}</option>
              <option value="amount-desc">{t("admin.transactionManagement.sort.amountHighToLow")}</option>
              <option value="amount-asc">{t("admin.transactionManagement.sort.amountLowToHigh")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flash */}
      {flash && (
        <div className="bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-[12px] px-4 py-3 rounded-md">
          {flash}
        </div>
      )}

      {/* Table */}
      <div className="bg-[--bg-surface] border border-[--border-subtle] overflow-x-auto">
        <Table className="w-full text-left border-collapse text-[12px]">
          <TableHeader>
            <TableRow className="bg-[--bg-elevated] border-b border-[--border-subtle] text-[--text-muted] uppercase text-[10px] font-semibold tracking-wider hover:bg-[--bg-elevated]">
              <TableHead className="px-4 py-3 h-auto">{t("admin.transactionManagement.table.orderCode")}</TableHead>
              <TableHead className="px-4 py-3 h-auto">{t("admin.transactionManagement.table.user")}</TableHead>
              <TableHead className="px-4 py-3 h-auto">{t("admin.transactionManagement.table.plan")}</TableHead>
              <TableHead className="px-4 py-3 h-auto">{t("admin.transactionManagement.table.amount")}</TableHead>
              <TableHead className="px-4 py-3 h-auto">{t("admin.transactionManagement.table.status")}</TableHead>
              <TableHead className="px-4 py-3 h-auto">{t("admin.transactionManagement.table.memo")}</TableHead>
              <TableHead className="px-4 py-3 h-auto">{t("admin.transactionManagement.table.bankRef")}</TableHead>
              <TableHead className="px-4 py-3 h-auto text-right">{t("admin.transactionManagement.table.createdAt")}</TableHead>
              <TableHead className="px-4 py-3 h-auto text-right">{t("admin.transactionManagement.table.completed")}</TableHead>
              <TableHead className="px-4 py-3 h-auto text-right">{t("admin.transactionManagement.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[--border-subtle] text-[--text-secondary]">
            {!transactions ? (
              <TableRow className="hover:bg-transparent"><TableCell colSpan={10} className="px-4 py-8 h-auto text-center text-[--text-muted] whitespace-normal">{t("admin.transactionManagement.table.loading")}</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent"><TableCell colSpan={10} className="px-4 py-8 h-auto text-center text-[--text-muted] whitespace-normal">{t("admin.transactionManagement.table.empty")}</TableCell></TableRow>
            ) : filtered.map((tx, i) => {
              const statusCfg = STATUS_CONFIG[tx.status] || {};
              const planCfg = PLAN_CONFIG[tx.plan] || {};
              const date = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" }) : "—";
              return (
                <TableRow key={tx.id || i} className="hover:bg-[--bg-elevated] transition-colors">
                  <TableCell className="px-4 py-3 h-auto">
                    <span className="font-mono text-[11px] text-[--text-muted]">#{String(tx.orderCode || tx.id || "").slice(-8)}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 h-auto whitespace-normal">
                    <span className="font-medium text-[--text-primary] block text-[13px]">{tx.userName || "—"}</span>
                    <span className="text-[11px] text-[--text-muted]">{tx.userEmail || ""}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 h-auto">
                    {tx.plan ? (
                      <Badge variant="outline" className={`inline-flex px-2 py-0.5 text-[10px] font-bold border uppercase rounded-none ${planCfg.color || "bg-[--bg-elevated] text-[--text-secondary] border-[--border-subtle]"}`}>
                        {tx.plan}
                      </Badge>
                    ) : <span className="text-[--text-muted]">—</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 h-auto font-semibold text-[--text-primary]">
                    {fmt(tx.amount)} <span className="text-[10px] text-[--text-muted] font-normal">VND</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 h-auto">
                    <Badge variant="outline" className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium border rounded-none ${statusCfg.color || "bg-[--bg-elevated] text-[--text-muted] border-[--border-subtle]"}`}>
                      {statusCfg.label || tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 h-auto">
                    <div className="text-[11px] text-[--text-secondary] max-w-[150px] truncate" title={tx.memo}>
                      {tx.memo || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 h-auto font-mono text-[11px] text-[--text-muted]">
                    {tx.bankRef || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 h-auto text-right text-[--text-muted] text-[11px]">{date}</TableCell>
                  <TableCell className="px-4 py-3 h-auto text-right text-[--text-muted] text-[11px]">
                    {tx.completedAt ? new Date(tx.completedAt).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 h-auto text-right">
                    {tx.status === "PENDING" && (
                      <Button
                        onClick={() => handleComplete(tx.id)}
                        disabled={completing === tx.id}
                        title={t("admin.transactionManagement.confirmManual")}
                        className="h-auto inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/60 transition-colors disabled:opacity-50"
                      >
                        <CheckCheck size={11} className={completing === tx.id ? "animate-spin" : ""} />
                        {completing === tx.id ? "..." : t("admin.transactionManagement.confirm")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[--border-subtle] text-[11px] text-[--text-muted]">
            {t("admin.transactionManagement.showingCount", { shown: filtered.length, total: transactions?.length ?? 0 })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionManagement;

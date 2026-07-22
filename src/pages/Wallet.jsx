import React from "react";
import { useTranslation } from "react-i18next";
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft,
  History, TrendingUp, CreditCard, ShieldCheck,
  Calendar, Zap, CheckCircle2, Clock, ArrowRight,
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import { fetchWallet } from "../controllers/mcController";
import { formatAmount } from "../controllers/paymentController";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card } from "@/components/ui/card";

const statusStyle = (s) => {
  if (s === "Available") return "text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20";
  if (s === "Processing") return "text-amber-400 bg-amber-500/[0.08] border-amber-500/20";
  return "text-blue-400 bg-blue-500/[0.08] border-blue-500/20";
};

const Wallet = () => {
  const { t } = useTranslation();
  const { data: wallet, loading } = useApi(fetchWallet);
  const stats = wallet?.stats || {};
  const transactions = wallet?.history || [];
  const statusLabel = (s) => {
    if (s === "Available") return t('wallet.statusAvailable');
    if (s === "Processing") return t('wallet.statusProcessing');
    return t('wallet.statusEscrow');
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-white/[0.07]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            {t('wallet.myFinancialsPrefix')} <span className="text-[#f5a623]">{t('wallet.myFinancialsSuffix')}</span>
          </h1>
          <p className="text-[13px] text-zinc-500">{t('wallet.headerDesc')}</p>
        </div>
        <div className="flex gap-3">
          <Button className="flex items-center gap-2 px-4 py-2 h-auto rounded-md border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.14] text-[13px] font-medium transition-colors">
            <History size={15} /> {t('wallet.statement')}
          </Button>
          <Button className="flex items-center gap-2 px-4 py-2 h-auto rounded-md bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors">
            <CreditCard size={15} /> {t('wallet.requestPayout')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Balance card */}
          <Card className="bg-[#f5a623] rounded-md p-6 relative overflow-hidden gap-0 shadow-none">
            <div className="flex items-center gap-1.5 mb-4 text-black/60">
              <WalletIcon size={14} />
              <span className="text-[11px] font-medium uppercase tracking-wider">{t('wallet.balance')}</span>
            </div>
            <div className="mb-1">
              <span className="text-3xl font-bold text-black leading-none">
                {stats.available != null ? new Intl.NumberFormat("vi-VN").format(stats.available) : "0"}
              </span>
              <span className="text-sm font-semibold text-black/70 ml-1.5">VND</span>
            </div>
            <div className="flex items-center gap-1.5 text-black/60 text-[11px] font-medium mt-2">
              <TrendingUp size={12} /> {t('wallet.monthlyGrowth')}
            </div>

            <div className="border-t border-black/10 mt-5 pt-4 space-y-2.5">
              {[
                { icon: ShieldCheck, label: t('wallet.inEscrow'), val: stats.escrow },
                { icon: Clock, label: t('wallet.processing'), val: stats.processing },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[11px] text-black/60 flex items-center gap-1.5">
                    <Icon size={12} /> {label}
                  </span>
                  <span className="text-[12px] font-semibold text-black">
                    {val != null ? formatAmount(val) : "0 VND"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payout method */}
          <Card className="bg-[#111113] border border-white/[0.07] rounded-md p-5 gap-0 shadow-none">
            <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-4 pb-3 border-b border-white/[0.06]">{t('wallet.payoutMethod')}</h4>
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#09090b] border border-white/[0.07] rounded-md flex items-center justify-center text-[#f5a623] shrink-0">
                <CreditCard size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white">Techcombank VN</p>
                <p className="text-[11px] text-zinc-500">**** 8921</p>
              </div>
              <Button className="w-11 h-11 rounded-md border border-white/[0.07] flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors opacity-0 group-hover:opacity-100">
                <ArrowRight size={13} />
              </Button>
            </div>
            <Button hoverScale={1} className="mt-4 w-full py-2 h-auto rounded-md border border-white/[0.07] text-[12px] text-zinc-500 hover:text-white hover:border-[#f5a623]/30 transition-colors flex items-center justify-center gap-1.5">
              <Zap size={13} /> {t('wallet.manageMethods')}
            </Button>
          </Card>
        </div>

        {/* Main */}
        <div className="lg:col-span-3">
          <div className="bg-[#111113] border border-white/[0.07] rounded-md p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#f5a623]/[0.08] rounded-md flex items-center justify-center text-[#f5a623]">
                  <History size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white">{t('wallet.transactions')}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{t('wallet.lastTransactions', { count: transactions.length })}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#09090b] border border-white/[0.06] rounded-md">
                  <History size={13} className="text-zinc-500" />
                  <input type="text" placeholder={t('wallet.filterPlaceholder')} className="bg-transparent outline-none text-[12px] text-white w-28 placeholder:text-zinc-500" />
                </div>
                <Button className="flex items-center gap-1.5 px-3 py-1.5 h-auto border border-white/[0.07] rounded-md text-[12px] text-zinc-400 hover:text-white hover:border-white/[0.14] transition-colors">
                  <Calendar size={13} /> {t('wallet.thisMonth')}
                </Button>
              </div>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-[#09090b] rounded-md mb-3">
              {[t('wallet.details'), t('wallet.date'), t('wallet.amount'), t('wallet.status'), ""].map((h, i) => (
                <span key={i} className={`text-[10px] font-medium text-zinc-500 uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>{h}</span>
              ))}
            </div>

            {/* Transactions */}
            <div className="space-y-2">
              {transactions.length > 0 ? transactions.map((tx) => (
                <div key={tx.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-4 rounded-md border border-white/[0.04] hover:border-[#f5a623]/20 hover:bg-[#f5a623]/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${tx.amount?.startsWith("+") ? "bg-emerald-500/[0.08] text-emerald-400" : "bg-red-500/[0.08] text-red-400"}`}>
                      {tx.amount?.startsWith("+") ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-white truncate group-hover:text-[#f5a623] transition-colors">{tx.type}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{tx.from}</p>
                    </div>
                  </div>
                  <span className="text-[12px] text-zinc-500 md:text-center">{tx.date}</span>
                  <span className={`text-[14px] font-semibold md:text-center ${tx.amount?.startsWith("+") ? "text-white" : "text-zinc-500"}`}>{tx.amount}</span>
                  <div className="md:flex md:justify-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border ${statusStyle(tx.status)}`}>
                      {tx.status === "Available" ? <CheckCircle2 size={10} /> : tx.status === "Processing" ? <Clock size={10} /> : <ShieldCheck size={10} />}
                      {statusLabel(tx.status)}
                    </span>
                  </div>
                  <div className="md:flex md:justify-end">
                    <button className="w-11 h-11 rounded-md border border-white/[0.07] flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-16 text-center">
                  <History size={28} className="mx-auto text-zinc-800 mb-3" />
                  <p className="text-[13px] text-zinc-500">{t('wallet.noTransactions')}</p>
                </div>
              )}
            </div>

            {transactions.length > 0 && (
              <div className="flex justify-center pt-6 mt-2 border-t border-white/[0.06]">
                <Button className="px-6 py-2 h-auto rounded-md border border-white/[0.07] text-[12px] text-zinc-500 hover:text-white hover:border-[#f5a623]/30 transition-colors">
                  {t('wallet.loadFullHistory')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

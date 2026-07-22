import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus, Trash2, Edit2, Check, X, Tag, Package,
  ChevronDown, ChevronUp, Save, RefreshCw, AlertCircle,
  Percent, DollarSign, Calendar, Infinity as InfinityIcon, ToggleLeft, ToggleRight,
  Settings, Clock
} from "lucide-react";
import api from "../../services/api";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const inputCls = "w-full bg-[#0d0d0f] border border-white/8 px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-white/[0.2] focus:bg-[#111114] placeholder:text-zinc-500 rounded-md transition-colors";
const inputClsShadcn = `${inputCls} h-auto rounded-none focus-visible:ring-0`;
const labelCls = "block text-[11px] font-medium text-zinc-400 mb-1.5 tracking-wide";
const sectionHead = "text-[11px] text-zinc-400 uppercase tracking-widest font-semibold px-4 py-2 border-b border-white/5";
const fieldGroupCls = "bg-white/2 border border-white/5 rounded-md p-4 space-y-4";

function formatVnd(n) {
  return n ? n.toLocaleString("vi-VN") + "đ" : "0đ";
}

// ── Plan Editor ──────────────────────────────────────────────────────────────

function PlanEditor({ plan, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ ...plan });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlightDraft, setHighlightDraft] = useState("");

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addHighlight = () => {
    const t = highlightDraft.trim();
    if (!t) return;
    set("highlights", [...(form.highlights || []), t]);
    setHighlightDraft("");
  };

  const removeHighlight = (i) =>
    set("highlights", (form.highlights || []).filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/plans/${plan.id}`, form);
      onSave();
    } catch (e) {
      alert(e.response?.data?.message || t('admin.planManager.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const PLAN_ACCENT = { FREE: "#71717a", DAILY: "#10b981", BASIC: "#f5a623", FULL: "#3b82f6", ANNUAL: "#a855f7" };
  const accent = PLAN_ACCENT[plan.plan] || "#f5a623";

  // Discount helpers
  const setDiscountByPercent = (pct) => {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    const discounted = p > 0 ? Math.round(form.priceVnd * (1 - p / 100)) : 0;
    setForm(f => ({ ...f, discountPercent: p, discountedPriceVnd: discounted }));
  };
  const setDiscountByAmount = (vnd) => {
    const amount = Math.max(0, Number(vnd) || 0);
    const pct = form.priceVnd > 0 ? Math.round((amount / form.priceVnd) * 100 * 10) / 10 : 0;
    const discounted = amount > 0 ? Math.max(0, form.priceVnd - amount) : 0;
    setForm(f => ({ ...f, discountPercent: pct, discountedPriceVnd: discounted }));
  };
  const clearDiscount = () => setForm(f => ({ ...f, discountPercent: 0, discountedPriceVnd: 0 }));
  const discountActive = form.discountedPriceVnd > 0 && form.discountPercent > 0;

  return (
    <div className="border border-white/7 bg-[#111113] rounded overflow-hidden">
      {/* Header row */}
      <Button
        onClick={() => setExpanded(e => !e)}
        hoverScale={1}
        className="w-full flex items-center justify-between px-5 py-4 h-auto hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
          <span className="text-[14px] font-semibold text-white">{form.displayName}</span>
          <span className="text-[11px] text-zinc-500 font-mono">{plan.plan}</span>
          {form.badge && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-zinc-400 border border-white/7">
              {form.badge}
            </span>
          )}
          {discountActive ? (
            <span className="flex items-center gap-2">
              <span className="text-[12px] text-zinc-500 line-through">{formatVnd(form.priceVnd)}</span>
              <span className="text-[13px] font-bold" style={{ color: accent }}>{formatVnd(form.discountedPriceVnd)}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20 font-semibold">-{form.discountPercent}%</span>
            </span>
          ) : (
            <span className="text-[13px] font-bold" style={{ color: accent }}>{formatVnd(form.priceVnd)}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] px-2 py-0.5 rounded ${form.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {form.active ? t('admin.planManager.visible') : t('admin.planManager.hidden')}
          </span>
          {expanded ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
        </div>
      </Button>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-6 space-y-4">

          {/* Section 1 — Core info */}
          <div className={fieldGroupCls}>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{t('admin.planManager.basicInfo')}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t('admin.planManager.displayName')}</label>
                <Input className={inputClsShadcn} value={form.displayName || ""} onChange={e => set("displayName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.planManager.priceVnd')}</label>
                <Input className={inputClsShadcn} type="number" value={form.priceVnd || 0} onChange={e => set("priceVnd", Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  {t('admin.planManager.durationDays')}&nbsp;
                  <span className="text-zinc-500 normal-case font-normal">
                    ({form.durationDays === 0 ? t('admin.planManager.forever') : t('admin.planManager.daysCount', { count: form.durationDays })})
                  </span>
                </label>
                <Input className={inputClsShadcn} type="number" value={form.durationDays || 0} onChange={e => set("durationDays", Number(e.target.value))} />
              </div>
              <div>
                <label className={labelCls}>
                  {t('admin.planManager.aiSessionPerMonth')}&nbsp;
                  <span className="text-zinc-500 normal-case font-normal">
                    ({form.aiSessionLimit >= 999 ? t('admin.planManager.unlimited') : form.aiSessionLimit})
                  </span>
                </label>
                <Input className={inputClsShadcn} type="number" value={form.aiSessionLimit || 0} onChange={e => set("aiSessionLimit", Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t('admin.planManager.tagline')}</label>
              <Input className={inputClsShadcn} value={form.tagline || ""} onChange={e => set("tagline", e.target.value)} placeholder={t('admin.planManager.taglinePlaceholder')} />
            </div>
            <div>
              <label className={labelCls}>{t('admin.planManager.detailedDescription')}</label>
              <textarea
                className={inputCls + " resize-none"}
                rows={2}
                value={form.description || ""}
                onChange={e => set("description", e.target.value)}
                placeholder={t('admin.planManager.detailedDescriptionPlaceholder')}
              />
            </div>
          </div>

          {/* Section 2 — Marketing copy */}
          <div className={fieldGroupCls}>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{t('admin.planManager.marketing')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>{t('admin.planManager.badge')}</label>
                <Input className={inputClsShadcn} value={form.badge || ""} placeholder={t('admin.planManager.badgePlaceholder')} onChange={e => set("badge", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.planManager.socialProof')}</label>
                <Input className={inputClsShadcn} value={form.socialProof || ""} placeholder={t('admin.planManager.socialProofPlaceholder')} onChange={e => set("socialProof", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.planManager.urgencyText')}</label>
                <Input className={inputClsShadcn} value={form.urgencyText || ""} placeholder={t('admin.planManager.urgencyTextPlaceholder')} onChange={e => set("urgencyText", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3 — Highlights */}
          <div className={fieldGroupCls}>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{t('admin.planManager.highlights')}</p>
            <div className="space-y-2">
              {(form.highlights || []).map((h, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/3 border border-white/6 px-3 py-2 rounded-md">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span className="flex-1 text-[13px] text-zinc-300">{h}</span>
                  <Button onClick={() => removeHighlight(i)} className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 h-auto bg-transparent">
                    <X size={13} />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Input
                className={inputClsShadcn}
                value={highlightDraft}
                onChange={e => setHighlightDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                placeholder={t('admin.planManager.highlightPlaceholder')}
              />
              <Button
                onClick={addHighlight}
                className="shrink-0 px-3.5 py-2 h-auto bg-white/5 border border-white/8 text-zinc-300 hover:text-white hover:border-white/18 transition-colors rounded-md"
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Section 4 — Discount */}
          <div className="border border-white/7 rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white/2 border-b border-white/5">
              <p className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                <Percent size={12} className="text-red-400" />
                {t('admin.planManager.directDiscount')}
              </p>
              {discountActive && (
                <Button onClick={clearDiscount} className="text-[10px] h-auto p-0 bg-transparent text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1">
                  <X size={10} /> {t('admin.planManager.removeDiscount')}
                </Button>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>{t('admin.planManager.discountPercent')}</label>
                  <Input
                    className={inputClsShadcn}
                    type="number" min="0" max="100" step="1"
                    value={form.discountPercent || ""}
                    placeholder="0"
                    onChange={e => setDiscountByPercent(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t('admin.planManager.discountAmount')}</label>
                  <Input
                    className={inputClsShadcn}
                    type="number" min="0"
                    value={form.discountedPriceVnd && form.discountPercent ? form.priceVnd - form.discountedPriceVnd : ""}
                    placeholder="0"
                    onChange={e => setDiscountByAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t('admin.planManager.priceAfterDiscount')}</label>
                  <div className={inputCls + " flex items-center gap-2 cursor-default"}>
                    {discountActive ? (
                      <>
                        <span className="font-bold text-red-400">{formatVnd(form.discountedPriceVnd)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">-{form.discountPercent}%</span>
                      </>
                    ) : (
                      <span className="text-zinc-500">{t('admin.planManager.noDiscountYet')}</span>
                    )}
                  </div>
                </div>
              </div>
              {discountActive && (
                <p className="text-[11px] text-zinc-500 bg-red-500/5 border border-red-500/10 rounded-md px-3 py-2">
                  {t('admin.planManager.userPreview')}:&nbsp;
                  <span className="line-through text-zinc-500">{formatVnd(form.priceVnd)}</span>
                  {" → "}
                  <span className="text-red-400 font-semibold">{formatVnd(form.discountedPriceVnd)}</span>
                  {" · "}
                  <span className="text-zinc-500">{t('admin.planManager.savingsAmount', { amount: formatVnd(form.priceVnd - form.discountedPriceVnd), percent: form.discountPercent })}</span>
                </p>
              )}
            </div>
          </div>

          {/* Footer — Active toggle + Save */}
          <div className="flex items-center justify-between pt-1">
            <Button
              onClick={() => set("active", !form.active)}
              className={`flex items-center gap-2 text-[13px] font-medium h-auto p-0 bg-transparent transition-colors ${form.active ? "text-emerald-400" : "text-zinc-500"}`}
            >
              {form.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              {form.active ? t('admin.planManager.showing') : t('admin.planManager.hiding')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 h-auto bg-[#f5a623] text-black text-[13px] font-bold hover:bg-[#e09515] disabled:opacity-50 transition-colors rounded-md"
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              {t('admin.planManager.saveChanges')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Discount Manager ─────────────────────────────────────────────────────────

const EMPTY_DISCOUNT = {
  code: "", type: "PERCENT", discountValue: 10, maxUses: 0,
  applicablePlans: [], startsAt: "", expiresAt: "", description: "", active: true, showInSidebar: false,
};

const ALL_PLANS = ["BASIC", "FULL", "ANNUAL"];

function DiscountRow({ discount, onUpdate, onDelete }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...discount });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const togglePlan = (plan) => {
    const cur = form.applicablePlans || [];
    set("applicablePlans", cur.includes(plan) ? cur.filter(p => p !== plan) : [...cur, plan]);
  };

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      await api.put(`/admin/plans/discounts/${discount.id}`, form);
      onUpdate();
      setEditing(false);
    } catch (e) {
      setErr(e.response?.data?.message || t('admin.planManager.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('admin.planManager.confirmDeleteCode', { code: discount.code }))) return;
    try {
      await api.delete(`/admin/plans/discounts/${discount.id}`);
      onDelete();
    } catch {
      setErr(t('admin.planManager.deleteFailed'));
    }
  };

  const now = new Date();
  const isExpired = discount.expiresAt && new Date(discount.expiresAt) < now;
  const isNotStarted = discount.startsAt && new Date(discount.startsAt) > now;
  const isMaxed = discount.maxUses > 0 && discount.usedCount >= discount.maxUses;
  const statusLabel = !discount.active ? t('admin.planManager.statusOff') : isExpired ? t('admin.planManager.statusExpired') : isMaxed ? t('admin.planManager.statusUsedUp') : isNotStarted ? t('admin.planManager.statusNotStarted') : t('admin.planManager.statusActive');
  const statusOk = discount.active && !isExpired && !isMaxed && !isNotStarted;

  if (!editing) {
    return (
      <div className="group flex items-center justify-between px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <span className="font-mono text-[13px] font-bold text-white tracking-wider">{discount.code}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
            discount.type === "PERCENT"
              ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            {discount.type === "PERCENT" ? `-${discount.discountValue}%` : `-${formatVnd(discount.discountValue)}`}
          </span>
          <span className="text-[11px] text-zinc-500 tabular-nums">
            {t('admin.planManager.usedCountOf', { used: discount.usedCount ?? 0, max: discount.maxUses || "∞" })}
          </span>
          {discount.maxUses > 0 && (() => {
            const remaining = discount.maxUses - (discount.usedCount ?? 0);
            const pct = ((discount.usedCount ?? 0) / discount.maxUses) * 100;
            const color = remaining === 0 ? "text-red-400 border-red-500/20 bg-red-500/10"
              : pct >= 80 ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
              : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
            return (
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border tabular-nums ${color}`}>
                {t('admin.planManager.remainingCount', { count: remaining })}
              </span>
            );
          })()}
          {discount.applicablePlans?.length > 0 && (
            <span className="text-[11px] text-zinc-500 bg-white/3 px-2 py-0.5 rounded">
              {discount.applicablePlans.join(" · ")}
            </span>
          )}
          {(discount.startsAt || discount.expiresAt) && (
            <span className={`text-[10px] tabular-nums flex items-center gap-1 ${isExpired ? "text-red-400" : isNotStarted ? "text-amber-400" : "text-zinc-500"}`}>
              <Calendar size={9} />
              {discount.startsAt && !discount.expiresAt && t('admin.planManager.fromDate', { date: new Date(discount.startsAt).toLocaleDateString("vi-VN") })}
              {!discount.startsAt && discount.expiresAt && (isExpired ? t('admin.planManager.statusExpired') : `→ ${new Date(discount.expiresAt).toLocaleDateString("vi-VN")}`)}
              {discount.startsAt && discount.expiresAt && `${new Date(discount.startsAt).toLocaleDateString("vi-VN")} → ${new Date(discount.expiresAt).toLocaleDateString("vi-VN")}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {discount.showInSidebar && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1">
              <Tag size={8} /> {t('admin.planManager.sidebar')}
            </span>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
            statusOk
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {statusLabel}
          </span>
          <Button onClick={() => setEditing(true)} className="p-1.5 h-auto text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <Edit2 size={13} />
          </Button>
          <Button onClick={handleDelete} className="p-1.5 h-auto text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-amber-500/20 bg-[#0f0f11] rounded-md mx-2 my-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-amber-500/5 border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <Edit2 size={12} className="text-amber-400" />
          <span className="text-[11px] font-semibold text-amber-400 tracking-wide">{t('admin.planManager.editingCode', { code: discount.code })}</span>
        </div>
        <Button onClick={() => setEditing(false)} className="p-1 h-auto bg-transparent text-zinc-500 hover:text-white transition-colors rounded">
          <X size={13} />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Row 1: code + type + value */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>{t('admin.planManager.discountCode')}</label>
            <Input className={inputClsShadcn + " font-mono uppercase tracking-widest"} value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className={labelCls}>{t('admin.planManager.discountType')}</label>
            <select className={inputCls} value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="PERCENT">{t('admin.planManager.percentType')}</option>
              <option value="FIXED">{t('admin.planManager.fixedType')}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{form.type === "PERCENT" ? t('admin.planManager.valuePercent') : t('admin.planManager.valueVnd')}</label>
            <Input className={inputClsShadcn} type="number" value={form.discountValue} onChange={e => set("discountValue", Number(e.target.value))} />
          </div>
        </div>

        {/* Row 2: time window + quota */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">{t('admin.planManager.effectiveTime')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('admin.planManager.startsAt')} <span className="text-zinc-500 font-normal">{t('admin.planManager.emptyMeansNow')}</span></label>
              <Input className={inputClsShadcn} type="datetime-local" value={form.startsAt ? form.startsAt.slice(0, 16) : ""} onChange={e => set("startsAt", e.target.value || null)} />
            </div>
            <div>
              <label className={labelCls}>{t('admin.planManager.expiresAt')} <span className="text-zinc-500 font-normal">{t('admin.planManager.emptyMeansNoExpiry')}</span></label>
              <Input className={inputClsShadcn} type="datetime-local" value={form.expiresAt ? form.expiresAt.slice(0, 16) : ""} onChange={e => set("expiresAt", e.target.value || null)} />
            </div>
          </div>
        </div>

        {/* Row 3: max uses */}
        <div>
          <label className={labelCls}>{t('admin.planManager.maxUses')} <span className="text-zinc-500 font-normal">{t('admin.planManager.zeroMeansUnlimited')}</span></label>
          <Input className={inputClsShadcn + " max-w-[200px]"} type="number" min="0" value={form.maxUses} onChange={e => set("maxUses", Number(e.target.value))} />
        </div>

        {/* Row 4: applicable plans */}
        <div>
          <label className={labelCls}>{t('admin.planManager.applicablePlans')} <span className="text-zinc-500 font-normal">{t('admin.planManager.emptyMeansAll')}</span></label>
          <div className="flex gap-2 mt-1.5">
            {ALL_PLANS.map(p => (
              <Button
                key={p}
                type="button"
                onClick={() => togglePlan(p)}
                className={`px-3 py-1.5 h-auto text-[11px] font-semibold rounded-md border transition-all ${
                  (form.applicablePlans || []).includes(p)
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-sm"
                    : "bg-white/2 text-zinc-500 border-white/6 hover:border-white/12 hover:text-zinc-300"
                }`}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        {/* Row 5: description */}
        <div>
          <label className={labelCls}>{t('admin.planManager.internalNote')}</label>
          <Input className={inputClsShadcn} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder={t('admin.planManager.internalNotePlaceholder')} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => set("active", !form.active)}
              className={`flex items-center gap-1.5 text-[12px] font-medium h-auto p-0 bg-transparent transition-colors ${form.active ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {form.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {form.active ? t('admin.planManager.statusActive') : t('admin.planManager.statusOff')}
            </Button>
            <span className="text-zinc-500">·</span>
            <Button
              type="button"
              onClick={() => set("showInSidebar", !form.showInSidebar)}
              className={`flex items-center gap-1.5 text-[12px] font-medium h-auto p-0 bg-transparent transition-colors ${form.showInSidebar ? "text-violet-400 hover:text-violet-300" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {form.showInSidebar ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {form.showInSidebar ? t('admin.planManager.showInSidebar') : t('admin.planManager.hideFromSidebar')}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {err && <span className="text-[11px] text-red-400">{err}</span>}
            <Button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 h-auto text-[11px] text-zinc-400 hover:text-white border border-white/8 hover:border-white/16 rounded-md transition-colors">
              {t('admin.planManager.cancel')}
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 h-auto bg-amber-500 text-black text-[11px] font-bold hover:bg-amber-400 disabled:opacity-50 rounded-md transition-colors">
              {saving ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />}
              {t('admin.planManager.saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── New Discount Form ────────────────────────────────────────────────────────

function NewDiscountForm({ onCreated }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ ...EMPTY_DISCOUNT });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const togglePlan = (plan) => {
    const cur = form.applicablePlans || [];
    set("applicablePlans", cur.includes(plan) ? cur.filter(p => p !== plan) : [...cur, plan]);
  };

const [err, setErr] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { setErr(t('admin.planManager.enterCode')); return; }
    setSaving(true);
    setErr(null);
    try {
      await api.post("/admin/plans/discounts", form);
      onCreated();
      setForm({ ...EMPTY_DISCOUNT });
      setOpen(false);
    } catch (e) {
      setErr(e.response?.data?.message || t('admin.planManager.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 h-auto bg-amber-500/8 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/35 text-[12px] font-semibold transition-all rounded-md"
      >
        <Plus size={13} />
        {t('admin.planManager.createDiscountCode')}
      </Button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="border border-emerald-500/20 bg-[#0f0f11] rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-500/5 border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <Plus size={12} className="text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">{t('admin.planManager.createNewDiscountCode')}</span>
        </div>
        <Button type="button" onClick={() => setOpen(false)} className="p-1 h-auto bg-transparent text-zinc-500 hover:text-white transition-colors rounded">
          <X size={13} />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Row 1: code + type + value */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>{t('admin.planManager.discountCode')} <span className="text-red-400">*</span></label>
            <Input className={inputClsShadcn + " font-mono uppercase tracking-widest"} value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="LUCKY8PM" required />
          </div>
          <div>
            <label className={labelCls}>{t('admin.planManager.discountType')} <span className="text-red-400">*</span></label>
            <select className={inputCls} value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="PERCENT">{t('admin.planManager.percentType')}</option>
              <option value="FIXED">{t('admin.planManager.fixedType')}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{form.type === "PERCENT" ? t('admin.planManager.valuePercent') : t('admin.planManager.valueVnd')} <span className="text-red-400">*</span></label>
            <Input className={inputClsShadcn} type="number" min="1" value={form.discountValue} onChange={e => set("discountValue", Number(e.target.value))} required />
          </div>
        </div>

        {/* Row 2: time window */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1.5">
            <Clock size={9} /> {t('admin.planManager.flashDealEffectiveTime')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('admin.planManager.startsAt')} <span className="text-zinc-500 font-normal">{t('admin.planManager.emptyMeansNow')}</span></label>
              <Input className={inputClsShadcn} type="datetime-local" value={form.startsAt} onChange={e => set("startsAt", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t('admin.planManager.expiresAt')} <span className="text-zinc-500 font-normal">{t('admin.planManager.emptyMeansNoExpiry')}</span></label>
              <Input className={inputClsShadcn} type="datetime-local" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Row 3: quota */}
        <div>
          <label className={labelCls}>{t('admin.planManager.maxUses')} <span className="text-zinc-500 font-normal">{t('admin.planManager.zeroMeansUnlimited')}</span></label>
          <Input className={inputClsShadcn + " max-w-[200px]"} type="number" min="0" value={form.maxUses} onChange={e => set("maxUses", Number(e.target.value))} />
        </div>

        {/* Row 4: applicable plans */}
        <div>
          <label className={labelCls}>{t('admin.planManager.applicablePlans')} <span className="text-zinc-500 font-normal">{t('admin.planManager.emptyMeansAll')}</span></label>
          <div className="flex gap-2 mt-1.5">
            {ALL_PLANS.map(p => (
              <Button
                type="button"
                key={p}
                onClick={() => togglePlan(p)}
                className={`px-3 py-1.5 h-auto text-[11px] font-semibold rounded-md border transition-all ${
                  (form.applicablePlans || []).includes(p)
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-white/2 text-zinc-500 border-white/6 hover:border-white/12 hover:text-zinc-300"
                }`}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        {/* Row 5: description */}
        <div>
          <label className={labelCls}>{t('admin.planManager.internalNote')}</label>
          <Input className={inputClsShadcn} value={form.description} onChange={e => set("description", e.target.value)} placeholder={t('admin.planManager.flashDealPlaceholder')} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => set("active", !form.active)}
              className={`flex items-center gap-1.5 text-[12px] font-medium h-auto p-0 bg-transparent transition-colors ${form.active ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {form.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {form.active ? t('admin.planManager.activate') : t('admin.planManager.draft')}
            </Button>
            <span className="text-zinc-500">·</span>
            <Button
              type="button"
              onClick={() => set("showInSidebar", !form.showInSidebar)}
              className={`flex items-center gap-1.5 text-[12px] font-medium h-auto p-0 bg-transparent transition-colors ${form.showInSidebar ? "text-violet-400 hover:text-violet-300" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {form.showInSidebar ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {form.showInSidebar ? t('admin.planManager.showInSidebar') : t('admin.planManager.hideFromSidebar')}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {err && <span className="text-[11px] text-red-400">{err}</span>}
            <Button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 h-auto text-[11px] text-zinc-400 hover:text-white border border-white/8 hover:border-white/16 rounded-md transition-colors">
              {t('admin.planManager.cancel')}
            </Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 h-auto bg-emerald-500 text-black text-[11px] font-bold hover:bg-emerald-400 disabled:opacity-50 rounded-md transition-colors">
              {saving ? <RefreshCw size={11} className="animate-spin" /> : <Plus size={11} />}
              {t('admin.planManager.createCode')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Main PlanManager ─────────────────────────────────────────────────────────

const PlanManager = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [tab, setTab] = useState("plans");

  // Settings tab — guest cooldown
  const [cooldownHours, setCooldownHours] = useState(3);
  const [cooldownInput, setCooldownInput] = useState("3");
  const [cooldownSaving, setCooldownSaving] = useState(false);
  const [cooldownMsg, setCooldownMsg] = useState(null);

  const fetchCooldown = useCallback(async () => {
    try {
      const res = await api.get("/admin/settings/guest-cooldown");
      const h = res.data?.data?.hours ?? 3;
      setCooldownHours(h);
      setCooldownInput(String(h));
    } catch { /* use default */ }
  }, []);

  const saveCooldown = async () => {
    const h = parseInt(cooldownInput, 10);
    if (!h || h < 1 || h > 168) { setCooldownMsg({ type: "error", text: t('admin.planManager.cooldownRangeError') }); return; }
    setCooldownSaving(true);
    setCooldownMsg(null);
    try {
      await api.put(`/admin/settings/guest-cooldown?hours=${h}`);
      setCooldownHours(h);
      setCooldownMsg({ type: "success", text: t('admin.planManager.cooldownUpdated', { hours: h }) });
    } catch (e) {
      setCooldownMsg({ type: "error", text: e.response?.data?.message || t('admin.planManager.saveFailedDot') });
    } finally {
      setCooldownSaving(false);
      setTimeout(() => setCooldownMsg(null), 3000);
    }
  };

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get("/admin/plans");
      setPlans(res.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoadingPlans(false); }
  }, []);

  const fetchDiscounts = useCallback(async () => {
    setLoadingDiscounts(true);
    try {
      const res = await api.get("/admin/plans/discounts");
      setDiscounts(res.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoadingDiscounts(false); }
  }, []);

  useEffect(() => { fetchPlans(); fetchDiscounts(); fetchCooldown(); }, [fetchPlans, fetchDiscounts, fetchCooldown]);

  const PLAN_ORDER = { FREE: 0, BASIC: 1, FULL: 2, ANNUAL: 3 };
  const sortedPlans = [...plans].sort((a, b) => (PLAN_ORDER[a.plan] ?? 9) - (PLAN_ORDER[b.plan] ?? 9));

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 border-b border-white/6">
        {[
          { id: "plans", label: t('admin.planManager.tabPlans'), icon: Package },
          { id: "discounts", label: t('admin.planManager.tabDiscounts'), icon: Tag },
          { id: "settings", label: t('admin.planManager.tabSettings'), icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            onClick={() => setTab(id)}
            hoverScale={1}
            className={`flex items-center gap-2 px-4 py-3 h-auto rounded-none border-b-2 -mb-px text-[13px] font-medium transition-colors ${
              tab === id
                ? "border-[#f5a623] text-[#f5a623]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon size={14} />
            {label}
          </Button>
        ))}
      </div>

      {/* Plans tab */}
      {tab === "plans" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-zinc-500">
              {t('admin.planManager.plansTabDesc')}
            </p>
            <Button onClick={fetchPlans} className="flex items-center gap-1.5 h-auto p-0 bg-transparent text-[11px] text-zinc-500 hover:text-white transition-colors">
              <RefreshCw size={12} />
              {t('admin.planManager.refresh')}
            </Button>
          </div>

          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <RefreshCw size={20} className="animate-spin mb-3" />
              <p className="text-[12px]">{t('admin.planManager.loading')}</p>
            </div>
          ) : sortedPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <AlertCircle size={20} className="mb-3" />
              <p className="text-[12px]">{t('admin.planManager.noPlansInDb')}</p>
              <p className="text-[11px] mt-1">{t('admin.planManager.restartBackendHint')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedPlans.map(plan => (
                <PlanEditor key={plan.id} plan={plan} onSave={fetchPlans} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === "settings" && (
        <div className="space-y-6 max-w-lg">
          {/* Guest cooldown card */}
          <Card className="border border-white/7 rounded-md overflow-hidden gap-0 shadow-none">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/2">
              <Clock size={13} className="text-amber-400" />
              <span className="text-[12px] font-semibold text-white">{t('admin.planManager.guestCooldownTitle')}</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[12px] text-zinc-400 leading-relaxed">
                {t('admin.planManager.guestCooldownDesc')}<br />
                {t('admin.planManager.currentLabel')}: <span className="text-amber-400 font-semibold">{t('admin.planManager.hoursCount', { count: cooldownHours })}</span>.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/7 rounded px-3 py-2 w-28">
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={cooldownInput}
                    onChange={e => setCooldownInput(e.target.value)}
                    className="bg-transparent outline-none text-[13px] text-white w-full"
                  />
                  <span className="text-[11px] text-zinc-500 shrink-0">{t('admin.planManager.hoursUnit')}</span>
                </div>
                <Button
                  onClick={saveCooldown}
                  disabled={cooldownSaving}
                  className="flex items-center gap-1.5 px-3 py-2 h-auto rounded bg-amber-500 text-black text-[12px] font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {cooldownSaving
                    ? <RefreshCw size={12} className="animate-spin" />
                    : <Save size={12} />
                  }
                  {t('admin.planManager.save')}
                </Button>
              </div>
              {cooldownMsg && (
                <p className={`text-[11px] font-medium ${cooldownMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {cooldownMsg.text}
                </p>
              )}
              <p className="text-[10px] text-zinc-500">{t('admin.planManager.cooldownRangeHint')}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Discounts tab */}
      {tab === "discounts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-zinc-500">
                {t('admin.planManager.discountsTabDesc', { count: discounts.length })}
              </p>
            </div>
            <Button onClick={fetchDiscounts} className="flex items-center gap-1.5 h-auto p-0 bg-transparent text-[11px] text-zinc-500 hover:text-white transition-colors">
              <RefreshCw size={12} />
              {t('admin.planManager.refresh')}
            </Button>
          </div>

          {/* Voucher stats summary */}
          {discounts.length > 0 && (() => {
            const now = new Date();
            const active = discounts.filter(d => d.active && !(d.expiresAt && new Date(d.expiresAt) < now) && !(d.maxUses > 0 && (d.usedCount ?? 0) >= d.maxUses) && !(d.startsAt && new Date(d.startsAt) > now));
            const totalRemaining = discounts.filter(d => d.maxUses > 0).reduce((sum, d) => sum + Math.max(0, d.maxUses - (d.usedCount ?? 0)), 0);
            const unlimited = discounts.filter(d => d.active && d.maxUses === 0).length;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: t('admin.planManager.statActive'), value: active.length, sub: t('admin.planManager.statOfCodes', { count: discounts.length }), color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
                  { label: t('admin.planManager.statRemainingUses'), value: totalRemaining, sub: unlimited > 0 ? t('admin.planManager.statUnlimitedCodes', { count: unlimited }) : t('admin.planManager.statTotalLimited'), color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
                  { label: t('admin.planManager.statUsed'), value: discounts.reduce((s, d) => s + (d.usedCount ?? 0), 0), sub: t('admin.planManager.statTotalUses'), color: "text-zinc-400", border: "border-white/10", bg: "bg-white/[0.02]" },
                ].map(({ label, value, sub, color, border, bg }) => (
                  <Card key={label} className={`rounded-md border ${border} ${bg} px-4 py-3 gap-0 shadow-none`}>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>
                  </Card>
                ))}
              </div>
            );
          })()}

          <NewDiscountForm onCreated={fetchDiscounts} />

          {loadingDiscounts ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <RefreshCw size={18} className="animate-spin mr-2" />
              <span className="text-[12px]">{t('admin.planManager.loading')}</span>
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Tag size={24} className="mx-auto mb-3 opacity-30" />
              <p className="text-[12px]">{t('admin.planManager.noDiscountsYet')}</p>
            </div>
          ) : (
            <div className="border border-white/7 rounded overflow-hidden">
              <div className={sectionHead}>
                <span>{t('admin.planManager.discountTableHeader')}</span>
              </div>
              {discounts.map(d => (
                <DiscountRow key={d.id} discount={d} onUpdate={fetchDiscounts} onDelete={fetchDiscounts} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanManager;

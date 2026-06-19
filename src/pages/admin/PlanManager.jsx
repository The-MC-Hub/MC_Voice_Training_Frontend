import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Edit2, Check, X, Tag, Package,
  ChevronDown, ChevronUp, Save, RefreshCw, AlertCircle,
  Percent, DollarSign, Calendar, Infinity as InfinityIcon, ToggleLeft, ToggleRight,
  Settings, Clock
} from "lucide-react";
import api from "../../services/api";

const inputCls = "w-full bg-[#0d0d0f] border border-white/8 px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-white/[0.2] focus:bg-[#111114] placeholder:text-zinc-600 rounded-lg transition-colors";
const labelCls = "block text-[11px] font-medium text-zinc-400 mb-1.5 tracking-wide";
const sectionHead = "text-[11px] text-zinc-400 uppercase tracking-widest font-semibold px-4 py-2 border-b border-white/5";
const fieldGroupCls = "bg-white/2 border border-white/5 rounded-xl p-4 space-y-4";

function formatVnd(n) {
  return n ? n.toLocaleString("vi-VN") + "đ" : "0đ";
}

// ── Plan Editor ──────────────────────────────────────────────────────────────

function PlanEditor({ plan, onSave }) {
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
      alert(e.response?.data?.message || "Lưu thất bại");
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
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors"
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
            {form.active ? "Hiện" : "Ẩn"}
          </span>
          {expanded ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-6 space-y-4">

          {/* Section 1 — Core info */}
          <div className={fieldGroupCls}>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Thông tin cơ bản</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tên hiển thị</label>
                <input className={inputCls} value={form.displayName || ""} onChange={e => set("displayName", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Giá (VNĐ)</label>
                <input className={inputCls} type="number" value={form.priceVnd || 0} onChange={e => set("priceVnd", Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Số ngày&nbsp;
                  <span className="text-zinc-600 normal-case font-normal">
                    ({form.durationDays === 0 ? "Vĩnh viễn" : form.durationDays + " ngày"})
                  </span>
                </label>
                <input className={inputCls} type="number" value={form.durationDays || 0} onChange={e => set("durationDays", Number(e.target.value))} />
              </div>
              <div>
                <label className={labelCls}>
                  AI session/tháng&nbsp;
                  <span className="text-zinc-600 normal-case font-normal">
                    ({form.aiSessionLimit >= 999 ? "Không giới hạn" : form.aiSessionLimit})
                  </span>
                </label>
                <input className={inputCls} type="number" value={form.aiSessionLimit || 0} onChange={e => set("aiSessionLimit", Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input className={inputCls} value={form.tagline || ""} onChange={e => set("tagline", e.target.value)} placeholder="Mô tả ngắn hiển thị dưới tên gói..." />
            </div>
            <div>
              <label className={labelCls}>Mô tả chi tiết</label>
              <textarea
                className={inputCls + " resize-none"}
                rows={2}
                value={form.description || ""}
                onChange={e => set("description", e.target.value)}
                placeholder="Nội dung mô tả đầy đủ (không bắt buộc)..."
              />
            </div>
          </div>

          {/* Section 2 — Marketing copy */}
          <div className={fieldGroupCls}>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Marketing</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Badge</label>
                <input className={inputCls} value={form.badge || ""} placeholder="Phổ biến nhất..." onChange={e => set("badge", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Social proof</label>
                <input className={inputCls} value={form.socialProof || ""} placeholder="92% MC chọn..." onChange={e => set("socialProof", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Urgency text</label>
                <input className={inputCls} value={form.urgencyText || ""} placeholder="Chỉ còn 8 chỗ..." onChange={e => set("urgencyText", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3 — Highlights */}
          <div className={fieldGroupCls}>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Quyền lợi nổi bật</p>
            <div className="space-y-2">
              {(form.highlights || []).map((h, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/3 border border-white/6 px-3 py-2 rounded-lg">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span className="flex-1 text-[13px] text-zinc-300">{h}</span>
                  <button onClick={() => removeHighlight(i)} className="text-zinc-600 hover:text-red-400 transition-colors p-0.5">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                className={inputCls}
                value={highlightDraft}
                onChange={e => setHighlightDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                placeholder="Thêm quyền lợi rồi nhấn Enter..."
              />
              <button
                onClick={addHighlight}
                className="shrink-0 px-3.5 py-2 bg-white/5 border border-white/8 text-zinc-300 hover:text-white hover:border-white/18 transition-colors rounded-lg"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Section 4 — Discount */}
          <div className="border border-white/7 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white/2 border-b border-white/5">
              <p className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                <Percent size={12} className="text-red-400" />
                Giảm giá trực tiếp trên gói
              </p>
              {discountActive && (
                <button onClick={clearDiscount} className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1">
                  <X size={10} /> Xoá giảm giá
                </button>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Giảm (%)</label>
                  <input
                    className={inputCls}
                    type="number" min="0" max="100" step="1"
                    value={form.discountPercent || ""}
                    placeholder="0"
                    onChange={e => setDiscountByPercent(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Giảm theo tiền (đ)</label>
                  <input
                    className={inputCls}
                    type="number" min="0"
                    value={form.discountedPriceVnd && form.discountPercent ? form.priceVnd - form.discountedPriceVnd : ""}
                    placeholder="0"
                    onChange={e => setDiscountByAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Giá sau giảm</label>
                  <div className={inputCls + " flex items-center gap-2 cursor-default"}>
                    {discountActive ? (
                      <>
                        <span className="font-bold text-red-400">{formatVnd(form.discountedPriceVnd)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">-{form.discountPercent}%</span>
                      </>
                    ) : (
                      <span className="text-zinc-600">Chưa có giảm giá</span>
                    )}
                  </div>
                </div>
              </div>
              {discountActive && (
                <p className="text-[11px] text-zinc-500 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                  Hiển thị user:&nbsp;
                  <span className="line-through text-zinc-600">{formatVnd(form.priceVnd)}</span>
                  {" → "}
                  <span className="text-red-400 font-semibold">{formatVnd(form.discountedPriceVnd)}</span>
                  {" · "}
                  <span className="text-zinc-500">tiết kiệm {formatVnd(form.priceVnd - form.discountedPriceVnd)} ({form.discountPercent}%)</span>
                </p>
              )}
            </div>
          </div>

          {/* Footer — Active toggle + Save */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => set("active", !form.active)}
              className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${form.active ? "text-emerald-400" : "text-zinc-500"}`}
            >
              {form.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              {form.active ? "Đang hiển thị" : "Đang ẩn"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f5a623] text-black text-[13px] font-bold hover:bg-[#e09515] disabled:opacity-50 transition-colors rounded-xl"
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Discount Manager ─────────────────────────────────────────────────────────

const EMPTY_DISCOUNT = {
  code: "", type: "PERCENT", discountValue: 10, maxUses: 0,
  applicablePlans: [], expiresAt: "", description: "", active: true,
};

const ALL_PLANS = ["BASIC", "FULL", "ANNUAL"];

function DiscountRow({ discount, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...discount });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const togglePlan = (plan) => {
    const cur = form.applicablePlans || [];
    set("applicablePlans", cur.includes(plan) ? cur.filter(p => p !== plan) : [...cur, plan]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/plans/discounts/${discount.id}`, form);
      onUpdate();
      setEditing(false);
    } catch (e) {
      alert(e.response?.data?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xóa mã "${discount.code}"?`)) return;
    try {
      await api.delete(`/admin/plans/discounts/${discount.id}`);
      onDelete();
    } catch {
      alert("Xóa thất bại");
    }
  };

  const isExpired = discount.expiresAt && new Date(discount.expiresAt) < new Date();
  const isMaxed = discount.maxUses > 0 && discount.usedCount >= discount.maxUses;

  if (!editing) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] hover:bg-white/2 transition-colors">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-[13px] font-bold text-white">{discount.code}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
            discount.type === "PERCENT" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            {discount.type === "PERCENT" ? `-${discount.discountValue}%` : `-${formatVnd(discount.discountValue)}`}
          </span>
          <span className="text-[11px] text-zinc-500">
            {discount.usedCount}/{discount.maxUses || "∞"} lượt
          </span>
          {discount.applicablePlans?.length > 0 && (
            <span className="text-[11px] text-zinc-600">{discount.applicablePlans.join(", ")}</span>
          )}
          {discount.expiresAt && (
            <span className={`text-[10px] ${isExpired ? "text-red-400" : "text-zinc-600"}`}>
              {isExpired ? "Hết hạn" : "Hết hạn " + new Date(discount.expiresAt).toLocaleDateString("vi-VN")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded ${
            !discount.active || isExpired || isMaxed
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {!discount.active ? "Tắt" : isExpired ? "Hết hạn" : isMaxed ? "Hết lượt" : "Hoạt động"}
          </span>
          <button onClick={() => setEditing(true)} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-white/5 bg-[#09090b]/60 px-4 py-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Mã</label>
          <input className={inputCls + " font-mono uppercase"} value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className={labelCls}>Loại</label>
          <select className={inputCls} value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="PERCENT">Phần trăm (%)</option>
            <option value="FIXED">Số tiền cố định (đ)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{form.type === "PERCENT" ? "Giá trị (%)" : "Giá trị (đ)"}</label>
          <input className={inputCls} type="number" value={form.discountValue} onChange={e => set("discountValue", Number(e.target.value))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Số lượt tối đa (0 = không giới hạn)</label>
          <input className={inputCls} type="number" value={form.maxUses} onChange={e => set("maxUses", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Ngày hết hạn (để trống = không hết hạn)</label>
          <input className={inputCls} type="datetime-local" value={form.expiresAt ? form.expiresAt.slice(0, 16) : ""} onChange={e => set("expiresAt", e.target.value || null)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Áp dụng cho gói (để trống = tất cả)</label>
        <div className="flex gap-2 mt-1">
          {ALL_PLANS.map(p => (
            <button
              key={p}
              onClick={() => togglePlan(p)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded border transition-colors ${
                (form.applicablePlans || []).includes(p)
                  ? "bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30"
                  : "bg-white/3 text-zinc-500 border-white/7 hover:border-white/14"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Mô tả nội bộ</label>
        <input className={inputCls} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Ghi chú cho admin..." />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => set("active", !form.active)}
          className={`flex items-center gap-1.5 text-[11px] font-medium ${form.active ? "text-emerald-400" : "text-zinc-500"}`}
        >
          {form.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          {form.active ? "Hoạt động" : "Tắt"}
        </button>
        <div className="flex gap-2">
          <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white border border-white/7 hover:border-white/14 rounded transition-colors">
            Huỷ
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5a623] text-black text-[11px] font-bold hover:bg-[#e09515] disabled:opacity-50 rounded transition-colors">
            {saving ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Discount Form ────────────────────────────────────────────────────────

function NewDiscountForm({ onCreated }) {
  const [form, setForm] = useState({ ...EMPTY_DISCOUNT });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const togglePlan = (plan) => {
    const cur = form.applicablePlans || [];
    set("applicablePlans", cur.includes(plan) ? cur.filter(p => p !== plan) : [...cur, plan]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return alert("Nhập mã giảm giá");
    setSaving(true);
    try {
      await api.post("/admin/plans/discounts", form);
      onCreated();
      setForm({ ...EMPTY_DISCOUNT });
      setOpen(false);
    } catch (e) {
      alert(e.response?.data?.message || "Tạo thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/4 border border-white/7 text-zinc-300 hover:text-white hover:border-white/14 text-[12px] font-medium transition-colors rounded"
      >
        <Plus size={13} />
        Tạo mã giảm giá
      </button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="bg-[#09090b]/80 border border-white/8 rounded p-5 space-y-4">
      <p className="text-[12px] font-semibold text-white flex items-center gap-2">
        <Tag size={13} className="text-[#f5a623]" /> Tạo mã giảm giá mới
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Mã *</label>
          <input className={inputCls + " font-mono uppercase"} value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="SUMMER2025" required />
        </div>
        <div>
          <label className={labelCls}>Loại *</label>
          <select className={inputCls} value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="PERCENT">Phần trăm (%)</option>
            <option value="FIXED">Số tiền cố định (đ)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{form.type === "PERCENT" ? "Giá trị (%)" : "Giá trị (đ)"} *</label>
          <input className={inputCls} type="number" min="1" value={form.discountValue} onChange={e => set("discountValue", Number(e.target.value))} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Số lượt tối đa (0 = không giới hạn)</label>
          <input className={inputCls} type="number" min="0" value={form.maxUses} onChange={e => set("maxUses", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Ngày hết hạn (để trống = không hết hạn)</label>
          <input className={inputCls} type="datetime-local" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Áp dụng cho gói (để trống = tất cả)</label>
        <div className="flex gap-2 mt-1">
          {ALL_PLANS.map(p => (
            <button
              type="button"
              key={p}
              onClick={() => togglePlan(p)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded border transition-colors ${
                (form.applicablePlans || []).includes(p)
                  ? "bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30"
                  : "bg-white/3 text-zinc-500 border-white/7 hover:border-white/14"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Mô tả nội bộ</label>
        <input className={inputCls} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Ghi chú cho admin..." />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-[11px] text-zinc-400 hover:text-white border border-white/7 hover:border-white/14 rounded transition-colors">
          Huỷ
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#f5a623] text-black text-[11px] font-bold hover:bg-[#e09515] disabled:opacity-50 rounded transition-colors">
          {saving ? <RefreshCw size={11} className="animate-spin" /> : <Plus size={11} />}
          Tạo mã
        </button>
      </div>
    </form>
  );
}

// ── Main PlanManager ─────────────────────────────────────────────────────────

const PlanManager = () => {
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
    if (!h || h < 1 || h > 168) { setCooldownMsg({ type: "error", text: "Giá trị phải từ 1 đến 168 giờ." }); return; }
    setCooldownSaving(true);
    setCooldownMsg(null);
    try {
      await api.put(`/admin/settings/guest-cooldown?hours=${h}`);
      setCooldownHours(h);
      setCooldownMsg({ type: "success", text: `Đã cập nhật: ${h} giờ.` });
    } catch (e) {
      setCooldownMsg({ type: "error", text: e.response?.data?.message || "Lưu thất bại." });
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
          { id: "plans", label: "Gói đăng ký", icon: Package },
          { id: "discounts", label: "Mã giảm giá", icon: Tag },
          { id: "settings", label: "Cài đặt", icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? "border-[#f5a623] text-[#f5a623]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Plans tab */}
      {tab === "plans" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-zinc-500">
              Chỉnh sửa thông tin hiển thị của từng gói. Thay đổi có hiệu lực ngay trên trang Payment.
            </p>
            <button onClick={fetchPlans} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white transition-colors">
              <RefreshCw size={12} />
              Làm mới
            </button>
          </div>

          {loadingPlans ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <RefreshCw size={20} className="animate-spin mb-3" />
              <p className="text-[12px]">Đang tải...</p>
            </div>
          ) : sortedPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <AlertCircle size={20} className="mb-3" />
              <p className="text-[12px]">Chưa có gói nào trong database.</p>
              <p className="text-[11px] mt-1">Khởi động lại backend để seed dữ liệu mặc định.</p>
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
          <div className="border border-white/7 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/2">
              <Clock size={13} className="text-amber-400" />
              <span className="text-[12px] font-semibold text-white">Thời gian chờ luyện giọng (khách)</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[12px] text-zinc-400 leading-relaxed">
                Người dùng chưa đăng ký phải chờ sau mỗi lần luyện giọng miễn phí.<br />
                Hiện tại: <span className="text-amber-400 font-semibold">{cooldownHours} giờ</span>.
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
                  <span className="text-[11px] text-zinc-500 shrink-0">giờ</span>
                </div>
                <button
                  onClick={saveCooldown}
                  disabled={cooldownSaving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded bg-amber-500 text-black text-[12px] font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {cooldownSaving
                    ? <RefreshCw size={12} className="animate-spin" />
                    : <Save size={12} />
                  }
                  Lưu
                </button>
              </div>
              {cooldownMsg && (
                <p className={`text-[11px] font-medium ${cooldownMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {cooldownMsg.text}
                </p>
              )}
              <p className="text-[10px] text-zinc-600">Phạm vi: 1 – 168 giờ. Áp dụng ngay sau khi lưu.</p>
            </div>
          </div>
        </div>
      )}

      {/* Discounts tab */}
      {tab === "discounts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-zinc-500">
                {discounts.length} mã giảm giá · Người dùng nhập mã ở trang Payment trước khi thanh toán.
              </p>
            </div>
            <button onClick={fetchDiscounts} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white transition-colors">
              <RefreshCw size={12} />
              Làm mới
            </button>
          </div>

          <NewDiscountForm onCreated={fetchDiscounts} />

          {loadingDiscounts ? (
            <div className="flex items-center justify-center py-12 text-zinc-600">
              <RefreshCw size={18} className="animate-spin mr-2" />
              <span className="text-[12px]">Đang tải...</span>
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <Tag size={24} className="mx-auto mb-3 opacity-30" />
              <p className="text-[12px]">Chưa có mã giảm giá nào.</p>
            </div>
          ) : (
            <div className="border border-white/7 rounded overflow-hidden">
              <div className={sectionHead}>
                <span>Mã · Giá trị · Lượt dùng · Gói áp dụng · Trạng thái</span>
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

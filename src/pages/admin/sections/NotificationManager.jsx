import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell, Plus, Send, Trash2, Edit2, Check, X, RefreshCw, AlertCircle,
  ChevronDown, ChevronUp, BookOpen, Tag, Wrench, Share2, Zap, Trophy,
  Users, Clock, CheckCircle, Eye, Info, Monitor, Smartphone, Search,
  UserCheck, UserX, ChevronRight,
} from "lucide-react";
import api from "../../../services/api";

const inputCls = "w-full bg-[#09090b] border border-white/[0.07] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#f5a623]/40 placeholder:text-zinc-600 rounded transition-colors";
const labelCls = "block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5";

const TYPE_META = {
  NEW_LESSON:     { label: "Bài học mới",    icon: BookOpen, color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",    dot: "bg-blue-400" },
  DISCOUNT:       { label: "Khuyến mãi",     icon: Tag,      color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",  dot: "bg-amber-400" },
  MAINTENANCE:    { label: "Bảo trì",        icon: Wrench,   color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",      dot: "bg-red-400" },
  SOCIAL_POST:    { label: "Bài đăng",       icon: Share2,   color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20",    dot: "bg-pink-400" },
  FEATURE_UPDATE: { label: "Tính năng mới",  icon: Zap,      color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20",dot: "bg-purple-400" },
  COMPETITION:    { label: "Thi đấu",        icon: Trophy,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",dot: "bg-emerald-400" },
  GENERAL:        { label: "Chung",          icon: Bell,     color: "text-zinc-400",    bg: "bg-zinc-500/10 border-zinc-500/20",    dot: "bg-zinc-400" },
};

const STATUS_META = {
  DRAFT:     { label: "Chờ duyệt", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  SENT:      { label: "Đã gửi",    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  CANCELLED: { label: "Huỷ",      color: "text-zinc-500",    bg: "bg-zinc-500/10 border-zinc-500/20" },
};

const ALL_PLANS = ["FREE", "BASIC", "FULL", "ANNUAL"];

const PLAN_COLORS = {
  FREE:   "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  BASIC:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  FULL:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ANNUAL: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function TypeBadge({ type }) {
  const m = TYPE_META[type] || TYPE_META.GENERAL;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${m.bg} ${m.color}`}>
      <Icon size={9} /> {m.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.DRAFT;
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${m.bg} ${m.color}`}>
      {m.label}
    </span>
  );
}

// ── Email Preview Modal ───────────────────────────────────────────────────────

function EmailPreviewModal({ annId, rawContent, rawType, onClose }) {
  const [html, setHtml] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState("desktop");
  const iframeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fetch = async () => {
      try {
        let res;
        if (annId) {
          res = await api.get(`/admin/announcements/${annId}/email-preview`);
          if (!cancelled) setHtml(typeof res.data === "string" ? res.data : res.data?.data || "");
        } else {
          res = await api.post("/admin/announcements/email-preview-raw", {
            content: rawContent || "",
            type: rawType || "GENERAL",
          });
          if (!cancelled) setHtml(typeof res.data === "string" ? res.data : res.data?.data || "");
        }
      } catch {
        if (!cancelled) setHtml("<p style='color:red;padding:2rem'>Không tải được preview.</p>");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [annId, rawContent, rawType]);

  useEffect(() => {
    if (html && iframeRef.current) iframeRef.current.srcdoc = html;
  }, [html]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex flex-col bg-[#0c0c0e] border border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: viewport === "mobile" ? 430 : "min(920px, 95vw)", height: "min(88vh, 840px)" }}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] shrink-0 bg-[#111113]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#f5a623]/15 flex items-center justify-center">
              <Eye size={12} className="text-[#f5a623]" />
            </div>
            <span className="text-[13px] font-semibold text-white">Preview email</span>
            <span className="text-[11px] text-zinc-600">người nhận mẫu: Nguyễn Văn A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#09090b] border border-white/[0.06] rounded-lg overflow-hidden">
              {[["desktop", Monitor, "Desktop"], ["mobile", Smartphone, "Mobile"]].map(([v, Icon, label]) => (
                <button key={v} onClick={() => setViewport(v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] transition-colors ${viewport === v ? "bg-[#f5a623]/15 text-[#f5a623]" : "text-zinc-500 hover:text-white"}`}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-auto bg-[#e8e8ec] p-6 flex justify-center items-start">
          {loading ? (
            <div className="flex items-center justify-center h-full gap-3 text-zinc-500">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-[12px]">Đang render email...</span>
            </div>
          ) : (
            <div style={{
              width: viewport === "mobile" ? 375 : "100%",
              maxWidth: viewport === "desktop" ? 640 : 375,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
            }}>
              <iframe ref={iframeRef} title="Email preview"
                style={{ width: "100%", minHeight: 640, border: "none", display: "block" }}
                sandbox="allow-same-origin" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/[0.06] bg-[#09090b] shrink-0">
          <span className="text-[11px] text-zinc-600">Email thực tế gửi từ địa chỉ Gmail cấu hình trong backend.</span>
          <button onClick={onClose} className="text-[11px] text-zinc-400 hover:text-white transition-colors px-2 py-1">Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ── Recipient Picker ──────────────────────────────────────────────────────────

function RecipientPicker({ selectedIds, onChange }) {
  const [activePlan, setActivePlan] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const fetchUsers = useCallback(async (plan) => {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/admin/announcements/users-by-plan${plan ? `?plan=${plan}` : ""}`);
      setUsers(res.data?.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const handlePlanClick = (plan) => {
    const next = activePlan === plan ? null : plan;
    setActivePlan(next);
    setSearch("");
    if (next !== null) {
      setOpen(true);
      fetchUsers(next);
    } else {
      setOpen(false);
      setUsers([]);
    }
  };

  const handleShowAll = () => {
    setActivePlan("ALL");
    setOpen(true);
    setSearch("");
    fetchUsers(null);
  };

  const filtered = search.trim()
    ? users.filter(u =>
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const allSelected = filtered.length > 0 && filtered.every(u => selectedIds.includes(u.id));
  const someSelected = filtered.some(u => selectedIds.includes(u.id));

  const toggleAll = () => {
    if (allSelected) {
      // deselect all filtered
      onChange(selectedIds.filter(id => !filtered.find(u => u.id === id)));
    } else {
      // select all filtered
      const newIds = [...new Set([...selectedIds, ...filtered.map(u => u.id)])];
      onChange(newIds);
    }
  };

  const toggleUser = (uid) => {
    onChange(selectedIds.includes(uid)
      ? selectedIds.filter(id => id !== uid)
      : [...selectedIds, uid]
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={labelCls + " mb-0"}>Chọn người nhận</label>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#f5a623] font-semibold">
              {selectedIds.length} người được chọn
            </span>
            <button onClick={() => onChange([])}
              className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors">
              Xoá tất cả
            </button>
          </div>
        )}
      </div>

      {/* Plan filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={handleShowAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
            activePlan === "ALL"
              ? "bg-[#f5a623]/12 text-[#f5a623] border-[#f5a623]/30"
              : "bg-white/[0.03] text-zinc-500 border-white/[0.07] hover:border-white/[0.14] hover:text-zinc-300"
          }`}
        >
          <Users size={10} /> Tất cả người dùng
        </button>
        {ALL_PLANS.map(p => (
          <button key={p} onClick={() => handlePlanClick(p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
              activePlan === p
                ? "bg-[#f5a623]/12 text-[#f5a623] border-[#f5a623]/30"
                : `${PLAN_COLORS[p]} hover:opacity-80`
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* User list dropdown */}
      {open && (
        <div className="bg-[#09090b] border border-white/[0.08] rounded-xl overflow-hidden">
          {/* Search + select-all header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.05]">
            <div className="relative flex-1">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                className="w-full bg-white/[0.04] border border-white/[0.06] pl-7 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-white/[0.14] placeholder:text-zinc-600 rounded-lg"
                placeholder="Tìm tên hoặc email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={toggleAll}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium rounded-lg border transition-all whitespace-nowrap ${
                allSelected
                  ? "bg-[#f5a623]/12 text-[#f5a623] border-[#f5a623]/30"
                  : "text-zinc-400 border-white/[0.07] hover:border-white/[0.14] hover:text-white"
              }`}
            >
              {allSelected ? <UserX size={10} /> : <UserCheck size={10} />}
              {allSelected ? "Bỏ tất cả" : "Chọn tất cả"}
              {filtered.length > 0 && <span className="text-zinc-600">({filtered.length})</span>}
            </button>
          </div>

          {/* User rows */}
          <div className="max-h-[240px] overflow-y-auto">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8 gap-2 text-zinc-600">
                <RefreshCw size={13} className="animate-spin" />
                <span className="text-[11px]">Đang tải...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-[11px]">Không tìm thấy người dùng.</div>
            ) : (
              filtered.map(u => {
                const checked = selectedIds.includes(u.id);
                const initial = (u.name || u.email || "?")[0].toUpperCase();
                const planColor = PLAN_COLORS[u.plan] || PLAN_COLORS.FREE;
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-white/[0.03] last:border-0 ${
                      checked ? "bg-[#f5a623]/[0.05]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      checked ? "bg-[#f5a623] text-black" : "bg-white/[0.07] text-zinc-400"
                    }`}>
                      {checked ? <Check size={12} /> : initial}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-medium truncate ${checked ? "text-white" : "text-zinc-300"}`}>
                        {u.name || "—"}
                      </p>
                      <p className="text-[10px] text-zinc-600 truncate">{u.email}</p>
                    </div>
                    {/* Plan badge */}
                    {u.plan && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${planColor}`}>
                        {u.plan}
                      </span>
                    )}
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${
                      checked ? "bg-[#f5a623] border-[#f5a623]" : "border-white/[0.15]"
                    }`}>
                      {checked && <Check size={9} className="text-black" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer summary */}
          {filtered.length > 0 && (
            <div className="px-3 py-2 border-t border-white/[0.05] flex items-center justify-between">
              <span className="text-[10px] text-zinc-600">
                {someSelected
                  ? `${selectedIds.filter(id => filtered.find(u => u.id === id)).length}/${filtered.length} được chọn trong danh sách này`
                  : `${filtered.length} người dùng`
                }
              </span>
              {someSelected && !allSelected && (
                <button onClick={toggleAll} className="text-[10px] text-[#f5a623] hover:underline">
                  Chọn tất cả {filtered.length}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected summary chips */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-zinc-500">Đã chọn:</span>
          <span className="text-[11px] text-[#f5a623] font-semibold bg-[#f5a623]/10 border border-[#f5a623]/20 px-2 py-0.5 rounded-lg">
            {selectedIds.length} người nhận
          </span>
          <span className="text-[10px] text-zinc-600">(email sẽ gửi đến {selectedIds.length} địa chỉ)</span>
        </div>
      )}

      {selectedIds.length === 0 && !open && (
        <p className="text-[11px] text-zinc-600 flex items-center gap-1.5">
          <Info size={10} /> Không chọn = gửi đến tất cả người dùng theo cấu hình gói.
        </p>
      )}
    </div>
  );
}

// ── Compose / Edit Form ───────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "", emailSubject: "", content: "",
  type: "GENERAL", targetPlans: [],
};

function ComposeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title?.trim()) return alert("Nhập tiêu đề");
    if (!form.content?.trim()) return alert("Nhập nội dung");
    if (!form.emailSubject?.trim()) form.emailSubject = form.title;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#111113] border border-white/[0.08] rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-white flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#f5a623]/15 flex items-center justify-center">
            <Bell size={12} className="text-[#f5a623]" />
          </div>
          {initial ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
        </p>
        {onCancel && (
          <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Loại thông báo</label>
          <select className={inputCls} value={form.type} onChange={e => set("type", e.target.value)}>
            {Object.entries(TYPE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Tiêu đề nội bộ</label>
          <input className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} placeholder="VD: Bài học mới tháng 6..." />
        </div>
      </div>

      <div>
        <label className={labelCls}>Tiêu đề email (Subject)</label>
        <input className={inputCls} value={form.emailSubject || ""} onChange={e => set("emailSubject", e.target.value)} placeholder="Để trống = dùng tiêu đề nội bộ" />
      </div>

      <div>
        <label className={labelCls}>
          Nội dung email
          <span className="normal-case ml-2 text-zinc-600 font-normal">Dùng {"{{name}}"} để cá nhân hoá</span>
        </label>
        <textarea
          className={inputCls + " resize-none font-mono text-[11px] leading-relaxed"}
          rows={8}
          value={form.content}
          onChange={e => set("content", e.target.value)}
          placeholder={"Xin chào {{name}},\n\nNội dung thông báo...\n\nTrân trọng,\nĐội ngũ MC Hub"}
        />
      </div>

      {/* Recipient Picker */}
      <div className="border-t border-white/[0.05] pt-4">
        <RecipientPicker selectedIds={selectedIds} onChange={setSelectedIds} />
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
        <button
          onClick={() => setShowEmailPreview(true)}
          disabled={!form.content?.trim()}
          className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-zinc-400 hover:text-[#f5a623] border border-white/[0.07] hover:border-[#f5a623]/30 rounded-lg transition-colors disabled:opacity-30"
        >
          <Eye size={12} /> Xem trước email
        </button>

        <div className="flex gap-2">
          {onCancel && (
            <button onClick={onCancel} className="px-4 py-2 text-[11px] text-zinc-400 hover:text-white border border-white/[0.07] hover:border-white/[0.14] rounded-lg transition-colors">
              Huỷ
            </button>
          )}
          <button
            onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#f5a623] text-black text-[11px] font-bold hover:bg-[#e09515] disabled:opacity-50 rounded-lg transition-colors"
          >
            {saving ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />}
            {initial ? "Lưu thay đổi" : "Tạo thông báo"}
          </button>
        </div>
      </div>

      {showEmailPreview && (
        <EmailPreviewModal
          annId={initial?.id}
          rawContent={form.content}
          rawType={form.type}
          onClose={() => setShowEmailPreview(false)}
        />
      )}
    </div>
  );
}

// ── Announcement Row ──────────────────────────────────────────────────────────

function AnnouncementRow({ ann, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewStats, setPreviewStats] = useState(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showSendPicker, setShowSendPicker] = useState(false);
  const [sendRecipientIds, setSendRecipientIds] = useState([]);

  const loadPreview = async () => {
    if (previewStats || ann.status === "SENT") return;
    try {
      const res = await api.get(`/admin/announcements/${ann.id}/preview-stats`);
      setPreviewStats(res.data?.data);
    } catch { /* ignore */ }
  };

  const handleExpand = () => {
    setExpanded(e => !e);
    if (!expanded) loadPreview();
  };

  const handleSend = async () => {
    const recipientCount = sendRecipientIds.length || previewStats?.recipientCount || "tất cả";
    if (!window.confirm(`Gửi thông báo "${ann.title}" đến ${recipientCount} người dùng?`)) return;
    setSending(true);
    try {
      const body = sendRecipientIds.length > 0 ? { recipientIds: sendRecipientIds } : {};
      await api.post(`/admin/announcements/${ann.id}/send`, body);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Gửi thất bại");
    } finally {
      setSending(false);
      setShowSendPicker(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xoá thông báo "${ann.title}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/announcements/${ann.id}`);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Xoá thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (form) => {
    await api.put(`/admin/announcements/${ann.id}`, form);
    setEditing(false);
    onRefresh();
  };

  if (editing) {
    return (
      <div className="border-b border-white/[0.05] p-4">
        <ComposeForm initial={ann} onSave={handleEdit} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors">
      <button onClick={handleExpand} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <TypeBadge type={ann.type} />
          <span className="text-[13px] font-medium text-white truncate">{ann.title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={ann.status} />
          {ann.status === "SENT" && (
            <span className="text-[10px] text-zinc-600 flex items-center gap-1">
              <Users size={10} /> {ann.recipientCount}
            </span>
          )}
          <span className="text-[10px] text-zinc-600">
            {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString("vi-VN") : ""}
          </span>
          {expanded ? <ChevronUp size={13} className="text-zinc-500" /> : <ChevronDown size={13} className="text-zinc-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-[#09090b] border border-white/[0.05] rounded-xl p-4">
            <p className="text-[10px] text-zinc-600 mb-2 uppercase tracking-wider">Subject</p>
            <p className="text-[12px] text-zinc-300 font-medium mb-3">{ann.emailSubject || ann.title}</p>
            <pre className="text-[11px] text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed border-t border-white/[0.04] pt-3">{ann.content}</pre>
          </div>

          {ann.targetPlans?.length > 0 && (
            <p className="text-[11px] text-zinc-500">
              Gói mục tiêu: {ann.targetPlans.map(p => (
                <span key={p} className={`inline-block mr-1 text-[10px] px-1.5 py-0.5 rounded border ${PLAN_COLORS[p] || ""}`}>{p}</span>
              ))}
            </p>
          )}

          {ann.status === "DRAFT" && previewStats && (
            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <Users size={11} />
              Mặc định sẽ gửi đến <span className="text-white font-semibold mx-1">{previewStats.recipientCount}</span> người dùng
            </p>
          )}

          {ann.status === "SENT" && ann.sentAt && (
            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <Clock size={11} /> Đã gửi lúc {new Date(ann.sentAt).toLocaleString("vi-VN")} · {ann.recipientCount} người nhận
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowEmailPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-[#f5a623] border border-white/[0.07] hover:border-[#f5a623]/30 rounded-lg transition-colors"
            >
              <Eye size={11} /> Xem email
            </button>

            {ann.status === "DRAFT" && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white border border-white/[0.07] hover:border-white/[0.14] rounded-lg transition-colors"
                >
                  <Edit2 size={11} /> Chỉnh sửa
                </button>
                <button
                  onClick={() => setShowSendPicker(s => !s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
                >
                  <Send size={11} />
                  {showSendPicker ? "Thu gọn" : "Duyệt & Gửi"}
                  {sendRecipientIds.length > 0 && (
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">{sendRecipientIds.length}</span>
                  )}
                </button>
                <button
                  onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-500 hover:text-red-400 border border-white/[0.07] hover:border-red-500/20 rounded-lg transition-colors"
                >
                  {deleting ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  Xoá
                </button>
              </>
            )}
          </div>

          {/* Send Picker Panel */}
          {showSendPicker && ann.status === "DRAFT" && (
            <div className="bg-[#09090b] border border-white/[0.07] rounded-xl p-4 space-y-4">
              <p className="text-[12px] font-semibold text-white flex items-center gap-2">
                <Users size={13} className="text-[#f5a623]" />
                Chọn người nhận
                <span className="text-[10px] text-zinc-500 font-normal">— không chọn = gửi theo cấu hình gói</span>
              </p>
              <RecipientPicker selectedIds={sendRecipientIds} onChange={setSendRecipientIds} />
              <div className="flex justify-end gap-2 pt-1 border-t border-white/[0.05]">
                <button
                  onClick={() => { setShowSendPicker(false); setSendRecipientIds([]); }}
                  className="px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white border border-white/[0.07] rounded-lg transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleSend} disabled={sending}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {sending ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
                  Xác nhận gửi {sendRecipientIds.length > 0 ? `(${sendRecipientIds.length})` : "(tất cả)"}
                </button>
              </div>
            </div>
          )}

          {showEmailPreview && (
            <EmailPreviewModal annId={ann.id} onClose={() => setShowEmailPreview(false)} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Trigger Panel ─────────────────────────────────────────────────────────────

const TRIGGERS = [
  {
    key: "new-lesson", label: "Bài học mới", icon: BookOpen,
    color: "text-blue-400", border: "border-blue-500/20 hover:border-blue-400/40", bg: "hover:bg-blue-500/5",
    fields: [
      { key: "lessonTitle", label: "Tên bài học", placeholder: "Kỹ thuật ngắt giọng nâng cao" },
      { key: "lessonId",    label: "Lesson ID (tuỳ chọn)", placeholder: "" },
    ],
  },
  {
    key: "discount", label: "Khuyến mãi", icon: Tag,
    color: "text-amber-400", border: "border-amber-500/20 hover:border-amber-400/40", bg: "hover:bg-amber-500/5",
    fields: [
      { key: "planName",        label: "Tên gói",    placeholder: "Gói Premium FULL" },
      { key: "discountPercent", label: "% giảm giá", placeholder: "30" },
      { key: "discountCode",    label: "Mã giảm giá",placeholder: "SUMMER30" },
    ],
  },
  {
    key: "maintenance", label: "Bảo trì", icon: Wrench,
    color: "text-red-400", border: "border-red-500/20 hover:border-red-400/40", bg: "hover:bg-red-500/5",
    fields: [
      { key: "time",     label: "Thời gian",  placeholder: "Chủ nhật 14/7 từ 2:00 - 4:00" },
      { key: "duration", label: "Thời lượng", placeholder: "2 giờ" },
    ],
  },
  {
    key: "social-post", label: "Bài đăng Facebook", icon: Share2,
    color: "text-pink-400", border: "border-pink-500/20 hover:border-pink-400/40", bg: "hover:bg-pink-500/5",
    fields: [
      { key: "postTitle", label: "Tiêu đề bài đăng", placeholder: "10 lỗi phát âm MC thường gặp" },
      { key: "postUrl",   label: "Link bài đăng",    placeholder: "https://facebook.com/..." },
    ],
  },
  {
    key: "feature-update", label: "Tính năng mới", icon: Zap,
    color: "text-purple-400", border: "border-purple-500/20 hover:border-purple-400/40", bg: "hover:bg-purple-500/5",
    fields: [
      { key: "featureName", label: "Tên tính năng", placeholder: "Phân tích giọng nâng cao v2" },
      { key: "description", label: "Mô tả ngắn",    placeholder: "Cải thiện độ chính xác 40%..." },
    ],
  },
  {
    key: "competition", label: "Cuộc thi", icon: Trophy,
    color: "text-emerald-400", border: "border-emerald-500/20 hover:border-emerald-400/40", bg: "hover:bg-emerald-500/5",
    fields: [
      { key: "competitionName", label: "Tên cuộc thi", placeholder: "MC Tài Năng Tháng 7" },
      { key: "description",     label: "Mô tả",        placeholder: "Giải nhất nhận voucher 500k..." },
      { key: "competitionId",   label: "Competition ID (tuỳ chọn)", placeholder: "" },
    ],
  },
];

function TriggerPanel({ onRefresh }) {
  const [active, setActive] = useState(null);
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFire = async (triggerKey) => {
    setLoading(true);
    try {
      await api.post(`/admin/announcements/trigger/${triggerKey}`, fields);
      setActive(null);
      setFields({});
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Thất bại");
    } finally {
      setLoading(false);
    }
  };

  const trigger = TRIGGERS.find(t => t.key === active);

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
        <Info size={11} /> Hệ thống tự tạo bản nháp. Admin duyệt mới gửi.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {TRIGGERS.map(t => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setActive(isActive ? null : t.key); setFields({}); }}
              className={`flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium rounded-xl border transition-all text-left ${
                isActive ? `${t.border} ${t.bg} ${t.color} bg-white/[0.04]`
                         : `border-white/[0.07] text-zinc-400 hover:text-white ${t.border} ${t.bg}`
              }`}
            >
              <Icon size={13} className={isActive ? t.color : ""} />
              {t.label}
            </button>
          );
        })}
      </div>

      {trigger && (
        <div className="bg-[#09090b]/80 border border-white/[0.08] rounded-xl p-5 space-y-3">
          <p className="text-[12px] font-semibold text-white flex items-center gap-2">
            <trigger.icon size={13} className={trigger.color} />
            Tạo thông báo: {trigger.label}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {trigger.fields.map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input className={inputCls} value={fields[f.key] || ""}
                  onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setActive(null); setFields({}); }}
              className="px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white border border-white/[0.07] rounded-lg transition-colors">
              Huỷ
            </button>
            <button onClick={() => handleFire(trigger.key)} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold rounded-lg transition-colors disabled:opacity-50 bg-[#f5a623] text-black hover:bg-[#e09515]">
              {loading ? <RefreshCw size={11} className="animate-spin" /> : <Plus size={11} />}
              Tạo bản nháp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "all",      label: "Tất cả" },
  { id: "drafts",   label: "Chờ duyệt" },
  { id: "sent",     label: "Đã gửi" },
  { id: "compose",  label: "+ Tạo mới" },
  { id: "triggers", label: "Gợi ý tự động" },
];

const NotificationManager = () => {
  const [tab, setTab] = useState("all");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/announcements");
      setAnnouncements(res.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (form) => {
    await api.post("/admin/announcements", form);
    setTab("all");
    fetchAll();
  };

  const filtered = tab === "drafts" ? announcements.filter(a => a.status === "DRAFT")
    : tab === "sent" ? announcements.filter(a => a.status === "SENT")
    : announcements;

  const draftCount = announcements.filter(a => a.status === "DRAFT").length;
  const sentCount = announcements.filter(a => a.status === "SENT").length;
  const totalRecipients = announcements.filter(a => a.status === "SENT").reduce((s, a) => s + (a.recipientCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tổng thông báo", value: announcements.length, icon: Bell, color: "text-zinc-400", sub: `${sentCount} đã gửi` },
          { label: "Chờ duyệt",      value: draftCount,           icon: Clock, color: "text-amber-400", sub: "cần xem xét" },
          { label: "Lượt nhận email", value: totalRecipients,     icon: Users, color: "text-emerald-400", sub: "tổng cộng" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111113] border border-white/[0.07] rounded-xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0`}>
                <Icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-[22px] font-bold text-white leading-none">{s.value.toLocaleString()}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{s.label}</p>
                <p className="text-[10px] text-zinc-600">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/[0.06]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-[12px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-[#f5a623] text-[#f5a623]" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
            {t.id === "drafts" && draftCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                {draftCount}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto">
          <button onClick={fetchAll} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white transition-colors px-2 py-1">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {tab === "compose" && (
        <ComposeForm onSave={handleCreate} onCancel={() => setTab("all")} />
      )}

      {tab === "triggers" && (
        <TriggerPanel onRefresh={() => { fetchAll(); setTab("drafts"); }} />
      )}

      {(tab === "all" || tab === "drafts" || tab === "sent") && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-600">
              <RefreshCw size={16} className="animate-spin mr-2" />
              <span className="text-[12px]">Đang tải...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <Bell size={20} className="opacity-30" />
              </div>
              <p className="text-[13px] font-medium text-zinc-500 mb-1">
                {tab === "drafts" ? "Không có thông báo chờ duyệt" : tab === "sent" ? "Chưa có thông báo nào được gửi" : "Chưa có thông báo nào"}
              </p>
              {tab === "all" && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setTab("compose")} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white border border-white/[0.07] hover:border-white/[0.14] rounded-lg transition-colors">
                    <Plus size={11} /> Tạo thủ công
                  </button>
                  <button onClick={() => setTab("triggers")} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white border border-white/[0.07] hover:border-white/[0.14] rounded-lg transition-colors">
                    <Zap size={11} /> Dùng trigger
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
                <span>Loại · Tiêu đề · Trạng thái</span>
                <span>{filtered.length} thông báo</span>
              </div>
              {filtered.map(ann => (
                <AnnouncementRow key={ann.id} ann={ann} onRefresh={fetchAll} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationManager;

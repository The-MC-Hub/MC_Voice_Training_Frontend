import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, Plus, Send, Trash2, Edit2, RefreshCw, Eye,
  BookOpen, Tag, Wrench, Share2, Zap, Trophy,
  Users, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Loader2, Mail, UserCheck, UserX, Search, Info, Check, X,
} from "lucide-react";
import api from "../../../services/api";

// ── Shared style tokens ───────────────────────────────────────────────────────

const inputCls = "w-full bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] outline-none focus:border-[--text-muted] transition-colors";
const labelCls = "text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider";
const chipCls = (active) =>
  `px-3 py-1 text-[11px] font-semibold border cursor-pointer transition-colors ${
    active
      ? "bg-gold/20 border-gold text-gold"
      : "bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted] hover:border-[--text-muted] hover:text-[--text-secondary]"
  }`;

// ── Type / Status config ──────────────────────────────────────────────────────

const TYPE_META = {
  NEW_LESSON:     { label: "Bài học mới",   icon: BookOpen, color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  DISCOUNT:       { label: "Khuyến mãi",    icon: Tag,      color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  MAINTENANCE:    { label: "Bảo trì",       icon: Wrench,   color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
  SOCIAL_POST:    { label: "Bài đăng",      icon: Share2,   color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20" },
  FEATURE_UPDATE: { label: "Tính năng mới", icon: Zap,      color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
  COMPETITION:    { label: "Thi đấu",       icon: Trophy,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  GENERAL:        { label: "Chung",         icon: Bell,     color: "text-zinc-400",    bg: "bg-zinc-500/10 border-zinc-500/20" },
};

const STATUS_META = {
  DRAFT: { label: "Chờ duyệt", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  SENT:  { label: "Đã gửi",    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
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
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 border ${m.bg} ${m.color}`}>
      <Icon size={9} /> {m.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.DRAFT;
  return <span className={`text-[10px] font-medium px-2 py-0.5 border ${m.bg} ${m.color}`}>{m.label}</span>;
}

// ── Live email preview (mirrors Marketing EmailPreviewPanel) ──────────────────

function buildPreviewHtml(content, type) {
  const m = TYPE_META[type] || TYPE_META.GENERAL;
  const lines = (content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paras = lines.split(/\n\n+/).map(p => `<p style="margin:0 0 16px 0;">${p.replace(/\n/g, "<br/>")}</p>`).join("");
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f0f0f2;font-family:'Helvetica Neue',Arial,sans-serif;color:#18181b;}
a{color:#f5a623;text-decoration:none;}
</style></head><body>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f2;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.12);">
<tr><td style="background:linear-gradient(90deg,#f5a623,#fbbf24,#f5a623);height:4px;"></td></tr>
<tr><td style="background:#09090b;padding:20px 32px 18px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px;">MC<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#f5a623;margin:0 3px 2px;vertical-align:middle;"></span>Hub</td>
    <td align="right"><span style="display:inline-block;background:#f5a623;color:#000;font-size:10px;font-weight:700;padding:4px 10px;border-radius:4px;letter-spacing:0.8px;text-transform:uppercase;">${m.label}</span></td>
  </tr></table>
</td></tr>
<tr><td style="background:linear-gradient(135deg,#0c0c0f 0%,#1a1a1e 100%);padding:32px;">
  <p style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">Thông báo từ MC Hub</p>
  <h1 style="color:#fff;font-size:24px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;">Xin chào, <span style="color:#f5a623;">{{name}}</span> 👋</h1>
</td></tr>
<tr><td style="background:linear-gradient(90deg,#f5a623,#fbbf24);height:2px;"></td></tr>
<tr><td style="background:#ffffff;padding:28px 32px 20px;">
  <div style="font-size:14px;line-height:1.8;color:#27272a;">${paras || '<p style="color:#a1a1aa;font-style:italic;">Nhập nội dung bên trái để preview tại đây...</p>'}</div>
</td></tr>
<tr><td style="background:#ffffff;padding:8px 32px 32px;text-align:center;">
  <a href="#" style="display:inline-block;background:#f5a623;color:#000;font-size:14px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">Truy cập MC Hub →</a>
</td></tr>
<tr><td style="background:#09090b;padding:18px 32px 24px;border-top:1px solid #1f1f23;">
  <p style="color:#3f3f46;font-size:11px;line-height:1.7;text-align:center;">
    © 2025 MC Hub · Việt Nam<br/>
    <a href="#" style="color:#71717a;">Huỷ đăng ký</a>
  </p>
</td></tr>
<tr><td style="background:linear-gradient(90deg,#f5a623,#fbbf24,#f5a623);height:4px;"></td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function EmailPreviewPanel({ content, type }) {
  const html = buildPreviewHtml(content, type);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[--text-muted] uppercase tracking-wider font-semibold">Preview email</span>
        <span className="text-[10px] text-[--text-muted] bg-[--bg-elevated] border border-[--border-subtle] px-2 py-0.5">Live render</span>
      </div>
      <div className="flex-1 border border-[--border-subtle] bg-[#f0f0f2] overflow-hidden min-h-0">
        <iframe
          srcDoc={html}
          className="w-full border-0"
          style={{ minHeight: "520px" }}
          title="Email preview"
        />
      </div>
    </div>
  );
}

// ── Recipient Picker (Marketing style) ───────────────────────────────────────

function RecipientPicker({ selectedIds, onChange }) {
  const [activePlan, setActivePlan] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const fetchUsers = useCallback(async (plan) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/announcements/users-by-plan${plan ? `?plan=${plan}` : ""}`);
      setUsers(res.data?.data || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, []);

  const handlePlanClick = (plan) => {
    const next = activePlan === plan ? null : plan;
    setActivePlan(next);
    setSearch("");
    if (next !== null) { setOpen(true); fetchUsers(next); }
    else { setOpen(false); setUsers([]); }
  };

  const handleShowAll = () => {
    setActivePlan("ALL"); setOpen(true); setSearch("");
    fetchUsers(null);
  };

  const filtered = search.trim()
    ? users.filter(u => (u.name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()))
    : users;

  const allSelected = filtered.length > 0 && filtered.every(u => selectedIds.includes(u.id));
  const someSelected = filtered.some(u => selectedIds.includes(u.id));

  const toggleAll = () => {
    if (allSelected) onChange(selectedIds.filter(id => !filtered.find(u => u.id === id)));
    else onChange([...new Set([...selectedIds, ...filtered.map(u => u.id)])]);
  };
  const toggleUser = (uid) =>
    onChange(selectedIds.includes(uid) ? selectedIds.filter(id => id !== uid) : [...selectedIds, uid]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className={labelCls + " mb-0"}>Chọn người nhận</p>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gold font-semibold">{selectedIds.length} đã chọn</span>
            <button onClick={() => onChange([])} className="text-[10px] text-[--text-muted] hover:text-red-400 transition-colors">Xoá tất cả</button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={handleShowAll} className={chipCls(activePlan === "ALL") + " flex items-center gap-1.5"}>
          <Users size={10} /> Tất cả
        </button>
        {ALL_PLANS.map(p => (
          <button key={p} onClick={() => handlePlanClick(p)} className={chipCls(activePlan === p)}>{p}</button>
        ))}
      </div>

      {open && (
        <div className="border border-[--border-subtle] bg-[--bg-surface]">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[--border-subtle] bg-[--bg-elevated]">
            <div className="relative flex-1">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--text-muted]" />
              <input
                className="w-full bg-[--bg-elevated] border border-[--border-subtle] pl-7 pr-3 py-1.5 text-[11px] text-[--text-primary] outline-none focus:border-[--text-muted] placeholder:text-zinc-600"
                placeholder="Tìm tên hoặc email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={toggleAll}
              className={chipCls(allSelected) + " flex items-center gap-1.5 whitespace-nowrap text-[10px]"}
            >
              {allSelected ? <UserX size={10} /> : <UserCheck size={10} />}
              {allSelected ? "Bỏ tất cả" : "Chọn tất cả"}
              {filtered.length > 0 && <span className="text-[--text-muted]">({filtered.length})</span>}
            </button>
          </div>

          <div className="max-h-55 overflow-y-auto divide-y divide-[--border-subtle]">
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-[--text-muted] text-[12px]">
                <Loader2 size={13} className="animate-spin" /> Đang tải...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-[--text-muted] text-[12px]">Không tìm thấy người dùng.</div>
            ) : (
              filtered.map(u => {
                const checked = selectedIds.includes(u.id);
                return (
                  <label key={u.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors select-none ${checked ? "bg-gold/5" : "hover:bg-[--bg-elevated]"}`}>
                    <div className={`w-6 h-6 shrink-0 flex items-center justify-center text-[10px] font-bold ${checked ? "bg-gold text-black" : "bg-[--bg-elevated] text-[--text-muted]"}`}>
                      {checked ? <Check size={11} /> : (u.name || u.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-medium truncate ${checked ? "text-[--text-primary]" : "text-[--text-secondary]"}`}>{u.name || "—"}</p>
                      <p className="text-[10px] text-[--text-muted] font-mono truncate">{u.email}</p>
                    </div>
                    {u.plan && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 border shrink-0 ${PLAN_COLORS[u.plan] || ""}`}>{u.plan}</span>
                    )}
                    <div className={`w-3.5 h-3.5 border shrink-0 flex items-center justify-center transition-all ${checked ? "bg-gold border-gold" : "border-[--border-subtle]"}`}>
                      {checked && <Check size={9} className="text-black" strokeWidth={3} />}
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {filtered.length > 0 && (
            <div className="px-3 py-2 border-t border-[--border-subtle] flex items-center justify-between bg-[--bg-elevated]">
              <span className="text-[10px] text-[--text-muted]">
                {someSelected ? `${selectedIds.filter(id => filtered.find(u => u.id === id)).length}/${filtered.length} trong danh sách này` : `${filtered.length} người dùng`}
              </span>
            </div>
          )}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-[--text-muted]">Đã chọn:</span>
          <span className="text-[11px] text-gold font-semibold bg-gold/10 border border-gold/20 px-2 py-0.5">{selectedIds.length} người nhận</span>
        </div>
      )}

      {selectedIds.length === 0 && !open && (
        <p className="text-[11px] text-[--text-muted] flex items-center gap-1.5">
          <Info size={10} /> Không chọn = gửi đến tất cả người dùng
        </p>
      )}
    </div>
  );
}

// ── Compose Form (2-col: form left + preview right) ───────────────────────────

const EMPTY_FORM = { title: "", emailSubject: "", content: "", type: "GENERAL", targetPlans: [] };

function ComposeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...initial } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title?.trim()) return alert("Nhập tiêu đề");
    if (!form.content?.trim()) return alert("Nhập nội dung");
    if (!form.emailSubject?.trim()) form.emailSubject = form.title;
    setSaving(true);
    try { await onSave({ ...form, recipientIds: selectedIds.length > 0 ? selectedIds : undefined }); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-[--bg-surface] border border-[--border-subtle]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[--border-subtle]">
        <span className="text-[13px] font-semibold text-[--text-primary] flex items-center gap-2">
          <Bell size={13} className="text-gold" />
          {initial ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
        </span>
        {onCancel && (
          <button onClick={onCancel} className="text-[--text-muted] hover:text-[--text-primary]"><X size={15} /></button>
        )}
      </div>

      {/* 2-col body */}
      <div className="flex gap-0 min-h-150">

        {/* LEFT — inputs */}
        <div className="flex-1 p-5 space-y-4 border-r border-[--border-subtle] overflow-y-auto">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>Loại thông báo</p>
              <select className={inputCls} value={form.type} onChange={e => set("type", e.target.value)}>
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p className={labelCls}>Tiêu đề nội bộ *</p>
              <input className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} placeholder="VD: Bài học mới tháng 6..." />
            </div>
          </div>

          <div>
            <p className={labelCls}>Tiêu đề email (Subject)</p>
            <input className={inputCls} value={form.emailSubject || ""} onChange={e => set("emailSubject", e.target.value)} placeholder="Để trống = dùng tiêu đề nội bộ" />
          </div>

          <div>
            <p className={labelCls}>
              Nội dung
              <span className="normal-case ml-2 text-[--text-muted] font-normal opacity-60">Dùng {"{{name}}"} để cá nhân hoá</span>
            </p>
            <textarea
              className={inputCls + " resize-none font-mono text-[11px] leading-relaxed"}
              rows={9}
              value={form.content}
              onChange={e => set("content", e.target.value)}
              placeholder={"Xin chào {{name}},\n\nNội dung thông báo...\n\nTrân trọng,\nĐội ngũ MC Hub"}
            />
          </div>

          {/* Recipient */}
          <div className="border-t border-[--border-subtle] pt-4">
            <RecipientPicker selectedIds={selectedIds} onChange={setSelectedIds} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1 border-t border-[--border-subtle]">
            {onCancel && (
              <button onClick={onCancel} className="px-4 py-2 text-[11px] text-[--text-muted] hover:text-[--text-primary] border border-[--border-subtle] hover:border-[--text-muted] transition-colors">Huỷ</button>
            )}
            <button
              onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {initial ? "Lưu thay đổi" : "Tạo thông báo"}
            </button>
          </div>
        </div>

        {/* RIGHT — live preview */}
        <div className="w-110 shrink-0 p-4 flex flex-col">
          <EmailPreviewPanel content={form.content} type={form.type} />
        </div>
      </div>
    </div>
  );
}

// ── Announcement Row ──────────────────────────────────────────────────────────

function AnnouncementRow({ ann, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendIds, setSendIds] = useState([]);
  const [showSendPicker, setShowSendPicker] = useState(false);
  const [previewCount, setPreviewCount] = useState(null);

  const loadPreview = async () => {
    if (previewCount !== null || ann.status === "SENT") return;
    try {
      const res = await api.get(`/admin/announcements/${ann.id}/preview-stats`);
      setPreviewCount(res.data?.data?.recipientCount ?? null);
    } catch { /* ignore */ }
  };

  const handleExpand = () => { setExpanded(e => !e); if (!expanded) loadPreview(); };

  const handleSend = async () => {
    const count = sendIds.length || previewCount || "tất cả";
    if (!window.confirm(`Gửi "${ann.title}" đến ${count} người dùng?`)) return;
    setSending(true);
    try {
      await api.post(`/admin/announcements/${ann.id}/send`, sendIds.length > 0 ? { recipientIds: sendIds } : {});
      onRefresh();
    } catch (e) { alert(e.response?.data?.message || "Gửi thất bại"); }
    finally { setSending(false); setShowSendPicker(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xoá "${ann.title}"?`)) return;
    setDeleting(true);
    try { await api.delete(`/admin/announcements/${ann.id}`); onRefresh(); }
    catch (e) { alert(e.response?.data?.message || "Xoá thất bại"); }
    finally { setDeleting(false); }
  };

  const handleEdit = async (form) => {
    await api.put(`/admin/announcements/${ann.id}`, form);
    setEditing(false); onRefresh();
  };

  if (editing) {
    return (
      <div className="border-b border-[--border-subtle] p-4">
        <ComposeForm initial={ann} onSave={handleEdit} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="border-b border-[--border-subtle] hover:bg-[--bg-elevated]/40 transition-colors">
      <button onClick={handleExpand} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <TypeBadge type={ann.type} />
          <span className="text-[13px] font-medium text-[--text-primary] truncate">{ann.title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={ann.status} />
          {ann.status === "SENT" && (
            <span className="text-[10px] text-[--text-muted] flex items-center gap-1">
              <Users size={10} /> {ann.recipientCount}
            </span>
          )}
          <span className="text-[10px] text-[--text-muted]">
            {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString("vi-VN") : ""}
          </span>
          {expanded ? <ChevronUp size={13} className="text-[--text-muted]" /> : <ChevronDown size={13} className="text-[--text-muted]" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Content preview */}
          <div className="bg-[--bg-elevated] border border-[--border-subtle] p-4">
            <p className="text-[10px] text-[--text-muted] mb-1.5 uppercase tracking-wider">Subject</p>
            <p className="text-[12px] text-[--text-secondary] font-medium mb-3">{ann.emailSubject || ann.title}</p>
            <pre className="text-[11px] text-[--text-muted] whitespace-pre-wrap font-sans leading-relaxed border-t border-[--border-subtle] pt-3">{ann.content}</pre>
          </div>

          {ann.status === "DRAFT" && previewCount !== null && (
            <p className="text-[11px] text-[--text-muted] flex items-center gap-1.5">
              <Users size={11} /> Mặc định gửi đến <span className="text-[--text-primary] font-semibold mx-1">{previewCount}</span> người dùng
            </p>
          )}
          {ann.status === "SENT" && ann.sentAt && (
            <p className="text-[11px] text-[--text-muted] flex items-center gap-1.5">
              <Clock size={11} /> Đã gửi lúc {new Date(ann.sentAt).toLocaleString("vi-VN")} · {ann.recipientCount} người nhận
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {ann.status === "DRAFT" && (
              <>
                <button
                  onClick={() => setShowSendPicker(s => !s)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors"
                >
                  <Send size={12} />
                  {showSendPicker ? "Thu gọn" : "Duyệt & Gửi"}
                  {sendIds.length > 0 && <span className="bg-black/20 px-1.5 py-0.5 text-[9px]">{sendIds.length}</span>}
                </button>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-[--text-secondary] border border-[--border-subtle] hover:text-[--text-primary] hover:border-[--text-muted] transition-colors">
                  <Edit2 size={11} /> Chỉnh sửa
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-[--text-muted] hover:text-red-400 border border-transparent hover:border-red-500/20 transition-colors">
                  {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Xoá
                </button>
              </>
            )}
          </div>

          {/* Send picker panel */}
          {showSendPicker && ann.status === "DRAFT" && (
            <div className="bg-[--bg-elevated] border border-[--border-subtle] p-4 space-y-4">
              <p className="text-[12px] font-semibold text-[--text-primary] flex items-center gap-2">
                <Users size={13} className="text-gold" /> Chọn người nhận cụ thể
                <span className="text-[10px] text-[--text-muted] font-normal">— không chọn = gửi theo cấu hình</span>
              </p>
              <RecipientPicker selectedIds={sendIds} onChange={setSendIds} />
              <div className="flex justify-end gap-2 pt-1 border-t border-[--border-subtle]">
                <button onClick={() => { setShowSendPicker(false); setSendIds([]); }} className="px-3 py-2 text-[11px] text-[--text-muted] hover:text-[--text-primary] border border-[--border-subtle] transition-colors">Huỷ</button>
                <button
                  onClick={handleSend} disabled={sending}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
                >
                  {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Xác nhận gửi {sendIds.length > 0 ? `(${sendIds.length})` : "(tất cả)"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Trigger Panel ─────────────────────────────────────────────────────────────

const TRIGGERS = [
  { key: "new-lesson",     label: "Bài học mới",      icon: BookOpen, color: "text-blue-400",    border: "border-blue-500/20",    bg: "hover:bg-blue-500/5",    fields: [{ key: "lessonTitle", label: "Tên bài học", placeholder: "Kỹ thuật ngắt giọng" }] },
  { key: "discount",       label: "Khuyến mãi",       icon: Tag,      color: "text-amber-400",   border: "border-amber-500/20",   bg: "hover:bg-amber-500/5",   fields: [{ key: "planName", label: "Tên gói", placeholder: "Gói FULL" }, { key: "discountPercent", label: "% giảm", placeholder: "30" }, { key: "discountCode", label: "Mã", placeholder: "SUMMER30" }] },
  { key: "maintenance",    label: "Bảo trì",          icon: Wrench,   color: "text-red-400",     border: "border-red-500/20",     bg: "hover:bg-red-500/5",     fields: [{ key: "time", label: "Thời gian", placeholder: "Chủ nhật 14/7 từ 2:00-4:00" }, { key: "duration", label: "Thời lượng", placeholder: "2 giờ" }] },
  { key: "social-post",    label: "Bài đăng FB",      icon: Share2,   color: "text-pink-400",    border: "border-pink-500/20",    bg: "hover:bg-pink-500/5",    fields: [{ key: "postTitle", label: "Tiêu đề", placeholder: "10 lỗi MC hay gặp" }, { key: "postUrl", label: "Link", placeholder: "https://facebook.com/..." }] },
  { key: "feature-update", label: "Tính năng mới",    icon: Zap,      color: "text-purple-400",  border: "border-purple-500/20",  bg: "hover:bg-purple-500/5",  fields: [{ key: "featureName", label: "Tên tính năng", placeholder: "Phân tích giọng v2" }, { key: "description", label: "Mô tả", placeholder: "Cải thiện 40%..." }] },
  { key: "competition",    label: "Cuộc thi",         icon: Trophy,   color: "text-emerald-400", border: "border-emerald-500/20", bg: "hover:bg-emerald-500/5", fields: [{ key: "competitionName", label: "Tên cuộc thi", placeholder: "MC Tài Năng Tháng 7" }, { key: "description", label: "Mô tả", placeholder: "Giải nhất 500k..." }] },
];

function TriggerPanel({ onRefresh }) {
  const [active, setActive] = useState(null);
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFire = async (key) => {
    setLoading(true);
    try {
      await api.post(`/admin/announcements/trigger/${key}`, fields);
      setActive(null); setFields({}); onRefresh();
    } catch (e) { alert(e.response?.data?.message || "Thất bại"); }
    finally { setLoading(false); }
  };

  const trigger = TRIGGERS.find(t => t.key === active);

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-[--text-muted] flex items-center gap-1.5">
        <Info size={11} /> Hệ thống tự tạo bản nháp → Admin duyệt trước khi gửi.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {TRIGGERS.map(t => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setActive(isActive ? null : t.key); setFields({}); }}
              className={`flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium border transition-all text-left ${
                isActive ? `${t.border} ${t.bg} ${t.color} bg-[--bg-elevated]` : `border-[--border-subtle] text-[--text-muted] hover:text-[--text-primary] ${t.border} ${t.bg}`
              }`}
            >
              <Icon size={13} className={isActive ? t.color : ""} /> {t.label}
            </button>
          );
        })}
      </div>

      {trigger && (
        <div className="bg-[--bg-elevated] border border-[--border-subtle] p-5 space-y-3">
          <p className="text-[12px] font-semibold text-[--text-primary] flex items-center gap-2">
            <trigger.icon size={13} className={trigger.color} /> Tạo thông báo: {trigger.label}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {trigger.fields.map(f => (
              <div key={f.key}>
                <p className={labelCls}>{f.label}</p>
                <input className={inputCls} value={fields[f.key] || ""} onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setActive(null); setFields({}); }} className="px-3 py-2 text-[11px] text-[--text-muted] hover:text-[--text-primary] border border-[--border-subtle] transition-colors">Huỷ</button>
            <button onClick={() => handleFire(trigger.key)} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors">
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Tạo bản nháp
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
    try { setAnnouncements((await api.get("/admin/announcements")).data?.data || []); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (form) => {
    await api.post("/admin/announcements", form);
    setTab("drafts");
    fetchAll();
  };

  const filtered =
    tab === "drafts" ? announcements.filter(a => a.status === "DRAFT") :
    tab === "sent"   ? announcements.filter(a => a.status === "SENT")  :
    announcements;

  const draftCount = announcements.filter(a => a.status === "DRAFT").length;
  const sentCount  = announcements.filter(a => a.status === "SENT").length;
  const totalRecipients = announcements.filter(a => a.status === "SENT").reduce((s, a) => s + (a.recipientCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tổng thông báo", value: announcements.length, icon: Bell,  color: "text-[--text-muted]",  sub: `${sentCount} đã gửi` },
          { label: "Chờ duyệt",      value: draftCount,           icon: Clock, color: "text-amber-400",        sub: "cần xem xét" },
          { label: "Lượt nhận email", value: totalRecipients,     icon: Users, color: "text-emerald-400",      sub: "tổng cộng" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[--bg-surface] border border-[--border-subtle] p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-[--bg-elevated] border border-[--border-subtle] flex items-center justify-center shrink-0">
                <Icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-[22px] font-bold text-[--text-primary] leading-none">{s.value.toLocaleString()}</p>
                <p className="text-[11px] text-[--text-muted] mt-1">{s.label}</p>
                <p className="text-[10px] text-[--text-muted] opacity-60">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-[--border-subtle]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-5 py-2.5 text-[12px] font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-gold text-[--text-primary]" : "border-transparent text-[--text-muted] hover:text-[--text-secondary]"
            }`}
          >
            {t.label}
            {t.id === "drafts" && draftCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                {draftCount}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto">
          <button onClick={fetchAll} className="flex items-center gap-1.5 text-[11px] text-[--text-muted] hover:text-[--text-primary] px-2 py-1 transition-colors">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Compose */}
      {tab === "compose" && <ComposeForm onSave={handleCreate} onCancel={() => setTab("all")} />}

      {/* Triggers */}
      {tab === "triggers" && <TriggerPanel onRefresh={() => { fetchAll(); setTab("drafts"); }} />}

      {/* List tabs */}
      {(tab === "all" || tab === "drafts" || tab === "sent") && (
        loading ? (
          <div className="flex items-center justify-center py-16 text-[--text-muted]">
            <Loader2 size={16} className="animate-spin mr-2" />
            <span className="text-[12px]">Đang tải...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[--text-muted]">
            <div className="w-12 h-12 bg-[--bg-elevated] border border-[--border-subtle] flex items-center justify-center mb-4">
              <Bell size={20} className="opacity-30" />
            </div>
            <p className="text-[13px] font-medium text-[--text-secondary] mb-1">
              {tab === "drafts" ? "Không có thông báo chờ duyệt" : tab === "sent" ? "Chưa có thông báo nào được gửi" : "Chưa có thông báo nào"}
            </p>
            {tab !== "sent" && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => setTab("compose")} className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-[--text-secondary] border border-[--border-subtle] hover:text-[--text-primary] hover:border-[--text-muted] transition-colors">
                  <Plus size={11} /> Tạo thủ công
                </button>
                <button onClick={() => setTab("triggers")} className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-[--text-secondary] border border-[--border-subtle] hover:text-[--text-primary] hover:border-[--text-muted] transition-colors">
                  <Zap size={11} /> Dùng trigger
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-[--border-subtle] bg-[--bg-surface]">
            <div className="text-[10px] text-[--text-muted] uppercase tracking-widest font-semibold px-4 py-2.5 border-b border-[--border-subtle] flex items-center justify-between bg-[--bg-elevated]">
              <span>Loại · Tiêu đề · Trạng thái</span>
              <span>{filtered.length} thông báo</span>
            </div>
            {filtered.map(ann => (
              <AnnouncementRow key={ann.id} ann={ann} onRefresh={fetchAll} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default NotificationManager;

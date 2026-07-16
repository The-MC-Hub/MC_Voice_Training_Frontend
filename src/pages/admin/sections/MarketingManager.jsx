import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Trash2, Edit3, Save, X, Facebook, ExternalLink, Image, Eye,
  ToggleLeft, ToggleRight, Mail, Send, RefreshCw, CheckCircle2, XCircle,
  Clock, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import {
  adminFetchSocialPosts, adminCreateSocialPost, adminUpdateSocialPost,
  adminDeleteSocialPost, adminToggleSocialPost,
} from '../../../services/socialPostService';
import { invalidateSocialPostCache } from '../../../components/ui/SocialFeedCarousel';
import SocialFeedCarousel from '../../../components/ui/SocialFeedCarousel';
import {
  fetchTemplates, createTemplate, updateTemplate, deleteTemplate,
  sendCampaign, countRecipients, previewRecipients, fetchCampaigns, fetchCampaignLogs, sendTestMail,
} from '../../../services/emailCampaignService';

// ── Shared ────────────────────────────────────────────────────────────────────
  
const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex gap-0 border-b border-[--border-subtle] mb-6">
    {tabs.map((t, i) => (
      <button
        key={t}
        onClick={() => onChange(i)}
        className={`px-5 py-2.5 text-[12px] font-semibold transition-all border-b-2 -mb-px ${
          active === i
            ? 'border-gold text-[--text-primary]'
            : 'border-transparent text-[--text-muted] hover:text-[--text-secondary]'
        }`}
      >
        {t}
      </button>
    ))}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    SENDING:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    FAILED:    'bg-red-500/10 text-red-400 border-red-500/20',
    SENT:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border ${map[status] || 'bg-[--bg-elevated] text-[--text-muted] border-[--border-subtle]'}`}>
      {status}
    </span>
  );
};

// ── Social Feed Tab (original code) ──────────────────────────────────────────

const EMPTY_FORM = { image: '', description: '', fbLink: '', sortOrder: 0, active: true };

function SocialFeedTab() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewMode, setPreviewMode] = useState(false);
  const fileRef = useRef();

  const loadPosts = async () => {
    setLoading(true);
    try { setPosts((await adminFetchSocialPosts()) || []); }
    catch { setPosts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPosts(); }, []);

  const openNew = () => {
    const maxOrder = posts.reduce((m, p) => Math.max(m, p.sortOrder ?? 0), 0);
    setForm({ ...EMPTY_FORM, sortOrder: maxOrder + 1 });
    setEditing('new');
  };
  const openEdit = (post) => {
    setForm({ image: post.image || '', description: post.description || '', fbLink: post.fbLink || '', sortOrder: post.sortOrder ?? 0, active: post.active ?? true });
    setEditing(post.id);
  };
  const cancelEdit = () => { setEditing(null); setForm(EMPTY_FORM); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') await adminCreateSocialPost(form);
      else await adminUpdateSocialPost(editing, form);
      invalidateSocialPostCache();
      await loadPosts();
      cancelEdit();
    } catch { alert(t('admin.marketingManager.saveFailed')); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm(t('admin.marketingManager.confirmDeletePost'))) return;
    try { await adminDeleteSocialPost(id); invalidateSocialPostCache(); setPosts(p => p.filter(x => x.id !== id)); }
    catch { alert(t('admin.marketingManager.deleteFailed')); }
  };

  const toggle = async (id) => {
    try { const u = await adminToggleSocialPost(id); invalidateSocialPostCache(); setPosts(p => p.map(x => x.id === id ? u : x)); }
    catch { alert(t('admin.marketingManager.toggleFailed')); }
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const isValid = form.description.trim().length > 0 && form.fbLink.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[--text-muted]">{t('admin.marketingManager.socialFeedDesc')}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode(p => !p)} className={`flex items-center gap-2 px-3 py-2 text-[12px] font-medium border transition-all ${previewMode ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-[--bg-surface] border-[--border-subtle] text-[--text-secondary] hover:text-[--text-primary]'}`}>
            <Eye size={13} /> {t('admin.marketingManager.preview')}
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-3 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors">
            <Plus size={13} /> {t('admin.marketingManager.addPost')}
          </button>
        </div>
      </div>

      {previewMode && (
        <div className="bg-[--bg-surface] border border-[--border-subtle] p-6">
          <p className="text-[11px] text-[--text-muted] uppercase tracking-wider mb-4">{t('admin.marketingManager.previewCarouselHint')}</p>
          <SocialFeedCarousel />
        </div>
      )}

      {editing && (
        <div className="bg-[--bg-surface] border border-[--border-subtle] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[--text-primary]">{editing === 'new' ? t('admin.marketingManager.addNewPost') : t('admin.marketingManager.editPost')}</span>
            <button onClick={cancelEdit} className="text-[--text-muted] hover:text-[--text-primary]"><X size={15} /></button>
          </div>
          <div>
            <p className="text-[11px] text-[--text-muted] mb-2 uppercase tracking-wider">{t('admin.marketingManager.imageOptional')}</p>
            <div className="flex items-start gap-3">
              {form.image ? (
                <div className="relative w-32 h-20 overflow-hidden shrink-0">
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm(f => ({ ...f, image: '' }))} className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white flex items-center justify-center"><X size={10} /></button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} className="w-32 h-20 bg-[--bg-elevated] border border-dashed border-[--border-subtle] flex flex-col items-center justify-center gap-1 text-[--text-muted] hover:text-[--text-primary] hover:border-[--text-muted] transition-colors shrink-0">
                  <Image size={16} /><span className="text-[10px]">{t('admin.marketingManager.uploadImage')}</span>
                </button>
              )}
              <div className="flex-1 text-[11px] text-[--text-muted] leading-relaxed">
                {t('admin.marketingManager.thumbnailHint')}
                <input type="text" placeholder="https://..." value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="mt-1 w-full bg-[--bg-elevated] border border-[--border-subtle] px-2 py-1.5 text-[11px] text-[--text-primary] outline-none focus:border-[--text-muted]" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.descriptionRequired')}</p>
            <textarea rows={3} placeholder={t('admin.marketingManager.shortDescPlaceholder')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] placeholder:text-zinc-600 outline-none focus:border-[--text-muted] resize-none" />
          </div>
          <div>
            <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.fbLinkRequired')}</p>
            <div className="flex items-center gap-2">
              <Facebook size={14} className="text-blue-400 shrink-0" />
              <input type="url" placeholder="https://www.facebook.com/..." value={form.fbLink} onChange={e => setForm(f => ({ ...f, fbLink: e.target.value }))} className="flex-1 bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] placeholder:text-zinc-600 outline-none focus:border-[--text-muted]" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.priority')}</p>
              <input type="number" min={0} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className="w-20 bg-[--bg-elevated] border border-[--border-subtle] px-2 py-1.5 text-[12px] text-[--text-primary] outline-none focus:border-[--text-muted]" />
            </div>
            <div>
              <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.visibility')}</p>
              <button onClick={() => setForm(f => ({ ...f, active: !f.active }))} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border transition-all ${form.active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted]'}`}>
                {form.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                {form.active ? t('admin.marketingManager.show') : t('admin.marketingManager.hide')}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={save} disabled={!isValid || saving} className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Save size={13} /> {saving ? t('admin.marketingManager.saving') : t('admin.marketingManager.savePost')}
            </button>
            <button onClick={cancelEdit} className="px-4 py-2 text-[--text-muted] text-[12px] hover:text-[--text-primary]">{t('admin.marketingManager.cancel')}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading && <div className="text-center py-8 text-[--text-muted] text-[12px]">{t('admin.marketingManager.loading')}</div>}
        {!loading && posts.length === 0 && <div className="text-center py-12 text-[--text-muted] text-[13px]">{t('admin.marketingManager.noPosts')}</div>}
        {posts.map((post, i) => (
          <div key={post.id} className={`bg-[--bg-surface] border p-4 flex items-start gap-4 transition-opacity ${post.active ? 'border-[--border-subtle]' : 'border-[--border-subtle] opacity-50'}`}>
            <div className="w-16 h-12 shrink-0 bg-[--bg-elevated] border border-[--border-subtle] overflow-hidden flex items-center justify-center">
              {post.image ? <img src={post.image} alt="" className="w-full h-full object-cover" /> : <Facebook size={18} className="text-blue-400/40" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[--text-secondary] leading-relaxed line-clamp-2">{post.description}</p>
              <a href={post.fbLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                <ExternalLink size={10} /> {post.fbLink?.length > 60 ? post.fbLink.slice(0, 60) + '…' : post.fbLink}
              </a>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-[10px] text-[--text-muted]">#{post.sortOrder ?? i}</span>
              <span className={`text-[10px] px-1.5 py-0.5 border ${post.active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted]'}`}>{post.active ? t('admin.marketingManager.show') : t('admin.marketingManager.hide')}</span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                {t('admin.marketingManager.clicksCount', { count: post.clickCount ?? 0 })}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggle(post.id)} className="w-7 h-7 flex items-center justify-center text-[--text-muted] hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all">
                {post.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              </button>
              <button onClick={() => openEdit(post)} className="w-7 h-7 flex items-center justify-center text-[--text-muted] hover:text-[--text-primary] border border-transparent hover:border-[--border-subtle] transition-all">
                <Edit3 size={13} />
              </button>
              <button onClick={() => remove(post.id)} className="w-7 h-7 flex items-center justify-center text-[--text-muted] hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && posts.length > 0 && (
        <p className="text-[11px] text-[--text-muted]">{t('admin.marketingManager.visibleOfTotal', { visible: posts.filter(p => p.active).length, total: posts.length })}</p>
      )}
    </div>
  );
}

// ── Email Templates Sub-tab ───────────────────────────────────────────────────

const defaultDesign = { logoUrl: '', bannerUrl: '', title: '', description: '', buttonText: '', buttonLink: '' };

// ── Generate preview HTML from design data (mirrors backend generateHtmlFromDesign) ──
function generatePreviewHtml(designData, sampleName = '{{tên}}', sampleEmail = '{{email}}') {
  const d = designData || {};
  const logoHtml = d.logoUrl ? `<img src="${d.logoUrl}" alt="Logo" style="max-height:60px;display:block;margin:0 auto 20px auto;border-radius:8px;" />` : '';
  const bannerHtml = d.bannerUrl ? `<img src="${d.bannerUrl}" alt="Banner" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px;margin-bottom:24px;" />` : '';
  const buttonHtml = (d.buttonLink && d.buttonText) ? `<div style="text-align:center;margin:32px 0 16px 0;"><a href="${d.buttonLink}" style="background-color:#f5a623;color:#000;text-decoration:none;padding:14px 32px;font-weight:700;border-radius:8px;display:inline-block;font-size:16px;">${d.buttonText}</a></div>` : '';
  const title = d.title || 'Tiêu đề email';
  const description = d.description || '';
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;}
.wrapper{width:100%;background-color:#f3f4f6;padding:32px 0;}
.container{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.07);}
.header{padding:28px 28px 0;text-align:center;}
.content{padding:0 28px 28px;}
.title{font-size:22px;font-weight:700;color:#111827;margin:16px 0 12px;line-height:1.3;}
.desc{font-size:15px;line-height:1.7;color:#4b5563;margin:0 0 20px;white-space:pre-line;}
.footer{background:#f9fafb;padding:20px 28px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;}
.footer a{color:#f5a623;text-decoration:none;}
</style></head><body>
<div class="wrapper"><div class="container">
<div class="header">${logoHtml}</div>
<div class="content">
${bannerHtml}
<h1 class="title">Xin chào ${sampleName}, ${title}</h1>
<div class="desc">${description}</div>
${buttonHtml}
</div>
<div class="footer">
<p>Email này được gửi đến <strong>${sampleEmail}</strong> vì bạn là thành viên của MC AI Voice Hub.</p>
<p>© 2025 The MC Hub · <a href="mailto:themchubtraining@gmail.com">themchubtraining@gmail.com</a></p>
</div>
</div></div></body></html>`;
}

function EmailPreviewPanel({ htmlContent, designData, useRawHtml }) {
  const { t } = useTranslation();
  const html = useRawHtml
    ? (htmlContent || '')
    : generatePreviewHtml(designData);
  const isEmpty = !html || html.trim().length < 20;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[--text-muted] uppercase tracking-wider font-semibold">{t('admin.marketingManager.previewEmail')}</span>
        <span className="text-[10px] text-[--text-muted] bg-[--bg-elevated] border border-[--border-subtle] px-2 py-0.5">{t('admin.marketingManager.exactRenderHint')}</span>
      </div>
      <div className="flex-1 border border-[--border-subtle] bg-[#f3f4f6] rounded overflow-hidden min-h-0">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-[--text-muted] gap-3 p-8">
            <Mail size={32} className="opacity-20" />
            <p className="text-[12px] text-center">{t('admin.marketingManager.fillContentHint')}</p>
          </div>
        ) : (
          <iframe
            key={html}
            srcDoc={html}
            className="w-full h-full border-0"
            style={{ minHeight: '500px' }}
            title="Email Preview"
          />
        )}
      </div>
    </div>
  );
}

function EmailTemplatesTab() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', subject: '', htmlContent: '', designData: { ...defaultDesign } });
  const [useRawHtml, setUseRawHtml] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTemplates(await fetchTemplates()); } catch { setTemplates([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', subject: '', htmlContent: '', designData: { ...defaultDesign } });
    setUseRawHtml(false);
    setShowForm(true);
  };
  const openEdit = (t) => {
    setEditing(t.id);
    setForm({ name: t.name, subject: t.subject, htmlContent: t.htmlContent || '', designData: { ...defaultDesign, ...(t.designData || {}) } });
    setUseRawHtml(false);
    setShowForm(true);
  };
  const setDesign = (key, val) => setForm(f => ({ ...f, designData: { ...f.designData, [key]: val } }));

  const handleSave = async () => {
    if (!form.name || !form.subject) return;
    setSaving(true);
    try {
      editing ? await updateTemplate(editing, form) : await createTemplate(form);
      setShowForm(false);
      load();
    } catch { alert(t('admin.marketingManager.saveFailed')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.marketingManager.confirmDeleteTemplate'))) return;
    await deleteTemplate(id);
    load();
  };

  const handleTestSend = async (templateId) => {
    if (!testEmail) return;
    setTestSending(true);
    try { await sendTestMail(templateId, testEmail); alert(t('admin.marketingManager.testMailSent')); }
    catch { alert(t('admin.marketingManager.sendFailed')); }
    finally { setTestSending(false); setTestingId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[--text-muted]">{t('admin.marketingManager.templatesDesc')}</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors">
          <Plus size={13} /> {t('admin.marketingManager.createTemplate')}
        </button>
      </div>

      {showForm && (
        <div className="bg-[--bg-surface] border border-[--border-subtle]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[--border-subtle]">
            <span className="text-[13px] font-semibold text-[--text-primary]">{editing ? t('admin.marketingManager.editTemplateTitle') : t('admin.marketingManager.createTemplateTitle')}</span>
            <button onClick={() => setShowForm(false)} className="text-[--text-muted] hover:text-[--text-primary]"><X size={15} /></button>
          </div>

          {/* 2-col: form left, preview right */}
          <div className="flex gap-0 min-h-[600px]">

            {/* LEFT — form */}
            <div className="flex-1 p-5 space-y-4 border-r border-[--border-subtle] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {[['name', t('admin.marketingManager.templateName')], ['subject', t('admin.marketingManager.emailSubject')]].map(([k, label]) => (
                  <div key={k}>
                    <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{label} *</p>
                    <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] outline-none focus:border-[--text-muted]" />
                  </div>
                ))}
              </div>

              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <button onClick={() => setUseRawHtml(false)} className={`px-3 py-1.5 text-[11px] font-semibold border transition-all ${!useRawHtml ? 'bg-gold text-black border-gold' : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted] hover:text-[--text-primary]'}`}>
                  {t('admin.marketingManager.designBuilder')}
                </button>
                <button onClick={() => setUseRawHtml(true)} className={`px-3 py-1.5 text-[11px] font-semibold border transition-all ${useRawHtml ? 'bg-gold text-black border-gold' : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted] hover:text-[--text-primary]'}`}>
                  {t('admin.marketingManager.rawHtml')}
                </button>
                <span className="text-[11px] text-[--text-muted]">
                  {useRawHtml ? t('admin.marketingManager.rawHtmlHint') : t('admin.marketingManager.generateFromFieldsHint')}
                </span>
              </div>

              {useRawHtml ? (
                <div>
                  <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.rawHtmlRequired')}</p>
                  <textarea
                    rows={20}
                    value={form.htmlContent}
                    onChange={e => setForm(f => ({ ...f, htmlContent: e.target.value }))}
                    placeholder="<!DOCTYPE html><html>..."
                    className="w-full bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[11px] text-[--text-primary] outline-none focus:border-[--text-muted] resize-y font-mono leading-relaxed"
                  />
                  <p className="text-[10px] text-[--text-muted] mt-1">
                    {t('admin.marketingManager.personalizeHintPrefix')} <code className="bg-[--bg-elevated] px-1">{'{{tên}}'}</code> {t('admin.marketingManager.and')} <code className="bg-[--bg-elevated] px-1">{'{{email}}'}</code> {t('admin.marketingManager.personalizeHintSuffix')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {[['title', t('admin.marketingManager.contentTitle')], ['buttonText', t('admin.marketingManager.ctaButtonText')], ['buttonLink', t('admin.marketingManager.ctaButtonLink')], ['logoUrl', t('admin.marketingManager.logoUrl')], ['bannerUrl', t('admin.marketingManager.bannerUrl')]].map(([k, label]) => (
                      <div key={k}>
                        <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{label}</p>
                        <input value={form.designData[k]} onChange={e => setDesign(k, e.target.value)} className="w-full bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] outline-none focus:border-[--text-muted]" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.mainContent')}</p>
                    <textarea rows={5} value={form.designData.description} onChange={e => setDesign('description', e.target.value)} className="w-full bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] outline-none focus:border-[--text-muted] resize-none" />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={handleSave} disabled={saving || !form.name || !form.subject} className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {editing ? t('admin.marketingManager.update') : t('admin.marketingManager.createTemplate')}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-[--text-muted] text-[12px] hover:text-[--text-primary]">{t('admin.marketingManager.cancel')}</button>
              </div>
            </div>

            {/* RIGHT — live preview */}
            <div className="w-[480px] shrink-0 p-4 flex flex-col">
              <EmailPreviewPanel
                htmlContent={form.htmlContent}
                designData={form.designData}
                useRawHtml={useRawHtml}
              />
            </div>

          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-[--text-muted] text-[12px]">{t('admin.marketingManager.loading')}</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-[--text-muted] text-[13px]">{t('admin.marketingManager.noTemplates')}</div>
      ) : (
        <div className="space-y-3">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-[--bg-surface] border border-[--border-subtle] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[--text-primary]">{tpl.name}</p>
                  <p className="text-[11px] text-[--text-muted] mt-0.5">{t('admin.marketingManager.subjectLabel')}: {tpl.subject}</p>
                  {tpl.designData?.title && <p className="text-[11px] text-[--text-muted]">{t('admin.marketingManager.contentTitle')}: {tpl.designData.title}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setTestingId(testingId === tpl.id ? null : tpl.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all">
                    <Mail size={11} /> {t('admin.marketingManager.test')}
                  </button>
                  <button onClick={() => openEdit(tpl)} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-[--border-subtle] text-[--text-secondary] hover:text-[--text-primary] transition-all">
                    <Edit3 size={11} /> {t('admin.marketingManager.edit')}
                  </button>
                  <button onClick={() => handleDelete(tpl.id)} className="w-7 h-7 flex items-center justify-center text-[--text-muted] hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {testingId === tpl.id && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[--border-subtle]">
                  <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder={t('admin.marketingManager.testEmailPlaceholder')} className="flex-1 bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] outline-none focus:border-[--text-muted]" />
                  <button onClick={() => handleTestSend(tpl.id)} disabled={testSending || !testEmail} className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40">
                    {testSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} {t('admin.marketingManager.sendTest')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Send Campaign Sub-tab ─────────────────────────────────────────────────────

const PLANS = ['FREE', 'BASIC', 'FULL', 'ANNUAL'];
const ROLES = ['CLIENT', 'MC'];

const PLAN_LABELS = { FREE: 'Free', BASIC: 'Basic', FULL: 'Full', ANNUAL: 'Annual' };
const ROLE_LABELS = { CLIENT: 'Client', MC: 'MC', ADMIN: 'Admin' };

function RecipientPickerPanel({ recipients, checkedEmails, onToggle, onSelectAll, onDeselectAll, loading }) {
  const { t } = useTranslation();
  const allChecked = recipients.length > 0 && checkedEmails.size === recipients.length;
  const someChecked = checkedEmails.size > 0 && !allChecked;

  return (
    <div className="border border-[--border-subtle] bg-[--bg-surface]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[--border-subtle] bg-[--bg-elevated]">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allChecked}
              ref={el => { if (el) el.indeterminate = someChecked; }}
              onChange={e => e.target.checked ? onSelectAll() : onDeselectAll()}
              className="w-3.5 h-3.5 accent-[--gold]"
            />
            <span className="text-[11px] text-[--text-muted] uppercase tracking-wider">{t('admin.marketingManager.selectAll')}</span>
          </label>
        </div>
        <span className="text-[12px] font-semibold text-gold">
          {loading ? '...' : t('admin.marketingManager.checkedOfTotalPeople', { checked: checkedEmails.size, total: recipients.length })}
        </span>
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto divide-y divide-[--border-subtle]">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-[--text-muted] text-[12px]">
            <Loader2 size={14} className="animate-spin" /> {t('admin.marketingManager.loadingList')}
          </div>
        ) : recipients.length === 0 ? (
          <div className="text-center py-8 text-[--text-muted] text-[12px]">{t('admin.marketingManager.noRecipientsFound')}</div>
        ) : (
          recipients.map(u => {
            const checked = checkedEmails.has(u.email);
            return (
              <label
                key={u.email}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors select-none ${checked ? 'bg-gold/5' : 'hover:bg-[--bg-elevated]'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(u.email)}
                  className="w-3.5 h-3.5 shrink-0 accent-[--gold]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-[--text-primary] truncate">{u.name || u.email}</span>
                    {u.isPremium && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">PREMIUM</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[--text-muted] font-mono">{u.email}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {u.plan && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[--bg-elevated] border border-[--border-subtle] text-[--text-muted]">
                      {PLAN_LABELS[u.plan] || u.plan}
                    </span>
                  )}
                  {u.role && u.role !== 'ADMIN' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function SendCampaignTab() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [targetType, setTargetType] = useState('ALL');
  const [targetPlans, setTargetPlans] = useState([]);
  const [targetRoles, setTargetRoles] = useState([]);
  const [customEmails, setCustomEmails] = useState('');

  // recipient picker state
  const [recipients, setRecipients] = useState([]);
  const [checkedEmails, setCheckedEmails] = useState(new Set());
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [recipientsPreviewed, setRecipientsPreviewed] = useState(false);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { fetchTemplates().then(setTemplates).catch(() => {}); }, []);

  const toggleItem = (list, setList, val) =>
    setList(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const buildTargetPayload = useCallback(() => {
    const emails = customEmails.split(/[\n,]/).map(e => e.trim()).filter(Boolean);
    return {
      targetType,
      targetPlans: targetType === 'PLAN' ? targetPlans : null,
      targetRoles: targetType === 'ROLE' ? targetRoles : null,
      targetEmails: targetType === 'CUSTOM' ? emails : null,
    };
  }, [targetType, targetPlans, targetRoles, customEmails]);

  const loadRecipients = useCallback(async (payload) => {
    setLoadingRecipients(true);
    setRecipientsPreviewed(true);
    try {
      const list = await previewRecipients(payload);
      setRecipients(list || []);
      setCheckedEmails(new Set((list || []).map(u => u.email)));
    } catch {
      setRecipients([]);
      setCheckedEmails(new Set());
    } finally {
      setLoadingRecipients(false);
    }
  }, []);

  // Auto-load for ALL / PREMIUM — no sub-selection needed
  useEffect(() => {
    if (targetType === 'ALL' || targetType === 'PREMIUM') {
      loadRecipients(buildTargetPayload());
    }
  }, [targetType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-load for PLAN when plans selected, ROLE when roles selected
  useEffect(() => {
    if (targetType === 'PLAN' && targetPlans.length > 0) {
      loadRecipients(buildTargetPayload());
    }
  }, [targetPlans]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (targetType === 'ROLE' && targetRoles.length > 0) {
      loadRecipients(buildTargetPayload());
    }
  }, [targetRoles]); // eslint-disable-line react-hooks/exhaustive-deps

  // CUSTOM: load on demand (user clicks button)
  const handlePreview = () => loadRecipients(buildTargetPayload());

  const handleSend = async () => {
    if (!selectedTemplate || !subject) return;
    const finalEmails = [...checkedEmails];
    if (finalEmails.length === 0) { alert(t('admin.marketingManager.noRecipientsSelected')); return; }
    if (!confirm(t('admin.marketingManager.confirmSendCampaign', { count: finalEmails.length }))) return;
    setSending(true); setResult(null);
    try {
      // Always send as CUSTOM with final checked list so backend respects manual selection
      const payload = {
        templateId: selectedTemplate,
        subject,
        targetType: 'CUSTOM',
        targetPlans: null,
        targetRoles: null,
        targetEmails: finalEmails,
      };
      setResult(await sendCampaign(payload));
    } catch { alert(t('admin.marketingManager.sendFailed')); }
    finally { setSending(false); }
  };

  const selected = templates.find(t => t.id === selectedTemplate);
  const inputCls = 'w-full bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] outline-none focus:border-[--text-muted]';
  const chipCls = (active) => `px-3 py-1 text-[11px] font-semibold border cursor-pointer transition-colors ${active ? 'bg-gold/20 border-gold text-gold' : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted] hover:border-[--text-muted]'}`;

  return (
    <div className="space-y-5 max-w-2xl">
      <p className="text-[12px] text-[--text-muted]">{t('admin.marketingManager.dedupHint')}</p>
      <div className="bg-[--bg-surface] border border-[--border-subtle] p-5 space-y-5">

        {/* Template */}
        <div>
          <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.chooseTemplate')}</p>
          <select value={selectedTemplate} onChange={e => { setSelectedTemplate(e.target.value); const tpl = templates.find(tp => tp.id === e.target.value); if (tpl) setSubject(tpl.subject); }} className={inputCls}>
            <option value="">-- {t('admin.marketingManager.chooseTemplate')} --</option>
            {templates.map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
          </select>
        </div>
        {selected && (
          <div className="bg-[--bg-elevated] border border-[--border-subtle] px-4 py-3">
            <p className="text-[11px] text-[--text-muted] uppercase tracking-wider mb-1">{t('admin.marketingManager.preview')}</p>
            <p className="text-[13px] font-semibold text-[--text-primary]">{selected.designData?.title || selected.name}</p>
          </div>
        )}

        {/* Subject */}
        <div>
          <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.emailSubject')}</p>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder={t('admin.marketingManager.subjectPlaceholder')} className={inputCls} />
        </div>

        {/* Target type */}
        <div>
          <p className="text-[11px] text-[--text-muted] mb-2 uppercase tracking-wider">{t('admin.marketingManager.targetAudience')}</p>
          <div className="flex flex-wrap gap-2">
            {[['ALL',t('admin.marketingManager.targetAll')],['PLAN',t('admin.marketingManager.targetByPlan')],['ROLE',t('admin.marketingManager.targetByRole')],['PREMIUM',t('admin.marketingManager.targetPremium')],['CUSTOM',t('admin.marketingManager.targetCustomEmail')]].map(([val, label]) => (
              <button key={val} onClick={() => {
                setTargetType(val);
                setTargetPlans([]);
                setTargetRoles([]);
                setRecipients([]);
                setCheckedEmails(new Set());
                setRecipientsPreviewed(false);
              }} className={chipCls(targetType === val)}>{label}</button>
            ))}
          </div>
        </div>

        {/* PLAN selector */}
        {targetType === 'PLAN' && (
          <div>
            <p className="text-[11px] text-[--text-muted] mb-2 uppercase tracking-wider">{t('admin.marketingManager.choosePlanMulti')}</p>
            <div className="flex gap-2 flex-wrap">
              {PLANS.map(p => (
                <button key={p} onClick={() => toggleItem(targetPlans, setTargetPlans, p)} className={chipCls(targetPlans.includes(p))}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* ROLE selector */}
        {targetType === 'ROLE' && (
          <div>
            <p className="text-[11px] text-[--text-muted] mb-2 uppercase tracking-wider">{t('admin.marketingManager.chooseRoleMulti')}</p>
            <div className="flex gap-2">
              {ROLES.map(r => (
                <button key={r} onClick={() => toggleItem(targetRoles, setTargetRoles, r)} className={chipCls(targetRoles.includes(r))}>{r}</button>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOM emails */}
        {targetType === 'CUSTOM' && (
          <div>
            <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">{t('admin.marketingManager.customEmailListHint')}</p>
            <textarea value={customEmails} onChange={e => setCustomEmails(e.target.value)} rows={5} placeholder="email1@example.com&#10;email2@example.com" className={`${inputCls} font-mono resize-y`} />
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-3 pt-1 border-t border-[--border-subtle]">
          {/* CUSTOM: manual load button; others: refresh icon only */}
          {targetType === 'CUSTOM' ? (
            <button onClick={handlePreview} disabled={loadingRecipients} className="flex items-center gap-2 px-4 py-2 border border-[--border-subtle] text-[12px] text-[--text-secondary] hover:border-[--text-muted] transition-colors disabled:opacity-40">
              {loadingRecipients ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {t('admin.marketingManager.loadList')}
            </button>
          ) : (
            <button onClick={handlePreview} disabled={loadingRecipients} title={t('admin.marketingManager.reloadList')} className="w-8 h-8 flex items-center justify-center border border-[--border-subtle] text-[--text-muted] hover:text-[--text-primary] hover:border-[--text-muted] transition-colors disabled:opacity-40">
              {loadingRecipients ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            </button>
          )}
          {recipientsPreviewed && (
            <span className="text-[12px] text-[--text-muted]">
              {loadingRecipients ? t('admin.marketingManager.loading') : (
                <>{t('admin.marketingManager.selectedPrefix')} <span className="font-semibold text-gold">{checkedEmails.size}</span> / {recipients.length} {t('admin.marketingManager.peopleUnit')}</>
              )}
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={sending || !selectedTemplate || !subject || !recipientsPreviewed || checkedEmails.size === 0}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {t('admin.marketingManager.sendCampaign')}
          </button>
        </div>

        {/* Recipient picker panel */}
        {recipientsPreviewed && (
          <RecipientPickerPanel
            recipients={recipients}
            checkedEmails={checkedEmails}
            loading={loadingRecipients}
            onToggle={(email) => setCheckedEmails(prev => {
              const next = new Set(prev);
              next.has(email) ? next.delete(email) : next.add(email);
              return next;
            })}
            onSelectAll={() => setCheckedEmails(new Set(recipients.map(u => u.email)))}
            onDeselectAll={() => setCheckedEmails(new Set())}
          />
        )}
      </div>

      {result && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-semibold"><CheckCircle2 size={15} /> {t('admin.marketingManager.campaignStarted')}</div>
          <p className="text-[12px] text-[--text-secondary]">ID: <span className="font-mono">{result.id}</span></p>
          <p className="text-[12px] text-[--text-secondary]">{t('admin.marketingManager.totalRecipients')}: <span className="font-semibold text-gold">{result.totalRecipients}</span></p>
          <p className="text-[11px] text-[--text-muted]">{t('admin.marketingManager.checkHistoryTabHint')}</p>
        </div>
      )}
    </div>
  );
}

// ── Campaign History Sub-tab ──────────────────────────────────────────────────

function CampaignHistoryTab() {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [logs, setLogs] = useState({});
  const [logsLoading, setLogsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCampaigns(await fetchCampaigns()); } catch { setCampaigns([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!logs[id]) {
      setLogsLoading(true);
      try {
        const data = await fetchCampaignLogs(id);
        setLogs(prev => ({ ...prev, [id]: data }));
      } catch { /* ignore */ }
      finally { setLogsLoading(false); }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[--text-muted]">{t('admin.marketingManager.campaignHistoryDesc')}</p>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium border border-[--border-subtle] text-[--text-secondary] hover:text-[--text-primary] bg-[--bg-surface] transition-all">
          <RefreshCw size={12} /> {t('admin.marketingManager.refresh')}
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-[--text-muted] text-[12px]">{t('admin.marketingManager.loading')}</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 text-[--text-muted] text-[13px]">{t('admin.marketingManager.noCampaigns')}</div>
      ) : (
        <div className="space-y-2">
          {campaigns.map(c => (
            <div key={c.id} className="bg-[--bg-surface] border border-[--border-subtle]">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[--bg-elevated] transition-colors" onClick={() => toggleExpand(c.id)}>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="text-[13px] font-semibold text-[--text-primary] truncate">{c.subject}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[--text-muted]">
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                    <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={10} /> {c.successCount}</span>
                    <span className="flex items-center gap-1 text-red-400"><XCircle size={10} /> {c.failedCount}</span>
                    <span>/ {c.totalRecipients}</span>
                  </div>
                </div>
                {expanded === c.id ? <ChevronUp size={15} className="text-[--text-muted] shrink-0" /> : <ChevronDown size={15} className="text-[--text-muted] shrink-0" />}
              </div>
              {expanded === c.id && (
                <div className="border-t border-[--border-subtle] p-4">
                  {logsLoading && !logs[c.id] ? (
                    <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-gold" /></div>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {(logs[c.id] || []).map(log => (
                        <div key={log.id} className="flex items-center gap-3 py-2 px-3 bg-[--bg-elevated] border border-[--border-subtle]">
                          {log.status === 'SENT' ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> : <XCircle size={12} className="text-red-400 shrink-0" />}
                          <span className="text-[12px] text-[--text-primary] font-mono">{log.email}</span>
                          {log.errorReason && <span className="text-[11px] text-red-400 truncate ml-auto">{log.errorReason}</span>}
                          <span className="text-[10px] text-[--text-muted] ml-auto shrink-0">{new Date(log.sentAt).toLocaleTimeString('vi-VN')}</span>
                        </div>
                      ))}
                      {logs[c.id]?.length === 0 && <p className="text-center text-[--text-muted] py-4 text-[12px]">{t('admin.marketingManager.noLogsYet')}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Email Campaigns Tab (container with 3 sub-tabs) ───────────────────────────

function EmailCampaignsTab() {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState(0);
  return (
    <div>
      <TabBar tabs={[t('admin.marketingManager.tabTemplates'), t('admin.marketingManager.tabSendCampaign'), t('admin.marketingManager.tabHistory')]} active={subTab} onChange={setSubTab} />
      {subTab === 0 && <EmailTemplatesTab />}
      {subTab === 1 && <SendCampaignTab />}
      {subTab === 2 && <CampaignHistoryTab />}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function MarketingManager() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[15px] font-semibold text-[--text-primary]">{t('admin.marketingManager.title')}</h2>
        <p className="text-[12px] text-[--text-muted] mt-0.5">{t('admin.marketingManager.subtitle')}</p>
      </div>
      <TabBar tabs={[t('admin.marketingManager.tabSocialFeed'), t('admin.marketingManager.tabEmailCampaigns')]} active={tab} onChange={setTab} />
      {tab === 0 && <SocialFeedTab />}
      {tab === 1 && <EmailCampaignsTab />}
    </div>
  );
}

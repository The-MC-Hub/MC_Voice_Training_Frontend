import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Save, X, Facebook, ExternalLink, Image, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  adminFetchSocialPosts,
  adminCreateSocialPost,
  adminUpdateSocialPost,
  adminDeleteSocialPost,
  adminToggleSocialPost,
} from '../../../services/socialPostService';
import { invalidateSocialPostCache } from '../../../components/ui/SocialFeedCarousel';
import SocialFeedCarousel from '../../../components/ui/SocialFeedCarousel';

const EMPTY_FORM = { image: '', description: '', fbLink: '', sortOrder: 0, active: true };

export default function MarketingManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // null | 'new' | post id
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewMode, setPreviewMode] = useState(false);
  const fileRef = useRef();

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await adminFetchSocialPosts();
      setPosts(data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const openNew = () => {
    const maxOrder = posts.reduce((m, p) => Math.max(m, p.sortOrder ?? 0), 0);
    setForm({ ...EMPTY_FORM, sortOrder: maxOrder + 1 });
    setEditing('new');
  };

  const openEdit = (post) => {
    setForm({
      image: post.image || '',
      description: post.description || '',
      fbLink: post.fbLink || '',
      sortOrder: post.sortOrder ?? 0,
      active: post.active ?? true,
    });
    setEditing(post.id);
  };

  const cancelEdit = () => { setEditing(null); setForm(EMPTY_FORM); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminCreateSocialPost(form);
      } else {
        await adminUpdateSocialPost(editing, form);
      }
      invalidateSocialPostCache();
      await loadPosts();
      cancelEdit();
    } catch {
      alert('Lưu thất bại. Kiểm tra lại kết nối.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Xoá bài đăng này?')) return;
    try {
      await adminDeleteSocialPost(id);
      invalidateSocialPostCache();
      setPosts(p => p.filter(x => x.id !== id));
    } catch {
      alert('Xoá thất bại.');
    }
  };

  const toggle = async (id) => {
    try {
      const updated = await adminToggleSocialPost(id);
      invalidateSocialPostCache();
      setPosts(p => p.map(x => x.id === id ? updated : x));
    } catch {
      alert('Thay đổi trạng thái thất bại.');
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[--text-primary]">Marketing & Social Feed</h2>
          <p className="text-[12px] text-[--text-muted] mt-0.5">Quản lý bài đăng Facebook hiển thị trên trang chủ.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(p => !p)}
            className={`flex items-center gap-2 px-3 py-2 text-[12px] font-medium border transition-all ${
              previewMode
                ? 'bg-gold/10 border-gold/30 text-gold'
                : 'bg-[--bg-surface] border-[--border-subtle] text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            <Eye size={13} /> Preview
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-3 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors"
          >
            <Plus size={13} /> Thêm bài đăng
          </button>
        </div>
      </div>

      {/* Preview panel */}
      {previewMode && (
        <div className="bg-[--bg-surface] border border-[--border-subtle] p-6">
          <p className="text-[11px] text-[--text-muted] uppercase tracking-wider mb-4">Preview carousel trên trang chủ (dữ liệu live từ DB)</p>
          <SocialFeedCarousel />
        </div>
      )}

      {/* Edit / New form */}
      {editing && (
        <div className="bg-[--bg-surface] border border-[--border-subtle] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[--text-primary]">
              {editing === 'new' ? 'Thêm bài đăng mới' : 'Sửa bài đăng'}
            </span>
            <button onClick={cancelEdit} className="text-[--text-muted] hover:text-[--text-primary] transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Image */}
          <div>
            <p className="text-[11px] text-[--text-muted] mb-2 uppercase tracking-wider">Ảnh (tuỳ chọn)</p>
            <div className="flex items-start gap-3">
              {form.image ? (
                <div className="relative w-32 h-20 overflow-hidden shrink-0">
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setForm(f => ({ ...f, image: '' }))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-32 h-20 bg-[--bg-elevated] border border-dashed border-[--border-subtle] flex flex-col items-center justify-center gap-1 text-[--text-muted] hover:text-[--text-primary] hover:border-[--text-muted] transition-colors shrink-0"
                >
                  <Image size={16} />
                  <span className="text-[10px]">Tải ảnh lên</span>
                </button>
              )}
              <div className="flex-1 text-[11px] text-[--text-muted] leading-relaxed">
                Ảnh thumbnail 16:9 tốt nhất. Hoặc nhập URL ảnh:
                <input
                  type="text"
                  placeholder="https://..."
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  className="mt-1 w-full bg-[--bg-elevated] border border-[--border-subtle] px-2 py-1.5 text-[11px] text-[--text-primary] outline-none focus:border-[--text-muted]"
                />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">Nội dung mô tả *</p>
            <textarea
              rows={3}
              placeholder="Mô tả ngắn về bài đăng..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] placeholder:text-zinc-600 outline-none focus:border-[--text-muted] resize-none"
            />
          </div>

          {/* FB Link */}
          <div>
            <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">Link bài đăng Facebook *</p>
            <div className="flex items-center gap-2">
              <Facebook size={14} className="text-blue-400 shrink-0" />
              <input
                type="url"
                placeholder="https://www.facebook.com/..."
                value={form.fbLink}
                onChange={e => setForm(f => ({ ...f, fbLink: e.target.value }))}
                className="flex-1 bg-[--bg-elevated] border border-[--border-subtle] px-3 py-2 text-[12px] text-[--text-primary] placeholder:text-zinc-600 outline-none focus:border-[--text-muted]"
              />
            </div>
          </div>

          {/* Sort order + active */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">Ưu tiên (số lớn = lên đầu)</p>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="w-20 bg-[--bg-elevated] border border-[--border-subtle] px-2 py-1.5 text-[12px] text-[--text-primary] outline-none focus:border-[--text-muted]"
              />
            </div>
            <div>
              <p className="text-[11px] text-[--text-muted] mb-1.5 uppercase tracking-wider">Hiển thị</p>
              <button
                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border transition-all ${
                  form.active
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted]'
                }`}
              >
                {form.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                {form.active ? 'Hiện' : 'Ẩn'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={save}
              disabled={!isValid || saving}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={13} /> {saving ? 'Đang lưu...' : 'Lưu bài đăng'}
            </button>
            <button onClick={cancelEdit} className="px-4 py-2 text-[--text-muted] text-[12px] hover:text-[--text-primary] transition-colors">
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-8 text-[--text-muted] text-[12px]">Đang tải...</div>
        )}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12 text-[--text-muted] text-[13px]">
            Chưa có bài đăng nào. Nhấn "Thêm bài đăng" để bắt đầu.
          </div>
        )}
        {posts.map((post, i) => (
          <div
            key={post.id}
            className={`bg-[--bg-surface] border p-4 flex items-start gap-4 transition-opacity ${
              post.active ? 'border-[--border-subtle]' : 'border-[--border-subtle] opacity-50'
            }`}
          >
            {/* Thumbnail */}
            <div className="w-16 h-12 shrink-0 bg-[--bg-elevated] border border-[--border-subtle] overflow-hidden flex items-center justify-center">
              {post.image
                ? <img src={post.image} alt="" className="w-full h-full object-cover" />
                : <Facebook size={18} className="text-blue-400/40" />
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[12px] text-[--text-secondary] leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </div>
              <a
                href={post.fbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink size={10} /> {post.fbLink?.length > 60 ? post.fbLink.slice(0, 60) + '…' : post.fbLink}
              </a>
            </div>

            {/* Badges */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-[10px] text-[--text-muted]">#{post.sortOrder ?? i}</span>
              <span className={`text-[10px] px-1.5 py-0.5 border ${
                post.active
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted]'
              }`}>
                {post.active ? 'Hiện' : 'Ẩn'}
              </span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                {post.clickCount ?? 0} click
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggle(post.id)}
                title={post.active ? 'Ẩn bài' : 'Hiện bài'}
                className="w-7 h-7 flex items-center justify-center text-[--text-muted] hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all"
              >
                {post.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              </button>
              <button
                onClick={() => openEdit(post)}
                className="w-7 h-7 flex items-center justify-center text-[--text-muted] hover:text-[--text-primary] border border-transparent hover:border-[--border-subtle] transition-all"
              >
                <Edit3 size={13} />
              </button>
              <button
                onClick={() => remove(post.id)}
                className="w-7 h-7 flex items-center justify-center text-[--text-muted] hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && posts.length > 0 && (
        <p className="text-[11px] text-[--text-muted]">
          {posts.filter(p => p.active).length} hiển thị / {posts.length} tổng · Ưu tiên: số lớn hơn = lên đầu carousel
        </p>
      )}
    </div>
  );
}

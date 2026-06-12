import React, { useEffect, useState } from 'react';
import { GraduationCap, Pencil, Check, X, Users, Tag, RefreshCw } from 'lucide-react';
import { academyService } from '../../../services/academyService';

const fmt = (n) => (n ?? 0).toLocaleString('vi-VN');

const CoursePricingManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ priceVnd: 0, discountPercent: 0 });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    academyService.getAllCoursesAdmin()
      .then(res => setCourses(res.data?.data || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const startEdit = (c) => {
    setEditId(c.id);
    setForm({ priceVnd: c.priceVnd ?? 199000, discountPercent: c.discountPercent ?? 0 });
  };

  const save = async (id) => {
    setSaving(true);
    try {
      await academyService.updateCoursePricing(id, {
        priceVnd: Number(form.priceVnd),
        discountPercent: Number(form.discountPercent),
      });
      setEditId(null);
      load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[--text-primary] flex items-center gap-2">
            <GraduationCap size={18} className="text-amber-500" /> Khóa học — Giá & Giảm giá
          </h2>
          <p className="text-[12px] text-[--text-muted] mt-1">
            Gói Basic trở lên học mọi khóa. Người dùng Free có thể mua lẻ từng khóa theo giá bên dưới.
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[--border-subtle] text-[12px] text-[--text-secondary] hover:border-amber-500/40 transition-colors">
          <RefreshCw size={13} /> Tải lại
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[12px] text-[--text-muted]">Đang tải...</div>
      ) : (
        <div className="space-y-2.5">
          {courses.map(c => {
            const editing = editId === c.id;
            const finalPrice = editing
              ? Math.round(Number(form.priceVnd || 0) * (100 - Number(form.discountPercent || 0)) / 100)
              : (c.finalPriceVnd ?? c.priceVnd ?? 199000);
            return (
              <div key={c.id} className="p-4 rounded-xl bg-[--bg-surface] border border-[--border-subtle] flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[--text-primary] truncate">{c.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-[--text-muted]">
                    <span>{c.totalLessons ?? 0} bài luyện · {c.totalReadings ?? 0} bài đọc · {c.totalQuizQuestions ?? 0} quiz</span>
                    {c.totalEnrollments != null && (
                      <span className="flex items-center gap-1"><Users size={11} /> {c.totalEnrollments} học viên</span>
                    )}
                  </div>
                </div>

                {editing ? (
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div>
                      <label className="block text-[10px] text-[--text-muted] uppercase mb-1">Giá (VNĐ)</label>
                      <input type="number" min="0" step="1000" value={form.priceVnd}
                        onChange={e => setForm(f => ({ ...f, priceVnd: e.target.value }))}
                        className="w-32 px-3 py-2 rounded-lg bg-[--bg-base] border border-[--border-subtle] text-[13px] text-[--text-primary] focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[--text-muted] uppercase mb-1">Giảm (%)</label>
                      <input type="number" min="0" max="100" value={form.discountPercent}
                        onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                        className="w-20 px-3 py-2 rounded-lg bg-[--bg-base] border border-[--border-subtle] text-[13px] text-[--text-primary] focus:border-amber-500 outline-none" />
                    </div>
                    <div className="text-right mr-1">
                      <p className="text-[10px] text-[--text-muted] uppercase mb-1">Giá cuối</p>
                      <p className="text-[14px] font-bold text-amber-500">{fmt(finalPrice)}đ</p>
                    </div>
                    <button onClick={() => save(c.id)} disabled={saving}
                      className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-50">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="w-9 h-9 rounded-lg border border-[--border-subtle] text-[--text-muted] flex items-center justify-center hover:text-[--text-primary] transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {(c.discountPercent ?? 0) > 0 && (
                        <p className="text-[11px] text-[--text-muted] line-through">{fmt(c.priceVnd)}đ</p>
                      )}
                      <p className="text-[15px] font-bold text-amber-500">{fmt(finalPrice)}đ</p>
                    </div>
                    {(c.discountPercent ?? 0) > 0 && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-bold">
                        <Tag size={11} /> -{c.discountPercent}%
                      </span>
                    )}
                    <button onClick={() => startEdit(c)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[--border-subtle] text-[12px] text-[--text-secondary] hover:border-amber-500/40 hover:text-amber-500 transition-colors">
                      <Pencil size={12} /> Chỉnh giá
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {!courses.length && (
            <div className="py-16 text-center text-[12px] text-[--text-muted]">Chưa có khóa học nào.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoursePricingManager;

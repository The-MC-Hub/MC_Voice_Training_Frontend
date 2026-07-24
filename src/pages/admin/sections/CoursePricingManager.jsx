import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Pencil, Check, X, Users, Tag, RefreshCw, Target } from 'lucide-react';
import { academyService } from '../../../services/academyService';
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const fmt = (n) => (n ?? 0).toLocaleString('vi-VN');

const CoursePricingManager = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ priceVnd: 0, discountPercent: 0 });
  const [saving, setSaving] = useState(false);
  const [outcomesEditId, setOutcomesEditId] = useState(null);
  const [outcomesForm, setOutcomesForm] = useState('');
  const [savingOutcomes, setSavingOutcomes] = useState(false);

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

  const startEditOutcomes = (c) => {
    setOutcomesEditId(c.id);
    setOutcomesForm((c.outcomes || []).join('\n'));
  };

  const saveOutcomes = async (id) => {
    setSavingOutcomes(true);
    try {
      const outcomes = outcomesForm.split('\n').map(s => s.trim()).filter(Boolean);
      await academyService.updateCourseOutcomes(id, outcomes);
      setOutcomesEditId(null);
      load();
    } catch (e) { console.error(e); }
    finally { setSavingOutcomes(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[--text-primary] flex items-center gap-2">
            <GraduationCap size={18} className="text-amber-500" /> {t('admin.coursePricingManager.title')}
          </h2>
          <p className="text-[12px] text-[--text-muted] mt-1">
            {t('admin.coursePricingManager.subtitle')}
          </p>
        </div>
        <Button onClick={load}
          className="h-auto flex items-center gap-1.5 px-3 py-2 rounded-md border border-[--border-subtle] text-[12px] text-[--text-secondary] hover:border-amber-500/40 transition-colors">
          <RefreshCw size={13} /> {t('admin.coursePricingManager.reload')}
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[12px] text-[--text-muted]">{t('admin.coursePricingManager.loading')}</div>
      ) : (
        <div className="space-y-2.5">
          {courses.map(c => {
            const editing = editId === c.id;
            const finalPrice = editing
              ? Math.round(Number(form.priceVnd || 0) * (100 - Number(form.discountPercent || 0)) / 100)
              : (c.finalPriceVnd ?? c.priceVnd ?? 199000);
            return (
              <Card key={c.id} className="p-4 rounded-md bg-[--bg-surface] border border-[--border-subtle] flex flex-col lg:flex-row lg:items-center gap-4 shadow-none">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[--text-primary] truncate">{c.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-[--text-muted]">
                    <span>{t('admin.coursePricingManager.statsLine', { lessons: c.totalLessons ?? 0, readings: c.totalReadings ?? 0, quiz: c.totalQuizQuestions ?? 0 })}</span>
                    {c.totalEnrollments != null && (
                      <span className="flex items-center gap-1"><Users size={11} /> {t('admin.coursePricingManager.enrollments', { count: c.totalEnrollments })}</span>
                    )}
                  </div>
                </div>

                {editing ? (
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div>
                      <label className="block text-[10px] text-[--text-muted] uppercase mb-1">{t('admin.coursePricingManager.priceLabel')}</label>
                      <Input type="number" min="0" step="1000" value={form.priceVnd}
                        onChange={e => setForm(f => ({ ...f, priceVnd: e.target.value }))}
                        className="w-32 px-3 py-2 rounded-md bg-[--bg-base] border border-[--border-subtle] text-[13px] text-[--text-primary] focus:border-amber-500 outline-none h-auto focus-visible:ring-0" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[--text-muted] uppercase mb-1">{t('admin.coursePricingManager.discountLabel')}</label>
                      <Input type="number" min="0" max="100" value={form.discountPercent}
                        onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                        className="w-20 px-3 py-2 rounded-md bg-[--bg-base] border border-[--border-subtle] text-[13px] text-[--text-primary] focus:border-amber-500 outline-none h-auto focus-visible:ring-0" />
                    </div>
                    <div className="text-right mr-1">
                      <p className="text-[10px] text-[--text-muted] uppercase mb-1">{t('admin.coursePricingManager.finalPriceLabel')}</p>
                      <p className="text-[14px] font-bold text-amber-500">{fmt(finalPrice)}đ</p>
                    </div>
                    <Button onClick={() => save(c.id)} disabled={saving}
                      className="w-9 h-9 rounded-md bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-50">
                      <Check size={15} />
                    </Button>
                    <Button onClick={() => setEditId(null)}
                      className="w-9 h-9 rounded-md border border-[--border-subtle] text-[--text-muted] flex items-center justify-center hover:text-[--text-primary] transition-colors">
                      <X size={15} />
                    </Button>
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
                    <Button onClick={() => startEdit(c)}
                      className="h-auto flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[--border-subtle] text-[12px] text-[--text-secondary] hover:border-amber-500/40 hover:text-amber-500 transition-colors">
                      <Pencil size={12} /> {t('admin.coursePricingManager.editPrice')}
                    </Button>
                  </div>
                )}

                {outcomesEditId === c.id ? (
                  <div className="w-full lg:w-80 space-y-2">
                    <label className="block text-[10px] text-[--text-muted] uppercase">{t('admin.coursePricingManager.outcomesLabel')}</label>
                    <textarea rows={4} value={outcomesForm} onChange={e => setOutcomesForm(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-[--bg-base] border border-[--border-subtle] text-[12px] text-[--text-primary] focus:border-amber-500 outline-none resize-none" />
                    <div className="flex items-center gap-2">
                      <Button onClick={() => saveOutcomes(c.id)} disabled={savingOutcomes}
                        className="h-auto flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-500 text-white text-[11px] disabled:opacity-50">
                        <Check size={12} /> {t('admin.coursePricingManager.save')}
                      </Button>
                      <Button onClick={() => setOutcomesEditId(null)}
                        className="h-auto flex items-center gap-1 px-3 py-1.5 rounded-md border border-[--border-subtle] text-[--text-muted] text-[11px]">
                        <X size={12} /> {t('admin.coursePricingManager.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => startEditOutcomes(c)}
                    className="h-auto flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[--border-subtle] text-[12px] text-[--text-secondary] hover:border-amber-500/40 hover:text-amber-500 transition-colors">
                    <Target size={12} /> {t('admin.coursePricingManager.outcomesButton', { count: c.outcomes?.length ?? 0 })}
                  </Button>
                )}
              </Card>
            );
          })}
          {!courses.length && (
            <div className="py-16 text-center text-[12px] text-[--text-muted]">{t('admin.coursePricingManager.empty')}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoursePricingManager;

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, BookOpen, Tag, X, Check, Mic, Image as ImageIcon, Edit } from "lucide-react";
import { useApi } from "../../../hooks/useApi";
import { fetchLessons } from "../../../controllers/voiceController";
import api from "../../../services/api";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/animate-ui/components/radix/dialog";

const inputCls = "w-full bg-[#09090b] border border-white/[0.07] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-white/[0.14] placeholder:text-zinc-600";
const inputClsShadcn = `${inputCls} h-auto rounded-none focus-visible:ring-0`;

const LessonManagement = () => {
  const { t } = useTranslation();
  const { data: lessons = [], refetch } = useApi(fetchLessons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", category: "Gala", difficulty: "Medium", description: "" });
  const [thumbnail, setThumbnail] = useState(null);

  const handleOpenAdd = () => {
    setEditingLesson(null);
    setFormData({ title: "", content: "", category: "Gala", difficulty: "Medium", description: "" });
    setThumbnail(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({ title: lesson.title || "", content: lesson.content || "", category: lesson.category || "Gala", difficulty: lesson.difficulty || "Medium", description: lesson.description || "" });
    setThumbnail(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (thumbnail) data.append("thumbnail", thumbnail);
    try {
      if (editingLesson) {
        await api.put(`/voice/admin/lessons/${editingLesson.id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/voice/admin/lessons", data, { headers: { "Content-Type": "multipart/form-data" } });
      }
      refetch();
      setIsModalOpen(false);
      setFormData({ title: "", content: "", category: "Gala", difficulty: "Medium", description: "" });
      setThumbnail(null);
      setEditingLesson(null);
    } catch {
      alert(editingLesson ? t('admin.lessonManagement.updateFailed') : t('admin.lessonManagement.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.lessonManagement.confirmHide'))) return;
    try {
      await api.delete(`/voice/admin/lessons/${id}`);
      refetch();
    } catch {
      alert(t('admin.lessonManagement.hideFailed'));
    }
  };

  const diffColor = (d) => {
    const v = d?.toLowerCase();
    if (v === 'easy')   return 'bg-emerald-100 text-black border-emerald-300';
    if (v === 'medium') return 'bg-amber-100 text-black border-amber-300';
    return 'bg-red-100 text-black border-red-300';
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">{t('admin.lessonManagement.title')}</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">{t('admin.lessonManagement.subtitle')}</p>
        </div>
        <Button onClick={handleOpenAdd}
          className="h-auto flex items-center gap-2 px-3 py-2 bg-[gold] hover:bg-[#e09520] text-black text-[12px] font-semibold transition-colors">
          <Plus size={13} /> {t('admin.lessonManagement.addScript')}
        </Button>
      </div>

      <div className="border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_80px_80px] gap-4 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: "var(--bg-surface)", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
          <span>{t('admin.lessonManagement.colLesson')}</span>
          <span>{t('admin.lessonManagement.colCategory')}</span>
          <span>{t('admin.lessonManagement.colDifficulty')}</span>
          <span className="text-right">{t('admin.lessonManagement.colWordCount')}</span>
          <span className="text-center">{t('admin.lessonManagement.colActions')}</span>
        </div>

        {/* Rows */}
        {(lessons || []).map((lesson, idx) => (
          <div key={lesson.id}
            className="grid grid-cols-[2fr_1fr_1fr_80px_80px] gap-4 px-4 py-3 items-center text-[13px] transition-colors hover:bg-[--bg-elevated]"
            style={{ borderBottom: idx < lessons.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>

            {/* Title + description */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center shrink-0"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <Mic size={13} style={{ color: "var(--text-muted)" }} />
                </div>
                <span className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{lesson.title}</span>
              </div>
              {lesson.description && (
                <p className="text-[11px] mt-0.5 truncate pl-9" style={{ color: "var(--text-muted)" }}>{lesson.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <Tag size={10} />
              <span className="uppercase tracking-wide">{lesson.category}</span>
            </div>

            {/* Difficulty */}
            <div>
              <span className={`px-2 py-0.5 text-[10px] font-semibold border ${diffColor(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
            </div>

            {/* Word count */}
            <div className="text-right text-[12px]" style={{ color: "var(--text-muted)" }}>
              {lesson.content ? lesson.content.split(/\s+/).length : 0}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-1">
              <Button onClick={() => handleOpenEdit(lesson)} title={t('admin.lessonManagement.edit')}
                className="p-1.5 border border-transparent hover:border-white/[0.07] transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                <Edit size={13} />
              </Button>
              <Button onClick={() => handleDelete(lesson.id)} title={t('admin.lessonManagement.delete')}
                className="p-1.5 border border-transparent hover:border-[--border-subtle] hover:text-[--text-primary] transition-colors"
                style={{ color: "var(--text-muted)" }}>
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        ))}

        {lessons?.length === 0 && (
          <div className="py-12 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            {t('admin.lessonManagement.empty')}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
        <DialogContent showCloseButton={false} className="w-full max-w-lg bg-[#111113] border border-white/[0.07] shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
                <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                  <BookOpen size={15} className="text-zinc-500" />
                  {editingLesson ? t('admin.lessonManagement.editScript') : t('admin.lessonManagement.createScript')}
                </h3>
                <Button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={17} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t('admin.lessonManagement.formTitle')}</label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className={inputClsShadcn} placeholder={t('admin.lessonManagement.formTitlePlaceholder')} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t('admin.lessonManagement.formCategory')}</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className={inputCls + " cursor-pointer"}>
                    <option value="Gala">{t('admin.lessonManagement.categoryGala')}</option>
                    <option value="Wedding">{t('admin.lessonManagement.categoryWedding')}</option>
                    <option value="Corporate">{t('admin.lessonManagement.categoryCorporate')}</option>
                    <option value="Launch">{t('admin.lessonManagement.categoryLaunch')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t('admin.lessonManagement.formDescription')}</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className={inputCls + " min-h-[50px]"} placeholder={t('admin.lessonManagement.formDescriptionPlaceholder')} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t('admin.lessonManagement.formContent')}</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  className={inputCls + " min-h-[100px] font-mono"} placeholder={t('admin.lessonManagement.formContentPlaceholder')} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t('admin.lessonManagement.formDifficulty')}</label>
                  <div className="flex gap-1.5">
                    {["Easy", "Medium", "Hard"].map(lv => (
                      <Button key={lv} type="button" onClick={() => setFormData({...formData, difficulty: lv})}
                        hoverScale={1}
                        className={`h-auto flex-1 py-1.5 text-[10px] font-medium border transition-colors ${
                          formData.difficulty === lv
                            ? 'bg-[gold] text-black border-[gold]'
                            : 'bg-[#09090b] border-white/[0.07] text-zinc-500 hover:border-white/[0.14]'
                        }`}>
                        {lv}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t('admin.lessonManagement.formCoverImage')}</label>
                  <label className="w-full h-[34px] bg-[#09090b] border border-white/[0.07] px-3 flex items-center gap-2 text-zinc-500 cursor-pointer hover:border-white/[0.14] transition-colors overflow-hidden">
                    <ImageIcon size={13} />
                    <span className="text-[11px] truncate">{thumbnail ? thumbnail.name : t('admin.lessonManagement.chooseFile')}</span>
                    <input type="file" hidden onChange={e => setThumbnail(e.target.files[0])} accept="image/*" />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                <Button type="button" onClick={() => setIsModalOpen(false)}
                  hoverScale={1}
                  className="h-auto flex-1 py-2 bg-[#09090b] border border-white/[0.07] text-zinc-400 text-[12px] font-medium hover:border-white/[0.14] transition-colors">
                  {t('admin.lessonManagement.cancel')}
                </Button>
                <Button disabled={loading} type="submit"
                  hoverScale={1}
                  className="h-auto flex-1 py-2 bg-[gold] hover:bg-[#e09520] text-black text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Check size={13} />
                  {loading ? t('admin.lessonManagement.saving') : t('admin.lessonManagement.saveLesson')}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonManagement;

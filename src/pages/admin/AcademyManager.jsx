import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, BookOpen, Play, X,
  ChevronDown, ChevronUp, Clock, Search, Check,
  FileText, Globe, User, Tag
} from 'lucide-react';
import { academyService } from '../../services/academyService';
import { fetchLessons } from '../../controllers/voiceController';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/animate-ui/components/radix/dialog";
import { Card } from "@/components/ui/card";

const inputCls = "w-full bg-[#09090b] border border-white/[0.07] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-white/[0.14] placeholder:text-zinc-500";
const inputClsShadcn = `${inputCls} h-auto rounded-none focus-visible:ring-0`;

const AcademyManager = () => {
  const { t } = useTranslation();
  const [milestones, setMilestones] = useState([]);
  const [guides, setGuides] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [milestoneContents, setMilestoneContents] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditingMilestone, setIsEditingMilestone] = useState(false);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedContentDetails, setSelectedContentDetails] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [formData, setFormData] = useState({ title: '', description: '', level: 'Associate', order: 0 });
  const [contentFormData, setContentFormData] = useState({ title: '', type: 'VOICE_PRACTICE', duration: '15m', voiceScriptId: '', readingGuideId: '' });
  const durationPresets = ["5m", "10m", "15m", "30m", "45m", "1h"];

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (milestones.length > 0 && Object.keys(expandedMilestones).length === 0) {
      setExpandedMilestones({ [milestones[0].id]: true });
    }
  }, [milestones]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, gRes, sRes] = await Promise.all([
        academyService.admin.getMilestones(),
        academyService.admin.getGuides(),
        fetchLessons()
      ]);
      const milestoneList = mRes.data || [];
      setGuides(gRes.data || []);
      setScripts(sRes || []);
      const contentsRes = await Promise.all(milestoneList.map(m => academyService.admin.getContents(m.id)));
      const contentsMap = {};
      milestoneList.forEach((m, idx) => { contentsMap[m.id] = contentsRes[idx].data || []; });
      setMilestoneContents(contentsMap);
      setMilestones(milestoneList);
    } catch (error) {
      console.error("Failed to fetch academy data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    try {
      await academyService.admin.createMilestone(formData);
      setIsEditingMilestone(false);
      setFormData({ title: '', description: '', level: 'Associate', order: milestones.length });
      fetchData();
    } catch { alert(t("admin.academyManager.errors.saveMilestone")); }
  };

  const handleDeleteMilestone = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(t("admin.academyManager.confirms.deleteMilestone"))) {
      await academyService.admin.deleteMilestone(id);
      fetchData();
    }
  };

  const toggleExpand = (id) => setExpandedMilestones(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAddContent = (milestoneId) => {
    setSelectedMilestoneId(milestoneId);
    setItemSearchQuery("");
    setContentFormData({
      title: '', type: 'VOICE_PRACTICE', duration: '15m',
      voiceScriptId: scripts[0]?.id || '',
      readingGuideId: guides[0]?.id || ''
    });
    setIsAddingContent(true);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        milestoneId: selectedMilestoneId,
        title: contentFormData.title || (contentFormData.type === 'VOICE_PRACTICE'
          ? scripts.find(s => (s.id || s._id) === contentFormData.voiceScriptId)?.title
          : guides.find(g => (g.id || g._id) === contentFormData.readingGuideId)?.title) || 'Untitled',
        type: contentFormData.type,
        duration: contentFormData.duration,
        voiceScriptId: contentFormData.type === 'VOICE_PRACTICE' ? contentFormData.voiceScriptId : null,
        readingGuideId: contentFormData.type === 'READING_GUIDE' ? contentFormData.readingGuideId : null,
        order: (milestoneContents[selectedMilestoneId]?.length || 0) + 1
      };
      await academyService.admin.createContent(payload);
      setIsAddingContent(false);
      fetchData();
    } catch { alert(t("admin.academyManager.errors.saveContent")); }
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm(t("admin.academyManager.confirms.deleteContent"))) {
      try { await academyService.admin.deleteContent(contentId); fetchData(); }
      catch { alert(t("admin.academyManager.errors.deleteContent")); }
    }
  };

  const handleMoveContent = async (milestoneId, contentId, direction) => {
    const contents = milestoneContents[milestoneId] || [];
    const index = contents.findIndex(c => c.id === contentId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= contents.length) return;
    const currentItem = contents[index];
    const targetItem = contents[targetIndex];
    const currentOrder = currentItem.order || (index + 1);
    const targetOrder = targetItem.order || (targetIndex + 1);
    try {
      await Promise.all([
        academyService.admin.createContent({ ...currentItem, order: targetOrder }),
        academyService.admin.createContent({ ...targetItem, order: currentOrder })
      ]);
      fetchData();
    } catch { alert(t("admin.academyManager.errors.reorder")); }
  };

  const handleViewContentDetails = (content) => {
    let details = null;
    if (content.type === 'VOICE_PRACTICE') {
      const script = scripts.find(s => (s.id || s._id) === content.voiceScriptId);
      if (script) details = { title: content.title || script.title, type: 'VOICE_PRACTICE', category: script.category, content: script.content, tags: script.tags, language: script.language, duration: content.duration };
    } else {
      const guide = guides.find(g => (g.id || g._id) === content.readingGuideId);
      if (guide) details = { title: content.title || guide.title, type: 'READING_GUIDE', category: guide.category, content: guide.content, author: guide.author, duration: content.duration };
    }
    if (details) { setSelectedContentDetails(details); setIsPreviewModalOpen(true); }
    else alert(t("admin.academyManager.errors.detailsNotFound"));
  };

  const filteredScripts = useMemo(() => {
    if (!itemSearchQuery) return scripts;
    return scripts.filter(s => s.title?.toLowerCase().includes(itemSearchQuery.toLowerCase()) || s.category?.toLowerCase().includes(itemSearchQuery.toLowerCase()));
  }, [scripts, itemSearchQuery]);

  const filteredGuides = useMemo(() => {
    if (!itemSearchQuery) return guides;
    return guides.filter(g => g.title?.toLowerCase().includes(itemSearchQuery.toLowerCase()));
  }, [guides, itemSearchQuery]);

  const livePreviewData = useMemo(() => {
    if (contentFormData.type === 'VOICE_PRACTICE') {
      const script = scripts.find(s => (s.id || s._id) === contentFormData.voiceScriptId);
      return script ? { ...script, displayType: 'VOICE_PRACTICE' } : null;
    }
    const guide = guides.find(g => (g.id || g._id) === contentFormData.readingGuideId);
    return guide ? { ...guide, displayType: 'READING_GUIDE' } : null;
  }, [contentFormData.type, contentFormData.voiceScriptId, contentFormData.readingGuideId, scripts, guides]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
      <div className="w-8 h-8 border-2 border-t-[gold] border-white/[0.07] animate-spin" />
      <p className="text-[12px]">{t("admin.academyManager.loading")}</p>
    </div>
  );

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">{t("admin.academyManager.title")}</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">{t("admin.academyManager.subtitle")}</p>
        </div>
        <Button onClick={() => setIsEditingMilestone(true)}
          className="flex items-center gap-2 px-3 py-2 h-auto bg-[gold] hover:bg-[#e09520] text-black text-[12px] font-semibold transition-colors">
          <Plus size={13} /> {t("admin.academyManager.newMilestoneStage")}
        </Button>
      </div>

      <div className="space-y-3">
        {milestones.map((m, index) => {
          const isExpanded = !!expandedMilestones[m.id];
          const contents = milestoneContents[m.id] || [];
          return (
            <Card key={m.id} className={`bg-[#111113] border overflow-hidden transition-colors gap-0 shadow-none py-0 ${isExpanded ? 'border-white/[0.10]' : 'border-white/[0.07]'}`}>
              <div onClick={() => toggleExpand(m.id)}
                className="px-4 py-3.5 flex justify-between items-center cursor-pointer select-none hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 flex items-center justify-center font-semibold text-[11px] border ${isExpanded ? 'bg-[gold]/[0.08] text-[gold] border-[gold]/20' : 'bg-[#09090b] text-zinc-500 border-white/[0.06]'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-[13px]">{m.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                      <span className="text-[gold]">{m.level}</span>
                      <span>·</span>
                      <span>{t("admin.academyManager.itemsCount", { count: contents.length })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={(e) => handleDeleteMilestone(m.id, e)}
                    className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-[--text-primary] border border-transparent hover:border-[--border-subtle] transition-colors">
                    <Trash2 size={12} />
                  </Button>
                  <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[gold]' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{t("admin.academyManager.syllabusItems")}</span>
                    <Button onClick={() => handleAddContent(m.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 h-auto bg-[#09090b] border border-white/[0.07] hover:border-white/[0.14] text-white text-[11px] font-medium transition-colors">
                      <Plus size={10} /> {t("admin.academyManager.assignContent")}
                    </Button>
                  </div>

                  {contents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contents.map((content, idx) => {
                        const isPractice = content.type === 'VOICE_PRACTICE';
                        return (
                          <div key={content.id} onClick={() => handleViewContentDetails(content)}
                            className="flex justify-between items-center p-3 bg-[#09090b] border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 flex items-center justify-center border shrink-0 ${isPractice ? 'bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]' : 'bg-[#09090b] text-zinc-500 border-white/[0.07]'}`}>
                                {isPractice ? <Play size={11} /> : <BookOpen size={11} />}
                              </div>
                              <div>
                                <p className="font-medium text-zinc-200 text-[12px]">{content.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-[8px] font-medium px-1.5 py-0.5 border ${isPractice ? 'bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]' : 'bg-[#09090b] text-zinc-500 border-white/[0.06]'}`}>
                                    {isPractice ? t("admin.academyManager.badges.practice") : t("admin.academyManager.badges.guide")}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                    <Clock size={9} /> {content.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                              {idx > 0 && (
                                <button onClick={() => handleMoveContent(m.id, content.id, 'up')}
                                  className="w-8 h-8 flex items-center justify-center border border-white/[0.06] hover:text-[gold] transition-colors">
                                  <ChevronUp size={11} />
                                </button>
                              )}
                              {idx < contents.length - 1 && (
                                <button onClick={() => handleMoveContent(m.id, content.id, 'down')}
                                  className="w-8 h-8 flex items-center justify-center border border-white/[0.06] hover:text-[gold] transition-colors">
                                  <ChevronDown size={11} />
                                </button>
                              )}
                              <button onClick={() => handleDeleteContent(content.id)}
                                className="w-8 h-8 flex items-center justify-center border border-white/[0.06] hover:text-[--text-primary] hover:border-[--border-subtle] transition-colors">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-white/[0.06]">
                      <p className="text-[11px] text-zinc-500 italic">{t("admin.academyManager.noSyllabusModules")}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Milestone Editor Modal */}
      <Dialog open={isEditingMilestone} onOpenChange={(open) => { if (!open) setIsEditingMilestone(false); }}>
        <DialogContent showCloseButton={false} className="w-full max-w-md bg-[#111113] border border-white/[0.07] shadow-2xl overflow-hidden">
            <form onSubmit={handleSaveMilestone} className="p-6 space-y-4">
              <h3 className="text-[14px] font-semibold text-white border-b border-white/[0.06] pb-4">{t("admin.academyManager.modal.newStageMilestone")}</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t("admin.academyManager.modal.milestoneTitle")}</label>
                <Input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className={inputClsShadcn} placeholder={t("admin.academyManager.modal.milestoneTitlePlaceholder")} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t("admin.academyManager.modal.skillLevel")}</label>
                <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})
                } className={inputCls + " cursor-pointer"}>
                  <option value="Associate">{t("admin.academyManager.modal.levelAssociate")}</option>
                  <option value="Professional">{t("admin.academyManager.modal.levelProfessional")}</option>
                  <option value="Elite">{t("admin.academyManager.modal.levelElite")}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t("admin.academyManager.modal.description")}</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className={inputCls} placeholder={t("admin.academyManager.modal.descriptionPlaceholder")} />
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                <Button type="button" onClick={() => setIsEditingMilestone(false)} hoverScale={1}
                  className="flex-1 py-2 h-auto bg-[#09090b] border border-white/[0.07] text-zinc-400 text-[12px] font-medium hover:border-white/[0.14] transition-colors">
                  {t("admin.academyManager.modal.cancel")}
                </Button>
                <Button type="submit" hoverScale={1}
                  className="flex-1 py-2 h-auto bg-[gold] hover:bg-[#e09520] text-black text-[12px] font-semibold transition-colors">
                  {t("admin.academyManager.modal.saveMilestone")}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      {/* Add Content Modal */}
      <Dialog open={isAddingContent} onOpenChange={(open) => { if (!open) setIsAddingContent(false); }}>
        <DialogContent showCloseButton={false} className="w-full max-w-4xl bg-[#111113] border border-white/[0.07] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-white/[0.06]">
              <div>
                <h3 className="text-[14px] font-semibold text-white">{t("admin.academyManager.modal.assignCurriculumContent")}</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">{t("admin.academyManager.modal.assignCurriculumContentSubtitle")}</p>
              </div>
              <Button onClick={() => setIsAddingContent(false)} className="text-zinc-500 hover:text-white transition-colors h-auto p-0 bg-transparent"><X size={17} /></Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
              <form onSubmit={handleSaveContent} className="lg:col-span-7 p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t("admin.academyManager.modal.contentType")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'VOICE_PRACTICE', icon: Play, label: t("admin.academyManager.modal.voiceScript"), desc: t("admin.academyManager.modal.voiceScriptDesc") },
                      { type: 'READING_GUIDE', icon: BookOpen, label: t("admin.academyManager.modal.readingGuide"), desc: t("admin.academyManager.modal.readingGuideDesc") },
                    ].map(({ type: ct, icon: Icon, label, desc }) => (
                      <div key={ct} onClick={() => setContentFormData({
                          ...contentFormData, type: ct,
                          voiceScriptId: ct === 'VOICE_PRACTICE' ? (scripts[0]?.id || '') : '',
                          readingGuideId: ct === 'READING_GUIDE' ? (guides[0]?.id || '') : ''
                        })}
                        className={`p-3 border cursor-pointer transition-colors ${contentFormData.type === ct ? 'bg-[gold]/[0.08] border-[gold]/20 text-white' : 'bg-[#09090b] border-white/[0.07] text-zinc-500 hover:border-white/[0.14]'}`}>
                        <Icon size={13} className="mb-1.5" />
                        <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search + select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    {contentFormData.type === 'VOICE_PRACTICE' ? t("admin.academyManager.modal.selectTrainingScript") : t("admin.academyManager.modal.selectTheoryDocument")}
                  </label>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <Input type="text" value={itemSearchQuery} onChange={e => setItemSearchQuery(e.target.value)}
                      placeholder={t("admin.academyManager.modal.filterTitles")} className={inputClsShadcn + " pl-9"} />
                  </div>
                  {contentFormData.type === 'VOICE_PRACTICE' ? (
                    <select value={contentFormData.voiceScriptId} onChange={e => setContentFormData({...contentFormData, voiceScriptId: e.target.value})}
                      className={inputCls + " cursor-pointer"}>
                      {filteredScripts.map(s => <option key={s.id} value={s.id}>[{s.category}] {s.title}</option>)}
                    </select>
                  ) : (
                    <select value={contentFormData.readingGuideId} onChange={e => setContentFormData({...contentFormData, readingGuideId: e.target.value})}
                      className={inputCls + " cursor-pointer"}>
                      {filteredGuides.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t("admin.academyManager.modal.displayOverrideTitle")}</label>
                  <Input type="text" value={contentFormData.title} onChange={e => setContentFormData({...contentFormData, title: e.target.value})}
                    className={inputClsShadcn} placeholder={t("admin.academyManager.modal.displayOverrideTitlePlaceholder")} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{t("admin.academyManager.modal.estimatedDuration")}</label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Input type="text" required value={contentFormData.duration} onChange={e => setContentFormData({...contentFormData, duration: e.target.value})}
                      placeholder="15m" className={inputClsShadcn + " w-20 text-center"} />
                    {durationPresets.map(preset => (
                      <Button key={preset} type="button" onClick={() => setContentFormData({...contentFormData, duration: preset})}
                        className={`px-2 py-1 h-auto text-[10px] border transition-colors ${contentFormData.duration === preset ? 'bg-[gold]/[0.08] text-[gold] border-[gold]/20' : 'bg-[#09090b] border-white/[0.07] text-zinc-500 hover:border-white/[0.14]'}`}>
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                  <Button type="button" onClick={() => setIsAddingContent(false)} hoverScale={1}
                    className="flex-1 py-2 h-auto bg-[#09090b] border border-white/[0.07] text-zinc-400 text-[12px] font-medium hover:border-white/[0.14] transition-colors">
                    {t("admin.academyManager.modal.cancel")}
                  </Button>
                  <Button type="submit" hoverScale={1}
                    className="flex-1 py-2 h-auto bg-[gold] hover:bg-[#e09520] text-black text-[12px] font-semibold transition-colors">
                    {t("admin.academyManager.modal.assignContent")}
                  </Button>
                </div>
              </form>

              {/* Live preview */}
              <div className="lg:col-span-5 p-5 bg-[#09090b]/60 max-h-[500px] overflow-y-auto">
                <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-4">{t("admin.academyManager.modal.resourceOverview")}</h4>
                {livePreviewData ? (
                  <div className="space-y-4">
                    <div>
                      <span className={`text-[9px] font-medium px-2 py-0.5 border ${livePreviewData.displayType === 'VOICE_PRACTICE' ? 'bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]' : 'bg-[#09090b] text-zinc-500 border-white/[0.06]'}`}>
                        {livePreviewData.displayType === 'VOICE_PRACTICE' ? t("admin.academyManager.badges.voiceScriptUpper") : t("admin.academyManager.badges.theoryGuideUpper")}
                      </span>
                      <h4 className="text-[13px] font-semibold text-white mt-2 leading-snug">{livePreviewData.title}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-b border-white/[0.06] py-3 text-[12px]">
                      <div>
                        <p className="text-[9px] text-zinc-500 uppercase mb-0.5">{t("admin.academyManager.modal.category")}</p>
                        <p className="text-zinc-300 font-medium">{livePreviewData.category || t("admin.academyManager.modal.general")}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-500 uppercase mb-0.5">
                          {livePreviewData.displayType === 'VOICE_PRACTICE' ? t("admin.academyManager.modal.language") : t("admin.academyManager.modal.author")}
                        </p>
                        <p className="text-zinc-300 font-medium">
                          {livePreviewData.displayType === 'VOICE_PRACTICE' ? (livePreviewData.language?.toUpperCase() || t("admin.academyManager.modal.defaultLanguage")) : (livePreviewData.author || t("admin.academyManager.modal.defaultAuthor"))}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase flex items-center gap-1 mb-1.5"><FileText size={9} /> {t("admin.academyManager.modal.scriptContent")}</label>
                      <div className="bg-[#111113] border border-white/[0.06] p-3 text-[11px] text-zinc-400 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {livePreviewData.content || t("admin.academyManager.modal.emptyContent")}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-[11px] text-zinc-500 italic">{t("admin.academyManager.modal.chooseScriptOrGuide")}</p>
                  </div>
                )}
              </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen && !!selectedContentDetails} onOpenChange={(open) => { if (!open) setIsPreviewModalOpen(false); }}>
        {selectedContentDetails && (
          <DialogContent showCloseButton={false} className="w-full max-w-xl bg-[#111113] border border-white/[0.07] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center border ${selectedContentDetails.type === 'VOICE_PRACTICE' ? 'bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]' : 'bg-[#09090b] text-zinc-500 border-white/[0.07]'}`}>
                  {selectedContentDetails.type === 'VOICE_PRACTICE' ? <Play size={13} /> : <BookOpen size={13} />}
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">
                    {selectedContentDetails.type === 'VOICE_PRACTICE' ? t("admin.academyManager.modal.voiceScript") : t("admin.academyManager.modal.studyGuide")}
                  </span>
                  <h3 className="font-semibold text-white text-[14px]">{selectedContentDetails.title}</h3>
                </div>
              </div>
              <Button onClick={() => setIsPreviewModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors h-auto p-0 bg-transparent"><X size={17} /></Button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#09090b] border border-white/[0.06] p-3 text-[12px]">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase flex items-center gap-1"><Tag size={9} /> {t("admin.academyManager.modal.category")}</span>
                  <p className="text-zinc-300 font-medium mt-0.5">{selectedContentDetails.category || t("admin.academyManager.modal.general")}</p>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase flex items-center gap-1"><Clock size={9} /> {t("admin.academyManager.modal.duration")}</span>
                  <p className="text-zinc-300 font-medium mt-0.5">{selectedContentDetails.duration || t("admin.academyManager.modal.durationNA")}</p>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase flex items-center gap-1">
                    {selectedContentDetails.type === 'VOICE_PRACTICE' ? <Globe size={9} /> : <User size={9} />}
                    {selectedContentDetails.type === 'VOICE_PRACTICE' ? t("admin.academyManager.modal.language") : t("admin.academyManager.modal.author")}
                  </span>
                  <p className="text-zinc-300 font-medium mt-0.5">
                    {selectedContentDetails.type === 'VOICE_PRACTICE' ? (selectedContentDetails.language?.toUpperCase() || t("admin.academyManager.modal.defaultLanguage")) : (selectedContentDetails.author || t("admin.academyManager.modal.defaultAuthor"))}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 uppercase flex items-center gap-1 mb-1.5"><FileText size={9} /> {t("admin.academyManager.modal.practiceText")}</label>
                <div className="bg-[#09090b] border border-white/[0.06] p-4 max-h-56 overflow-y-auto text-[12px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedContentDetails.content || t("admin.academyManager.modal.noPracticeText")}
                </div>
              </div>

              <Button onClick={() => setIsPreviewModalOpen(false)} hoverScale={1}
                className="w-full py-2.5 h-auto bg-[#09090b] border border-white/[0.07] hover:border-white/[0.14] text-zinc-300 text-[12px] font-medium transition-colors">
                {t("admin.academyManager.modal.closePreview")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AcademyManager;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, BookOpen, Play, X,
  ChevronDown, ChevronUp, Clock, Search, Check,
  FileText, Globe, User, Tag
} from 'lucide-react';
import { academyService } from '../../services/academyService';
import { fetchLessons } from '../../controllers/voiceController';

const inputCls = "w-full bg-[#09090b] border border-white/[0.07] rounded-xl px-3 py-2 text-[12px] text-white focus:outline-none focus:border-white/[0.14] placeholder:text-zinc-600";

const AcademyManager = () => {
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
    } catch { alert("Error saving milestone"); }
  };

  const handleDeleteMilestone = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure? All contents will be disconnected.")) {
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
    } catch { alert("Error saving content to milestone"); }
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm("Remove this content?")) {
      try { await academyService.admin.deleteContent(contentId); fetchData(); }
      catch { alert("Error deleting content"); }
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
    } catch { alert("Error re-ordering items."); }
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
    else alert("Source script or guide details could not be found.");
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
      <div className="w-8 h-8 border-2 border-t-[#f5a623] border-white/[0.07] rounded-full animate-spin" />
      <p className="text-[12px]">Loading Academy Curriculum...</p>
    </div>
  );

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Academy Curriculum Roadmap</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">Curate academic learning stages, assign content blocks, and arrange training pathways.</p>
        </div>
        <button onClick={() => setIsEditingMilestone(true)}
          className="flex items-center gap-2 px-3 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[12px] font-semibold transition-colors">
          <Plus size={13} /> New Milestone Stage
        </button>
      </div>

      <div className="space-y-3">
        {milestones.map((m, index) => {
          const isExpanded = !!expandedMilestones[m.id];
          const contents = milestoneContents[m.id] || [];
          return (
            <div key={m.id} className={`bg-[#111113] rounded-xl border overflow-hidden transition-colors ${isExpanded ? 'border-white/[0.10]' : 'border-white/[0.07]'}`}>
              <div onClick={() => toggleExpand(m.id)}
                className="px-4 py-3.5 flex justify-between items-center cursor-pointer select-none hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-[11px] border ${isExpanded ? 'bg-[#f5a623]/[0.08] text-[#f5a623] border-[#f5a623]/20' : 'bg-[#09090b] text-zinc-500 border-white/[0.06]'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-[13px]">{m.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                      <span className="text-[#f5a623]">{m.level}</span>
                      <span>·</span>
                      <span>{contents.length} items</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleDeleteMilestone(m.id, e)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 border border-transparent hover:border-red-900/40 transition-colors">
                    <Trash2 size={12} />
                  </button>
                  <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#f5a623]' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Syllabus Items</span>
                    <button onClick={() => handleAddContent(m.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#09090b] border border-white/[0.07] hover:border-white/[0.14] text-white rounded-lg text-[11px] font-medium transition-colors">
                      <Plus size={10} /> Assign Content
                    </button>
                  </div>

                  {contents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contents.map((content, idx) => {
                        const isPractice = content.type === 'VOICE_PRACTICE';
                        return (
                          <div key={content.id} onClick={() => handleViewContentDetails(content)}
                            className="flex justify-between items-center p-3 rounded-xl bg-[#09090b] border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${isPractice ? 'bg-blue-950/40 text-blue-400 border-blue-900/40' : 'bg-[#09090b] text-zinc-500 border-white/[0.07]'}`}>
                                {isPractice ? <Play size={11} /> : <BookOpen size={11} />}
                              </div>
                              <div>
                                <p className="font-medium text-zinc-200 text-[12px]">{content.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded border ${isPractice ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' : 'bg-[#09090b] text-zinc-500 border-white/[0.06]'}`}>
                                    {isPractice ? 'PRACTICE' : 'GUIDE'}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                    <Clock size={9} /> {content.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                              {idx > 0 && (
                                <button onClick={() => handleMoveContent(m.id, content.id, 'up')}
                                  className="p-1 rounded-lg border border-white/[0.06] hover:text-[#f5a623] transition-colors">
                                  <ChevronUp size={11} />
                                </button>
                              )}
                              {idx < contents.length - 1 && (
                                <button onClick={() => handleMoveContent(m.id, content.id, 'down')}
                                  className="p-1 rounded-lg border border-white/[0.06] hover:text-[#f5a623] transition-colors">
                                  <ChevronDown size={11} />
                                </button>
                              )}
                              <button onClick={() => handleDeleteContent(content.id)}
                                className="p-1 rounded-lg border border-white/[0.06] hover:text-red-400 hover:border-red-900/40 transition-colors">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-white/[0.06] rounded-xl">
                      <p className="text-[11px] text-zinc-600 italic">No syllabus modules assigned yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestone Editor Modal */}
      {isEditingMilestone && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-[#111113] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSaveMilestone} className="p-6 space-y-4">
              <h3 className="text-[14px] font-semibold text-white border-b border-white/[0.06] pb-4">New Stage Milestone</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Milestone Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className={inputCls} placeholder="e.g. Basic Modulation Skills..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Skill Level</label>
                <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})
                } className={inputCls + " cursor-pointer"}>
                  <option value="Associate">Associate</option>
                  <option value="Professional">Professional</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className={inputCls} placeholder="Summarize stage syllabus benchmarks..." />
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                <button type="button" onClick={() => setIsEditingMilestone(false)}
                  className="flex-1 py-2 bg-[#09090b] border border-white/[0.07] text-zinc-400 rounded-xl text-[12px] font-medium hover:border-white/[0.14] transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[12px] font-semibold transition-colors">
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {isAddingContent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-4xl bg-[#111113] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-white/[0.06]">
              <div>
                <h3 className="text-[14px] font-semibold text-white">Assign Curriculum Content</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Bind practice lessons or guidelines to academic milestones.</p>
              </div>
              <button onClick={() => setIsAddingContent(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={17} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
              <form onSubmit={handleSaveContent} className="lg:col-span-7 p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Content Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'VOICE_PRACTICE', icon: Play, label: 'Voice Script', desc: 'Interactive training templates' },
                      { type: 'READING_GUIDE', icon: BookOpen, label: 'Reading Guide', desc: 'Theoretical documents' },
                    ].map(({ type: t, icon: Icon, label, desc }) => (
                      <div key={t} onClick={() => setContentFormData({
                          ...contentFormData, type: t,
                          voiceScriptId: t === 'VOICE_PRACTICE' ? (scripts[0]?.id || '') : '',
                          readingGuideId: t === 'READING_GUIDE' ? (guides[0]?.id || '') : ''
                        })}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors ${contentFormData.type === t ? 'bg-[#f5a623]/[0.08] border-[#f5a623]/20 text-white' : 'bg-[#09090b] border-white/[0.07] text-zinc-500 hover:border-white/[0.14]'}`}>
                        <Icon size={13} className="mb-1.5" />
                        <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search + select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    {contentFormData.type === 'VOICE_PRACTICE' ? 'Select Training Script' : 'Select Theory Document'}
                  </label>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <input type="text" value={itemSearchQuery} onChange={e => setItemSearchQuery(e.target.value)}
                      placeholder="Filter titles..." className={inputCls + " pl-9"} />
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
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Display Override Title (optional)</label>
                  <input type="text" value={contentFormData.title} onChange={e => setContentFormData({...contentFormData, title: e.target.value})}
                    className={inputCls} placeholder="Defaults to resource title" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Estimated Duration</label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <input type="text" required value={contentFormData.duration} onChange={e => setContentFormData({...contentFormData, duration: e.target.value})}
                      placeholder="15m" className={inputCls + " w-20 text-center"} />
                    {durationPresets.map(preset => (
                      <button key={preset} type="button" onClick={() => setContentFormData({...contentFormData, duration: preset})}
                        className={`px-2 py-1 text-[10px] rounded-lg border transition-colors ${contentFormData.duration === preset ? 'bg-[#f5a623]/[0.08] text-[#f5a623] border-[#f5a623]/20' : 'bg-[#09090b] border-white/[0.07] text-zinc-500 hover:border-white/[0.14]'}`}>
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                  <button type="button" onClick={() => setIsAddingContent(false)}
                    className="flex-1 py-2 bg-[#09090b] border border-white/[0.07] text-zinc-400 rounded-xl text-[12px] font-medium hover:border-white/[0.14] transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[12px] font-semibold transition-colors">
                    Assign Content
                  </button>
                </div>
              </form>

              {/* Live preview */}
              <div className="lg:col-span-5 p-5 bg-[#09090b]/60 max-h-[500px] overflow-y-auto">
                <h4 className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider mb-4">Resource Overview</h4>
                {livePreviewData ? (
                  <div className="space-y-4">
                    <div>
                      <span className={`text-[9px] font-medium px-2 py-0.5 rounded-md border ${livePreviewData.displayType === 'VOICE_PRACTICE' ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' : 'bg-[#09090b] text-zinc-500 border-white/[0.06]'}`}>
                        {livePreviewData.displayType === 'VOICE_PRACTICE' ? 'VOICE SCRIPT' : 'THEORY GUIDE'}
                      </span>
                      <h4 className="text-[13px] font-semibold text-white mt-2 leading-snug">{livePreviewData.title}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-b border-white/[0.06] py-3 text-[12px]">
                      <div>
                        <p className="text-[9px] text-zinc-600 uppercase mb-0.5">Category</p>
                        <p className="text-zinc-300 font-medium">{livePreviewData.category || "General"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-600 uppercase mb-0.5">
                          {livePreviewData.displayType === 'VOICE_PRACTICE' ? 'Language' : 'Author'}
                        </p>
                        <p className="text-zinc-300 font-medium">
                          {livePreviewData.displayType === 'VOICE_PRACTICE' ? (livePreviewData.language?.toUpperCase() || "VI") : (livePreviewData.author || "System Academy")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-600 uppercase flex items-center gap-1 mb-1.5"><FileText size={9} /> Script content</label>
                      <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-3 text-[11px] text-zinc-400 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {livePreviewData.content || "Empty content."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-[11px] text-zinc-600 italic">Choose a training script or guideline to inspect details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && selectedContentDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-xl bg-[#111113] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${selectedContentDetails.type === 'VOICE_PRACTICE' ? 'bg-blue-950/40 text-blue-400 border-blue-900/40' : 'bg-[#09090b] text-zinc-500 border-white/[0.07]'}`}>
                  {selectedContentDetails.type === 'VOICE_PRACTICE' ? <Play size={13} /> : <BookOpen size={13} />}
                </div>
                <div>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-wider block">
                    {selectedContentDetails.type === 'VOICE_PRACTICE' ? 'Voice Script' : 'Study Guide'}
                  </span>
                  <h3 className="font-semibold text-white text-[14px]">{selectedContentDetails.title}</h3>
                </div>
              </div>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={17} /></button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 bg-[#09090b] border border-white/[0.06] rounded-xl p-3 text-[12px]">
                <div>
                  <span className="text-[9px] text-zinc-600 uppercase flex items-center gap-1"><Tag size={9} /> Category</span>
                  <p className="text-zinc-300 font-medium mt-0.5">{selectedContentDetails.category || "General"}</p>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-600 uppercase flex items-center gap-1"><Clock size={9} /> Duration</span>
                  <p className="text-zinc-300 font-medium mt-0.5">{selectedContentDetails.duration || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-600 uppercase flex items-center gap-1">
                    {selectedContentDetails.type === 'VOICE_PRACTICE' ? <Globe size={9} /> : <User size={9} />}
                    {selectedContentDetails.type === 'VOICE_PRACTICE' ? 'Language' : 'Author'}
                  </span>
                  <p className="text-zinc-300 font-medium mt-0.5">
                    {selectedContentDetails.type === 'VOICE_PRACTICE' ? (selectedContentDetails.language?.toUpperCase() || "VI") : (selectedContentDetails.author || "System Academy")}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-zinc-600 uppercase flex items-center gap-1 mb-1.5"><FileText size={9} /> Practice text</label>
                <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-4 max-h-56 overflow-y-auto text-[12px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedContentDetails.content || "No practice text configured."}
                </div>
              </div>

              <button onClick={() => setIsPreviewModalOpen(false)}
                className="w-full py-2.5 bg-[#09090b] border border-white/[0.07] hover:border-white/[0.14] text-zinc-300 rounded-xl text-[12px] font-medium transition-colors">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademyManager;

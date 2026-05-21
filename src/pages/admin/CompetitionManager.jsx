import React, { useState, useEffect } from "react";
import { Trophy, Plus, Edit2, Trash2, Calendar, ToggleLeft, ToggleRight, X, Check, BookOpen } from "lucide-react";
import { fetchAdminCompetitions, addCompetition, updateCompetition, deleteCompetition } from "../../controllers/communityController";
import { fetchLessons } from "../../controllers/voiceController";

const inputCls = "w-full bg-[#09090b] border border-white/[0.07] rounded-xl px-3 py-2 text-[12px] text-white focus:outline-none focus:border-white/[0.14] placeholder:text-zinc-600";

const CompetitionManager = () => {
  const [competitions, setCompetitions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("WEEKLY");
  const [challengeScriptId, setChallengeScriptId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [compsData, lessonsData] = await Promise.all([fetchAdminCompetitions(), fetchLessons()]);
      setCompetitions(compsData);
      setLessons(lessonsData);
      if (lessonsData.length > 0 && !challengeScriptId) setChallengeScriptId(lessonsData[0].id);
    } catch (err) {
      console.error("Failed to load admin competition data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenCreate = () => {
    setEditingComp(null);
    setTitle(""); setDescription(""); setType("WEEKLY");
    if (lessons.length > 0) setChallengeScriptId(lessons[0].id);
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setStartDate(today); setEndDate(nextWeek); setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingComp(comp);
    setTitle(comp.title || ""); setDescription(comp.description || "");
    setType(comp.type || "WEEKLY"); setChallengeScriptId(comp.challengeScriptId || "");
    setStartDate(comp.startDate ? new Date(comp.startDate).toISOString().split("T")[0] : "");
    setEndDate(comp.endDate ? new Date(comp.endDate).toISOString().split("T")[0] : "");
    setActive(comp.active !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { title, description, type, challengeScriptId, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString(), active };
    try {
      if (editingComp) await updateCompetition(editingComp.id, payload);
      else await addCompetition(payload);
      setIsModalOpen(false);
      loadData();
    } catch { alert("Failed to save competition"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Arena?")) return;
    try { await deleteCompetition(id); loadData(); }
    catch { alert("Failed to delete competition"); }
  };

  const getLessonTitle = (scriptId) => lessons.find(l => l.id === scriptId)?.title || "Unknown Script";

  if (loading) return <div className="text-center py-16 text-zinc-500 text-[12px]">Loading Arenas...</div>;

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Voice Duel Challenge Arenas</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">Configure daily or weekly speech battle competitions and script references.</p>
        </div>
        <button onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[12px] font-semibold transition-colors">
          <Plus size={13} /> New Contest Arena
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {competitions.length > 0 ? (
          competitions.map((comp) => (
            <div key={comp.id} className="bg-[#111113] border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${comp.active ? "text-emerald-400 border-emerald-900/40 bg-emerald-950/20" : "text-zinc-500 border-white/[0.07] bg-[#09090b]"}`}>
                    {comp.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono bg-[#09090b] border border-white/[0.06] px-2 py-0.5 rounded-lg">{comp.type}</span>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-white truncate mb-1">{comp.title}</h3>
                  <p className="text-[12px] text-zinc-500 line-clamp-3 leading-relaxed">{comp.description}</p>
                </div>
                <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-3">
                  <span className="text-[9px] text-zinc-600 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <BookOpen size={9} /> Script Reference
                  </span>
                  <span className="text-[12px] text-zinc-300 font-medium block truncate">{getLessonTitle(comp.challengeScriptId)}</span>
                </div>
              </div>
              <div className="border-t border-white/[0.06] pt-3 mt-4 flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Calendar size={10} /> {new Date(comp.endDate).toLocaleDateString("vi-VN")}
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleOpenEdit(comp)} title="Edit"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white border border-white/[0.06] hover:border-white/[0.14] transition-colors">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(comp.id)} title="Delete"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 border border-white/[0.06] hover:border-red-900/40 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-14 bg-[#111113] border border-white/[0.07] rounded-xl">
            <Trophy size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-[12px]">No Arenas Registered. Click "New Contest Arena" to start.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg bg-[#111113] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors">
              <X size={17} />
            </button>
            <form onSubmit={handleSave} className="p-6 space-y-4 relative">
              <h3 className="text-[14px] font-semibold text-white border-b border-white/[0.06] pb-4">
                {editingComp ? "Edit Contest Arena" : "Create Contest Arena"}
              </h3>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Arena Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  className={inputCls} placeholder="Weekly Wedding Voice Duel..." />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)}
                  rows={3} className={inputCls} placeholder="Contest scenario objectives, rewards..." />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Challenge Script</label>
                <select value={challengeScriptId} onChange={e => setChallengeScriptId(e.target.value)} required className={inputCls + " cursor-pointer"}>
                  {lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>[{lesson.category}] {lesson.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Contest Interval</label>
                  <select value={type} onChange={e => setType(e.target.value)} className={inputCls + " cursor-pointer"}>
                    <option value="DAILY">Daily Contest</option>
                    <option value="WEEKLY">Weekly Contest</option>
                  </select>
                </div>
                <div className="flex items-end justify-between pb-0.5">
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Active</span>
                  <button type="button" onClick={() => setActive(!active)}
                    className={`transition-colors ${active ? "text-[#f5a623]" : "text-zinc-600"}`}>
                    {active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Start Date</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">End Date</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-[#09090b] border border-white/[0.07] text-zinc-400 rounded-xl text-[12px] font-medium hover:border-white/[0.14] transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Check size={13} /> Save Arena
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionManager;

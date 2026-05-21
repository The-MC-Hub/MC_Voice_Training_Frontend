import React, { useState } from "react";
import { Plus, Trash2, BookOpen, Tag, X, Check, Mic, Image as ImageIcon, Edit } from "lucide-react";
import { useApi } from "../../../hooks/useApi";
import { fetchLessons } from "../../../controllers/voiceController";
import api from "../../../services/api";

const inputCls = "w-full bg-[#09090b] border border-white/[0.07] rounded-xl px-3 py-2 text-[12px] text-white focus:outline-none focus:border-white/[0.14] placeholder:text-zinc-600";

const LessonManagement = () => {
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
      alert(editingLesson ? "Failed to update lesson" : "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/voice/admin/lessons/${id}`);
      refetch();
    } catch {
      alert("Delete failed");
    }
  };

  const diffColor = (d) => {
    const v = d?.toLowerCase();
    if (v === 'easy')   return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
    if (v === 'medium') return 'bg-amber-950/40 text-amber-400 border-amber-900/40';
    return 'bg-red-950/40 text-red-400 border-red-900/40';
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">Lesson Catalog</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">Manage scripts, guidelines, difficulties, and practice assets for MC training.</p>
        </div>
        <button onClick={handleOpenAdd}
          className="flex items-center gap-2 px-3 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[12px] font-semibold transition-colors">
          <Plus size={13} /> Add Practice Script
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(lessons || []).map((lesson) => (
          <div key={lesson.id} className="bg-[#111113] border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#09090b] border border-white/[0.06] text-zinc-500 flex items-center justify-center">
                  <Mic size={16} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(lesson)} title="Edit"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white border border-transparent hover:border-white/[0.07] transition-colors">
                    <Edit size={13} />
                  </button>
                  <button onClick={() => handleDelete(lesson.id)} title="Delete"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-900/40 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-white text-[14px] leading-snug mb-2">{lesson.title}</h3>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase mb-3">
                <Tag size={9} /> {lesson.category}
                <span className="text-zinc-700">•</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium border ${diffColor(lesson.difficulty)}`}>{lesson.difficulty}</span>
              </div>
              <p className="text-[12px] text-zinc-500 line-clamp-3 leading-relaxed">{lesson.description}</p>
            </div>
            <div className="pt-3 border-t border-white/[0.06] mt-4 flex justify-between items-center text-[10px] text-zinc-600">
              <span>{lesson.content ? lesson.content.split(/\s+/).length : 0} words</span>
              <button onClick={() => handleOpenEdit(lesson)} className="text-[#f5a623] hover:text-[#e09520] font-medium transition-colors">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg bg-[#111113] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
                <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                  <BookOpen size={15} className="text-zinc-500" />
                  {editingLesson ? "Edit Practice Script" : "Create Practice Script"}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={17} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className={inputCls} placeholder="Wedding opening script..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className={inputCls + " cursor-pointer"}>
                    <option value="Gala">Gala Dinner</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Launch">Product Launch</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Short Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className={inputCls + " min-h-[50px]"} placeholder="Overview of the script scenario..." />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Practice Content Script</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  className={inputCls + " min-h-[100px] font-mono"} placeholder="Paste practice lines here..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Difficulty</label>
                  <div className="flex gap-1.5">
                    {["Easy", "Medium", "Hard"].map(lv => (
                      <button key={lv} type="button" onClick={() => setFormData({...formData, difficulty: lv})}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${
                          formData.difficulty === lv
                            ? 'bg-[#f5a623] text-black border-[#f5a623]'
                            : 'bg-[#09090b] border-white/[0.07] text-zinc-500 hover:border-white/[0.14]'
                        }`}>
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Cover Image</label>
                  <label className="w-full h-[34px] bg-[#09090b] border border-white/[0.07] rounded-xl px-3 flex items-center gap-2 text-zinc-500 cursor-pointer hover:border-white/[0.14] transition-colors overflow-hidden">
                    <ImageIcon size={13} />
                    <span className="text-[11px] truncate">{thumbnail ? thumbnail.name : "Choose File"}</span>
                    <input type="file" hidden onChange={e => setThumbnail(e.target.files[0])} accept="image/*" />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-[#09090b] border border-white/[0.07] text-zinc-400 rounded-xl text-[12px] font-medium hover:border-white/[0.14] transition-colors">
                  Cancel
                </button>
                <button disabled={loading} type="submit"
                  className="flex-1 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Check size={13} />
                  {loading ? "Saving..." : "Save Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonManagement;

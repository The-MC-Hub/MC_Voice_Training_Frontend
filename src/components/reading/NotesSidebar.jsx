import React, { useState } from 'react';
import { X, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { academyService } from '../../services/academyService';
import { Sheet, SheetContent } from '@/components/animate-ui/components/radix/sheet';

const NotesSidebar = ({ isOpen, onClose, highlights, onHighlightDeleted, onHighlightUpdated }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState("");

  const handleDelete = async (id) => {
    try {
      await academyService.deleteHighlight(id);
      onHighlightDeleted(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateNote = async (id) => {
    try {
      await academyService.updateHighlight(id, { noteContent: editNote });
      onHighlightUpdated(id, { noteContent: editNote });
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="h-full w-[360px] bg-[#09090b] border-l border-white/[0.08] shadow-2xl gap-0 p-0"
      >
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-white">
                <MessageSquare size={16} className="text-[#f5a623]" />
                <h3 className="font-semibold text-[15px]">{t('notesSidebar.title')}</h3>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {highlights.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-white/[0.04] mx-auto flex items-center justify-center mb-3">
                    <MessageSquare size={20} className="text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 text-[13px]">{t('notesSidebar.empty')}</p>
                  <p className="text-zinc-600 text-[11px] mt-1">{t('notesSidebar.emptyHint')}</p>
                </div>
              ) : (
                highlights.map((hl) => (
                  <div key={hl.id} className="bg-[#111113] border border-white/[0.06] rounded-md p-4 space-y-3 relative group">
                    <button 
                      onClick={() => handleDelete(hl.id)}
                      className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="pl-3 border-l-2" style={{ borderColor: hl.colorHex }}>
                      <p className="text-[13px] text-zinc-300 italic line-clamp-3 leading-relaxed">"{hl.selectedText}"</p>
                    </div>

                    {editingId === hl.id ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder={t('notesSidebar.notePlaceholder')}
                          className="w-full bg-[#09090b] border border-white/[0.1] rounded-md p-2.5 text-[12px] text-white resize-none outline-none focus:border-[#f5a623]/50 min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white">{t('common.cancel')}</button>
                          <button onClick={() => handleUpdateNote(hl.id)} className="px-3 py-1.5 text-[11px] bg-[#f5a623] text-black font-medium rounded-md">{t('common.save')}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 group/note">
                        <div className="flex items-center justify-between">
                          <p className={`text-[13px] ${hl.noteContent ? 'text-white' : 'text-zinc-600 italic'}`}>
                            {hl.noteContent || t('notesSidebar.noNote')}
                          </p>
                          <button 
                            onClick={() => { setEditingId(hl.id); setEditNote(hl.noteContent || ''); }}
                            className="text-zinc-600 hover:text-[#f5a623] opacity-0 group-hover/note:opacity-100 transition-opacity p-1"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotesSidebar;

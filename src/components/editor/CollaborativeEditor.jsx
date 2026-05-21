import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { motion } from 'framer-motion';
import { Save, Lock, MessageSquare, History } from 'lucide-react';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

import { 
  fetchScriptComments, 
  createScriptComment, 
  resolveScriptComment 
} from '../../controllers/scriptCollaborationController';

const CollaborativeEditor = ({ bookingId, user, onSave }) => {
  const ydoc = useMemo(() => new Y.Doc(), []);

  useEffect(() => {
    const provider = new WebsocketProvider(
      'ws://localhost:8080/ws/scripts', 
      bookingId, 
      ydoc
    );

    return () => {
      provider.destroy();
    };
  }, [bookingId, ydoc]);

  const [comments, setComments] = React.useState([]);
  const [showComments, setShowComments] = React.useState(true);
  const [activeCommentId, setActiveCommentId] = React.useState(null);

  const fetchComments = async () => {
    const data = await fetchScriptComments(bookingId);
    setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, [bookingId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        user: {
          name: user?.name || 'Anonymous',
          color: user?.color || '#f59e0b',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your amazing event script...',
      }),
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-8',
      },
    },
  });

  const handleAddComment = async () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const quoteText = editor.state.doc.textBetween(from, to, ' ');
    
    if (!quoteText) return;

    const commentData = {
      quoteText,
      content: prompt('Enter your comment:'),
      authorId: user?.id,
      status: 'OPEN'
    };

    if (!commentData.content) return;

    const result = await createScriptComment(bookingId, commentData);
    if (result) fetchComments();
  };

  const handleResolveComment = async (commentId) => {
    const success = await resolveScriptComment(commentId);
    if (success) fetchComments();
  };

  const handleSave = () => {
    if (editor && onSave) {
      const json = editor.getJSON();
      const html = editor.getHTML();
      onSave({ json, html });
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          <span className="text-slate-500 font-medium uppercase tracking-widest text-xs">Initializing editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl"
      >
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              Live Script
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`p-2 rounded-xl transition-all ${showComments ? 'bg-yellow-500 text-slate-950' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <MessageSquare size={18} />
            </button>
            <div className="w-px h-6 bg-white/5 mx-1" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-yellow-500/20"
            >
              <Save size={16} />
              Save Draft
            </motion.button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="relative">
          <EditorContent editor={editor} onContextMenu={(e) => {
            e.preventDefault();
            handleAddComment();
          }} />
          
          {/* Floating Action Button for Comments */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddComment}
            className="absolute top-4 right-4 p-3 rounded-full bg-slate-800 border border-white/10 text-yellow-500 shadow-xl"
          >
            <MessageSquare size={20} />
          </motion.button>

          {/* Floating Approval Button */}
          <div className="absolute bottom-8 right-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-2xl"
            >
              <Lock size={18} className="text-yellow-500" />
              Approve Script
            </motion.button>
          </div>
        </div>

        {/* Editor Status Bar */}
        <div className="px-6 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span>Words: {editor.storage.characterCount?.words() || 0}</span>
            <span>Characters: {editor.storage.characterCount?.characters() || 0}</span>
          </div>
        </div>
      </motion.div>

      {/* Comments Sidebar */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare size={20} className="text-yellow-500" />
            <h3 className="text-lg font-black uppercase italic tracking-tight text-white">Discussions</h3>
            <span className="ml-auto px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-slate-500 border border-white/10">
              {comments.filter(c => c.status === 'OPEN').length} OPEN
            </span>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border transition-all ${
                  comment.status === 'RESOLVED' 
                    ? 'bg-slate-900/20 border-white/5 opacity-50' 
                    : 'bg-slate-900/60 border-white/10 shadow-lg'
                }`}
              >
                <div className="text-[10px] text-yellow-500/60 font-bold mb-2 italic bg-yellow-500/5 px-2 py-1 rounded-md border border-yellow-500/10">
                  "{comment.quoteText}"
                </div>
                <p className="text-sm text-slate-300 mb-4">{comment.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  {comment.status === 'OPEN' && (
                    <button
                      onClick={() => handleResolveComment(comment.id)}
                      className="text-[10px] font-black uppercase tracking-wider text-green-500 hover:text-green-400"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-12 px-6 border border-dashed border-white/10 rounded-3xl">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  No discussions yet. Highlight text to start.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <style>{`
        .prose h1 { @apply text-4xl font-black mb-6 uppercase italic tracking-tighter text-white; }
        .prose h2 { @apply text-2xl font-black mt-8 mb-4 uppercase tracking-tight text-yellow-500; }
        .prose p { @apply text-slate-400 leading-relaxed mb-4; }
        .prose strong { @apply text-white font-black; }
        .prose blockquote { @apply border-l-4 border-yellow-500 pl-6 py-2 italic bg-white/5 rounded-r-xl; }
        .prose ul { @apply list-disc list-inside mb-4 space-y-2; }
        .prose li { @apply text-slate-400; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CollaborativeEditor;

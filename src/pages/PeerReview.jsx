import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, User, Mic, CheckCircle2 } from 'lucide-react';
import { academyService } from '../services/academyService';
import { toast } from 'sonner';

function ReviewCard({ item, onSubmitted }) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim() || rating === 0) return;
    setSubmitting(true);
    try {
      await academyService.peerReview.submit(item.id, comment.trim(), rating);
      toast.success(t('peerReview.submitted'));
      onSubmitted(item.id);
    } catch (err) {
      console.error('Submit review error:', err);
      toast.error(t('peerReview.submitFailed'));
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="p-5 rounded-md bg-[#111113] border border-white/[0.07] space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-[#f5a623]/[0.1] flex items-center justify-center text-[#f5a623]">
          <User size={14} />
        </div>
        <div>
          <p className="text-[13px] font-medium text-white">{item.revieweeName || t('peerReview.learnerFallback')}</p>
          <p className="text-[11px] text-zinc-500">{item.lessonTitle || t('peerReview.lessonFallback')}</p>
        </div>
      </div>

      {item.audioUrl && <audio src={item.audioUrl} controls className="w-full h-9" />}

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)}>
            <Star size={18} className={n <= rating ? 'text-[#f5a623] fill-[#f5a623]' : 'text-zinc-600'} />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('peerReview.commentPlaceholder')}
        rows={3}
        className="w-full rounded-md bg-[#09090b] border border-white/[0.07] px-3 py-2 text-[12px] text-zinc-300 outline-none focus:border-[#f5a623]/40 resize-none"
      />

      <button onClick={handleSubmit} disabled={!comment.trim() || rating === 0 || submitting}
        className="w-full py-2.5 rounded-md bg-[#f5a623] text-black text-[12px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-40">
        {submitting ? t('peerReview.sending') : t('peerReview.submitReview')}
      </button>
    </motion.div>
  );
}

export default function PeerReview() {
  const { t } = useTranslation();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = () => {
    setLoading(true);
    academyService.peerReview.pending()
      .then(res => setPending(res.data?.data || res.data || []))
      .catch(err => console.error('Failed to fetch pending reviews:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleSubmitted = (id) => setPending(prev => prev.filter(p => p.id !== id));

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6 px-4 pt-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <MessageSquare size={22} className="text-[#f5a623]" /> {t('peerReview.title')}
        </h1>
        <p className="text-zinc-500 text-[13px] mt-1">{t('peerReview.subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#f5a623]/30 border-t-[#f5a623] rounded-full animate-spin" />
        </div>
      ) : pending.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-12 h-12 rounded-md bg-[#09090b] border border-white/[0.07] flex items-center justify-center">
            <CheckCircle2 size={22} className="text-emerald-400" />
          </div>
          <p className="text-zinc-500 text-[12px] uppercase tracking-wider">{t('peerReview.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {pending.map(item => (
              <ReviewCard key={item.id} item={item} onSubmitted={handleSubmitted} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

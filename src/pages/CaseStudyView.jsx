import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, ThumbsUp, ThumbsDown, Lightbulb, MessageCircle } from 'lucide-react';
import { academyService } from '../services/academyService';
import Breadcrumb from '../components/ui/Breadcrumb';

export default function CaseStudyView() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [discussionAnswers, setDiscussionAnswers] = useState({});
  const videoRef = useRef(null);

  const TAG_META = {
    STRENGTH: { label: t('caseStudyView.strength'), icon: ThumbsUp, color: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20' },
    WEAKNESS: { label: t('caseStudyView.weakness'), icon: ThumbsDown, color: 'text-red-400 bg-red-500/[0.08] border-red-500/20' },
    TECHNIQUE: { label: t('caseStudyView.technique'), icon: Lightbulb, color: 'text-sky-400 bg-sky-500/[0.08] border-sky-500/20' },
  };

  useEffect(() => {
    academyService.getCaseStudy(id)
      .then(res => setCaseStudy(res.data?.data || res.data))
      .catch(err => console.error('Failed to fetch case study:', err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const key = `case-study-discussion-${id}`;
    const saved = localStorage.getItem(key);
    if (saved) { try { setDiscussionAnswers(JSON.parse(saved)); } catch {} }
  }, [id]);

  const saveAnswer = (qi, value) => {
    setDiscussionAnswers(prev => {
      const next = { ...prev, [qi]: value };
      localStorage.setItem(`case-study-discussion-${id}`, JSON.stringify(next));
      return next;
    });
  };

  const jumpTo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#f5a623]/30 border-t-[#f5a623] rounded-full animate-spin" />
      </div>
    );
  }

  if (!caseStudy) return <div className="text-white text-center py-32 text-[14px]">{t('caseStudyView.notFound')}</div>;

  const annotations = [...(caseStudy.annotations || [])].sort((a, b) => a.timestampSeconds - b.timestampSeconds);

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6 px-4 pt-6">
      <Breadcrumb items={[
        { label: t('caseStudyView.coursesBreadcrumb'), href: '/m/courses' },
        ...(courseId ? [{ label: t('caseStudyView.courseDetailBreadcrumb'), href: `/m/courses/${courseId}` }] : []),
        { label: caseStudy.title },
      ]} />
      <button onClick={() => navigate(courseId ? `/m/courses/${courseId}` : -1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[13px] group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> {t('caseStudyView.backButton')}
      </button>

      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{caseStudy.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {caseStudy.videoUrl && (
            <video ref={videoRef} src={caseStudy.videoUrl} controls
              onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
              className="w-full rounded-md aspect-video bg-black" />
          )}
          {caseStudy.transcript && (
            <div className="p-4 sm:p-5 rounded-md bg-[#111113] border border-white/[0.07]">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">{t('caseStudyView.transcript')}</p>
              <p className="text-[13px] text-zinc-400 leading-relaxed whitespace-pre-line">{caseStudy.transcript}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{t('caseStudyView.annotationsTitle')}</p>
          {annotations.map((a, i) => {
            const meta = TAG_META[a.tag] || TAG_META.TECHNIQUE;
            const Icon = meta.icon;
            const active = Math.abs(currentTime - a.timestampSeconds) < 3;
            return (
              <motion.button key={i} onClick={() => jumpTo(a.timestampSeconds)}
                animate={{ scale: active ? 1.02 : 1 }}
                className={`w-full text-left p-3 rounded-md border transition-colors ${meta.color} ${active ? 'ring-1 ring-[#f5a623]/40' : ''}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{meta.label}</span>
                  <span className="text-[10px] ml-auto opacity-70">
                    {Math.floor(a.timestampSeconds / 60)}:{String(a.timestampSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed">{a.comment}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {caseStudy.discussionQuestions?.length > 0 && (
        <div className="p-4 sm:p-5 rounded-md bg-[#111113] border border-white/[0.07] space-y-4">
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-500 uppercase tracking-wider">
            <MessageCircle size={12} /> {t('caseStudyView.discussionTitle')}
          </p>
          {caseStudy.discussionQuestions.map((q, qi) => (
            <div key={qi} className="space-y-1.5">
              <p className="text-[13px] text-white font-medium">{qi + 1}. {q}</p>
              <textarea
                value={discussionAnswers[qi] || ''}
                onChange={(e) => saveAnswer(qi, e.target.value)}
                placeholder={t('caseStudyView.discussionPlaceholder')}
                rows={2}
                className="w-full rounded-md bg-[#09090b] border border-white/[0.07] px-3 py-2 text-[12px] text-zinc-300 outline-none focus:border-[#f5a623]/40 resize-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

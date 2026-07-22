import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Layers, FileText, HelpCircle,
  CheckCircle2, ChevronRight, BookOpen, Mic, Award,
  ShieldCheck, ChevronLeft, Trophy, AlertCircle,
  Users, Target, GraduationCap, Star, Play, Lock, Map
} from 'lucide-react';
import { academyService } from '../services/academyService';
import { trackCourseDetailView, trackCourseEnrollClick, trackLessonStart } from '@/utils/analytics';
import { useAuthStore } from '../store/useAuthStore';
import PageLoader from '../components/ui/PageLoader';
import Breadcrumb from '../components/ui/Breadcrumb';
import { Card } from '@/components/ui/card';
import CertificateModal from '../components/CertificateModal';
import { Button } from '@/components/animate-ui/components/buttons/button';

const DIFFICULTY_MAP = {
  BEGINNER:     { labelKey: 'courses.difficultyBeginner',     color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06]' },
  INTERMEDIATE: { labelKey: 'courses.difficultyIntermediate', color: 'text-[#f5a623] border-[#f5a623]/20 bg-[#f5a623]/[0.06]' },
  ADVANCED:     { labelKey: 'courses.difficultyAdvanced',     color: 'text-red-400 border-red-500/20 bg-red-500/[0.06]' },
};

const DEFAULT_OUTCOME_KEYS = [
  'courses.defaultOutcome1',
  'courses.defaultOutcome2',
  'courses.defaultOutcome3',
  'courses.defaultOutcome4',
];

const EmptyState = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center py-16 gap-3">
    <div className="w-12 h-12 rounded-md bg-[#09090b] border border-white/[0.07] flex items-center justify-center">
      <Icon size={22} className="text-zinc-500" />
    </div>
    <p className="text-zinc-500 text-[12px] uppercase tracking-wider">{label}</p>
  </div>
);

/* ─────────────────────────── Duolingo-style Learning Path ─────────────────────────── */

const PATH_OFFSETS = [0, 72, 108, 72, 0, -72, -108, -72];
const STEP_H = 130;

const nodeVisual = (item, isCurrent) => {
  if (item.done) return {
    circle: 'bg-emerald-500 border-emerald-600 text-white shadow-[0_4px_0_0_#059669]',
    icon: <CheckCircle2 size={24} />,
  };
  if (isCurrent) return {
    circle: 'bg-[#f5a623] border-[#e09520] text-black shadow-[0_4px_0_0_#b97a10]',
    icon: item.type === 'quiz' ? <Trophy size={24} /> : <Play size={24} className="ml-0.5" />,
  };
  return {
    circle: 'bg-[#1f1f23] border-white/[0.08] text-zinc-500 shadow-[0_4px_0_0_rgba(0,0,0,0.4)]',
    icon: item.type === 'quiz' ? <Trophy size={22} /> : item.type === 'reading' ? <BookOpen size={22} /> : <Mic size={22} />,
  };
};

const typeMeta = (item, t) => {
  if (item.type === 'quiz')    return { label: t('courses.pathQuizLabel'), sub: t('courses.pathQuizSub'), color: 'text-purple-400' };
  if (item.type === 'reading') return { label: t('courses.pathReadingLabel'), sub: t('courses.pathReadingSub'), color: 'text-sky-400' };
  return { label: t('courses.pathLessonLabel'), sub: t('courses.pathLessonSub'), color: 'text-[#f5a623]' };
};

const DECOR_ICONS = [Mic, Star, Trophy, BookOpen, Award, GraduationCap];

// 3 chặng — mỗi chặng một màu nền, một câu truyền cảm hứng
const SECTION_KEYS = [
  {
    nameKey: 'courses.section1Name',
    color: '#f5a623', rgb: '245,166,35',
    quoteKeys: ['courses.section1Quote1', 'courses.section1Quote2'],
    cheerKey: 'courses.section1Cheer',
  },
  {
    nameKey: 'courses.section2Name',
    color: '#38bdf8', rgb: '56,189,248',
    quoteKeys: ['courses.section2Quote1', 'courses.section2Quote2'],
    cheerKey: 'courses.section2Cheer',
  },
  {
    nameKey: 'courses.section3Name',
    color: '#10b981', rgb: '16,185,129',
    quoteKeys: ['courses.section3Quote1', 'courses.section3Quote2'],
    cheerKey: 'courses.section3Cheer',
  },
];

const SECTION_HEADER_H = 120;

const PathMap = ({ items, onOpen }) => {
  const { t } = useTranslation();
  if (!items.length) return <EmptyState icon={Map} label={t('courses.noContent')} />;

  const firstPending = items.findIndex(it => !it.done);
  const currentIdx = firstPending === -1 ? items.length - 1 : firstPending;

  const n = items.length;
  const b1 = Math.ceil(n / 3), b2 = Math.ceil((2 * n) / 3);
  const sectionOf = (i) => (i < b1 ? 0 : i < b2 ? 1 : 2);

  const pts = items.map((_, i) => ({
    x: PATH_OFFSETS[i % PATH_OFFSETS.length],
    y: i * STEP_H + 56 + (sectionOf(i) + 1) * SECTION_HEADER_H,
  }));
  const totalH = n * STEP_H + 60 + 3 * SECTION_HEADER_H;

  // section zones: [startIdx, endIdx]
  const zones = [[0, b1 - 1], [b1, b2 - 1], [b2, n - 1]].filter(([s, e]) => s <= e);
  const pathD = pts.map((p, i) =>
    i === 0
      ? `M ${p.x} ${p.y}`
      : `C ${pts[i - 1].x} ${pts[i - 1].y + STEP_H / 2}, ${p.x} ${p.y - STEP_H / 2}, ${p.x} ${p.y}`
  ).join(' ');
  const doneCount = items.filter(it => it.done).length;
  const doneRatio = doneCount / items.length;

  return (
    <div className="relative mx-auto max-w-2xl" style={{ height: totalH }}>
      {/* ── Section zones: bg + header + quote + floating icons ── */}
      {zones.map(([s, e], zi) => {
        const secDef = SECTION_KEYS[zi];
        const sec = {
          ...secDef,
          name: t(secDef.nameKey),
          quotes: secDef.quoteKeys.map(k => t(k)),
          cheer: t(secDef.cheerKey),
        };
        const zoneTop = zi === 0 ? 0 : pts[s].y - STEP_H / 2 - SECTION_HEADER_H + 20;
        const zoneBottom = zi === zones.length - 1
          ? totalH
          : pts[zones[zi + 1][0]].y - STEP_H / 2 - SECTION_HEADER_H + 20;
        const zoneH = zoneBottom - zoneTop;
        const zoneDone = items.slice(s, e + 1).every(it => it.done);
        return (
          <React.Fragment key={zi}>
            {/* zone background — full-bleed, clipped by the card's overflow-hidden */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[100vw] pointer-events-none"
              style={{
                top: zoneTop, height: zoneH,
                background: `rgba(${sec.rgb},0.12)`,
              }} />
            {/* section header */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-10"
              style={{ top: zoneTop + 26 }}>
              <div className="px-5 py-2 rounded-md border-2 font-bold text-[13px] uppercase tracking-widest inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm"
                style={{ borderColor: sec.color, color: sec.color }}>
                {zoneDone ? <Trophy size={14} /> : <Star size={14} />}
                {sec.name}
                {zoneDone && <span className="text-[10px]">✓ {t('courses.sectionComplete')}</span>}
              </div>
              <p className="mt-2 text-[12px] italic font-medium" style={{ color: sec.color }}>
                {sec.quotes[0]}
              </p>
            </div>
            {/* mid-zone quote + cheer */}
            <div className={`absolute pointer-events-none hidden md:block w-48 ${zi % 2 === 0 ? 'left-2' : 'right-2'}`}
              style={{ top: zoneTop + zoneH * 0.55, transform: `rotate(${zi % 2 === 0 ? -4 : 4}deg)` }}>
              <p className="text-[12px] italic leading-relaxed font-medium" style={{ color: sec.color }}>
                {sec.quotes[1]}
              </p>
              <p className="text-[11px] mt-1.5 font-semibold text-gray-500">{sec.cheer}</p>
            </div>
            {/* floating icons per zone */}
            {[0, 1, 2].map(k => {
              const Icon = DECOR_ICONS[(zi * 3 + k) % DECOR_ICONS.length];
              return (
                <motion.div key={k} className="absolute pointer-events-none"
                  style={{
                    left: k % 2 === 0 ? `${10 + k * 6}%` : `${78 + k * 4}%`,
                    top: zoneTop + 70 + k * (zoneH / 3.4),
                    color: `rgba(${sec.rgb},0.40)`,
                  }}
                  animate={{ y: [0, -10, 0], rotate: [0, k % 2 === 0 ? 10 : -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5 + k, delay: k * 0.7, ease: 'easeInOut' }}>
                  <Icon size={24 + k * 6} />
                </motion.div>
              );
            })}
          </React.Fragment>
        );
      })}
      {/* connector path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`-180 0 360 ${totalH}`} preserveAspectRatio="xMidYMin meet">
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="14" strokeLinecap="round" strokeDasharray="0.1 22" />
        <motion.path
          d={pathD} fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" strokeDasharray="0.1 22"
          initial={{ pathLength: 0 }} animate={{ pathLength: doneRatio }} transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>

      {items.map((item, i) => {
        const isCurrent = i === currentIdx && !item.done;
        const v = nodeVisual(item, isCurrent);
        const meta = typeMeta(item, t);
        const onLeft = pts[i].x > 0; // label flips to opposite side of curve
        return (
          <div key={item.key} className="absolute" style={{ top: pts[i].y, left: '50%', transform: `translate(calc(-50% + ${pts[i].x}px), -50%)` }}>
            {/* START bubble */}
            {isCurrent && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: [0, -5, 0] }}
                transition={{ y: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } }}
                className="absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-[#f5a623] text-black text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-lg z-10"
              >
                {t('common.start')}
                <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#f5a623] rotate-45" />
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95, y: 2 }}
              onClick={() => onOpen(item)}
              {...(i === 0 ? { 'data-quest': 'quest-first-lesson-reading' } : {})}
              className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors ${v.circle}`}
              aria-label={item.title}
            >
              {isCurrent && (
                <span className="absolute -inset-2 rounded-full border-2 border-[#f5a623]/50 animate-ping" style={{ animationDuration: '1.8s' }} />
              )}
              {v.icon}
            </motion.button>

            {/* label card */}
            <div className={`absolute top-1/2 -translate-y-1/2 w-44 ${onLeft ? 'right-full mr-4 text-right' : 'left-full ml-4'} hidden sm:block`}>
              <p className={`text-[12px] font-semibold leading-snug line-clamp-2 ${item.done ? 'text-emerald-600' : isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                {item.title}
              </p>
              <p className={`text-[10px] mt-0.5 ${meta.color}`}>{meta.label}</p>
              <p className="text-[10px] text-gray-400">{item.done ? t('courses.pathItemDone') : meta.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────── Quiz tab (unchanged logic) ─────────────────────────── */

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const QuizTab = ({ questions, courseId }) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!questions || questions.length === 0) return <EmptyState icon={HelpCircle} label={t('courses.noQuiz')} />;

  const total = questions.length;
  const q = questions[current];
  const answered = Object.keys(answers).length;
  const allAnswered = answered === total;

  const handleSubmit = async () => {
    if (!allAnswered || submitting || result) return;
    setSubmitting(true);
    try {
      const answerArray = Array.from({ length: total }, (_, i) => answers[i] ?? 0);
      const res = await academyService.submitQuiz(courseId, answerArray);
      setResult(res.data?.data || res.data);
    } catch (err) { console.error('Quiz submit error:', err); }
    finally { setSubmitting(false); }
  };

  if (result) {
    const score = result.score ?? result.scorePercent ?? 0;
    const passed = result.passed ?? (score >= 60);
    const certificateEarned = result.certificateEarned ?? result.certificate;
    const feedback = result.feedback || result.questionFeedback || [];

    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {certificateEarned && (
          <Card className="p-6 rounded-md bg-[#f5a623]/[0.06] border border-[#f5a623]/20 text-center space-y-3 gap-0 shadow-none">
            <div className="w-12 h-12 mx-auto rounded-md bg-[#f5a623] flex items-center justify-center">
              <Award size={24} className="text-black" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#f5a623]">{t('courses.certEarned')}</h3>
            <p className="text-zinc-500 text-[13px]">{t('courses.certMsg')}</p>
          </Card>
        )}
        <Card className={`p-6 rounded-md border text-center space-y-2 gap-0 shadow-none ${passed ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-red-500/[0.04] border-red-500/20'}`}>
          <div className={`text-5xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{Math.round(score)}%</div>
          <div className={`text-[11px] font-medium uppercase tracking-wider ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{passed ? t('courses.passed') : t('courses.failed')}</div>
          {!passed && <p className="text-zinc-500 text-[12px]">{t('courses.reviewAndRetry')}</p>}
        </Card>
        {feedback.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{t('courses.resultPerQuestion')}</p>
            {feedback.map((fb, i) => (
              <Card key={i} className={`p-3.5 rounded-md border flex items-start gap-3 shadow-none ${fb.correct ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-red-500/[0.04] border-red-500/20'}`}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${fb.correct ? 'bg-emerald-500/[0.08] text-emerald-400' : 'bg-red-500/[0.08] text-red-400'}`}>
                  {fb.correct ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{t('courses.question')} {i + 1}</p>
                  {fb.explanation && <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{fb.explanation}</p>}
                </div>
              </Card>
            ))}
          </div>
        )}
        <button onClick={() => { setResult(null); setCurrent(0); setAnswers({}); }}
          className="w-full py-3 rounded-md border border-white/[0.07] text-zinc-500 hover:text-white hover:border-[#f5a623]/30 text-[12px] font-medium transition-colors">
          {t('courses.retry')}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span>{t('courses.question')} {current + 1} / {total}</span>
        <span className="text-[#f5a623]">{answered} / {total} {t('courses.answered')}</span>
      </div>
      <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div animate={{ width: `${((current + 1) / total) * 100}%` }} transition={{ duration: 0.3 }} className="h-full bg-[#f5a623] rounded-full" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
          <div className="p-5 rounded-md bg-[#09090b] border border-white/[0.06]">
            <p className="text-[14px] font-medium text-white leading-relaxed">{q.question}</p>
            {q.category && <span className="inline-block mt-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">{q.category}</span>}
          </div>
          <div className="space-y-2">
            {(q.options || []).map((opt, oi) => {
              const selected = answers[current] === oi;
              return (
                <button key={oi} onClick={() => { if (!result) setAnswers(prev => ({ ...prev, [current]: oi })); }}
                  className={`w-full text-left p-4 rounded-md border transition-colors flex items-center gap-3 ${selected ? 'bg-[#f5a623]/[0.08] border-[#f5a623]/30' : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'}`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-[12px] font-semibold transition-colors ${selected ? 'bg-[#f5a623] text-black' : 'bg-[#1a1a1e] text-zinc-500'}`}>
                    {OPTION_LABELS[oi]}
                  </div>
                  <span className={`text-[13px] ${selected ? 'text-[#f5a623]' : 'text-zinc-400'}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-2.5 pt-1">
        <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-white/[0.07] text-[12px] text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={13} /> {t('common.prev')}
        </button>
        {current < total - 1 ? (
          <button onClick={() => setCurrent(p => Math.min(total - 1, p + 1))}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-md border border-[#f5a623]/20 bg-[#f5a623]/[0.06] text-[#f5a623] text-[12px] hover:bg-[#f5a623]/[0.1] transition-colors">
            {t('common.next')} <ChevronRight size={13} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!allAnswered || submitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-[#f5a623] text-black text-[12px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Trophy size={13} /> {t('courses.submit')}</>}
          </button>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap justify-center">
        {questions.map((_, qi) => (
          <button key={qi} onClick={() => setCurrent(qi)}
            className={`w-9 h-9 rounded-md text-[11px] font-medium transition-colors ${
              qi === current ? 'bg-[#f5a623] text-black' :
              answers[qi] !== undefined ? 'bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20' :
              'bg-[#09090b] text-zinc-500 border border-white/[0.06] hover:border-white/[0.12]'
            }`}>{qi + 1}</button>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────── Page ─────────────────────────── */

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('path');
  const [enrolling, setEnrolling] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [buying, setBuying] = useState(false);
  const { user } = useAuthStore();

  const fetchCourse = () => {
    setLoading(true);
    academyService.getCourseDetail(id)
      .then(res => setCourse(res.data?.data || res.data))
      .catch(err => console.error('Failed to fetch course:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourse(); }, [id]);

  useEffect(() => {
    if (course) trackCourseDetailView(id, course.title);
  }, [course]);

  const handleEnroll = async () => {
    trackCourseEnrollClick(id, course.title);
    setEnrolling(true);
    try { await academyService.enrollCourse(id); fetchCourse(); }
    catch (err) { console.error('Enroll error:', err); }
    finally { setEnrolling(false); }
  };

  // Interleave readings + lessons into a single sequential path, quiz as final node
  const pathItems = useMemo(() => {
    if (!course) return [];
    const lessons = course.lessons || [];
    const readings = course.readings || [];
    const doneL = new Set(course.myProgress?.completedLessonIds || []);
    const doneR = new Set(course.myProgress?.completedReadingIds || []);
    const items = [];
    const maxLen = Math.max(lessons.length, readings.length);
    for (let i = 0; i < maxLen; i++) {
      if (readings[i]) items.push({ key: `r-${readings[i].id}`, type: 'reading', title: readings[i].title, id: readings[i].id, done: doneR.has(readings[i].id) });
      if (lessons[i])  items.push({ key: `l-${lessons[i].id}`,  type: 'lesson',  title: lessons[i].title,  id: lessons[i].id,  done: doneL.has(lessons[i].id) });
    }
    if ((course.quizQuestions || []).length > 0) {
      items.push({ key: 'quiz', type: 'quiz', title: t('courses.finalQuizAndCert'), done: !!course.myProgress?.isCompleted });
    }
    return items;
  }, [course, t]);

  if (loading) return <PageLoader />;
  if (!course) return <div className="text-white text-center py-32 text-[14px]">{t('courses.courseNotFound')}</div>;

  const diff = DIFFICULTY_MAP[course.difficulty] || DIFFICULTY_MAP.BEGINNER;
  const enrolled = !!course.myProgress?.enrollmentId;
  const progress = course.myProgress?.completionRate ?? 0;
  const isCompleted = course.myProgress?.isCompleted;
  const outcomes = course.outcomes?.length ? course.outcomes : DEFAULT_OUTCOME_KEYS.map(k => t(k));
  const seed = [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const learners = course.enrolledCount ?? course.enrollmentCount ?? (150 + (seed % 850));
  const doneSteps = pathItems.filter(it => it.done).length;

  // Access: BASIC+ active plan or purchased individually (backend-computed; fallback: plan check)
  const hasAccess = course.hasAccess ?? ((user?.plan || 'FREE') !== 'FREE');

  const handleBuyCourse = async () => {
    setBuying(true);
    try {
      const res = await academyService.createCourseOrder(id);
      const url = res.data?.data?.checkoutUrl || res.data?.checkoutUrl;
      if (url) window.location.href = url;
    } catch (err) { console.error('Course order error:', err); }
    finally { setBuying(false); }
  };

  const handleOpen = (item) => {
    if (item.type === 'lesson') {
      trackLessonStart(item.id, item.type);
      navigate(`/m/voice/practice/${item.id}?courseId=${id}`);
    }
    if (item.type === 'reading') {
      trackLessonStart(item.id, item.type);
      navigate(`/m/learning/guide/${item.id}?courseId=${id}`);
    }
    if (item.type === 'quiz')    setActiveTab('quiz');
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      <Breadcrumb items={[{ label: t('courses.pageTitle'), href: '/m/courses' }, { label: course?.title || t('courses.courseDetailBreadcrumb') }]} />
      <Button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[13px] group h-auto">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        {t('courses.backToList')}
      </Button>

      {/* ── Hero ── */}
      <Card className="bg-[#111113] border border-white/[0.07] rounded-md p-6 relative overflow-hidden gap-0 shadow-none">
        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'rgba(245,166,35,0.4)' }} />
        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${diff.color}`}>{t(diff.labelKey)}</span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-500"><Clock size={11} /> {course.estimatedHours}h</span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-500"><Users size={11} /> {learners.toLocaleString('vi-VN')} {t('courses.learners')}</span>
              {isCompleted && <span className="flex items-center gap-1 text-[11px] text-emerald-400"><ShieldCheck size={11} /> {t('courses.completed')}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{course.title}</h1>
            <p className="text-zinc-500 text-[14px] leading-relaxed max-w-2xl">{course.description || course.shortDescription}</p>

            {/* Outcomes */}
            <div className="pt-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                <Target size={12} className="text-[#f5a623]" /> {t('courses.learningOutcomes')}
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5 max-w-2xl">
                {outcomes.map((o, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2.5 p-3 rounded-md bg-[#09090b] border border-white/[0.05]">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[12px] text-zinc-400 leading-relaxed">{o}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Certificate */}
            <div className="flex items-center gap-4 p-4 rounded-md bg-[#f5a623]/[0.05] border border-[#f5a623]/20 max-w-2xl">
              <div className="w-11 h-11 rounded-md bg-[#f5a623] flex items-center justify-center shrink-0">
                <GraduationCap size={20} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#f5a623]">{t('courses.completionCertTitle')}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {t('courses.completionCertDesc')}
                </p>
              </div>
              <Button onClick={() => setShowCert(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#f5a623]/40 text-[#f5a623] text-[12px] font-semibold hover:bg-[#f5a623] hover:text-black transition-colors shrink-0 h-auto">
                <Award size={13} /> {isCompleted ? t('courses.viewCertificate') : t('courses.previewCertificate')}
              </Button>
            </div>
          </div>

          {/* Sidebar stats + enroll */}
          <Card className="w-full lg:w-72 space-y-4 bg-[#09090b] border border-white/[0.07] rounded-md p-5 shrink-0 gap-0 shadow-none">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Layers size={14} />, val: course.totalLessons ?? 0, label: t('courses.lessons'), color: 'text-[#f5a623]' },
                { icon: <FileText size={14} />, val: course.totalReadings ?? 0, label: t('courses.readings'), color: 'text-sky-400' },
                { icon: <HelpCircle size={14} />, val: course.totalQuizQuestions ?? 0, label: t('courses.quiz'), color: 'text-purple-400' },
              ].map(({ icon, val, label, color }) => (
                <div key={label} className="text-center p-2.5 rounded-md bg-[#111113] border border-white/[0.06]">
                  <div className={`flex justify-center mb-0.5 ${color}`}>{icon}</div>
                  <div className="text-[15px] font-bold text-white">{val}</div>
                  <div className="text-[9px] text-zinc-500 uppercase">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>{t('courses.progress')}</span>
                <span className="text-[#f5a623]">{Math.round(progress)}% · {doneSteps}/{pathItems.length} {t('courses.steps')}</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-[#f5a623] rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Star size={11} className="text-[#f5a623]" />
              <span>{t('courses.sequentialPathHint')}</span>
            </div>

            {enrolled ? (
              <div className="w-full py-2.5 rounded-md bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400 text-[12px] font-medium text-center flex items-center justify-center gap-2">
                <CheckCircle2 size={14} /> {t('courses.enrolled')}
              </div>
            ) : hasAccess ? (
              <Button hoverScale={1} onClick={handleEnroll} disabled={enrolling}
                className="w-full py-2.5 rounded-md bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-all flex items-center justify-center gap-2 disabled:opacity-60 h-auto">
                {enrolling ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>{t('courses.enroll')} <ChevronRight size={14} /></>}
              </Button>
            ) : (
              <div className="space-y-2.5">
                {/* price */}
                <div className="flex items-baseline justify-center gap-2">
                  {course.discountPercent > 0 && (
                    <span className="text-[13px] text-zinc-500 line-through">
                      {(course.priceVnd || 199000).toLocaleString('vi-VN')}đ
                    </span>
                  )}
                  <span className="text-[20px] font-bold text-[#f5a623]">
                    {(course.finalPriceVnd || course.priceVnd || 199000).toLocaleString('vi-VN')}đ
                  </span>
                  {course.discountPercent > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                      -{course.discountPercent}%
                    </span>
                  )}
                </div>
                <Button hoverScale={1} onClick={handleBuyCourse} disabled={buying}
                  className="w-full py-2.5 rounded-md bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-all flex items-center justify-center gap-2 disabled:opacity-60 h-auto">
                  {buying
                    ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    : <>{t('courses.buySingleCourse')} <ChevronRight size={14} /></>}
                </Button>
                <Button hoverScale={1} onClick={() => navigate('/m/payment')}
                  className="w-full py-2.5 rounded-md border border-[#f5a623]/30 text-[#f5a623] text-[12px] font-semibold hover:bg-[#f5a623]/[0.08] transition-colors h-auto">
                  {t('courses.upgradeBasicPlan')}
                </Button>
                <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                  {t('courses.basicPlanDesc')}
                </p>
              </div>
            )}
          </Card>
        </div>
      </Card>

      {/* ── Lộ trình học (quiz mở inline từ node cuối) ── */}
      <Card className="bg-[#111113] border border-white/[0.07] rounded-md overflow-hidden gap-0 shadow-none py-0">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#f5a623]">
            {activeTab === 'quiz' ? <HelpCircle size={13} /> : <Map size={13} />}
            <span>{activeTab === 'quiz' ? t('courses.finalQuiz') : t('courses.learningPath')}</span>
          </div>
          {activeTab === 'quiz' && (
            <Button onClick={() => setActiveTab('path')}
              className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-[#f5a623] transition-colors h-auto">
              <ArrowLeft size={13} /> {t('courses.backToPath')}
            </Button>
          )}
        </div>
        <div className={activeTab === 'path' ? 'pb-0' : 'p-5 sm:p-8'}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'path' && <PathMap items={pathItems} onOpen={handleOpen} />}
              {activeTab === 'quiz' && <QuizTab questions={course.quizQuestions} courseId={id} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>

      <CertificateModal
        open={showCert}
        onClose={() => setShowCert(false)}
        name={user?.name}
        courseTitle={course.title}
        courseId={id}
        isCompleted={isCompleted}
      />
    </div>
  );
};

export default CourseDetail;

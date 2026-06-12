import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Layers, FileText, HelpCircle,
  CheckCircle2, ChevronRight, BookOpen, Mic, Award,
  ShieldCheck, ChevronLeft, Trophy, AlertCircle
} from 'lucide-react';
import { academyService } from '../services/academyService';
import PageLoader from '../components/ui/PageLoader';
import Breadcrumb from '../components/ui/Breadcrumb';

const DIFFICULTY_MAP = {
  BEGINNER:     { label: 'Cơ Bản',   color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06]' },
  INTERMEDIATE: { label: 'Trung Cấp', color: 'text-[#f5a623] border-[#f5a623]/20 bg-[#f5a623]/[0.06]' },
  ADVANCED:     { label: 'Nâng Cao',  color: 'text-red-400 border-red-500/20 bg-red-500/[0.06]' },
};

const TABS = (t) => [
  { id: 'lessons',  label: t('courses.lessonTab'),  icon: Mic },
  { id: 'readings', label: t('courses.readingTab'), icon: BookOpen },
  { id: 'quiz',     label: t('courses.quizTab'),    icon: HelpCircle },
];

const EmptyState = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center py-16 gap-3">
    <div className="w-12 h-12 rounded-xl bg-[#09090b] border border-white/[0.07] flex items-center justify-center">
      <Icon size={22} className="text-zinc-700" />
    </div>
    <p className="text-zinc-600 text-[12px] uppercase tracking-wider">{label}</p>
  </div>
);

const LessonsTab = ({ lessons, completedLessonIds, courseId, navigate }) => {
  if (!lessons || lessons.length === 0) return <EmptyState icon={Mic} label="Chưa có bài luyện" />;
  return (
    <div className="space-y-2">
      {lessons.map((lesson, i) => {
        const done = (completedLessonIds || []).includes(lesson.id);
        return (
          <motion.button key={lesson.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/m/voice/practice/${lesson.id}?courseId=${courseId}`)}
            className="w-full group text-left">
            <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
              done ? 'bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/30' : 'border-white/[0.06] hover:border-[#f5a623]/20 hover:bg-[#f5a623]/[0.02]'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                done ? 'bg-emerald-500/[0.08] text-emerald-400' : 'bg-[#09090b] text-[#f5a623] group-hover:bg-[#f5a623] group-hover:text-black'
              }`}>
                {done ? <CheckCircle2 size={16} /> : <Mic size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-medium transition-colors truncate ${done ? 'text-emerald-300' : 'text-white group-hover:text-[#f5a623]'}`}>{lesson.title}</p>
                {lesson.category && <p className="text-[10px] text-zinc-700 uppercase tracking-wider mt-0.5">{lesson.category}</p>}
              </div>
              {done && <span className="text-[10px] text-emerald-500 uppercase tracking-wider shrink-0">Hoàn Thành</span>}
              <ChevronRight size={13} className="text-zinc-600 group-hover:text-[#f5a623] shrink-0" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

const ReadingsTab = ({ readings, completedReadingIds, courseId, navigate }) => {
  if (!readings || readings.length === 0) return <EmptyState icon={BookOpen} label="Chưa có bài đọc" />;
  return (
    <div className="space-y-2">
      {readings.map((reading, i) => {
        const done = (completedReadingIds || []).includes(reading.id);
        return (
          <motion.button key={reading.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/m/learning/guide/${reading.id}?courseId=${courseId}`)}
            className="w-full group text-left">
            <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
              done ? 'bg-sky-500/[0.04] border-sky-500/20' : 'border-white/[0.06] hover:border-[#f5a623]/20'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-sky-500/[0.08] text-sky-400' : 'bg-[#09090b] text-sky-400'}`}>
                {done ? <CheckCircle2 size={16} /> : <FileText size={16} />}
              </div>
              {reading.thumbnail && <img src={reading.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-medium truncate ${done ? 'text-sky-300' : 'text-white group-hover:text-[#f5a623]'}`}>{reading.title}</p>
                {reading.author && <p className="text-[10px] text-zinc-700 uppercase tracking-wider mt-0.5">{reading.author}</p>}
              </div>
              <ChevronRight size={13} className="text-zinc-600 group-hover:text-[#f5a623] shrink-0" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const QuizTab = ({ questions, courseId }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!questions || questions.length === 0) return <EmptyState icon={HelpCircle} label="Chưa có câu hỏi" />;

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
          <div className="p-6 rounded-2xl bg-[#f5a623]/[0.06] border border-[#f5a623]/20 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#f5a623] flex items-center justify-center">
              <Award size={24} className="text-black" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#f5a623]">Chứng Chỉ Đạt Được!</h3>
            <p className="text-zinc-500 text-[13px]">Chúc mừng! Bạn đã hoàn thành và nhận được chứng chỉ khoá học.</p>
          </div>
        )}
        <div className={`p-6 rounded-2xl border text-center space-y-2 ${passed ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-red-500/[0.04] border-red-500/20'}`}>
          <div className={`text-5xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{Math.round(score)}%</div>
          <div className={`text-[11px] font-medium uppercase tracking-wider ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{passed ? 'Đạt' : 'Chưa Đạt'}</div>
          {!passed && <p className="text-zinc-600 text-[12px]">Hãy ôn tập thêm và thử lại!</p>}
        </div>
        {feedback.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-600 uppercase tracking-wider">Kết Quả Từng Câu</p>
            {feedback.map((fb, i) => (
              <div key={i} className={`p-3.5 rounded-xl border flex items-start gap-3 ${fb.correct ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-red-500/[0.04] border-red-500/20'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${fb.correct ? 'bg-emerald-500/[0.08] text-emerald-400' : 'bg-red-500/[0.08] text-red-400'}`}>
                  {fb.correct ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">Câu {i + 1}</p>
                  {fb.explanation && <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{fb.explanation}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => { setResult(null); setCurrent(0); setAnswers({}); }}
          className="w-full py-3 rounded-xl border border-white/[0.07] text-zinc-500 hover:text-white hover:border-[#f5a623]/30 text-[12px] font-medium transition-colors">
          Làm Lại
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-[11px] text-zinc-600">
        <span>Câu {current + 1} / {total}</span>
        <span className="text-[#f5a623]">{answered} / {total} Đã Trả Lời</span>
      </div>
      <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div animate={{ width: `${((current + 1) / total) * 100}%` }} transition={{ duration: 0.3 }} className="h-full bg-[#f5a623] rounded-full" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
          <div className="p-5 rounded-xl bg-[#09090b] border border-white/[0.06]">
            <p className="text-[14px] font-medium text-white leading-relaxed">{q.question}</p>
            {q.category && <span className="inline-block mt-1.5 text-[10px] text-zinc-700 uppercase tracking-wider">{q.category}</span>}
          </div>
          <div className="space-y-2">
            {(q.options || []).map((opt, oi) => {
              const selected = answers[current] === oi;
              return (
                <button key={oi} onClick={() => { if (!result) setAnswers(prev => ({ ...prev, [current]: oi })); }}
                  className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center gap-3 ${selected ? 'bg-[#f5a623]/[0.08] border-[#f5a623]/30' : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-semibold transition-colors ${selected ? 'bg-[#f5a623] text-black' : 'bg-[#1a1a1e] text-zinc-500'}`}>
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
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.07] text-[12px] text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={13} /> Trước
        </button>
        {current < total - 1 ? (
          <button onClick={() => setCurrent(p => Math.min(total - 1, p + 1))}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#f5a623]/20 bg-[#f5a623]/[0.06] text-[#f5a623] text-[12px] hover:bg-[#f5a623]/[0.1] transition-colors">
            Tiếp <ChevronRight size={13} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!allAnswered || submitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f5a623] text-black text-[12px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Trophy size={13} /> Nộp Bài</>}
          </button>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap justify-center">
        {questions.map((_, qi) => (
          <button key={qi} onClick={() => setCurrent(qi)}
            className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-colors ${
              qi === current ? 'bg-[#f5a623] text-black' :
              answers[qi] !== undefined ? 'bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20' :
              'bg-[#09090b] text-zinc-600 border border-white/[0.06] hover:border-white/[0.12]'
            }`}>{qi + 1}</button>
        ))}
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tabs = TABS(t);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  const [enrolling, setEnrolling] = useState(false);

  const fetchCourse = () => {
    setLoading(true);
    academyService.getCourseDetail(id)
      .then(res => setCourse(res.data?.data || res.data))
      .catch(err => console.error('Failed to fetch course:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourse(); }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try { await academyService.enrollCourse(id); fetchCourse(); }
    catch (err) { console.error('Enroll error:', err); }
    finally { setEnrolling(false); }
  };

  if (loading) return <PageLoader />;
  if (!course) return <div className="text-white text-center py-32 text-[14px]">Không tìm thấy khoá học.</div>;

  const diff = DIFFICULTY_MAP[course.difficulty] || DIFFICULTY_MAP.BEGINNER;
  const enrolled = !!course.myProgress?.enrollmentId;
  const progress = course.myProgress?.completionRate ?? 0;
  const completedLessonIds = course.myProgress?.completedLessonIds || [];
  const completedReadingIds = course.myProgress?.completedReadingIds || [];
  const isCompleted = course.myProgress?.isCompleted;

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      <Breadcrumb items={[{ label: 'Khóa học', href: '/m/courses' }, { label: course?.title || 'Chi tiết khóa học' }]} />
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[13px] group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        {t('courses.backToList')}
      </button>

      {/* Course header */}
      <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-medium ${diff.color}`}>{diff.label}</span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-600"><Clock size={11} /> {course.estimatedHours}h</span>
              {isCompleted && <span className="flex items-center gap-1 text-[11px] text-emerald-400"><ShieldCheck size={11} /> {t('courses.completed')}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{course.title}</h1>
            <p className="text-zinc-500 text-[14px] leading-relaxed max-w-2xl">{course.description || course.shortDescription}</p>
          </div>

          {/* Sidebar stats + enroll */}
          <div className="w-full lg:w-72 space-y-4 bg-[#09090b] border border-white/[0.07] rounded-xl p-5 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Layers size={14} />, val: course.totalLessons ?? 0, label: t('courses.lessons'), color: "text-[#f5a623]" },
                { icon: <FileText size={14} />, val: course.totalReadings ?? 0, label: t('courses.readings'), color: "text-sky-400" },
                { icon: <HelpCircle size={14} />, val: course.totalQuizQuestions ?? 0, label: t('courses.quiz'), color: "text-purple-400" },
              ].map(({ icon, val, label, color }) => (
                <div key={label} className="text-center p-2.5 rounded-xl bg-[#111113] border border-white/[0.06]">
                  <div className={`flex justify-center mb-0.5 ${color}`}>{icon}</div>
                  <div className="text-[15px] font-bold text-white">{val}</div>
                  <div className="text-[9px] text-zinc-700 uppercase">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-zinc-600">
                <span>{t('courses.progress')}</span>
                <span className="text-[#f5a623]">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-[#f5a623] rounded-full" />
              </div>
            </div>

            {!enrolled ? (
              <button onClick={handleEnroll} disabled={enrolling}
                className="w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {enrolling ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>{t('courses.enroll')} <ChevronRight size={14} /></>}
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400 text-[12px] font-medium text-center flex items-center justify-center gap-2">
                <CheckCircle2 size={14} /> {t('courses.enrolled')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-[#111113] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/[0.07]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-4 text-[12px] font-medium transition-colors ${isActive ? 'text-[#f5a623]' : 'text-zinc-600 hover:text-zinc-400'}`}>
                <Icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f5a623]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
              </button>
            );
          })}
        </div>
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'lessons' && <LessonsTab lessons={course.lessons} completedLessonIds={completedLessonIds} courseId={id} navigate={navigate} />}
              {activeTab === 'readings' && <ReadingsTab readings={course.readings} completedReadingIds={completedReadingIds} courseId={id} navigate={navigate} />}
              {activeTab === 'quiz' && <QuizTab questions={course.quizQuestions} courseId={id} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

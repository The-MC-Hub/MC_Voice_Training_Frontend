import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Clock, Layers, FileText, HelpCircle,
  ChevronRight, GraduationCap
} from 'lucide-react';
import { academyService } from '../services/academyService';
import { trackCourseListView, trackCourseDetailView } from '@/utils/analytics';
import { questService } from '../services/questService';
import PageBanner from '../components/ui/PageBanner';
import Breadcrumb from '../components/ui/Breadcrumb';

const DIFFICULTY_MAP = {
  BEGINNER:     { color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06]' },
  INTERMEDIATE: { color: 'text-[#f5a623] border-[#f5a623]/20 bg-[#f5a623]/[0.06]' },
  ADVANCED:     { color: 'text-red-400 border-red-500/20 bg-red-500/[0.06]' },
};

const TYPE_THUMB_BG = {
  WEDDING_MC:     'bg-rose-950',
  CORPORATE_EVENT:'bg-indigo-950',
  TALKSHOW_MC:    'bg-purple-950',
  default:        'bg-[#1a1a1e]',
};

const SkeletonCard = () => (
  <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-5 animate-pulse space-y-4">
    <div className="h-36 rounded-xl bg-white/[0.04]" />
    <div className="h-4 rounded bg-white/[0.04] w-3/4" />
    <div className="h-3 rounded bg-white/[0.04] w-full" />
    <div className="flex gap-2 pt-1">
      <div className="h-5 w-14 rounded-md bg-white/[0.04]" />
      <div className="h-5 w-16 rounded-md bg-white/[0.04]" />
    </div>
  </div>
);

const CourseCard = ({ course, index }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const diff = DIFFICULTY_MAP[course.difficulty?.toUpperCase()] || DIFFICULTY_MAP.BEGINNER;
  const typeLabel = {
    WEDDING_MC: t('courses.weddingMc'),
    CORPORATE_EVENT: t('courses.corporate'),
    TALKSHOW_MC: t('courses.talkshow'),
  }[course.type] || course.type?.replace(/_/g, ' ');
  const thumbBg = TYPE_THUMB_BG[course.type] || TYPE_THUMB_BG.default;
  const progress = course.myProgress?.completionRate ?? null;
  const enrolled = course.myProgress?.enrollmentId != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => { trackCourseDetailView(course.id, course.title); navigate(`/m/courses/${course.id}`); }}
      className="group cursor-pointer bg-[#111113] border border-white/[0.07] rounded-2xl overflow-hidden
                 hover:border-[#f5a623]/30 hover:shadow-[0_8px_32px_rgba(245,166,35,0.10)]
                 transition-all duration-300 flex flex-col"
    >
      {/* Thumbnail */}
      <div className={`relative h-48 ${thumbBg} overflow-hidden flex items-center justify-center shrink-0`}>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <GraduationCap size={48} className="text-white/[0.06]" />
        )}
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* top badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${diff.color}`}>
            {t(`dashboard.${course.difficulty?.toLowerCase()}`)}
          </span>
        </div>
        {enrolled && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold backdrop-blur-sm">
            {t('courses.enrolled')}
          </div>
        )}

        {/* bottom-left: hours */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-white/60">
          <Clock size={11} /> {course.estimatedHours}h
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="space-y-1 flex-1">
          <h3 className="text-[15px] font-semibold text-white group-hover:text-[#f5a623] transition-colors leading-snug line-clamp-2">
            {course.title}
          </h3>
          <p className="text-zinc-500 text-[12px] leading-relaxed line-clamp-2">{course.shortDescription}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.06]">
          {[
            { icon: <Layers size={11} />, val: course.totalLessons ?? 0, label: t('courses.lessons'), color: "text-[#f5a623]" },
            { icon: <FileText size={11} />, val: course.totalReadings ?? 0, label: t('courses.readings'), color: "text-sky-400" },
            { icon: <HelpCircle size={11} />, val: course.totalQuizQuestions ?? 0, label: t('courses.quiz'), color: "text-purple-400" },
          ].map(({ icon, val, label, color }) => (
            <div key={label} className="text-center">
              <div className={`flex items-center justify-center gap-1 ${color} mb-0.5`}>
                {icon}
                <span className="text-[13px] font-bold tabular-nums">{val}</span>
              </div>
              <span className="text-[9px] text-zinc-700 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {progress !== null && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>{t('courses.progress')}</span>
              <span className="text-[#f5a623] font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-[#f5a623] rounded-full" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-600">{typeLabel}</span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-600 group-hover:text-[#f5a623] transition-colors">
            Xem khoá học <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const CoursesList = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    trackCourseListView();
    questService.completeQuest('courses').catch(() => {});
    setLoading(true);
    academyService.getAllCourses()
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setCourses(data);
        setCourseTypes([...new Set(data.map(c => c.type).filter(Boolean))]);
      })
      .catch(err => console.error('Failed to fetch courses:', err))
      .finally(() => setLoading(false));
  }, []);

  const TYPE_LABEL_MAP = {
    WEDDING_MC: t('courses.weddingMc'),
    CORPORATE_EVENT: t('courses.corporate'),
    TALKSHOW_MC: t('courses.talkshow'),
  };

  const filters = [
    { label: t('courses.allCourses'), value: null },
    ...courseTypes.map(type => ({ label: TYPE_LABEL_MAP[type] || type.replace(/_/g, ' '), value: type })),
  ];

  const filtered = activeFilter ? courses.filter(c => c.type === activeFilter) : courses;

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8">
      <Breadcrumb items={[{ label: 'Khóa học' }]} />
      <PageBanner
        icon={<GraduationCap size={22} />}
        eyebrow="MC Academy"
        title={t('courses.pageTitle')}
        description={t('courses.subtitle')}
        stats={[
          { value: courses.length, label: t('courses.coursesCount') || 'Khoá học' },
          { value: courses.filter(c => c.myProgress?.enrollmentId).length, label: t('courses.joinedCount') || 'Đã tham gia' },
        ]}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.value ?? 'all'} onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
              activeFilter === f.value
                ? 'bg-[#f5a623] text-black border-[#f5a623]'
                : 'text-zinc-500 border-white/[0.07] hover:text-white hover:border-white/[0.14]'
            }`}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-zinc-600">{filtered.length} {t('courses.coursesCount').toLowerCase()}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-14 h-14 rounded-xl bg-[#111113] border border-white/[0.07] flex items-center justify-center">
            <BookOpen size={24} className="text-zinc-700" />
          </div>
          <p className="text-zinc-600 text-[13px]">Chưa có khoá học</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeFilter ?? 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>

);
};

export default CoursesList;

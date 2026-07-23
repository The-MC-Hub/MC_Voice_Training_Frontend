import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Activity, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { academyService } from '../../services/academyService';

const StatTile = ({ icon: Icon, value, label }) => (
  <div className="text-center p-3 rounded-md bg-[#09090b] border border-white/[0.06]">
    <div className="flex justify-center mb-1 text-[#f5a623]"><Icon size={16} /></div>
    <div className="text-[17px] font-bold text-white">{value}</div>
    <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">{label}</div>
  </div>
);

export default function CourseProgressTab({ courseId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    academyService.getProgressStats(courseId)
      .then(res => setStats(res.data?.data || res.data))
      .catch(err => console.error('Failed to fetch progress stats:', err))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#f5a623]/30 border-t-[#f5a623] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats || stats.totalSessions === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <div className="w-12 h-12 rounded-md bg-[#09090b] border border-white/[0.07] flex items-center justify-center">
          <Activity size={22} className="text-zinc-500" />
        </div>
        <p className="text-zinc-500 text-[12px] uppercase tracking-wider">{t('courses.progressStatsEmpty')}</p>
      </div>
    );
  }

  const chartData = (stats.scoreOverTime || []).map(p => ({ date: p.date.slice(5), score: Math.round(p.avgScore) }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile icon={Clock} value={`${stats.totalPracticeHours}h`} label={t('courses.progressHours')} />
        <StatTile icon={Activity} value={stats.totalSessions} label={t('courses.progressSessions')} />
        <StatTile icon={TrendingUp} value={`${Math.round(stats.avgScore)}%`} label={t('courses.progressAvgScore')} />
      </div>

      {chartData.length > 1 && (
        <div className="p-4 rounded-md bg-[#09090b] border border-white/[0.06]">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3">{t('courses.progressScoreOverTime')}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#f5a623" strokeWidth={2} dot={{ fill: '#f5a623', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.weakestLessons?.length > 0 && (
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-400" /> {t('courses.progressReviewSuggestion')}
          </p>
          <div className="space-y-2">
            {stats.weakestLessons.map(l => (
              <button key={l.lessonId} onClick={() => navigate(`/m/voice/practice/${l.lessonId}?courseId=${courseId}`)}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-md bg-[#09090b] border border-white/[0.06] hover:border-[#f5a623]/30 transition-colors text-left">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-white truncate">{l.lessonTitle}</p>
                  <p className="text-[11px] text-zinc-500">
                    {t('courses.progressLessonStats', { attempts: l.attempts, score: Math.round(l.avgScore) })}
                  </p>
                </div>
                <ChevronRight size={14} className="text-zinc-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

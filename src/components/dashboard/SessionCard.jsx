import React from "react";
import { Link } from "react-router-dom";
import { Mic, ChevronRight, BookOpen, Zap, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import SpotlightCard from '../ui/SpotlightCard';

const CATEGORY_KEYS = {
  WEDDING: "wedding",
  NEWS: "news",
  PRESENTATION: "presentation",
  CEREMONY: "ceremony",
  GENERAL: "general",
};
const CATEGORY_COLOR = {
  WEDDING:      "text-pink-400 bg-pink-500/[0.08] border-pink-500/20",
  NEWS:         "text-blue-400 bg-blue-500/[0.08] border-blue-500/20",
  PRESENTATION: "text-violet-400 bg-violet-500/[0.08] border-violet-500/20",
  CEREMONY:     "text-orange-400 bg-orange-500/[0.08] border-orange-500/20",
  GENERAL:      "text-zinc-400 bg-zinc-500/[0.08] border-zinc-500/20",
};

const DIFF_KEYS = { EASY: "easy", MEDIUM: "medium", HARD: "hard" };
const DIFF_DOT = { EASY: "bg-emerald-400", MEDIUM: "bg-amber-400", HARD: "bg-red-400" };

const scoreColor = (s) => {
  if (s >= 80) return "text-emerald-400 bg-emerald-500/[0.07] border-emerald-500/20";
  if (s >= 50) return "text-amber-400 bg-amber-500/[0.07] border-amber-500/20";
  return "text-red-400 bg-red-500/[0.07] border-red-500/20";
};

const truncate = (str, len) =>
  str ? str.replace(/\s+/g, " ").trim().slice(0, len) + (str.length > len ? "…" : "") : null;

const SessionCard = ({ session, index, total, locale = "vi-VN" }) => {
  const { t } = useTranslation();
  const id = session.id || session._id;
  const title = session.lesson_title || `Session #${total - index}`;
  const acc = (session.accuracy_score || 0).toFixed(1);
  const rhy = (session.rhythm_score || 0).toFixed(1);
  const wpm = Math.round(session.speaking_rate_wpm || 0);
  const overall = Math.round(session.overall_score || 0);
  const catKey = CATEGORY_KEYS[session.lesson_category] || CATEGORY_KEYS.GENERAL;
  const cat = { label: t(`dashboard.${catKey}`), color: CATEGORY_COLOR[session.lesson_category] || CATEGORY_COLOR.GENERAL };
  const diffCode = (session.lesson_difficulty || "").toUpperCase();
  const diffKey = DIFF_KEYS[diffCode];
  const diff = diffKey ? { label: t(`dashboard.${diffKey}`), dot: DIFF_DOT[diffCode] } : null;
  const date = session.created_at
    ? new Date(session.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
    : "—";

  // Script preview: lesson_content (after backend compile) → lesson_description → text_spoken fallback
  const scriptPreview =
    truncate(session.lesson_content, 160) ||
    truncate(session.lesson_description, 160) ||
    (session.text_spoken ? truncate(session.text_spoken, 160) : null);

  return (
    <Link to={`/m/voice/report/${id}`}>
      <SpotlightCard spotlightColor="rgba(245,166,35,0.10)" spotlightSize={300} className="m-5 group p-5 rounded-2xl border border-white/[0.06] bg-[#0e0e10] hover:border-[#f5a623]/25 hover:bg-[#f5a623]/[0.02] transition-all">

        {/* Row 1: icon + title + date */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#1a1a1e] border border-white/[0.07] flex items-center justify-center text-[#f5a623] shrink-0 mt-0.5">
              <Mic size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-semibold text-white group-hover:text-[#f5a623] transition-colors">
                {title}
              </h4>

              {/* Badges */}
              <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md border ${cat.color}`}>
                  {cat.label}
                </span>
                {diff && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${diff.dot}`} />
                    {diff.label}
                  </span>
                )}
                {overall > 0 && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${scoreColor(overall)}`}>
                    <Star size={8} strokeWidth={2.5} /> {overall}đ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Date + chevron */}
          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <span className="text-[11px] text-zinc-600 hidden sm:block whitespace-nowrap">{date}</span>
            <div className="w-7 h-7 rounded-lg border border-white/[0.05] flex items-center justify-center text-zinc-700 group-hover:text-zinc-300 group-hover:border-white/[0.12] transition-colors">
              <ChevronRight size={13} />
            </div>
          </div>
        </div>

        {/* Row 2: Script preview */}
        {scriptPreview && (
          <div className="mt-3 ml-12 p-3 rounded-xl bg-[#09090b] border border-white/[0.05] flex items-start gap-2">
            <BookOpen size={11} className="text-zinc-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 italic">
              "{scriptPreview}"
            </p>
          </div>
        )}

        {/* Row 3: Metrics */}
        <div className="mt-3 ml-12 flex items-center gap-3 flex-wrap">
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${scoreColor(parseFloat(acc))}`}>
            {acc}{t('sessionCard.accuracySuffix')}
          </span>
          <span className="text-[11px] text-zinc-600 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            {rhy}{t('sessionCard.rhythmSuffix')}
          </span>
          <span className="text-[11px] text-zinc-600 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Zap size={10} className="text-zinc-600" />{wpm} WPM
          </span>
        </div>

      </SpotlightCard>
    </Link>
  );
};

export default SessionCard;

import { useTranslation } from "react-i18next";
import { FileText, Target, Award, ListChecks, Info, Video } from "lucide-react";

export default function LessonInfoPanel({ lesson }) {
  const { t } = useTranslation();
  if (!lesson) return null;
  return (
    <div className="mb-5 rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {(lesson.thumbnailUrl || lesson.videoUrl) && (
          <div className="lg:w-72 shrink-0">
            {lesson.videoUrl ? (
              <div className="relative w-full aspect-video bg-black">
                <video
                  src={lesson.videoUrl}
                  controls
                  poster={lesson.thumbnailUrl || undefined}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/70 text-[#f5a623] border border-[#f5a623]/30">
                  <Video size={10} /> {t("voicePractice.lessonInfoSampleVideo")}
                </span>
              </div>
            ) : (
              <img
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                className="w-full h-full object-cover aspect-video lg:aspect-auto lg:h-full"
              />
            )}
          </div>
        )}

        <div className="flex-1 p-5 space-y-4">
          {lesson.description && (
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                <FileText size={12} /> {t("voicePractice.lessonInfoDescription")}
              </p>
              <p className="text-[14px] text-zinc-300 leading-relaxed">{lesson.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {(lesson.targetWpmMin || lesson.targetWpmMax) && (
              <div className="flex items-start gap-2">
                <Target size={14} className="text-[#f5a623] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-zinc-600 uppercase tracking-wider">{t("voicePractice.lessonInfoTargetPace")}</p>
                  <p className="text-[14px] font-semibold text-white">
                    {lesson.targetWpmMin}–{lesson.targetWpmMax}{" "}
                    <span className="text-zinc-500 font-normal text-[12px]">wpm</span>
                  </p>
                </div>
              </div>
            )}
            {lesson.passingScore > 0 && (
              <div className="flex items-start gap-2">
                <Award size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-zinc-600 uppercase tracking-wider">{t("voicePractice.lessonInfoPassingScore")}</p>
                  <p className="text-[14px] font-semibold text-white">
                    {lesson.passingScore}<span className="text-zinc-500 font-normal text-[12px]">%</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {lesson.evaluationCriteria?.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                <ListChecks size={12} /> {t("voicePractice.lessonInfoEvalCriteria")}
              </p>
              <div className="flex flex-wrap gap-2">
                {lesson.evaluationCriteria.map((c, i) => (
                  <div key={i} className="group relative">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:border-[#f5a623]/30 transition-colors cursor-default">
                      <span className="text-[12px] font-medium text-zinc-300">{c.aspect}</span>
                      <span className="text-[11px] text-[#f5a623] font-semibold">{c.weight}%</span>
                    </div>
                    {c.description && (
                      <div className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-56 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                        <span className="font-semibold text-white">{c.aspect} ({c.weight}%)</span>
                        <br />{c.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {lesson.evaluationHint && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#f5a623]/[0.05] border border-[#f5a623]/15">
              <Info size={13} className="text-[#f5a623] mt-0.5 shrink-0" />
              <p className="text-[12px] text-zinc-400 leading-relaxed">{lesson.evaluationHint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

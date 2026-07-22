import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Mic2, Loader2, User } from "lucide-react";
import { usePitchContourFromUrl } from "../../hooks/usePitchContourFromUrl";

const PITCH_MIN_HZ = 70;
const PITCH_MAX_HZ = 500;

function contourToPath(contour, width, height) {
  if (!contour || !contour.length) return "";
  const n = contour.length;
  const points = contour.map((hz, i) => {
    const x = (i / (n - 1 || 1)) * width;
    const clamped = Math.max(PITCH_MIN_HZ, Math.min(PITCH_MAX_HZ, hz || PITCH_MIN_HZ));
    const y = height - ((clamped - PITCH_MIN_HZ) / (PITCH_MAX_HZ - PITCH_MIN_HZ)) * height;
    return { x, y, voiced: hz > 0 };
  });
  // Break the path at unvoiced gaps instead of drawing a line through silence.
  let d = "";
  let drawing = false;
  for (const p of points) {
    if (!p.voiced) { drawing = false; continue; }
    d += (drawing ? " L " : " M ") + p.x.toFixed(1) + " " + p.y.toFixed(1);
    drawing = true;
  }
  return d;
}

/**
 * Overlays the user's recorded pitch contour against a lesson's professional
 * MC reference sample, both decoded and analyzed client-side (no AI service
 * round-trip). Purely visual comparison — not a scoring input.
 */
export default function SampleComparisonCard({ userAudioUrl, sampleAudioUrl }) {
  const { t } = useTranslation();
  const { contour: userContour, loading: userLoading } = usePitchContourFromUrl(userAudioUrl);
  const { contour: sampleContour, loading: sampleLoading } = usePitchContourFromUrl(sampleAudioUrl);

  const width = 600, height = 120;
  const userPath = useMemo(() => contourToPath(userContour, width, height), [userContour]);
  const samplePath = useMemo(() => contourToPath(sampleContour, width, height), [sampleContour]);

  if (!sampleAudioUrl) return null;

  return (
    <div className="rounded-md border border-white/[0.07] bg-[#111113] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-white">{t("voicePractice.sampleComparisonTitle")}</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-blue-400"><User size={11} /> {t("voicePractice.sampleComparisonYou")}</span>
          <span className="flex items-center gap-1 text-gold"><Mic2 size={11} /> {t("voicePractice.sampleComparisonMcSample")}</span>
        </div>
      </div>

      {(userLoading || sampleLoading) ? (
        <div className="flex items-center justify-center h-[120px] text-zinc-500 text-[12px] gap-2">
          <Loader2 size={14} className="animate-spin" /> {t("voicePractice.sampleComparisonAnalyzing")}
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[120px]" preserveAspectRatio="none">
          <path d={samplePath} fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <path d={userPath} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        </svg>
      )}

      <p className="text-[10px] text-zinc-500 mt-2">
        {t("voicePractice.sampleComparisonNote")}
      </p>
    </div>
  );
}

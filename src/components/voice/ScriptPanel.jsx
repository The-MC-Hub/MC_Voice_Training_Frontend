import React from "react";
import { BookOpen, Minus, Plus, AlignLeft, AlignCenter, AlignRight, Gauge, Play, Square } from "lucide-react";

const HIGHLIGHT_COLORS = [
  { id: "yellow", bg: "rgba(253,224,71,0.45)", border: "#fde047" },
  { id: "green", bg: "rgba(134,239,172,0.40)", border: "#86efac" },
  { id: "blue", bg: "rgba(147,197,253,0.40)", border: "#93c5fd" },
  { id: "pink", bg: "rgba(249,168,212,0.40)", border: "#f9a8d4" },
  { id: "orange", bg: "rgba(253,186,116,0.40)", border: "#fdba74" },
];

const BG_MAP = { cream: "#faf8f3", white: "#ffffff", sepia: "#f5ecd7", dark: "#1a1a1e" };
const TEXT_MAP = { cream: "#292524", white: "#1c1917", sepia: "#44321a", dark: "#e4e4e7" };
const SUB_TEXT_MAP = { cream: "#78716c", white: "#71717a", sepia: "#92400e", dark: "#71717a" };
const FONT_MAP = {
  serif: '"Noto Serif", "Times New Roman", serif',
  sans: '"Be Vietnam Pro", Inter, system-ui, sans-serif',
  mono: '"Noto Sans Mono", "Courier New", monospace',
};

function renderInlineMarkdown(text) {
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
    if (m[0].startsWith("**")) parts.push(<strong key={m.index} style={{ fontWeight: 700, color: "inherit" }}>{m[2]}</strong>);
    else if (m[0].startsWith("*")) parts.push(<em key={m.index} style={{ fontStyle: "italic" }}>{m[3]}</em>);
    else if (m[0].startsWith("`")) parts.push(<code key={m.index} style={{ fontFamily: "monospace", background: "rgba(245,166,35,0.12)", padding: "0 3px", borderRadius: 3 }}>{m[4]}</code>);
    else if (m[0].startsWith("~~")) parts.push(<s key={m.index}>{m[5]}</s>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}

// Simple pre-record script: full toolbar (font, size, align, bg, teleprompter) — no annotations
export function SimpleScriptPanel({
  lesson,
  scriptFontSize, setScriptFontSize,
  scriptAlign, setScriptAlign,
  scriptFont, setScriptFont,
  scriptBg, setScriptBg,
  teleprompter, setTeleprompter,
  teleprompterWpm, setTeleprompterWpm,
  teleprompterRunning, setTeleprompterRunning,
  scriptScrollRef,
}) {
  // Fallback local state when props not provided (standalone usage)
  const [localSize, setLocalSize] = React.useState(22);
  const [localAlign, setLocalAlign] = React.useState("center");
  const [localFont, setLocalFont] = React.useState("serif");
  const [localBg, setLocalBg] = React.useState("cream");
  const [localTeleprompter, setLocalTeleprompter] = React.useState(false);
  const [localWpm, setLocalWpm] = React.useState(130);
  const [localRunning, setLocalRunning] = React.useState(false);
  const localScrollRef = React.useRef(null);
  const teleprompterRef = React.useRef(null);

  const fSize = scriptFontSize ?? localSize;
  const setFSize = setScriptFontSize ?? setLocalSize;
  const fAlign = scriptAlign ?? localAlign;
  const setFAlign = setScriptAlign ?? setLocalAlign;
  const fFont = scriptFont ?? localFont;
  const setFFont = setScriptFont ?? setLocalFont;
  const fBg = scriptBg ?? localBg;
  const setFBg = setScriptBg ?? setLocalBg;
  const tp = teleprompter ?? localTeleprompter;
  const setTp = setTeleprompter ?? setLocalTeleprompter;
  const tpWpm = teleprompterWpm ?? localWpm;
  const setTpWpm = setTeleprompterWpm ?? setLocalWpm;
  const tpRunning = teleprompterRunning ?? localRunning;
  const setTpRunning = setTeleprompterRunning ?? setLocalRunning;
  const scrollRef = scriptScrollRef ?? localScrollRef;

  // Teleprompter auto-scroll
  React.useEffect(() => {
    if (!tpRunning || !tp) return;
    const msPerWord = 60000 / tpWpm;
    const avgWordLen = 5;
    const pxPerMs = (fSize * 1.7) / (msPerWord * avgWordLen);
    const tick = 16;
    const id = setInterval(() => {
      if (scrollRef.current) scrollRef.current.scrollTop += pxPerMs * tick;
    }, tick);
    return () => clearInterval(id);
  }, [tpRunning, tp, tpWpm, fSize, scrollRef]);

  if (!lesson) return null;

  const bg = BG_MAP[fBg];
  const textColor = TEXT_MAP[fBg];
  const subColor = SUB_TEXT_MAP[fBg];

  const renderContent = () => {
    if (!lesson.content) return <p style={{ color: "#71717a", fontSize: "14px" }}>Không có kịch bản</p>;
    return lesson.content.split("\n").map((line, i) => {
      const h = line.match(/^#{1,3}\s+(.+)$/);
      if (h) return <p key={i} style={{ fontWeight: 700, fontSize: `${Math.round(fSize * 0.72)}px`, letterSpacing: "0.06em", textTransform: "uppercase", color: subColor, margin: "1.5rem 0 0.5rem", textAlign: "center" }}>{h[1]}</p>;
      if (!line.trim()) return <br key={i} />;
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return <p key={i} style={{ marginBottom: "0.25rem" }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
    });
  };

  return (
    <div className="flex-1 rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07] bg-[#0d0d0f] gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => setFSize(s => Math.max(14, s - 2))} className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"><Minus size={12} /></button>
          <span className="text-[11px] text-zinc-500 w-8 text-center font-mono">{fSize}px</span>
          <button onClick={() => setFSize(s => Math.min(48, s + 2))} className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"><Plus size={12} /></button>
        </div>

        <div className="flex items-center gap-0.5 bg-[#111113] border border-white/[0.07] rounded-lg p-0.5">
          {[["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]].map(([v, Icon]) => (
            <button key={v} onClick={() => setFAlign(v)} className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${fAlign === v ? "bg-gold/20 text-gold" : "text-zinc-500 hover:text-white"}`}><Icon size={12} /></button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 bg-[#111113] border border-white/[0.07] rounded-lg p-0.5">
          {[["serif", "S"], ["sans", "A"], ["mono", "M"]].map(([v, label]) => (
            <button key={v} onClick={() => setFFont(v)} className={`px-2 h-6 text-[11px] font-medium rounded transition-colors ${fFont === v ? "bg-gold/20 text-gold" : "text-zinc-500 hover:text-white"}`}>{label}</button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {[{ v: "cream", bg: "#faf8f3", ring: "ring-amber-400" }, { v: "white", bg: "#ffffff", ring: "ring-zinc-300" }, { v: "sepia", bg: "#f5ecd7", ring: "ring-amber-600" }, { v: "dark", bg: "#1a1a1e", ring: "ring-zinc-600" }].map(({ v, bg: btnBg, ring }) => (
            <button key={v} onClick={() => setFBg(v)} style={{ background: btnBg }} className={`w-5 h-5 rounded-full border border-white/20 transition-all ${fBg === v ? `ring-2 ring-offset-1 ring-offset-[#0d0d0f] ${ring}` : ""}`} />
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {tp && (
            <div className="flex items-center gap-1">
              <Gauge size={11} className="text-zinc-600" />
              <button onClick={() => setTpWpm(w => Math.max(60, w - 10))} className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"><Minus size={10} /></button>
              <span className="text-[11px] text-zinc-500 w-10 text-center font-mono">{tpWpm}</span>
              <button onClick={() => setTpWpm(w => Math.min(250, w + 10))} className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"><Plus size={10} /></button>
              <button
                onClick={() => {
                  if (tpRunning) { setTpRunning(false); }
                  else { if (scrollRef.current) scrollRef.current.scrollTop = 0; setTpRunning(true); }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${tpRunning ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"}`}
              >
                {tpRunning ? <><Square size={10} /> Dừng</> : <><Play size={10} /> Chạy</>}
              </button>
            </div>
          )}
          <button
            onClick={() => { setTp(v => !v); setTpRunning(false); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${tp ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "text-zinc-500 border-white/[0.07] hover:text-white hover:border-white/20"}`}
          >
            <Gauge size={11} /> Teleprompter
          </button>
        </div>
      </div>

      {/* Script */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-6"
        style={{ background: bg, scrollbarWidth: "thin", scrollbarColor: `${subColor}40 transparent` }}
      >
        <h3 style={{ color: subColor, textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          Kịch bản luyện tập
        </h3>
        <div style={{ fontFamily: FONT_MAP[fFont], fontSize: `${fSize}px`, color: textColor, textAlign: fAlign, lineHeight: 1.8 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Full annotatable script panel (post-record)
export default function ScriptPanel({
  lesson,
  scriptFontSize, setScriptFontSize,
  scriptAlign, setScriptAlign,
  scriptFont, setScriptFont,
  scriptBg, setScriptBg,
  teleprompter, setTeleprompter,
  teleprompterWpm, setTeleprompterWpm,
  teleprompterRunning, setTeleprompterRunning,
  scriptScrollRef,
  annotations, setAnnotations,
  annotationPopup, setAnnotationPopup,
  noteInput, setNoteInput,
  showNoteInput, setShowNoteInput,
  hoveredAnnotation, setHoveredAnnotation,
  annotationPopupRef,
  t, t_vp,
}) {
  if (!lesson) return null;

  const bg = BG_MAP[scriptBg];
  const textColor = TEXT_MAP[scriptBg];
  const subColor = SUB_TEXT_MAP[scriptBg];

  const plainScript = lesson?.content?.replace(/^\[(.+?)\]\s*$/gm, "\n[$1]\n") || "";

  const handleScriptMouseUp = (e) => {
    if (annotationPopupRef.current?.contains(e.target)) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      if (!annotationPopupRef.current?.contains(e.target)) setAnnotationPopup(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const container = scriptScrollRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) return;
    const selectedText = sel.toString().trim();
    if (selectedText.length < 2) return;
    const startOffset = plainScript.indexOf(selectedText);
    if (startOffset === -1) return;
    const endOffset = startOffset + selectedText.length;
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setAnnotationPopup({ x: rect.left - containerRect.left + rect.width / 2, y: rect.top - containerRect.top - 8, selectedText, startOffset, endOffset });
    setShowNoteInput(false);
    setNoteInput("");
  };

  const addAnnotation = (type, color) => {
    if (!annotationPopup) return;
    const id = Date.now().toString();
    setAnnotations((prev) => [...prev, { id, startOffset: annotationPopup.startOffset, endOffset: annotationPopup.endOffset, text: annotationPopup.selectedText, type, color: color || "yellow", note: type === "note" ? noteInput : "" }]);
    setAnnotationPopup(null);
    setNoteInput("");
    setShowNoteInput(false);
    window.getSelection()?.removeAllRanges();
  };

  const removeAnnotation = (id) => setAnnotations((prev) => prev.filter((a) => a.id !== id));

  const overlapsAnnotation = annotationPopup
    ? annotations.some((a) => annotationPopup.startOffset < a.endOffset && annotationPopup.endOffset > a.startOffset)
    : false;

  const renderAnnotatedScript = () => {
    if (!plainScript) return null;
    const sorted = [...annotations].sort((a, b) => a.startOffset - b.startOffset);
    const segments = [];
    let cursor = 0;
    for (const ann of sorted) {
      if (ann.startOffset > cursor) segments.push({ type: "text", content: plainScript.slice(cursor, ann.startOffset) });
      const start = Math.max(ann.startOffset, cursor);
      const end = ann.endOffset;
      if (start < end) { segments.push({ type: "annotation", ann, content: plainScript.slice(start, end) }); cursor = end; }
    }
    if (cursor < plainScript.length) segments.push({ type: "text", content: plainScript.slice(cursor) });

    return segments.map((seg, i) => {
      if (seg.type === "text") {
        return seg.content.split("\n").map((line, li) => {
          const bracketHeading = line.match(/^\[(.+?)\]$/);
          if (bracketHeading) return (
            <React.Fragment key={`${i}-${li}`}>
              {li > 0 && <br />}
              <span style={{ display: "block", textAlign: "center", fontSize: `${Math.round(scriptFontSize * 0.75)}px`, fontWeight: 700, letterSpacing: "0.05em", color: subColor, marginTop: "1.5rem" }}>{bracketHeading[1]}</span>
            </React.Fragment>
          );
          const h3 = line.match(/^###\s+(.+)$/);
          const h2 = line.match(/^##\s+(.+)$/);
          const h1 = line.match(/^#\s+(.+)$/);
          if (h3) return <React.Fragment key={`${i}-${li}`}>{li > 0 && <br />}<span style={{ display: "block", fontSize: `${Math.round(scriptFontSize * 0.8)}px`, fontWeight: 700, color: subColor, marginTop: "1rem", letterSpacing: "0.02em" }}>{renderInlineMarkdown(h3[1])}</span></React.Fragment>;
          if (h2) return <React.Fragment key={`${i}-${li}`}>{li > 0 && <br />}<span style={{ display: "block", textAlign: "center", fontSize: `${Math.round(scriptFontSize * 0.9)}px`, fontWeight: 700, color: subColor, marginTop: "1.5rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>{renderInlineMarkdown(h2[1])}</span></React.Fragment>;
          if (h1) return <React.Fragment key={`${i}-${li}`}>{li > 0 && <br />}<span style={{ display: "block", textAlign: "center", fontSize: `${Math.round(scriptFontSize * 1.1)}px`, fontWeight: 800, color: subColor, marginTop: "2rem", letterSpacing: "0.05em" }}>{renderInlineMarkdown(h1[1])}</span></React.Fragment>;
          if (/^---+$/.test(line.trim())) return <React.Fragment key={`${i}-${li}`}>{li > 0 && <br />}<hr style={{ border: "none", borderTop: `1px solid ${subColor}40`, margin: "1rem 0", display: "block" }} /></React.Fragment>;
          return <React.Fragment key={`${i}-${li}`}>{li > 0 && <br />}{renderInlineMarkdown(line)}</React.Fragment>;
        });
      }
      const { ann } = seg;
      const hlColor = HIGHLIGHT_COLORS.find((c) => c.id === ann.color) || HIGHLIGHT_COLORS[0];
      return (
        <span key={`ann-${ann.id}`}
          style={{ background: hlColor.bg, borderBottom: ann.type === "note" ? `2px solid ${hlColor.border}` : "none", borderRadius: "2px", padding: "0 1px", cursor: ann.type === "note" ? "help" : "default", position: "relative" }}
          onMouseEnter={() => ann.type === "note" && setHoveredAnnotation(ann.id)}
          onMouseLeave={() => setHoveredAnnotation(null)}
        >
          {renderInlineMarkdown(seg.content)}
          {ann.type === "note" && hoveredAnnotation === ann.id && (
            <span style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "6px", background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "8px 10px", fontSize: "11px", color: "#d4d4d8", lineHeight: 1.5, whiteSpace: "pre-wrap", maxWidth: "220px", zIndex: 60, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
              <span style={{ display: "block", fontSize: "10px", fontWeight: 700, color: hlColor.border, marginBottom: "3px" }}>📝 Ghi chú</span>
              {ann.note}
            </span>
          )}
        </span>
      );
    });
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07] bg-[#0d0d0f] gap-2 flex-wrap">
        {/* Font size */}
        <div className="flex items-center gap-1">
          <button onClick={() => setScriptFontSize((s) => Math.max(16, s - 2))} className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"><Minus size={12} /></button>
          <span className="text-[11px] text-zinc-500 w-8 text-center font-mono">{scriptFontSize}px</span>
          <button onClick={() => setScriptFontSize((s) => Math.min(48, s + 2))} className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"><Plus size={12} /></button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 bg-[#111113] border border-white/[0.07] rounded-lg p-0.5">
          {[["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]].map(([v, Icon]) => (
            <button key={v} onClick={() => setScriptAlign(v)} className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${scriptAlign === v ? "bg-gold/20 text-gold" : "text-zinc-500 hover:text-white"}`}><Icon size={12} /></button>
          ))}
        </div>

        {/* Font family */}
        <div className="flex items-center gap-0.5 bg-[#111113] border border-white/[0.07] rounded-lg p-0.5">
          {[["serif", "S"], ["sans", "A"], ["mono", "M"]].map(([v, label]) => (
            <button key={v} onClick={() => setScriptFont(v)} className={`px-2 h-6 text-[11px] font-medium rounded transition-colors ${scriptFont === v ? "bg-gold/20 text-gold" : "text-zinc-500 hover:text-white"}`}>{label}</button>
          ))}
        </div>

        {/* Background */}
        <div className="flex items-center gap-1">
          {[{ v: "cream", bg: "#faf8f3", ring: "ring-amber-400" }, { v: "white", bg: "#ffffff", ring: "ring-zinc-300" }, { v: "sepia", bg: "#f5ecd7", ring: "ring-amber-600" }, { v: "dark", bg: "#1a1a1e", ring: "ring-zinc-600" }].map(({ v, bg: btnBg, ring }) => (
            <button key={v} onClick={() => setScriptBg(v)} style={{ background: btnBg }} className={`w-5 h-5 rounded-full border border-white/20 transition-all ${scriptBg === v ? `ring-2 ring-offset-1 ring-offset-[#0d0d0f] ${ring}` : ""}`} />
          ))}
        </div>

        {/* Teleprompter */}
        <div className="flex items-center gap-1.5 ml-auto">
          {teleprompter && (
            <div className="flex items-center gap-1">
              <Gauge size={11} className="text-zinc-600" />
              <button onClick={() => setTeleprompterWpm((w) => Math.max(60, w - 10))} className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"><Minus size={10} /></button>
              <span className="text-[11px] text-zinc-500 w-10 text-center font-mono">{teleprompterWpm}</span>
              <button onClick={() => setTeleprompterWpm((w) => Math.min(250, w + 10))} className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"><Plus size={10} /></button>
              <button
                onClick={() => {
                  if (teleprompterRunning) { setTeleprompterRunning(false); }
                  else { if (scriptScrollRef.current) scriptScrollRef.current.scrollTop = 0; setTeleprompterRunning(true); }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${teleprompterRunning ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"}`}
              >
                {teleprompterRunning ? <><Square size={10} /> Dừng</> : <><Play size={10} /> Chạy</>}
              </button>
            </div>
          )}
          <button
            onClick={() => { setTeleprompter((t) => !t); setTeleprompterRunning(false); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${teleprompter ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "text-zinc-500 border-white/[0.07] hover:text-white hover:border-white/20"}`}
          >
            <Gauge size={11} /> Teleprompter
          </button>
        </div>
      </div>

      {/* Script content */}
      <div style={{ position: "relative" }}>
        {/* Annotation popup */}
        {annotationPopup && (
          <div
            ref={annotationPopupRef}
            style={{ position: "absolute", left: `${annotationPopup.x}px`, top: `${annotationPopup.y}px`, transform: "translate(-50%, -100%)", zIndex: 100, background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "8px 10px", display: "flex", flexDirection: "column", gap: "6px", boxShadow: "0 12px 32px rgba(0,0,0,0.5)", minWidth: showNoteInput ? "220px" : "auto" }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {HIGHLIGHT_COLORS.map((c) => (
                <button key={c.id} title={`Highlight ${c.id}`} onClick={() => addAnnotation("highlight", c.id)}
                  style={{ width: 18, height: 18, borderRadius: "50%", background: c.bg, border: `2px solid ${c.border}`, cursor: "pointer", flexShrink: 0 }}
                />
              ))}
              <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />
              <button onClick={() => setShowNoteInput((v) => !v)} title="Thêm ghi chú"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 7px", borderRadius: "6px", background: showNoteInput ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${showNoteInput ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.1)"}`, color: showNoteInput ? "#f5a623" : "#a1a1aa", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
              >
                📝 Ghi chú
              </button>
              {overlapsAnnotation && (
                <button
                  onClick={() => {
                    const toRemove = annotations.filter((a) => annotationPopup.startOffset < a.endOffset && annotationPopup.endOffset > a.startOffset);
                    toRemove.forEach((a) => removeAnnotation(a.id));
                    setAnnotationPopup(null);
                  }}
                  title="Xóa highlight/ghi chú"
                  style={{ padding: "2px 7px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  ✕ Xóa
                </button>
              )}
              <button onClick={() => { setAnnotationPopup(null); window.getSelection()?.removeAllRanges(); }}
                style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#71717a", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >×</button>
            </div>
            {showNoteInput && (
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <textarea
                  autoFocus value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Nhập ghi chú..." rows={3}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 8px", color: "#e4e4e7", fontSize: "12px", resize: "none", outline: "none", fontFamily: "inherit" }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (noteInput.trim()) addAnnotation("note", "yellow"); } }}
                />
                <div style={{ display: "flex", gap: "4px" }}>
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button key={c.id} onClick={() => addAnnotation("note", c.id)}
                      style={{ flex: 1, padding: "4px 0", borderRadius: "6px", background: c.bg, border: `1px solid ${c.border}`, color: "#292524", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}
                    >{c.id[0].toUpperCase()}</button>
                  ))}
                </div>
                <p style={{ fontSize: "10px", color: "#52525b" }}>Enter để lưu · Shift+Enter xuống dòng</p>
              </div>
            )}
          </div>
        )}

        <div
          ref={scriptScrollRef}
          className="max-h-[70vh] overflow-y-auto px-8 py-8 select-text"
          style={{ background: bg, scrollbarWidth: "thin", position: "relative" }}
          onMouseUp={handleScriptMouseUp}
          onClick={(e) => {
            if (!annotationPopupRef.current?.contains(e.target) && !e.target.closest("[data-annotation]")) {
              const sel = window.getSelection();
              if (!sel || sel.isCollapsed) setAnnotationPopup(null);
            }
          }}
        >
          <h3 style={{ color: subColor, textAlign: "center", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {t_vp("practiceScript")}
          </h3>
          <div style={{ fontFamily: FONT_MAP[scriptFont], fontSize: `${scriptFontSize}px`, color: textColor, textAlign: scriptAlign, lineHeight: 1.7 }}>
            {renderAnnotatedScript()}
          </div>
          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "14px", fontStyle: "italic", color: subColor }}>
            — {t("endOfScript")} —
          </p>
        </div>
      </div>
    </div>
  );
}

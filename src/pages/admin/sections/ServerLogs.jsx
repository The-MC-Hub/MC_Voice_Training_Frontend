import React, { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Trash2, Pause, Play, Download, Filter } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const LEVEL_STYLE = {
  ERROR: "text-red-400 bg-[--bg-elevated]0/10 border-red-500/20",
  WARN:  "text-amber-400 bg-gold/100/10 border-amber-500/20",
  INFO:  "text-[--text-primary] bg-[--bg-elevated]0/10 border-blue-500/20",
  DEBUG: "text-zinc-500 bg-zinc-500/5 border-zinc-500/10",
};

const SOURCE_STYLE = {
  JAVA: "text-emerald-400",
  AI:   "text-purple-400",
};

const fmt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("vi-VN", { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
};

const LogLine = React.memo(({ log }) => (
  <div className={`flex items-start gap-3 px-4 py-1.5 border-b border-white/[0.03] font-mono text-[11px] hover:bg-white/[0.02] transition-colors`}>
    <span className="text-zinc-600 shrink-0 w-[80px]">{fmt(log.timestamp)}</span>
    <span className={`shrink-0 w-[14px] font-bold ${SOURCE_STYLE[log.source] || "text-zinc-500"}`}>
      {log.source === "AI" ? "AI" : "JV"}
    </span>
    <span className={`shrink-0 px-1.5 py-0 border text-[10px] font-semibold uppercase ${LEVEL_STYLE[log.level] || "text-zinc-400"}`}>
      {log.level?.slice(0, 4)}
    </span>
    <span className="text-zinc-500 shrink-0 w-[140px] truncate hidden md:block">{log.logger}</span>
    <span className="text-zinc-200 flex-1 break-all leading-relaxed">{log.message}</span>
  </div>
));

const LEVELS = ["ALL", "DEBUG", "INFO", "WARN", "ERROR"];
const SOURCES = ["ALL", "JAVA", "AI"];

const ServerLogs = () => {
  const [logs, setLogs]         = useState([]);
  const [paused, setPaused]     = useState(false);
  const [filterLevel, setLevel] = useState("ALL");
  const [filterSrc, setSrc]     = useState("ALL");
  const [connected, setConn]    = useState(false);
  const [liveCount, setLive]    = useState(0);

  const bottomRef   = useRef(null);
  const pauseRef    = useRef(false);
  const esRef       = useRef(null);
  const bufRef      = useRef([]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!paused) scrollToBottom();
  }, [logs, paused]);

  // SSE connection
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    const url = `${BASE_URL}/admin/logs/stream?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("log", (e) => {
      try {
        const entry = JSON.parse(e.data);
        if (!pauseRef.current) {
          setLogs(prev => {
            const next = [...prev, entry];
            return next.length > 1000 ? next.slice(-1000) : next;
          });
          setLive(c => c + 1);
        } else {
          bufRef.current.push(entry);
        }
      } catch {}
    });

    es.onopen  = () => setConn(true);
    es.onerror = () => setConn(false);

    return () => es.close();
  }, []);

  const togglePause = () => {
    const next = !paused;
    pauseRef.current = next;
    setPaused(next);
    if (!next && bufRef.current.length > 0) {
      setLogs(prev => {
        const combined = [...prev, ...bufRef.current];
        bufRef.current = [];
        return combined.length > 1000 ? combined.slice(-1000) : combined;
      });
    }
  };

  const clear = () => { setLogs([]); bufRef.current = []; setLive(0); };

  const download = () => {
    const text = filtered.map(l =>
      `[${l.timestamp}] [${l.source}] ${l.level} ${l.logger} — ${l.message}`
    ).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `system-logs-${Date.now()}.txt`;
    a.click();
  };

  const filtered = logs.filter(l => {
    if (filterLevel !== "ALL" && l.level !== filterLevel) return false;
    if (filterSrc   !== "ALL" && l.source !== filterSrc)  return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-base)" }}>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
          <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <span className="h-4 w-px bg-[--border-subtle]" />

        <span className="text-[12px] tabular-nums" style={{ color: "var(--text-muted)" }}>
          {filtered.length} / {logs.length} entries
        </span>

        {/* Level filter */}
        <div className="flex items-center gap-1 ml-auto">
          <Filter size={12} style={{ color: "var(--text-muted)" }} />
          <div className="flex gap-0.5">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-2 py-0.5 text-[10px] font-medium transition-all ${
                  filterLevel === l
                    ? "bg-[gold] text-black"
                    : "text-[--text-muted] hover:text-[--text-primary]"
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Source filter */}
        <div className="flex gap-0.5 border-l pl-3" style={{ borderColor: "var(--border-subtle)" }}>
          {SOURCES.map(s => (
            <button key={s} onClick={() => setSrc(s)}
              className={`px-2 py-0.5 text-[10px] font-medium transition-all ${
                filterSrc === s
                  ? "bg-[gold] text-black"
                  : "text-[--text-muted] hover:text-[--text-primary]"
              }`}>
              {s}
            </button>
          ))}
        </div>

        <span className="h-4 w-px bg-[--border-subtle]" />

        {/* Actions */}
        <button onClick={togglePause} title={paused ? "Resume" : "Pause"}
          className="flex items-center gap-1.5 px-2.5 py-1 border text-[11px] transition-all hover:opacity-80"
          style={{ borderColor: "var(--border-subtle)", color: paused ? "gold" : "var(--text-muted)" }}>
          {paused ? <Play size={12} /> : <Pause size={12} />}
          {paused ? `Resume (${bufRef.current.length})` : "Pause"}
        </button>

        <button onClick={download} title="Download logs"
          className="p-1.5 border transition-all hover:opacity-80"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
          <Download size={13} />
        </button>

        <button onClick={clear} title="Clear"
          className="p-1.5 border transition-all hover:opacity-80"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* ── Column headers ───────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-1.5 border-b font-mono text-[10px] uppercase tracking-wider"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)", background: "var(--bg-surface)" }}>
        <span className="w-[80px]">Time</span>
        <span className="w-[14px]">Src</span>
        <span className="w-[44px]">Level</span>
        <span className="w-[140px] hidden md:block">Logger</span>
        <span className="flex-1">Message</span>
      </div>

      {/* ── Log lines ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#0a0a0c" }}>
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[13px]" style={{ color: "var(--text-muted)" }}>
            <div className="text-center space-y-2">
              <Activity size={32} className="mx-auto opacity-20" />
              <p>Waiting for logs…</p>
            </div>
          </div>
        ) : (
          filtered.map((log, i) => <LogLine key={i} log={log} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ServerLogs;

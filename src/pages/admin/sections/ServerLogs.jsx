import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Activity, Trash2, Pause, Play, Download, Filter, Search, X,
  Loader2, AlertCircle, CheckCircle, Layers, ChevronRight,
  ExternalLink, Zap, Bookmark, BookmarkCheck, StickyNote, Bell,
  BellOff, User, BarChart2, Upload, Eye, Copy, Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const API_ROOT = BASE_URL.replace(/\/api\/v1$/, "");
const LS_BOOKMARKS = "srv_log_bookmarks";
const LS_WATCHLIST = "srv_log_watchlist";
const LS_NOTIF     = "srv_log_notif";

// ── Styles ──────────────────────────────────────────────────────────────────

const LEVEL_STYLE = {
  ERROR: "text-red-600 border-red-300",
  WARN:  "text-amber-600 border-amber-300",
  INFO:  "text-blue-600 border-blue-300",
  DEBUG: "text-gray-400 border-gray-200",
};
const LEVEL_BADGE = {
  ERROR: "bg-red-50 text-red-600 border border-red-200",
  WARN:  "bg-amber-50 text-amber-600 border border-amber-200",
  INFO:  "bg-blue-50 text-blue-600 border border-blue-200",
  DEBUG: "bg-gray-50 text-gray-500 border border-gray-200",
};
const SOURCE_STYLE = { JAVA: "text-emerald-600", AI: "text-purple-600" };

const fmt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("vi-VN", { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
};
const fmtFull = (ts) => {
  if (!ts) return "";
  return new Date(ts).toISOString().replace("T", " ").replace("Z", " UTC");
};

// ── Pattern detection ───────────────────────────────────────────────────────

const URL_SRC  = /(https?:\/\/[^\s"']+|\/api\/v1\/[^\s"']+)/g;
const OID_SRC  = /\b[0-9a-f]{24}\b/g;
const DUR_SRC  = /\b\d+ms\b/g;
const HTTP_SRC = /\b([2][0-9]{2}|[3][0-9]{2}|[4][0-9]{2}|[5][0-9]{2})\b/g;

function extractUrls(msg) {
  const out = [];
  let m;
  const r = new RegExp(URL_SRC.source, "g");
  while ((m = r.exec(msg)) !== null) out.push(m[0]);
  return [...new Set(out)];
}

function extractOids(msg) {
  const out = [];
  let m;
  const r = new RegExp(OID_SRC.source, "g");
  while ((m = r.exec(msg)) !== null) out.push(m[0]);
  return [...new Set(out)];
}

function inferMethod(msg, url) {
  const before = msg.slice(0, msg.indexOf(url));
  for (const method of ["DELETE", "PUT", "PATCH", "POST", "GET"]) {
    if (before.toUpperCase().includes(method)) return method;
  }
  return "GET";
}

// ── JWT decoder (client-side, no signature verify) ──────────────────────────

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}

// ── LS helpers ───────────────────────────────────────────────────────────────

function lsGet(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── makeLogKey — stable identity for a log entry ─────────────────────────────

function makeLogKey(log) {
  return `${log.timestamp}|${log.level}|${(log.message || "").slice(0, 60)}`;
}

// ── HighlightedMessage ──────────────────────────────────────────────────────

function HighlightedMessage({ msg, search, watchlist = [] }) {
  if (!msg) return null;

  // watchlist highlight (red bg)
  for (const kw of watchlist) {
    if (kw && msg.toLowerCase().includes(kw.toLowerCase())) {
      const idx = msg.toLowerCase().indexOf(kw.toLowerCase());
      return (
        <>
          <HighlightedMessage msg={msg.slice(0, idx)} search={search} watchlist={[]} />
          <mark className="bg-red-100 text-red-700 rounded-sm font-semibold">{msg.slice(idx, idx + kw.length)}</mark>
          <HighlightedMessage msg={msg.slice(idx + kw.length)} search={search} watchlist={watchlist} />
        </>
      );
    }
  }

  if (search) {
    const idx = msg.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return <span>{msg}</span>;
    return (
      <>
        {msg.slice(0, idx)}
        <mark className="bg-amber-200 rounded-sm">{msg.slice(idx, idx + search.length)}</mark>
        <HighlightedMessage msg={msg.slice(idx + search.length)} search={search} watchlist={[]} />
      </>
    );
  }

  const tokens = [];
  const addMatches = (reSrc, type) => {
    let m;
    const r = new RegExp(reSrc.source, "g");
    while ((m = r.exec(msg)) !== null)
      tokens.push({ start: m.index, end: m.index + m[0].length, text: m[0], type });
  };
  addMatches(HTTP_SRC, "http");
  addMatches(OID_SRC,  "oid");
  addMatches(DUR_SRC,  "dur");
  addMatches(URL_SRC,  "url");
  tokens.sort((a, b) => a.start - b.start);

  const merged = [];
  for (const t of tokens) {
    if (merged.length && t.start < merged[merged.length - 1].end) continue;
    merged.push(t);
  }

  const parts = [];
  let last = 0;
  for (const t of merged) {
    if (t.start > last) parts.push(<span key={last}>{msg.slice(last, t.start)}</span>);
    if (t.type === "http") {
      const code = parseInt(t.text);
      const cls = code >= 500 ? "text-red-500 font-semibold" : code >= 400 ? "text-amber-500 font-semibold" : "text-emerald-600 font-semibold";
      parts.push(<span key={t.start} className={cls}>{t.text}</span>);
    } else if (t.type === "oid") {
      parts.push(<span key={t.start} className="bg-purple-50 text-purple-600 rounded px-0.5">{t.text}</span>);
    } else if (t.type === "dur") {
      parts.push(<span key={t.start} className="text-amber-500 font-semibold">{t.text}</span>);
    } else if (t.type === "url") {
      parts.push(<span key={t.start} className="text-blue-500 underline decoration-dotted">{t.text}</span>);
    }
    last = t.end;
  }
  if (last < msg.length) parts.push(<span key={last}>{msg.slice(last)}</span>);
  return <>{parts}</>;
}

// ── ApiInspector ────────────────────────────────────────────────────────────

function ApiInspector({ log }) {
  const { t } = useTranslation();
  const urls = useMemo(() => extractUrls(log.message || ""), [log.message]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const callApi = async (rawUrl) => {
    const url = rawUrl.startsWith("/") ? API_ROOT + rawUrl : rawUrl;
    const method = inferMethod(log.message, rawUrl);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    setLoading(p => ({ ...p, [rawUrl]: true }));
    const t0 = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const ms = Math.round(performance.now() - t0);
      let body;
      try { body = await res.json(); } catch { body = await res.text().catch(() => "(no body)"); }
      setResults(p => ({ ...p, [rawUrl]: { ok: res.ok, status: res.status, ms, body } }));
    } catch (err) {
      setResults(p => ({ ...p, [rawUrl]: { ok: false, status: 0, ms: 0, body: String(err) } }));
    } finally {
      setLoading(p => ({ ...p, [rawUrl]: false }));
    }
  };

  if (urls.length === 0)
    return <div className="text-[11px] text-gray-400 italic">{t("admin.serverLogs.apiInspector.noUrlsDetected")}</div>;

  return (
    <div className="space-y-3">
      {urls.map(url => {
        const result  = results[url];
        const isLoad  = loading[url];
        const method  = inferMethod(log.message, url);
        const display = url.length > 55 ? url.slice(0, 52) + "…" : url;
        return (
          <div key={url} className="border border-gray-200 rounded-md overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                method === "GET" ? "bg-blue-100 text-blue-600" :
                method === "POST" ? "bg-green-100 text-green-600" :
                method === "DELETE" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
              }`}>{method}</span>
              <span className="flex-1 text-[11px] font-mono text-gray-600 truncate" title={url}>{display}</span>
              <Button onClick={() => callApi(url)} disabled={!!isLoad}
                className="h-auto flex items-center gap-1 px-2 py-1 bg-amber-400 hover:bg-amber-500 text-black text-[10px] font-semibold rounded transition-colors disabled:opacity-50">
                {isLoad ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                {isLoad ? t("admin.serverLogs.apiInspector.calling") : t("admin.serverLogs.apiInspector.call")}
              </Button>
              <a href={url.startsWith("/") ? API_ROOT + url : url} target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"><ExternalLink size={11} /></a>
            </div>
            {result && (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {result.ok ? <CheckCircle size={12} className="text-emerald-500" /> : <AlertCircle size={12} className="text-red-500" />}
                  <span className={`text-[11px] font-bold font-mono ${
                    result.status >= 500 ? "text-red-600" : result.status >= 400 ? "text-amber-600" :
                    result.status >= 200 ? "text-emerald-600" : "text-gray-500"
                  }`}>{result.status || "ERR"}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{result.ms}ms</span>
                </div>
                <pre className="text-[10px] font-mono bg-gray-50 border border-gray-200 rounded p-2 overflow-auto max-h-[200px] text-gray-700 whitespace-pre-wrap break-all">
                  {typeof result.body === "object" ? JSON.stringify(result.body, null, 2) : String(result.body)}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── UserLookup ───────────────────────────────────────────────────────────────

function UserLookup({ log }) {
  const { t } = useTranslation();
  const oids = useMemo(() => extractOids(log.message || ""), [log.message]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  // Also try to decode JWT from log message
  const jwtInMsg = useMemo(() => {
    const m = (log.message || "").match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    return m ? m[0] : null;
  }, [log.message]);
  const jwtPayload = useMemo(() => jwtInMsg ? decodeJwt(jwtInMsg) : null, [jwtInMsg]);

  // Also decode current session JWT
  const sessionJwt = useMemo(() => {
    const t = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    return t ? decodeJwt(t) : null;
  }, []);

  const fetchUser = async (id) => {
    setLoading(p => ({ ...p, [id]: true }));
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const u = data?.data || data;
      setResults(p => ({ ...p, [id]: { ok: res.ok, user: u } }));
    } catch (err) {
      setResults(p => ({ ...p, [id]: { ok: false, user: null, err: String(err) } }));
    } finally {
      setLoading(p => ({ ...p, [id]: false }));
    }
  };

  if (oids.length === 0 && !jwtPayload)
    return <div className="text-[11px] text-gray-400 italic">{t("admin.serverLogs.userLookup.noUserIdsOrJwt")}</div>;

  return (
    <div className="space-y-4">
      {/* JWT info box */}
      {jwtPayload && (
        <div className="border border-purple-200 rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
            <User size={11} className="text-purple-500" />
            <span className="text-[11px] font-semibold text-purple-700">{t("admin.serverLogs.userLookup.jwtInLog")}</span>
          </div>
          <div className="p-3 space-y-1">
            {["sub", "email", "role", "plan", "exp"].map(k => jwtPayload[k] != null && (
              <div key={k} className="flex gap-2">
                <span className="text-[10px] text-gray-400 w-[50px] shrink-0">{k}</span>
                <span className="text-[11px] font-mono text-gray-800 break-all">
                  {k === "exp"
                    ? new Date(jwtPayload[k] * 1000).toLocaleString("vi-VN")
                    : String(jwtPayload[k])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current session info */}
      {sessionJwt && (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <User size={11} className="text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-600">{t("admin.serverLogs.userLookup.currentAdminSession")}</span>
          </div>
          <div className="p-3 space-y-1">
            {["sub", "email", "role"].map(k => sessionJwt[k] != null && (
              <div key={k} className="flex gap-2">
                <span className="text-[10px] text-gray-400 w-[50px] shrink-0">{k}</span>
                <span className="text-[11px] font-mono text-gray-700">{String(sessionJwt[k])}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OID lookup */}
      {oids.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">{t("admin.serverLogs.userLookup.objectIdsInLog")}</p>
          <div className="space-y-2">
            {oids.map(id => {
              const r = results[id];
              const isLoad = loading[id];
              return (
                <div key={id} className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="flex-1 text-[11px] font-mono text-purple-600 truncate">{id}</span>
                    <Button onClick={() => fetchUser(id)} disabled={!!isLoad}
                      className="h-auto flex items-center gap-1 px-2 py-1 bg-amber-400 hover:bg-amber-500 text-black text-[10px] font-semibold rounded disabled:opacity-50">
                      {isLoad ? <Loader2 size={10} className="animate-spin" /> : <User size={10} />}
                      {isLoad ? t("admin.serverLogs.userLookup.loading") : t("admin.serverLogs.userLookup.lookup")}
                    </Button>
                  </div>
                  {r && (
                    <div className="p-3">
                      {r.ok && r.user ? (
                        <div className="space-y-1">
                          {["fullName", "email", "role", "plan", "aiSessionsUsed", "createdAt"].map(k => r.user[k] != null && (
                            <div key={k} className="flex gap-2">
                              <span className="text-[10px] text-gray-400 w-[100px] shrink-0">{k}</span>
                              <span className="text-[11px] font-mono text-gray-800 break-all">{String(r.user[k])}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-red-500">{r.err || t("admin.serverLogs.userLookup.userNotFound")}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── NoteEditor ───────────────────────────────────────────────────────────────

function NoteEditor({ logKey, notes, onSave }) {
  const { t } = useTranslation();
  const [text, setText] = useState(notes[logKey] || "");
  const saved = notes[logKey] || "";

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={t("admin.serverLogs.noteEditor.placeholder")}
        rows={4}
        className="w-full text-[11px] font-mono border border-gray-200 rounded p-2 focus:outline-none focus:border-amber-400 resize-none"
      />
      <div className="flex items-center gap-2">
        <Button onClick={() => onSave(logKey, text)}
          className="h-auto px-3 py-1 bg-amber-400 hover:bg-amber-500 text-black text-[11px] font-semibold rounded transition-colors">
          {t("admin.serverLogs.noteEditor.saveNote")}
        </Button>
        {saved && (
          <Button onClick={() => { setText(""); onSave(logKey, ""); }}
            className="h-auto px-3 py-1 border border-gray-200 text-[11px] text-gray-500 rounded hover:bg-gray-50">
            {t("admin.serverLogs.noteEditor.clear")}
          </Button>
        )}
        {saved && <span className="text-[10px] text-emerald-600">✓ {t("admin.serverLogs.noteEditor.saved")}</span>}
      </div>
      {saved && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-gray-700 whitespace-pre-wrap">
          {saved}
        </div>
      )}
    </div>
  );
}

// ── TimelineChart ─────────────────────────────────────────────────────────────
// SVG bar chart — no lib needed

function TimelineChart({ logs }) {
  const { t } = useTranslation();
  const BUCKETS = 20;
  const data = useMemo(() => {
    if (!logs.length) return [];
    const now = Date.now();
    const span = 5 * 60 * 1000; // last 5 min
    const bucketMs = span / BUCKETS;
    const buckets = Array.from({ length: BUCKETS }, (_, i) => ({
      t: now - span + i * bucketMs,
      ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0,
    }));
    for (const l of logs) {
      const ts = new Date(l.timestamp).getTime();
      if (ts < now - span) continue;
      const idx = Math.min(BUCKETS - 1, Math.floor((ts - (now - span)) / bucketMs));
      if (buckets[idx] && l.level in buckets[idx]) buckets[idx][l.level]++;
    }
    return buckets;
  }, [logs]);

  const maxVal = useMemo(() => Math.max(1, ...data.map(b => b.ERROR + b.WARN + b.INFO + b.DEBUG)), [data]);
  const H = 60;
  const W = 8;

  const COLOR = { ERROR: "#ef4444", WARN: "#f59e0b", INFO: "#3b82f6", DEBUG: "#d1d5db" };

  if (!data.length) return <div className="text-[11px] text-gray-400 italic">{t("admin.serverLogs.empty.notEnoughData")}</div>;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">{t("admin.serverLogs.analytics.last5MinActivity")}</p>
      <div className="flex items-end gap-px overflow-hidden">
        {data.map((b, i) => {
          const total = b.ERROR + b.WARN + b.INFO + b.DEBUG;
          const frac = total / maxVal;
          return (
            <div key={i} title={`${fmt(b.t)}: ${total} logs`}
              className="flex flex-col justify-end cursor-default"
              style={{ width: W, height: H }}>
              {(["ERROR","WARN","INFO","DEBUG"]).map(lvl => {
                const h = b[lvl] ? Math.max(2, Math.round((b[lvl] / maxVal) * H)) : 0;
                return h > 0 ? (
                  <div key={lvl} style={{ height: h, background: COLOR[lvl], width: "100%" }} />
                ) : null;
              })}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2">
        {Object.entries(COLOR).map(([lvl, col]) => (
          <div key={lvl} className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, background: col, borderRadius: 2 }} />
            <span className="text-[10px] text-gray-500">{lvl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TopEndpoints ─────────────────────────────────────────────────────────────

function TopEndpoints({ logs }) {
  const { t } = useTranslation();
  const top = useMemo(() => {
    const map = {};
    for (const l of logs) {
      const urls = extractUrls(l.message || "");
      for (const u of urls) {
        const key = u.replace(/[0-9a-f]{24}/g, ":id").replace(/\d+/g, ":n").slice(0, 60);
        map[key] = (map[key] || 0) + 1;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [logs]);

  if (!top.length) return <div className="text-[11px] text-gray-400 italic">{t("admin.serverLogs.empty.noUrlsDetectedYet")}</div>;

  const max = top[0][1];
  return (
    <div className="space-y-1.5">
      {top.map(([url, count]) => (
        <div key={url} className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-700 truncate flex-1" title={url}>{url}</span>
            <span className="text-[10px] font-bold text-gray-500 ml-2 tabular-nums">{count}</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-1 bg-amber-400 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── WatchlistEditor ───────────────────────────────────────────────────────────

function WatchlistEditor({ watchlist, onUpdate }) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const add = () => {
    const kw = input.trim();
    if (!kw || watchlist.includes(kw)) return;
    const next = [...watchlist, kw];
    onUpdate(next);
    setInput("");
  };
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-500">
        {t("admin.serverLogs.watchlistEditor.description")}
      </p>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder={t("admin.serverLogs.watchlistEditor.placeholder")}
          className="flex-1 text-[11px] border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-amber-400 h-auto focus-visible:ring-0"
        />
        <Button onClick={add}
          className="h-auto px-3 py-1 bg-amber-400 hover:bg-amber-500 text-black text-[11px] font-semibold rounded">
          {t("admin.serverLogs.watchlistEditor.add")}
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {watchlist.map(kw => (
          <span key={kw} className="flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 text-[11px] rounded-full">
            {kw}
            <Button onClick={() => onUpdate(watchlist.filter(k => k !== kw))} className="h-auto text-red-400 hover:text-red-700">
              <X size={9} />
            </Button>
          </span>
        ))}
        {watchlist.length === 0 && <span className="text-[11px] text-gray-400 italic">{t("admin.serverLogs.empty.noKeywordsYet")}</span>}
      </div>
    </div>
  );
}

// ── DetailPanel ─────────────────────────────────────────────────────────────

function DetailPanel({ log, bookmarks, notes, onToggleBookmark, onSaveNote, onClose, allLogs }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("info");
  const logKey  = makeLogKey(log);
  const isBookmarked = !!bookmarks[logKey];

  const TABS = [
    { key: "info",  label: t("admin.serverLogs.detailPanel.tabs.detail") },
    { key: "api",   label: t("admin.serverLogs.detailPanel.tabs.api") },
    { key: "user",  label: t("admin.serverLogs.detailPanel.tabs.user") },
    { key: "note",  label: isBookmarked ? t("admin.serverLogs.detailPanel.tabs.noteBookmarked") : t("admin.serverLogs.detailPanel.tabs.note") },
  ];

  const copyLog = () => {
    const text = `[${fmtFull(log.timestamp)}] [${log.source}] ${log.level} ${log.logger}\n${log.message}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-[130] lg:z-auto lg:static w-full sm:w-[85vw] lg:w-[400px] shrink-0 border-l border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 border rounded ${LEVEL_BADGE[log.level] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
            {log.level}
          </span>
          <span className={`text-[11px] font-semibold ${SOURCE_STYLE[log.source] || "text-gray-500"}`}>
            {log.source}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => onToggleBookmark(logKey)} title={isBookmarked ? t("admin.serverLogs.detailPanel.tooltips.removeBookmark") : t("admin.serverLogs.detailPanel.tooltips.bookmark")}>
            {isBookmarked
              ? <BookmarkCheck size={14} className="text-amber-500" />
              : <Bookmark size={14} className="text-gray-400 hover:text-amber-500" />
            }
          </Button>
          <Button onClick={copyLog} title={t("admin.serverLogs.detailPanel.tooltips.copyLogText")}>
            <Copy size={13} className="text-gray-400 hover:text-gray-600" />
          </Button>
          <Button onClick={onClose}>
            <X size={14} className="text-gray-400 hover:text-gray-700" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {TABS.map(tb => (
          <Button key={tb.key} onClick={() => setTab(tb.key)}
            className={`h-auto px-3 py-2 text-[11px] font-medium whitespace-nowrap transition-colors ${
              tab === tb.key ? "border-b-2 border-amber-400 text-gray-900 bg-white" : "text-gray-500 hover:text-gray-700"
            }`}>
            {tb.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "info" && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t("admin.serverLogs.detailPanel.fields.timestamp")}</p>
              <p className="text-[11px] font-mono text-gray-800">{fmtFull(log.timestamp)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t("admin.serverLogs.detailPanel.fields.logger")}</p>
              <p className="text-[11px] font-mono text-gray-800 break-all">{log.logger || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t("admin.serverLogs.detailPanel.fields.message")}</p>
              <pre className="text-[11px] font-mono text-gray-800 whitespace-pre-wrap break-all bg-gray-50 border border-gray-200 rounded p-2">
                {log.message}
              </pre>
            </div>
            {log.thread && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t("admin.serverLogs.detailPanel.fields.thread")}</p>
                <p className="text-[11px] font-mono text-gray-600">{log.thread}</p>
              </div>
            )}
            {log.exception && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t("admin.serverLogs.detailPanel.fields.stackTrace")}</p>
                <pre className="text-[10px] font-mono text-red-600 whitespace-pre-wrap break-all bg-red-50 border border-red-200 rounded p-2 max-h-[200px] overflow-auto">
                  {log.exception}
                </pre>
              </div>
            )}
            {notes[logKey] && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-amber-500 mb-1">{t("admin.serverLogs.detailPanel.fields.note")}</p>
                <div className="text-[11px] text-gray-700 bg-amber-50 border border-amber-200 rounded p-2 whitespace-pre-wrap">
                  {notes[logKey]}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "api" && (
          <div>
            <p className="text-[11px] text-gray-500 mb-3"
              dangerouslySetInnerHTML={{ __html: t("admin.serverLogs.detailPanel.hints.apiTab") }} />
            <ApiInspector log={log} />
          </div>
        )}

        {tab === "user" && (
          <div>
            <p className="text-[11px] text-gray-500 mb-3">
              {t("admin.serverLogs.detailPanel.hints.userTab")}
            </p>
            <UserLookup log={log} />
          </div>
        )}

        {tab === "note" && (
          <div>
            <p className="text-[11px] text-gray-500 mb-3">
              {t("admin.serverLogs.detailPanel.hints.noteTab")}
            </p>
            <NoteEditor logKey={logKey} notes={notes} onSave={onSaveNote} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── LogLine ─────────────────────────────────────────────────────────────────

const LogLine = React.memo(({ log, onClick, selected, search, bookmarked, hasNote, watchlist }) => (
  <div
    onClick={onClick}
    className={`flex items-start gap-3 px-4 py-1.5 border-b border-gray-100 font-mono text-[11px] cursor-pointer transition-colors ${
      selected ? "bg-amber-50 border-l-2 border-l-amber-400" : "hover:bg-amber-50/40"
    }`}
  >
    <span className="text-gray-400 shrink-0 w-[80px]">{fmt(log.timestamp)}</span>
    <span className={`shrink-0 w-[14px] font-bold ${SOURCE_STYLE[log.source] || "text-gray-500"}`}>
      {log.source === "AI" ? "AI" : "JV"}
    </span>
    <span className={`shrink-0 px-1.5 py-0 border text-[10px] font-semibold uppercase ${LEVEL_STYLE[log.level] || "text-gray-400"}`}>
      {log.level?.slice(0, 4)}
    </span>
    <span className="text-gray-400 shrink-0 w-[120px] truncate hidden md:block">{log.logger}</span>
    <span className="text-gray-800 flex-1 break-all leading-relaxed">
      <HighlightedMessage msg={log.message} search={search} watchlist={watchlist} />
    </span>
    <div className="flex items-center gap-1 shrink-0">
      {hasNote     && <StickyNote size={9} className="text-amber-400" />}
      {bookmarked  && <BookmarkCheck size={9} className="text-amber-500" />}
      <ChevronRight size={10} className={selected ? "text-amber-500" : "text-gray-300"} />
    </div>
  </div>
));

// ── ErrorGroupView ───────────────────────────────────────────────────────────

function ErrorGroupView({ logs, onSelect }) {
  const { t } = useTranslation();
  const groups = useMemo(() => {
    const map = {};
    for (const l of logs) {
      if (l.level !== "ERROR" && l.level !== "WARN") continue;
      const key = (l.message || "").slice(0, 80);
      if (!map[key]) map[key] = { log: l, count: 0, last: l.timestamp };
      map[key].count++;
      if (new Date(l.timestamp) > new Date(map[key].last)) map[key].last = l.timestamp;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [logs]);

  if (groups.length === 0) return (
    <div className="flex items-center justify-center flex-1 text-[13px] text-gray-400">
      <div className="text-center space-y-2">
        <CheckCircle size={32} className="mx-auto opacity-20" />
        <p>{t("admin.serverLogs.empty.noErrorsOrWarnings")}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {groups.map((g, i) => (
        <div key={i} onClick={() => onSelect(g.log)}
          className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-100 cursor-pointer hover:bg-amber-50/40 transition-colors">
          <span className={`shrink-0 mt-0.5 px-1.5 py-0 border text-[10px] font-semibold uppercase ${LEVEL_STYLE[g.log.level] || ""}`}>
            {g.log.level?.slice(0, 4)}
          </span>
          <span className="flex-1 text-[11px] font-mono text-gray-800 break-all">
            {(g.log.message || "").slice(0, 80)}{(g.log.message?.length || 0) > 80 ? "…" : ""}
          </span>
          <span className="shrink-0 text-[10px] font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{g.count}</span>
          <span className="shrink-0 text-[10px] text-gray-400 font-mono w-[70px] text-right">{fmt(g.last)}</span>
        </div>
      ))}
    </div>
  );
}

// ── BookmarksView ─────────────────────────────────────────────────────────────

function BookmarksView({ bookmarks, notes, onSelect, onRemove }) {
  const { t } = useTranslation();
  const entries = Object.entries(bookmarks);
  if (entries.length === 0) return (
    <div className="flex items-center justify-center flex-1 text-[13px] text-gray-400">
      <div className="text-center space-y-2">
        <Bookmark size={32} className="mx-auto opacity-20" />
        <p>{t("admin.serverLogs.empty.noBookmarksYet")}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {entries.map(([key, saved]) => (
        <div key={key} className="px-4 py-3 border-b border-gray-100 hover:bg-amber-50/40 transition-colors">
          <div className="flex items-start gap-2">
            <div className="flex-1 cursor-pointer" onClick={() => onSelect(saved.log)}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 py-0 border text-[10px] font-semibold uppercase ${LEVEL_STYLE[saved.log.level] || ""}`}>
                  {saved.log.level?.slice(0, 4)}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{fmt(saved.log.timestamp)}</span>
              </div>
              <p className="text-[11px] font-mono text-gray-800 break-all line-clamp-2">{saved.log.message}</p>
              {notes[key] && (
                <p className="text-[11px] text-amber-700 mt-1 italic">📌 {notes[key].slice(0, 80)}</p>
              )}
            </div>
            <Button onClick={() => onRemove(key)} className="h-auto text-gray-300 hover:text-red-400 shrink-0 mt-0.5">
              <X size={12} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AnalyticsPanel ────────────────────────────────────────────────────────────

function AnalyticsPanel({ logs }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <TimelineChart logs={logs} />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">{t("admin.serverLogs.analytics.topEndpoints")}</p>
        <TopEndpoints logs={logs} />
      </div>
    </div>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────

const LEVELS  = ["ALL", "DEBUG", "INFO", "WARN", "ERROR"];
const SOURCES = ["ALL", "JAVA", "AI"];
const MAIN_VIEWS = ["logs", "bookmarks", "analytics", "watchlist"];

// ── ServerLogs (main) ────────────────────────────────────────────────────────

const ServerLogs = () => {
  const { t } = useTranslation();
  const [logs, setLogs]           = useState([]);
  const [paused, setPaused]       = useState(false);
  const [filterLevel, setLevel]   = useState("ALL");
  const [filterSrc, setSrc]       = useState("ALL");
  const [connected, setConn]      = useState(false);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);
  const [groupMode, setGroupMode] = useState(false);
  const [rateSec, setRateSec]     = useState(0);
  const [view, setView]           = useState("logs");      // logs | bookmarks | analytics | watchlist

  // Persistent state
  const [bookmarks, setBookmarks] = useState(() => lsGet(LS_BOOKMARKS, {}));
  const [notes, setNotes]         = useState(() => lsGet(LS_BOOKMARKS + "_notes", {}));
  const [watchlist, setWatchlist] = useState(() => lsGet(LS_WATCHLIST, []));
  const [notifOn, setNotifOn]     = useState(() => lsGet(LS_NOTIF, false));
  const [errorThresh, setThresh]  = useState(10); // errors/min alert

  const bottomRef  = useRef(null);
  const pauseRef   = useRef(false);
  const bufRef     = useRef([]);
  const recentRef  = useRef([]);
  const errWindow  = useRef([]); // timestamps of ERRORs for threshold

  // Persist bookmarks/notes/watchlist
  useEffect(() => { lsSet(LS_BOOKMARKS, bookmarks); }, [bookmarks]);
  useEffect(() => { lsSet(LS_BOOKMARKS + "_notes", notes); }, [notes]);
  useEffect(() => { lsSet(LS_WATCHLIST, watchlist); }, [watchlist]);
  useEffect(() => { lsSet(LS_NOTIF, notifOn); }, [notifOn]);

  // Rate meter
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      recentRef.current = recentRef.current.filter(t => now - t < 5000);
      setRateSec(+(recentRef.current.length / 5).toFixed(1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!paused && !selected && view === "logs") scrollToBottom();
  }, [logs, paused, selected, view, scrollToBottom]);

  // Request notification permission when enabled
  const enableNotif = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") await Notification.requestPermission();
    setNotifOn(p => !p);
  };

  // SSE
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    const url = `${BASE_URL}/admin/logs/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.addEventListener("log", (e) => {
      try {
        const entry = JSON.parse(e.data);
        recentRef.current.push(Date.now());

        // Error threshold check
        if (entry.level === "ERROR") {
          const now = Date.now();
          errWindow.current.push(now);
          errWindow.current = errWindow.current.filter(t => now - t < 60000);
          if (notifOn && errWindow.current.length === errorThresh) {
            if (Notification.permission === "granted") {
              new Notification(t("admin.serverLogs.notifications.serverAlertTitle"), {
                body: t("admin.serverLogs.notifications.serverAlertBody", { count: errorThresh }),
                icon: "/favicon.ico",
              });
            }
          }
        }

        // Watchlist check
        const msgLower = (entry.message || "").toLowerCase();
        const hit = watchlist.find(kw => kw && msgLower.includes(kw.toLowerCase()));
        if (hit && notifOn && Notification.permission === "granted") {
          new Notification(t("admin.serverLogs.notifications.watchlistHitTitle", { keyword: hit }), {
            body: (entry.message || "").slice(0, 100),
          });
        }

        if (!pauseRef.current) {
          setLogs(prev => {
            const next = [...prev, entry];
            return next.length > 2000 ? next.slice(-2000) : next;
          });
        } else {
          bufRef.current.push(entry);
        }
      } catch {}
    });

    es.onopen  = () => setConn(true);
    es.onerror = () => setConn(false);
    return () => es.close();
  }, [watchlist, notifOn, errorThresh]);

  const togglePause = () => {
    const next = !paused;
    pauseRef.current = next;
    setPaused(next);
    if (!next && bufRef.current.length > 0) {
      setLogs(prev => {
        const combined = [...prev, ...bufRef.current];
        bufRef.current = [];
        return combined.length > 2000 ? combined.slice(-2000) : combined;
      });
    }
  };

  const clear = () => {
    setLogs([]);
    bufRef.current = [];
    recentRef.current = [];
    errWindow.current = [];
    setSelected(null);
  };

  const download = () => {
    const text = filtered.map(l =>
      `[${l.timestamp}] [${l.source}] ${l.level} ${l.logger} — ${l.message}`
    ).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `logs-${Date.now()}.txt`;
    a.click();
  };

  // Load from file
  const loadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = (ev.target.result || "").split("\n").filter(Boolean);
      const parsed = lines.map(line => {
        const m = line.match(/^\[(.+?)\] \[(.+?)\] (\w+) (.+?) — (.*)$/);
        if (!m) return { timestamp: new Date().toISOString(), source: "JAVA", level: "INFO", logger: "import", message: line };
        return { timestamp: m[1], source: m[2], level: m[3], logger: m[4], message: m[5] };
      });
      setLogs(parsed);
      setSelected(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleBookmark = (key) => {
    setBookmarks(p => {
      const n = { ...p };
      if (n[key]) { delete n[key]; return n; }
      return { ...n, [key]: { log: selected, savedAt: new Date().toISOString() } };
    });
  };

  const saveNote = (key, text) => {
    setNotes(p => {
      const n = { ...p };
      if (!text) { delete n[key]; return n; }
      return { ...n, [key]: text };
    });
  };

  const stats = useMemo(() => {
    const s = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
    for (const l of logs) if (s[l.level] !== undefined) s[l.level]++;
    return s;
  }, [logs]);

  const filtered = useMemo(() => logs.filter(l => {
    if (filterLevel !== "ALL" && l.level !== filterLevel) return false;
    if (filterSrc   !== "ALL" && l.source !== filterSrc)  return false;
    if (search && !(l.message || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [logs, filterLevel, filterSrc, search]);

  const bookmarkCount = Object.keys(bookmarks).length;

  return (
    <div className="flex h-full bg-white">

      {/* ── Left sidebar nav ─────────────────────────────────────── */}
      <div className="w-[42px] shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col items-center py-2 gap-1">
        {[
          { key: "logs",      icon: Activity,   title: t("admin.serverLogs.sidebar.liveLogs") },
          { key: "bookmarks", icon: Bookmark,    title: t("admin.serverLogs.sidebar.bookmarksTitle", { count: bookmarkCount }) },
          { key: "analytics", icon: BarChart2,   title: t("admin.serverLogs.sidebar.analytics") },
          { key: "watchlist", icon: Eye,         title: t("admin.serverLogs.sidebar.watchlist") },
        ].map(({ key, icon: Icon, title }) => (
          <Button key={key} onClick={() => setView(key)} title={title}
            className={`w-10 h-10 flex items-center justify-center rounded transition-all ${
              view === key ? "bg-amber-400 text-black" : "text-gray-400 hover:bg-gray-200"
            }`}>
            <Icon size={15} />
          </Button>
        ))}

        <div className="mt-auto flex flex-col items-center gap-1 pb-1">
          <label title={t("admin.serverLogs.sidebar.loadLogFile")} className="w-10 h-10 flex items-center justify-center rounded text-gray-400 hover:bg-gray-200 cursor-pointer">
            <Upload size={14} />
            <input type="file" accept=".txt,.log" onChange={loadFile} className="hidden" />
          </label>
          <Button onClick={enableNotif} title={notifOn ? t("admin.serverLogs.sidebar.disableNotifications") : t("admin.serverLogs.sidebar.enableNotifications")}
            className={`w-10 h-10 flex items-center justify-center rounded transition-all ${
              notifOn ? "bg-red-100 text-red-500" : "text-gray-400 hover:bg-gray-200"
            }`}>
            {notifOn ? <Bell size={14} /> : <BellOff size={14} />}
          </Button>
        </div>
      </div>

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* ── Toolbar (only for logs view) ──────────────────────── */}
        {view === "logs" && (
          <>
            <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-[11px] text-gray-500">{connected ? t("admin.serverLogs.toolbar.live") : t("admin.serverLogs.toolbar.offline")}</span>
                {connected && (
                  <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    {rateSec}/s
                  </span>
                )}
              </div>

              <span className="h-4 w-px bg-gray-200" />
              <span className="text-[11px] tabular-nums text-gray-500">
                {filtered.length}<span className="text-gray-300">/</span>{logs.length}
              </span>

              <div className="flex items-center gap-1">
                <Filter size={11} className="text-gray-400" />
                {LEVELS.map(l => (
                  <Button key={l} onClick={() => setLevel(l)}
                    className={`h-auto px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                      filterLevel === l ? "bg-amber-400 text-black" : "text-gray-500 hover:text-gray-800"
                    }`}>{l}</Button>
                ))}
              </div>

              <div className="flex gap-0.5 border-l border-gray-200 pl-2">
                {SOURCES.map(s => (
                  <Button key={s} onClick={() => setSrc(s)}
                    className={`h-auto px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                      filterSrc === s ? "bg-amber-400 text-black" : "text-gray-500 hover:text-gray-800"
                    }`}>{s}</Button>
                ))}
              </div>

              <div className="relative flex-1 min-w-[120px] max-w-[200px]">
                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t("admin.serverLogs.searchPlaceholder")}
                  className="w-full pl-6 pr-6 py-1 text-[11px] border border-gray-200 rounded bg-white focus:outline-none focus:border-amber-400 h-auto focus-visible:ring-0" />
                {search && (
                  <Button onClick={() => setSearch("")} className="h-auto absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={10} />
                  </Button>
                )}
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <Button onClick={() => setGroupMode(g => !g)}
                  className={`h-auto flex items-center gap-1 px-2 py-1 border text-[10px] font-medium rounded transition-all ${
                    groupMode ? "border-amber-400 bg-amber-50 text-amber-600" : "border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}>
                  <Layers size={11} /> {t("admin.serverLogs.toolbar.group")}
                </Button>
                <span className="h-4 w-px bg-gray-200" />
                <Button onClick={togglePause}
                  className={`h-auto flex items-center gap-1 px-2 py-1 border border-gray-200 text-[11px] rounded transition-all hover:bg-gray-100 ${paused ? "text-amber-500" : "text-gray-500"}`}>
                  {paused ? <Play size={11} /> : <Pause size={11} />}
                  {paused ? `+${bufRef.current.length}` : t("admin.serverLogs.toolbar.pause")}
                </Button>
                <Button onClick={download} className="h-auto p-1.5 border border-gray-200 text-gray-500 rounded hover:bg-gray-100">
                  <Download size={12} />
                </Button>
                <Button onClick={clear} className="h-auto p-1.5 border border-gray-200 text-gray-500 rounded hover:bg-gray-100">
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>

            {/* Stats bar */}
            <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-white border-b border-gray-100">
              {Object.entries(stats).map(([level, count]) => (
                <Button key={level} onClick={() => setLevel(prev => prev === level ? "ALL" : level)}
                  className={`h-auto flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                    filterLevel === level ? LEVEL_BADGE[level] : "border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}>
                  <span>{level}</span>
                  <span className={`font-bold tabular-nums ${count > 0 && level === "ERROR" && filterLevel !== level ? "text-red-500" : ""}`}>
                    {count}
                  </span>
                </Button>
              ))}
              <span className="ml-auto text-[10px] text-gray-400 font-mono tabular-nums">
                {t("admin.serverLogs.sectionHeader.total")} <span className="text-gray-600 font-semibold">{logs.length}</span>
              </span>
            </div>
          </>
        )}

        {/* ── Section header for non-log views ─────────────────── */}
        {view !== "logs" && (
          <div className="shrink-0 px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            {view === "bookmarks" && <><Bookmark size={13} className="text-amber-500" /><span className="text-[12px] font-semibold text-gray-700">{t("admin.serverLogs.sidebar.bookmarksLabel")}</span><span className="text-[11px] text-gray-400">{t("admin.serverLogs.sectionHeader.bookmarksSaved", { count: bookmarkCount })}</span></>}
            {view === "analytics" && <><BarChart2 size={13} className="text-blue-500" /><span className="text-[12px] font-semibold text-gray-700">{t("admin.serverLogs.sidebar.analytics")}</span></>}
            {view === "watchlist" && (
              <>
                <Eye size={13} className="text-red-500" />
                <span className="text-[12px] font-semibold text-gray-700">{t("admin.serverLogs.sidebar.watchlist")}</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">{t("admin.serverLogs.sectionHeader.errorThresholdPerMin")}</span>
                  <Input type="number" min={1} max={100} value={errorThresh}
                    onChange={e => setThresh(Number(e.target.value))}
                    className="w-12 text-[11px] border border-gray-200 rounded px-1.5 py-0.5 text-center focus:outline-none focus:border-amber-400 h-auto focus-visible:ring-0"
                  />
                  <Button onClick={enableNotif}
                    className={`h-auto flex items-center gap-1 px-2 py-1 border text-[10px] font-medium rounded transition-all ${
                      notifOn ? "border-red-300 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:bg-gray-100"
                    }`}>
                    {notifOn ? <Bell size={11} /> : <BellOff size={11} />}
                    {notifOn ? t("admin.serverLogs.sectionHeader.notifOn") : t("admin.serverLogs.sectionHeader.notifOff")}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Content ──────────────────────────────────────────── */}
        {view === "analytics" && <AnalyticsPanel logs={logs} />}

        {view === "watchlist" && (
          <div className="flex-1 overflow-y-auto p-4">
            <WatchlistEditor watchlist={watchlist} onUpdate={(next) => { setWatchlist(next); lsSet(LS_WATCHLIST, next); }} />
          </div>
        )}

        {view === "bookmarks" && (
          <BookmarksView
            bookmarks={bookmarks}
            notes={notes}
            onSelect={(log) => { setSelected(log); setView("logs"); }}
            onRemove={(key) => setBookmarks(p => { const n = { ...p }; delete n[key]; return n; })}
          />
        )}

        {view === "logs" && (
          <>
            {/* Column headers */}
            {!groupMode && (
              <div className="shrink-0 flex items-center gap-3 px-4 py-1.5 bg-gray-100 border-b border-gray-200 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                <span className="w-[80px]">{t("admin.serverLogs.columns.time")}</span>
                <span className="w-[14px]">{t("admin.serverLogs.columns.src")}</span>
                <span className="w-[44px]">{t("admin.serverLogs.columns.level")}</span>
                <span className="w-[120px] hidden md:block">{t("admin.serverLogs.columns.logger")}</span>
                <span className="flex-1">{t("admin.serverLogs.columns.message")}</span>
                <span className="w-[30px]" />
              </div>
            )}

            {groupMode ? (
              <ErrorGroupView logs={logs} onSelect={l => { setSelected(l); setGroupMode(false); }} />
            ) : (
              <div className="flex-1 overflow-y-auto bg-white">
                {filtered.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[13px] text-gray-400">
                    <div className="text-center space-y-2">
                      <Activity size={32} className="mx-auto opacity-20" />
                      <p>{search ? t("admin.serverLogs.empty.noLogsMatching", { search }) : t("admin.serverLogs.empty.waitingForLogs")}</p>
                    </div>
                  </div>
                ) : (
                  filtered.map((log, i) => {
                    const key = makeLogKey(log);
                    return (
                      <LogLine
                        key={i}
                        log={log}
                        search={search}
                        watchlist={watchlist}
                        selected={selected === log}
                        bookmarked={!!bookmarks[key]}
                        hasNote={!!notes[key]}
                        onClick={() => setSelected(prev => prev === log ? null : log)}
                      />
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail panel ─────────────────────────────────────────── */}
      {selected && (
        <DetailPanel
          log={selected}
          bookmarks={bookmarks}
          notes={notes}
          onToggleBookmark={toggleBookmark}
          onSaveNote={saveNote}
          onClose={() => setSelected(null)}
          allLogs={logs}
        />
      )}
    </div>
  );
};

export default ServerLogs;

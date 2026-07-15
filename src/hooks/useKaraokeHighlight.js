import { useState, useRef, useCallback, useEffect } from "react";

// Normalizes text for loose matching: lowercase, strip Vietnamese diacritics,
// strip punctuation. Lets the live transcript match the script even when
// the browser's recognizer drops accents or punctuation differs.
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tracks which word of a script the user has reached while reading aloud,
 * using the browser's built-in SpeechRecognition (Web Speech API) as a
 * live, client-side approximation — separate from the authoritative
 * Whisper-based AI grading that happens after the recording is submitted.
 *
 * Not supported in all browsers (notably Firefox); callers should treat
 * `supported === false` as "hide the karaoke UI, fall back to manual
 * teleprompter" rather than an error.
 */
export function useKaraokeHighlight(scriptText) {
  const [active, setActive] = useState(false);
  const [supported] = useState(
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [wordIndex, setWordIndex] = useState(-1); // index into scriptWords, -1 = not started
  const [errorReason, setErrorReason] = useState(null); // last recognition error code, for UI feedback
  const recognitionRef = useRef(null);
  const matchedCountRef = useRef(0);
  const activeRef = useRef(false);
  const retryCountRef = useRef(0);

  // Must tokenize identically to ScriptPanel's renderKaraokeContent(): drop
  // heading lines (# / ## / ###) entirely, since the renderer excludes them
  // from its word index too. Any mismatch here desyncs wordIndex from the
  // words actually highlighted on screen — karaoke silently stops advancing.
  const scriptWords = useCallback(() => (scriptText || "")
    .split("\n")
    .filter((line) => !/^#{1,3}\s+/.test(line))
    .join(" ")
    .replace(/\*\*/g, "")
    .split(/\s+/)
    .filter(Boolean), [scriptText])();
  const normalizedScriptWords = useRef([]);
  useEffect(() => {
    normalizedScriptWords.current = scriptWords.map(normalize);
  }, [scriptWords]);

  const start = useCallback(() => {
    if (!supported || active) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "vi-VN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      const spokenWords = normalize(transcript).split(" ").filter(Boolean);
      if (!spokenWords.length) return;

      // Advance a cursor through the script by greedily matching the tail of
      // what's been spoken so far against upcoming script words. This is a
      // simple forward-only alignment — good enough for progress tracking,
      // not meant to be a transcription-accuracy signal (that's Whisper's job).
      const target = normalizedScriptWords.current;
      let cursor = matchedCountRef.current;
      // Wider trailing window: interim results can revise/merge several
      // recent words between events, so a fixed last-6 slice can drift out
      // of sync with the target cursor and then never contain the next
      // unmatched word again, permanently stalling the highlight.
      const lastSpoken = spokenWords.slice(-16);

      for (const word of lastSpoken) {
        if (cursor >= target.length) break;
        // Look ahead to tolerate skipped/misheard filler words. Exact match
        // wins over fuzzy prefix match so a repeated short word (e.g. "kính"
        // appearing twice nearby) doesn't get shadowed by a looser hit
        // further out — prefer the nearest exact occurrence, fall back to
        // fuzzy prefix only for longer words where STT drops a syllable.
        const lookahead = target.slice(cursor, cursor + 6);
        let hit = lookahead.findIndex((w) => w === word);
        if (hit === -1 && word.length > 3) {
          hit = lookahead.findIndex((w) => w.length > 3 && (w.startsWith(word) || word.startsWith(w)));
        }
        if (hit !== -1) {
          cursor = cursor + hit + 1;
        }
      }
      if (cursor > matchedCountRef.current) {
        matchedCountRef.current = cursor;
        setWordIndex(cursor - 1);
        setErrorReason(null); // got a real match, clear any earlier stall warning
        retryCountRef.current = 0;
      }
    };

    recognition.onerror = (event) => {
      // Recording never blocks on this — karaoke is cosmetic — but surface
      // the reason so the UI can tell the user why nothing is highlighting
      // instead of looking silently broken. "no-speech" is expected and
      // ignored. "audio-capture" commonly happens because MediaRecorder
      // already grabbed the only mic stream a moment earlier on this
      // device/driver — retry a couple times with backoff since the OS
      // often allows a second reader once the first stream settles.
      if (event.error === "no-speech") return;
      setErrorReason(event.error);
      if (event.error === "audio-capture" && retryCountRef.current < 3) {
        retryCountRef.current += 1;
        setTimeout(() => {
          if (recognitionRef.current === recognition && activeRef.current) {
            try { recognition.start(); } catch {}
          }
        }, 400 * retryCountRef.current);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be active (recognizer
      // stops itself periodically on some browsers). Reads activeRef, not
      // the `active` state closed over at start() call time, which would
      // otherwise always be stale `false` here.
      if (recognitionRef.current === recognition && activeRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      activeRef.current = true;
      retryCountRef.current = 0;
      setActive(true);
      setErrorReason(null);
    } catch {
      // getUserMedia already denied, or recognition unsupported at runtime
      setErrorReason("start-failed");
    }
  }, [supported, active]);

  const stop = useCallback(() => {
    activeRef.current = false; // clear first so onend doesn't auto-restart
    if (recognitionRef.current) {
      const r = recognitionRef.current;
      recognitionRef.current = null;
      try { r.stop(); } catch {}
    }
    setActive(false);
  }, []);

  const reset = useCallback(() => {
    matchedCountRef.current = 0;
    setWordIndex(-1);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    supported,
    active,
    wordIndex,       // index of the last word matched in scriptWords
    scriptWords,      // the tokenized script, for the renderer to map over
    progressPercent: scriptWords.length ? Math.round(((wordIndex + 1) / scriptWords.length) * 100) : 0,
    errorReason,     // null | "no-speech" (ignored) | "not-allowed" | "audio-capture" | "start-failed" | ...
    start,
    stop,
    reset,
  };
}

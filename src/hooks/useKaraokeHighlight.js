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
  const recognitionRef = useRef(null);
  const matchedCountRef = useRef(0);

  const scriptWords = useCallback(() => (scriptText || "").split(/\s+/).filter(Boolean), [scriptText])();
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
      const lastSpoken = spokenWords.slice(-6); // small rolling window

      for (const word of lastSpoken) {
        if (cursor >= target.length) break;
        // look ahead a few words to tolerate skipped/misheard filler words
        const lookahead = target.slice(cursor, cursor + 4);
        const hit = lookahead.findIndex((w) => w === word || (w.length > 3 && word.length > 3 && (w.startsWith(word) || word.startsWith(w))));
        if (hit !== -1) {
          cursor = cursor + hit + 1;
        }
      }
      if (cursor > matchedCountRef.current) {
        matchedCountRef.current = cursor;
        setWordIndex(cursor - 1);
      }
    };

    recognition.onerror = () => {
      // Silently degrade — karaoke highlight is a cosmetic enhancement,
      // never block or error out the actual recording/analysis flow.
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be active (recognizer
      // stops itself periodically on some browsers).
      if (recognitionRef.current === recognition && active) {
        try { recognition.start(); } catch {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setActive(true);
    } catch {
      // getUserMedia already denied, or recognition unsupported at runtime
    }
  }, [supported, active]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      const r = recognitionRef.current;
      recognitionRef.current = null; // clear first so onend doesn't auto-restart
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
    start,
    stop,
    reset,
  };
}

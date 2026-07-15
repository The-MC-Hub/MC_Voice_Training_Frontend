import { useEffect, useState } from "react";

// Same autocorrelation (ACF2+) approach as useAudioAnalyser's live detector,
// but run offline over a decoded AudioBuffer instead of a live MediaStream —
// used to extract a full pitch contour from a finished recording (the
// user's take, or a lesson's reference MC sample) for side-by-side overlay.
function detectPitch(timeDomainFloat, sampleRate) {
  const SIZE = timeDomainFloat.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += timeDomainFloat[i] * timeDomainFloat[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) { if (Math.abs(timeDomainFloat[i]) < threshold) { r1 = i; break; } }
  for (let i = 1; i < SIZE / 2; i++) { if (Math.abs(timeDomainFloat[SIZE - i]) < threshold) { r2 = SIZE - i; break; } }
  const trimmed = timeDomainFloat.slice(r1, r2);
  const n = trimmed.length;
  if (n < 2) return -1;

  const c = new Array(n).fill(0);
  for (let lag = 0; lag < n; lag++) {
    for (let i = 0; i < n - lag; i++) c[lag] += trimmed[i] * trimmed[i + lag];
  }
  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;
  let maxVal = -1, maxPos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxVal) { maxVal = c[i]; maxPos = i; }
  }
  let T0 = maxPos;
  if (T0 > 0 && T0 < n - 1) {
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    if (a !== 0) T0 = T0 - b / (2 * a);
  }
  if (T0 <= 0) return -1;
  const freq = sampleRate / T0;
  if (freq < 70 || freq > 500) return -1;
  return freq;
}

async function extractContour(audioUrl, { windowSize = 2048, hopSize = 1024, maxPoints = 120 } = {}) {
  const res = await fetch(audioUrl);
  const arrayBuffer = await res.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const channel = audioBuffer.getChannelData(0);
  const sr = audioBuffer.sampleRate;

  const raw = [];
  for (let start = 0; start + windowSize < channel.length; start += hopSize) {
    const window = channel.subarray(start, start + windowSize);
    const freq = detectPitch(window, sr);
    raw.push(freq > 0 ? Math.round(freq) : 0);
  }
  ctx.close();

  // Downsample to a fixed point count so two contours of different
  // durations can be overlaid on the same normalized x-axis (0–100%).
  if (raw.length <= maxPoints) return raw;
  const downsampled = [];
  const step = raw.length / maxPoints;
  for (let i = 0; i < maxPoints; i++) {
    downsampled.push(raw[Math.floor(i * step)]);
  }
  return downsampled;
}

/**
 * Fetches and decodes an audio file client-side to extract its pitch
 * contour (array of Hz values, 0 = unvoiced, normalized to a fixed point
 * count). Used to overlay the user's recording against a lesson's
 * professional MC reference sample for direct visual comparison — no
 * server round-trip needed since both files are already public URLs.
 */
export function usePitchContourFromUrl(audioUrl) {
  const [contour, setContour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!audioUrl) { setContour(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    extractContour(audioUrl)
      .then((c) => { if (!cancelled) setContour(c); })
      .catch((e) => { if (!cancelled) setError(e?.message || "Failed to analyze audio"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [audioUrl]);

  return { contour, loading, error };
}

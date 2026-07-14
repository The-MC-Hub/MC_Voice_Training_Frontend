import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Real-time audio analyser using Web Audio API.
 * Returns live waveform bars, volume level, noise floor status, and clipping detection.
 *
 * @param {MediaStream|null} stream - Live mic stream from getUserMedia
 * @param {object} opts
 * @param {number} opts.barCount  - Number of waveform bars (default 40)
 * @param {number} opts.fftSize   - FFT size (default 256 — higher = smoother but slower)
 */
// Autocorrelation-based pitch detection (ACF2+), good enough for a live
// visual contour — not meant to replace the AI service's pitch analysis
// (librosa.pyin), which runs server-side on the full recording after submit.
function detectPitch(timeDomainFloat, sampleRate) {
  const SIZE = timeDomainFloat.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += timeDomainFloat[i] * timeDomainFloat[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // too quiet to trust

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
  // Parabolic interpolation for sub-sample precision
  if (T0 > 0 && T0 < n - 1) {
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    if (a !== 0) T0 = T0 - b / (2 * a);
  }
  if (T0 <= 0) return -1;
  const freq = sampleRate / T0;
  // Human voice range gate — reject octave errors / noise outside speech range
  if (freq < 70 || freq > 500) return -1;
  return freq;
}

export const useAudioAnalyser = (stream, { barCount = 40, fftSize = 256 } = {}) => {
  const audioCtxRef   = useRef(null);
  const analyserRef   = useRef(null);
  const sourceRef     = useRef(null);
  const rafRef        = useRef(null);

  const [bars, setBars]               = useState(() => new Array(barCount).fill(0));
  const [volumeLevel, setVolumeLevel] = useState(0); // 0–100
  const [noiseFloor, setNoiseFloor]   = useState(0); // raw RMS when silent (calibrated first 1s)
  const [clipping, setClipping]       = useState(false);
  const [pitchHz, setPitchHz]         = useState(0); // 0 = unvoiced/silence this frame
  const [pitchHistory, setPitchHistory] = useState(() => []); // rolling window of recent voiced Hz, for a live contour sparkline
  const PITCH_HISTORY_MAX = 60; // ~a few seconds at the tick rate below

  // Noise floor calibration buffer
  const calibrationBuf = useRef([]);
  const calibrated     = useRef(false);
  const calibrationEnd = useRef(0);

  const teardown = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    // Don't close AudioContext — can't be reused once closed, just suspend
    audioCtxRef.current?.suspend();
    sourceRef.current  = null;
    analyserRef.current = null;
    calibrationBuf.current = [];
    calibrated.current = false;
  }, []);

  useEffect(() => {
    if (!stream) {
      teardown();
      setBars(new Array(barCount).fill(0));
      setVolumeLevel(0);
      setClipping(false);
      setPitchHz(0);
      setPitchHistory([]);
      return;
    }
    setPitchHistory([]); // fresh contour for each new recording

    // Resume or create AudioContext
    let ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'closed') {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
    } else if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = 0.75;
    analyserRef.current = analyser;

    // Separate analyser with a bigger window for pitch autocorrelation —
    // fftSize=256 (used for the waveform bars) can't resolve periods long
    // enough for low male voices (~85Hz needs ~500+ samples at 44.1kHz).
    const pitchAnalyser = ctx.createAnalyser();
    pitchAnalyser.fftSize = 2048;
    pitchAnalyser.smoothingTimeConstant = 0;

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    source.connect(pitchAnalyser);
    sourceRef.current = source;

    // Reset calibration
    calibrationBuf.current = [];
    calibrated.current     = false;
    calibrationEnd.current = performance.now() + 1000; // 1s calibration window

    const bufLen   = analyser.frequencyBinCount; // fftSize / 2
    const timeBuf  = new Uint8Array(bufLen);
    const freqBuf  = new Uint8Array(bufLen);
    const pitchBuf = new Float32Array(pitchAnalyser.fftSize);
    let pitchTickCounter = 0;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);

      analyser.getByteTimeDomainData(timeBuf);
      analyser.getByteFrequencyData(freqBuf);

      // ── Pitch (throttled to ~10Hz — autocorrelation is the priciest step) ──
      pitchTickCounter++;
      if (pitchTickCounter % 6 === 0) {
        pitchAnalyser.getFloatTimeDomainData(pitchBuf);
        const freq = detectPitch(pitchBuf, ctx.sampleRate);
        if (freq > 0) {
          setPitchHz(Math.round(freq));
          setPitchHistory((prev) => {
            const next = [...prev, Math.round(freq)];
            return next.length > PITCH_HISTORY_MAX ? next.slice(-PITCH_HISTORY_MAX) : next;
          });
        } else {
          setPitchHz(0);
        }
      }

      // ── RMS volume (0–100) ──
      let sum = 0;
      for (let i = 0; i < timeBuf.length; i++) {
        const v = (timeBuf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / timeBuf.length);
      const vol = Math.min(100, Math.round(rms * 400)); // scale: 0.25 RMS ≈ 100%
      setVolumeLevel(vol);

      // ── Clipping: any sample near max ──
      const maxSample = Math.max(...Array.from(timeBuf));
      setClipping(maxSample >= 252);

      // ── Noise floor calibration (first 1s) ──
      if (!calibrated.current) {
        calibrationBuf.current.push(rms);
        if (performance.now() >= calibrationEnd.current) {
          const avg = calibrationBuf.current.reduce((a, b) => a + b, 0) / calibrationBuf.current.length;
          setNoiseFloor(Math.min(100, Math.round(avg * 400)));
          calibrated.current = true;
        }
      }

      // ── Waveform bars from frequency data ──
      const step    = Math.floor(bufLen / barCount);
      const newBars = [];
      for (let i = 0; i < barCount; i++) {
        // Average a small bin range for each bar
        let binSum = 0;
        for (let j = 0; j < step; j++) {
          binSum += freqBuf[i * step + j] || 0;
        }
        const binAvg   = binSum / step;
        // Normalize: 0–255 → 0–100
        newBars.push(Math.round((binAvg / 255) * 100));
      }
      setBars(newBars);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => teardown();
  }, [stream, barCount, fftSize, teardown]);

  /**
   * Derived audio quality status:
   *   'good'        — volume 15–80, low noise
   *   'too_quiet'   — volume < 15
   *   'too_loud'    — clipping
   *   'noisy'       — noise floor > 25 (background noise detected)
   */
  const audioStatus = (() => {
    if (!stream) return 'idle';
    if (clipping || volumeLevel > 85) return 'too_loud';
    if (noiseFloor > 25 && calibrated.current) return 'noisy';
    if (volumeLevel < 15) return 'too_quiet';
    return 'good';
  })();

  return { bars, volumeLevel, noiseFloor, clipping, audioStatus, pitchHz, pitchHistory };
};

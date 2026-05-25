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
export const useAudioAnalyser = (stream, { barCount = 40, fftSize = 256 } = {}) => {
  const audioCtxRef   = useRef(null);
  const analyserRef   = useRef(null);
  const sourceRef     = useRef(null);
  const rafRef        = useRef(null);

  const [bars, setBars]               = useState(() => new Array(barCount).fill(0));
  const [volumeLevel, setVolumeLevel] = useState(0); // 0–100
  const [noiseFloor, setNoiseFloor]   = useState(0); // raw RMS when silent (calibrated first 1s)
  const [clipping, setClipping]       = useState(false);

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
      return;
    }

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

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    // Reset calibration
    calibrationBuf.current = [];
    calibrated.current     = false;
    calibrationEnd.current = performance.now() + 1000; // 1s calibration window

    const bufLen   = analyser.frequencyBinCount; // fftSize / 2
    const timeBuf  = new Uint8Array(bufLen);
    const freqBuf  = new Uint8Array(bufLen);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);

      analyser.getByteTimeDomainData(timeBuf);
      analyser.getByteFrequencyData(freqBuf);

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

  return { bars, volumeLevel, noiseFloor, clipping, audioStatus };
};

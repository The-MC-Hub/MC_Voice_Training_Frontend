/**
 * celebrate(message) — full-screen fireworks + synthesized firework sound + congratulation banner.
 * Zero dependencies: canvas particles + WebAudio. Canvas attaches to document.body,
 * so it survives SPA route changes and auto-cleans after the show ends.
 */

let audioCtx = null;

function playBoom(delay = 0) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx;
    const t0 = ctx.currentTime + delay;

    // Deep thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t0);
    osc.frequency.exponentialRampToValueAtTime(35, t0 + 0.35);
    oscGain.gain.setValueAtTime(0.5, t0);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
    osc.connect(oscGain).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + 0.45);

    // Crackle (filtered noise burst)
    const dur = 0.9;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(5000, t0);
    filter.frequency.exponentialRampToValueAtTime(500, t0 + dur);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.35, t0);
    nGain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    noise.connect(filter).connect(nGain).connect(ctx.destination);
    noise.start(t0);
  } catch { /* audio blocked — silent fireworks */ }
}

const COLORS = ['#f5a623', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa', '#fb7185', '#ffffff'];

export function celebrate(message = 'Chúc mừng! Bạn đã hoàn thành 🎉') {
  if (typeof document === 'undefined') return;

  // ── Canvas ──
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '99999',
  });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx2d = canvas.getContext('2d');

  // ── Banner ──
  const banner = document.createElement('div');
  banner.textContent = message;
  Object.assign(banner.style, {
    position: 'fixed', top: '38%', left: '50%', transform: 'translate(-50%,-50%) scale(0.6)',
    padding: '18px 36px', borderRadius: '20px', zIndex: '100000', pointerEvents: 'none',
    background: '#f5a623', color: '#000',
    fontWeight: '800', fontSize: '22px', textAlign: 'center', whiteSpace: 'nowrap',
    boxShadow: '0 12px 48px rgba(245,166,35,0.45)', opacity: '0',
    transition: 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
    fontFamily: 'inherit', maxWidth: '90vw',
  });
  document.body.appendChild(banner);
  requestAnimationFrame(() => {
    banner.style.opacity = '1';
    banner.style.transform = 'translate(-50%,-50%) scale(1)';
  });

  // ── Particles ──
  const rockets = [];
  const sparks = [];
  const W = () => canvas.width, H = () => canvas.height;

  function launchRocket(x, delayMs) {
    setTimeout(() => {
      rockets.push({
        x, y: H() + 10,
        vy: -(H() * 0.011 + Math.random() * 3),
        targetY: H() * (0.2 + Math.random() * 0.25),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      playBoom(((H() * 0.55) / (H() * 0.011)) / 1000 * 0.016); // roughly when it pops
    }, delayMs);
  }

  function explode(x, y, color) {
    const count = 70;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = 2 + Math.random() * 5;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.012,
        color: Math.random() < 0.25 ? COLORS[Math.floor(Math.random() * COLORS.length)] : color,
        size: 1.5 + Math.random() * 2,
      });
    }
  }

  const xs = [0.25, 0.5, 0.75, 0.35, 0.65];
  xs.forEach((fx, i) => launchRocket(W() * fx, i * 450));

  let running = true;
  const endAt = Date.now() + 4600;

  function frame() {
    if (!running) return;
    ctx2d.clearRect(0, 0, W(), H());

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy;
      ctx2d.beginPath();
      ctx2d.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      ctx2d.fillStyle = r.color;
      ctx2d.fill();
      // trail
      ctx2d.beginPath();
      ctx2d.moveTo(r.x, r.y);
      ctx2d.lineTo(r.x, r.y + 14);
      ctx2d.strokeStyle = `${r.color}88`;
      ctx2d.lineWidth = 2;
      ctx2d.stroke();
      if (r.y <= r.targetY) {
        explode(r.x, r.y, r.color);
        rockets.splice(i, 1);
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.05; // gravity
      s.vx *= 0.985;
      s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx2d.globalAlpha = Math.max(0, s.life);
      ctx2d.beginPath();
      ctx2d.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx2d.fillStyle = s.color;
      ctx2d.fill();
    }
    ctx2d.globalAlpha = 1;

    if (Date.now() > endAt && rockets.length === 0 && sparks.length === 0) {
      cleanup();
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function cleanup() {
    running = false;
    canvas.remove();
    banner.remove();
  }

  // banner fades earlier than canvas
  setTimeout(() => {
    banner.style.opacity = '0';
    banner.style.transform = 'translate(-50%,-50%) scale(0.85)';
  }, 2800);
  // hard stop safety
  setTimeout(cleanup, 6500);
}

export default celebrate;

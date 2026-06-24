// Procedural WebAudio SFX kit — zero assets. Arcade-flavored.
// Lazily creates the AudioContext on first user gesture (autoplay-safe).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function unlockAudio() {
  ac();
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}

function tone(freq: number, dur: number, type: OscillatorType, when = 0, gain = 0.5, slideTo?: number) {
  const c = ac();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur: number, gain = 0.3, hp = 800) {
  const c = ac();
  if (!c || !master || muted) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'highpass';
  filt.frequency.value = hp;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(filt);
  filt.connect(g);
  g.connect(master);
  src.start();
}

export const sfx = {
  tap: () => tone(440, 0.06, 'square', 0, 0.25),
  correct: (combo = 0) => {
    // rising arpeggio, pitch climbs with combo
    const base = 523 + Math.min(combo, 8) * 40;
    tone(base, 0.08, 'triangle', 0, 0.4);
    tone(base * 1.26, 0.09, 'triangle', 0.06, 0.4);
    tone(base * 1.5, 0.12, 'triangle', 0.12, 0.4);
  },
  wrong: () => {
    tone(180, 0.22, 'sawtooth', 0, 0.35, 90);
    noise(0.12, 0.12, 400);
  },
  combo: (level: number) => {
    const f = 660 + level * 60;
    tone(f, 0.1, 'square', 0, 0.3);
    tone(f * 1.5, 0.12, 'square', 0.05, 0.25);
  },
  tick: () => tone(1200, 0.03, 'square', 0, 0.08),
  start: () => {
    tone(330, 0.1, 'triangle', 0, 0.4);
    tone(440, 0.1, 'triangle', 0.1, 0.4);
    tone(660, 0.16, 'triangle', 0.2, 0.4);
  },
  win: () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => tone(n, 0.18, 'triangle', i * 0.12, 0.45));
    notes.forEach((n, i) => tone(n * 2, 0.18, 'square', i * 0.12 + 0.02, 0.18));
  },
};

export function haptic(ms: number | number[] = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

// WebAudio 合成音效（無音檔）：click / clear / star / alarm / purchase。
// 靜音狀態存 localStorage（全部 try/catch；隱私模式下僅記憶體）。
const KEY = 'waferEmpire.mute';
let ctx = null;
let master = null;
let muted = false;
let volume = () => 0.5;
const listeners = new Set();

try { muted = localStorage.getItem(KEY) === '1'; } catch (e) { /* ignore */ }

export const isMuted = () => muted;
export function onMuteChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function setVolumeSource(fn) { volume = fn; }
export function setMuted(m) {
  muted = !!m;
  try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ }
  for (const fn of [...listeners]) { try { fn(muted); } catch (e) { /* ignore */ } }
}
export const toggleMute = () => { setMuted(!muted); if (!muted) sfx.click(); return muted; };

function ensure() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
  } catch (e) { ctx = null; }
  return ctx;
}

/** 須在使用者手勢內呼叫一次（pointerdown / keydown） */
export function unlockAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

function tone(freq, at, dur, { type = 'sine', vol = 0.2, to = 0 } = {}) {
  const c = ctx;
  const t0 = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function play(fn) {
  if (muted) return;
  const v = Math.max(0, Math.min(1, Number(volume()) || 0));
  if (v === 0) return;
  const c = ensure();
  if (!c || c.state !== 'running') return;
  try { master.gain.value = v; fn(); } catch (e) { /* ignore */ }
}

export const sfx = {
  click: () => play(() => tone(720, 0, 0.05, { type: 'square', vol: 0.08, to: 520 })),
  purchase: () => play(() => { tone(988, 0, 0.09, { type: 'square', vol: 0.12 }); tone(1319, 0.08, 0.2, { type: 'square', vol: 0.12 }); }),
  clear: () => play(() => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, { type: 'triangle', vol: 0.2 })); }),
  star: (i = 0) => play(() => tone(1175 * Math.pow(1.122, i * 2), 0, 0.28, { type: 'sine', vol: 0.22, to: 1175 * Math.pow(1.122, i * 2) * 1.01 })),
  alarm: () => play(() => { for (let i = 0; i < 4; i++) tone(i % 2 ? 660 : 880, i * 0.16, 0.14, { type: 'sawtooth', vol: 0.1 }); }),
};

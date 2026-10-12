// 遊戲時鐘（§3.6）：以 tick 計，1×=250ms、2×=125ms；暫停 = clearInterval
import { bus } from '../shared/bus.js';
import { getState, getBal, save } from './state.js';
import { stepTick } from './sim.js';

let timer = null;
let locks = 0; // 解謎 / 彈窗 / 設定等暫時鎖，計數式

export function isRunning() { return timer !== null; }
export function tickMs() { const s = getState(); return getBal().tickMs[String(s.clock.speed)]; }
export function isUserPaused() { return getState().clock.paused; }

function apply() {
  if (timer) { clearInterval(timer); timer = null; }
  const s = getState();
  if (!s.clock.paused && locks === 0 && !document.hidden) {
    timer = setInterval(stepTick, tickMs());
  }
  bus.emit('clock:changed', { running: isRunning(), speed: s.clock.speed, paused: s.clock.paused, locked: locks > 0 });
}

export function setPaused(p) { getState().clock.paused = !!p; save(); apply(); }
export function togglePause() { setPaused(!getState().clock.paused); }
export function setSpeed(n) {
  const s = getState();
  s.clock.speed = n === 2 ? 2 : 1;
  if (n && s.clock.paused) s.clock.paused = false; // 按速度鈕視為開始
  save(); apply();
}
export function lock() { locks += 1; apply(); }
export function unlock() { locks = Math.max(0, locks - 1); apply(); }
export function resetLocks() { locks = 0; }

export function initClock() {
  apply();
  // 分頁隱藏 → 自動暫停；回到分頁時，若隱藏前正在跑就自動恢復（不補算離開期間的時間）
  let resumeOnShow = false;
  document.addEventListener('visibilitychange', () => {
    const c = getState().clock;
    if (document.hidden) {
      if (!c.paused) resumeOnShow = true;
      c.paused = true; save();
    } else if (resumeOnShow) {
      resumeOnShow = false;
      c.paused = false; save();
    }
    apply();
  });
  bus.on('state:reset', () => { resumeOnShow = false; apply(); });
}

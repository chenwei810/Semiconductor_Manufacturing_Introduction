// window.EmpireBridge（§9.2）+ 啟動解謎組（無 window.startPuzzleSet 時用 stub）
import * as S from './state.js';
import * as Clock from './clock.js';
import { bus } from '../shared/bus.js';
import { getFactText } from '../shared/content.js';
import { levelIds } from './economy.js';

export function installBridge() {
  window.EmpireBridge = {
    getMoney: () => S.getState().res.money,
    spendMoney: (amount, reason) => S.spend(amount, reason || 'puzzle'),
    getStars: fabId => ({ ...(prefixStars(fabId)) }),
    getHintsBought: fabId => ({ ...prefixOf(S.getState().puzzle.hintsBought, fabId) }),
    getFactText: id => getFactText(id),
    markFactSeen: id => S.markFactSeen(id),
    pauseClock: () => Clock.lock(),
    resumeClock: () => Clock.unlock(),
    getSettings: () => ({ ...S.getState().settings })
  };
  return window.EmpireBridge;
}

function prefixOf(map, fabId) {
  const out = {};
  for (const [id, n] of Object.entries(map || {})) if (id.startsWith(fabId + '-')) out[id] = n;
  return out;
}
const prefixStars = fabId => prefixOf(S.getState().puzzle.stars, fabId);

/**
 * 玩家要玩某廠解謎組。若 P 已註冊 window.startPuzzleSet 就用它；
 * 否則用 stub：confirm 後回傳假結果（每關 window.EmpireStubStars || 2 星）。
 * resolve 後寫入星數（S 立即重算並廣播 state:changed）。
 */
export async function runPuzzleSet(fabId, opts) {
  const bal = S.getBal();
  let res;
  bus.emit('puzzle:start', { fabId, levelId: opts?.levelId });
  try {
  if (typeof window.startPuzzleSet === 'function') {
    res = await window.startPuzzleSet(fabId, opts);
  } else {
    Clock.lock();
    try {
      const node = bal.fabs[fabId].node;
      const ok = window.confirm(`【開發 stub】解謎層尚未載入。\n要模擬「通過 ${bal.fabs[fabId].zh}（${node}）製程解謎組」嗎？`);
      const n = window.EmpireStubStars ?? 2;
      const stars = {};
      if (ok) for (const id of levelIds(bal, fabId)) stars[id] = n;
      res = { fabId, stars, cleared: ok, hintsBought: {} };
    } finally { Clock.unlock(); }
  }
  } finally { bus.emit('puzzle:end', { fabId }); }
  S.applyPuzzleResult(res);
  return res;
}

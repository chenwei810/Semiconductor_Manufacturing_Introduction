// 遊戲狀態 + 存檔（§7.2）+ 玩家動作（買／升／賣機台、開廠、星數）
import { bus } from '../shared/bus.js';
import { loadSave, writeSave, clearSave, parseSaveText, SAVE_VERSION } from '../shared/storage.js';
import * as Eco from './economy.js';

let state = null;
let bal = null;
let loadNotice = null; // 讀檔失敗訊息（例如存檔版本過新）

export const getState = () => state;
export const getBal = () => bal;
export const getLoadNotice = () => loadNotice;

function newFab(fabId, unlocked) {
  return {
    unlocked,
    slots: bal.fabs[fabId].slots.map(() => null),
    ups: false,
    lots: [],
    event: null,
    halt: 0,    // 停線剩餘 tick
    feed: 999   // 距上次投片已過 tick（>= 線速度才能再投）
  };
}

export function createInitialState(balance, seed) {
  bal = balance;
  const fabs = {}, inv = {};
  for (const id of bal.fabOrder) { fabs[id] = newFab(id, id === 'f1'); inv[id] = 0; }
  return {
    version: SAVE_VERSION,
    savedAt: 0,
    clock: { tick: 0, speed: 1, paused: true },
    rng: { seed: (seed == null ? (Date.now() & 0x7fffffff) : seed) >>> 0 },
    res: { money: bal.start.money, rep: bal.start.rep, inv, priceWalk: 1.0, repAcc: 0 },
    fabs,
    nextLotId: 1,
    puzzle: { stars: {}, hintsBought: {} },
    seenFacts: [],
    tutorial: { done: [] },
    settings: { sound: 0.5, diffHighlight: true, reduceMotion: false }
  };
}

/** 補齊缺漏欄位（版本相同但缺欄位時的防禦） */
function normalize(s) {
  const base = createInitialState(bal, s.rng?.seed);
  const out = { ...base, ...s };
  out.clock = { ...base.clock, ...s.clock };
  out.res = { ...base.res, ...s.res, inv: { ...base.res.inv, ...(s.res?.inv || {}) } };
  out.puzzle = { ...base.puzzle, ...s.puzzle };
  out.settings = { ...base.settings, ...s.settings };
  out.tutorial = { ...base.tutorial, ...s.tutorial };
  out.fabs = {};
  for (const id of bal.fabOrder) {
    const f = { ...newFab(id, id === 'f1'), ...(s.fabs?.[id] || {}) };
    const len = bal.fabs[id].slots.length;
    f.slots = Array.from({ length: len }, (_, i) => f.slots[i] || null);
    out.fabs[id] = f;
  }
  return out;
}

export function initState(balance, { fresh = false } = {}) {
  bal = balance;
  loadNotice = null;
  if (!fresh) {
    const r = loadSave();
    if (r.ok) { state = normalize(r.save); return state; }
    if (r.reason === 'too-new') loadNotice = `存檔版本（${r.version}）比本遊戲新，無法讀取；已改開新遊戲（不會覆寫舊存檔，直到你第一次存檔）。`;
    else if (r.reason === 'invalid') loadNotice = '存檔已損毀，已改開新遊戲。';
  }
  state = createInitialState(bal);
  return state;
}

export function save() {
  if (!state) return false;
  state.savedAt = Date.now();
  return writeSave(state);
}
export function changed() { bus.emit('state:changed', state); }
export function commit() { save(); changed(); }

export function resetGame() {
  clearSave();
  state = createInitialState(bal);
  bus.emit('state:reset', state);
  changed();
}
export function exportJson() { return JSON.stringify(state, null, 2); }
export function importJson(text) {
  const r = parseSaveText(text);
  if (!r.ok) return r;
  state = normalize(r.save);
  state.clock.paused = true;
  save();
  bus.emit('state:reset', state);
  changed();
  return { ok: true };
}

// ---------- 查詢 ----------
export const starRatio = fabId => Eco.starRatio(bal, fabId, state.puzzle.stars);
export const isUnlocked = fabId => !!state.fabs[fabId]?.unlocked;
export const unlockStatus = fabId => Eco.unlockStatus(bal, fabId,
  { money: state.res.money, rep: state.res.rep, stars: state.puzzle.stars });
export const totalInventory = () => Object.values(state.res.inv).reduce((a, b) => a + b, 0);

// ---------- 資金 ----------
export function spend(amount, reason) {
  amount = Math.round(amount);
  if (!(amount >= 0) || state.res.money < amount) return false;
  state.res.money -= amount;
  bus.emit('money:spent', { amount, reason });
  commit();
  return true;
}
export function earn(amount) { state.res.money += Math.round(amount); commit(); }
export function addRep(d) {
  state.res.rep = Eco.clamp(state.res.rep + d, bal.rep.min, bal.rep.max);
}

// ---------- 機台 ----------
export function buyEquip(fabId, idx, equipId) {
  const fab = state.fabs[fabId];
  if (!fab?.unlocked) return { ok: false, reason: '此廠尚未開通' };
  if (fab.slots[idx]) return { ok: false, reason: '槽位已有機台' };
  if (!Eco.allowedEquip(bal, fabId, idx).includes(equipId)) return { ok: false, reason: '此機台不適用於該槽位' };
  const price = Eco.equipPrice(bal, fabId, equipId);
  if (state.res.money < price) return { ok: false, reason: '資金不足' };
  state.res.money -= price;
  fab.slots[idx] = { equip: equipId, level: 1, invested: price };
  bus.emit('money:spent', { amount: price, reason: 'buy:' + equipId });
  commit();
  return { ok: true };
}
export function upgradeCostOf(fabId, idx) {
  const s = state.fabs[fabId].slots[idx];
  if (!s || s.level >= bal.equip.maxLevel) return null;
  return Eco.upgradeCost(bal, fabId, s.equip, s.level);
}
export function upgradeEquip(fabId, idx) {
  const s = state.fabs[fabId].slots[idx];
  if (!s) return { ok: false, reason: '空槽' };
  const cost = upgradeCostOf(fabId, idx);
  if (cost == null) return { ok: false, reason: '已達最高等級' };
  if (state.res.money < cost) return { ok: false, reason: '資金不足' };
  state.res.money -= cost;
  s.level += 1;
  s.invested += cost;
  bus.emit('money:spent', { amount: cost, reason: 'upgrade:' + s.equip });
  commit();
  return { ok: true };
}
export function sellEquip(fabId, idx) {
  const s = state.fabs[fabId].slots[idx];
  if (!s) return { ok: false, reason: '空槽' };
  const refund = Eco.sellRefund(bal, s.invested);
  state.res.money += refund;
  state.fabs[fabId].slots[idx] = null;
  const ev = state.fabs[fabId].event;
  if (ev?.id === 'tool_failure' && ev.extra?.slot === idx) state.fabs[fabId].event = null;
  commit();
  return { ok: true, refund };
}
export function upsCost(fabId) { return Eco.fabMult(bal, fabId) * bal.events.upsCostPerMult; }
export function buyUps(fabId) {
  const fab = state.fabs[fabId];
  if (fab.ups) return { ok: false, reason: '已安裝' };
  if (!spend(upsCost(fabId), 'ups:' + fabId)) return { ok: false, reason: '資金不足' };
  fab.ups = true;
  commit();
  return { ok: true };
}

// ---------- 開廠 / 解謎 ----------
export function unlockFab(fabId) {
  if (isUnlocked(fabId)) return { ok: false, reason: '已開通' };
  const u = unlockStatus(fabId);
  if (!u.all) return { ok: false, reason: '條件未滿足', status: u };
  state.res.money -= bal.fabs[fabId].unlockMoney;
  state.fabs[fabId].unlocked = true;
  bus.emit('fab:unlocked', { fabId });
  commit();
  return { ok: true };
}

/** startPuzzleSet resolve 後呼叫：取歷史最佳星數、記錄提示、重算 S */
export function applyPuzzleResult(res) {
  if (!res) return;
  const stars = state.puzzle.stars;
  for (const [id, n] of Object.entries(res.stars || {})) {
    stars[id] = Math.max(stars[id] || 0, Math.min(3, Math.max(0, Math.floor(n))));
  }
  for (const [id, n] of Object.entries(res.hintsBought || {})) {
    state.puzzle.hintsBought[id] = Math.max(state.puzzle.hintsBought[id] || 0, n);
  }
  commit();
  bus.emit('puzzle:applied', { fabId: res.fabId });
}

export function markFactSeen(factId) {
  if (!state.seenFacts.includes(factId)) { state.seenFacts.push(factId); save(); }
}
export function setSetting(k, v) { state.settings[k] = v; commit(); }

// 純函式：良率 / 營收 / 成本公式（DESIGN.md §3）。所有數值由 bal (balance.json) 傳入，不寫死。

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export function fabIndex(bal, fabId) { return bal.fabOrder.indexOf(fabId); }
export function fabMult(bal, fabId) { return bal.fabMult[fabIndex(bal, fabId)]; }

/** 可放入某槽位的機台 id 清單（類別相符，且受 fabs 限制，例如 f4–f5 微影只能 scanner） */
export function allowedEquip(bal, fabId, slotIdx) {
  const cat = bal.fabs[fabId].slots[slotIdx];
  return Object.keys(bal.equipment).filter(id => {
    const e = bal.equipment[id];
    return e.category === cat && (!e.fabs || e.fabs.includes(fabId));
  });
}

/** 機台購買價 = price × 廠倍率 */
export function equipPrice(bal, fabId, equipId) {
  return bal.equipment[equipId].price * fabMult(bal, fabId);
}

/** 升級費 = price × 廠倍率 × 1.8^L（L=目前等級），取整數 */
export function upgradeCost(bal, fabId, equipId, level) {
  return Math.round(equipPrice(bal, fabId, equipId) * Math.pow(bal.equip.upgradeBase, level));
}

/** 出售退款 = 50% 當前總投入 */
export function sellRefund(bal, invested) {
  return Math.round(invested * bal.equip.sellRefund);
}

/** 槽位處理時間 p = 4 / (speed × (1 + 0.15×(L−1)))（遊戲小時 = tick） */
export function slotHours(bal, equipId, level) {
  const e = bal.equipment[equipId];
  return bal.equip.baseHours / (e.speed * (1 + bal.equip.speedPerLevel * (level - 1)));
}

/** 線速度：每 max(p) 小時投入一個 Lot；slots 為 p 陣列（空槽以 null 表示 → 產線不通，回 null） */
export function lineInterval(hours) {
  if (!hours.length || hours.some(h => h == null)) return null;
  return Math.max(...hours);
}

/** 單槽缺陷率 d_i = D0 × defMul × 0.80^(L−1) × (1 − 0.5 S) × (1 + Σ eventDef) */
export function slotDefect(bal, fabId, equipId, level, S, eventDef = 0) {
  const y = bal.yield;
  return bal.fabs[fabId].D0 * bal.equipment[equipId].defMul
    * Math.pow(y.levelFactor, level - 1) * (1 - y.starHalf * S) * (1 + eventDef);
}

/** 單槽良率 y_i = 1 − min(d_i, 0.5) */
export function slotYield(bal, fabId, equipId, level, S, eventDef = 0) {
  return 1 - Math.min(slotDefect(bal, fabId, equipId, level, S, eventDef), bal.yield.dMax);
}

/** 線良率 Y = clamp(Π y_i × E, 0.05, 0.99)；slots 為 [{equip, level}|null]，空槽略過 */
export function lineYield(bal, fabId, slots, S = 0, mods = {}) {
  const eventDef = mods.eventDef || 0;
  const E = mods.E == null ? 1 : mods.E;
  let prod = 1;
  for (const s of slots) {
    if (!s) continue;
    prod *= slotYield(bal, fabId, s.equip, s.level, S, eventDef);
  }
  return clamp(prod * E, bal.yield.yMin, bal.yield.yMax);
}

/** 解謎星數比 S = Σ stars / (3 × 關數) */
export function starRatio(bal, fabId, stars) {
  const n = bal.fabs[fabId].puzzleLevels;
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += clamp(Math.floor((stars && stars[`${fabId}-${i}`]) || 0), 0, 3);
  return sum / (3 * n);
}

export function levelIds(bal, fabId) {
  return Array.from({ length: bal.fabs[fabId].puzzleLevels }, (_, i) => `${fabId}-${i + 1}`);
}

/** 售價 = 廠基準價 × (0.9 + 0.2 × rep/100) × 市場波動 */
export function sellPrice(bal, fabId, rep, walk = 1) {
  return bal.fabs[fabId].price * (0.9 + 0.2 * rep / 100) * walk;
}

/** 每出貨一 Lot：rep += (Y − 0.75) × 2 */
export function repGain(bal, Y) {
  return (Y - bal.rep.neutralYield) * bal.rep.perLotFactor;
}

/** 標稱毛利(良率=1) = 1 − 成本/價；盈虧平衡良率 = 成本/價 */
export function nominalMargin(bal, fabId) { const f = bal.fabs[fabId]; return 1 - f.cost / f.price; }
export function breakEvenYield(bal, fabId) { const f = bal.fabs[fabId]; return f.cost / f.price; }

/** 市場波動：每日隨機漫步，限 min–max。r ∈ [0,1) */
export function nextPriceWalk(bal, walk, r) {
  const w = bal.priceWalk;
  return clamp(walk + (r * 2 - 1) * w.step, w.min, w.max);
}

/** 單 Lot 投片成本 */
export function lotCost(bal, fabId) { return bal.fabs[fabId].cost * bal.lotSize; }

/** 解鎖條件狀態 */
export function unlockStatus(bal, fabId, { money, rep, stars }) {
  const f = bal.fabs[fabId];
  const ids = levelIds(bal, fabId);
  const cleared = ids.filter(id => (stars?.[id] || 0) >= 1).length;
  const puzzle = { have: cleared, need: ids.length, ok: cleared >= ids.length };
  const m = { have: money, need: f.unlockMoney, ok: money >= f.unlockMoney };
  const r = { have: rep, need: f.unlockRep, ok: rep >= f.unlockRep };
  return { puzzle, money: m, rep: r, all: puzzle.ok && m.ok && r.ok };
}

/** 整合：某廠目前的產線統計（UI 與模擬共用） */
export function fabStats(bal, fabId, fab, S, mods = {}, rep = 20, walk = 1) {
  const pMul = mods.pMul == null ? 1 : mods.pMul;
  const hours = fab.slots.map(s => (s ? slotHours(bal, s.equip, s.level) * pMul : null));
  const interval = lineInterval(hours);
  const Y = lineYield(bal, fabId, fab.slots, S, mods);
  const complete = fab.slots.every(Boolean);
  const lotsPerDay = interval ? bal.ticksPerDay / interval : 0;
  return {
    hours, interval, Y, complete, lotsPerDay,
    wafersPerDay: lotsPerDay * bal.lotSize,
    price: sellPrice(bal, fabId, rep, walk),
    breakEven: breakEvenYield(bal, fabId)
  };
}

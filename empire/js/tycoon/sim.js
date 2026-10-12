// 每 tick 的模擬：推進 Lot → 槽位完成 → 投新 Lot；每 24 tick 結算（§3.6）
import { bus } from '../shared/bus.js';
import { nextRandom } from '../shared/rng.js';
import * as Eco from './economy.js';
import * as Ev from './events.js';
import { getState, getBal, addRep, save } from './state.js';

export function fabMods(fabId) {
  const s = getState();
  return Ev.eventModifiers(getBal(), s.fabs[fabId]);
}
export function fabStatsNow(fabId) {
  const s = getState(), bal = getBal();
  return Eco.fabStats(bal, fabId, s.fabs[fabId], Eco.starRatio(bal, fabId, s.puzzle.stars),
    fabMods(fabId), s.res.rep, s.res.priceWalk);
}
export function failedSlot(fab) {
  return fab.event?.id === 'tool_failure' ? fab.event.extra.slot : -1;
}

function shipLot(s, bal, fabId, fab, lot, st) {
  const Y = st.Y;
  let good = 0;
  for (let i = 0; i < bal.lotSize; i++) if (nextRandom(s.rng) < Y) good++;
  s.res.repAcc += Eco.repGain(bal, Y);
  const price = Eco.sellPrice(bal, fabId, s.res.rep, s.res.priceWalk);
  let rush = false;
  const ev = fab.event;
  if (ev?.id === 'rush_order' && ev.extra.accepted && ev.extra.pending) {
    ev.extra.pending = false; rush = true;
    s.res.money += Math.round(good * price * bal.events.rushPriceMul);
  } else {
    const room = Math.max(0, bal.invCap - s.res.inv[fabId]);
    s.res.inv[fabId] += Math.min(good, room);
  }
  bus.emit('lot:shipped', { fabId, lotId: lot.id, good, Y, rush });
}

const starveAt = new Map(); // 不存檔：資金不足提示節流

function advanceFab(s, bal, fabId, fab) {
  if (fab.halt > 0) { fab.halt -= 1; return; }
  const mods = Ev.eventModifiers(bal, fab);
  const st = Eco.fabStats(bal, fabId, fab, Eco.starRatio(bal, fabId, s.puzzle.stars), mods, s.res.rep, s.res.priceWalk);
  const bad = failedSlot(fab);
  const last = fab.slots.length - 1;

  // 由前往後處理（slot 大者優先），讓後方空出的位置能被補上
  fab.lots.sort((a, b) => b.slot - a.slot);
  const done = [];
  for (const lot of fab.lots) {
    const h = st.hours[lot.slot];
    if (h == null || lot.slot === bad) continue;
    lot.progress += 1 / h;
    if (lot.progress < 1) continue;
    if (lot.slot === last) { shipLot(s, bal, fabId, fab, lot, st); done.push(lot); continue; }
    if (fab.lots.some(o => o !== lot && !done.includes(o) && o.slot === lot.slot + 1)) { lot.progress = 1; continue; }
    lot.slot += 1;
    lot.progress = Math.min(lot.progress - 1, 0.999);
  }
  if (done.length) fab.lots = fab.lots.filter(l => !done.includes(l));

  // 投片
  if (fab.feed < 9999) fab.feed += 1;
  if (st.complete && bad < 0 && st.interval != null && fab.feed >= st.interval - 1e-9
      && !fab.lots.some(l => l.slot === 0)) {
    const cost = Eco.lotCost(bal, fabId);
    if (s.res.money >= cost) {
      s.res.money -= cost;
      fab.lots.push({ id: s.nextLotId++, slot: 0, progress: 0, good: null });
      fab.feed = 0;
      bus.emit('lot:started', { fabId });
    } else if ((starveAt.get(fabId) ?? -99) + bal.ticksPerDay <= s.clock.tick) {
      starveAt.set(fabId, s.clock.tick);
      bus.emit('toast', '資金不足，無法投片（可出售機台或等待庫存售出）');
    }
  }
}

function settleDay(s, bal) {
  const day = s.clock.tick / bal.ticksPerDay;
  const r = s.res;
  r.priceWalk = Eco.nextPriceWalk(bal, r.priceWalk, nextRandom(s.rng));
  let revenue = 0, sold = 0, maint = 0;
  for (const fabId of bal.fabOrder) {
    const fab = s.fabs[fabId];
    if (!fab.unlocked) continue;
    const n = Math.min(r.inv[fabId], bal.demandCap);
    const price = Eco.sellPrice(bal, fabId, r.rep, r.priceWalk);
    r.inv[fabId] -= n; sold += n; revenue += n * price;
    maint += bal.fabs[fabId].maintenance;
  }
  r.money += Math.round(revenue);
  r.money -= maint;
  if (r.money < 0) { r.money = 0; addRep(-1); bus.emit('toast', '維運費付不出來，聲望 -1'); }
  addRep(Eco.clamp(r.repAcc, -bal.rep.dailyCap, bal.rep.dailyCap));
  r.repAcc = 0;

  const triggered = [];
  for (const fabId of bal.fabOrder) {
    const fab = s.fabs[fabId];
    if (!fab.unlocked) continue;
    const ended = Ev.tickEventDay(fab);
    if (ended) bus.emit('event:end', { fabId });
  }
  for (const t of Ev.rollDailyEvents(s, bal, day)) {
    triggered.push(Ev.triggerEvent(s, bal, t.fabId, t.id, addRep));
  }
  save();
  bus.emit('day', { day, sold, revenue: Math.round(revenue), maint });
  for (const t of triggered) bus.emit('event:trigger', { fabId: t.fabId, id: t.id });
}

export function stepTick() {
  const s = getState(), bal = getBal();
  s.clock.tick += 1;
  for (const fabId of bal.fabOrder) {
    const fab = s.fabs[fabId];
    if (fab.unlocked) advanceFab(s, bal, fabId, fab);
  }
  if (s.clock.tick % bal.ticksPerDay === 0) settleDay(s, bal);
  bus.emit('tick', { tick: s.clock.tick });
}

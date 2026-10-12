// 隨機事件（§3.5）。事件定義文字在 data/events.json，只存 factId，原文由 content.json 提供。
import { nextRandom } from '../shared/rng.js';
import { getFactText, getEquipment } from '../shared/content.js';
import * as Eco from './economy.js';

let defs = null;
export function setEventDefs(d) { defs = d.events || d; }
export function getEventDefs() { return defs; }

/** 事件對產線的修正：eventDef（缺陷加算）、E（良率乘數）、pMul（處理時間乘數） */
export function eventModifiers(bal, fab) {
  const ev = fab.event;
  const m = { eventDef: 0, E: 1, pMul: 1 };
  if (!ev) return m;
  if (ev.id === 'particle') m.eventDef += ev.extra?.def ?? bal.events.particleDef;
  if (ev.id === 'rush_order' && ev.extra?.accepted) m.pMul = bal.events.rushTimeMul;
  return m;
}

/** 每日擲骰：回傳 [{fabId, id}]（尚未套用）。day 為已過的遊戲日數 */
export function rollDailyEvents(state, bal, day) {
  const out = [];
  if (day <= bal.events.protectDays) return out;
  const ids = Object.keys(defs);
  for (const fabId of bal.fabOrder) {
    const fab = state.fabs[fabId];
    if (!fab.unlocked || fab.event) continue;
    if (nextRandom(state.rng) >= bal.events.dailyChance) continue;
    let id = ids[Math.floor(nextRandom(state.rng) * ids.length)];
    if (!state.tutorial.done.includes('t-event')) { id = 'particle'; state.tutorial.done.push('t-event'); } // 首個事件固定 particle
    if (id === 'tool_failure' && !fab.slots.some(Boolean)) id = 'particle';
    out.push({ fabId, id });
  }
  return out;
}

/** 套用事件初始效果並寫入 fab.event；回傳事件實例 */
export function triggerEvent(state, bal, fabId, id, addRep) {
  const fab = state.fabs[fabId];
  const cfg = bal.events;
  const loss = cfg.repLoss[id] || 0;
  if (loss) addRep(-loss);
  switch (id) {
    case 'power_outage': {
      fab.halt = cfg.outageHaltTicks;
      if (fab.ups) {
        // 只損失 1 Lot（最前面的在製批）
        const lost = fab.lots.length ? fab.lots.sort((a, b) => (b.slot + b.progress) - (a.slot + a.progress))[0] : null;
        if (lost) fab.lots = fab.lots.filter(l => l !== lost);
        fab.event = { id, daysLeft: 1, extra: { scrapped: lost ? 1 : 0 } };
      } else {
        fab.event = { id, daysLeft: 1, extra: { scrapped: fab.lots.length } };
        fab.lots = [];
      }
      break;
    }
    case 'particle':
      fab.event = { id, daysLeft: cfg.particleDays, extra: { def: cfg.particleDef } };
      break;
    case 'rush_order':
      fab.event = { id, daysLeft: cfg.rushDays, extra: { accepted: false, pending: false } };
      break;
    case 'tool_failure': {
      const filled = fab.slots.map((s, i) => (s ? i : -1)).filter(i => i >= 0);
      const slot = filled[Math.floor(nextRandom(state.rng) * filled.length)];
      fab.event = { id, daysLeft: cfg.toolFailureDays, extra: { slot } };
      break;
    }
  }
  return { fabId, id, event: fab.event };
}

export function repairCost(bal, fabId, fab) {
  const slot = fab.slots[fab.event?.extra?.slot];
  if (!slot) return 0;
  return Math.round(Eco.equipPrice(bal, fabId, slot.equip) * bal.events.repairFactor);
}
export function cleanCost(bal, fabId) { return Eco.fabMult(bal, fabId) * bal.events.cleanCostPerMult; }

/** 供彈窗使用：標題、效果文字、選項、知識卡文字 */
export function describeEvent(state, bal, fabId) {
  const fab = state.fabs[fabId];
  const ev = fab.event;
  const def = defs[ev.id];
  let effect = def.effect;
  if (ev.id === 'power_outage' && fab.ups) effect = def.effectUps;
  if (ev.id === 'tool_failure') {
    const s = fab.slots[ev.extra.slot];
    const eq = s && getEquipment(s.equip);
    effect = effect.replace('{tool}', eq ? eq.zh : '機台');
  }
  const choices = def.choices.map(c => {
    let cost = 0;
    if (c.id === 'clean') cost = cleanCost(bal, fabId);
    if (c.id === 'repair') cost = repairCost(bal, fabId, fab);
    return { id: c.id, label: c.label, cost, disabled: cost > state.res.money };
  });
  return {
    fabId, id: ev.id, title: def.name, effect, choices,
    factId: def.factId, factText: getFactText(def.factId)
  };
}

/** 玩家選項。回傳 {ok, reason?}。spend(amount, reason)→bool 由呼叫端注入 */
export function chooseOption(state, bal, fabId, choiceId, spend) {
  const fab = state.fabs[fabId];
  const ev = fab.event;
  if (!ev) return { ok: false, reason: 'no-event' };
  switch (ev.id + ':' + choiceId) {
    case 'particle:clean':
      if (!spend(cleanCost(bal, fabId), 'clean:' + fabId)) return { ok: false, reason: '資金不足' };
      fab.halt = Math.max(fab.halt, bal.events.cleanHaltTicks);
      fab.event = null;
      break;
    case 'rush_order:accept':
      ev.extra.accepted = true; ev.extra.pending = true;
      break;
    case 'rush_order:decline':
      fab.event = null;
      break;
    case 'tool_failure:repair':
      if (!spend(repairCost(bal, fabId, fab), 'repair:' + fabId)) return { ok: false, reason: '資金不足' };
      fab.event = null;
      break;
    default: // ok / keep / wait：無額外動作
      break;
  }
  return { ok: true };
}

/** 每日結束：事件倒數。回傳 true 表示事件結束 */
export function tickEventDay(fab) {
  if (!fab.event) return false;
  fab.event.daysLeft -= 1;
  if (fab.event.daysLeft <= 0) { fab.event = null; return true; }
  return false;
}

// 廠房俯視圖：機台槽位（買／升級／賣）、Lot 沿產線動畫。寬螢幕橫向、窄螢幕（<560px）垂直排列。
const enName = (eq) => (eq && eq.en && eq.en !== 'TODO' ? eq.en : '');
import { bus } from '../shared/bus.js';
import * as S from './state.js';
import * as Eco from './economy.js';
import * as Ev from './events.js';
import * as Clock from './clock.js';
import { fabStatsNow, fabMods, failedSlot } from './sim.js';
import { getEquipment, getProcess } from '../shared/content.js';
import { openUnlockSheet } from './unlock-view.js';
import { el, fill, openDialog, toast, money, pct } from './ui.js';

const CELL_H = 88; // 橫向每格寬
const CELL_V = 56; // 縱向每槽高（§11：每槽一列 56 px）

export function mountFactoryView(root) {
  const bal = S.getBal();
  let cur = 'f1';
  let vertical = false;
  const lotEls = new Map(); // lotId → element
  let lastShip = null;

  const tabs = el('div', { class: 'ty-tabs', role: 'tablist', 'aria-label': '選擇晶圓廠' });
  const head = el('div', { class: 'ty-fabhead' });
  const cells = el('div', { class: 'ty-cells' });
  const lots = el('div', { class: 'ty-lots', 'aria-hidden': 'true' });
  const line = el('div', { class: 'ty-line' }, cells, lots);
  const actions = el('div', { class: 'ty-actions' });
  const wrap = el('section', { class: 'ty-fab', 'aria-label': '晶圓廠產線' }, tabs, head, line, actions);
  root.append(wrap);

  // ---------- 版面模式 ----------
  const applyMode = () => {
    const v = root.clientWidth < 560;
    if (v !== vertical || !line.dataset.mode) {
      vertical = v;
      line.dataset.mode = v ? 'v' : 'h';
      renderLine();
    }
  };
  new ResizeObserver(applyMode).observe(root);

  // ---------- Tabs ----------
  function renderTabs() {
    const s = S.getState();
    fill(tabs, ...bal.fabOrder.map(id => {
      const open = s.fabs[id].unlocked;
      return el('button', {
        class: 'ty-tab' + (id === cur ? ' is-on' : '') + (open ? '' : ' is-locked'), role: 'tab',
        'aria-selected': String(id === cur), 'data-tut': 'tab-' + id,
        'aria-label': `${bal.fabs[id].zh} ${bal.fabs[id].node}${open ? '' : '（未開通）'}`,
        onclick: () => { if (open) { cur = id; clearLots(); renderAll(); } else openUnlockSheet(id); }
      }, el('span', { text: bal.fabs[id].zh }), el('small', { text: open ? bal.fabs[id].node : '未開通' }));
    }));
  }

  // ---------- 抬頭資訊 ----------
  function renderHead() {
    const s = S.getState(), fab = s.fabs[cur], f = bal.fabs[cur];
    const st = fabStatsNow(cur);
    const missing = fab.slots.filter(x => !x).length;
    const ev = fab.event;
    let evText = null;
    if (ev) {
      const def = Ev.getEventDefs()[ev.id];
      evText = `事件：${def.name}（剩 ${ev.daysLeft} 日）`;
      if (ev.id === 'rush_order') evText += ev.extra.accepted ? (ev.extra.pending ? '，待出貨' : '，已出貨') : '，未接單';
    }
    const Y = st.Y;
    const profitable = Y >= st.breakEven;
    fill(head, 
      el('div', { class: 'ty-headline' },
        el('h2', { text: `${f.zh}　${f.node}　${f.wafer}` }),
        evText && el('span', { class: 'ty-badge ty-badge--warn', text: evText })),
      el('div', { class: 'ty-kpis' },
        kpi('線良率 Y', pct(Y), profitable ? 'good' : 'bad', `Y = Π(1−dᵢ)×E，盈虧平衡 ${pct(st.breakEven, 0)}`),
        kpi('產能', st.interval ? `${Math.round(st.wafersPerDay)} 片/日` : '—', '', st.interval ? `每 ${st.interval.toFixed(1)} 小時投 1 Lot` : '產線不通'),
        kpi('售價', money(st.price), '', `每片成本 ${money(f.cost)}`),
        kpi('庫存', `${s.res.inv[cur]} 片`, '', `日需求上限 ${bal.demandCap}`),
        kpi('日維運', money(f.maintenance), '', ''),
        kpi('解謎星數 S', pct(S.starRatio(cur), 0), '', '缺陷率 ×(1−0.5S)')),
      missing > 0 && el('p', { class: 'ty-warn', role: 'status', text: `缺機台：還有 ${missing} 個空槽，產線不通。點選空槽購買機台。` }),
      lastShip && lastShip.fabId === cur && el('p', { class: 'ty-muted', text: `最近出貨：${lastShip.good} / ${bal.lotSize} 片良品${lastShip.rush ? '（急件 2.5 倍價）' : ''}` }));
  }
  const kpi = (k, v, cls, sub) => el('div', { class: 'ty-kpi' + (cls ? ' ty-kpi--' + cls : '') },
    el('div', { class: 'ty-kpi-k', text: k }), el('div', { class: 'ty-kpi-v', text: v }), sub && el('div', { class: 'ty-kpi-s', text: sub }));

  // ---------- 產線 ----------
  function renderLine() {
    const s = S.getState(), fab = s.fabs[cur];
    const mods = fabMods(cur);
    const Sr = S.starRatio(cur);
    const bad = failedSlot(fab);
    const cell = vertical ? CELL_V : CELL_H;
    line.style.setProperty('--cell', cell + 'px');
    const busySlots = new Set(fab.lots.map(l => l.slot));
    const out = [];
    fab.slots.forEach((slot, i) => {
      const cat = bal.categories[bal.fabs[cur].slots[i]];
      let body;
      if (!slot) {
        body = [el('div', { class: 'ty-slot-cat', text: cat }), el('div', { class: 'ty-slot-empty', text: '缺機台' }), el('div', { class: 'ty-slot-sub', text: '點選購買' })];
      } else {
        const eq = getEquipment(slot.equip);
        const d = Eco.slotDefect(bal, cur, slot.equip, slot.level, Sr, mods.eventDef);
        const y = 1 - Math.min(d, bal.yield.dMax);
        const p = Eco.slotHours(bal, slot.equip, slot.level) * mods.pMul;
        body = [
          el('div', { class: 'ty-slot-cat', text: cat }),
          el('div', { class: 'ty-slot-name', text: `${eq ? eq.zh : slot.equip} L${slot.level}` }),
          el('div', { class: 'ty-slot-sub', text: i === bad ? '故障停擺' : `${p.toFixed(1)} 小時 · 良率 ${pct(y, 1)}` })
        ];
      }
      const cls = 'ty-slot' + (!slot ? ' is-empty' : '') + (i === bad ? ' is-bad' : '') + (busySlots.has(i) ? ' is-busy' : '');
      out.push(el('div', { class: 'ty-cellwrap' },
        vertical && el('div', { class: 'ty-lane', 'aria-hidden': 'true' }),
        el('button', { class: cls, 'data-tut': 'slot-' + (i + 1), 'aria-label': slotLabel(i, slot, cat, i === bad),
          onclick: () => openSlotSheet(i) }, body)));
    });
    out.push(el('div', { class: 'ty-cellwrap ty-cellwrap--exit' },
      vertical && el('div', { class: 'ty-lane', 'aria-hidden': 'true' }),
      el('div', { class: 'ty-exit', text: '出貨' })));
    fill(cells, ...out);
    cells.style.setProperty('--n', String(out.length));
    updateLots(true);
  }
  function slotLabel(i, slot, cat, bad) {
    if (!slot) return `槽位 ${i + 1}，${cat}，缺機台，點選購買`;
    const eq = getEquipment(slot.equip);
    return `槽位 ${i + 1}，${cat}，${eq ? eq.zh : slot.equip} 等級 ${slot.level}${bad ? '，故障' : ''}，點選管理`;
  }

  // ---------- Lot 動畫 ----------
  function lotPos(c) {
    return vertical ? `translate(0px, ${c * CELL_V}px)` : `translate(${c * CELL_H}px, 0px)`;
  }
  function clearLots() { for (const e of lotEls.values()) e.remove(); lotEls.clear(); }
  function updateLots(snap) {
    const s = S.getState(), fab = s.fabs[cur];
    const ms = Clock.tickMs();
    root.style.setProperty('--ty-tick', ms + 'ms');
    root.classList.toggle('ty-still', !!s.settings.reduceMotion);
    root.classList.toggle('ty-paused', !Clock.isRunning());
    const alive = new Set();
    for (const lot of fab.lots) {
      alive.add(lot.id);
      const c = lot.slot + 0.5 + lot.progress;
      let e = lotEls.get(lot.id);
      if (!e) {
        e = el('div', { class: 'ty-lot', title: `Lot #${lot.id}`, text: String(lot.id % 100) });
        e.style.transform = lotPos(c);
        lots.append(e); lotEls.set(lot.id, e);
        void e.offsetWidth;
        e.classList.add('is-live');
      } else {
        if (snap) e.classList.remove('is-live');
        e.style.transform = lotPos(c);
        if (snap) { void e.offsetWidth; e.classList.add('is-live'); }
      }
    }
    for (const [id, e] of [...lotEls]) {
      if (alive.has(id) || e.classList.contains('ty-lot--out')) continue;
      e.classList.add('ty-lot--scrap'); lotEls.delete(id);
      setTimeout(() => e.remove(), 500);
    }
  }
  bus.on('lot:shipped', ({ fabId, lotId, good, rush }) => {
    lastShip = { fabId, good, rush };
    if (fabId !== cur) return;
    const e = lotEls.get(lotId);
    if (!e) return;
    e.classList.add('ty-lot--out');
    e.style.transform = lotPos(fabCells() + 0.5);
    lotEls.delete(lotId);
    setTimeout(() => e.remove(), Clock.tickMs() + 150);
  });
  const fabCells = () => S.getState().fabs[cur].slots.length;

  // ---------- 動作區 ----------
  function renderActions() {
    const s = S.getState(), fab = s.fabs[cur];
    const bits = [];
    bits.push(el('button', { class: 'ty-btn', onclick: () => openUnlockSheet(cur), text: '製程挑戰 / 解鎖資訊', 'data-tut': 'btn-puzzle' }));
    if (!fab.ups) {
      const c = S.upsCost(cur);
      bits.push(el('button', { class: 'ty-btn', disabled: s.res.money < c, text: `UPS 升級 ${money(c)}`, 'aria-label': `購買不斷電系統 ${money(c)}，停電時只損失 1 個 Lot`,
        onclick: () => { const r = S.buyUps(cur); toast(r.ok ? '已安裝 UPS' : r.reason); } }));
    } else bits.push(el('span', { class: 'ty-badge', text: 'UPS 已安裝' }));
    if (fab.event?.id === 'particle') {
      const c = Ev.cleanCost(bal, cur);
      bits.push(el('button', { class: 'ty-btn', disabled: s.res.money < c, text: `停線清洗 ${money(c)}`, 'data-tut': 'btn-clean',
        onclick: () => { const r = Ev.chooseOption(S.getState(), bal, cur, 'clean', S.spend); if (!r.ok) toast(r.reason); S.commit(); } }));
    }
    if (fab.event?.id === 'rush_order' && !fab.event.extra.accepted) {
      bits.push(el('button', { class: 'ty-btn', text: '接下急件', onclick: () => { Ev.chooseOption(S.getState(), bal, cur, 'accept', S.spend); S.commit(); } }));
    }
    if (fab.event?.id === 'tool_failure') {
      const c = Ev.repairCost(bal, cur, fab);
      bits.push(el('button', { class: 'ty-btn', disabled: s.res.money < c, text: `立刻修復 ${money(c)}`,
        onclick: () => { const r = Ev.chooseOption(S.getState(), bal, cur, 'repair', S.spend); if (!r.ok) toast(r.reason); S.commit(); } }));
    }
    fill(actions, ...bits);
  }

  // ---------- 槽位面板 ----------
  function openSlotSheet(i) {
    Clock.lock();
    let off;
    const dlg = openDialog({ title: `槽位 ${i + 1}：${bal.categories[bal.fabs[cur].slots[i]]}`, onClose: () => { off?.(); Clock.unlock(); } });
    const sRender = () => {
      const s = S.getState(), fab = s.fabs[cur], slot = fab.slots[i];
      const Sr = S.starRatio(cur), mods = fabMods(cur);
      const err = el('p', { class: 'ty-err', 'aria-live': 'polite' });
      const body = [];
      if (!slot) {
        body.push(el('p', { class: 'ty-muted', text: '選擇要放入的機台（價格 = 基價 × 廠倍率）：' }));
        for (const id of Eco.allowedEquip(bal, cur, i)) {
          const b = bal.equipment[id], eq = getEquipment(id), price = Eco.equipPrice(bal, cur, id);
          const d = Eco.slotDefect(bal, cur, id, 1, Sr, mods.eventDef);
          body.push(el('button', { class: 'ty-opt', disabled: s.res.money < price, 'data-tut': 'buy-' + id,
            onclick: () => { const r = S.buyEquip(cur, i, id); if (r.ok) dlg.close(); else err.textContent = r.reason; } },
            el('div', { class: 'ty-opt-t' }, el('b', { text: eq ? eq.zh : id }), el('span', { text: money(price) })),
            el('div', { class: 'ty-opt-s', text: `${enName(eq)}　處理 ${Eco.slotHours(bal, id, 1).toFixed(1)} 小時　單槽良率 ${pct(1 - Math.min(d, 0.5))}　缺陷係數 ×${b.defMul}` }),
            eq && el('div', { class: 'ty-opt-s', text: eq.purpose })));
        }
      } else {
        const eq = getEquipment(slot.equip);
        const d = Eco.slotDefect(bal, cur, slot.equip, slot.level, Sr, mods.eventDef);
        const up = S.upgradeCostOf(cur, i);
        const refund = Eco.sellRefund(bal, slot.invested);
        body.push(
          el('p', {}, el('b', { text: `${eq ? eq.zh : slot.equip}${enName(eq) ? `（${enName(eq)}）` : ''}` }), ` 等級 ${slot.level} / ${bal.equip.maxLevel}`),
          eq && el('p', { class: 'ty-muted', text: eq.purpose }),
          el('p', { class: 'ty-muted', text: `處理時間 ${(Eco.slotHours(bal, slot.equip, slot.level) * mods.pMul).toFixed(2)} 小時　缺陷率 d = ${pct(d, 2)}　單槽良率 ${pct(1 - Math.min(d, 0.5), 2)}` }),
          up != null && el('p', { class: 'ty-muted', text: `升級後：處理 ${(Eco.slotHours(bal, slot.equip, slot.level + 1) * mods.pMul).toFixed(2)} 小時，缺陷率 d = ${pct(Eco.slotDefect(bal, cur, slot.equip, slot.level + 1, Sr, mods.eventDef), 2)}` }),
          el('div', { class: 'ty-choices' },
            el('button', { class: 'ty-btn ty-btn--primary', disabled: up == null || s.res.money < up, 'data-tut': 'btn-upgrade',
              text: up == null ? '已達最高等級' : `升級 ${money(up)}`,
              onclick: () => { const r = S.upgradeEquip(cur, i); if (!r.ok) err.textContent = r.reason; } }),
            el('button', { class: 'ty-btn ty-btn--danger', text: `出售（退 ${money(refund)}）`,
              onclick: function () {
                if (this.dataset.armed) { S.sellEquip(cur, i); dlg.close(); }
                else { this.dataset.armed = '1'; this.textContent = `再按一次確認出售（退 ${money(refund)}）`; }
              } })));
        if (failedSlot(fab) === i) {
          const c = Ev.repairCost(bal, cur, fab);
          body.push(el('button', { class: 'ty-btn', disabled: s.res.money < c, text: `立刻修復 ${money(c)}`,
            onclick: () => { const r = Ev.chooseOption(S.getState(), bal, cur, 'repair', S.spend); if (!r.ok) err.textContent = r.reason; else S.commit(); } }));
        }
      }
      body.push(err);
      fill(dlg.body, ...body);
    };
    off = bus.on('state:changed', sRender);
    sRender();
  }

  // ---------- 總更新 ----------
  function renderAll() { renderTabs(); renderHead(); renderLine(); renderActions(); }
  bus.on('state:changed', () => { renderTabs(); renderHead(); renderLine(); renderActions(); });
  bus.on('state:reset', () => { cur = 'f1'; clearLots(); });
  bus.on('tick', () => { updateLots(false); if (S.getState().clock.tick % 2 === 0) renderHead(); });
  bus.on('day', () => { renderHead(); renderActions(); renderLine(); });
  bus.on('event:end', () => { renderHead(); renderActions(); renderLine(); });
  bus.on('clock:changed', () => { root.classList.toggle('ty-paused', !Clock.isRunning()); });
  vertical = root.clientWidth < 560;
  line.dataset.mode = vertical ? 'v' : 'h';
  renderAll();
  return { setFab(id) { cur = id; clearLots(); renderAll(); }, getFab: () => cur };
}

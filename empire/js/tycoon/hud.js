// HUD：資金、聲望、庫存、時鐘（暫停 / 1× / 2×）、事件彈窗、存檔選單
import { bus } from '../shared/bus.js';
import * as S from './state.js';
import * as Clock from './clock.js';
import * as Ev from './events.js';
import { el, fill, openDialog, toast, money, fmt } from './ui.js';

export function mountHud(root) {
  const bal = S.getBal();
  const vMoney = el('b', { text: '' });
  const vRep = el('b', { text: '' });
  const vInv = el('b', { text: '' });
  const invList = el('div', { class: 'ty-inv-list', hidden: true });
  const vTime = el('span', { class: 'ty-time', 'aria-live': 'polite' });
  const btnPause = el('button', { class: 'ty-btn ty-clk', 'data-tut': 'clock-pause', onclick: () => Clock.togglePause() });
  const btn1 = el('button', { class: 'ty-btn ty-clk', 'aria-label': '一倍速', text: '1×', 'data-tut': 'clock-1x', onclick: () => Clock.setSpeed(1) });
  const btn2 = el('button', { class: 'ty-btn ty-clk', 'aria-label': '兩倍速', text: '2×', 'data-tut': 'clock-2x', onclick: () => Clock.setSpeed(2) });
  const btnMenu = el('button', { class: 'ty-btn ty-clk', 'aria-label': '存檔與設定', text: '選單', onclick: openMenu });
  const invBtn = el('button', { class: 'ty-stat ty-stat--btn', 'aria-label': '展開庫存明細', 'aria-expanded': 'false', onclick: () => {
    invList.hidden = !invList.hidden; invBtn.setAttribute('aria-expanded', String(!invList.hidden));
  } }, '庫存 ', vInv, ' 片');

  root.append(
    el('div', { class: 'ty-hud', role: 'region', 'aria-label': '資源列' },
      el('div', { class: 'ty-hud-row' },
        el('div', { class: 'ty-stat' }, '資金 ', vMoney),
        el('div', { class: 'ty-stat' }, '聲望 ', vRep),
        invBtn),
      invList,
      el('div', { class: 'ty-hud-row ty-hud-clock' }, vTime, btnPause, btn1, btn2, btnMenu)));

  function renderRes() {
    const s = S.getState();
    vMoney.textContent = money(s.res.money);
    vRep.textContent = s.res.rep.toFixed(1) + ' / 100';
    vInv.textContent = fmt(S.totalInventory());
    fill(invList, ...bal.fabOrder.filter(f => s.fabs[f].unlocked).map(f =>
      el('span', { class: 'ty-inv-item', text: `${bal.fabs[f].zh}：${s.res.inv[f]} / ${bal.invCap}` })));
  }
  function renderClock() {
    const s = S.getState();
    const t = s.clock.tick, day = Math.floor(t / bal.ticksPerDay) + 1, hr = t % bal.ticksPerDay;
    vTime.textContent = `第 ${day} 日 ${String(hr).padStart(2, '0')}:00`;
    const running = Clock.isRunning();
    const stateText = s.clock.paused ? '已暫停' : (running ? '進行中' : '暫停（彈窗中）');
    btnPause.textContent = s.clock.paused ? '開始' : '暫停';
    btnPause.setAttribute('aria-label', s.clock.paused ? '開始時鐘' : '暫停時鐘');
    btnPause.title = stateText;
    btn1.setAttribute('aria-pressed', String(s.clock.speed === 1));
    btn2.setAttribute('aria-pressed', String(s.clock.speed === 2));
    btn1.classList.toggle('is-on', s.clock.speed === 1);
    btn2.classList.toggle('is-on', s.clock.speed === 2);
    vTime.title = stateText;
  }
  function render() { renderRes(); renderClock(); }
  bus.on('state:changed', render);
  bus.on('tick', render);
  bus.on('clock:changed', renderClock);
  bus.on('day', d => toast(`第 ${d.day} 日結算：售出 ${d.sold} 片，營收 ${money(d.revenue)}，維運 -${money(d.maint)}`));
  bus.on('toast', m => toast(m));
  bus.on('fab:unlocked', ({ fabId }) => toast(`${bal.fabs[fabId].zh}（${bal.fabs[fabId].node}）開通了！`));
  render();

  mountEventDialogs();
}

// ---------- 事件彈窗 ----------
const queue = [];
let showing = false;

function mountEventDialogs() {
  bus.on('event:trigger', e => { queue.push(e); pump(); });
  bus.on('state:reset', () => { queue.length = 0; });
}
function pump() {
  if (showing || !queue.length) return;
  const { fabId } = queue.shift();
  const s = S.getState(), bal = S.getBal();
  if (!s.fabs[fabId]?.event) return pump();
  const d = Ev.describeEvent(s, bal, fabId);
  showing = true;
  Clock.lock();
  const dlg = openDialog({
    title: `${bal.fabs[fabId].zh}：${d.title}`, kind: 'modal', dismissible: false, label: d.title,
    onClose: () => { showing = false; Clock.unlock(); S.commit(); pump(); }
  });
  const btns = el('div', { class: 'ty-choices' });
  const err = el('p', { class: 'ty-err', 'aria-live': 'polite' });
  for (const c of d.choices) {
    const b = el('button', { class: 'ty-btn ty-btn--primary', disabled: c.disabled, 'data-tut': 'event-' + c.id,
      onclick: () => {
        const r = Ev.chooseOption(S.getState(), bal, fabId, c.id, S.spend);
        if (!r.ok) { err.textContent = r.reason || '無法執行'; return; }
        dlg.close();
      } },
      c.label + (c.cost ? `　${money(c.cost)}` : ''));
    btns.append(b);
  }
  S.markFactSeen(d.factId);
  dlg.body.append(
    el('p', { class: 'ty-event-effect', text: d.effect }),
    btns, err,
    el('div', { class: 'ty-factcard' },
      el('div', { class: 'ty-factcard-h', text: '你知道嗎' }),
      el('p', { text: d.factText })));
  dlg.panel.querySelector('button:not([disabled])')?.focus();
}

// ---------- 存檔 / 設定選單 ----------
function openMenu() {
  Clock.lock();
  const dlg = openDialog({ title: '存檔與設定', onClose: () => Clock.unlock() });
  const s = S.getState();
  const notice = S.getLoadNotice();
  const file = el('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  file.addEventListener('change', async () => {
    const f = file.files?.[0]; if (!f) return;
    const r = S.importJson(await f.text());
    if (r.ok) { toast('匯入成功'); dlg.close(); }
    else toast(r.reason === 'too-new' ? `存檔版本（${r.version}）過新，無法讀取` : '存檔格式錯誤');
  });
  const motion = el('input', { type: 'checkbox', id: 'ty-rm' });
  motion.checked = !!s.settings.reduceMotion;
  motion.addEventListener('change', () => S.setSetting('reduceMotion', motion.checked));
  dlg.body.append(
    notice && el('p', { class: 'ty-err', text: notice }),
    el('label', { class: 'ty-check', for: 'ty-rm' }, motion, ' 減少動態（Lot 直接跳格）'),
    el('div', { class: 'ty-choices' },
      el('button', { class: 'ty-btn', text: '匯出存檔', onclick: () => {
        const url = URL.createObjectURL(new Blob([S.exportJson()], { type: 'application/json' }));
        const a = el('a', { href: url, download: 'wafer-empire-save.json' }); document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } }),
      el('button', { class: 'ty-btn', text: '匯入存檔', onclick: () => file.click() }),
      el('button', { class: 'ty-btn ty-btn--danger', text: '重置遊戲', onclick: function () {
        if (this.dataset.armed) { S.resetGame(); dlg.close(); toast('已重置'); }
        else { this.dataset.armed = '1'; this.textContent = '再按一次確認重置（無法復原）'; }
      } })),
    file);
}

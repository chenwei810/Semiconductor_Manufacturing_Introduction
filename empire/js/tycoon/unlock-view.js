// 解鎖面板：條件清單（解謎 / 金錢 / 聲望）、開始解謎、開廠
import { bus } from '../shared/bus.js';
import * as S from './state.js';
import * as Clock from './clock.js';
import { runPuzzleSet } from './bridge.js';
import { getFactText } from '../shared/content.js';
import { el, fill, openDialog, toast, money, pct } from './ui.js';
import { levelIds } from './economy.js';

export function openUnlockSheet(fabId) {
  const bal = S.getBal(), f = bal.fabs[fabId];
  Clock.lock();
  let off = null;
  const dlg = openDialog({
    title: `${f.zh}（${f.node}，${f.wafer}）`,
    onClose: () => { off?.(); Clock.unlock(); bus.emit('unlock:close', { fabId }); }
  });
  let busy = false;

  function render() {
    const s = S.getState();
    const unlocked = S.isUnlocked(fabId);
    const u = S.unlockStatus(fabId);
    const stars = s.puzzle.stars;
    const rows = [];
    const row = (ok, text) => el('li', { class: ok ? 'ty-ok' : 'ty-no' }, el('span', { class: 'ty-mark', 'aria-hidden': 'true', text: ok ? '✔' : '✘' }), ' ', text);
    if (!unlocked) {
      rows.push(
        row(u.puzzle.ok, `製程解謎組全關至少 1 星（${u.puzzle.have} / ${u.puzzle.need}）`),
        row(u.money.ok, `金錢 ${money(u.money.need)}（目前 ${money(u.money.have)}）`),
        row(u.rep.ok, `聲望 ${u.rep.need}（目前 ${u.rep.have.toFixed(1)}）`));
    }
    const ids = levelIds(bal, fabId);
    const starTxt = ids.map(id => {
      const n = stars[id] || 0;
      return `${id}：${'★'.repeat(n)}${'☆'.repeat(3 - n)}`;
    }).join('　');
    const Sratio = S.starRatio(fabId);

    const puzzleBtn = el('button', { class: 'ty-btn ty-btn--primary', disabled: busy, 'data-tut': 'unlock-puzzle',
      text: unlocked ? '玩製程挑戰（補星可降低缺陷率）' : '開始解謎',
      onclick: async () => {
        busy = true; render();
        dlg.root.hidden = true;
        try { await runPuzzleSet(fabId); }
        catch (e) { toast(e?.message === 'no-levels' ? '此廠的關卡尚未開放' : '解謎層發生錯誤'); console.error(e); }
        finally { busy = false; dlg.root.hidden = false; render(); }
      } });
    const openBtn = !unlocked && el('button', { class: 'ty-btn ty-btn--primary', disabled: !u.all, 'data-tut': 'unlock-open',
      text: `開廠（${money(f.unlockMoney)}）`,
      onclick: () => {
        const r = S.unlockFab(fabId);
        if (r.ok) dlg.close(); else toast(r.reason);
      } });

    fill(dlg.body, 
      el('p', { class: 'ty-muted', text: `每片成本 ${money(f.cost)}，基準價 ${money(f.price)}，日維運 ${money(f.maintenance)}` }),
      !unlocked && el('ul', { class: 'ty-cond' }, rows),
      el('p', { class: 'ty-stars', text: starTxt }),
      el('p', { class: 'ty-muted', text: `星數比 S = ${pct(Sratio, 0)}（全三星使缺陷率減半）` }),
      el('div', { class: 'ty-choices' }, puzzleBtn, openBtn),
      el('div', { class: 'ty-factcard' },
        el('div', { class: 'ty-factcard-h', text: '你知道嗎' }),
        el('p', { text: getFactText(f.factId) })));
    S.markFactSeen(f.factId);
  }
  off = bus.on('state:changed', () => { if (!busy) render(); });
  render();
  bus.emit('unlock:open', { fabId, dlg });
  return dlg;
}

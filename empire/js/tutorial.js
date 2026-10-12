// 教學（DESIGN §10）：以 data-tut 鎖定元素，半透明遮罩只開一個洞讓玩家點高亮目標；可隨時跳過。
// 進度存在 save.tutorial.done（以 "tut:<phase>" 記錄），重新整理後可續玩。
import { bus } from './shared/bus.js';
import * as S from './tycoon/state.js';
import { getProcess } from './shared/content.js';

const $ = sel => document.querySelector(sel);
const byTut = id => $(`[data-tut="${id}"]`);
const resolve = t => (typeof t === 'function' ? t() : t ? (/^[.\[#]/.test(t) ? $(t) : byTut(t)) : null);
const chips = () => document.querySelectorAll('.pz-chip:not(.pz-chip-empty)').length;
const levelHead = () => ($('.pz-head h2')?.textContent || '').trim().toUpperCase();
const visible = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

const isDone = id => S.getState().tutorial.done.includes('tut:' + id);
function mark(id) {
  const d = S.getState().tutorial.done;
  if (!d.includes('tut:' + id)) { d.push('tut:' + id); S.save(); }
}

export function createTutorial() {
  let rootEl = null, dims = [], ring = null, card = null;
  let raf = 0, steps = [], idx = 0, cur = null, active = false, standalone = false;
  let shipCount = 0, soldDays = 0, base = 0, lastTarget = null, shownKey = '';
  const refs = {};

  bus.on('lot:shipped', () => { shipCount++; });
  bus.on('day', d => { if (d.sold > 0) soldDays++; });
  bus.on('state:reset', () => { if (active) stop(); });

  // ---------------- 內容 ----------------
  const slotName = k => S.getBal().categories[S.getBal().fabs.f1.slots[k]];
  const buyBtn = () => document.querySelector('.ty-dlg [data-tut^="buy-"]:not(:disabled)');

  function phases() {
    const lith = getProcess('lithography')?.summary || '';
    const buy = [0, 1, 2, 3].map(k => ({
      title: `買機台 ${k + 1} / 4：${slotName(k)}`,
      text: () => (buyBtn() ? '選一台機台買下（起始資金足夠買齊四個槽位）。' : `點亮起的槽位 ${k + 1}，替「${slotName(k)}」買一台機台。`),
      target: () => buyBtn() || byTut('slot-' + (k + 1)),
      done: () => !!S.getState().fabs.f1.slots[k],
    }));
    const lithoCard = (name, k, title, text) => ({
      title, text, target: () => byTut('btn-confirm') || byTut('card-' + name),
      done: () => chips() >= k + 1 && levelHead().startsWith('F1-2') || (k === 4 && !!$('.pz-result-back')),
    });
    return [
      { id: 'intro', steps: [{ title: '歡迎來到晶圓帝國', dim: true, mode: 'next', nextLabel: '開始',
        text: '你從 180 nm 的 Fab 1 起家：買機台、排產線、賣晶圓賺錢。想開更先進的新廠，必須先通過製程解謎；解謎星數會永久降低缺陷率。每個事件與關卡都附一則真實的半導體知識。' }] },
      { id: 't-buy', skipIf: () => S.getState().fabs.f1.slots.every(Boolean), steps: buy },
      { id: 't-run', steps: [
        { title: '開始生產', text: '產線齊了！按「開始」或速度鈕，讓時鐘跑起來。', target: 'clock-1x', done: () => !S.getState().clock.paused },
        { title: '看 Lot 走完', text: '圓點是一個 Lot（25 片），沿著槽位一站站加工。想快一點可按 2×。等第一批出貨。', target: 'clock-2x', block: false,
          enter: () => { base = shipCount; }, done: () => shipCount > base },
        { title: '良率怎麼算', mode: 'next', pos: 'bottom', nextLabel: '懂了',
          text: '每台機台有缺陷率 d，單槽良率 y = 1 − d；整條線良率 Y = 所有 y 相乘。槽越多、機台等級越低，Y 越低。升級機台與提高解謎星數都能讓 Y 變高。' },
        { title: '每日結算', text: '每 24 小時結算一次：庫存賣出、扣日維運。等第一次賣出。', enter: () => { base = soldDays; }, done: () => soldDays > base },
      ] },
      { id: 't-puzzle', steps: [
        { title: '想開 Fab 2 嗎？', mode: 'next', nextLabel: '去看看',
          text: '開新廠要先通過它的製程解謎組。先從 Fab 1 的基礎挑戰練習：它同時能降低 Fab 1 的缺陷率。' },
        { title: '製程挑戰', text: '點「製程挑戰 / 解鎖資訊」。', target: 'btn-puzzle', done: () => !!byTut('unlock-puzzle') || !!$('.pz-root') },
        { title: '開始解謎', text: '按「玩製程挑戰」進入解謎。', target: 'unlock-puzzle', done: () => !!$('.pz-root') },
      ] },
      { id: 't-card', steps: [
        { title: '選第 1 關', text: '先從「長一層氧化」開始。', target: '[data-level="f1-1"]', done: () => levelHead().startsWith('F1-1') },
        { title: '打出沉積卡', text: '目標是在矽上長 2 格 SiO₂。點「沉積」卡。', target: 'card-deposit', done: () => !!$('.pz-sheet') || chips() > 0 },
        { title: '選參數', text: '材料選 SiO₂（O），厚度選 2 格。預覽只會在剖面上顯示結果、不計步；打錯了可按「復原」回到上一步。',
          target: () => byTut('param-t-2') || byTut('card-deposit'),
          done: () => !!$('[data-tut="param-t-2"][aria-pressed="true"]') || chips() > 0 },
        { title: '確認出牌', text: '預覽和目標一樣了，按「確認出牌」。', target: () => byTut('btn-confirm') || byTut('card-deposit'), done: () => chips() > 0 },
      ] },
      { id: 't-star', steps: [
        { done: () => !!$('.pz-result-back') || !levelHead().startsWith('F1-1') },
        { title: '三顆星與「浪費」', mode: 'next', pos: 'top', nextLabel: '了解',
          text: '★1 剖面吻合；★2 步數不超過標準；★3 再加上零浪費（沒有多餘的材料移除）。星數會永久降低該廠缺陷率：d × (1 − 0.5S)，全三星缺陷率減半。' },
        { title: '下一關', text: '接著玩「開窗」：微影五步驟。', target: 'btn-next', pos: 'top',
          done: () => levelHead().startsWith('F1-2') || !$('.pz-result-back') },
      ] },
      { id: 't-litho', steps: [
        lithoCard('spin', 0, '微影 1/5：旋塗光阻', `${lith}　先用「旋塗光阻」在表面鋪一層光阻。`),
        lithoCard('expose', 1, '微影 2/5：曝光', '光罩透光的欄位，光阻會變成可溶（正光阻）。想一想要打開哪些欄位的氧化層，選對光罩再確認。'),
        lithoCard('develop', 2, '微影 3/5：顯影', '把已曝光的光阻洗掉，露出下面的氧化層。'),
        lithoCard('etch', 3, '微影 4/5：蝕刻', '只蝕刻氧化層 O；光阻留著的地方受保護。深度要剛好穿過氧化層、不要吃到矽。'),
        lithoCard('strip', 4, '微影 5/5：去光阻', '最後把剩下的光阻剝除，剖面就會和目標一樣。'),
        { title: '教學完成', mode: 'next', pos: 'top', nextLabel: '完成', done: undefined,
          text: '沉積 → 微影 → 蝕刻 → 佈植 → CMP → 金屬化，就是晶片的製程主線。湊齊 Fab 2 的星數、$12,000 與聲望 15 就能開 Fab 2。祝你成為晶圓大亨！' },
      ] },
    ];
  }

  // ---------------- 介面 ----------------
  function build() {
    rootEl = document.createElement('div');
    rootEl.className = 'we-tut';
    rootEl.setAttribute('role', 'dialog'); rootEl.setAttribute('aria-label', '教學');
    dims = [0, 1, 2, 3].map(() => { const d = document.createElement('div'); d.className = 'we-tut-dim'; return d; });
    ring = document.createElement('div'); ring.className = 'we-tut-ring';
    card = document.createElement('div'); card.className = 'we-tut-card';
    refs.h = document.createElement('h3'); refs.p = document.createElement('p');
    refs.prog = document.createElement('span'); refs.prog.className = 'we-tut-prog';
    refs.next = document.createElement('button'); refs.next.className = 'we-btn we-btn--primary'; refs.next.type = 'button';
    refs.skip = document.createElement('button'); refs.skip.className = 'we-btn'; refs.skip.type = 'button'; refs.skip.textContent = '跳過教學';
    refs.next.addEventListener('click', () => advance());
    refs.skip.addEventListener('click', () => skip());
    const row = document.createElement('div'); row.className = 'we-tut-row';
    row.append(refs.prog, refs.skip, refs.next);
    card.append(refs.h, refs.p, row);
    rootEl.append(...dims, ring, card);
    document.body.append(rootEl);
  }

  function setRect(d, l, t, w, h) { d.style.cssText = `left:${l}px;top:${t}px;width:${Math.max(0, w)}px;height:${Math.max(0, h)}px;display:block`; }

  function render(t) {
    const st = cur;
    const W = window.innerWidth, H = window.innerHeight;
    const block = st.block !== false;
    dims.forEach(d => { d.style.display = 'none'; });
    ring.style.display = 'none';
    if (st.dim) setRect(dims[0], 0, 0, W, H);
    else if (t && visible(t)) {
      const r = t.getBoundingClientRect(), pad = 5;
      const x0 = Math.max(0, r.left - pad), y0 = Math.max(0, r.top - pad), x1 = Math.min(W, r.right + pad), y1 = Math.min(H, r.bottom + pad);
      if (block) {
        setRect(dims[0], 0, 0, W, y0);
        setRect(dims[1], 0, y1, W, H - y1);
        setRect(dims[2], 0, y0, x0, y1 - y0);
        setRect(dims[3], x1, y0, W - x1, y1 - y0);
      }
      ring.style.cssText = `display:block;left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px`;
    }
    // 卡片
    const text = typeof st.text === 'function' ? st.text() : st.text;
    card.style.display = text || st.title ? '' : 'none';
    const key = `${st.title}|${text}`;
    if (key !== shownKey) {
      shownKey = key;
      refs.h.textContent = st.title || '';
      refs.h.style.display = st.title ? '' : 'none';
      refs.p.textContent = text || '';
    }
    refs.next.style.display = st.mode === 'next' ? '' : 'none';
    refs.next.textContent = st.nextLabel || '下一步';
    refs.prog.textContent = `${idx + 1} / ${steps.length}`;
    let atTop = st.pos === 'top';
    if (!st.pos) {
      if (t && visible(t)) { const r = t.getBoundingClientRect(); atTop = (r.top + r.bottom) / 2 > H * 0.5; }
    }
    card.classList.toggle('at-top', atTop);
    card.classList.toggle('at-bottom', !atTop);
    if (t && t !== lastTarget && visible(t)) {
      lastTarget = t;
      const r = t.getBoundingClientRect();
      if (r.top < 0 || r.bottom > H) { try { t.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) { /* ignore */ } }
    }
  }

  function enter() {
    cur = steps[idx];
    shownKey = ''; lastTarget = null;
    cur?.enter?.();
  }
  function advance() {
    const prev = cur;
    if (prev && prev._last && !standalone) mark(prev._phase);
    idx += 1;
    if (idx >= steps.length) { finish(); return; }
    enter();
  }
  function frame() {
    if (!active) return;
    raf = requestAnimationFrame(frame);
    if (!cur) return;
    if (cur.done && cur.done()) { advance(); return; }
    render(cur.target ? resolve(cur.target) : null);
  }

  function run(list, solo = false) {
    steps = [];
    for (const ph of list) {
      ph.steps.forEach((s, i) => steps.push({ ...s, _phase: ph.id, _last: i === ph.steps.length - 1 }));
    }
    if (!steps.length) return false;
    stop();
    idx = 0; active = true; standalone = solo;
    build(); enter();
    raf = requestAnimationFrame(frame);
    return true;
  }
  function stop() {
    active = false; cancelAnimationFrame(raf);
    rootEl?.remove(); rootEl = null; cur = null;
  }
  function finish() { if (!standalone) mark('finished'); stop(); bus.emit('tutorial:end', {}); }
  function skip() { if (!standalone) { mark('skipped'); mark('finished'); } stop(); bus.emit('tutorial:end', { skipped: true }); }

  // ---------------- 對外 ----------------
  function start({ fresh = false } = {}) {
    if (fresh) {
      const d = S.getState().tutorial.done;
      S.getState().tutorial.done = d.filter(x => !x.startsWith('tut:'));
    }
    const todo = phases().filter(p => !isDone(p.id) && !(p.skipIf && p.skipIf()));
    return run(todo);
  }
  /** 續玩：沒完成也沒跳過才自動接續 */
  const needsResume = () => !isDone('finished') && !isDone('skipped');

  /** 首個事件的引導（事件彈窗已由 HUD 開啟）；教學進行中或已跳過則不介入 */
  bus.on('event:trigger', () => {
    if (active || isDone('skipped') || isDone('event')) return;
    if (!document.querySelector('.ty-dlg--modal')) return;
    mark('event');
    run([{ id: 'event-guide-run', steps: [{
      title: '事件發生了！', pos: 'top',
      text: '事件會突然改變產線。例如「微粒污染」讓缺陷率上升：花錢「停線清洗」可立刻解除，也可以硬撐。選擇後下方還有一則真實的製程知識。',
      target: () => byTut('event-clean') || document.querySelector('.ty-dlg--modal [data-tut^="event-"]'),
      done: () => !document.querySelector('.ty-dlg--modal'),
    }] }], true);
  });

  return { start, skip, needsResume, isActive: () => active, isDone };
}

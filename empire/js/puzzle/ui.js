// 製程解謎 UI：關卡選單、卡牌盤、參數面板、預覽、復原、提示、星數結算。
// 對外介面：window.startPuzzleSet(fabId, opts) → Promise<PuzzleResult>（DESIGN.md §9.2）。
// 依賴 window.EmpireBridge（若不存在則降級：星數存記憶體、提示免費、知識取自 content.json）。
import {
  createSession, paramOptions, availableCards, describeStep, CARD_NAMES, MATERIALS, hintInfo, hintPrice, diffCells,
} from './engine.js';
import { createBoardRenderer, drawThumb, renderLegend, materialsIn, maskThumb, MAT_STYLE, cellSizeFor, COLS, ROWS } from './renderer.js';

const FAB_MULT = { f1: 1, f2: 2, f3: 4, f4: 10, f5: 25 };
const CARD_SUB = {
  deposit: '長一層膜', spin: '塗光阻', expose: '光罩照光', develop: '洗掉曝光處', etch: '挖掉材料', implant: '打進離子', cmp: '磨平', strip: '去光阻',
};
const CARD_HELP = {
  deposit: '保形沉積：每一欄都在最上方長出所選厚度的材料。',
  spin: '光阻鋪成平坦頂面，比最高點再高 1 格。',
  expose: '光罩透光的欄，其中的光阻變成可溶（正光阻）。',
  develop: '把已曝光（可溶）的光阻洗掉。',
  etch: '只吃所選材料；遇到不同材料或光阻保護就停。',
  implant: '把頂部的矽 S 打成摻雜矽 D；光阻、閘極、氧化層都擋得住。',
  cmp: '整片磨平到「停止層」材料的最高點。',
  strip: '把光阻（及其上方的東西）整個剝掉。',
};
const PARAM_LABEL = { mat: '材料', t: '厚度（格）', depth: '深度（格）', stop: '停止層', mask: '光罩' };

const CSS_URL = new URL('../../css/puzzle.css', import.meta.url).href;
const LEVELS_URL = new URL('./levels.json', import.meta.url).href;
const CONTENT_URL = new URL('../../data/content.json', import.meta.url).href;

let levelsPromise = null;
let contentPromise = null;
const memStars = {}; // 無 EmpireBridge 時的降級星數（僅記憶體）
let active = null;

export function loadLevels() {
  if (!levelsPromise) levelsPromise = fetch(LEVELS_URL).then((r) => { if (!r.ok) throw new Error('no-levels'); return r.json(); });
  return levelsPromise;
}

function ensureStyles() {
  if (document.querySelector('link[data-pz-css]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = CSS_URL;
  l.setAttribute('data-pz-css', '');
  document.head.append(l);
}

const bridge = () => (typeof window !== 'undefined' && window.EmpireBridge) || null;

async function factText(factId) {
  const b = bridge();
  if (b && typeof b.getFactText === 'function') {
    try { const t = b.getFactText(factId); if (t) return t; } catch (e) { /* 降級 */ }
  }
  try {
    if (!contentPromise) contentPromise = fetch(CONTENT_URL).then((r) => r.json());
    const c = await contentPromise;
    const n = Number(String(factId).replace('fact#', ''));
    return (c.facts[n] && c.facts[n].text) || '';
  } catch (e) {
    return '';
  }
}

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
  return n;
}

const starsText = (n, total = 3) => el('span', { 'aria-label': `${n} 顆星，滿 ${total} 顆` },
  ...Array.from({ length: total }, (_, i) => el('span', { class: i < n ? 'pz-star-on' : 'pz-star-off', 'aria-hidden': 'true', text: '★' })));

function settings() {
  const b = bridge();
  let s = {};
  try { s = (b && b.getSettings && b.getSettings()) || {}; } catch (e) { /* ignore */ }
  const prm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { diffHighlight: s.diffHighlight !== false, reduceMotion: !!s.reduceMotion || prm };
}

export function startPuzzleSet(fabId, opts = {}) {
  if (active) return active.promise;
  const ctl = {};
  ctl.promise = run(fabId, opts).finally(() => { active = null; });
  active = ctl;
  return ctl.promise;
}

async function run(fabId, opts) {
  let all;
  try { all = await loadLevels(); } catch (e) { throw new Error('no-levels'); }
  const levels = all.filter((l) => l.fab === fabId).sort((a, b) => a.order - b.order);
  if (!levels.length) throw new Error('no-levels');
  ensureStyles();

  return new Promise((resolve) => {
    const b = bridge();
    const hasBridge = !!b;
    const call = (name, ...a) => { try { return b && typeof b[name] === 'function' ? b[name](...a) : undefined; } catch (e) { return undefined; } };
    call('pauseClock');

    // ---- 掛載
    let host = opts.mount || document.getElementById('puzzle-root');
    let ownHost = false;
    let hostWasHidden = null;
    if (!host) { host = el('div'); document.body.append(host); ownHost = true; }
    const prevHostHTML = host.innerHTML;
    host.innerHTML = '';
    if (host.hidden) { hostWasHidden = true; host.hidden = false; }
    const root = el('div', { class: 'pz-root' + (opts.mount && !ownHost ? '' : ' pz-overlay'), role: 'region', 'aria-label': '製程解謎' });
    host.append(root);
    let st = settings();
    if (st.reduceMotion) root.classList.add('pz-reduce');

    const hist = () => ({ ...(memStars[fabId] || {}), ...(call('getStars', fabId) || {}) });
    const sessionStars = {};
    const hintsBought = { ...(call('getHintsBought', fabId) || {}) };
    const best = (id) => Math.max(sessionStars[id] || 0, hist()[id] || 0);
    const mult = FAB_MULT[fabId] || 1;

    let cleanup = () => {};
    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      cleanup();
      document.removeEventListener('keydown', onKey);
      root.remove();
      host.innerHTML = prevHostHTML;
      if (ownHost) host.remove();
      else if (hostWasHidden) host.hidden = true;
      call('resumeClock');
      const h = hist();
      const merged = { ...h };
      for (const k of Object.keys(sessionStars)) merged[k] = Math.max(merged[k] || 0, sessionStars[k]);
      resolve({
        fabId,
        stars: { ...sessionStars },
        cleared: levels.every((l) => (merged[l.id] || 0) >= 1),
        hintsBought: { ...hintsBought },
      });
    }

    function toast(msg) {
      document.querySelectorAll('.pz-toast').forEach((n) => n.remove());
      const t = el('div', { class: 'pz-toast', role: 'status', text: msg });
      document.body.append(t);
      setTimeout(() => t.remove(), 2600);
    }

    let onEsc = null;
    function onKey(e) {
      if (e.key === 'Escape' && onEsc) { e.preventDefault(); onEsc(); }
    }
    document.addEventListener('keydown', onKey);

    // ================= 關卡選單 =================
    function showMenu() {
      cleanup();
      cleanup = () => {};
      onEsc = null;
      root.innerHTML = '';
      const h = hist();
      const list = el('ul', { class: 'pz-menu' });
      for (const lv of levels) {
        const s = Math.max(sessionStars[lv.id] || 0, h[lv.id] || 0);
        list.append(el('li', {}, el('button', {
          class: 'pz-level-btn', 'data-level': lv.id, 'aria-label': `${lv.title}，目前 ${s} 顆星，標準步數 ${lv.par}`,
          onclick: () => showLevel(lv),
        },
        el('span', { class: 'pz-level-title', text: `${lv.order}. ${lv.title}` }),
        el('span', { class: 'pz-level-stars' }, starsText(s)),
        el('span', { class: 'pz-level-meta', text: `標準 ${lv.par} 步 · ${lv.teach.length ? '重點：' + teachNames(lv.teach) : ''}` }))));
      }
      const done = levels.every((l) => best(l.id) >= 1);
      root.append(el('div', { class: 'pz-wrap' },
        el('div', { class: 'pz-head' },
          el('h2', { text: `Fab ${fabId.slice(1)} 製程挑戰` }),
          el('button', { class: 'pz-btn', 'data-tut': 'btn-exit', 'aria-label': '離開解謎', onclick: finish, text: '離開' })),
        el('p', { class: 'pz-intro', text: done ? '全部關卡都已過關，可以回去重玩補星。' : '每一關至少拿 1 顆星才算過關；步數不超過標準並且零浪費可拿 3 顆星。' }),
        list,
        el('p', { class: 'pz-menu-foot', text: '簡化聲明：本遊戲不模擬孔洞、等向蝕刻與擴散；離子佈植為淺層規則化。' })));
      const first = root.querySelector('.pz-level-btn');
      if (first) first.focus({ preventScroll: true });
      onEsc = finish;
      root.scrollTop = 0;
    }
    const PROC = { lithography: '微影', thin_film: '薄膜', etching: '蝕刻', ion_implantation: '離子佈植', cmp: 'CMP', cleaning: '清洗', metallization: '金屬化' };
    const teachNames = (arr) => arr.map((x) => PROC[x] || x).join('、');

    // ================= 單關 =================
    function showLevel(level) {
      cleanup();
      st = settings();
      if (st.reduceMotion) root.classList.add('pz-reduce'); else root.classList.remove('pz-reduce');
      if (sessionStars[level.id] == null) sessionStars[level.id] = 0;
      const session = createSession(level);
      let diffOn = st.diffHighlight;
      let targetBig = false;
      let hintMsg = '';
      let busy = false;
      let sheetEl = null;
      const lastParams = {};

      const cell = cellSizeFor(Math.min(window.innerWidth || 375, 560));
      const smallCell = Math.max(12, Math.floor(cell * 0.5));

      const boardCv = el('canvas', { class: 'pz-canvas', role: 'img', 'aria-label': '目前剖面' });
      const targetCv = el('canvas', { class: 'pz-canvas', role: 'img', 'aria-label': '目標剖面' });
      const board = createBoardRenderer(boardCv, { cell, grid: session.grid, showDiff: diffOn, reduceMotion: st.reduceMotion });
      board.setTarget(level.target);
      const targetBtn = el('button', { class: 'pz-target-btn', 'aria-pressed': 'false', 'data-tut': 'target', 'aria-label': '放大或縮小目標剖面', onclick: () => { targetBig = !targetBig; drawTarget(); } }, targetCv);
      const targetLabel = el('p', { class: 'pz-board-label' }, el('span', { text: '目標剖面（點一下放大）' }));
      function drawTarget() {
        drawThumb(targetCv, level.target, targetBig ? cell : smallCell);
        targetBtn.setAttribute('aria-pressed', String(targetBig));
      }
      drawTarget();

      const statsEl = el('div', { class: 'pz-stats', 'aria-live': 'polite' });
      const chipsEl = el('div', { class: 'pz-chips', 'aria-label': '已出的步驟' });
      const hintEl = el('div', { class: 'pz-hint', role: 'status', hidden: true });
      const btnUndo = el('button', { class: 'pz-btn', 'data-tut': 'btn-undo', 'aria-label': '復原上一步', onclick: () => doUndo(), text: '復原' });
      const btnRedo = el('button', { class: 'pz-btn', 'data-tut': 'btn-redo', 'aria-label': '重做', onclick: () => doRedo(), text: '重做' });
      const btnReset = el('button', { class: 'pz-btn', 'data-tut': 'btn-reset', 'aria-label': '重置本關', onclick: () => doReset(), text: '重置' });
      const btnHint = el('button', { class: 'pz-btn', 'data-tut': 'btn-hint', onclick: () => buyHint() });
      const btnDiff = el('button', { class: 'pz-btn pz-btn-ghost', 'aria-pressed': String(diffOn), 'aria-label': '切換差異提示框', onclick: () => { diffOn = !diffOn; board.setShowDiff(diffOn); btnDiff.setAttribute('aria-pressed', String(diffOn)); btnDiff.textContent = diffOn ? '差異框：開' : '差異框：關'; }, text: diffOn ? '差異框：開' : '差異框：關' });

      const cardsEl = el('div', { class: 'pz-cards', role: 'group', 'aria-label': '工具卡' });
      for (const card of availableCards(level)) {
        cardsEl.append(el('button', {
          class: 'pz-card', 'data-card': card, 'data-tut': `card-${card}`, 'aria-label': `${CARD_NAMES[card]}：${CARD_SUB[card]}`,
          onclick: () => openSheet(card),
        }, el('span', { text: CARD_NAMES[card] }), el('small', { text: CARD_SUB[card] })));
      }

      const legend = el('div', { class: 'pz-legend' });
      const mats = materialsIn(level.init, level.target);
      const legendCodes = [...new Set([...mats, ...((level.cards || []).some((c) => c.card === 'spin') ? ['R', 'r'] : [])])];
      renderLegend(legend, legendCodes);

      const head = el('div', { class: 'pz-head' },
        el('button', { class: 'pz-btn', 'aria-label': '回關卡選單', 'data-tut': 'btn-menu', onclick: () => showMenu(), text: '‹ 關卡' }),
        el('h2', { text: `${level.id.toUpperCase()}  ${level.title}` }),
        el('button', { class: 'pz-btn', 'data-tut': 'btn-exit', 'aria-label': '離開解謎', onclick: finish, text: '離開' }));

      const noteBox = el('details', { class: 'pz-details' }, el('summary', { text: '規則提示與簡化聲明' }),
        el('div', {},
          el('p', { text: '蝕刻只吃指定的一種材料，遇到不同材料或光阻就停。光阻只有「沒有其他材料時」才能旋塗；有光阻時不能沉積。' }),
          el('p', { text: '簡化：不模擬孔洞、等向蝕刻與擴散；佈植為淺層規則化。' })));

      const colBoard = el('div', { class: 'pz-col-board' },
        el('p', { class: 'pz-intro', text: level.intro }),
        el('div', { class: 'pz-boards' },
          el('div', { class: 'pz-board-box' }, targetLabel, targetBtn),
          el('div', { class: 'pz-board-box' }, el('p', { class: 'pz-board-label' }, el('span', { text: '目前剖面' }), btnDiff), boardCv)),
        el('details', { class: 'pz-details' }, el('summary', { text: '材料圖例' }), legend));
      const colCtrl = el('div', { class: 'pz-col-ctrl' },
        statsEl, chipsEl,
        el('div', { class: 'pz-toolbar' }, btnUndo, btnRedo, btnReset, btnHint),
        hintEl, cardsEl, noteBox);

      root.innerHTML = '';
      root.append(el('div', { class: 'pz-wrap' }, head, el('div', { class: 'pz-play' }, colBoard, colCtrl)));
      root.scrollTop = 0;
      onEsc = () => { if (sheetEl) closeSheet(); else showMenu(); };

      function hintCost() { return hintPrice(mult, hintsBought[level.id] || 0); }
      function refresh() {
        const r = session.result();
        const over = r.steps > level.par;
        statsEl.replaceChildren(
          el('span', { class: 'pz-stat' }, '步數 ', el('b', { class: over ? 'pz-over' : '', text: `${r.steps}` }), ` / 標準 ${level.par}（上限 ${level.maxSteps || 20}）`),
          el('span', { class: 'pz-stat' }, '移除 ', el('b', { text: `${r.removals}` }), ` / 最少 ${level.minRemovals}`),
          el('span', { class: 'pz-stat' }, '最佳 ', starsText(best(level.id))));
        chipsEl.replaceChildren();
        const steps = session.steps;
        if (!steps.length) chipsEl.append(el('span', { class: 'pz-chip pz-chip-empty', text: '還沒出牌' }));
        steps.forEach((s, i) => chipsEl.append(el('span', { class: 'pz-chip', text: `${i + 1}. ${describeStep(s)}` })));
        chipsEl.scrollLeft = chipsEl.scrollWidth;
        btnUndo.disabled = busy || !session.canUndo;
        btnRedo.disabled = busy || !session.canRedo;
        btnReset.disabled = busy || (!session.canUndo && !session.canRedo);
        const cost = hintCost();
        btnHint.textContent = hasBridge ? `提示 $${cost}` : '提示';
        btnHint.setAttribute('aria-label', hasBridge ? `買提示，花費 ${cost} 元` : '提示（測試模式免費）');
        cardsEl.querySelectorAll('.pz-card').forEach((c) => { c.disabled = busy; });
        hintEl.hidden = !hintMsg;
        hintEl.textContent = hintMsg;
      }

      async function animateTo(before, after) {
        busy = true;
        refresh();
        await board.transition(before, after);
        busy = false;
      }
      async function doUndo() {
        const before = session.grid;
        if (!session.undo()) return;
        hintMsg = '';
        await animateTo(before, session.grid);
        refresh();
      }
      async function doRedo() {
        const before = session.grid;
        if (!session.redo()) return;
        hintMsg = '';
        await animateTo(before, session.grid);
        refresh();
        checkWin();
      }
      async function doReset() {
        const before = session.grid;
        session.reset();
        hintMsg = '';
        await animateTo(before, session.grid);
        refresh();
      }

      async function buyHint() {
        if (busy) return;
        const k = hintsBought[level.id] || 0;
        const cost = hintCost();
        if (hasBridge) {
          let paid = false;
          try { paid = b.spendMoney(cost, `puzzle-hint:${level.id}`); } catch (e) { paid = false; }
          if (!paid) { toast('資金不足'); return; }
        }
        hintsBought[level.id] = k + 1;
        const info = hintInfo(level, session.steps, k);
        hintMsg = info.text;
        if (info.kind === 'rewind') hintMsg += `（目前有 ${session.stepCount - info.to} 步要復原）`;
        refresh();
      }

      // ---- 參數面板
      function dimsFor(card) {
        const opts2 = paramOptions(level, card);
        const dims = {};
        for (const o of opts2) for (const [k, v] of Object.entries(o)) if (k !== 'card') (dims[k] = dims[k] || []).includes(v) || dims[k].push(v);
        return dims;
      }
      function closeSheet() {
        if (!sheetEl) return;
        sheetEl.back.remove();
        sheetEl.node.remove();
        root.style.paddingBottom = '';
        board.setPreview(null);
        const c = cardsEl.querySelector(`[data-card="${sheetEl.card}"]`);
        sheetEl = null;
        if (c) c.focus({ preventScroll: true });
      }
      function openSheet(card) {
        if (busy || sheetEl) return;
        if (session.won) { toast('本關已完成'); return; }
        const dims = dimsFor(card);
        const sel = {};
        const present = new Set(session.grid.join(''));
        for (const k of Object.keys(dims)) {
          let pick = lastParams[card + k];
          if (pick == null || !dims[k].includes(pick)) pick = dims[k][0];
          if (k === 'stop' && !present.has(pick)) pick = dims[k].find((v) => present.has(v)) ?? pick;
          sel[k] = pick;
        }
        const msg = el('div', { class: 'pz-preview-msg', role: 'status', 'aria-live': 'polite' });
        const btnOk = el('button', { class: 'pz-btn pz-btn-primary', 'data-tut': 'btn-confirm', text: '確認出牌' });
        const btnNo = el('button', { class: 'pz-btn', 'data-tut': 'btn-cancel', onclick: closeSheet, text: '取消' });
        const groups = el('div');

        function currentStep() { return { card, ...sel }; }
        function updatePreview() {
          const step = currentStep();
          const res = session.preview(step);
          if (res.error) {
            board.setPreview(null);
            msg.className = 'pz-preview-msg pz-err';
            msg.textContent = '無法出牌：' + res.error;
            btnOk.disabled = true;
          } else {
            board.setPreview(res.grid);
            const add = diffCells(session.grid, res.grid).length;
            msg.className = 'pz-preview-msg';
            msg.textContent = `預覽：改變 ${add} 格，移除材料 ${res.removed} 格（預覽不計步）`;
            btnOk.disabled = false;
          }
          groups.querySelectorAll('[data-k]').forEach((btn) => btn.setAttribute('aria-pressed', String(String(sel[btn.dataset.k]) === btn.dataset.v)));
        }
        function buildGroups() {
          groups.replaceChildren();
          for (const [k, vals] of Object.entries(dims)) {
            const row = el('div', { class: 'pz-opts' });
            for (const v of vals) {
              let content;
              const attrs = { class: 'pz-opt', 'data-k': k, 'data-v': String(v), 'aria-pressed': 'false', 'data-tut': `param-${k}-${v}` };
              if (k === 'mat' || k === 'stop') {
                const stl = MAT_STYLE[v];
                content = [el('span', { class: 'pz-swatch', style: `background:${stl.fill}`, 'aria-hidden': 'true' }), `${v} ${MATERIALS[v].name}`];
                attrs['aria-label'] = MATERIALS[v].name;
                if (k === 'stop' && !present.has(v)) attrs.disabled = true;
              } else if (k === 'mask') {
                const mk = level.masks.find((x) => x.id === v);
                attrs.class += ' pz-opt-mask';
                content = [maskThumb(mk, 14), `光罩 ${v}`];
              } else content = [String(v)];
              attrs.onclick = () => { sel[k] = v; lastParams[card + k] = v; updatePreview(); };
              row.append(el('button', attrs, ...content));
            }
            groups.append(el('div', { class: 'pz-group' }, el('div', { class: 'pz-group-label', text: PARAM_LABEL[k] || k }), row));
          }
        }
        buildGroups();
        btnOk.addEventListener('click', async () => {
          const step = currentStep();
          const res = session.push(step);
          if (!res.ok) { toast(res.error); updatePreview(); return; }
          closeSheet();
          hintMsg = '';
          await animateTo(res.before, res.after);
          refresh();
          checkWin();
        });

        const back = el('div', { class: 'pz-sheet-back', onclick: closeSheet });
        const node = el('div', { class: 'pz-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': `${CARD_NAMES[card]} 參數` },
          el('h3', { text: `${CARD_NAMES[card]}` }),
          el('p', { class: 'pz-explain', text: CARD_HELP[card] }),
          groups, msg, el('div', { class: 'pz-sheet-actions' }, btnNo, btnOk));
        document.body.append(back, node);
        sheetEl = { back, node, card };
        updatePreview();
        btnOk.focus({ preventScroll: true });
        // 讓目前剖面停在面板上方，預覽才看得到。
        root.style.paddingBottom = node.offsetHeight + 'px';
        const scroller = root.classList.contains('pz-overlay') ? root : window;
        const over = boardCv.getBoundingClientRect().bottom - node.getBoundingClientRect().top + 8;
        if (over > 0) scroller.scrollBy({ top: over, behavior: 'auto' });
      }

      // ---- 勝利
      function checkWin() {
        if (!session.won) return;
        const r = session.result();
        sessionStars[level.id] = Math.max(sessionStars[level.id] || 0, r.stars);
        memStars[fabId] = { ...(memStars[fabId] || {}), [level.id]: Math.max((memStars[fabId] || {})[level.id] || 0, r.stars) };
        refresh();
        showResult(level, r, session, hintsBought[level.id] || 0);
      }

      function showResult(lv, r, sess, hintsUsed) {
        const idx = levels.indexOf(lv);
        const next = levels[idx + 1];
        const factBox = el('div', { class: 'pz-fact', hidden: true }, el('b', { text: '你知道嗎？' }), el('span'));
        factText(lv.factId).then((t) => {
          if (!t) return;
          factBox.hidden = false;
          factBox.lastChild.textContent = t;
          call('markFactSeen', lv.factId);
        });
        const crit = el('ul', { class: 'pz-crit' },
          el('li', {}, el('span', { class: 'pz-ok', text: '★ 完成：剖面完全吻合' })),
          el('li', {}, el('span', { class: r.steps <= lv.par ? 'pz-ok' : 'pz-no', text: `${r.steps <= lv.par ? '★' : '☆'} 步數 ${r.steps} ≤ 標準 ${lv.par}` })),
          el('li', {}, el('span', { class: r.stars === 3 ? 'pz-ok' : 'pz-no', text: `${r.stars === 3 ? '★' : '☆'} 零浪費：移除 ${r.removals}，最少 ${lv.minRemovals}，浪費 ${r.waste}` })));
        const actions = el('div', { class: 'pz-result-actions' });
        if (next) actions.append(el('button', { class: 'pz-btn pz-btn-primary', 'data-tut': 'btn-next', onclick: () => { back.remove(); showLevel(next); }, text: `下一關：${next.title}` }));
        actions.append(
          el('button', { class: 'pz-btn', onclick: async () => { back.remove(); await doReset(); }, text: r.stars < 3 ? '再試一次，拿更多星' : '重玩這關' }),
          el('button', { class: 'pz-btn', onclick: () => { back.remove(); showMenu(); }, text: '回關卡選單' }));
        const box = el('div', { class: 'pz-result', role: 'dialog', 'aria-modal': 'true', 'aria-label': '過關結算' },
          el('h3', { text: `${lv.title} 完成！` }),
          el('div', { class: 'pz-big-stars pz-pop' }, starsText(r.stars)),
          crit,
          hintsUsed ? el('p', { class: 'pz-no', text: `本關使用過 ${hintsUsed} 次提示` }) : null,
          lv.note ? el('p', { class: 'pz-no', text: lv.note }) : null,
          factBox, actions);
        const back = el('div', { class: 'pz-result-back' }, box);
        document.body.append(back);
        (actions.firstChild).focus({ preventScroll: true });
        const prevEsc = onEsc;
        onEsc = () => { back.remove(); onEsc = prevEsc; };
        const mo = new MutationObserver(() => { if (!back.isConnected) { onEsc = () => (sheetEl ? closeSheet() : showMenu()); mo.disconnect(); } });
        mo.observe(document.body, { childList: true });
      }

      cleanup = () => {
        board.destroy();
        closeSheet();
        document.querySelectorAll('.pz-result-back, .pz-toast').forEach((n) => n.remove());
      };
      refresh();
    }

    if (opts.levelId && levels.some((l) => l.id === opts.levelId)) showLevel(levels.find((l) => l.id === opts.levelId));
    else showMenu();
  });
}

if (typeof window !== 'undefined') window.startPuzzleSet = startPuzzleSet;

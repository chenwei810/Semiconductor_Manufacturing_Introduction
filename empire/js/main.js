// 晶圓帝國：啟動、標題畫面、hash 路由（DESIGN §2）、總覽、音效、教學；
// 把經營層（tycoon）與解謎層（puzzle）接在一起。
import { bus } from './shared/bus.js';
import { loadSave } from './shared/storage.js';
import { getFactText } from './shared/content.js';
import { bootTycoon } from './tycoon/boot.js';
import * as Clock from './tycoon/clock.js';
import { fabStatsNow } from './tycoon/sim.js';
import { openUnlockSheet } from './tycoon/unlock-view.js';
import { el, fill, openDialog, toast, money, pct } from './tycoon/ui.js';
import './puzzle/index.js'; // 註冊 window.startPuzzleSet，取代 bridge 的 stub
import * as Audio from './audio.js';
import { createTutorial } from './tutorial.js';

const $ = id => document.getElementById(id);
const parse = h => { const p = (h || '').replace(/^#/, '').split('/'); return { name: p[0] || 'title', arg: p[1] || '' }; };
const replaceHash = h => { try { history.replaceState(null, '', h); } catch (e) { location.hash = h; } };

let S = null, view = null, tut = null;
let screen = 'title';       // 'title' | 'game'
let curView = 'hub';        // 'hub' | 'fab'
let titleLock = false;
let unlockDlg = null, unlockPushed = false, goFab = null;
let puzzleActive = false;

// ---------------- 音效 ----------------
function installAudio() {
  const arm = () => Audio.unlockAudio();
  document.addEventListener('pointerdown', arm, true);
  document.addEventListener('keydown', arm, true);
  document.addEventListener('click', e => {
    const b = e.target.closest?.('button, [role="button"], a[href]');
    if (b && !b.disabled) Audio.sfx.click();
  }, true);
  bus.on('money:spent', () => Audio.sfx.purchase());
  bus.on('event:trigger', () => Audio.sfx.alarm());
  bus.on('fab:unlocked', () => Audio.sfx.clear());
  // 解謎過關：結算層加入 body 時播放；依星數播放星星音
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType === 1 && n.classList.contains('pz-result-back')) {
        Audio.sfx.clear();
        const stars = n.querySelectorAll('.pz-big-stars .pz-star-on').length;
        for (let i = 0; i < stars; i++) setTimeout(() => Audio.sfx.star(i), 350 + i * 180);
      }
    }
  }).observe(document.body, { childList: true });
}
function muteButton(cls = 'we-btn') {
  const b = el('button', { class: cls + ' we-mute', type: 'button' });
  const sync = () => {
    const m = Audio.isMuted();
    b.textContent = m ? '音效：關' : '音效：開';
    b.setAttribute('aria-pressed', String(!m));
    b.setAttribute('aria-label', m ? '開啟音效' : '關閉音效');
  };
  b.addEventListener('click', () => Audio.toggleMute());
  Audio.onMuteChange(sync);
  sync();
  return b;
}

// ---------------- 畫面切換 ----------------
function setTitleLock(on) {
  if (on && !titleLock) { Clock.lock(); titleLock = true; }
  else if (!on && titleLock) { Clock.unlock(); titleLock = false; }
}
function showTitle() {
  screen = 'title';
  $('screen-title').hidden = false;
  $('screen-game').hidden = true;
  setTitleLock(true);
  renderTitle();
}
function enterGame() {
  screen = 'game';
  $('screen-title').hidden = true;
  $('screen-game').hidden = false;
  setTitleLock(false);
}
function showView(name) {
  curView = name;
  $('view-hub').hidden = name !== 'hub';
  $('view-fab').hidden = name !== 'fab';
  document.querySelectorAll('[data-nav]').forEach(b => b.setAttribute('aria-current', String(b.dataset.nav === name)));
  if (name === 'hub') renderHub();
}

// ---------------- 路由 ----------------
function closeUnlock() { unlockDlg?.close(); }
function exitPuzzle() { document.querySelector('#puzzle-root [data-tut="btn-exit"]')?.click(); }

function route() {
  const { name, arg } = parse(location.hash);
  if (!S) return;
  if (name === 'title') { if (puzzleActive) exitPuzzle(); closeUnlock(); showTitle(); return; }
  if (screen !== 'game') {
    if (!loadSave().ok && !S.getState().savedAt) { replaceHash('#title'); showTitle(); return; }
    enterGame();
  }
  const bal = S.getBal();
  const fabId = arg.split('-')[0];
  const validFab = bal.fabOrder.includes(fabId);

  if (name === 'puzzle') {
    if (puzzleActive) return;
    replaceHash(validFab ? '#unlock/' + fabId : '#hub');
    route(); return;
  }
  if (puzzleActive) exitPuzzle();
  if (name === 'unlock' && validFab) {
    if (!$('view-hub').hidden || !$('view-fab').hidden) { /* 保持底下畫面 */ } else showView('hub');
    if (!unlockDlg || unlockDlg.fabId !== fabId) { closeUnlock(); openUnlockSheet(fabId); }
    return;
  }
  closeUnlock();
  if (name === 'fab' && validFab) {
    if (!S.isUnlocked(fabId)) { replaceHash('#unlock/' + fabId); route(); return; }
    view.setFab(fabId);
    showView('fab');
    return;
  }
  if (name !== 'hub') replaceHash('#hub');
  showView('hub');
}

function installRouterEvents() {
  window.addEventListener('hashchange', route);
  bus.on('unlock:open', ({ fabId, dlg }) => {
    unlockDlg = dlg; dlg.fabId = fabId;
    const h = '#unlock/' + fabId;
    if (location.hash !== h) { unlockPushed = true; location.hash = h; } else unlockPushed = false;
  });
  bus.on('unlock:close', () => {
    unlockDlg = null;
    if (parse(location.hash).name === 'unlock') {
      if (goFab) { const f = goFab; goFab = null; replaceHash('#fab/' + f); route(); return; }
      if (unlockPushed) history.back();
      else { replaceHash(curView === 'fab' ? '#fab/' + view.getFab() : '#hub'); }
    }
  });
  bus.on('fab:unlocked', ({ fabId }) => { goFab = fabId; });
  bus.on('puzzle:start', ({ fabId }) => {
    puzzleActive = true;
    const h = '#puzzle/' + fabId;
    if (location.hash !== h) location.hash = h;
  });
  bus.on('puzzle:end', () => {
    puzzleActive = false;
    if (parse(location.hash).name === 'puzzle') history.back();
  });
  bus.on('puzzle:applied', ({ fabId }) => {
    const bal = S.getBal();
    const r = S.starRatio(fabId);
    toast(`${bal.fabs[fabId].zh} 解謎星數比 S = ${pct(r, 0)}，缺陷率 ×${(1 - bal.yield.starHalf * r).toFixed(2)}`, 3600);
  });
}

// ---------------- 標題 ----------------
let hadSave = false;
function renderTitle() {
  const menu = $('title-menu');
  const items = [];
  const startNew = () => {
    Audio.unlockAudio();
    S.resetGame();
    S.save();
    enterGame();
    location.hash = '#fab/f1';
    route();
    tut.start({ fresh: true });
  };
  if (hadSave) {
    items.push(el('button', { class: 'we-btn we-btn--primary', type: 'button', text: '繼續遊戲', onclick: () => {
      Audio.unlockAudio();
      S.getState().clock.paused = true;
      enterGame();
      if (tut.needsResume()) { location.hash = '#fab/f1'; route(); tut.start(); }
      else { location.hash = '#hub'; route(); }
    } }));
    items.push(el('button', { class: 'we-btn we-btn--danger', type: 'button', text: '新遊戲（覆蓋存檔）', onclick: function () {
      if (this.dataset.armed) startNew();
      else { this.dataset.armed = '1'; this.textContent = '再按一次確認：舊存檔將被清除'; }
    } }));
  } else {
    items.push(el('button', { class: 'we-btn we-btn--primary', type: 'button', text: '新遊戲', onclick: startNew }));
  }
  items.push(muteButton());
  fill(menu, items);
}

// ---------------- 工具列 / 總覽 / 圖鑑 ----------------
function mountBar() {
  const nav = (txt, h, key) => el('button', { class: 'we-btn', type: 'button', text: txt, 'data-nav': key, onclick: () => { location.hash = h; } });
  fill($('we-bar'),
    el('span', { class: 'we-brand' }, '晶圓', el('i', { text: '帝國' })),
    nav('總覽', '#hub', 'hub'),
    nav('產線', '#fab/f1', 'fab-link'),
    el('button', { class: 'we-btn', type: 'button', text: '圖鑑', onclick: openCodex }),
    el('button', { class: 'we-btn', type: 'button', text: '教學', 'aria-label': '重看教學', onclick: () => {
      location.hash = '#fab/f1'; route(); tut.start({ fresh: true });
    } }),
    muteButton(),
    el('button', { class: 'we-btn', type: 'button', text: '標題', onclick: () => { location.hash = '#title'; } }));
  // 「產線」按鈕：回到目前選的廠
  $('we-bar').querySelector('[data-nav="fab-link"]').onclick = () => { location.hash = '#fab/' + view.getFab(); };
}

function renderHub() {
  if ($('view-hub').hidden) return;
  const bal = S.getBal(), s = S.getState();
  const cards = bal.fabOrder.map(id => {
    const f = bal.fabs[id], open = S.isUnlocked(id), r = S.starRatio(id);
    const nStars = Object.entries(s.puzzle.stars).filter(([k]) => k.startsWith(id + '-')).reduce((a, [, n]) => a + n, 0);
    const starTxt = '★'.repeat(nStars) + '☆'.repeat(f.puzzleLevels * 3 - nStars);
    let body;
    if (open) {
      const st = fabStatsNow(id);
      body = [
        ['線良率 Y', st.complete ? pct(st.Y) : '缺機台'], ['產能', st.interval ? `${Math.round(st.wafersPerDay)} 片/日` : '—'],
        ['庫存', `${s.res.inv[id]} 片`], ['解謎星數比 S', pct(r, 0)]];
    } else {
      const u = S.unlockStatus(id);
      body = [
        ['解謎', `${u.puzzle.have} / ${u.puzzle.need} 關`], ['解鎖金', money(f.unlockMoney)],
        ['聲望門檻', String(f.unlockRep)], ['星數比 S', pct(r, 0)]];
    }
    return el('article', { class: 'we-card' + (open ? '' : ' is-locked'), 'aria-label': `${f.zh} ${f.node}` },
      el('h3', {}, f.zh, el('small', { text: `${f.node} · ${f.wafer}` }), el('span', { class: 'we-tag' + (open ? ' we-tag--on' : ''), text: open ? '已開通' : '未開通' })),
      el('dl', {}, body.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])),
      el('div', { class: 'we-stars', 'aria-label': `星數 ${nStars} / ${f.puzzleLevels * 3}`, text: starTxt }),
      el('button', { class: 'we-btn ' + (open ? 'we-btn--primary' : ''), type: 'button', 'data-tut': 'hub-' + id,
        text: open ? '進入產線' : '解鎖條件 / 製程解謎', onclick: () => { location.hash = open ? '#fab/' + id : '#unlock/' + id; } }));
  });
  fill($('hub-cards'), cards);
}

function openCodex() {
  Clock.lock();
  const dlg = openDialog({ title: '知識圖鑑', onClose: () => Clock.unlock() });
  const ids = S.getState().seenFacts;
  fill(dlg.body,
    el('p', { class: 'ty-muted', text: `已解鎖 ${ids.length} 則知識（通關與事件會解鎖）。` }),
    ids.length ? el('ul', { class: 'we-list' }, ids.map(id => el('li', { text: getFactText(id) }))) : el('p', { text: '還沒有。去玩一關或等待一個事件吧。' }));
}

// ---------------- 啟動 ----------------
async function main() {
  const err = $('title-err');
  hadSave = loadSave().ok;
  installAudio();
  try {
    const r = await bootTycoon({ hudRoot: $('hud'), fabRoot: $('fab') });
    S = r.S; view = r.view;
  } catch (e) {
    console.error(e);
    err.hidden = false;
    err.textContent = location.protocol === 'file:'
      ? '無法載入資料：請用本機伺服器開啟（例如 python -m http.server），不要直接雙擊 index.html。'
      : '載入失敗，請重新整理頁面。';
    fill($('title-menu'));
    return;
  }
  // 以標題畫面開始：時鐘暫停並鎖住，直到玩家進入遊戲
  S.getState().clock.paused = true;
  Clock.setPaused(true);
  Audio.setVolumeSource(() => S.getState().settings.sound);
  tut = createTutorial();
  mountBar();
  installRouterEvents();
  bus.on('state:changed', renderHub);
  bus.on('day', renderHub);
  bus.on('tick', () => { if (S.getState().clock.tick % 4 === 0) renderHub(); });
  bus.on('state:reset', () => { if (screen === 'game') { location.hash = '#hub'; } });
  window.EmpireApp = { S, route, tut }; // 方便除錯與驗證
  route();
}
main();

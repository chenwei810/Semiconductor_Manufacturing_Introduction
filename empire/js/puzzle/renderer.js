// 剖面 Canvas 繪製：每種材料一個顏色＋圖樣＋單字母（色盲／黑白也能辨識）。無外部相依，僅在瀏覽器使用。
import { diffCells } from './engine.js';

export const MAT_STYLE = {
  '.': { fill: null, ink: '#8a93a6', name: '空氣', pattern: 'none' },
  S: { fill: '#6b86b4', ink: '#ffffff', name: '矽基板', pattern: 'dots' },
  D: { fill: '#8a63d2', ink: '#ffffff', name: '摻雜矽', pattern: 'dots2' },
  O: { fill: '#8fe0dc', ink: '#0b4a47', name: 'SiO₂', pattern: 'slash' },
  P: { fill: '#f0953a', ink: '#4a2400', name: '多晶矽', pattern: 'vbars' },
  M: { fill: '#e8c547', ink: '#4a3a00', name: '金屬', pattern: 'grid' },
  R: { fill: '#f4a0ba', ink: '#5a1030', name: '光阻', pattern: 'backslash' },
  r: { fill: '#fbdde8', ink: '#8a2a52', name: '已曝光光阻', pattern: 'backslash-dash' },
};
const LEGEND_ORDER = ['S', 'D', 'O', 'P', 'M', 'R', 'r'];

export const COLS = 12;
export const ROWS = 8;

export function cellSizeFor(viewportWidth, max = 40) {
  return Math.max(16, Math.min(max, Math.floor((viewportWidth - 32) / COLS)));
}

function pattern(ctx, kind, x, y, s, ink) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, s, s);
  ctx.clip();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.globalAlpha *= 0.35;
  ctx.lineWidth = Math.max(1, s / 20);
  const step = Math.max(4, s / 4);
  switch (kind) {
    case 'dots':
    case 'dots2': {
      const st = kind === 'dots' ? s / 3 : s / 4.5;
      for (let i = st / 2; i < s; i += st) for (let j = st / 2; j < s; j += st) ctx.fillRect(x + i, y + j, 1.5, 1.5);
      break;
    }
    case 'slash':
      for (let i = -s; i < s * 2; i += step) { ctx.beginPath(); ctx.moveTo(x + i, y + s); ctx.lineTo(x + i + s, y); ctx.stroke(); }
      break;
    case 'backslash':
    case 'backslash-dash':
      if (kind === 'backslash-dash') ctx.setLineDash([3, 3]);
      for (let i = -s; i < s * 2; i += step) { ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i + s, y + s); ctx.stroke(); }
      break;
    case 'vbars':
      for (let i = step / 2; i < s; i += step) { ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i, y + s); ctx.stroke(); }
      break;
    case 'grid':
      for (let i = step / 2; i < s; i += step) {
        ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i, y + s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + i); ctx.lineTo(x + s, y + i); ctx.stroke();
      }
      break;
    default:
  }
  ctx.restore();
}

export function drawCell(ctx, ch, x, y, s, { alpha = 1, letters = true } = {}) {
  const st = MAT_STYLE[ch];
  if (!st || !st.fill) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = st.fill;
  ctx.fillRect(x, y, s, s);
  pattern(ctx, st.pattern, x, y, s, st.ink);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
  if (letters && s >= 18) {
    ctx.fillStyle = st.ink;
    ctx.font = `bold ${Math.floor(s * 0.45)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, x + s / 2, y + s / 2 + 1);
  }
  ctx.restore();
}

function drawBackdrop(ctx, cell, w, h, dark) {
  ctx.save();
  ctx.fillStyle = dark ? '#141a26' : '#f3f6fb';
  ctx.fillRect(0, 0, w * cell, h * cell);
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let c = 1; c < w; c++) { ctx.beginPath(); ctx.moveTo(c * cell + 0.5, 0); ctx.lineTo(c * cell + 0.5, h * cell); ctx.stroke(); }
  for (let r = 1; r < h; r++) { ctx.beginPath(); ctx.moveTo(0, r * cell + 0.5); ctx.lineTo(w * cell, r * cell + 0.5); ctx.stroke(); }
  ctx.restore();
}

const prefersDark = () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;

function setupCanvas(canvas, cell) {
  const dpr = Math.min(3, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
  canvas.width = COLS * cell * dpr;
  canvas.height = ROWS * cell * dpr;
  canvas.style.width = COLS * cell + 'px';
  canvas.style.height = ROWS * cell + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

// 靜態縮圖（目標預覽等）
export function drawThumb(canvas, grid, cell) {
  const ctx = setupCanvas(canvas, cell);
  drawBackdrop(ctx, cell, COLS, ROWS, prefersDark());
  grid.forEach((row, r) => [...row].forEach((ch, c) => drawCell(ctx, ch, c * cell, r * cell, cell, { letters: cell >= 22 })));
}

// 光罩縮圖：12 欄，透光欄亮起。回傳 canvas。
export function maskThumb(mask, cell = 14) {
  const cv = document.createElement('canvas');
  const ctx = setupCanvas(cv, cell);
  cv.style.height = cell + 'px';
  cv.height = Math.ceil(cell * ((typeof devicePixelRatio === 'number' && devicePixelRatio) || 1));
  const dpr = cv.height / cell;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const open = new Set();
  for (const [a, b] of mask.open) for (let c = a; c <= b; c++) open.add(c);
  for (let c = 0; c < COLS; c++) {
    ctx.fillStyle = open.has(c) ? '#fff3b0' : '#3a3f4b';
    ctx.fillRect(c * cell + 1, 1, cell - 2, cell - 2);
    if (open.has(c)) { ctx.strokeStyle = '#d4a900'; ctx.strokeRect(c * cell + 1.5, 1.5, cell - 3, cell - 3); }
  }
  cv.setAttribute('role', 'img');
  cv.setAttribute('aria-label', `光罩 ${mask.id}：透光欄 ` + mask.open.map(([a, b]) => (a === b ? a : `${a}–${b}`)).join('、'));
  return cv;
}

// 圖例：只列出傳入的材料碼（預設全部固體材料）。
export function renderLegend(el, codes = LEGEND_ORDER) {
  el.textContent = '';
  for (const ch of codes) {
    const st = MAT_STYLE[ch];
    if (!st || !st.fill) continue;
    const item = document.createElement('span');
    item.className = 'pz-legend-item';
    const cv = document.createElement('canvas');
    setupCanvas(cv, 18);
    cv.width = cv.height = 18 * (cv.width / (COLS * 18));
    const dpr = cv.width / 18;
    cv.style.width = cv.style.height = '18px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCell(ctx, ch, 0, 0, 18, { letters: true });
    cv.setAttribute('aria-hidden', 'true');
    item.append(cv, document.createTextNode(` ${ch} ${st.name}`));
    el.append(item);
  }
}

export function materialsIn(...grids) {
  const set = new Set();
  for (const g of grids) for (const row of g) for (const ch of row) if (ch !== '.') set.add(ch);
  return LEGEND_ORDER.filter((c) => set.has(c));
}

// 互動剖面：目前剖面／預覽／差異框／轉場動畫
export function createBoardRenderer(canvas, opts = {}) {
  let cell = opts.cell || 28;
  let grid = opts.grid || Array(ROWS).fill('.'.repeat(COLS));
  let target = null;
  let showDiff = opts.showDiff !== false;
  let preview = null;
  let reduceMotion = !!opts.reduceMotion;
  let raf = 0;
  let animState = null; // { from, to, t }
  let ctx = setupCanvas(canvas, cell);

  function paint() {
    const dark = prefersDark();
    drawBackdrop(ctx, cell, COLS, ROWS, dark);
    const base = animState ? animState.to : grid;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * cell, y = r * cell;
        if (animState) {
          const a = animState.from[r][c], b = animState.to[r][c], t = animState.t;
          if (a === b) { drawCell(ctx, b, x, y, cell); continue; }
          if (a !== '.') drawCell(ctx, a, x, y, cell, { alpha: 1 - t });
          if (b !== '.') drawCell(ctx, b, x, y, cell, { alpha: t });
        } else {
          drawCell(ctx, base[r][c], x, y, cell);
        }
      }
    }
    if (preview && !animState) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const a = grid[r][c], b = preview[r][c];
          if (a === b) continue;
          const x = c * cell, y = r * cell;
          if (b === '.') {
            ctx.save();
            ctx.fillStyle = 'rgba(255,60,60,0.45)';
            ctx.fillRect(x, y, cell, cell);
            ctx.strokeStyle = '#ff2a2a';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + cell - 4, y + cell - 4);
            ctx.moveTo(x + cell - 4, y + 4); ctx.lineTo(x + 4, y + cell - 4); ctx.stroke();
            ctx.restore();
          } else {
            ctx.clearRect(x, y, cell, cell);
            drawBackdropCell(ctx, x, y, cell, dark);
            drawCell(ctx, b, x, y, cell, { alpha: 0.65 });
            ctx.save();
            ctx.strokeStyle = '#ffd400';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
            ctx.restore();
          }
        }
      }
    }
    if (showDiff && target && !animState) {
      const ref = preview || grid;
      ctx.save();
      ctx.strokeStyle = 'rgba(230,40,40,0.9)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      for (const [r, c] of diffCells(ref, target)) ctx.strokeRect(c * cell + 2, r * cell + 2, cell - 4, cell - 4);
      ctx.restore();
    }
  }
  function drawBackdropCell(c2, x, y, s, dark) {
    c2.save();
    c2.fillStyle = dark ? '#141a26' : '#f3f6fb';
    c2.fillRect(x, y, s, s);
    c2.restore();
  }

  const api = {
    get cell() { return cell; },
    setCell(n) { cell = n; ctx = setupCanvas(canvas, cell); paint(); },
    setGrid(g) { cancelAnimationFrame(raf); animState = null; grid = g; preview = null; paint(); },
    setTarget(t) { target = t; paint(); },
    setShowDiff(b) { showDiff = !!b; paint(); },
    setReduceMotion(b) { reduceMotion = !!b; },
    setPreview(g) { preview = g; paint(); },
    refresh: paint,
    // 轉場：舊→新逐格淡入淡出（reduceMotion 時直接跳格）。回傳 Promise。
    transition(from, to, ms = 380) {
      cancelAnimationFrame(raf);
      grid = to;
      preview = null;
      if (reduceMotion || from === to) { animState = null; paint(); return Promise.resolve(); }
      return new Promise((resolve) => {
        const t0 = performance.now();
        let done = false;
        const end = () => {
          if (done) return;
          done = true;
          clearTimeout(guard);
          cancelAnimationFrame(raf);
          animState = null;
          paint();
          resolve();
        };
        // rAF 在背景分頁會暫停，用計時器保底，避免 UI 卡在 busy。
        const guard = setTimeout(end, ms + 250);
        const tick = (now) => {
          if (done) return;
          const t = Math.min(1, (now - t0) / ms);
          animState = { from, to, t: t * t * (3 - 2 * t) };
          paint();
          if (t < 1) raf = requestAnimationFrame(tick);
          else end();
        };
        raf = requestAnimationFrame(tick);
      });
    },
    destroy() { cancelAnimationFrame(raf); },
  };
  paint();
  return api;
}

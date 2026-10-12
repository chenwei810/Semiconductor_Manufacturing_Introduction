// 《晶圓帝國》製程解謎引擎 — 純函式、無 DOM、無 window，可直接在 Node 執行。
// 格模型與卡牌語意見 empire/DESIGN.md §4。
// grid 一律是長度 h 的字串陣列（列 0 在最上），每字元是材料碼（§4.1）。

export const W = 12;
export const H = 8;

export const MATERIALS = {
  '.': { name: '空氣' },
  S: { name: '矽基板' },
  D: { name: '摻雜矽' },
  O: { name: 'SiO₂' },
  P: { name: '多晶矽' },
  M: { name: '金屬' },
  R: { name: '光阻' },
  r: { name: '已曝光光阻' },
};

export const CARD_NAMES = {
  deposit: '沉積',
  spin: '旋塗光阻',
  expose: '曝光',
  develop: '顯影',
  etch: '蝕刻',
  implant: '離子佈植',
  cmp: 'CMP 研磨',
  strip: '去光阻',
};

export const CARD_ORDER = ['deposit', 'spin', 'expose', 'develop', 'etch', 'implant', 'cmp', 'strip'];

const DEFAULT_RANGES = {
  deposit: { mats: ['O', 'P', 'M'], t: [1, 2, 3] },
  etch: { mats: ['S', 'D', 'O', 'P', 'M'], depth: [1, 2, 3, 4] },
  implant: { depth: [1, 2] },
  cmp: { stops: ['S', 'D', 'O', 'P', 'M'] },
};

export const isResist = (ch) => ch === 'R' || ch === 'r';

const fail = (grid, error) => ({ grid, removed: 0, error });

function toCells(grid) {
  return grid.map((row) => row.split(''));
}
function fromCells(cells) {
  return cells.map((row) => row.join(''));
}
function topOf(cells, c) {
  for (let r = 0; r < cells.length; r++) if (cells[r][c] !== '.') return r;
  return cells.length;
}

export function maskColumns(level, maskId) {
  const m = (level.masks || []).find((x) => x.id === maskId);
  if (!m) return null;
  const set = new Set();
  for (const [a, b] of m.open) for (let c = a; c <= b; c++) set.add(c);
  return set;
}

export function gridEquals(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function hasResist(grid) {
  return grid.some((row) => /[Rr]/.test(row));
}

export function diffCells(grid, target) {
  const out = [];
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++) if (grid[r][c] !== target[r][c]) out.push([r, c]);
  return out;
}

// 卡牌是否被本關允許、參數是否在範圍內。回傳錯誤字串或 null。
function checkAllowed(step, level) {
  const card = step && step.card;
  if (!CARD_NAMES[card]) return '未知的卡牌';
  let def = null;
  if (level && Array.isArray(level.cards)) {
    def = level.cards.find((c) => c.card === card);
    if (!def) return '本關不能使用這張卡';
  }
  const inList = (v, list) => Array.isArray(list) && list.includes(v);
  const rng = (key, k) => (def && def[k]) || (DEFAULT_RANGES[key] && DEFAULT_RANGES[key][k]);
  switch (card) {
    case 'deposit':
      if (!inList(step.mat, rng('deposit', 'mats'))) return '請選擇沉積材料';
      if (!inList(step.t, rng('deposit', 't'))) return '請選擇沉積厚度';
      break;
    case 'etch':
      if (!inList(step.mat, rng('etch', 'mats'))) return '請選擇蝕刻材料';
      if (!inList(step.depth, rng('etch', 'depth'))) return '請選擇蝕刻深度';
      break;
    case 'implant':
      if (!inList(step.depth, rng('implant', 'depth'))) return '請選擇佈植深度';
      break;
    case 'cmp': {
      const stops = (def && (def.stops || def.mats)) || DEFAULT_RANGES.cmp.stops;
      if (!inList(step.stop, stops)) return '請選擇研磨停止層';
      break;
    }
    case 'expose':
      if (!level || !(level.masks || []).some((m) => m.id === step.mask)) return '請選擇光罩';
      break;
    default:
  }
  return null;
}

// 核心：套用一步。無效或不改變任何格 → { grid(原樣), removed:0, error }。
export function applyStep(grid, step, level) {
  const bad = checkAllowed(step, level);
  if (bad) return fail(grid, bad);
  const cells = toCells(grid);
  const h = cells.length;
  const w = cells[0].length;
  let removed = 0;
  let changed = false;
  const remove = (r, c) => {
    if (!isResist(cells[r][c])) removed++;
    cells[r][c] = '.';
    changed = true;
  };

  switch (step.card) {
    case 'deposit': {
      // 光阻怕高溫，且若允許「在光阻上沉積再 strip」會出現 lift-off 捷徑，所以有光阻時不能沉積。
      if (hasResist(grid)) return fail(grid, '晶圓上還有光阻，請先去光阻再沉積');
      const t = step.t;
      for (let c = 0; c < w; c++) if (topOf(cells, c) - t < 0) return fail(grid, '材料溢出剖面上緣，請減少厚度');
      for (let c = 0; c < w; c++) {
        const top = topOf(cells, c);
        for (let k = 1; k <= t; k++) cells[top - k][c] = step.mat;
      }
      changed = true;
      break;
    }
    case 'spin': {
      if (hasResist(grid)) return fail(grid, '晶圓上已有光阻，請先去光阻');
      let min = h;
      for (let c = 0; c < w; c++) min = Math.min(min, topOf(cells, c));
      const m = min - 1;
      if (m < 0) return fail(grid, '剖面太高，光阻塗不下');
      for (let c = 0; c < w; c++) {
        const top = topOf(cells, c);
        for (let r = m; r < top; r++) cells[r][c] = 'R';
      }
      changed = true;
      break;
    }
    case 'expose': {
      const cols = maskColumns(level, step.mask);
      for (const c of cols)
        for (let r = 0; r < h; r++)
          if (cells[r][c] === 'R') {
            cells[r][c] = 'r';
            changed = true;
          }
      if (!changed) return fail(grid, '透光區內沒有未曝光的光阻');
      break;
    }
    case 'develop': {
      for (let c = 0; c < w; c++)
        for (let r = 0; r < h; r++)
          if (cells[r][c] === 'r') {
            cells[r][c] = '.';
            changed = true;
          }
      if (!changed) return fail(grid, '沒有已曝光的光阻可顯影');
      break;
    }
    case 'etch': {
      for (let c = 0; c < w; c++) {
        const top = topOf(cells, c);
        if (top >= h || isResist(cells[top][c])) continue;
        for (let k = 0; k < step.depth; k++) {
          const t = topOf(cells, c);
          if (t >= h || cells[t][c] !== step.mat) break;
          remove(t, c);
        }
      }
      if (!changed) return fail(grid, '沒有可蝕刻的' + MATERIALS[step.mat].name + '（光阻保護或材料不符）');
      break;
    }
    case 'implant': {
      for (let c = 0; c < w; c++) {
        const top = topOf(cells, c);
        for (let k = 0; k < step.depth; k++) {
          const r = top + k;
          if (r >= h || cells[r][c] !== 'S') break;
          cells[r][c] = 'D';
          changed = true;
        }
      }
      if (!changed) return fail(grid, '離子被擋住了，沒有任何矽被摻雜');
      break;
    }
    case 'cmp': {
      let rs = -1;
      for (let r = 0; r < h && rs < 0; r++) for (let c = 0; c < w; c++) if (cells[r][c] === step.stop) { rs = r; break; }
      if (rs < 0) return fail(grid, '剖面上沒有' + MATERIALS[step.stop].name + '可當停止層');
      for (let r = 0; r < rs; r++) for (let c = 0; c < w; c++) if (cells[r][c] !== '.') remove(r, c);
      if (!changed) return fail(grid, '表面已經平坦，研磨沒有效果');
      break;
    }
    case 'strip': {
      for (let c = 0; c < w; c++) {
        let low = -1;
        for (let r = h - 1; r >= 0; r--) if (isResist(cells[r][c])) { low = r; break; }
        if (low < 0) continue;
        for (let r = 0; r <= low; r++) if (cells[r][c] !== '.') remove(r, c);
      }
      if (!changed) return fail(grid, '沒有光阻可去除');
      break;
    }
    default:
      return fail(grid, '未知的卡牌');
  }
  return { grid: fromCells(cells), removed, error: null };
}

// 重播步驟序列。遇到無效步驟即停止並回報。
export function replay(level, steps) {
  let grid = level.init;
  let removals = 0;
  const history = [{ grid, removals: 0 }];
  for (let i = 0; i < steps.length; i++) {
    const res = applyStep(grid, steps[i], level);
    if (res.error) return { grid, removals, steps: i, history, error: res.error, errorIndex: i };
    grid = res.grid;
    removals += res.removed;
    history.push({ grid, removals });
  }
  return { grid, removals, steps: steps.length, history, error: null };
}

export function isWin(grid, level) {
  return gridEquals(grid, level.target) && !hasResist(grid);
}

export function starsFor(level, won, steps, removals) {
  const waste = Math.max(0, removals - level.minRemovals);
  if (!won) return { stars: 0, waste };
  let stars = 1;
  if (steps <= level.par) {
    stars = 2;
    if (waste === 0) stars = 3;
  }
  return { stars, waste };
}

// 一次評估整段步驟。
export function evaluate(level, steps) {
  const r = replay(level, steps);
  const won = !r.error && isWin(r.grid, level);
  const { stars, waste } = starsFor(level, won, r.steps, r.removals);
  return { won, stars, waste, steps: r.steps, removals: r.removals, grid: r.grid, error: r.error };
}

export function stepsEqual(a, b) {
  return (
    a.card === b.card && a.mat === b.mat && a.t === b.t && a.depth === b.depth && a.mask === b.mask && a.stop === b.stop
  );
}

// 列舉某卡在本關的所有參數組合（供 UI 與 BFS）。
export function paramOptions(level, card) {
  const def = (level.cards || []).find((c) => c.card === card) || {};
  const base = DEFAULT_RANGES[card] || {};
  switch (card) {
    case 'deposit': {
      const out = [];
      for (const mat of def.mats || base.mats) for (const t of def.t || base.t) out.push({ card, mat, t });
      return out;
    }
    case 'etch': {
      const out = [];
      for (const mat of def.mats || base.mats) for (const depth of def.depth || base.depth) out.push({ card, mat, depth });
      return out;
    }
    case 'implant':
      return (def.depth || base.depth).map((depth) => ({ card, depth }));
    case 'cmp':
      return (def.stops || def.mats || base.stops).map((stop) => ({ card, stop }));
    case 'expose':
      return (level.masks || []).map((m) => ({ card, mask: m.id }));
    default:
      return [{ card }];
  }
}

export function availableCards(level) {
  return (level.cards || CARD_ORDER.map((card) => ({ card }))).map((c) => c.card);
}

export function allSteps(level) {
  const out = [];
  for (const card of availableCards(level)) out.push(...paramOptions(level, card));
  return out;
}

export function describeStep(step) {
  const n = CARD_NAMES[step.card] || step.card;
  const m = (c) => (MATERIALS[c] ? MATERIALS[c].name : c);
  switch (step.card) {
    case 'deposit': return `${n} ${m(step.mat)} 厚 ${step.t}`;
    case 'etch': return `${n} ${m(step.mat)} 深 ${step.depth}`;
    case 'implant': return `${n} 深 ${step.depth}`;
    case 'cmp': return `${n} 停於${m(step.stop)}`;
    case 'expose': return `${n} 光罩 ${step.mask}`;
    default: return n;
  }
}

// 提示（§4.5）。hintIndex = 此關已購買的提示數（0 起）。純函式。
export function hintInfo(level, steps, hintIndex) {
  const ref = level.reference;
  let j = 0;
  while (j < steps.length && j < ref.length && stepsEqual(steps[j], ref[j])) j++;
  if (j < steps.length) return { kind: 'rewind', to: j, text: `請先復原到第 ${j} 步（第 ${j + 1} 步偏離了參考解）` };
  if (j >= ref.length) return { kind: 'done', text: '參考解的步驟都已完成。' };
  const s = ref[j];
  if (hintIndex <= 0) return { kind: 'card', step: { card: s.card }, text: `下一步：使用「${CARD_NAMES[s.card]}」` };
  return { kind: 'full', step: s, text: `下一步：${describeStep(s)}` };
}

export function hintPrice(fabMultiplier, k) {
  return fabMultiplier * 50 * Math.pow(2, k);
}

// 含復原／重做堆疊的對局。步驟陣列即狀態。
export function createSession(level) {
  const hist = [{ grid: level.init, removals: 0 }];
  let steps = [];
  let redoStack = [];
  const cur = () => hist[hist.length - 1];
  const api = {
    level,
    get grid() { return cur().grid; },
    get removals() { return cur().removals; },
    get steps() { return steps.slice(); },
    get stepCount() { return steps.length; },
    get won() { return isWin(cur().grid, level); },
    get canUndo() { return steps.length > 0; },
    get canRedo() { return redoStack.length > 0; },
    preview(step) {
      if (api.won) return { grid: cur().grid, removed: 0, error: '本關已完成' };
      if (steps.length >= (level.maxSteps || 20)) return { grid: cur().grid, removed: 0, error: '已達步數上限' };
      return applyStep(cur().grid, step, level);
    },
    push(step) {
      const res = api.preview(step);
      if (res.error) return { ok: false, error: res.error };
      const before = cur().grid;
      steps.push(step);
      redoStack = [];
      hist.push({ grid: res.grid, removals: cur().removals + res.removed });
      return { ok: true, removed: res.removed, before, after: res.grid };
    },
    undo() {
      if (!steps.length) return false;
      redoStack.push(steps.pop());
      hist.pop();
      return true;
    },
    redo() {
      if (!redoStack.length) return false;
      const s = redoStack.pop();
      const res = applyStep(cur().grid, s, level);
      if (res.error) { redoStack = []; return false; }
      steps.push(s);
      hist.push({ grid: res.grid, removals: cur().removals + res.removed });
      return true;
    },
    reset() {
      steps = [];
      redoStack = [];
      hist.length = 1;
    },
    result() {
      const won = api.won;
      return { won, steps: steps.length, removals: cur().removals, ...starsFor(level, won, steps.length, cur().removals) };
    },
  };
  return api;
}

// 驗證 level 結構（供 loader／測試）。回傳錯誤字串陣列。
export function validateLevel(level) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(`${level.id}: ${msg}`); };
  need(level.w === W && level.h === H, 'w/h 必須是 12x8');
  for (const key of ['init', 'target']) {
    need(Array.isArray(level[key]) && level[key].length === H, `${key} 需 ${H} 列`);
    for (const row of level[key] || []) need(row.length === W, `${key} 列長度需 ${W}`);
  }
  need(!hasResist(level.init || []), 'init 不得含 R/r');
  need(!hasResist(level.target || []), 'target 不得含 R/r');
  for (const m of level.masks || []) for (const [a, b] of m.open) need(a >= 0 && b <= W - 1 && a <= b, `光罩 ${m.id} 欄位超出 0–11`);
  return errs;
}

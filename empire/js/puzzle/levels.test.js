// 執行：node empire/js/puzzle/levels.test.js [--no-bfs] [--bfs-full] [--bfs-ms=<每關毫秒預算>] [--only=f2-4]
// 預設每關 BFS 預算 6 秒（小關窮舉、大關回報部分深度）；--bfs-full 約 2–3 分鐘，21 關全部窮舉驗證 par 與 minRemovals。
// 1) 重播每關參考解：吻合 target、步數 == par、removals == minRemovals。
// 2) DESIGN.md §6 三個完整規格關卡逐格比對。
// 3) 引擎規則／星數／復原的單元測試。
// 4) 有界 BFS：確認沒有比 par 更短的解、沒有 ≤par 步且 removals 更少的解（預算內能跑完才算窮舉；否則回報部分深度）。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  applyStep, replay, evaluate, isWin, allSteps, createSession, hintInfo, validateLevel, describeStep,
} from './engine.js';

const here = dirname(fileURLToPath(import.meta.url));
const levels = JSON.parse(readFileSync(join(here, 'levels.json'), 'utf8'));
const args = process.argv.slice(2);
const noBfs = args.includes('--no-bfs');
const bfsMs = args.includes('--bfs-full') ? 900000 : Number((args.find((a) => a.startsWith('--bfs-ms=')) || '--bfs-ms=6000').split('=')[1]);
const only = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1];

let failures = 0;
let checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) {
    failures++;
    console.log('  FAIL: ' + msg);
  }
}
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}（期望 ${JSON.stringify(b)}，實得 ${JSON.stringify(a)}）`);

// ---------------------------------------------------------------- 1. 結構與參考解
console.log('== 參考解重播 ==');
eq(levels.length, 21, '關卡總數');
eq(levels.map((l) => l.fab).reduce((a, f) => ((a[f] = (a[f] || 0) + 1), a), {}), { f1: 3, f2: 4, f3: 4, f4: 5, f5: 5 }, '各廠關數');
const ids = new Set();
for (const lv of levels) {
  if (only && lv.id !== only) continue;
  ids.add(lv.id);
  const errs = validateLevel(lv);
  ok(errs.length === 0, errs.join('; '));
  ok(/^f[1-5]-\d$/.test(lv.id), lv.id + ' id 格式');
  ok(/^fact#\d+$/.test(lv.factId), lv.id + ' factId');
  const ev = evaluate(lv, lv.reference);
  ok(!ev.error, `${lv.id} 參考解有效：${ev.error}`);
  ok(ev.won, `${lv.id} 參考解到達目標`);
  ok(lv.reference.length <= lv.par, `${lv.id} 步數 ${lv.reference.length} <= par ${lv.par}`);
  ok(lv.reference.length === lv.par, `${lv.id} par 等於參考解長度`);
  ok(ev.removals === lv.minRemovals, `${lv.id} removals ${ev.removals} == minRemovals ${lv.minRemovals}`);
  ok(ev.stars === 3 && ev.waste === 0, `${lv.id} 參考解 3 星零浪費`);
  ok(lv.par <= lv.maxSteps, `${lv.id} par <= maxSteps`);
  console.log(`  ${ev.won && ev.stars === 3 ? 'ok  ' : 'FAIL'} ${lv.id} ${lv.title}  steps=${ev.steps}/par ${lv.par}  removals=${ev.removals}`);
}
if (!only) eq(ids.size, 21, 'id 不重複');

// ---------------------------------------------------------------- 2. DESIGN.md §6 規格關卡
console.log('== DESIGN.md §6 規格關卡 ==');
const E = '............', SS = 'SSSSSSSSSSSS';
const pad = (rows) => Array(8 - rows.length).fill(E).concat(rows);
const get = (id) => levels.find((l) => l.id === id);
{
  const l = get('f1-3');
  eq(l.init, pad([SS, SS, SS]), 'f1-3 init');
  eq(l.target, pad(['....OOOO....', '....OOOO....', SS, SS, SS]), 'f1-3 target');
  eq([l.par, l.minRemovals], [6, 16], 'f1-3 par/minRemovals');
  eq(l.masks, [{ id: 'A', open: [[0, 3], [8, 11]] }, { id: 'B', open: [[4, 7]] }], 'f1-3 masks');
  eq(l.reference, [
    { card: 'deposit', mat: 'O', t: 2 }, { card: 'spin' }, { card: 'expose', mask: 'A' }, { card: 'develop' },
    { card: 'etch', mat: 'O', depth: 2 }, { card: 'strip' }], 'f1-3 reference');
}
{
  const l = get('f2-4');
  eq(l.init, pad([SS, SS, SS]), 'f2-4 init');
  eq(l.target, pad(['....PPPP....', '....PPPP....', '....OOOO....', 'DDDDSSSSDDDD', SS, SS]), 'f2-4 target');
  eq([l.par, l.minRemovals], [9, 24], 'f2-4 par/minRemovals');
  eq(l.masks, [{ id: 'A', open: [[0, 3], [8, 11]] }, { id: 'B', open: [[4, 7]] }], 'f2-4 masks');
  eq(l.reference, [
    { card: 'deposit', mat: 'O', t: 1 }, { card: 'deposit', mat: 'P', t: 2 }, { card: 'spin' }, { card: 'expose', mask: 'A' },
    { card: 'develop' }, { card: 'etch', mat: 'P', depth: 2 }, { card: 'etch', mat: 'O', depth: 1 }, { card: 'strip' },
    { card: 'implant', depth: 1 }], 'f2-4 reference');
  // 佈植放在 strip 之前也合法，步數相同
  const alt = [...l.reference.slice(0, 7), { card: 'implant', depth: 1 }, { card: 'strip' }];
  const ev = evaluate(l, alt);
  ok(ev.won && ev.steps === 9 && ev.stars === 3, 'f2-4 先佈植後 strip 仍 3 星');
  // 陷阱：漏掉蝕刻 O（步驟 7）→ 佈植被氧化層擋住
  const trap = [...l.reference.slice(0, 6), l.reference[7], { card: 'implant', depth: 1 }];
  const t = evaluate(l, trap);
  ok(t.error || !t.won, 'f2-4 漏蝕 O 不得過關');
}
{
  const l = get('f3-4');
  eq(l.init, pad([OOrow(), OOrow(), SS, SS]), 'f3-4 init');
  eq(l.target, pad(['OOOOMMMMOOOO', 'OOOOMMMMOOOO', SS, SS]), 'f3-4 target');
  eq([l.par, l.minRemovals], [7, 24], 'f3-4 par/minRemovals');
  eq(l.masks.map((m) => m.id + JSON.stringify(m.open)), ['A[[4,7]]', 'B[[0,3]]', 'C[[0,3],[8,11]]'], 'f3-4 masks');
  eq(l.reference.map(describeKey), ['spin', 'expose:A', 'develop', 'etch:O:2', 'strip', 'deposit:M:2', 'cmp:O'], 'f3-4 reference');
  // 對照：deposit M t=3 → ★2、removals 36、waste 12
  const t3 = l.reference.map((s) => (s.card === 'deposit' ? { ...s, t: 3 } : s));
  const ev = evaluate(l, t3);
  ok(ev.won && ev.removals === 36 && ev.waste === 12 && ev.stars === 2, `f3-4 t=3 對照 removals=${ev.removals} waste=${ev.waste} stars=${ev.stars}`);
  // etch depth=3 結果相同
  const d3 = l.reference.map((s) => (s.card === 'etch' ? { ...s, depth: 3 } : s));
  const ed = evaluate(l, d3);
  ok(ed.won && ed.stars === 3, 'f3-4 etch depth=3 結果相同');
}
function OOrow() { return 'OOOOOOOOOOOO'; }
function describeKey(s) { return [s.card, s.mask ?? s.mat ?? s.stop, s.t ?? s.depth].filter((x) => x !== undefined).join(':'); }

// ---------------------------------------------------------------- 3. 引擎單元測試
console.log('== 引擎單元測試 ==');
{
  const l = get('f1-3');
  // 陷阱光罩 B：把中間蝕掉，不會吻合
  const trap = [{ card: 'deposit', mat: 'O', t: 2 }, { card: 'spin' }, { card: 'expose', mask: 'B' }, { card: 'develop' },
    { card: 'etch', mat: 'O', depth: 2 }, { card: 'strip' }];
  ok(!evaluate(l, trap).won, 'f1-3 光罩 B 不得過關');
  // 無效步驟被拒絕
  ok(applyStep(l.init, { card: 'spin' }, l).error === null, '空剖面可 spin');
  ok(applyStep(l.init, { card: 'develop' }, l).error, '無 r 時 develop 被拒');
  ok(applyStep(l.init, { card: 'strip' }, l).error, '無光阻時 strip 被拒');
  ok(applyStep(l.init, { card: 'etch', mat: 'O', depth: 1 }, l).error, '沒有 O 時 etch 被拒');
  ok(applyStep(l.init, { card: 'expose', mask: 'A' }, l).error, '無 R 時 expose 被拒');
  ok(applyStep(l.init, { card: 'deposit', mat: 'O', t: 5 }, l).error, '非法厚度被拒');
  ok(applyStep(l.init, { card: 'cmp', stop: 'O' }, l).error, 'cmp 停止層不存在被拒');
  ok(applyStep(l.init, { card: 'implant', depth: 1 }, l).error, '本關無 implant 卡被拒');
  let g = l.init;
  for (let i = 0; i < 3; i++) g = applyStep(g, { card: 'deposit', mat: 'O', t: 3 }, l).grid;
  ok(applyStep(g, { card: 'deposit', mat: 'O', t: 3 }, l).error, '溢出被拒');
  ok(applyStep(applyStep(l.init, { card: 'spin' }, l).grid, { card: 'spin' }, l).error, '已有光阻不可再 spin');
  // 復原／重做
  const s = createSession(l);
  ok(s.push({ card: 'deposit', mat: 'O', t: 2 }).ok, 'session push');
  ok(!s.push({ card: 'develop' }).ok && s.stepCount === 1, '無效步驟不計步');
  s.push({ card: 'spin' });
  ok(s.undo() && s.stepCount === 1, 'undo');
  ok(s.canRedo && s.redo() && s.stepCount === 2, 'redo');
  s.reset();
  ok(s.stepCount === 0 && s.grid.join() === l.init.join(), 'reset');
  for (const st of l.reference) s.push(st);
  ok(s.won, 'session 重播參考解得勝');
  const r = s.result();
  ok(r.stars === 3 && r.waste === 0, 'session 星數');
  ok(!s.push({ card: 'spin' }).ok, '勝利後不可再出牌');
  // 超過 par → 2 星不可得
  const slow = [{ card: 'deposit', mat: 'O', t: 1 }, ...l.reference.map((x, i) => (i === 0 ? { ...x, t: 1 } : x))];
  const ev = evaluate(l, slow);
  ok(ev.won && ev.steps === 7 && ev.stars === 1, `超過 par 只有 1 星（${ev.stars}）`);
  // 提示
  eq(hintInfo(l, [], 0).kind, 'card', '提示 1 種類');
  eq(hintInfo(l, [], 1).step, l.reference[0], '提示 2 完整參數');
  const h = hintInfo(l, [{ card: 'deposit', mat: 'O', t: 1 }], 0);
  eq([h.kind, h.to], ['rewind', 0], '偏離參考解 → 請復原');
  eq(hintInfo(l, l.reference.slice(0, 2), 1).step, l.reference[2], '提示指向下一步');
}

// ---------------------------------------------------------------- 4. 有界 BFS
function bfs(level, ms) {
  const moves = allSteps(level);
  const target = level.target.join('|');
  const t0 = Date.now();
  let best = new Map([[level.init.join('|'), 0]]); // 歷來最低 removals
  let layer = new Map([[level.init.join('|'), { grid: level.init, rem: 0 }]]);
  let states = 1;
  let firstGoalDepth = level.init.join('|') === target ? 0 : null;
  const goalRemByDepth = {};
  let depth = 0;
  for (; depth < level.par; depth++) {
    const next = new Map();
    for (const { grid, rem } of layer.values()) {
      for (const mv of moves) {
        const res = applyStep(grid, mv, level);
        if (res.error) continue;
        const nr = rem + res.removed;
        const key = res.grid.join('|');
        const prev = best.get(key);
        if (prev !== undefined && prev <= nr) continue;
        const inNext = next.get(key);
        if (inNext && inNext.rem <= nr) continue;
        next.set(key, { grid: res.grid, rem: nr });
      }
      if (Date.now() - t0 > ms) return { exhaustive: false, depthDone: depth, states, firstGoalDepth, goalRemByDepth };
    }
    for (const [k, v] of next) best.set(k, Math.min(best.get(k) ?? Infinity, v.rem));
    states += next.size;
    layer = next;
    const goal = layer.get(target);
    if (goal) {
      goalRemByDepth[depth + 1] = goal.rem;
      if (firstGoalDepth === null) firstGoalDepth = depth + 1;
    }
    if (!layer.size) break;
  }
  return { exhaustive: true, depthDone: depth, states, firstGoalDepth, goalRemByDepth };
}

if (!noBfs) {
  console.log(`== BFS（每關預算 ${bfsMs} ms；--bfs-ms= 可調）==`);
  const summary = { exhaustive: 0, partial: 0 };
  for (const lv of levels) {
    if (only && lv.id !== only) continue;
    const r = bfs(lv, bfsMs);
    if (r.firstGoalDepth !== null) ok(r.firstGoalDepth === lv.par, `${lv.id} BFS 找到更短的解：${r.firstGoalDepth} < par ${lv.par}`);
    if (r.exhaustive) {
      summary.exhaustive++;
      const minRem = Math.min(...Object.values(r.goalRemByDepth));
      ok(r.firstGoalDepth === lv.par, `${lv.id} BFS 窮舉：par ${lv.par} 為最短（得 ${r.firstGoalDepth}）`);
      ok(minRem === lv.minRemovals, `${lv.id} BFS 窮舉：minRemovals ${lv.minRemovals} 為 ≤par 步內最小（得 ${minRem}）`);
      console.log(`  exhaustive ${lv.id}  par=${lv.par} 最短=${r.firstGoalDepth} minRemovals=${minRem}  狀態數=${r.states}`);
    } else {
      summary.partial++;
      console.log(`  partial    ${lv.id}  已窮舉到深度 ${r.depthDone}/${lv.par}，無更短解  狀態數=${r.states}`);
    }
  }
  console.log(`BFS：窮舉 ${summary.exhaustive} 關，部分 ${summary.partial} 關（部分＝預算內只確認到所列深度沒有更短解）`);
}

console.log(`\n${checks - failures}/${checks} 檢查通過` + (failures ? `，${failures} 項失敗` : ''));
process.exit(failures ? 1 : 0);

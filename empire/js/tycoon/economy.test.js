// node js/tycoon/economy.test.js  （於 empire/ 目錄下，或任何位置皆可）
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import * as E from './economy.js';
import { nextRandom, mulberry32 } from '../shared/rng.js';
import { migrate, SAVE_VERSION } from '../shared/storage.js';

const bal = JSON.parse(readFileSync(fileURLToPath(new URL('../../data/balance.json', import.meta.url)), 'utf8'));
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg || ''} expected ${b}, got ${a}`);

const slotsF1 = (equips, level = 1) => equips.map(e => ({ equip: e, level }));
// 範例用「defMul = 1」的機台集合：pvd_sputter(1.00) / coater_developer(1.00) / etch_chamber(1.00)；清洗無 1.00 機台，
// 所以範例以直接覆寫 defMul 的 bal 副本計算，與 DESIGN 範例（「4 槽皆 L1、defMul=1」）一致。
const balUnit = JSON.parse(JSON.stringify(bal));
for (const k of Object.keys(balUnit.equipment)) balUnit.equipment[k].defMul = 1;

t('§3.4 範例 1：f1 四槽 L1、defMul=1、S=0 → y=0.95, Y=0.95^4≈0.815', () => {
  const s = slotsF1(['wet_bench', 'pvd_sputter', 'coater_developer', 'etch_chamber']);
  near(E.slotYield(balUnit, 'f1', 'etch_chamber', 1, 0), 0.95, 1e-12, 'y');
  near(E.lineYield(balUnit, 'f1', s, 0), 0.8145, 1e-4, 'Y');
  assert.equal(E.lineYield(balUnit, 'f1', s, 0).toFixed(3), '0.815');
});

t('§3.4 範例 2：全 L5 且 S=1 → d=0.01024, Y≈0.96', () => {
  const s = slotsF1(['wet_bench', 'pvd_sputter', 'coater_developer', 'etch_chamber'], 5);
  near(E.slotDefect(balUnit, 'f1', 'etch_chamber', 5, 1), 0.01024, 1e-12, 'd');
  const Y = E.lineYield(balUnit, 'f1', s, 1);
  near(Y, Math.pow(1 - 0.01024, 4), 1e-12);
  assert.equal(Y.toFixed(2), '0.96');
});

t('單槽良率 d 上限 0.5；線良率夾在 [0.05, 0.99]', () => {
  assert.equal(E.slotYield(balUnit, 'f5', 'etch_chamber', 1, 0, 100), 0.5);
  const many = Array(60).fill({ equip: 'etch_chamber', level: 1 });
  assert.equal(E.lineYield(balUnit, 'f5', many, 0), 0.05);
  assert.equal(E.lineYield(balUnit, 'f1', slotsF1(['etch_chamber'], 5), 1, { E: 5 }), 0.99);
});

t('事件缺陷加算：particle eventDef=0.5 → d×1.5', () => {
  const d0 = E.slotDefect(bal, 'f2', 'cvd_chamber', 3, 0.4, 0);
  near(E.slotDefect(bal, 'f2', 'cvd_chamber', 3, 0.4, 0.5), d0 * 1.5, 1e-12);
});

t('盈虧平衡良率 0.50/0.43/0.39/0.35/0.32 與標稱毛利 50/57/61/65/68%', () => {
  const be = bal.fabOrder.map(f => E.breakEvenYield(bal, f).toFixed(2));
  assert.deepEqual(be, ['0.50', '0.43', '0.39', '0.35', '0.32']);
  const mg = bal.fabOrder.map(f => Math.round(E.nominalMargin(bal, f) * 100));
  assert.deepEqual(mg, [50, 57, 61, 65, 68]);
});

t('廠倍率 [1,2,4,10,25]、機台價與升級費 = price×倍率×1.8^L', () => {
  assert.deepEqual(bal.fabOrder.map(f => E.fabMult(bal, f)), [1, 2, 4, 10, 25]);
  assert.equal(E.equipPrice(bal, 'f1', 'wet_bench'), 600);
  assert.equal(E.equipPrice(bal, 'f4', 'scanner'), 25000);
  assert.equal(E.upgradeCost(bal, 'f1', 'wet_bench', 1), 1080);
  assert.equal(E.upgradeCost(bal, 'f3', 'cmp_tool', 2), Math.round(1100 * 4 * 3.24));
  assert.equal(E.sellRefund(bal, 3000), 1500);
});

t('槽位時間 p = 4/(speed×(1+0.15(L−1)))；線速度 = max p', () => {
  near(E.slotHours(bal, 'wet_bench', 1), 4 / 1.2, 1e-12);
  near(E.slotHours(bal, 'furnace', 5), 4 / (1.3 * 1.6), 1e-12);
  const h = ['wet_bench', 'furnace', 'coater_developer', 'etch_chamber'].map(e => E.slotHours(bal, e, 1));
  assert.equal(E.lineInterval(h), 4);
  assert.equal(E.lineInterval([1, null, 2]), null);
});

t('槽位可選機台：f1–f3 微影=coater_developer，f4–f5 微影=scanner（含 f5 槽 8）', () => {
  assert.deepEqual(E.allowedEquip(bal, 'f1', 2), ['coater_developer']);
  assert.deepEqual(E.allowedEquip(bal, 'f3', 2), ['coater_developer']);
  assert.deepEqual(E.allowedEquip(bal, 'f4', 2), ['scanner']);
  assert.deepEqual(E.allowedEquip(bal, 'f5', 7), ['scanner']);
  assert.deepEqual(E.allowedEquip(bal, 'f1', 0), ['wet_bench', 'single_wafer_cleaner']);
  assert.equal(bal.fabs.f5.slots.length, 8);
  assert.deepEqual(bal.fabOrder.map(f => bal.fabs[f].slots.length), [4, 5, 6, 7, 8]);
});

t('售價 = 基準 × (0.9+0.2·rep/100) × 波動；聲望增量 (Y−0.75)×2', () => {
  near(E.sellPrice(bal, 'f1', 20, 1), 60 * 0.94, 1e-12);
  near(E.sellPrice(bal, 'f2', 100, 1.1), 115 * 1.1 * 1.1, 1e-12);
  near(E.repGain(bal, 0.815), 0.13, 1e-12);
  assert.ok(E.repGain(bal, 0.5) < 0);
});

t('市場波動限 0.9–1.1', () => {
  let w = 1;
  for (let i = 0; i < 500; i++) w = E.nextPriceWalk(bal, w, 1);
  assert.equal(w, 1.1);
  for (let i = 0; i < 500; i++) w = E.nextPriceWalk(bal, w, 0);
  assert.equal(w, 0.9);
});

t('星數比 S 與解鎖條件', () => {
  assert.equal(E.starRatio(bal, 'f2', { 'f2-1': 3, 'f2-2': 3, 'f2-3': 3, 'f2-4': 3 }), 1);
  near(E.starRatio(bal, 'f1', { 'f1-1': 3, 'f1-2': 2 }), 5 / 9, 1e-12);
  assert.equal(E.starRatio(bal, 'f3', {}), 0);
  const u = E.unlockStatus(bal, 'f2', { money: 12000, rep: 15, stars: { 'f2-1': 1, 'f2-2': 1, 'f2-3': 1, 'f2-4': 1 } });
  assert.ok(u.all);
  assert.ok(!E.unlockStatus(bal, 'f2', { money: 11999, rep: 15, stars: { 'f2-1': 1, 'f2-2': 1, 'f2-3': 1, 'f2-4': 1 } }).all);
  assert.ok(!E.unlockStatus(bal, 'f2', { money: 99999, rep: 99, stars: { 'f2-1': 1 } }).all);
});

t('fabStats：f1 預設最便宜配置的日產能', () => {
  const fab = { slots: slotsF1(['wet_bench', 'furnace', 'coater_developer', 'etch_chamber']) };
  const st = E.fabStats(bal, 'f1', fab, 0, {}, 20, 1);
  assert.equal(st.interval, 4);
  assert.equal(st.lotsPerDay, 6);
  assert.equal(st.wafersPerDay, 150);
  assert.ok(st.complete);
});

t('時鐘：2× 速度下一日 ≈ 3 秒', () => {
  assert.equal(bal.tickMs['2'] * bal.ticksPerDay, 3000);
  assert.equal(bal.tickMs['1'] * bal.ticksPerDay, 6000);
});

t('PRNG：同種子可重現，值域 [0,1)；存檔 migrate 拒讀新版', () => {
  const a = mulberry32(42), b = mulberry32(42);
  for (let i = 0; i < 100; i++) { const x = a(); assert.equal(x, b()); assert.ok(x >= 0 && x < 1); }
  const rs = { seed: 7 }; const first = nextRandom(rs); assert.notEqual(rs.seed, 7); assert.ok(first >= 0 && first < 1);
  assert.equal(migrate({ version: 2 }).ok, false);
  assert.equal(migrate({ version: 2 }).reason, 'too-new');
  assert.equal(migrate({ version: SAVE_VERSION, a: 1 }).ok, true);
  assert.equal(migrate({}).ok, false);
});

console.log(`\n${n} tests passed`);

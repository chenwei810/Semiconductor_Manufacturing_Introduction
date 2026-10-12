// mulberry32。rngState = {seed}，nextRandom 會就地推進 seed，使狀態可存檔。
export function nextRandom(rs) {
  rs.seed = (rs.seed + 0x6D2B79F5) >>> 0;
  let t = rs.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function mulberry32(seed) {
  const rs = { seed: seed >>> 0 };
  return () => nextRandom(rs);
}

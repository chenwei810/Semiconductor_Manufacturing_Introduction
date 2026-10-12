// localStorage 存檔：key、version、migrate（§7.2）
export const SAVE_KEY = 'waferEmpire.save';
export const SAVE_VERSION = 1;
// migrations[v] 把 version v 的存檔轉成 v+1
export const migrations = {};

export function migrate(raw) {
  if (!raw || typeof raw !== 'object' || !Number.isInteger(raw.version) || raw.version < 1) {
    return { ok: false, reason: 'invalid' };
  }
  if (raw.version > SAVE_VERSION) return { ok: false, reason: 'too-new', version: raw.version };
  let s = raw;
  while (s.version < SAVE_VERSION) {
    const f = migrations[s.version];
    if (!f) return { ok: false, reason: 'invalid' };
    s = f(s);
  }
  return { ok: true, save: s };
}

function store(storage) {
  try { return storage || globalThis.localStorage || null; } catch (e) { return null; }
}

export function parseSaveText(text) {
  try { return migrate(JSON.parse(text)); } catch (e) { return { ok: false, reason: 'invalid' }; }
}

export function loadSave(storage) {
  try {
    const st = store(storage);
    const text = st && st.getItem(SAVE_KEY);
    if (!text) return { ok: false, reason: 'none' };
    return parseSaveText(text);
  } catch (e) { return { ok: false, reason: 'unavailable' }; }
}

export function writeSave(save, storage) {
  try {
    const st = store(storage);
    if (!st) return false;
    st.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch (e) { return false; }
}

export function clearSave(storage) {
  try { store(storage)?.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
}

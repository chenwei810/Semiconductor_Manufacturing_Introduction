// 極簡 pub/sub
export function createBus() {
  const map = new Map();
  return {
    on(evt, fn) {
      if (!map.has(evt)) map.set(evt, new Set());
      map.get(evt).add(fn);
      return () => map.get(evt)?.delete(fn);
    },
    off(evt, fn) { map.get(evt)?.delete(fn); },
    emit(evt, payload) {
      const set = map.get(evt);
      if (!set) return;
      for (const fn of [...set]) {
        try { fn(payload); } catch (e) { console.error('[bus]', evt, e); }
      }
    }
  };
}
export const bus = createBus();

// 載入 content.json、補 fact id、查詢
let content = null;

export function parseContent(raw) {
  const facts = raw.facts.map((f, i) => ({ ...f, id: 'fact#' + i }));
  return {
    ...raw,
    facts,
    factById: new Map(facts.map(f => [f.id, f])),
    equipmentById: new Map(raw.equipment.map(e => [e.id, e])),
    processById: new Map(raw.processes.map(p => [p.id, p]))
  };
}

export async function loadContent(url) {
  const u = url || new URL('../../data/content.json', import.meta.url);
  const res = await fetch(u);
  if (!res.ok) throw new Error('content-load-failed');
  content = parseContent(await res.json());
  return content;
}

export function setContent(c) { content = c; }
export function getContent() { return content; }
export function getFact(id) { return content?.factById.get(id) || null; }
export function getFactText(id) { return getFact(id)?.text ?? ''; }
export function getEquipment(id) { return content?.equipmentById.get(id) || null; }
export function getProcess(id) { return content?.processById.get(id) || null; }

// 經營層啟動：載入資料 → 狀態 → bridge → HUD / 廠房畫面 → 時鐘
import { loadContent } from '../shared/content.js';
import * as S from './state.js';
import { setEventDefs } from './events.js';
import { installBridge } from './bridge.js';
import { initClock } from './clock.js';
import { mountHud } from './hud.js';
import { mountFactoryView } from './factory-view.js';
import { toast } from './ui.js';

const jsonUrl = rel => new URL(rel, import.meta.url);
async function fetchJson(rel) {
  const r = await fetch(jsonUrl(rel));
  if (!r.ok) throw new Error('load-failed:' + rel);
  return r.json();
}

export async function bootTycoon({ hudRoot, fabRoot }) {
  const [bal, events] = await Promise.all([fetchJson('../../data/balance.json'), fetchJson('../../data/events.json')]);
  await loadContent();
  setEventDefs(events);
  S.initState(bal);
  installBridge();
  mountHud(hudRoot);
  const view = mountFactoryView(fabRoot);
  initClock();
  if (S.getLoadNotice()) toast(S.getLoadNotice(), 6000);
  return { S, view };
}

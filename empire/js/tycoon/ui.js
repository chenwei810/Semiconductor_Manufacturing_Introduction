// 小型 DOM 工具：el、bottom sheet、modal、toast、格式化
export function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}

export const fmt = n => Math.round(n).toLocaleString('en-US');
export const money = n => '$' + fmt(n);
export const pct = (x, d = 1) => (x * 100).toFixed(d) + '%';

let toastBox = null;
export function toast(msg, ms = 2600) {
  if (!toastBox) {
    toastBox = el('div', { class: 'ty-toasts', 'aria-live': 'polite' });
    document.body.append(toastBox);
  }
  const t = el('div', { class: 'ty-toast', text: msg });
  toastBox.append(t);
  setTimeout(() => t.remove(), ms);
}

/**
 * 通用對話：kind='sheet'（底部滑出，可 Esc / 點背景關閉）或 'modal'（置中，需按選項）。
 * 回傳 {root, body, close}。onClose 於關閉時呼叫（用來解除時鐘鎖）。
 */
export function openDialog({ title, kind = 'sheet', dismissible = true, onClose, label }) {
  const prevFocus = document.activeElement;
  const body = el('div', { class: 'ty-dlg-body' });
  const closeBtn = dismissible ? el('button', { class: 'ty-btn ty-dlg-x', 'aria-label': '關閉', text: '×' }) : null;
  const panel = el('div', { class: 'ty-dlg ty-dlg--' + kind, role: 'dialog', 'aria-modal': 'true', 'aria-label': label || title, tabindex: '-1' },
    el('div', { class: 'ty-dlg-head' }, el('h2', { text: title }), closeBtn), body);
  const root = el('div', { class: 'ty-overlay' }, panel);
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    try { prevFocus?.focus?.(); } catch (e) { /* ignore */ }
    onClose?.();
  };
  const onKey = e => {
    if (e.key === 'Escape' && dismissible) { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = [...panel.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled);
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey, true);
  closeBtn?.addEventListener('click', close);
  if (dismissible) root.addEventListener('click', e => { if (e.target === root) close(); });
  document.body.append(root);
  panel.focus();
  return { root, body, panel, close };
}

/** replaceChildren，但略過 false / null（讓 cond && el(...) 可用） */
export function fill(node, ...kids) {
  node.replaceChildren(...kids.flat().filter(k => k != null && k !== false));
}

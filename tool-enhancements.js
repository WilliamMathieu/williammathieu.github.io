/**
 * tool-enhancements.js
 * Shared enhancements for all RF Toolbox tool pages.
 * - engFmt(value, unit)      — format a number with proper metric prefix (nH, pF, MHz, etc.)
 * - loadExample(idValueMap)  — fill inputs from a worked example
 */

// ── Engineering / metric-prefix formatter ─────────────────────────────────
// engFmt(1.5e-9, 'H')  →  '1.500 nH'
// engFmt(2.45e9, 'Hz') →  '2.450 GHz'
function engFmt(value, unit) {
  if (!isFinite(value)) return '∞ ' + (unit || '');
  if (value === 0)      return '0 ' + (unit || '');
  const abs = Math.abs(value);
  const tbl = [
    [1e15,'P'],[1e12,'T'],[1e9,'G'],[1e6,'M'],[1e3,'k'],
    [1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p'],[1e-15,'f']
  ];
  for (const [scale, prefix] of tbl) {
    if (abs >= scale * 0.9999) {
      const s = value / scale;
      const str = Math.abs(s) >= 100 ? s.toFixed(2)
                : Math.abs(s) >= 10  ? s.toFixed(3)
                :                      s.toFixed(4);
      return str + ' ' + prefix + (unit || '');
    }
  }
  return value.toExponential(3) + ' ' + (unit || '');
}
window.engFmt = engFmt;

// ── Example loader ────────────────────────────────────────────────────────
function loadExample(idValueMap) {
  if (!idValueMap || typeof idValueMap !== 'object') return;
  Object.entries(idValueMap).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
    el.classList.remove('example-flash');
    void el.offsetWidth;
    el.classList.add('example-flash');
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  setTimeout(() => {
    const btn = document.querySelector('.calc-btn') ||
                document.querySelector('article button[id]');
    if (btn) btn.click();
  }, 80);
}

// ── Tooltips for [data-tip] elements ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tip]').forEach(el => {
    const t = el.getAttribute('data-tip');
    if (!t) return;
    el.insertAdjacentHTML('afterend',
      `<span class="tip-wrap" style="display:inline-block;vertical-align:middle;">` +
      `<span class="tip-icon">?</span><span class="tip-box">${t}</span></span>`);
  });
});

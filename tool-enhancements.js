/**
 * tool-enhancements.js
 * - engFmt(value, unit)   metric prefix formatter
 * - loadExample(map)      fill inputs from example
 * - DOMContentLoaded:     auto-draw diagram + tooltips next to labels
 */

// ── Metric prefix formatter ───────────────────────────────────────────────
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

// ── DOMContentLoaded: tooltips + auto-draw ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // 1. Tooltips — attach to label, not to input
  document.querySelectorAll('[data-tip]').forEach(el => {
    const tip = el.getAttribute('data-tip');
    if (!tip) return;
    const row = el.closest('.inp-row');
    const lbl = row ? row.querySelector('label') : null;
    if (lbl) {
      // Append tooltip icon inside the label, after the text
      const wrap = document.createElement('span');
      wrap.className = 'tip-wrap';
      wrap.innerHTML =
        '<span class="tip-icon">?</span>' +
        '<span class="tip-box">' + tip + '</span>';
      lbl.appendChild(wrap);
    }
  });

  // 2. Auto-draw diagram on page load with whatever defaults are present
  if (typeof drawDiagram === 'function') {
    try { drawDiagram(); } catch(e) { /* ignore if inputs not yet populated */ }
  }
});

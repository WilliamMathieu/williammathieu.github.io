/* exported loadExample, engFmt */
/**
 * tool-enhancements.js
 * - engFmt(value, unit)   metric prefix formatter
 * - loadExample(map)      fill inputs from example
 * - DOMContentLoaded:     auto-draw diagram + tooltips next to labels
 */

// ── Metric prefix formatter ───────────────────────────────────────────────
// eslint-disable-next-line no-redeclare
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

// ── Result safety net ─────────────────────────────────────────────────────
// No calculator should ever display a raw NaN / Infinity / undefined. When a
// result field ends up with one (an unguarded divide-by-zero, a blank field,
// an overflow), replace just that token with the site's "—" placeholder. This
// only ever touches already-broken output — a valid numeric result never
// contains these tokens — so it cannot change a correct answer.
(function () {
  var RESULT_SEL = '.res-val,.res-row,.res-card,[id$="-out"],[id$="_out"],[id$="-res"],' +
                   '[id$="-table"],[id$="-tbl"],[id$="-abcd"],#C_out,#result,#output,#results';
  var TEST = /(?:NaN|Infinity|undefined)/;
  var REPL = /(?:NaN|Infinity|undefined)/g;
  var busy = false;
  function sanitize() {
    if (busy) return;
    busy = true;
    try {
      document.querySelectorAll(RESULT_SEL).forEach(function (root) {
        var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        var n, hits = [];
        while ((n = w.nextNode())) { if (TEST.test(n.nodeValue)) hits.push(n); }
        hits.forEach(function (t) { t.nodeValue = t.nodeValue.replace(REPL, '—'); });
      });
    } finally { busy = false; }
  }
  function setup() {
    sanitize();
    try {
      new MutationObserver(sanitize).observe(document.body,
        { subtree: true, childList: true, characterData: true });
    } catch (e) { /* MutationObserver unavailable — safe to skip */ }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else { setup(); }
})();

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

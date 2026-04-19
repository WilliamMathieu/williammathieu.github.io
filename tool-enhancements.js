/**
 * tool-enhancements.js
 * Shared enhancements for all RF Toolbox tool pages.
 * - loadExample(idValueMap)  — fill inputs from a worked example
 * - Tooltip upgrade for any element with [data-tip]
 * - input[title] → native browser tooltip already works; this adds richer UI
 */

// ── Example loader ────────────────────────────────────────────────────────
function loadExample(idValueMap) {
  if (!idValueMap || typeof idValueMap !== 'object') return;

  Object.entries(idValueMap).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.value = val;

    // Flash the input to show it was filled
    el.classList.remove('example-flash');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('example-flash');

    // Fire events so reactive JS picks up the change
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // After a short delay, find and click the Calculate button
  setTimeout(() => {
    const btn = document.querySelector('.calc-btn') ||
                document.querySelector('article button[id]');
    if (btn) btn.click();
  }, 80);
}

// ── Rich tooltips for [data-tip] elements ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tip]').forEach(el => {
    const tipText = el.getAttribute('data-tip');
    if (!tipText) return;

    const wrap = document.createElement('span');
    wrap.className = 'tip-wrap';

    // If el is inline (input/select), we need to wrap its label context.
    // For simplicity, just insert a ⓘ icon right after the element.
    el.insertAdjacentHTML('afterend',
      `<span class="tip-wrap" style="display:inline-block;vertical-align:middle;">` +
      `<span class="tip-icon">?</span>` +
      `<span class="tip-box">${tipText}</span>` +
      `</span>`
    );
  });
});

// Resolve Playwright: prefer a global install (local dev sandbox ships browsers
// pre-downloaded), and fall back to the project's node_modules in CI, where the
// global path is absent and browsers are fetched via `npx playwright install`.
let chromium;
try {
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
// eslint-disable-next-line no-unused-vars
} catch (_e) {
  ({ chromium } = require('playwright'));
}
const { spawn } = require('child_process');

(async () => {
  const server = spawn('python3', ['-m', 'http.server', '8765', '--directory', __dirname],
    { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m => {
    if (m.type() === 'error') process.stderr.write('[page] ' + m.text() + '\n');
  });

  await page.goto('http://localhost:8765/validate.html');
  await page.waitForSelector('#vld-summary .vld-summary', { timeout: 20000 });

  const summary = await page.textContent('#vld-summary .vld-summary');
  const failures = await page.$$eval('table.vld-table tr.fail', rows =>
    rows.map(r => Array.from(r.querySelectorAll('td')).map(c => c.textContent.trim()).join(' │ '))
  );

  console.log('\n' + summary.trim());
  if (failures.length) {
    console.log('\nFailing checks:');
    failures.forEach(f => console.log('  ✗ ' + f));
  }

  await browser.close();
  server.kill();
  process.exit(failures.length > 0 ? 1 : 0);
})();

const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');

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

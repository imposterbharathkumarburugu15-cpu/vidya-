const path = require('path');
const { chromium } = require(path.resolve(__dirname, '../frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });

  console.log('Logging in to backend via API...');
  const res = await fetch('http://127.0.0.1:8000/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 'inst-a', password: 'demo' })
  });
  const data = await res.json();
  console.log('Got session token for:', data.display_name);

  await context.addInitScript((sess) => {
    sessionStorage.setItem('apaar.session', JSON.stringify({
      token: sess.access_token,
      role: sess.role,
      institution_id: sess.institution_id,
      display_name: sess.display_name,
      user_id: 'inst-a'
    }));
  }, data);

  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  console.log('Opening #/inst...');
  await page.goto('http://localhost:5173/#/inst');

  console.log('Waiting for section[aria-label="Key figures"] or data to appear...');
  await page.waitForSelector('section[aria-label="Key figures"]', { timeout: 20000 });
  await page.waitForTimeout(1500);

  const text = await page.evaluate(() => document.querySelector('main')?.innerText || document.body.innerText);
  console.log('MAIN DASHBOARD CONTENT PREVIEW:\n' + text.substring(0, 700));

  const outPath = path.resolve('video_production/scenes/inst_dashboard_verified.png');
  await page.screenshot({ path: outPath });
  console.log('SUCCESS: Full populated dashboard saved to', outPath);

  await browser.close();
})();


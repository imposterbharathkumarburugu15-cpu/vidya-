const path = require('path');
const { chromium } = require(path.resolve(__dirname, '../frontend/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  console.log('Navigating to signin...');
  await page.goto('http://localhost:5173/#/signin?as=institution', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Clicking Vidyapeeth Inst demo button...');
  const demoBtn = page.getByText('Vidyapeeth Inst of Tech & Science').first();
  await demoBtn.click();

  console.log('Waiting for navigation to #/inst...');
  await page.waitForURL('**/#/**', { timeout: 10000 });
  await page.waitForTimeout(3000);

  // Wait for an actual card or text that indicates data has loaded
  console.log('Waiting for dashboard data content...');
  await page.waitForSelector('text=Total Students, text=Students, text=Enrolment, text=Intake, h1, h2, h3', { timeout: 10000 }).catch(e => console.log('Wait warning:', e.message));
  await page.waitForTimeout(2000);

  const outPath = path.resolve('video_production/scenes/debug_inst.png');
  await page.screenshot({ path: outPath });
  console.log('Saved debug screenshot:', outPath);

  await browser.close();
})();


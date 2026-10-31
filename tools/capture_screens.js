const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../frontend/node_modules/playwright'));

const SCENES_DIR = path.resolve('video_production/scenes');
if (!fs.existsSync(SCENES_DIR)) {
  fs.mkdirSync(SCENES_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser with msedge channel...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Helper to wait and capture
  async function take(filename, waitMs = 2500) {
    await page.waitForTimeout(waitMs);
    const outPath = path.join(SCENES_DIR, filename);
    await page.screenshot({ path: outPath });
    console.log(`Saved screenshot: ${filename}`);
  }

  try {
    // Scene 1: Landing Page
    console.log('Capturing Scene 1: Landing Page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await take('scene_01_landing.png', 2000);

    // Scene 2: How It Works & System Architecture
    console.log('Capturing Scene 2: Architecture & How It Works...');
    await page.goto('http://localhost:5173/#/how-it-works', { waitUntil: 'networkidle' });
    await take('scene_02_architecture.png', 2500);

    // Scene 3: Institution & Registrar Portal
    console.log('Capturing Scene 3: Institution Portal...');
    await page.goto('http://localhost:5173/#/signin?as=institution', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    // Click clean institution demo button
    const instDemoBtn = page.locator('text=Vidyapeeth Inst of Tech & Science').first();
    if (await instDemoBtn.count() > 0) {
      await instDemoBtn.click();
      await page.waitForTimeout(3000);
    } else {
      await page.goto('http://localhost:5173/#/inst', { waitUntil: 'networkidle' });
    }
    await take('scene_03_institution.png', 2500);

    // Scene 4: Student Portal & Degree Credentials
    console.log('Capturing Scene 4: Student Portal...');
    await page.goto('http://localhost:5173/#/student', { waitUntil: 'networkidle' });
    await take('scene_04_student.png', 3000);

    // Scene 5: Public Verifier Portal
    console.log('Capturing Scene 5: Verifier Portal...');
    await page.goto('http://localhost:5173/#/verifier', { waitUntil: 'networkidle' });
    await take('scene_05_verifier.png', 2500);

    // Scene 6: AICTE Regulatory Oversight Dashboard
    console.log('Capturing Scene 6: AICTE Dashboard...');
    await page.goto('http://localhost:5173/#/signin?as=aicte', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const aicteDemoBtn = page.getByText('AICTE National Monitoring Cell').first();
    if (await aicteDemoBtn.count() > 0) {
      await aicteDemoBtn.click();
      await page.waitForTimeout(3000);
    } else {
      await page.goto('http://localhost:5173/#/aicte', { waitUntil: 'networkidle' });
    }
    await take('scene_06_aicte.png', 3000);

    // Scene 7: Developer Portal (SDKs, npm, PyPI)
    console.log('Capturing Scene 7: Developer Portal...');
    await page.goto('http://localhost:5173/#/developer', { waitUntil: 'networkidle' });
    await take('scene_07_developer.png', 2500);

    // Scene 8: Platform Impact & Closing View
    console.log('Capturing Scene 8: Conclusion Screen...');
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 700));
    await take('scene_08_conclusion.png', 2000);

    // YouTube / SIH Presentation Thumbnail (1920x1080)
    console.log('Capturing Thumbnail...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.resolve('Thumbnail.png') });
    console.log('Saved Thumbnail.png');

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

capture();

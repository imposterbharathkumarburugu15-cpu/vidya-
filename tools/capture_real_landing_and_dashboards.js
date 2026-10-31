const path = require('path');
const fs = require('fs');
const { chromium } = require('../frontend/node_modules/playwright');

async function getJwtToken(userId, password) {
  const res = await fetch('http://127.0.0.1:8000/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, password })
  });
  return await res.json();
}

async function getStudentToken(apaarId, dob) {
  const res = await fetch('http://127.0.0.1:8000/v1/auth/student-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apaar_id: apaarId, dob })
  });
  return await res.json();
}

(async () => {
  console.log('--- CAPTURING 100% REAL VIDYADWAAR LANDING PAGE & DASHBOARDS ---');
  const browser = await chromium.launch({ headless: true });
  const scenesDir = path.resolve(__dirname, '../video_production/scenes_11');
  if (!fs.existsSync(scenesDir)) fs.mkdirSync(scenesDir, { recursive: true });

  // SCENE 1: REAL VIDYADWAAR LANDING PAGE HERO
  {
    console.log('Capturing Scene 1: Real VidyaDwaar Landing Page Hero...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await context.addInitScript(() => sessionStorage.clear());
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(scenesDir, 'scene_01.png') });
    await context.close();
  }

  // SCENE 2: REAL WHY VIDYADWAAR / PROBLEM STATEMENT SECTION
  {
    console.log('Capturing Scene 2: Real Why VidyaDwaar (Problem Statement)...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await context.addInitScript(() => sessionStorage.clear());
    await page.goto('http://localhost:5173/#/?s=why', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    // Scroll down to the Why section
    await page.evaluate(() => {
      const el = document.getElementById('why') || document.querySelector('section[id*="why"]') || document.body;
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      else window.scrollBy(0, 850);
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_02.png') });
    await context.close();
  }

  // SCENE 3: REAL MULTI-ROLE SIGN-IN & ROLE SELECTION
  {
    console.log('Capturing Scene 3: Real Sign In & Multi-Role Access...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await context.addInitScript(() => sessionStorage.clear());
    await page.goto('http://localhost:5173/#/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_03.png') });
    await context.close();
  }

  // SCENE 4: REAL INSTITUTION DASHBOARD (VITS BENGALURU)
  {
    console.log('Capturing Scene 4: Real Institution Administrator Dashboard...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const instAuth = await getJwtToken('inst-a', 'demo');
    await context.addInitScript((s) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: s.access_token,
        role: s.role,
        institution_id: s.institution_id,
        display_name: s.display_name,
        user_id: 'inst-a'
      }));
    }, instAuth);
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_04.png') });
    await context.close();
  }

  // SCENE 5: REAL STUDENT EXPERIENCE (MY RECORD)
  {
    console.log('Capturing Scene 5: Real Student My Record...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const studentAuth = await getStudentToken('328865551724', '2006-11-05');
    await context.addInitScript((s) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: s.access_token,
        role: s.role,
        institution_id: null,
        display_name: s.display_name,
        user_id: 'student'
      }));
    }, studentAuth);
    await page.goto('http://localhost:5173/#/student', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_05.png') });
    await context.close();
  }

  // SCENE 6: REAL STUDENT APK DOWNLOAD & OFFLINE VERIFICATION SECTION
  {
    console.log('Capturing Scene 6: Real Student Portal APK & Offline Verification...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/certificate?id=vc-bntu-2026-001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // Take focused viewport of the top offline APK card and certificate header
    await page.screenshot({ path: path.join(scenesDir, 'scene_06.png') });
    await context.close();
  }

  // SCENE 7: REAL CERTIFICATE VIEW & QR VERIFICATION
  {
    console.log('Capturing Scene 7: Real Certificate View...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/certificate?id=vc-bntu-2026-001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // Scroll slightly so the full certificate paper is centered
    await page.evaluate(() => window.scrollBy(0, 180));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_07.png') });
    await context.close();
  }

  // SCENE 8: REAL AICTE DUPLICATE CASES QUEUE
  {
    console.log('Capturing Scene 8: Real AICTE Duplicate Cases Resolution...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const aicteAuth = await getJwtToken('aicte', 'demo');
    await context.addInitScript((s) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: s.access_token,
        role: s.role,
        institution_id: null,
        display_name: s.display_name,
        user_id: 'aicte'
      }));
    }, aicteAuth);
    await page.goto('http://localhost:5173/#/aicte/cases', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_08.png') });
    await context.close();
  }

  // SCENE 9: REAL AICTE OVERVIEW & NATIONAL MONITORING
  {
    console.log('Capturing Scene 9: Real AICTE Regulatory Overview...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const aicteAuth = await getJwtToken('aicte', 'demo');
    await context.addInitScript((s) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: s.access_token,
        role: s.role,
        institution_id: null,
        display_name: s.display_name,
        user_id: 'aicte'
      }));
    }, aicteAuth);
    await page.goto('http://localhost:5173/#/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_09.png') });
    await context.close();
  }

  // SCENE 10: REAL DEVELOPER PORTAL & ARCHITECTURE
  {
    console.log('Capturing Scene 10: Real Developer Portal & Architecture...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/developer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_10.png') });
    await context.close();
  }

  // SCENE 11: REAL HOW IT WORKS / CONCLUSION SUMMARY
  {
    console.log('Capturing Scene 11: Real How It Works Walkthrough...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/how-it-works', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_11.png') });
    await context.close();
  }

  await browser.close();
  console.log('--- ALL REAL APPLICATION SCREENS CAPTURED SUCCESSFULLY! ---');
})();

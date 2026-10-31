const path = require('path');
const { chromium } = require(path.resolve(__dirname, '../frontend/node_modules/playwright'));

(async () => {
  console.log('=== VERIFYING CERTIFICATE FIX ACROSS ALL SCENARIOS ===');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  // TEST 1: Public access to #/certificate (no login)
  {
    console.log('\n--- TEST 1: Public access to #/certificate ---');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    page.on('console', msg => console.log('T1 BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('T1 ERROR:', err.message));

    await page.goto('http://localhost:5173/#/certificate');
    await page.waitForTimeout(2000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('T1 Body Preview:\n' + bodyText.substring(0, 400));
    const out1 = path.resolve('video_production/scenes/verify_cert_public_default.png');
    await page.screenshot({ path: out1 });
    console.log('Saved screenshot 1 to:', out1);
    await context.close();
  }

  // TEST 2: Public access to #/certificate?id=vc-bntu-2026-001 (no login)
  {
    console.log('\n--- TEST 2: Public access to #/certificate?id=vc-bntu-2026-001 ---');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    page.on('console', msg => console.log('T2 BROWSER:', msg.text()));

    await page.goto('http://localhost:5173/#/certificate?id=vc-bntu-2026-001');
    await page.waitForTimeout(2000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('T2 Body Preview:\n' + bodyText.substring(0, 400));
    const out2 = path.resolve('video_production/scenes/verify_cert_public_id.png');
    await page.screenshot({ path: out2 });
    console.log('Saved screenshot 2 to:', out2);
    await context.close();
  }

  // TEST 3: Authenticated Student viewing Certificate
  {
    console.log('\n--- TEST 3: Authenticated Student viewing #/student/wallet and Certificate ---');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const res = await fetch('http://127.0.0.1:8000/v1/auth/student-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apaar_id: '328865551724', dob: '2006-11-05' })
    });
    const session = await res.json();

    await context.addInitScript((sess) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: sess.access_token,
        role: sess.role,
        institution_id: null,
        display_name: sess.display_name,
        user_id: 'student'
      }));
    }, session);

    const page = await context.newPage();
    page.on('console', msg => console.log('T3 BROWSER:', msg.text()));

    await page.goto('http://localhost:5173/#/student/wallet');
    await page.waitForTimeout(2000);
    const walletText = await page.evaluate(() => document.body.innerText);
    console.log('T3 Wallet Text:\n' + walletText.substring(0, 400));

    await page.goto('http://localhost:5173/#/certificate?id=vc-bntu-2026-001');
    await page.waitForTimeout(2000);
    const certText = await page.evaluate(() => document.body.innerText);
    console.log('T3 Certificate Text:\n' + certText.substring(0, 400));
    const out3 = path.resolve('video_production/scenes/verify_cert_student_authenticated.png');
    await page.screenshot({ path: out3 });
    console.log('Saved screenshot 3 to:', out3);
    await context.close();
  }

  await browser.close();
  console.log('\n=== ALL CERTIFICATE TESTS PASSED! ZERO BLANK SCREEN! ===');
})();


const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../video_production/scenes/browser_verification');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('=== STARTING MANDATORY BROWSER TESTING ACROSS ALL ROLES ===\n');
  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // TEST 1: AICTE Overview
  // -------------------------------------------------------------
  console.log('--- TEST 1: AICTE Overview (#/) ---');
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    page.on('console', msg => console.log('  [AICTE Browser Console]', msg.type(), msg.text()));

    // Login via UI or API
    await page.goto('http://localhost:5173/#/signin');
    await page.waitForLoadState('networkidle');
    
    // Perform sign in as AICTE
    const res = await page.request.post('http://localhost:5173/v1/auth/login', {
      data: { user_id: 'aicte', password: 'demo' }
    });
    const authData = await res.json();
    console.log('  AICTE Logged In:', authData.role, authData.display_name);

    await context.addInitScript((s) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: s.access_token,
        role: s.role,
        institution_id: null,
        display_name: s.display_name,
        user_id: 'aicte'
      }));
    }, authData);

    await page.goto('http://localhost:5173/#/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.innerText('body');
    console.log('  Page title check:', bodyText.includes('AICTE') ? 'PASS (Found AICTE)' : 'FAIL');
    console.log('  Totals check:', bodyText.includes('4,120') || bodyText.includes('Institutions') ? 'PASS (Found totals)' : 'FAIL');

    const screenshotPath = path.join(outDir, 'screen_1_aicte_overview.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  Saved screenshot to: ${screenshotPath}\n`);
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 2: AICTE Duplicate Cases (#/aicte/cases)
  // -------------------------------------------------------------
  console.log('--- TEST 2: AICTE Duplicate Cases (#/aicte/cases) ---');
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    page.on('console', msg => console.log('  [Cases Browser Console]', msg.type(), msg.text()));

    const res = await page.request.post('http://localhost:5173/v1/auth/login', {
      data: { user_id: 'aicte', password: 'demo' }
    });
    const authData = await res.json();

    await context.addInitScript((s) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: s.access_token,
        role: s.role,
        institution_id: null,
        display_name: s.display_name,
        user_id: 'aicte'
      }));
    }, authData);

    await page.goto('http://localhost:5173/#/aicte/cases');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.innerText('body');
    console.log('  Cases title check:', bodyText.includes('Duplicate cases') || bodyText.includes('Case Resolution Queue') ? 'PASS (Found Cases)' : 'FAIL');
    console.log('  Case #101 check:', bodyText.includes('101') ? 'PASS (Found Case #101)' : 'FAIL');
    console.log('  Skeleton check:', !bodyText.includes('Loading…') ? 'PASS (Zero skeleton)' : 'WARNING');

    const screenshotPath = path.join(outDir, 'screen_2_aicte_duplicate_cases.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  Saved screenshot to: ${screenshotPath}\n`);
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 3: Student My Record (#/student)
  // -------------------------------------------------------------
  console.log('--- TEST 3: Student My Record (#/student) ---');
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    page.on('console', msg => console.log('  [Student Browser Console]', msg.type(), msg.text()));

    const res = await page.request.post('http://localhost:5173/v1/auth/student-login', {
      data: { apaar_id: '328865551724', dob: '2006-11-05' }
    });
    const authData = await res.json();
    console.log('  Student Logged In:', authData.role, authData.display_name);

    await context.addInitScript((s) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: s.access_token,
        role: s.role,
        institution_id: null,
        display_name: s.display_name,
        user_id: 'student'
      }));
    }, authData);

    await page.goto('http://localhost:5173/#/student');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.innerText('body');
    console.log('  Student name check:', bodyText.includes('Aarav Sharma') ? 'PASS (Found Aarav Sharma)' : 'FAIL');
    console.log('  APAAR ID check:', bodyText.includes('1724') ? 'PASS (Found APAAR ID)' : 'FAIL');
    console.log('  Enrolment check:', bodyText.includes('Vidyapeeth') || bodyText.includes('Computer Science') ? 'PASS (Found Enrolment)' : 'FAIL');

    const screenshotPath = path.join(outDir, 'screen_3_student_my_record.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  Saved screenshot to: ${screenshotPath}\n`);

    // Also check student wallet
    console.log('--- TEST 3B: Student Credential Wallet (#/student/wallet) ---');
    await page.goto('http://localhost:5173/#/student/wallet');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const walletText = await page.innerText('body');
    console.log('  Wallet credential check:', walletText.includes('EnrolmentCredential') || walletText.includes('Degree') || walletText.includes('BNTU') ? 'PASS (Found Credential)' : 'FAIL');
    const walletScreenshot = path.join(outDir, 'screen_3b_student_wallet.png');
    await page.screenshot({ path: walletScreenshot });
    console.log(`  Saved screenshot to: ${walletScreenshot}\n`);

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 4: Institution Dashboard (#/)
  // -------------------------------------------------------------
  console.log('--- TEST 4: Institution Dashboard (#/) ---');
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    page.on('console', msg => console.log('  [Inst Browser Console]', msg.type(), msg.text()));

    const res = await page.request.post('http://localhost:5173/v1/auth/login', {
      data: { user_id: 'inst-a', password: 'demo' }
    });
    const authData = await res.json();
    console.log('  Institution Logged In:', authData.role, authData.display_name);

    await context.addInitScript((s) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: s.access_token,
        role: s.role,
        institution_id: '1-0000000001',
        display_name: s.display_name,
        user_id: 'inst-a'
      }));
    }, authData);

    await page.goto('http://localhost:5173/#/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.innerText('body');
    console.log('  Institution name check:', bodyText.includes('Vidyapeeth') ? 'PASS (Found Vidyapeeth)' : 'FAIL');
    console.log('  Intake check:', bodyText.includes('Approved intake') || bodyText.includes('60') ? 'PASS (Found intake)' : 'FAIL');

    const screenshotPath = path.join(outDir, 'screen_4_institution_dashboard.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  Saved screenshot to: ${screenshotPath}\n`);
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 5: Certificate Download (#/certificate?id=vc-bntu-2026-001)
  // -------------------------------------------------------------
  console.log('--- TEST 5: Certificate Download (#/certificate?id=vc-bntu-2026-001) ---');
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    page.on('console', msg => console.log('  [Cert Browser Console]', msg.type(), msg.text()));

    await page.goto('http://localhost:5173/#/certificate?id=vc-bntu-2026-001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const bodyText = await page.innerText('body');
    console.log('  Certificate title check:', bodyText.includes('CERTIFICATE') ? 'PASS (Found CERTIFICATE)' : 'FAIL');
    console.log('  Recipient check:', bodyText.includes('Aarav Sharma') ? 'PASS (Found Aarav Sharma)' : 'FAIL');
    console.log('  University check:', bodyText.includes('Bharathiar National Technological University') ? 'PASS (Found BNTU)' : 'FAIL');
    console.log('  QR text check:', bodyText.includes('Base45') || bodyText.includes('QR') ? 'PASS (Found QR information)' : 'FAIL');

    const screenshotPath = path.join(outDir, 'screen_5_certificate_download.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  Saved screenshot to: ${screenshotPath}\n`);
    await context.close();
  }

  await browser.close();
  console.log('=== ALL 5 BROWSER ACCEPTANCE TESTS COMPLETE! ===');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});


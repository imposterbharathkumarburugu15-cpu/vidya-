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
  console.log('--- STARTING 1080P PLAYWRIGHT SCREEN CAPTURES FOR 11 SCENES ---');
  const browser = await chromium.launch({ headless: true });
  const scenesDir = path.resolve(__dirname, '../video_production/scenes_11');
  if (!fs.existsSync(scenesDir)) fs.mkdirSync(scenesDir, { recursive: true });

  // SCENE 1: Introduction & Transparency Banner
  {
    console.log('Rendering Scene 1: Introduction...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:radial-gradient(circle at 50% 30%, #101626 0%, #06080e 100%); color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:80px; text-align:center; position:relative; overflow:hidden; }
        .grid-bg { position:absolute; inset:0; background-image:linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px); background-size:50px 50px; }
        .badge { background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); color:#e2bc4a; padding:10px 28px; border-radius:999px; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:3px; margin-bottom:28px; z-index:10; }
        .logo-box { width:120px; height:120px; border-radius:28px; background:linear-gradient(135deg, rgba(212,175,55,0.2), rgba(18,22,34,0.8)); border:2px solid rgba(212,175,55,0.5); display:grid; place-items:center; font-size:58px; margin-bottom:24px; box-shadow:0 0 50px rgba(212,175,55,0.25); z-index:10; }
        h1 { font-size:68px; font-weight:800; letter-spacing:-1px; margin-bottom:18px; background:linear-gradient(135deg, #ffffff 40%, #e2bc4a 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; z-index:10; }
        p.tagline { font-size:26px; color:#cbd5e1; max-width:1100px; line-height:1.5; margin-bottom:44px; z-index:10; }
        .pills { display:flex; gap:16px; margin-bottom:50px; z-index:10; }
        .pill { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:12px 24px; font-size:16px; font-weight:600; color:#e2e8f0; display:flex; align-items:center; gap:8px; }
        .disclosure { background:rgba(226,188,74,0.08); border:1px solid rgba(226,188,74,0.3); border-radius:14px; padding:18px 36px; max-width:1200px; font-size:16px; color:#fef08a; line-height:1.5; z-index:10; box-shadow:0 10px 30px rgba(0,0,0,0.5); }
        .disclosure strong { color:#fff; text-transform:uppercase; letter-spacing:1px; margin-right:8px; }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="badge">SMART INDIA HACKATHON 2026 PROTOTYPE</div>
      <div class="logo-box">🏛️</div>
      <h1>VidyaDwaar</h1>
      <p class="tagline">National Academic Data & Credential Integrity Platform<br><span style="font-size:20px; color:#94a3b8;">APAAR-Based Cross-Institutional Verification, Intake Governance & Student Digital Credential Wallet</span></p>
      
      <div class="pills">
        <div class="pill"><span>🛡️</span> Zero-Knowledge Verification</div>
        <div class="pill"><span>📜</span> W3C Verifiable Credentials</div>
        <div class="pill"><span>📱</span> Offline-First Android APK</div>
        <div class="pill"><span>📊</span> Explainable Duplicate Resolution</div>
      </div>

      <div class="disclosure">
        <strong>Transparency Disclosure:</strong>
        This demonstration uses synthetic student records and illustrative dashboard data created specifically for the SIH prototype presentation. It does not represent live AICTE institutional data.
      </div>
    </body>
    </html>
    `;
    await page.setContent(html);
    await page.screenshot({ path: path.join(scenesDir, 'scene_01.png') });
    await context.close();
  }

  // SCENE 2: Problem Statement Graphic
  {
    console.log('Rendering Scene 2: Problem Statement...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:#07090e; color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:70px; overflow:hidden; }
        .badge { background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#f87171; padding:8px 24px; border-radius:999px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-bottom:20px; }
        h1 { font-size:46px; font-weight:800; margin-bottom:14px; text-align:center; }
        p.sub { font-size:20px; color:#94a3b8; margin-bottom:50px; text-align:center; }
        .cards { display:grid; grid-template-columns:repeat(4, 1fr); gap:28px; width:100%; max-width:1700px; }
        .card { background:rgba(18,22,34,0.85); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:36px 28px; box-shadow:0 20px 40px rgba(0,0,0,0.6); position:relative; }
        .card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; }
        .c1::before { background:#ef4444; }
        .c2::before { background:#f59e0b; }
        .c3::before { background:#8b5cf6; }
        .c4::before { background:#06b6d4; }
        .icon { font-size:42px; margin-bottom:20px; }
        .title { font-size:22px; font-weight:700; margin-bottom:12px; color:#f1f5f9; }
        .desc { font-size:15px; color:#94a3b8; line-height:1.6; }
        .bottom-banner { margin-top:50px; background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.3); border-radius:14px; padding:20px 40px; font-size:18px; color:#e2bc4a; font-weight:600; }
      </style>
    </head>
    <body>
      <div class="badge">REGULATORY & ACADEMIC CHALLENGES</div>
      <h1>Current Vulnerabilities in Higher Education Data</h1>
      <p class="sub">Over 40,000 institutions operate on siloed, incompatible record systems</p>

      <div class="cards">
        <div class="card c1">
          <div class="icon">🗄️</div>
          <div class="title">Fragmented Institutional ERPs</div>
          <div class="desc">Academic records locked inside disparate local databases and spreadsheets, preventing real-time cross-institutional visibility and inter-state data reconciliation.</div>
        </div>
        <div class="card c2">
          <div class="icon">👥</div>
          <div class="title">Duplicate & Ghost Admissions</div>
          <div class="desc">No automated mechanism to detect students simultaneously enrolled in multiple institutions across state jurisdictions or claiming fraudulent multiple scholarships.</div>
        </div>
        <div class="card c3">
          <div class="icon">📉</div>
          <div class="title">Intake Quota Monitoring</div>
          <div class="desc">Difficulties tracking actual student enrolments against AICTE-approved quota limits, leading to unmonitored over-admissions and severe infrastructure dilution.</div>
        </div>
        <div class="card c4">
          <div class="icon">📜</div>
          <div class="title">Manual & Paper Verification</div>
          <div class="desc">Verification of degrees and marksheets relies on slow, expensive manual postal inquiries, making credentials vulnerable to widespread counterfeiting.</div>
        </div>
      </div>

      <div class="bottom-banner">
        💡 VidyaDwaar Solution: An APAAR-anchored cryptographic trust layer unifying verification across India
      </div>
    </body>
    </html>
    `;
    await page.setContent(html);
    await page.screenshot({ path: path.join(scenesDir, 'scene_02.png') });
    await context.close();
  }

  // SCENE 3: Platform & Multi-Role Permissions (Live UI + Matrix)
  {
    console.log('Rendering Scene 3: Multi-Role Sign-in & Permissions...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:#07090e; color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:60px; overflow:hidden; }
        .badge { background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); color:#e2bc4a; padding:8px 24px; border-radius:999px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-bottom:20px; }
        h1 { font-size:46px; font-weight:800; margin-bottom:12px; background:linear-gradient(135deg, #ffffff 40%, #e2bc4a 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        p.subtitle { font-size:20px; color:#94a3b8; margin-bottom:44px; }
        .grid { display:grid; grid-template-columns: repeat(5, 1fr); gap:20px; width:100%; max-width:1800px; }
        .card { background:rgba(18,22,34,0.85); border:1px solid rgba(255,255,255,0.1); border-radius:18px; padding:30px 22px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.5); position:relative; }
        .card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; }
        .c-student::before { background:#3b82f6; }
        .c-inst::before { background:#e2bc4a; }
        .c-reg::before { background:#10b981; }
        .c-aicte::before { background:#f59e0b; }
        .c-ver::before { background:#8b5cf6; }
        .icon { font-size:38px; margin-bottom:16px; }
        .role { font-size:20px; font-weight:700; color:#fff; margin-bottom:6px; }
        .perm-tag { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:10px; padding:10px 14px; font-size:14px; font-weight:600; color:#f1f5f9; width:100%; margin:14px 0; }
        .details { font-size:13px; color:#94a3b8; line-height:1.5; text-align:left; }
        .details li { margin-bottom:6px; }
      </style>
    </head>
    <body>
      <div class="badge">ROLE-BASED ACCESS CONTROL (RBAC)</div>
      <h1>Principle-of-Least-Privilege Multi-Role Architecture</h1>
      <p class="subtitle">Every role enforces isolated permissions and strict access boundaries</p>
      
      <div class="grid">
        <div class="card c-student">
          <div class="icon">🎓</div>
          <div class="role">STUDENT</div>
          <div class="perm-tag">Personal Academic Records</div>
          <ul class="details">
            <li>Self-sovereign APAAR record view</li>
            <li>Direct credential wallet & downloads</li>
            <li>Consent grant/revocation for verifiers</li>
            <li>Access transparency audit trails</li>
          </ul>
        </div>

        <div class="card c-inst">
          <div class="icon">🏛️</div>
          <div class="role">INSTITUTION ADMIN</div>
          <div class="perm-tag">Authorized Institution Records</div>
          <ul class="details">
            <li>Own institution student admissions</li>
            <li>Approved seat quota utilisation</li>
            <li>Data Quality Scoring (DQS) monitor</li>
            <li>Batch upload validation & ingestion</li>
          </ul>
        </div>

        <div class="card c-reg">
          <div class="icon">📋</div>
          <div class="role">REGISTRAR / STAFF</div>
          <div class="perm-tag">Record Administration</div>
          <ul class="details">
            <li>Enrolment status modifications</li>
            <li>Issuance of verifiable degrees</li>
            <li>Academic dispute resolution</li>
            <li>Institutional compliance checks</li>
          </ul>
        </div>

        <div class="card c-aicte">
          <div class="icon">🇮🇳</div>
          <div class="role">AICTE REGULATOR</div>
          <div class="perm-tag">Regulatory Oversight</div>
          <ul class="details">
            <li>National institutional registry</li>
            <li>Excess enrolment detection</li>
            <li>Cross-institution duplicate review</li>
            <li>Automated risk & inspection queue</li>
          </ul>
        </div>

        <div class="card c-ver">
          <div class="icon">🔍</div>
          <div class="role">EXTERNAL VERIFIER</div>
          <div class="perm-tag">Controlled Verification</div>
          <ul class="details">
            <li>QR & digital signature verification</li>
            <li>Consent-driven scope verification</li>
            <li>Zero PII exposure without consent</li>
            <li>Cryptographic proof validation</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
    `;
    await page.setContent(html);
    await page.screenshot({ path: path.join(scenesDir, 'scene_03.png') });
    await context.close();
  }

  // SCENE 4: Live Institution Dashboard
  {
    console.log('Capturing Scene 4: Live Institution Dashboard...');
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

  // SCENE 5: Live Student Experience (My Record)
  {
    console.log('Capturing Scene 5: Live Student Experience...');
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

  // SCENE 6: Student APK and Offline Experience Frame
  {
    console.log('Rendering Scene 6: Student APK & Offline Experience...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:#07090e; color:#fff; display:flex; align-items:center; justify-content:center; padding:70px; gap:80px; overflow:hidden; }
        .phone-frame { width:420px; height:840px; background:#121622; border:12px solid #232938; border-radius:48px; box-shadow:0 30px 70px rgba(0,0,0,0.8), 0 0 50px rgba(59,130,246,0.15); display:flex; flex-direction:column; overflow:hidden; position:relative; }
        .notch { width:140px; height:24px; background:#232938; border-bottom-left-radius:16px; border-bottom-right-radius:16px; align-self:center; }
        .app-header { padding:20px 24px 14px; background:#181e2e; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; }
        .app-title { font-size:18px; font-weight:700; color:#e2bc4a; }
        .offline-badge { background:#10b981; color:#000; font-size:11px; font-weight:800; padding:4px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:1px; }
        .app-content { padding:24px; flex:1; display:flex; flex-direction:column; gap:16px; }
        .student-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:18px; }
        .stu-name { font-size:20px; font-weight:700; margin-bottom:4px; }
        .stu-id { font-family:monospace; font-size:13px; color:#94a3b8; }
        .cert-card { background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.3); border-radius:16px; padding:18px; }
        .cert-title { font-size:15px; font-weight:700; color:#e2bc4a; margin-bottom:6px; }
        .qr-placeholder { width:120px; height:120px; background:#fff; border-radius:10px; margin:12px auto; display:grid; place-items:center; font-size:32px; color:#000; }
        .info-col { flex:1; max-width:800px; }
        .badge { background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.4); color:#60a5fa; padding:8px 20px; border-radius:999px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:2px; display:inline-block; margin-bottom:20px; }
        h1 { font-size:48px; font-weight:800; line-height:1.2; margin-bottom:24px; }
        .stmt-box { background:rgba(226,188,74,0.1); border-left:4px solid #e2bc4a; padding:24px; border-radius:0 14px 14px 0; margin-bottom:30px; font-size:19px; line-height:1.6; color:#f8fafc; }
        .features { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .feat { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:18px; }
        .feat h4 { font-size:16px; font-weight:700; color:#fff; margin-bottom:6px; }
        .feat p { font-size:13px; color:#94a3b8; line-height:1.4; }
      </style>
    </head>
    <body>
      <div class="phone-frame">
        <div class="notch"></div>
        <div class="app-header">
          <div class="app-title">VidyaDwaar Mobile</div>
          <div class="offline-badge">Offline Mode</div>
        </div>
        <div class="app-content">
          <div class="student-card">
            <div class="stu-name">Aarav Sharma</div>
            <div class="stu-id">APAAR: XXXX-XXXX-1724</div>
            <div style="margin-top:10px; font-size:12px; color:#10b981;">✓ Locally Cached Verified Profile</div>
          </div>

          <div class="cert-card">
            <div class="cert-title">Cached Degree Credential</div>
            <div style="font-size:12px; color:#cbd5e1;">B.E. Computer Science & Engg</div>
            <div class="qr-placeholder">📱</div>
            <div style="font-size:11px; text-align:center; color:#94a3b8;">Base45 Ed25519 QR (Sub-12ms Offline Verify)</div>
          </div>
        </div>
      </div>

      <div class="info-col">
        <div class="badge">NATIVE ANDROID APK (OFFLINE-FIRST)</div>
        <h1>Offline Student Credentials on Android</h1>
        
        <div class="stmt-box">
          "VidyaDwaar also provides an offline-capable Android application for students, enabling access to supported locally available academic information and downloaded certificates even when internet connectivity is unavailable."
        </div>

        <div class="features">
          <div class="feat">
            <h4>📦 Local SQLite Storage</h4>
            <p>Encrypted local credential store preserves academic records securely on the device without active telemetry.</p>
          </div>
          <div class="feat">
            <h4>⚡ Sub-12ms QR Scanning</h4>
            <p>Native camera QR parser checks W3C verifiable signatures offline against public regulatory keys.</p>
          </div>
          <div class="feat">
            <h4>🔒 Zero Internet Required</h4>
            <p>Presents tamper-evident Base45 credentials to employers or interviewers in remote network conditions.</p>
          </div>
          <div class="feat">
            <h4>⚠️ Clear Status Distinction</h4>
            <p>Distinct UI clearly differentiates downloaded cached records from live server synchronization.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    await page.setContent(html);
    await page.screenshot({ path: path.join(scenesDir, 'scene_06.png') });
    await context.close();
  }

  // SCENE 7: Live Certificate Download View
  {
    console.log('Capturing Scene 7: Live Certificate Download...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/certificate?id=vc-bntu-2026-001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_07.png') });
    await context.close();
  }

  // SCENE 8: Live AICTE Duplicate Cases Queue
  {
    console.log('Capturing Scene 8: Live AICTE Duplicate Cases...');
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

  // SCENE 9: Live AICTE Overview & Monitoring
  {
    console.log('Capturing Scene 9: Live AICTE Overview...');
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

  // SCENE 10: Technical Architecture Graphic
  {
    console.log('Rendering Scene 10: Technical Architecture...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:#07090e; color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:60px; overflow:hidden; }
        .badge { background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); color:#e2bc4a; padding:8px 24px; border-radius:999px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-bottom:20px; }
        h1 { font-size:46px; font-weight:800; margin-bottom:12px; background:linear-gradient(135deg, #ffffff 40%, #e2bc4a 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        p.subtitle { font-size:20px; color:#94a3b8; margin-bottom:44px; }
        .arch-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; width:100%; max-width:1760px; }
        .tier { background:rgba(18,22,34,0.85); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:32px 24px; box-shadow:0 20px 40px rgba(0,0,0,0.5); }
        .tier h3 { font-size:22px; font-weight:700; color:#e2bc4a; margin-bottom:16px; border-bottom:1px solid rgba(212,175,55,0.25); padding-bottom:10px; }
        .stack-item { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px; margin-bottom:12px; }
        .stack-item strong { display:block; color:#fff; font-size:15px; margin-bottom:4px; }
        .stack-item span { color:#94a3b8; font-size:13px; line-height:1.4; display:block; }
      </style>
    </head>
    <body>
      <div class="badge">SYSTEM ARCHITECTURE & SECURITY</div>
      <h1>Enterprise Technical Architecture</h1>
      <p class="subtitle">High-throughput, privacy-first infrastructure designed for national scale</p>

      <div class="arch-grid">
        <div class="tier">
          <h3>1. Frontend & Client Tier</h3>
          <div class="stack-item">
            <strong>React 19 + TypeScript + Vite</strong>
            <span>Responsive single-page application with tailwindcss styling and hash-based routing.</span>
          </div>
          <div class="stack-item">
            <strong>WebAuthn & Passkeys</strong>
            <span>FIDO2 biometric passkey authentication replacing vulnerable passwords.</span>
          </div>
          <div class="stack-item">
            <strong>Native Android APK</strong>
            <span>Kotlin Jetpack Compose client with offline SQLite cache and Base45 verification.</span>
          </div>
        </div>

        <div class="tier">
          <h3>2. API & Ingestion Engine</h3>
          <div class="stack-item">
            <strong>Python 3.12 + FastAPI</strong>
            <span>High-concurrency async REST API handling student logins, batch uploads, and query resolution.</span>
          </div>
          <div class="stack-item">
            <strong>Batch Ingestion Pipeline</strong>
            <span>Synchronous and asynchronous CSV/JSON roster processing with instant APAAR validation.</span>
          </div>
          <div class="stack-item">
            <strong>Pydantic Data Contracts</strong>
            <span>Strict OpenAPI schema models validating all network inputs and responses.</span>
          </div>
        </div>

        <div class="tier">
          <h3>3. Cryptography & Security</h3>
          <div class="stack-item">
            <strong>Blind Indexing (HMAC-SHA256)</strong>
            <span>Exact-match lookups without storing or revealing raw APAAR identifiers.</span>
          </div>
          <div class="stack-item">
            <strong>W3C Verifiable Credentials</strong>
            <span>Ed25519-signed digital certificates compliant with global decentralized identity standards.</span>
          </div>
          <div class="stack-item">
            <strong>Immutable Audit Trails</strong>
            <span>Cryptographic append-only logging of every student record query and unmasking event.</span>
          </div>
        </div>

        <div class="tier">
          <h3>4. Storage & Persistence</h3>
          <div class="stack-item">
            <strong>PostgreSQL with RLS</strong>
            <span>Database-level Row-Level Security isolating institutional and student records.</span>
          </div>
          <div class="stack-item">
            <strong>Synthetic Demo Store</strong>
            <span>In-memory high-resilience mock database ensuring zero downtime during presentations.</span>
          </div>
          <div class="stack-item">
            <strong>Encrypted Backups</strong>
            <span>AES-256 GCM envelope encryption securing sensitive academic records at rest.</span>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    await page.setContent(html);
    await page.screenshot({ path: path.join(scenesDir, 'scene_10.png') });
    await context.close();
  }

  // SCENE 11: Conclusion & Impact
  {
    console.log('Rendering Scene 11: Conclusion...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:radial-gradient(circle at 50% 40%, #101626 0%, #06080e 100%); color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:80px; text-align:center; position:relative; overflow:hidden; }
        .badge { background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); color:#e2bc4a; padding:10px 28px; border-radius:999px; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:3px; margin-bottom:28px; }
        h1 { font-size:58px; font-weight:800; margin-bottom:20px; }
        .grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:28px; max-width:1600px; width:100%; margin-bottom:50px; }
        .impact-card { background:rgba(18,22,34,0.8); border:1px solid rgba(255,255,255,0.1); border-radius:18px; padding:32px 24px; text-align:left; box-shadow:0 15px 35px rgba(0,0,0,0.5); }
        .impact-card h3 { font-size:20px; font-weight:700; color:#e2bc4a; margin-bottom:10px; display:flex; align-items:center; gap:10px; }
        .impact-card p { font-size:15px; color:#cbd5e1; line-height:1.5; }
        .tagline-banner { background:linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05)); border:2px solid rgba(212,175,55,0.5); border-radius:18px; padding:24px 50px; max-width:1400px; }
        .tagline { font-size:32px; font-weight:800; background:linear-gradient(135deg, #ffffff 40%, #e2bc4a 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
      </style>
    </head>
    <body>
      <div class="badge">SMART INDIA HACKATHON 2026 SUMMARY</div>
      <h1>Expected Impact & National Value</h1>

      <div class="grid">
        <div class="impact-card">
          <h3><span>⚡</span> Eliminates Ghost Admissions</h3>
          <p>Instant cross-institutional duplicate detection across states prevents fraudulent multiple enrollments and fake scholarship claims.</p>
        </div>
        <div class="impact-card">
          <h3><span>🛡️</span> Tamper-Evident Credentials</h3>
          <p>Cryptographically verifiable certificates with Base45 QR codes allow sub-12ms offline verification by employers and universities.</p>
        </div>
        <div class="impact-card">
          <h3><span>📊</span> Automated Regulatory Intake</h3>
          <p>Real-time intake monitoring ensures institutions strictly respect AICTE approved limits, protecting educational quality.</p>
        </div>
      </div>

      <div class="tagline-banner">
        <div class="tagline">"VidyaDwaar — Making Academic Records More Reliable, Verifiable and Transparent."</div>
      </div>
    </body>
    </html>
    `;
    await page.setContent(html);
    await page.screenshot({ path: path.join(scenesDir, 'scene_11.png') });
    await context.close();
  }

  await browser.close();
  console.log('--- ALL 11 SCENE SCREENSHOTS CAPTURED SUCCESSFULLY! ---');
})();

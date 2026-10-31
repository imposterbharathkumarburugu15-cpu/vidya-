const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../frontend/node_modules/playwright'));

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
  console.log('--- STARTING 1080P PLAYWRIGHT SCREEN CAPTURES FOR 12 SCENES ---');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const scenesDir = path.resolve(__dirname, '../video_production/scenes');
  if (!fs.existsSync(scenesDir)) fs.mkdirSync(scenesDir, { recursive: true });

  // 1. Landing Page (Scene 1 & Scene 2)
  {
    console.log('Capturing Scene 1 (Landing Page)...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_01_landing.png') });
    await context.close();
  }

  // 2. Existing Challenges (Scene 2)
  {
    console.log('Capturing Scene 2 (Challenges / Why VidyaDwaar)...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/why', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_02_challenges.png') });
    await context.close();
  }

  // 3. Solution & USP (Scene 3)
  {
    console.log('Capturing Scene 3 (Solution / How it works)...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/how-it-works', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_03_solution.png') });
    await context.close();
  }

  // 4. Multi-Role Sign-in & Roles Matrix (Scene 4)
  {
    console.log('Capturing Scene 4 (Multi-Role Sign-in)...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/signin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_04_roles_login.png') });
    await context.close();
  }

  // Generate Scene 4 Role Permissions Matrix Visual
  {
    console.log('Rendering Scene 4 Permissions Matrix Graphic...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:#07090e; color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:60px; overflow:hidden; }
        .badge { background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); color:#e2bc4a; padding:8px 24px; border-radius:999px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-bottom:20px; }
        h1 { font-size:46px; font-weight:800; margin-bottom:12px; background:linear-gradient(135deg, #ffffff 40%, #e2bc4a 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        p.subtitle { font-size:20px; color:#94a3b8; margin-bottom:50px; }
        .grid { display:grid; grid-template-columns: repeat(5, 1fr); gap:24px; width:100%; max-width:1800px; }
        .card { background:rgba(18,22,34,0.75); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:32px 24px; display:flex; flex-direction:column; align-items:center; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.5); position:relative; overflow:hidden; }
        .card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; }
        .card-student::before { background:#3b82f6; }
        .card-inst::before { background:#e2bc4a; }
        .card-registrar::before { background:#10b981; }
        .card-aicte::before { background:#f59e0b; }
        .card-verifier::before { background:#8b5cf6; }
        .icon-box { width:70px; height:70px; border-radius:18px; display:grid; place-items:center; font-size:32px; margin-bottom:20px; }
        .role-title { font-size:22px; font-weight:700; color:#fff; margin-bottom:8px; }
        .arrow { font-size:20px; color:#e2bc4a; margin:12px 0; font-weight:bold; }
        .permission-badge { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:14px 18px; font-size:16px; font-weight:600; color:#f1f5f9; width:100%; }
        .scope { font-size:13px; color:#64748b; margin-top:16px; line-height:1.4; }
      </style>
    </head>
    <body>
      <div class="badge">ROLE-BASED ACCESS CONTROL (RBAC)</div>
      <h1>VidyaDwaar Multi-Role Access & Permissions Model</h1>
      <p class="subtitle">Every role enforces strict principle-of-least-privilege permissions across the national academic registry</p>
      
      <div class="grid">
        <div class="card card-student">
          <div class="icon-box" style="background:rgba(59,130,246,0.15); color:#60a5fa;">🎓</div>
          <div class="role-title">STUDENT</div>
          <div class="arrow">↓</div>
          <div class="permission-badge">Personal Academic Records</div>
          <div class="scope">Self-sovereign credential wallet, privacy consent management, masked APAAR profile</div>
        </div>

        <div class="card card-inst">
          <div class="icon-box" style="background:rgba(226,188,74,0.15); color:#e2bc4a;">🏛️</div>
          <div class="role-title">INSTITUTION</div>
          <div class="arrow">↓</div>
          <div class="permission-badge">Authorized Student Record Management</div>
          <div class="scope">Batch roster uploads, seat quota validation, compliance audit ledger restricted to own college</div>
        </div>

        <div class="card card-registrar">
          <div class="icon-box" style="background:rgba(16,185,129,0.15); color:#34d399;">📜</div>
          <div class="role-title">REGISTRAR</div>
          <div class="arrow">↓</div>
          <div class="permission-badge">Academic Record Administration</div>
          <div class="scope">Affiliation review, W3C 2.0 digital degree issuance, Ed25519 tamper-proof cryptographic signing</div>
        </div>

        <div class="card card-aicte">
          <div class="icon-box" style="background:rgba(245,158,11,0.15); color:#fbbf24;">🇮🇳</div>
          <div class="role-title">AICTE ADMIN</div>
          <div class="arrow">↓</div>
          <div class="permission-badge">Institutional Monitoring & Analytics</div>
          <div class="scope">Central duplicate radar, macro seat intake enforcement, multi-state compliance audit queues</div>
        </div>

        <div class="card card-verifier">
          <div class="icon-box" style="background:rgba(139,92,246,0.15); color:#a78bfa;">🔍</div>
          <div class="role-title">EXTERNAL VERIFIER</div>
          <div class="arrow">↓</div>
          <div class="permission-badge">Controlled Verification Access</div>
          <div class="scope">Sub-12ms QR validation, cryptographically consented verification without accessing full student database</div>
        </div>
      </div>
    </body>
    </html>
    `;
    await page.setContent(htmlContent);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_04_roles_matrix.png') });
    await context.close();
  }

  // 5. Institution Administrator Dashboard (Scene 5)
  {
    console.log('Capturing Scene 5 (Institution Dashboard with Real Data)...');
    const session = await getJwtToken('inst-a', 'demo');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    await context.addInitScript((sess) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: sess.access_token,
        role: sess.role,
        institution_id: sess.institution_id,
        display_name: sess.display_name,
        user_id: 'inst-a'
      }));
    }, session);

    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/inst');
    await page.waitForSelector('section[aria-label="Key figures"]', { timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(scenesDir, 'scene_05_institution_dashboard.png') });
    await context.close();
  }

  // 6. Student Login & Student Dashboard (Scene 6)
  {
    console.log('Capturing Scene 6 (Student Dashboard)...');
    const session = await getStudentToken('328865551724', '2006-11-05');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
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
    await page.goto('http://localhost:5173/#/student');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(scenesDir, 'scene_06_student_dashboard.png') });
    await context.close();
  }

  // 7. Student Android APK Showcase (Scene 7)
  {
    console.log('Rendering Scene 7 (Offline Android APK Showcase)...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:#07090e; color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:60px; overflow:hidden; }
        .badge { background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); color:#34d399; padding:8px 24px; border-radius:999px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-bottom:16px; }
        h1 { font-size:44px; font-weight:800; margin-bottom:12px; background:linear-gradient(135deg, #ffffff 40%, #34d399 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        
        /* Mandatory Quote Box */
        .quote-box { width:100%; max-width:1400px; background:rgba(16,185,129,0.08); border:2px solid rgba(16,185,129,0.35); border-radius:18px; padding:22px 32px; margin-bottom:36px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.4); }
        .quote-text { font-size:18.5px; font-weight:600; color:#a7f3d0; line-height:1.5; font-style:italic; }

        .container { display:flex; gap:60px; align-items:center; justify-content:center; width:100%; max-width:1600px; }
        
        /* Phone Mockup */
        .phone { width:340px; height:580px; background:#0d111a; border:8px solid #2d3748; border-radius:44px; padding:20px; box-shadow:0 25px 60px rgba(0,0,0,0.8); display:flex; flex-direction:column; position:relative; overflow:hidden; }
        .phone-notch { position:absolute; top:10px; left:50%; transform:translateX(-50%); width:120px; height:20px; background:#2d3748; border-radius:0 0 14px 14px; }
        .phone-header { margin-top:20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; display:flex; justify-content:space-between; align-items:center; }
        .phone-title { font-size:15px; font-weight:700; color:#fff; }
        .offline-pill { background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#34d399; font-size:11px; font-weight:700; padding:3px 10px; border-radius:999px; }
        .phone-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; margin-top:14px; }
        .student-name { font-size:16px; font-weight:700; color:#fff; }
        .student-sub { font-size:12px; color:#94a3b8; margin-top:4px; }
        .qr-placeholder { background:#fff; border-radius:10px; height:120px; display:grid; place-items:center; color:#000; font-weight:700; font-size:12px; margin-top:12px; }
        .download-btn { background:#10b981; color:#fff; text-align:center; padding:10px; border-radius:10px; font-size:13px; font-weight:700; margin-top:14px; }

        /* Feature list */
        .features { flex:1; max-width:800px; display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .feat-card { background:rgba(18,22,34,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:24px; }
        .feat-title { font-size:18px; font-weight:700; color:#34d399; margin-bottom:8px; display:flex; align-items:center; gap:10px; }
        .feat-desc { font-size:14px; color:#94a3b8; line-height:1.5; }
      </style>
    </head>
    <body>
      <div class="badge">OFFLINE ANDROID APPLICATION</div>
      <h1>VidyaDwaar Native Student APK</h1>
      
      <div class="quote-box">
        <p class="quote-text">"VidyaDwaar also provides an offline-capable Android application for students, enabling access to supported locally available academic information and downloaded certificates even when internet connectivity is unavailable."</p>
      </div>

      <div class="container">
        <!-- Phone View -->
        <div class="phone">
          <div class="phone-notch"></div>
          <div class="phone-header">
            <div class="phone-title">VidyaDwaar Mobile</div>
            <div class="offline-pill">OFFLINE READY</div>
          </div>
          <div class="phone-card">
            <div class="student-name">Aarav Sharma</div>
            <div class="student-sub">APAAR: XXXX-XXXX-1724</div>
            <div class="student-sub">B.E. Computer Science · VITS Bengaluru</div>
          </div>
          <div class="phone-card">
            <div style="font-size:12px; font-weight:700; color:#e2bc4a;">DEGREE CREDENTIAL (W3C VC 2.0)</div>
            <div class="qr-placeholder">VERIFIED OFFLINE QR [AV1: BASE45]</div>
            <div class="download-btn">Saved in Local Storage</div>
          </div>
        </div>

        <!-- Features -->
        <div class="features">
          <div class="feat-card">
            <div class="feat-title">📱 Native APK Distribution</div>
            <div class="feat-desc">Directly installable via <code>vidyadwaar-student-portal.apk</code> (21.7 MB). Built with Android SDK & optimized for lightweight mobile hardware across India.</div>
          </div>
          <div class="feat-card">
            <div class="feat-title">⚡ Sub-12ms Offline Verification</div>
            <div class="feat-desc">Validates tamper-evident Ed25519 digital signatures and Base45 zlib compressed QR codes completely on-device without internet access.</div>
          </div>
          <div class="feat-card">
            <div class="feat-title">🔒 Encrypted Local Credential Storage</div>
            <div class="feat-desc">Caches verifiable academic transcripts and enrollment certificates in secure device sandboxing, protecting student privacy under the DPDP Act.</div>
          </div>
          <div class="feat-card">
            <div class="feat-title">🔄 Seamless Sync & Updates</div>
            <div class="feat-desc">Clearly demarcates downloaded local records from live institutional updates; synchronizes with AICTE registries whenever network connectivity resumes.</div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    await page.setContent(htmlContent);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_07_student_apk.png') });
    await context.close();
  }

  // 8. Certificate Viewing & Downloading (Scene 8)
  {
    console.log('Capturing Scene 8 (Certificate Viewing & Downloading)...');
    const session = await getStudentToken('328865551724', '2006-11-05');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
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
    await page.goto('http://localhost:5173/#/certificate?id=vc-bntu-2026-001');
    await page.waitForTimeout(3500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_08_certificate.png') });
    await context.close();
  }

  // 9. Cross-Institution Matching & Duplicate Radar (Scene 9)
  {
    console.log('Capturing Scene 9 (Duplicate Enrolment Radar)...');
    const session = await getJwtToken('aicte', 'demo');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    await context.addInitScript((sess) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: sess.access_token,
        role: sess.role,
        institution_id: null,
        display_name: sess.display_name,
        user_id: 'aicte'
      }));
    }, session);

    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/aicte/cases');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(scenesDir, 'scene_09_duplicate_radar.png') });
    await context.close();
  }

  // 10. AICTE Monitoring Dashboard (Scene 10)
  {
    console.log('Capturing Scene 10 (AICTE Central Monitoring Dashboard)...');
    const session = await getJwtToken('aicte', 'demo');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    await context.addInitScript((sess) => {
      sessionStorage.setItem('apaar.session', JSON.stringify({
        token: sess.access_token,
        role: sess.role,
        institution_id: null,
        display_name: sess.display_name,
        user_id: 'aicte'
      }));
    }, session);

    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/aicte');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(scenesDir, 'scene_10_aicte_dashboard.png') });
    await context.close();
  }

  // 11. Technical Architecture & Security (Scene 11)
  {
    console.log('Capturing Scene 11 (Technical Architecture & Developer Portal)...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/#/developer', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_11_architecture.png') });
    await context.close();
  }

  // 12. Expected Impact & Conclusion (Scene 12)
  {
    console.log('Rendering Scene 12 (Conclusion & Impact Graphic)...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:#07090e; color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:60px; overflow:hidden; }
        .badge { background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); color:#e2bc4a; padding:8px 24px; border-radius:999px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-bottom:16px; }
        h1 { font-size:48px; font-weight:800; margin-bottom:12px; background:linear-gradient(135deg, #ffffff 40%, #e2bc4a 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        p.subtitle { font-size:20px; color:#94a3b8; margin-bottom:50px; }
        .grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:30px; width:100%; max-width:1600px; }
        .card { background:rgba(18,22,34,0.75); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:36px 30px; display:flex; flex-direction:column; box-shadow:0 20px 40px rgba(0,0,0,0.5); }
        .card-title { font-size:24px; font-weight:700; color:#e2bc4a; margin-bottom:16px; display:flex; align-items:center; gap:12px; }
        .card-list { list-style:none; display:flex; flex-direction:column; gap:14px; }
        .card-list li { font-size:16px; color:#cbd5e1; line-height:1.5; display:flex; gap:12px; }
        .card-list li::before { content:'✔'; color:#34d399; font-weight:bold; }
        .footer-note { margin-top:50px; font-size:14px; color:#64748b; letter-spacing:1px; text-transform:uppercase; }
      </style>
    </head>
    <body>
      <div class="badge">NATIONAL IMPACT & CONCLUSION</div>
      <h1>VidyaDwaar: Transforming Indian Academic Governance</h1>
      <p class="subtitle">Smart India Hackathon 2026 · Problem Statement SIH26263</p>
      
      <div class="grid">
        <div class="card">
          <div class="card-title"><span>🎓</span> For Students</div>
          <ul class="card-list">
            <li>Permanent self-sovereign ownership of all academic degrees & transcripts.</li>
            <li>Instant offline access via native Android APK without internet dependence.</li>
            <li>Zero PII leakage: cryptographic consent control compliant with DPDP Act 2023.</li>
            <li>Sub-12ms credential sharing with employers and foreign universities.</li>
          </ul>
        </div>

        <div class="card">
          <div class="card-title"><span>🏛️</span> For Institutions</div>
          <ul class="card-list">
            <li>Automated validation of intake quotas against AICTE approval handbooks.</li>
            <li>Elimination of manual verification delays and repetitive reporting burdens.</li>
            <li>Real-time ERP synchronization via webhook ingestion auditing.</li>
            <li>Protection against accidental over-admissions and regulatory penalties.</li>
          </ul>
        </div>

        <div class="card">
          <div class="card-title"><span>🇮🇳</span> For AICTE & Regulators</div>
          <ul class="card-list">
            <li>Zero-honeypot blind duplicate detection across all state boundaries.</li>
            <li>Immediate detection of ghost institutions and fraudulent scholarship claims.</li>
            <li>National macro-level analytics on seat demand, gender, and regional trends.</li>
            <li>W3C Verifiable Credential standard establishing an unforgeable academic truth.</li>
          </ul>
        </div>
      </div>

      <div class="footer-note">Smart India Hackathon 2026 Prototype · Verified Academic Records Engine</div>
    </body>
    </html>
    `;
    await page.setContent(htmlContent);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(scenesDir, 'scene_12_conclusion.png') });
    await context.close();
  }

  // Also create a polished 1080p Thumbnail
  {
    console.log('Generating 1080p Thumbnail.png...');
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width:1920px; height:1080px; background:radial-gradient(circle at center, #171d2b 0%, #07090e 100%); color:#fff; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:60px; overflow:hidden; position:relative; }
        .glow { position:absolute; width:600px; height:600px; background:radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%); border-radius:50%; }
        .badge { background:rgba(212,175,55,0.2); border:1.5px solid #d4af37; color:#fbe7a1; padding:10px 32px; border-radius:999px; font-size:18px; font-weight:800; text-transform:uppercase; letter-spacing:3px; margin-bottom:24px; z-index:2; }
        h1 { font-size:74px; font-weight:900; text-align:center; line-height:1.1; margin-bottom:20px; background:linear-gradient(135deg, #ffffff 30%, #e2bc4a 80%, #d4af37 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; z-index:2; }
        p.desc { font-size:26px; color:#94a3b8; text-align:center; max-width:1100px; margin-bottom:40px; line-height:1.5; z-index:2; }
        .pills { display:flex; gap:20px; z-index:2; }
        .pill { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); border-radius:14px; padding:14px 28px; font-size:18px; font-weight:700; color:#f1f5f9; display:flex; align-items:center; gap:10px; }
      </style>
    </head>
    <body>
      <div class="glow"></div>
      <div class="badge">SMART INDIA HACKATHON 2026 · PS SIH26263</div>
      <h1>VidyaDwaar: Complete Academic Ecosystem</h1>
      <p class="desc">Deterministic Student Data Ingestion · Role-Based Access Control · Offline Android App · Verifiable W3C Credentials</p>
      <div class="pills">
        <div class="pill"><span>👥</span> All User Roles</div>
        <div class="pill"><span>🎓</span> Student Experience</div>
        <div class="pill"><span>📱</span> Offline Android APK</div>
        <div class="pill"><span>📜</span> W3C Digital Degrees</div>
        <div class="pill"><span>🇮🇳</span> AICTE National Radar</div>
      </div>
    </body>
    </html>
    `;
    await page.setContent(htmlContent);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.resolve(__dirname, '../Thumbnail.png') });
    await context.close();
  }

  await browser.close();
  console.log('--- ALL 12 SCENES AND THUMBNAIL CAPTURED SUCCESSFULLY! ---');
})();


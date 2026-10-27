import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileDown,
  GraduationCap,
  Landmark,
  Network,
  Sparkles,
  Upload,
  UserRound,
  Zap,
} from "lucide-react";
import { ApiError, getJson, login, studentLogin, type S, type Session } from "../api/client";
import HeroSection from "../components/landing/HeroSection";
import MetricsDock from "../components/landing/MetricsDock";
import RoleCards from "../components/landing/RoleCards";
import { GOLD_TEXT, spotlight } from "../components/landing/styles";

const HOME_MAP: Record<string, string> = {
  institution_admin: "/inst",
  aicte_officer: "/aicte",
  auditor: "/aicte",
  verifier: "/verifier",
  university_registrar: "/registrar",
  student: "/student",
  guardian: "/student",
};

const ONE_CLICK_ROLES: {
  key: string;
  tag: string;
  title: string;
  desc: string;
  icon: typeof Building2;
  action: () => Promise<Session>;
}[] = [
  {
    key: "inst-a",
    tag: "INSTITUTION (CLEAN INTAKE)",
    title: "Vidyapeeth Inst of Tech & Science (VITS)",
    desc: "3,200 students · 100% compliant · Live upload, intake ledger, & auto-issued credentials",
    icon: Building2,
    action: () => login("inst-a", "demo"),
  },
  {
    key: "inst-b",
    tag: "INSTITUTION (EXCESS SEATS)",
    title: "Apex Global Inst of Engineering & Tech",
    desc: "42 rejected rows · Seat ceiling breached · Multilingual AI fix checklist in 13 languages",
    icon: Building2,
    action: () => login("inst-b", "demo"),
  },
  {
    key: "aicte",
    tag: "CENTRAL REGULATOR",
    title: "AICTE National Monitoring Cell",
    desc: "Central radar · Blind HMAC duplicate detection · Inspection queues & cross-state collisions",
    icon: Landmark,
    action: () => login("aicte", "demo"),
  },
  {
    key: "univ",
    tag: "UNIVERSITY REGISTRAR",
    title: "Bharathiar National Technological Univ (BNTU)",
    desc: "32 affiliated colleges · Issue W3C digital degrees & Ed25519 cryptographic signatures",
    icon: GraduationCap,
    action: () => login("univ", "demo"),
  },
  {
    key: "employer",
    tag: "EMPLOYER / VERIFIER",
    title: "Tata Consultancy & Skills Verification (TCS V-Desk)",
    desc: "Sub-12ms offline degree verification via QR code & privacy consent handshake",
    icon: BadgeCheck,
    action: () => login("employer", "demo"),
  },
  {
    key: "student",
    tag: "STUDENT IDENTITY & WALLET",
    title: "Aarav Sharma (APAAR: ...1724)",
    desc: "W3C VC 2.0 credential wallet · Privacy consent inbox · Redressal & immutable access log",
    icon: UserRound,
    action: () => studentLogin("328865551724", "2006-11-05"),
  },
];

const PIPELINE_STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Institutions Upload",
    short: "Batch Ingestion & ERP Sync",
    desc: "Colleges submit student rosters via automated ERP webhook or registrar CSV. The parser validates row schemas in sub-second time.",
    preview: {
      badge: "STREAMING INGESTION",
      title: "FastAPI Batch Processor",
      metric: "50,000 rows/sec",
      detail: "Row checksums calculated & hashed in-memory before database persistence.",
    },
  },
  {
    icon: BadgeCheck,
    step: "02",
    title: "Every Row Validated",
    short: "Deterministic Algorithmic Engine",
    desc: "Every record is evaluated against statutory rules: 12-digit numeric APAAR checksums, Verhoeff integrity, and approved intake ceilings.",
    preview: {
      badge: "CHECKSUM VALIDATION",
      title: "Verhoeff & Intake Ledger",
      metric: "12ms Execution",
      detail: "Intake ceilings enforced; excess admissions flagged immediately for review.",
    },
  },
  {
    icon: Network,
    step: "03",
    title: "AICTE Monitors",
    short: "Privacy-Preserving Overlap Radar",
    desc: "Vidyadwaar computes salted HMAC digests to discover concurrent dual enrolments across states without exposing raw student PII.",
    preview: {
      badge: "BLIND MATCHING",
      title: "HMAC-SHA256 Token Intersection",
      metric: "0 PII Leaked",
      detail: "DPDP Act 2023 compliant. Keyed pseudonymization prevents raw registry leaks.",
    },
  },
  {
    icon: FileCheck2,
    step: "04",
    title: "Credentials with Consent",
    short: "W3C VC 2.0 & Bitstring Status List",
    desc: "Graduating students receive tamper-evident degrees signed with Ed25519, verifiable offline anywhere in under twelve milliseconds.",
    preview: {
      badge: "W3C DIGITAL DEGREE",
      title: "Base45 QR & Ed25519 Signatures",
      metric: "9.4ms Verified",
      detail: "Bitstring Status List index tracks dynamic revocations without central server dependencies.",
    },
  },
];

export default function Landing({
  section,
  demo = false,
  onLogin,
}: {
  section?: string | null;
  demo?: boolean;
  onLogin?: (s: Session) => void;
}) {
  const [stats, setStats] = useState<S["PublicStats"] | null>(null);
  const [failed, setFailed] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<S["PublicStats"]>("/v1/public/stats").then(setStats).catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, [section]);

  const currentStep = PIPELINE_STEPS[activeStep];
  const StepIcon = currentStep.icon;

  async function handleJoin(item: (typeof ONE_CLICK_ROLES)[number]) {
    setBusyKey(item.key);
    setError(null);
    try {
      const s = await item.action();
      if (onLogin) {
        onLogin(s);
      } else {
        window.location.hash = HOME_MAP[s.role] || "/";
        window.location.reload();
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.text : "Could not sign in automatically. Please visit Sign In.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-24">
      <div>
        <HeroSection stats={stats} failed={failed} demo={demo} />
        <MetricsDock stats={stats} />
      </div>

      <RoleCards />

      {/* Interactive "How It Works" Architecture Showcase */}
      <section id="how" aria-labelledby="how-heading" className="scroll-mt-28 space-y-8 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
              INTEGRITY ENGINE PIPELINE
            </span>
            <h2 id="how-heading" className="mt-1 font-inter text-[30px] sm:text-[34px] font-extrabold tracking-[-0.02em] text-white">
              How Vidyadwaar <span className={GOLD_TEXT}>guarantees truth</span>
            </h2>
          </div>

          <a
            href="#/how-it-works"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-5 py-2.5 text-xs sm:text-sm font-bold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all"
          >
            <span>Launch 7-Scene Cinematic Tour</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* 4-Step Interactive Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PIPELINE_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                onMouseMove={spotlight}
                className={`text-left rounded-2xl p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-b from-[#1c1810] to-[#12100a] border-2 border-amber-400 shadow-[0_0_25px_rgba(245,192,103,0.25)] scale-[1.02]"
                    : "glass-premium border border-white/10 hover:border-amber-400/40 hover:bg-slate-900/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-mono text-xs font-extrabold text-amber-400">
                      STEP {s.step}
                    </span>
                    <Icon className="h-5 w-5 text-amber-300" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">{s.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-snug">{s.short}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isSelected ? "text-amber-300" : "text-slate-500"}`}>
                    {isSelected ? "● Live Demo Active" : "Click to Test"}
                  </span>
                  <span className="text-amber-400/80 font-mono text-[10px]">STAGE #{idx + 1}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Step Live Preview Console */}
        <div className="glass-premium rounded-3xl border-2 border-amber-400/40 bg-gradient-to-r from-[#17130b] via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div aria-hidden className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Step Explanation */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-black shadow-md shadow-amber-500/30">
                  <StepIcon className="h-6 w-6" />
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    STAGE {currentStep.step} OF 04
                  </span>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    {currentStep.title} — {currentStep.short}
                  </h3>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-300 max-w-xl">
                {currentStep.desc}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#/how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-5 py-2.5 text-xs sm:text-sm font-bold text-black shadow-md hover:brightness-110 transition-all"
                >
                  <Sparkles className="h-4 w-4" /> Experience in Walkthrough
                </a>
                <span className="text-xs text-slate-400">
                  Sub-millisecond verification with complete cryptographic auditability.
                </span>
              </div>
            </div>

            {/* Right: Live Engine Simulation Snippet */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-black/70 p-5 shadow-inner backdrop-blur-md space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white tracking-tight">{currentStep.preview.title}</h4>
                </div>
                <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {currentStep.preview.badge}
                </span>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Throughput / Latency:</span>
                  <span className="font-mono font-bold text-amber-300">{currentStep.preview.metric}</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {currentStep.preview.detail}
                </p>
              </div>

              <div className="rounded-xl bg-amber-400/10 border border-amber-400/20 p-2.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Deterministic Pass
                </span>
                <span className="font-mono text-slate-400 text-[10px]">SIH 2026 PS 26263</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cinematic Walkthrough Callout Banner */}
        <div className="rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-r from-[#1c1407]/90 via-slate-900/90 to-slate-950 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 text-xs font-bold text-[#FDE047]">
              <Sparkles className="h-3.5 w-3.5" /> Full-Screen Interactive Experience
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              See the 7-Part Interactive Vidyadwaar Story
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Step through our cinematic theatre walkthrough: explore cross-state duplicate collisions, test blind HMAC matching, resolve OCR evidence grievances, and verify Base45 QR credentials.
            </p>
          </div>
          <a
            href="#/how-it-works"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-6 py-3.5 font-bold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all text-sm"
          >
            Launch Interactive Story <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* One-Click Join In / Get Started Section */}
      <section id="get-started" aria-labelledby="get-started-heading" className="scroll-mt-28 space-y-8 pt-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>ONE-CLICK LIVE DEMO · ZERO SETUP REQUIRED</span>
            </div>
            <h2 id="get-started-heading" className="font-inter text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-white">
              Get Started with <span className={GOLD_TEXT}>One-Click Sign In</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              No manual registration, passwords, or credentials needed. Click any portal below to instantly enter an active authenticated session with live student ledgers and cryptographic tools.
            </p>
          </div>
          <a
            href="#/signin"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-4 py-3 text-xs font-bold text-slate-200 hover:border-amber-400/60 hover:text-white hover:bg-white/10 transition-all shadow-sm"
          >
            <span>Or Custom Passkey Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Evaluator Demo CSV Downloads Banner */}
        <div className="glass-premium rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-400/[0.08] via-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Evaluator Demo CSV Datasets (Ready to Download & Test)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Pre-built synthetic datasets to test batch validation, duplicate collision detection, and AICTE seat cap enforcement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/demo-data/apaar-upload-template.csv"
              download="apaar-upload-template.csv"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-400/20 transition-all shadow-sm"
              title="Official AICTE Header Format"
            >
              <FileDown className="h-3.5 w-3.5 text-amber-400" /> APAAR Template (.csv)
            </a>

            <a
              href="/demo-data/sample-a1-valid-enrolments.csv"
              download="sample-a1-valid-enrolments.csv"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-sm"
              title="104 Verified Student Records"
            >
              <FileDown className="h-3.5 w-3.5 text-emerald-400" /> Sample A1 (Clean Batch)
            </a>

            <a
              href="/demo-data/sample-b1-multiprogramme.csv"
              download="sample-b1-multiprogramme.csv"
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-all shadow-sm"
              title="200 Multi-Branch Students"
            >
              <FileDown className="h-3.5 w-3.5 text-sky-400" /> Sample B1 (Multi-Prog)
            </a>

            <a
              href="/demo-data/sample-b2-quota-violation.csv"
              download="sample-b2-quota-violation.csv"
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all shadow-sm"
              title="AICTE Seat Cap Excess Scenario"
            >
              <FileDown className="h-3.5 w-3.5 text-rose-400" /> Sample B2 (AICTE Violation)
            </a>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* 6 One-Click Join Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ONE_CLICK_ROLES.map((role) => {
            const Icon = role.icon;
            const isBusy = busyKey === role.key;
            return (
              <div
                key={role.key}
                onMouseMove={spotlight}
                onClick={() => !busyKey && handleJoin(role)}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1.5 hover:border-amber-400/60 hover:bg-[#1a160f]/80 hover:shadow-[0_0_35px_rgba(245,192,103,0.22)] cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-amber-300 border border-amber-400/20">
                      {role.tag}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Ready
                    </span>
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-inter text-base font-bold text-white group-hover:text-amber-200 transition-colors leading-snug">
                        {role.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed font-normal">
                        {role.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(role);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] to-[#D4AF37] py-3 px-4 text-xs sm:text-[13px] font-black text-black shadow-lg shadow-amber-500/25 group-hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Zap className="h-4 w-4 fill-black text-black shrink-0" />
                    <span>{isBusy ? "Signing into Portal…" : "One-Click Sign In →"}</span>
                  </button>
                  <span className="mt-2 block text-center text-[10px] font-mono text-slate-500">
                    Instant sandbox authentication · No password
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

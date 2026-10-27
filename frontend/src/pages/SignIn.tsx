import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, Sparkles, Building2, Landmark, GraduationCap, BadgeCheck, UserRound } from "lucide-react";
import { ApiError, getJson, login, studentLogin, type S, type Session } from "../api/client";
import AccountSearch, { type Account } from "../components/AccountSearch";
import PasswordField from "../components/PasswordField";
import { StudentSignIn } from "./StudentSignIn";
import { BrandLogo } from "../components/BrandMark";

const ROLES = [
  { key: "institution", label: "Institution", icon: Building2 },
  { key: "university", label: "University", icon: GraduationCap },
  { key: "aicte", label: "AICTE", icon: Landmark },
  { key: "verifier", label: "Verifier", icon: BadgeCheck },
  { key: "student", label: "Student", icon: UserRound },
] as const;
type RoleKey = (typeof ROLES)[number]["key"];

const INTRO: Record<RoleKey, string> = {
  institution: "Colleges and polytechnics sign in to report student rosters, sync ERP webhooks, and audit seat intake compliance.",
  university: "Affiliating university registrars sign in to review college admissions and award W3C 2.0 degree credentials.",
  aicte: "Central regulatory officers sign in to inspect cross-state duplicate overlap radar and enforce admission ceilings.",
  verifier: "Employers and embassies verify student credentials deterministically in sub-12 milliseconds.",
  student: "Students and guardians sign in to manage verifiable degree credentials, inspect audit trails, and grant privacy consent.",
};

const ONE_CLICK_DEMOS: {
  role: RoleKey;
  tag: string;
  title: string;
  desc: string;
  icon: typeof Building2;
  action: () => Promise<Session>;
}[] = [
  {
    role: "institution",
    tag: "INSTITUTION (CLEAN)",
    title: "Kalyani Devi Hegde Inst of Tech",
    desc: "3,200 students · 100% compliant · Live upload & intake ledger",
    icon: Building2,
    action: () => login("inst-a", "demo"),
  },
  {
    role: "institution",
    tag: "INSTITUTION (EXCESS SEATS)",
    title: "Anandrao Kulkarni Engineering College",
    desc: "42 rejected rows · Seat ceiling breached · Multilingual AI fix",
    icon: Building2,
    action: () => login("inst-b", "demo"),
  },
  {
    role: "aicte",
    tag: "REGULATOR",
    title: "AICTE National Monitoring Cell",
    desc: "Central radar · Blind HMAC duplicate detection · Inspection queues",
    icon: Landmark,
    action: () => login("aicte", "demo"),
  },
  {
    role: "university",
    tag: "UNIVERSITY REGISTRAR",
    title: "Narmada Valley Technological Univ",
    desc: "32 affiliated colleges · Issue W3C digital degrees & Ed25519 signatures",
    icon: GraduationCap,
    action: () => login("univ", "demo"),
  },
  {
    role: "verifier",
    tag: "EMPLOYER / VERIFIER",
    title: "Kaveri Talent Solutions Pvt Ltd",
    desc: "Sub-12ms offline degree verification via QR & consent handshake",
    icon: BadgeCheck,
    action: () => login("employer", "demo"),
  },
  {
    role: "student",
    tag: "STUDENT WALLET",
    title: "Asha Joshi (APAAR: ...1724)",
    desc: "W3C VC 2.0 credential wallet · Privacy consent inbox · Access logs",
    icon: UserRound,
    action: () => studentLogin("328865551724", "2006-11-05"),
  },
];

const input = "w-full rounded-2xl border border-white/[0.09] bg-black/40 px-4 py-3.5 text-[14.5px] text-white placeholder:text-[#6b7280] focus:border-[#d4af37]/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 transition-all";
const lbl = "mb-1.5 block px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a3a9b3]";

export default function SignIn({ onLogin, demo = true, initialRole }: { onLogin: (s: Session) => void; demo: boolean; initialRole: string | null }) {
  const [role, setRole] = useState<RoleKey>(() => (ROLES.some((r) => r.key === initialRole) ? initialRole as RoleKey : "institution"));
  const [states, setStates] = useState<string[]>([]);
  const [state, setState] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<S["PublicStats"]>("/v1/public/stats").then((s) => setStates(s.states.filter((x) => x.reporting > 0).map((x) => x.state))).catch(() => {});
  }, []);
  useEffect(() => { setAccount(null); setUserId(""); setError(null); }, [role]);

  async function quickLogin(item: typeof ONE_CLICK_DEMOS[number]) {
    setDemoBusy(item.title);
    setError(null);
    try {
      const sess = await item.action();
      onLogin(sess);
    } catch (err) {
      setError(err instanceof ApiError ? err.text : "Failed to sign into demo account. Please try again.");
    } finally {
      setDemoBusy(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = role === "institution" || role === "university" ? account?.login_id : userId.trim();
    if (!id) { setError(role === "institution" || role === "university" ? "Choose your institution from the list." : "Enter your account ID."); return; }
    setBusy(true);
    setError(null);
    try {
      onLogin(await login(id, password));
    } catch (err) {
      setError(err instanceof ApiError
        ? err.status === 401 ? "That account and password don't match. New account? Activate it first with your AICTE code."
          : err.status === 429 ? "Too many attempts. Wait a few minutes and try again." : err.text
        : "The service is unreachable. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  // Filter one-click demo accounts matching the selected role (or show matching plus all)
  const roleDemos = ONE_CLICK_DEMOS.filter((d) => d.role === role);

  return (
    <div className="mx-auto max-w-[1240px] py-6 lg:py-10 space-y-10">
      {/* 1. Quick One-Click Demo Access Showcase (Top Banner) */}
      <section className="glass-premium rounded-3xl border border-amber-400/35 bg-gradient-to-r from-[#17130c]/90 via-[#0d1017]/95 to-[#07090e] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Sparkles className="h-3.5 w-3.5" /> Instant Demo Evaluation
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              One-Click Evaluator Sign-In
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Select any role to test full platform capabilities immediately without entering passwords:
            </p>
          </div>

          <span className="hidden sm:inline-flex items-center gap-2 font-mono text-xs text-amber-300 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SIH 2026 PS 26263 MOCK WORLD ACTIVE</span>
          </span>
        </div>

        {/* 6 One-Click Role Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ONE_CLICK_DEMOS.map((d) => {
            const Icon = d.icon;
            const isSelectedRole = d.role === role;
            const isThisBusy = demoBusy === d.title;

            return (
              <button
                key={d.title}
                type="button"
                onClick={() => quickLogin(d)}
                disabled={demoBusy !== null || busy}
                className={`text-left rounded-2xl p-4 transition-all relative overflow-hidden flex flex-col justify-between group ${
                  isSelectedRole
                    ? "bg-gradient-to-b from-[#1f1a10] to-[#12100b] border-2 border-amber-400/60 shadow-[0_0_20px_rgba(245,192,103,0.2)] scale-[1.01]"
                    : "bg-black/50 border border-white/10 hover:border-amber-400/40 hover:bg-slate-900/80"
                } disabled:opacity-60`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                    <span className="font-mono text-[10px] font-bold tracking-wider text-amber-400">
                      {d.tag}
                    </span>
                    <Icon className="h-4 w-4 text-amber-300" />
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                    {d.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-snug">
                    {d.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
                  <span className="text-amber-300 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {isThisBusy ? "Signing in…" : "One-Click Enter →"}
                  </span>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Instant Session</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Manual / Standard Credentials Login Card */}
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_520px]">
        {/* Left Column: Context & Help */}
        <section className="rise lg:pt-4 space-y-5">
          <div className="inline-flex items-center gap-2">
            <BrandLogo size="sm" />
          </div>

          <h2 className="font-inter text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sign in with official credentials
          </h2>

          <p className="text-base text-slate-300 leading-relaxed max-w-lg">
            {INTRO[role]}
          </p>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 max-w-lg text-sm text-slate-300">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-amber-300">
              Registration &amp; Activation
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                • New institution, university or verifier account?{" "}
                <a href="#/activate" className="font-semibold text-amber-300 underline underline-offset-2 hover:text-white">
                  Activate it with your AICTE code
                </a>.
              </li>
              <li>
                • Organisation that needs to verify credentials?{" "}
                <a href="#/request-access" className="font-semibold text-amber-300 underline underline-offset-2 hover:text-white">
                  Request verifier access
                </a>.
              </li>
              <li>
                • Forgot your password? AICTE zonal monitoring cells issue replacement activation codes.
              </li>
            </ul>
          </div>
        </section>

        {/* Right Column: Tabbed Role Login Form */}
        <div
          className="rise relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1017]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
          style={{ ["--d" as string]: "120ms" }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

          {/* Role selector tabs */}
          <div role="tablist" aria-label="Sign in as" className="grid grid-cols-5 gap-1 rounded-2xl border border-white/[0.08] bg-black/40 p-1">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={role === r.key}
                onClick={() => setRole(r.key)}
                className={`relative rounded-xl px-1 py-2.5 font-inter text-xs font-semibold transition-colors ${
                  role === r.key ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {role === r.key && (
                  <motion.span
                    layoutId="signin-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.14] to-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] border border-amber-400/40"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{r.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6" role="tabpanel">
            {/* Quick action button for the active tab */}
            {roleDemos.length > 0 && (
              <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-300 block">Fast Track</span>
                  <span className="text-xs font-semibold text-white block truncate max-w-[240px] sm:max-w-xs">{roleDemos[0].title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => quickLogin(roleDemos[0])}
                  disabled={demoBusy !== null || busy}
                  className="rounded-xl bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-3.5 py-1.5 text-xs font-bold text-black shadow-md hover:brightness-110 shrink-0"
                >
                  {demoBusy === roleDemos[0].title ? "Entering…" : "Instant Sign-In →"}
                </button>
              </div>
            )}

            {role === "student" ? (
              <StudentSignIn onLogin={onLogin} demo={demo} />
            ) : (
              <form onSubmit={submit} className="space-y-4" noValidate>
                {role === "institution" && (
                  <div>
                    <label htmlFor="state-filter" className={lbl}>State</label>
                    <select
                      id="state-filter"
                      value={state}
                      onChange={(e) => { setState(e.target.value); setAccount(null); }}
                      className={`${input} appearance-none`}
                    >
                      <option value="">All states</option>
                      {states.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {(role === "institution" || role === "university") ? (
                  <AccountSearch
                    key={role}
                    kind={role}
                    state={state || undefined}
                    selected={account}
                    onSelect={setAccount}
                    label={role === "institution" ? "Institution" : "University"}
                    placeholder={role === "institution" ? "Name, AICTE id or city" : "University name"}
                  />
                ) : (
                  <div>
                    <label htmlFor="user-id" className={lbl}>
                      {role === "aicte" ? "Official account ID" : "Organisation account ID"}
                    </label>
                    <input
                      id="user-id"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      autoComplete="username"
                      spellCheck={false}
                      placeholder={role === "aicte" ? "Issued by AICTE" : "From your AICTE approval"}
                      className={`${input} font-mono`}
                    />
                  </div>
                )}

                {account && (
                  <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs text-slate-300">
                    Signing in to <span className="font-bold text-white">{account.name}</span>
                    {account.state ? `, ${account.state}` : ""}
                  </p>
                )}

                <PasswordField value={password} onChange={setPassword} disabled={busy} demo={demo} />

                {error && (
                  <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] text-black py-4 font-inter text-sm font-bold shadow-[0_0_25px_rgba(245,192,103,0.3)] hover:shadow-[0_0_35px_rgba(245,192,103,0.45)] hover:brightness-105 transition-all disabled:opacity-60"
                >
                  <span>{busy ? "Authenticating…" : "Sign in to Dashboard"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

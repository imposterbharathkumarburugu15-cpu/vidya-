import { useState } from "react";
import { ArrowRight, FileCheck, Landmark, ShieldCheck, Users, CheckCircle2, Sparkles } from "lucide-react";
import { GOLD_TEXT, spotlight } from "./styles";

interface RoleFeature {
  id: "institution" | "aicte" | "verifier" | "student";
  icon: typeof Landmark;
  title: string;
  badge: string;
  headline: string;
  body: string;
  href: string;
  accent: string;
  previewTitle: string;
  previewSnippet: {
    label1: string;
    val1: string;
    label2: string;
    val2: string;
    tag: string;
    status: string;
  };
}

const ROLES: RoleFeature[] = [
  {
    id: "institution",
    icon: Landmark,
    title: "For Institutions",
    badge: "COLLEGES & UNIVERSITIES",
    headline: "Automated Batch Ingestion & Intake Integrity",
    body: "Upload student rosters via CSV or API. The engine evaluates 12-digit APAAR checksums and prevents intake breaches before degree issuance.",
    href: "#/signin?as=institution",
    accent: "from-amber-500/20 via-amber-500/5 to-transparent",
    previewTitle: "Registrar Intake & Verification Console",
    previewSnippet: {
      label1: "Current Batch Intake",
      val1: "120 / 120 (AICTE Approved)",
      label2: "Algorithmic Check",
      val2: "12-digit APAAR Verhoeff OK",
      tag: "COMPLIANT_RECORD",
      status: "Seat Locked · Hash Appended",
    },
  },
  {
    id: "aicte",
    icon: ShieldCheck,
    title: "For Regulators",
    badge: "AICTE & STATE COUNCILS",
    headline: "National Oversight & Cross-State Conflict Detection",
    body: "Monitor seat integrity across ten thousand colleges. Detect concurrent dual admissions, evaluate excess quotas, and simulate policy revisions.",
    href: "#/signin?as=aicte",
    accent: "from-amber-400/20 via-amber-500/5 to-transparent",
    previewTitle: "National Academic Radar & Anomaly Monitor",
    previewSnippet: {
      label1: "Cross-State Collisions",
      val1: "0 Active Anomalies",
      label2: "Policy Replay Engine",
      val2: "Supernumerary Cap at 15%",
      tag: "ZERO_DUPLICATES",
      status: "100% Cohort Compliance",
    },
  },
  {
    id: "verifier",
    icon: FileCheck,
    title: "For Verifiers",
    badge: "EMPLOYERS & UNIVERSITIES",
    headline: "Sub-Second W3C Verifiable Credentials",
    body: "Verify academic degrees offline in milliseconds using Base45 QR codes. Check cryptographic signatures and real-time Bitstring revocation.",
    href: "#/request-access",
    accent: "from-amber-300/20 via-amber-500/5 to-transparent",
    previewTitle: "Cryptographic Credential Trust Inspector",
    previewSnippet: {
      label1: "Signature Algorithm",
      val1: "Ed25519 (eddsa-jcs-2022)",
      label2: "Verification Speed",
      val2: "9.4ms (Offline Compatible)",
      tag: "VALID_DEGREE",
      status: "Status List: #42 ACTIVE",
    },
  },
  {
    id: "student",
    icon: Users,
    title: "For Students",
    badge: "STUDENTS & GUARDIANS",
    headline: "Sovereign Academic Wallet & Dispute Rights",
    body: "Access your verifiable academic identity. Share tamper-proof digital degrees with employers and resolve seat hold disputes with OCR evidence.",
    href: "#/signin?as=student",
    accent: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    previewTitle: "Verified Student Mobile Wallet (Phase 7)",
    previewSnippet: {
      label1: "APAAR Identity Key",
      val1: "1000-0000-0042",
      label2: "Grievance Redressal",
      val2: "Relinquishment Verified",
      tag: "SOVEREIGN_WALLET",
      status: "W3C Credential Stored",
    },
  },
];

export default function RoleCards() {
  const [selectedRole, setSelectedRole] = useState<number>(0);
  const active = ROLES[selectedRole];
  const Icon = active.icon;

  return (
    <section id="roles" aria-labelledby="roles-heading" className="scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            STAKEHOLDER ARCHITECTURE
          </span>
          <h2 id="roles-heading" className="mt-1 font-inter text-[30px] sm:text-[34px] font-extrabold tracking-[-0.02em] text-white">
            One platform, <span className={GOLD_TEXT}>four interconnected roles</span>
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Explore how institutions, regulators, verifiers, and students interact with Vidyadwaar's integrity infrastructure.
        </p>
      </div>

      {/* 4 Selectable Role Tabs / Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROLES.map(({ icon: RoleIcon, title, badge, body }, i) => {
          const isSelected = selectedRole === i;
          return (
            <button
              key={title}
              type="button"
              onClick={() => setSelectedRole(i)}
              onMouseMove={spotlight}
              className={`text-left rounded-2xl p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-[#1c1810] to-[#12100a] border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,192,103,0.25)] scale-[1.02]"
                  : "glass-premium border border-white/10 hover:border-amber-400/40 hover:bg-slate-900/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/30"
                        : "bg-white/5 text-amber-300 border border-white/10"
                    }`}
                  >
                    <RoleIcon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-300/80 uppercase tracking-wider">
                    {badge.split("&")[0].trim()}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-white">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-300 line-clamp-2">{body}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className={`font-semibold ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                  {isSelected ? "● Interactive View Active" : "Click to Explore"}
                </span>
                <span className={`grid h-6 w-6 place-items-center rounded-full transition-transform ${
                  isSelected ? "bg-amber-400 text-black rotate-90" : "text-slate-500"
                }`}>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Role Live Sandbox Preview Card */}
      <div className="glass-premium rounded-3xl border-2 border-amber-400/40 bg-gradient-to-r from-[#17130b] via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div aria-hidden className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Role Details & CTA */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-black shadow-md shadow-amber-500/30">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  {active.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {active.headline}
                </h3>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-300 max-w-xl">
              {active.body}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={active.href}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-6 py-3 font-bold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all text-xs sm:text-sm"
              >
                Access {active.title} Portal <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#/how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> View in 7-Scene Tour
              </a>
            </div>
          </div>

          {/* Right Column: Live Simulated UI Snippet */}
          <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-black/60 p-5 shadow-inner backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white tracking-tight">{active.previewTitle}</h4>
              </div>
              <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                LIVE DEMO
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">{active.previewSnippet.label1}</span>
                <span className="font-mono text-xs font-bold text-amber-300 mt-0.5 block truncate">
                  {active.previewSnippet.val1}
                </span>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">{active.previewSnippet.label2}</span>
                <span className="font-mono text-xs font-bold text-white mt-0.5 block truncate">
                  {active.previewSnippet.val2}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-amber-400/10 border border-amber-400/20 p-2.5 flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-amber-300 text-[11px]">
                {active.previewSnippet.tag}
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> {active.previewSnippet.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 pt-1">
        New educational institution, university or verifier account?{" "}
        <a href="#/activate" className="font-bold text-amber-300 underline decoration-amber-400/40 underline-offset-2 hover:text-white">
          Activate it directly with your official AICTE code
        </a>.
      </p>
    </section>
  );
}

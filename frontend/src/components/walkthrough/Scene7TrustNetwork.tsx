import { motion } from "framer-motion";
import { ShieldCheck, Award, ArrowRight, Smartphone, Building2, RefreshCw, CheckCircle2 } from "lucide-react";
import { BrandFullLogo } from "../BrandMark";
import { go } from "../../ui";

export default function Scene7TrustNetwork({
  isReducedMotion,
  onReplay,
}: {
  isReducedMotion: boolean;
  onReplay: () => void;
}) {
  const pillars = [
    {
      title: "Students & Mobile App",
      icon: Smartphone,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "Complete ownership of academic identity, instant dispute filing, and offline W3C credential wallet.",
      metric: "Phase 7 Complete",
    },
    {
      title: "Institutions & Universities",
      icon: Building2,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "Real-time intake monitoring, batch verification, and automated OCR evidence workflows.",
      metric: "Phase 2 & 6 Active",
    },
    {
      title: "National Regulators (AICTE)",
      icon: ShieldCheck,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      desc: "Retrospective policy replay, cross-state duplicate visibility, and automated seat-impact forecasting.",
      metric: "Phase 3, 4 & 5",
    },
    {
      title: "Employers & Global Verifiers",
      icon: Award,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      desc: "Sub-second offline verification via Base45 QR codes and dynamic Bitstring Status Lists.",
      metric: "Phase 8 Verified",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Headline */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          The Unified Academic Integrity Ecosystem
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          The National Academic Trust Network.<br />
          <span className="text-emerald-700">Connecting students, universities, and regulators with mathematical trust.</span>
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Vidyadwaar eliminates academic fraud, protects deserving waitlisted candidates, and empowers students with sovereign, verifiable academic credentials across their lifelong learning journey.
        </p>
      </div>

      {/* 4 Pillars of the Trust Network */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: isReducedMotion ? 0 : 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl border ${p.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">{p.metric}</span>
                </div>
                <h4 className="mt-3 text-sm font-bold text-slate-900">{p.title}</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Fully Operational</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grand Finale Card: Official Approved Branding Lockup */}
      <div className="rounded-3xl border-2 border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div aria-hidden className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          {/* Approved Official Banner Logo */}
          <div className="w-full max-w-md py-2">
            <BrandFullLogo className="h-16 sm:h-20 mx-auto drop-shadow-[0_10px_25px_rgba(212,175,55,0.4)]" />
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Every seat accounted for. Every duplicate detected before degree issuance. Every credential verifiable anywhere in the world in under twelve milliseconds.
          </p>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => go("/signin")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-6 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all"
            >
              Access Live Platform <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => go("/verify")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-md hover:bg-white/10 transition-all"
            >
              Open Credential Verifier
            </button>

            <button
              type="button"
              onClick={onReplay}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Replay Walkthrough
            </button>
          </div>

          <div className="pt-4 text-[11px] text-slate-500 border-t border-white/10 w-full flex items-center justify-between">
            <span>SIH 2026 | PS 26263</span>
            <span>Vidyadwaar Academic Identity &amp; Integrity Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}

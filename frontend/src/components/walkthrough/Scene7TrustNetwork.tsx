import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Award, ArrowRight, Smartphone, Building2, RefreshCw, CheckCircle2 } from "lucide-react";
import { BrandFullLogo } from "../BrandMark";
import { go } from "../../ui";
import { audioController } from "./sound";

export default function Scene7TrustNetwork({
  isReducedMotion,
  onReplay,
}: {
  isReducedMotion: boolean;
  onReplay: () => void;
}) {
  const [activePillar, setActivePillar] = useState<number>(0);

  const pillars = [
    {
      title: "Students & Sovereign Wallet",
      icon: Smartphone,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      desc: "Complete ownership of academic identity, instant dispute filing, and offline W3C credential wallet.",
      badge: "Student App (Phase 7)",
    },
    {
      title: "Institutions & Universities",
      icon: Building2,
      color: "bg-slate-100 text-slate-800 border-slate-200",
      desc: "Real-time intake monitoring, batch verification, and automated OCR evidence workflows.",
      badge: "University Portal (Phase 2 & 6)",
    },
    {
      title: "National Regulators (AICTE)",
      icon: ShieldCheck,
      color: "bg-amber-50 text-amber-900 border-amber-300",
      desc: "Retrospective policy replay, cross-state duplicate visibility, and automated seat forecasting.",
      badge: "Oversight Engine (Phase 3 & 4)",
    },
    {
      title: "Employers & Global Verifiers",
      icon: Award,
      color: "bg-emerald-50 text-emerald-900 border-emerald-300",
      desc: "Sub-second offline verification via Base45 QR codes and dynamic Bitstring Status Lists.",
      badge: "Verifier Network (Phase 8)",
    },
  ];

  const handleSelectPillar = (i: number) => {
    audioController.playClick();
    setActivePillar(i);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 space-y-3.5">
      {/* 4 Pillars Interactive Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          const isSelected = activePillar === i;
          return (
            <motion.button
              key={p.title}
              type="button"
              onClick={() => handleSelectPillar(i)}
              initial={{ opacity: 0, y: isReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={`text-left rounded-2xl border p-3 shadow-sm transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-amber-400 ring-2 ring-amber-400/20 shadow-md"
                  : "bg-white/80 border-slate-200/90 hover:bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className={`grid h-8 w-8 place-items-center rounded-xl border ${p.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-500">{p.badge}</span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-900">{p.title}</h4>
                <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">{p.desc}</p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                <span>Fully Operational</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Grand Finale Card: Official Approved Branding Lockup */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#121316] via-[#181A20] to-[#07090E] p-4 sm:p-5 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
        {/* Subtle decorative glow */}
        <div aria-hidden className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-3 my-auto">
          {/* Approved Official Banner Logo */}
          <div className="w-full max-w-sm py-1">
            <BrandFullLogo className="h-12 sm:h-14 mx-auto drop-shadow-[0_8px_20px_rgba(212,175,55,0.35)]" />
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every seat accounted for. Every duplicate detected before degree issuance. Every credential verifiable anywhere in the world in under twelve milliseconds.
          </p>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                audioController.playClick();
                go("/signin");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all"
            >
              Access Live Platform <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                audioController.playClick();
                go("/verify");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/10 transition-all"
            >
              Verify Credential
            </button>

            <button
              type="button"
              onClick={() => {
                audioController.playClick();
                onReplay();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Replay Story
            </button>
          </div>
        </div>

        <div className="relative z-10 pt-2 text-[10px] text-slate-500 border-t border-white/10 w-full flex items-center justify-between">
          <span>Smart India Hackathon 2026 · PS 26263</span>
          <span className="font-semibold text-slate-400">Vidyadwaar Academic Identity &amp; Integrity Platform</span>
        </div>
      </div>
    </div>
  );
}

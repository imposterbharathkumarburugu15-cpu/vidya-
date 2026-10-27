import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, FileCheck2, Network, Sparkles, Upload } from "lucide-react";
import { getJson, type S } from "../api/client";
import HeroSection from "../components/landing/HeroSection";
import MetricsDock from "../components/landing/MetricsDock";
import RoleCards from "../components/landing/RoleCards";
import { GOLD_TEXT, spotlight } from "../components/landing/styles";

const STEPS = [
  [Upload, "Institutions upload", "Student-level records keyed by APAAR ID, through the portal or their ERP."],
  [BadgeCheck, "Every row is validated", "APAAR registry match, duplicates, dates and seats against AICTE-approved intake."],
  [Network, "AICTE monitors", "Excess admissions, cross-institution duplicates and anomalies, ranked for inspection."],
  [FileCheck2, "Credentials, with consent", "W3C verifiable credentials that students share only when they approve."],
] as const;

export default function Landing({ section, demo = false }: { section?: string | null; demo?: boolean }) {
  const [stats, setStats] = useState<S["PublicStats"] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { getJson<S["PublicStats"]>("/v1/public/stats").then(setStats).catch(() => setFailed(true)); }, []);
  useEffect(() => {
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, [section]);

  return (
    <div className="space-y-20">
      <div>
        <HeroSection stats={stats} failed={failed} demo={demo} />
        <MetricsDock stats={stats} />
      </div>
      <RoleCards />
      <section id="how" aria-labelledby="how-heading" className="scroll-mt-28 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="how-heading" className="font-inter text-[28px] font-bold tracking-[-0.02em] text-white">How it <span className={GOLD_TEXT}>works</span></h2>
          <a
            href="#/how-it-works"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white transition-colors"
          >
            <span>Launch Cinematic Tour</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Interactive Experience Callout */}
        <div className="mt-5 rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-r from-[#1c1407]/80 via-slate-900/90 to-slate-950/95 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 text-xs font-bold text-[#FDE047]">
              <Sparkles className="h-3.5 w-3.5" /> Interactive 7-Scene Walkthrough
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Experience the Full Vidyadwaar Integrity Engine
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore how academic records are verified, privacy-preserving blind matching occurs, student disputes get resolved with OCR evidence, and W3C digital degrees are cryptographically issued.
            </p>
          </div>
          <a
            href="#/how-it-works"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-6 py-3.5 font-bold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all"
          >
            Launch Interactive Experience <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map(([Icon, title, body]) => (
            <li key={title} onMouseMove={spotlight} className="glass-premium lift relative rounded-2xl p-6">
              <Icon className="h-5 w-5 text-amber-400" strokeWidth={1.6} aria-hidden />
              <span className="mt-4 block text-[16px] font-semibold text-white">{title}</span>
              <span className="mt-1.5 block text-sm leading-relaxed text-slate-400">{body}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

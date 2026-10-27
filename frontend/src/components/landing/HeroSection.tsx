import { ArrowRight, ShieldCheck, Zap, Lock } from "lucide-react";
import type { S } from "../../api/client";
import IndiaMapLive from "./IndiaMapLive";
import { BTN_PRIMARY, BTN_SECONDARY, fmt } from "./styles";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function HeroSection({ stats, failed }: { stats: S["PublicStats"] | null; failed: boolean; demo?: boolean }) {
  const badges = stats ? [
    { lon: 77.21, lat: 28.61, title: `${fmt(stats.institutions_reporting)} Institutions Connected`, sub: "Reporting this academic year" },
    { lon: 72.88, lat: 19.08, title: `${stats.states_covered} States`, sub: "Unified Academic Network", side: "left" as const },
    { lon: 77.59, lat: 12.97, title: "Real-time", sub: "Verification & Monitoring" },
    { lon: 88.36, lat: 22.57, title: `${fmt(stats.students_recorded)} Students`, sub: "Keyed by APAAR ID" },
  ] : [];

  return (
    <section className="relative isolate -mx-6 -mt-6 overflow-hidden px-6 pb-16 pt-0 sm:-mx-10 sm:px-10 lg:pb-24 lg:pt-1">
      {/* Deep cinematic background lighting */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-[450px] w-[450px] rounded-full bg-amber-600/10 blur-[140px]" />
        <div className="absolute -top-10 inset-x-0 h-40 bg-gradient-to-b from-[#07090E] via-[#07090E]/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-[1400px] grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Left Column: Confident Academic Platform Narrative (58% / 7 cols) */}
        <div className="rise lg:col-span-7 space-y-6 pt-0 lg:pt-2">
          {/* Small Uppercase Gold Eyebrow */}
          <div>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-amber-300 shadow-[0_0_20px_rgba(245,192,103,0.18)]">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
              National Academic Truth Engine
            </span>
          </div>

          {/* Large Bold Two-Line Headline with Responsive Fluid Typography */}
          <h1 className="font-inter text-4xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-black tracking-[-0.035em] text-white leading-[1.06]">
            Verified Education <br className="hidden sm:inline" />
            <span className="gold-shimmer">for a Stronger, Fairer India.</span>
          </h1>

          {/* Supporting Paragraph with comfortable line-height */}
          <p className="max-w-xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Vidyadwaar provides AICTE student-level, APAAR-keyed records from every approved institution.
            Each row validated deterministically, every seat verified against statutory quotas, and credentials
            that students share only under their cryptographic consent.
          </p>

          {/* Action CTAs: Primary Gold CTA + Secondary Outlined CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => scrollTo("get-started")}
              className={`${BTN_PRIMARY} group !px-7 !py-4 !text-[15px] !font-bold shadow-[0_0_30px_rgba(245,192,103,0.35)] hover:shadow-[0_0_40px_rgba(245,192,103,0.5)]`}
            >
              <span>Get Started · One-Click Join In</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </button>

            <a
              href="#/how-it-works"
              className={`${BTN_SECONDARY} group !px-6 !py-4 !text-[15px] !font-semibold border-white/20 bg-white/[0.04] hover:bg-white/[0.08] hover:border-amber-400/40 text-white`}
            >
              <span>See How it Works</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
          </div>

          {/* Compact Trust Indicators */}
          <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>100% Deterministic Integrity</span>
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Sub-12ms Ingestion Auditing</span>
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-300" />
              <span>DPDP Act 2023 Compliant</span>
            </span>
          </div>
        </div>

        {/* Right Column: India Network Map Visualization (42% / 5 cols) */}
        <div className="rise lg:col-span-5 relative w-full" style={{ ["--d" as string]: "150ms" }}>
          <div className="relative mx-auto w-full max-w-[580px] lg:max-w-none">
            <IndiaMapLive states={stats?.states ?? []} badges={badges} />
            <figcaption className="mt-3 text-center text-xs text-slate-400">
              {stats
                ? `States shaded by verified enrolment data, ${stats.academic_year}. Click any state to inspect.`
                : failed
                ? "Live figures temporarily cached."
                : "Synchronizing national academic telemetry…"}
            </figcaption>
          </div>
        </div>
      </div>
    </section>
  );
}

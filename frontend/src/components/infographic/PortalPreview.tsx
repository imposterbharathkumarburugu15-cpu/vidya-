import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "../BrandMark";
import { go } from "../../ui";

export default function PortalPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden select-none"
    >
      {/* Top Application Navigation Bar Preview */}
      <div className="bg-[#181A20] text-white px-5 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="text-white/20">|</span>
          <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
            PORTAL CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE VERIFICATION ENGINE
          </span>
        </div>
      </div>

      {/* Main Dashboard Hero Band */}
      <div className="p-6 bg-slate-50 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Apex Institute of Technology · AICTE ID: 1-9283741
            </div>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">
              Academic Record & Enrolment Integrity
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Deterministic validation keyed by APAAR ID · Approved seat quota enforcement · Zero PII exposure
            </p>
          </div>

          <button
            type="button"
            onClick={() => go("/signin")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <span>Explore VidyaDwaar</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">STUDENTS ENROLLED</span>
            <div className="mt-1 font-mono text-xl font-bold text-slate-900">1,248</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 100% Intake Adherence
            </div>
          </div>

          <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">APAAR COVERAGE</span>
            <div className="mt-1 font-mono text-xl font-bold text-slate-900">98.4%</div>
            <div className="text-[10px] text-slate-500 font-mono">1,228 Verified Keys</div>
          </div>

          <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">COLLISION QUEUE</span>
            <div className="mt-1 font-mono text-xl font-bold text-amber-600">1 Case</div>
            <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" /> Resolved via Audit
            </div>
          </div>

          <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">TAMPER-EVIDENT LEDGER</span>
            <div className="mt-1 font-mono text-xl font-bold text-slate-900">Active</div>
            <div className="text-[10px] text-slate-500 font-mono">Ed25519 Signed</div>
          </div>
        </div>
      </div>

      {/* Interactive Case Row in Product UI */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent Resolved Enrolment Audit
          </h4>
          <span className="font-mono text-[10px] text-slate-400">AUDIT LOG #82910</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">STU-1042</span>
                <span className="text-xs font-semibold text-slate-700">Aarav Sharma</span>
                <span className="rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-1.5 py-0.5">
                  VERIFIED TRANSFER
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                B.Tech Information Tech · Regular Intake Approved · TC-8891 Attached
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go("/signin?as=inst-a")}
              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
            >
              Sign In as Registrar
            </button>
            <button
              type="button"
              onClick={() => go("/signin?as=aicte")}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              AICTE Oversight
            </button>
          </div>
        </div>

        {/* Call-to-action bottom launchpad */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Smart India Hackathon 2026 · Problem Statement SIH26263
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go("/")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Return Home
            </button>
            <button
              type="button"
              onClick={() => go("/signin")}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-black bg-[#F5C067] hover:bg-[#E5A93C] px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Live System</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

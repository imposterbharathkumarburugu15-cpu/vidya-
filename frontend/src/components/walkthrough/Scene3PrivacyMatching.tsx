import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, EyeOff, KeyRound, Check, AlertOctagon } from "lucide-react";

export default function Scene3PrivacyMatching({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [privacyMode, setPrivacyMode] = useState<"blind" | "raw">("blind");

  return (
    <div className="space-y-8">
      {/* Editorial Headline */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-800">
          <KeyRound className="h-3.5 w-3.5 text-purple-600" />
          DPDP Act 2023 Privacy Architecture
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Privacy-Preserving Blind Matching.<br />
          <span className="text-purple-700">Find duplicate enrolments without exposing student PII.</span>
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Independent universities must detect concurrent admissions across states, but cannot legally exchange raw student rosters. Vidyadwaar’s Phase 5 blind matching calculates salted cryptographic digests—discovering collisions with zero raw identifier leakage.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setPrivacyMode("blind")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            privacyMode === "blind"
              ? "bg-white text-purple-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-purple-600" />
          Vidyadwaar Blind Matching (Compliant)
        </button>
        <button
          type="button"
          onClick={() => setPrivacyMode("raw")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            privacyMode === "raw"
              ? "bg-white text-red-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <AlertOctagon className="h-4 w-4 text-red-600" />
          Traditional Raw Exchange (Non-Compliant)
        </button>
      </div>

      {/* Main Interactive Stage: Two Institutions & Blind Relay */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch"
      >
        {/* Institution A Vault */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PARTICIPANT A</span>
              <h4 className="text-sm font-bold text-slate-900">Delhi Institute of Tech</h4>
            </div>
            <Lock className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500">Internal Enrolment Record</span>
              <div className="mt-1 font-mono text-xs text-slate-900">
                {privacyMode === "blind" ? (
                  <span className="text-slate-500">Local Vault: Kept Strictly Offline</span>
                ) : (
                  <span className="text-red-600 font-semibold">LEAKED: Aarav Sharma (DOB: 15-05-2003)</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
                <span>Cryptographic Digest</span>
                <span className="font-mono text-[10px] text-purple-600">HMAC-SHA256</span>
              </div>
              <div className="mt-2 font-mono text-[11px] text-purple-800 break-all bg-white p-2 rounded border border-purple-200">
                {privacyMode === "blind"
                  ? "7f8b92c4a1e900d83b42f61..."
                  : "EXPOSED_PLAIN_APAAR_100000000042"}
              </div>
            </div>
          </div>
        </div>

        {/* Central Privacy Matching Hub */}
        <div className="lg:col-span-4 flex flex-col justify-center rounded-2xl border border-purple-300 bg-gradient-to-b from-purple-50/70 via-white to-purple-50/40 p-5 shadow-sm text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm">
            <EyeOff className="h-6 w-6" />
          </div>
          <h4 className="mt-3 text-sm font-bold text-slate-900">Vidyadwaar Blind Intersect</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {privacyMode === "blind"
              ? "Computes token equality over blinded digests. Zero student names or raw identifiers enter the relay."
              : "Raw identity lists exposed to central server. High risk of interception and DPDP non-compliance."}
          </p>

          <div className="mt-4 rounded-xl border border-purple-200 bg-white p-3 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-purple-950">
              <span>Token Collision Discovered</span>
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-800">MATCH #42</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-600 font-mono">
              Token: <span className="text-purple-700 font-semibold">7f8b92c4a1e900d8...</span>
            </div>
            <div className="mt-2 rounded bg-purple-50 p-2 text-[11px] text-purple-900 border border-purple-100">
              {privacyMode === "blind" ? (
                <>
                  <Check className="inline h-3.5 w-3.5 text-purple-600 mr-1" />
                  Bilateral notification dispatched to both registrars. Identity revealed only after case activation.
                </>
              ) : (
                <span className="text-red-700 font-semibold">
                  Privacy violated: All student identity details visible to unauthorized database admins.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Institution B Vault */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PARTICIPANT B</span>
              <h4 className="text-sm font-bold text-slate-900">Pune Engineering Academy</h4>
            </div>
            <Lock className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500">Internal Enrolment Record</span>
              <div className="mt-1 font-mono text-xs text-slate-900">
                {privacyMode === "blind" ? (
                  <span className="text-slate-500">Local Vault: Kept Strictly Offline</span>
                ) : (
                  <span className="text-red-600 font-semibold">LEAKED: Aarav Sharma (DOB: 15-05-2003)</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
                <span>Cryptographic Digest</span>
                <span className="font-mono text-[10px] text-purple-600">HMAC-SHA256</span>
              </div>
              <div className="mt-2 font-mono text-[11px] text-purple-800 break-all bg-white p-2 rounded border border-purple-200">
                {privacyMode === "blind"
                  ? "7f8b92c4a1e900d83b42f61..."
                  : "EXPOSED_PLAIN_APAAR_100000000042"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

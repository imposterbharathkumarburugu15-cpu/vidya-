import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, EyeOff, KeyRound, Check, AlertOctagon, Info } from "lucide-react";

export default function Scene3PrivacyMatching({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [privacyMode, setPrivacyMode] = useState<"blind" | "raw">("blind");

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 space-y-4">
      {/* Context Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
            DPDP ACT 2023 PRIVACY PROTOCOL
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            HMAC-SHA256 Blind Indexing · Institutional Key Partitioning
          </span>
        </div>

        {/* Interactive Mode Switcher */}
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setPrivacyMode("blind")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              privacyMode === "blind"
                ? "bg-slate-900 text-amber-400 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            Vidyadwaar Blind Matching (Compliant)
          </button>
          <button
            type="button"
            onClick={() => setPrivacyMode("raw")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              privacyMode === "raw"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5 text-white" />
            Raw PII Exchange (Non-Compliant)
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Two Institutions & Blind Relay */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch flex-1"
      >
        {/* Institution A Vault */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PARTICIPANT A</span>
                <h4 className="text-xs font-bold text-slate-900">Delhi Institute of Tech</h4>
              </div>
              <Lock className="h-4 w-4 text-slate-400" />
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Internal Enrolment Record</span>
                <div className="mt-1 font-mono text-xs">
                  {privacyMode === "blind" ? (
                    <span className="text-slate-600 font-medium">Local Vault: Kept Strictly Offline</span>
                  ) : (
                    <span className="text-red-600 font-bold">LEAKED: Aarav Sharma (DOB: 15-05-2003)</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>Cryptographic Digest</span>
                  <span className="font-mono text-[10px] text-emerald-700">HMAC-SHA256</span>
                </div>
                <div className="mt-1.5 font-mono text-[11px] text-emerald-900 break-all bg-white p-2 rounded border border-emerald-200">
                  {privacyMode === "blind"
                    ? "7f8b92c4a1e900d83b42f61..."
                    : "EXPOSED_PLAIN_APAAR_100000000042"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-400">
            Salted with Institutional Key K_A
          </div>
        </div>

        {/* Central Privacy Matching Hub */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border-2 border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-md text-white text-center">
          <div>
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
              <EyeOff className="h-5 w-5" />
            </div>
            <h4 className="mt-2 text-xs font-bold text-white">Vidyadwaar Blind Intersect</h4>
            <p className="mt-1 text-[11px] text-slate-300 leading-snug">
              {privacyMode === "blind"
                ? "Computes token equality over blinded digests. Zero student names or raw identifiers enter the relay."
                : "Raw identity lists exposed to central server. Severe interception risk."}
            </p>
          </div>

          <div className="my-2 rounded-xl border border-slate-700 bg-slate-800/90 p-2.5 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Token Collision Discovered</span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-300">MATCH #42</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-300 font-mono truncate">
              Token: <span className="text-amber-300 font-semibold">7f8b92c4a1e900d8...</span>
            </div>
            <div className="mt-1.5 rounded bg-slate-900/90 p-1.5 text-[11px] border border-slate-700">
              {privacyMode === "blind" ? (
                <span className="text-emerald-400 font-medium">
                  <Check className="inline h-3.5 w-3.5 text-emerald-400 mr-1" />
                  Bilateral notice dispatched. Raw identities never exposed centrally.
                </span>
              ) : (
                <span className="text-red-400 font-semibold">
                  Privacy breached: Plaintext student data exposed.
                </span>
              )}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400">
            Phase 5 Cryptographic Comparator
          </div>
        </div>

        {/* Institution B Vault */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PARTICIPANT B</span>
                <h4 className="text-xs font-bold text-slate-900">Pune Engineering Academy</h4>
              </div>
              <Lock className="h-4 w-4 text-slate-400" />
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500">Internal Enrolment Record</span>
                <div className="mt-1 font-mono text-xs">
                  {privacyMode === "blind" ? (
                    <span className="text-slate-600 font-medium">Local Vault: Kept Strictly Offline</span>
                  ) : (
                    <span className="text-red-600 font-bold">LEAKED: Aarav Sharma (DOB: 15-05-2003)</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span>Cryptographic Digest</span>
                  <span className="font-mono text-[10px] text-emerald-700">HMAC-SHA256</span>
                </div>
                <div className="mt-1.5 font-mono text-[11px] text-emerald-900 break-all bg-white p-2 rounded border border-emerald-200">
                  {privacyMode === "blind"
                    ? "7f8b92c4a1e900d83b42f61..."
                    : "EXPOSED_PLAIN_APAAR_100000000042"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-400">
            Salted with Institutional Key K_B
          </div>
        </div>
      </motion.div>

      {/* Statutory Clarity Disclaimer */}
      <div className="rounded-xl border border-amber-300/80 bg-amber-50/80 px-3.5 py-2 flex items-center gap-2 text-xs text-amber-950">
        <Info className="h-4 w-4 text-amber-700 shrink-0" />
        <span className="leading-snug">
          <strong>Cryptographic Architecture Note:</strong> Blind indexing provides keyed pseudonymous collision detection, avoiding centralization of raw student PII under DPDP Act 2023. It is not mathematical zero-knowledge proof.
        </span>
      </div>
    </div>
  );
}

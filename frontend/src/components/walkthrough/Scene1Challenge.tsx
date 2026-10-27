import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Building2, Database, ShieldAlert, Layers, FileWarning, ShieldCheck } from "lucide-react";

export default function Scene1Challenge({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [selectedRisk, setSelectedRisk] = useState<number>(0);
  const [detectionActive, setDetectionActive] = useState<boolean>(true);

  const risks = [
    {
      id: "dual",
      title: "Concurrent Dual Enrolments",
      badge: "CRITICAL INTEGRITY RISK",
      color: "border-red-300 bg-red-50/90 text-red-950",
      desc: "One student holding 2 active full-time government-subsidized seats simultaneously across state lines.",
      stat: "1,840+ Cases Annually",
    },
    {
      id: "quota",
      title: "Intake Ceiling Violations",
      badge: "EXCESS ADMISSIONS",
      color: "border-amber-300 bg-amber-50/90 text-amber-950",
      desc: "Institutions admitting 128 enrolled students against an AICTE sanctioned limit of 120 approved seats.",
      stat: "Degree Risk",
    },
    {
      id: "ghost",
      title: "Scholarship & Quota Poaching",
      badge: "SYSTEMIC LEAKAGE",
      color: "border-emerald-300 bg-emerald-50/90 text-emerald-950",
      desc: "Ghost records claiming reservation allowances without actual classroom attendance or physical verification.",
      stat: "₹42 Cr+ Misallocated",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 space-y-4">
      {/* Context Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-800">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            CASE STUDY: CROSS-STATE CONFLICT
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Aarav Sharma · APAAR: 1000-0000-0042
          </span>
        </div>

        {/* Interactive Detection State Toggle */}
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setDetectionActive(false)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              !detectionActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Siloed View (Blind)
          </button>
          <button
            type="button"
            onClick={() => setDetectionActive(true)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              detectionActive
                ? "bg-slate-900 text-amber-400 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            Vidyadwaar Detection
          </button>
        </div>
      </div>

      {/* Main Interactive Visual Stage: Disconnected Silos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch flex-1">
        {/* Left Institution Silo */}
        <motion.div
          initial={{ opacity: 0, x: isReducedMotion ? 0 : -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Delhi Institute of Tech</h4>
                  <p className="text-[11px] text-slate-500">Autonomous · North Zone</p>
                </div>
              </div>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600">ERP-01</span>
            </div>

            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Student Record</span>
                <span className="font-mono text-slate-700">ID: DIT-2026-0814</span>
              </div>
              <div className="mt-1 font-bold text-sm text-slate-900">Aarav S. Sharma</div>
              <div className="text-[11px] text-slate-600">B.Tech Computer Science</div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-1.5 text-[11px]">
                <span className="text-slate-500">Status: <strong className="text-emerald-700 font-semibold">Active Enrolled</strong></span>
                <span className="font-mono text-slate-700 font-semibold">APAAR: 1000-0000-0042</span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Database className="h-3 w-3 text-slate-400" />
              Intake Quota
            </span>
            <span className="font-bold text-slate-800 text-[11px]">120 / 120 (Full)</span>
          </div>
        </motion.div>

        {/* Center Conflict Bridge */}
        <motion.div
          initial={{ opacity: 0, scale: isReducedMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`lg:col-span-4 flex flex-col justify-between rounded-2xl border-2 p-4 text-center relative overflow-hidden transition-colors ${
            detectionActive
              ? "border-red-400 bg-gradient-to-b from-red-50/80 via-white to-red-50/40 shadow-md shadow-red-500/10"
              : "border-dashed border-slate-300 bg-slate-50/60"
          }`}
        >
          <div>
            <div className="flex justify-center mb-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                detectionActive ? "bg-red-100 text-red-800" : "bg-slate-200 text-slate-600"
              }`}>
                {detectionActive ? (
                  <>
                    <ShieldAlert className="h-3 w-3 text-red-600" /> COLLISION INTERCEPTED
                  </>
                ) : (
                  <>
                    <Layers className="h-3 w-3 text-slate-500" /> SILOED (UNCHECKED)
                  </>
                )}
              </span>
            </div>

            <div className={`mx-auto grid h-10 w-10 place-items-center rounded-xl shadow-inner ${
              detectionActive ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-500"
            }`}>
              <Layers className="h-5 w-5" />
            </div>

            <h4 className="mt-2 text-sm font-bold text-slate-900">
              {detectionActive ? "Immediate Algorithmic Collision" : "The Hidden Collision"}
            </h4>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {detectionActive
                ? "Vidyadwaar matched salted tokens within 14ms. Both registrars alerted before seats locked."
                : "Both colleges verified the candidate locally. Neither knows the candidate is active elsewhere."}
            </p>
          </div>

          <div className="mt-2 rounded-xl border border-red-200 bg-white p-2.5 text-left">
            <div className="flex items-center justify-between text-[11px] font-bold text-red-900">
              <span className="flex items-center gap-1">
                <FileWarning className="h-3.5 w-3.5 text-red-600 shrink-0" />
                Collision Signature
              </span>
              <span className="font-mono text-[10px] text-red-700">APAAR #0042</span>
            </div>
            <div className="mt-1 text-[11px] text-red-800 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center justify-between">
              <span>2 Subsidized Seats Claimed</span>
              <span className="font-bold">Waitlist Blocked</span>
            </div>
          </div>
        </motion.div>

        {/* Right Institution Silo */}
        <motion.div
          initial={{ opacity: 0, x: isReducedMotion ? 0 : 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pune Engineering Academy</h4>
                  <p className="text-[11px] text-slate-500">Affiliated · West Zone</p>
                </div>
              </div>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600">ERP-02</span>
            </div>

            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Student Record</span>
                <span className="font-mono text-emerald-700">ID: PEA-2026-1192</span>
              </div>
              <div className="mt-1 font-bold text-sm text-slate-900">Aarav Sharma</div>
              <div className="text-[11px] text-slate-600">B.E. Mechanical Engineering</div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-1.5 text-[11px]">
                <span className="text-slate-500">Status: <strong className="text-emerald-700 font-semibold">Active Enrolled</strong></span>
                <span className="font-mono text-slate-700 font-semibold">APAAR: 1000-0000-0042</span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Database className="h-3 w-3 text-slate-400" />
              Intake Quota
            </span>
            <span className="font-bold text-amber-700 text-[11px]">128 / 120 (Over Sanction)</span>
          </div>
        </motion.div>
      </div>

      {/* Interactive Systemic Risk Inspector */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Systemic Impact Matrix (Click Risk to Inspect)
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Deterministic Detection Engine</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {risks.map((r, i) => {
            const on = selectedRisk === i;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRisk(i)}
                className={`text-left rounded-lg border p-2.5 transition-all ${
                  on
                    ? `${r.color} shadow-sm ring-2 ring-slate-900/10`
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">{r.badge}</span>
                  <span className="text-[10px] font-bold">{r.stat}</span>
                </div>
                <h5 className="mt-1 font-bold text-xs text-slate-900">{r.title}</h5>
                <p className="mt-0.5 text-[11px] opacity-90 leading-tight">{r.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

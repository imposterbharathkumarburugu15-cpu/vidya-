import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Building2, Database, ShieldAlert, Layers, FileWarning } from "lucide-react";

export default function Scene1Challenge({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [selectedRisk, setSelectedRisk] = useState<number | null>(0);

  const risks = [
    {
      id: "dual",
      title: "Concurrent Dual Enrolments",
      badge: "CRITICAL INTEGRITY RISK",
      color: "border-red-200 bg-red-50/80 text-red-900",
      desc: "One student holding 2 active full-time government-subsidized seats simultaneously across state lines.",
      stat: "1,840+ Discovered Cases Annually",
    },
    {
      id: "quota",
      title: "Intake Ceiling Violations",
      badge: "EXCESS ADMISSIONS",
      color: "border-amber-200 bg-amber-50/80 text-amber-900",
      desc: "Institutions reporting 128 enrolled students against an AICTE sanctioned limit of 120 approved seats.",
      stat: "Risk of Degree Invalidation",
    },
    {
      id: "ghost",
      title: "Scholarship & Quota Poaching",
      badge: "SYSTEMIC LEAKAGE",
      color: "border-purple-200 bg-purple-50/80 text-purple-900",
      desc: "Ghost records claiming reservation allowances without actual classroom attendance or physical verification.",
      stat: "₹42 Cr+ Misallocated Funds",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Headline */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-800">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          The Academic Fragmentation Dilemma
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Ten thousand approved institutions.<br />
          <span className="text-red-600 underline decoration-red-200 decoration-wavy underline-offset-4">
            Zero cross-institutional visibility.
          </span>
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          When institutions manage admissions in isolated database silos without real-time cross-verification, duplicate enrolments, artificial seat blocking, and quota breaches go unnoticed until degree issuance.
        </p>
      </div>

      {/* Main Interactive Visual Stage: Disconnected Silos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Left Institution Silo */}
        <motion.div
          initial={{ opacity: 0, x: isReducedMotion ? 0 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Delhi Institute of Tech</h4>
                <p className="text-xs text-slate-500">Autonomous Institute · North Zone</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">ERP-01</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Student Record</span>
                <span className="font-mono text-[11px] text-blue-600">ID: DIT-2026-0814</span>
              </div>
              <div className="mt-2 font-semibold text-slate-900">Aarav S. Sharma</div>
              <div className="text-xs text-slate-600">B.Tech Computer Science & Eng.</div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                <span className="text-slate-500">Status: <strong className="text-emerald-700 font-semibold">Active Enrolled</strong></span>
                <span className="font-mono text-slate-600">APAAR: 1000-0000-0042</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                Local Intake Allocation
              </span>
              <span className="font-semibold text-slate-800">120 / 120 Full</span>
            </div>
          </div>
        </motion.div>

        {/* Center Conflict Bridge */}
        <motion.div
          initial={{ opacity: 0, scale: isReducedMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-4 flex flex-col justify-center rounded-2xl border-2 border-dashed border-red-300 bg-gradient-to-b from-red-50/50 via-white to-red-50/30 p-5 shadow-sm text-center relative overflow-hidden"
        >
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
              <ShieldAlert className="h-3 w-3 text-red-600" /> UNCHECKED DUPLICATE
            </span>
          </div>

          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-600 shadow-inner">
            <Layers className="h-6 w-6" />
          </div>

          <h4 className="mt-3 text-base font-bold text-red-950">The Invisible Collision</h4>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Both institutions independently verified the candidate against local documentation. Neither knows the candidate is active elsewhere.
          </p>

          <div className="mt-4 rounded-xl border border-red-200 bg-white p-3 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-900">
              <FileWarning className="h-4 w-4 text-red-600 shrink-0" />
              <span>Collision Signature Detected</span>
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-600">
              SHA256(APAAR#1000-0000-0042)
            </div>
            <div className="mt-2 text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-100">
              2 Subsidized Seats Claimed · 1 Deserving Waitlist Candidate Blocked
            </div>
          </div>
        </motion.div>

        {/* Right Institution Silo */}
        <motion.div
          initial={{ opacity: 0, x: isReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Pune Engineering Academy</h4>
                <p className="text-xs text-slate-500">Affiliated College · West Zone</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">ERP-02</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Student Record</span>
                <span className="font-mono text-[11px] text-emerald-600">ID: PEA-2026-1192</span>
              </div>
              <div className="mt-2 font-semibold text-slate-900">Aarav Sharma</div>
              <div className="text-xs text-slate-600">B.E. Mechanical Engineering</div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                <span className="text-slate-500">Status: <strong className="text-emerald-700 font-semibold">Active Enrolled</strong></span>
                <span className="font-mono text-slate-600">APAAR: 1000-0000-0042</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                Local Intake Allocation
              </span>
              <span className="font-semibold text-amber-700">128 / 120 Over Intake</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Systemic Risk Inspector */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Systemic Impact Matrix (Click to Inspect)
          </h4>
          <span className="text-xs text-slate-400 font-medium">Without Central Integrity Engine</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {risks.map((r, i) => {
            const on = selectedRisk === i;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRisk(i)}
                className={`text-left rounded-xl border p-4 transition-all duration-200 ${
                  on
                    ? `${r.color} shadow-sm ring-2 ring-slate-900/10`
                    : "border-slate-200/80 bg-white hover:bg-slate-50/90 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">{r.badge}</span>
                  <span className="text-xs font-semibold">{r.stat}</span>
                </div>
                <h5 className="mt-2 font-bold text-sm text-slate-900">{r.title}</h5>
                <p className="mt-1 text-xs opacity-90 leading-relaxed">{r.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

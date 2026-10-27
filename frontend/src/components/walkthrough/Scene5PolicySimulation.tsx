import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, TrendingUp, BarChart3, AlertCircle, Sparkles } from "lucide-react";

export default function Scene5PolicySimulation({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [ciwgQuotaPercent, setCiwgQuotaPercent] = useState<number>(15);
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(14);

  // Dynamic calculations simulating Phase 4 policy replay
  const baseApprovedSeats = 24000;
  const supernumerarySeats = Math.round((baseApprovedSeats * ciwgQuotaPercent) / 100);
  const totalSanctionedCapacity = baseApprovedSeats + supernumerarySeats;
  const duplicateSeatsFreed = gracePeriodDays === 14 ? 1420 : gracePeriodDays === 30 ? 840 : 420;
  const complianceRate = Math.min(99.6, +(95.4 + (ciwgQuotaPercent - 15) * 0.2 + (gracePeriodDays === 14 ? 3.2 : 1.1)).toFixed(1));

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 space-y-4">
      {/* Context Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950">
            <Sliders className="h-3.5 w-3.5 text-amber-700" />
            WHAT-IF POLICY SIMULATION (PHASE 4)
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Counterfactual In-Memory Modeling · Historical Cohort Replay
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">
            Simulated Data Only
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch flex-1"
      >
        {/* Controls Column */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Adjust Policy Levers (Simulated What-If)
            </h4>

            {/* Slider: Supernumerary FN/OCI/CIWG Quota */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Supernumerary FN/CIWG Quota:</span>
                <span className="font-mono text-amber-700 text-sm">{ciwgQuotaPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="25"
                step="1"
                value={ciwgQuotaPercent}
                onChange={(e) => setCiwgQuotaPercent(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10% (Cap)</span>
                <span>15% (Statutory)</span>
                <span>25% (Expanded)</span>
              </div>
            </div>

            {/* Grace Period Selector */}
            <div className="mt-3">
              <div className="text-xs font-bold text-slate-700 mb-1.5">
                Duplicate Relinquishment Grace Period:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[14, 30, 45].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setGracePeriodDays(days)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      gracePeriodDays === days
                        ? "bg-slate-900 text-amber-400 shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {days} Days {days === 14 ? "(Optimal)" : ""}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500">
                Shorter grace windows expedite vacancy redistribution to waitlisted candidates.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/80 text-[11px] text-amber-950 leading-snug">
            <strong>Replay Sandbox Note:</strong> Simulates deterministic allocation impacts across historical batches without touching production records.
          </div>
        </div>

        {/* Dynamic Analytics & Forecast Visualization */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-700" />
                Simulated Seat Allocation Dynamics
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Cohort: 2026 Admissions</span>
            </div>

            {/* Key Metric Highlights */}
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Capacity</span>
                <div className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                  {totalSanctionedCapacity.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">+{supernumerarySeats} Supernumerary</span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">Seats Freed</span>
                <div className="mt-0.5 font-mono text-lg font-bold text-emerald-700">
                  +{duplicateSeatsFreed.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-800">Vacated Stale Holds</span>
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900">Compliance</span>
                <div className="mt-0.5 font-mono text-lg font-bold text-amber-800">
                  {complianceRate}%
                </div>
                <span className="text-[10px] text-amber-800">Projected In-Memory</span>
              </div>
            </div>

            {/* Visual Seat Capacity Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>Capacity Split Ratio</span>
                <span className="text-slate-500 font-mono">Total: {totalSanctionedCapacity} Seats</span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  style={{ width: `${(baseApprovedSeats / totalSanctionedCapacity) * 100}%` }}
                  className="bg-slate-900 transition-all duration-300"
                  title="Regular Intake Seats"
                />
                <div
                  style={{ width: `${(supernumerarySeats / totalSanctionedCapacity) * 100}%` }}
                  className="bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                  title="Supernumerary Seats"
                />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-900" /> Regular Sanctioned ({baseApprovedSeats.toLocaleString()})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Supernumerary ({supernumerarySeats.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
              <TrendingUp className="h-3.5 w-3.5" /> Zero admission deadlock forecasted under new levers
            </span>
            <span className="font-mono text-[10px] text-slate-400">backend/app/policy.py</span>
          </div>
        </div>
      </motion.div>

      {/* Accuracy & Grounding Callout */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          Accurately labeled counterfactual replay. Live admission tables remain immutable during simulation.
        </span>
        <span className="font-mono text-[11px] text-slate-400">Phase 4 Engine</span>
      </div>
    </div>
  );
}

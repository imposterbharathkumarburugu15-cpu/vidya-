import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, TrendingUp, BarChart3 } from "lucide-react";

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
    <div className="space-y-8">
      {/* Editorial Headline */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-900">
          <Sliders className="h-3.5 w-3.5 text-amber-700" />
          Retrospective Policy Replay (Phase 4)
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Policy Simulation & Seat-Impact Modeling.<br />
          <span className="text-amber-700">Forecast regulatory shifts before enacting rules.</span>
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Regulators shouldn't guess the impact of quota changes or admission timelines. Vidyadwaar’s Policy Replay Engine models counterfactual admission rules against historical batches to forecast seat distribution with mathematical precision.
        </p>
      </div>

      {/* Main Interactive Stage */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch"
      >
        {/* Controls Column */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="h-4 w-4 text-amber-600" />
            Adjust Policy Levers (Live What-If Simulation)
          </h4>

          {/* Slider 1: Supernumerary FN/OCI/CIWG Quota */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Supernumerary FN / OCI / CIWG Quota:</span>
              <span className="font-mono text-amber-700 text-sm font-bold">{ciwgQuotaPercent}%</span>
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
              <span>10% (Restricted)</span>
              <span>15% (Statutory)</span>
              <span>25% (Expanded)</span>
            </div>
          </div>

          {/* Option 2: Duplicate Relinquishment Grace Window */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Duplicate Relinquishment Grace Period:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[14, 30, 45].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setGracePeriodDays(days)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    gracePeriodDays === days
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {days} Days {days === 14 ? "(Optimal)" : ""}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Shorter grace windows expedite vacancy redistribution to waitlisted candidates.
            </p>
          </div>

          <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
            <strong>Replay Engine Note:</strong> All simulation outputs compute without altering production database tables, executing counterfactual intake models in memory.
          </div>
        </div>

        {/* Dynamic Analytics & Forecast Visualization */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Simulated Policy Impact Forecast
              </h4>
              <span className="text-[11px] font-mono text-slate-400">Sample: 2026 Batch Pool</span>
            </div>

            {/* Key Metric Highlights */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sanctioned Intake</span>
                <div className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                  {totalSanctionedCapacity.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">+{supernumerarySeats} Supernumerary</span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Seats Released</span>
                <div className="mt-1 font-mono text-xl font-extrabold text-emerald-700">
                  +{duplicateSeatsFreed.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-800 font-medium">Vacated Stale Holds</span>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Forecasted Compliance</span>
                <div className="mt-1 font-mono text-xl font-extrabold text-blue-700">
                  {complianceRate}%
                </div>
                <span className="text-[11px] text-blue-800 font-medium">Under New Rule Set</span>
              </div>
            </div>

            {/* Visual Seat Capacity Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Capacity Allocation Dynamics</span>
                <span className="text-slate-500 font-mono">Total: {totalSanctionedCapacity} Seats</span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  style={{ width: `${(baseApprovedSeats / totalSanctionedCapacity) * 100}%` }}
                  className="bg-slate-800 transition-all duration-300"
                  title="Regular Intake Seats"
                />
                <div
                  style={{ width: `${(supernumerarySeats / totalSanctionedCapacity) * 100}%` }}
                  className="bg-amber-500 transition-all duration-300"
                  title="Supernumerary Seats"
                />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-800" /> Regular Seats ({baseApprovedSeats.toLocaleString()})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Supernumerary ({supernumerarySeats.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <TrendingUp className="h-4 w-4" /> Zero admission deadlocks forecasted
            </span>
            <span className="font-mono text-slate-400">backend/app/policy.py</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

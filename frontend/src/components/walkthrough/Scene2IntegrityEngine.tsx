import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Cpu } from "lucide-react";

export default function Scene2IntegrityEngine({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [activePreset, setActivePreset] = useState<number>(0);

  const testRecords = [
    {
      name: "Rohan Verma",
      apaar: "1000-0000-0099",
      course: "B.Tech Electrical",
      institutionIntake: "118 / 120 (Within Limit)",
      apaarValid: true,
      intakeValid: true,
      flag: "COMPLIANT_ENROLLED",
      flagColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
      notes: "All deterministic checks passed. Seat locked and ledger entry appended.",
    },
    {
      name: "Pooja Deshmukh",
      apaar: "1000-0000-0042",
      course: "B.Tech Computer Science",
      institutionIntake: "122 / 120 (Exceeds Limit)",
      apaarValid: true,
      intakeValid: false,
      flag: "EXCESS_ADMISSION_ALERT",
      flagColor: "bg-amber-50 text-amber-900 border-amber-300",
      notes: "Sanctioned intake ceiling breached (+2 seats). Flagged for regulatory review.",
    },
    {
      name: "Karan Johar (Invalid Token)",
      apaar: "9999-0000-XYZ",
      course: "MBA General",
      institutionIntake: "60 / 60",
      apaarValid: false,
      intakeValid: true,
      flag: "INVALID_IDENTIFIER_FORMAT",
      flagColor: "bg-red-50 text-red-900 border-red-300",
      notes: "Failed 12-digit numeric checksum verification. Row rejected prior to database persistence.",
    },
  ];

  const current = testRecords[activePreset];

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 space-y-4">
      {/* Interactive Ingestion Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Cpu className="h-3.5 w-3.5 text-emerald-600" />
            AUTOMATED INTEGRITY PIPELINE
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            FastAPI Ingestion Engine · Sub-millisecond Execution
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Select Candidate Row:</span>
          {testRecords.map((rec, i) => (
            <button
              key={rec.name}
              type="button"
              onClick={() => setActivePreset(i)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activePreset === i
                  ? "bg-slate-900 text-amber-400 shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {rec.name.split(" ")[0]} ({rec.flag.split("_")[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Animated 4-Stage Pipeline Visualization */}
      <motion.div
        key={activePreset}
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-3 lg:grid-cols-4 items-stretch flex-1"
      >
        {/* Stage 1: Ingestion & Parsing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-700">STAGE 01</span>
              <span className="font-mono text-emerald-700 font-bold">STREAM</span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-slate-900">Ingest &amp; Schema</h4>
              <p className="mt-0.5 text-[11px] text-slate-500">Streaming CSV &amp; ERP Parser</p>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-[11px] space-y-1 font-mono">
              <div className="text-slate-800 font-bold truncate">{current.name}</div>
              <div className="text-slate-500 truncate">{current.course}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Schema Passed</span>
          </div>
        </div>

        {/* Stage 2: APAAR Identifier Validation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-700">STAGE 02</span>
              <span className="font-mono text-emerald-700 font-bold">CHECKSUM</span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-slate-900">APAAR Validation</h4>
              <p className="mt-0.5 text-[11px] text-slate-500">12-Digit Format &amp; Verhoeff</p>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-[11px] space-y-1 font-mono">
              <div className="text-slate-800 font-bold">{current.apaar}</div>
              <div className="text-slate-500">ISO/IEC 7064 Check</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold">
            {current.apaarValid ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Valid Checksum
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600">
                <XCircle className="h-3.5 w-3.5" /> Invalid Identifier
              </span>
            )}
          </div>
        </div>

        {/* Stage 3: Sanctioned Intake Ceiling */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-700">STAGE 03</span>
              <span className="font-mono text-amber-700 font-bold">CEILING</span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-slate-900">Intake Ledger</h4>
              <p className="mt-0.5 text-[11px] text-slate-500">Sanctioned Limit: 120 Seats</p>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-[11px] space-y-1 font-mono">
              <div className="text-slate-800 font-bold">{current.institutionIntake}</div>
              <div className="text-slate-500">Regular Category</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold">
            {current.intakeValid ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Under Ceiling Cap
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Over Quota (+2 Seats)
              </span>
            )}
          </div>
        </div>

        {/* Stage 4: Engine Verdict & Ledger Append */}
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/40 to-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-emerald-100">
              <span className="font-bold text-emerald-950">STAGE 04</span>
              <span className="font-mono text-emerald-800 font-bold">VERDICT</span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-slate-900">Engine Verdict</h4>
              <p className="mt-0.5 text-[11px] text-slate-500">Hash-chain Ledger Append</p>
            </div>
            <div className="mt-3">
              <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${current.flagColor}`}>
                {current.flag}
              </span>
              <p className="mt-1.5 text-[11px] text-slate-600 leading-snug">
                {current.notes}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Latency: 12ms</span>
            <span>RLS Active</span>
          </div>
        </div>
      </motion.div>

      {/* Operational Guarantee Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Multi-layer deterministic validation prevents phantom allocations before final seat confirmation.
        </span>
        <span className="font-mono text-[11px] text-slate-400">backend/app/ingest.py</span>
      </div>
    </div>
  );
}

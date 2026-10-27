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
      institutionIntake: "120 / 120 (Within Limit)",
      apaarValid: true,
      intakeValid: true,
      multiEnrollmentDetected: false,
      flag: "COMPLIANT_ENROLLED",
      flagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      notes: "All 4 algorithmic checks passed. Seat locked and ledger entry appended.",
    },
    {
      name: "Pooja Deshmukh",
      apaar: "1000-0000-0042",
      course: "B.Tech Computer Science",
      institutionIntake: "122 / 120 (Exceeds Limit)",
      apaarValid: true,
      intakeValid: false,
      multiEnrollmentDetected: false,
      flag: "EXCESS_ADMISSION_ALERT",
      flagColor: "bg-amber-50 text-amber-800 border-amber-200",
      notes: "Intake ceiling breached (+2 seats over AICTE sanctioned intake). Flagged for registrar review.",
    },
    {
      name: "Karan Johar (Invalid Token)",
      apaar: "9999-0000-XYZ",
      course: "MBA General",
      institutionIntake: "60 / 60",
      apaarValid: false,
      intakeValid: true,
      multiEnrollmentDetected: false,
      flag: "INVALID_IDENTIFIER_FORMAT",
      flagColor: "bg-red-50 text-red-800 border-red-200",
      notes: "Failed 12-digit numeric checksum verification. Row rejected prior to database persistence.",
    },
  ];

  const current = testRecords[activePreset];

  const triggerTest = (idx: number) => {
    setActivePreset(idx);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Headline */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          <Cpu className="h-3.5 w-3.5 text-emerald-600" />
          Real-Time Ingestion Architecture
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          The Automated Integrity Engine.<br />
          <span className="text-emerald-700">Deterministic verification before a seat is locked.</span>
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          When institutions submit student cohorts, Vidyadwaar’s engine streams rows through strict rule stages: verifying APAAR checksums, testing intake limits, and evaluating quota integrity in sub-second time.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Simulate Batch Row:</span>
        {testRecords.map((rec, i) => (
          <button
            key={rec.name}
            type="button"
            onClick={() => triggerTest(i)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              activePreset === i
                ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {rec.name} ({rec.flag.split("_")[0]})
          </button>
        ))}
      </div>

      {/* Animated Pipeline Pipeline Visualization */}
      <motion.div
        key={activePreset}
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-4 items-stretch"
      >
        {/* Stage 1: Ingestion & Parsing */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
            <span className="font-bold">STAGE 01</span>
            <span className="font-mono text-emerald-700">PARSE</span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-slate-900">Ingestion & Schema</h4>
            <p className="mt-1 text-xs text-slate-500">FastAPI streaming parser (`/v1/ingest/batches`)</p>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs space-y-1.5 font-mono">
            <div className="text-slate-600 truncate">Candidate: {current.name}</div>
            <div className="text-slate-600">Course: {current.course}</div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>Schema Validated</span>
          </div>
        </div>

        {/* Stage 2: APAAR Identifier Validation */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
            <span className="font-bold">STAGE 02</span>
            <span className="font-mono text-emerald-700">IDENTIFIER</span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-slate-900">APAAR Checksum</h4>
            <p className="mt-1 text-xs text-slate-500">12-digit numeric integrity & Verhoeff check</p>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs space-y-1.5 font-mono">
            <div className="text-slate-600">ID: {current.apaar}</div>
            <div className="text-slate-500">Check: ISO/IEC 7064</div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
            {current.apaarValid ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Checksum Matches
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600">
                <XCircle className="h-4 w-4" /> Invalid Checksum
              </span>
            )}
          </div>
        </div>

        {/* Stage 3: Sanctioned Intake Ceiling */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
            <span className="font-bold">STAGE 03</span>
            <span className="font-mono text-emerald-700">QUOTA</span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-slate-900">Intake Ledger</h4>
            <p className="mt-1 text-xs text-slate-500">Statutory AICTE Sanctioned Limit: 120 Seats</p>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs space-y-1.5 font-mono">
            <div className="text-slate-600">Usage: {current.institutionIntake}</div>
            <div className="text-slate-500">Quota Type: Regular</div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
            {current.intakeValid ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Within Intake Cap
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <AlertCircle className="h-4 w-4" /> Excess Allocation (+2)
              </span>
            )}
          </div>
        </div>

        {/* Stage 4: Engine Verdict & Ledger Append */}
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/30 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-emerald-100">
            <span className="font-bold text-emerald-900">STAGE 04</span>
            <span className="font-mono text-emerald-700">VERDICT</span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-slate-900">Engine Output</h4>
            <p className="mt-1 text-xs text-slate-500">Decision & Hash-chaining</p>
          </div>
          <div className="mt-4">
            <span className={`inline-block rounded-lg border px-2.5 py-1 text-[11px] font-bold ${current.flagColor}`}>
              {current.flag}
            </span>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {current.notes}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Latency: 14ms</span>
            <span>RLS Enforced</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

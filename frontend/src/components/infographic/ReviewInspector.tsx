import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  UserCheck,
} from "lucide-react";

export type ResolutionStatus = "under_review" | "verified" | "unable_to_verify";

interface ReviewInspectorProps {
  initialStatus?: ResolutionStatus;
  onStatusChange?: (status: ResolutionStatus) => void;
}

export default function ReviewInspector({
  initialStatus = "verified",
  onStatusChange,
}: ReviewInspectorProps) {
  const [status, setStatus] = useState<ResolutionStatus>(initialStatus);

  const handleStatus = (next: ResolutionStatus) => {
    setStatus(next);
    onStatusChange?.(next);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-lg p-5 sm:p-6 select-none">
      {/* Top Reviewer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <UserCheck className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Registrar Evidence Review</h4>
              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                CASE #REV-2026-1042
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluating cross-institution duplicate signal on identifier <strong className="font-mono text-slate-800">STU-1042</strong>
            </p>
          </div>
        </div>

        {/* Status Pill Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleStatus("verified")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              status === "verified"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verified</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatus("under_review")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              status === "under_review"
                ? "bg-white text-amber-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Under Review</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatus("unable_to_verify")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              status === "unable_to_verify"
                ? "bg-white text-slate-800 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
            <span>Unable to Verify</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Institutional Evidence Comparison */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: College A Record Timeline */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="font-mono text-xs font-bold text-slate-900">COLLEGE A (Original Entry)</span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Released
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-semibold text-slate-800">Aarav Sharma</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Course / Branch:</span>
              <span className="font-medium text-slate-800">B.Tech Computer Science</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Initial Admission:</span>
              <span className="font-mono text-slate-700">14-Jul-2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transfer Certificate:</span>
              <span className="font-mono font-semibold text-emerald-700">TC-8891 Issued 12-Aug</span>
            </div>
          </div>
        </div>

        {/* Right: College B Record Timeline */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="font-mono text-xs font-bold text-slate-900">COLLEGE B (Transfer Destination)</span>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Admitted
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-semibold text-slate-800">Aarav Sharma</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Course / Branch:</span>
              <span className="font-medium text-slate-800">B.Tech Information Tech</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transfer Counseling:</span>
              <span className="font-mono text-slate-700">16-Aug-2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Seat Allocation:</span>
              <span className="font-mono font-semibold text-blue-700">Regular Seat #42/120</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Resolution Outcome Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`mt-5 rounded-xl p-4 border transition-all ${
            status === "verified"
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
              : status === "under_review"
              ? "bg-amber-50/80 border-amber-300 text-amber-950"
              : "bg-slate-100 border-slate-300 text-slate-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {status === "verified" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : status === "under_review" ? (
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs">
              <div className="font-bold text-sm">
                {status === "verified" && "Resolution: Legitimate Inter-College Transfer"}
                {status === "under_review" && "Status: Held Under Administrative Clarification"}
                {status === "unable_to_verify" && "Status: Incomplete Documentation Submitted"}
              </div>
              <p className="mt-1 leading-relaxed opacity-90">
                {status === "verified" &&
                  "College A's Transfer Certificate (TC-8891) confirms the seat was vacated prior to College B's admission date. The duplicate identifier flag is resolved cleanly without punitive disciplinary consequence."}
                {status === "under_review" &&
                  "Awaiting secondary marksheet verification and official migration timestamp confirmation from the affiliating university registrar."}
                {status === "unable_to_verify" &&
                  "Neither institution has supplied verifiable transfer documentation. Escalated to university grievance ombudsman."}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

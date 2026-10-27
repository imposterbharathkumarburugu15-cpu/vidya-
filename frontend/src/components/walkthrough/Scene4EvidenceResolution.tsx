import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, ShieldCheck, Scale, Smartphone, RefreshCw } from "lucide-react";

export default function Scene4EvidenceResolution({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [caseStatus, setCaseStatus] = useState<"UNDER_REVIEW" | "RESOLVED">("UNDER_REVIEW");

  const resolveCase = () => {
    setCaseStatus("RESOLVED");
  };

  const resetCase = () => {
    setCaseStatus("UNDER_REVIEW");
  };

  return (
    <div className="space-y-8">
      {/* Editorial Headline */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800">
          <Scale className="h-3.5 w-3.5 text-blue-600" />
          Evidence-Backed Case Resolution
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Student Grievances & Verified Evidence.<br />
          <span className="text-blue-700">Fair resolution with tamper-evident OCR and audit trails.</span>
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          When an honest student is flagged because a prior college lagged in recording their seat relinquishment, they upload their stamped Transfer Certificate via the Android app. Vidyadwaar runs OCR and SHA-256 fingerprinting for auditable resolution.
        </p>
      </div>

      {/* Main Dual Stage: Student App & Reviewer Dossier */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch"
      >
        {/* Left: Simulated Student Mobile App Filing */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Student Android App</span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              API: POST /v1/students/me/grievances
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">GRIEVANCE #GRV-2026-0042</span>
              <h4 className="mt-1 text-sm font-bold text-slate-900">Seat Relinquishment Conflict</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                "I vacated my Pune seat on 10 August 2026 and paid the exit fee. Please clear the duplicate flag for Delhi Tech Institute."
              </p>
            </div>

            {/* Document Evidence Thumbnail with OCR Bounding Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Transfer_Certificate_Stamped.pdf
                </span>
                <span className="font-mono text-[10px] text-blue-700">SHA-256 VERIFIED</span>
              </div>
              <div className="mt-2 font-mono text-[10px] text-slate-500 break-all bg-white p-2 rounded border border-blue-100">
                Hash: a9c34e819b02efc4d291307b94d1f8...
              </div>

                <div className="mt-2 rounded bg-white p-2.5 border border-blue-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 mb-1 border-b border-slate-100 font-mono">
                    <span>Tesseract OCR Pipeline</span>
                    <span className="text-emerald-700 font-semibold">Confidence: 99.4%</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-800 space-y-0.5">
                    <div>[EXTRACTED] Ref: TC-2026-DEL-881</div>
                    <div>[EXTRACTED] Effective Relinquishment: 10-AUG-2026</div>
                    <div>[EXTRACTED] Signatory: Registrar Seal Authenticated</div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right: Institutional Reviewer Dossier */}
        <div className="lg:col-span-7 rounded-2xl border-2 border-slate-200/90 bg-gradient-to-b from-slate-50/50 to-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Reviewer Case Investigation Dossier</h4>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  caseStatus === "RESOLVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {caseStatus === "RESOLVED" ? "RESOLVED (APPROVED)" : "STATUS: UNDER_REVIEW"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="font-semibold text-slate-500">Claimant Student</span>
                <div className="mt-1 font-bold text-slate-900">Aarav Sharma (APAAR: 1000-0000-0042)</div>
                <div className="mt-1 text-slate-600">Enrolment Target: Delhi Institute of Tech</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="font-semibold text-slate-500">Disputed Entity</span>
                <div className="mt-1 font-bold text-slate-900">Pune Engineering Academy</div>
                <div className="mt-1 text-slate-600">Old Record: Unmarked Seat Vacancy</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
              <strong>Audit Decision Recommendation:</strong> Stamped Transfer Certificate confirms exit effective 10 August 2026. Delhi admission commenced 18 August 2026. Chronological overlap is non-concurrent. Safe to authorize seat surrender and release duplicate hold.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Action logged in central immutable audit trail
            </span>

            {caseStatus === "UNDER_REVIEW" ? (
              <button
                type="button"
                onClick={resolveCase}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Relinquishment & Clear Duplicate
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" /> Case Closed · Student Hold Cleared
                </span>
                <button
                  type="button"
                  onClick={resetCase}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw className="h-3 w-3 inline mr-1" /> Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

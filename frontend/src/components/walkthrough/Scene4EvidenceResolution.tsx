import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, ShieldCheck, Scale, Smartphone, RefreshCw, Check } from "lucide-react";
import { audioController } from "./sound";

export default function Scene4EvidenceResolution({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [caseStatus, setCaseStatus] = useState<"UNDER_REVIEW" | "RESOLVED">("UNDER_REVIEW");

  const resolveCase = () => {
    audioController.playSuccess();
    setCaseStatus("RESOLVED");
  };

  const resetCase = () => {
    audioController.playClick();
    setCaseStatus("UNDER_REVIEW");
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 space-y-4">
      {/* Context Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Scale className="h-3.5 w-3.5 text-emerald-600" />
            EVIDENCE-BACKED CASE RESOLUTION
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Tesseract OCR Pipeline · SHA-256 Digesting · Immutable Audit Log
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            caseStatus === "RESOLVED"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-amber-100 text-amber-900 border border-amber-200"
          }`}>
            {caseStatus === "RESOLVED" ? "RESOLVED (APPROVED)" : "STATUS: UNDER_REVIEW"}
          </span>
        </div>
      </div>

      {/* Main Dual Stage: Student App & Reviewer Dossier */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch flex-1"
      >
        {/* Left: Simulated Student Mobile App Filing */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">Student Android App (Phase 7)</span>
              </div>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                GRIEVANCE #0042
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Claimant Statement</span>
                <p className="mt-1 text-xs text-slate-700 leading-snug">
                  "Vacated Pune seat on 10 August 2026. Paid exit dues. Request duplicate hold release for Delhi Tech."
                </p>
              </div>

              {/* Document Evidence Thumbnail with OCR Bounding Box */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="h-4 w-4 text-emerald-700 shrink-0" />
                    Transfer_Certificate_Stamped.pdf
                  </span>
                  <span className="font-mono text-[9px] text-emerald-700 shrink-0">SHA-256</span>
                </div>
                <div className="mt-1.5 font-mono text-[10px] text-slate-500 truncate bg-white p-1.5 rounded border border-emerald-100">
                  Hash: a9c34e819b02efc4d291307b94d1f8...
                </div>

                <div className="mt-2 rounded bg-white p-2 border border-emerald-100 text-[11px]">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 mb-1 border-b border-slate-100 font-mono">
                    <span>Tesseract OCR Pipeline</span>
                    <span className="text-emerald-700 font-bold">99.4% Match</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-700 space-y-0.5">
                    <div>[EXTRACTED] Ref: TC-2026-DEL-881</div>
                    <div>[EXTRACTED] Effective Relinquishment: 10-AUG-2026</div>
                    <div>[EXTRACTED] Registrar Official Seal: Authenticated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 mt-2">
            Uploaded via Verified Student Android Wallet
          </div>
        </div>

        {/* Right: Institutional Reviewer Dossier */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-slate-900">Reviewer Investigation Dossier</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">backend/app/cases.py</span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target College</span>
                <div className="font-bold text-slate-900 mt-0.5">Delhi Institute of Tech</div>
                <div className="text-[11px] text-slate-500">Admitted: 18-Aug-2026</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Vacated College</span>
                <div className="font-bold text-slate-900 mt-0.5">Pune Engineering Academy</div>
                <div className="text-[11px] text-slate-500">Relinquished: 10-Aug-2026</div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs leading-relaxed text-slate-700">
              <strong>Audit Evaluation:</strong> Stamped Transfer Certificate confirms exit prior to Delhi admission. Timeline overlap is non-concurrent. Authorize relinquishment, release duplicate hold, and unlock subsidized seat ledger.
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 font-mono">
              Dual-reviewer cryptographic audit trail
            </span>

            {caseStatus === "UNDER_REVIEW" ? (
              <button
                type="button"
                onClick={resolveCase}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-amber-400 shadow-md hover:bg-slate-800 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                Approve Relinquishment &amp; Clear Hold
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Duplicate Cleared · Seat Released
                </span>
                <button
                  type="button"
                  onClick={resetCase}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw className="h-3 w-3 inline mr-1" /> Reset Test
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Operational Guarantee Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Evidence-backed dispute resolution protects innocent students while maintaining strict integrity records.
        </span>
        <span className="font-mono text-[11px] text-slate-400">backend/app/ocr.py</span>
      </div>
    </div>
  );
}

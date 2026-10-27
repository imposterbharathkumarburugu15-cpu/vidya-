import { useState } from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle2, XCircle, QrCode, ShieldAlert, RefreshCw, KeyRound, CalendarCheck } from "lucide-react";
import { audioController } from "./sound";

export default function Scene6VerifiableCredentials({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [isRevoked, setIsRevoked] = useState<boolean>(false);

  const signatureStatus = isTampered ? "INVALID" : "VALID";
  const statusListStatus = isRevoked ? "REVOKED" : "ACTIVE";

  const toggleTamper = () => {
    if (!isTampered) {
      audioController.playPing();
    } else {
      audioController.playClick();
    }
    setIsTampered(!isTampered);
  };

  const toggleRevoke = () => {
    if (!isRevoked) {
      audioController.playPing();
    } else {
      audioController.playClick();
    }
    setIsRevoked(!isRevoked);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 space-y-4">
      {/* Context Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Award className="h-3.5 w-3.5 text-emerald-600" />
            W3C VERIFIABLE CREDENTIALS 2.0 (PHASE 8)
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Ed25519 Cryptographic Signatures · Bitstring Status List · Base45 QR
          </span>
        </div>

        {/* Interactive Verification Test Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTamper}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              isTampered
                ? "bg-red-600 text-white shadow-sm ring-2 ring-red-600/20"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {isTampered ? "Tampering Active (CGPA 9.99)" : "Simulate Tampering"}
          </button>

          <button
            type="button"
            onClick={toggleRevoke}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              isRevoked
                ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {isRevoked ? "Bitstring Revoked" : "Simulate Revocation"}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch flex-1"
      >
        {/* W3C Digital Credential Card */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">National Degree Credential</h4>
                  <p className="text-[10px] text-slate-500">W3C VC 2.0 · eddsa-jcs-2022</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-400">ID: VC-2026-DEL-0042</span>
            </div>

            {/* Credential Subject Data */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[9px] uppercase font-bold text-slate-400">Awarded To</span>
                <div className="font-bold text-slate-900 text-xs mt-0.5">Aarav S. Sharma</div>
                <div className="text-slate-500 font-mono text-[10px]">APAAR: 1000-0000-0042</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-[9px] uppercase font-bold text-slate-400">Qualification</span>
                <div className="font-bold text-slate-900 text-xs mt-0.5">B.Tech Computer Science</div>
                <div className="text-slate-500 text-[10px]">Delhi Institute of Technology</div>
              </div>
            </div>

            {/* GPA Payload Display with Tamper Highlighting */}
            <div className={`mt-2.5 rounded-xl p-2.5 border text-xs font-mono transition-colors ${
              isTampered ? "bg-red-50 border-red-200 text-red-900" : "bg-slate-50 border-slate-100 text-slate-800"
            }`}>
              <div className="flex justify-between items-center text-[9px] uppercase font-bold pb-1 mb-1 border-b border-slate-200/60">
                <span>Claims Payload</span>
                {isTampered && <span className="text-red-700 font-bold">DIGEST MISMATCH</span>}
              </div>
              <div className="text-[11px]">cumulative_gpa: <strong className={isTampered ? "text-red-700 underline" : "text-emerald-700"}>
                {isTampered ? "9.99 (FORGED CLAIM)" : "8.92 (HONEST CLAIM)"}
              </strong></div>
              <div className="text-[10px] text-slate-400 truncate">issuer_did: did:web:delhitech.ac.in#key-1</div>
            </div>
          </div>

          {/* 4-Pillar Verification Checks */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-4 gap-2 text-xs">
            {/* Check 1: Issuer Authenticity */}
            <div className="rounded-lg p-2 border bg-emerald-50/60 border-emerald-200 text-emerald-950">
              <div className="flex items-center gap-1 font-bold text-[10px]">
                <KeyRound className="h-3 w-3 text-emerald-600" />
                <span>Issuer</span>
              </div>
              <div className="text-[9px] font-mono text-emerald-700 mt-0.5">did:web AUTHENTIC</div>
            </div>

            {/* Check 2: Signature Validity */}
            <div className={`rounded-lg p-2 border ${
              signatureStatus === "VALID"
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                : "bg-red-50/90 border-red-200 text-red-950"
            }`}>
              <div className="flex items-center gap-1 font-bold text-[10px]">
                {signatureStatus === "VALID" ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}
                <span>Ed25519</span>
              </div>
              <div className="text-[9px] font-mono mt-0.5">{signatureStatus}</div>
            </div>

            {/* Check 3: Expiry Status */}
            <div className="rounded-lg p-2 border bg-emerald-50/60 border-emerald-200 text-emerald-950">
              <div className="flex items-center gap-1 font-bold text-[10px]">
                <CalendarCheck className="h-3 w-3 text-emerald-600" />
                <span>Expiry</span>
              </div>
              <div className="text-[9px] font-mono text-emerald-700 mt-0.5">PERPETUAL</div>
            </div>

            {/* Check 4: Status List Revocation */}
            <div className={`rounded-lg p-2 border ${
              statusListStatus === "ACTIVE"
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                : "bg-amber-50/90 border-amber-300 text-amber-950"
            }`}>
              <div className="flex items-center gap-1 font-bold text-[10px]">
                {statusListStatus === "ACTIVE" ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-amber-600" />
                )}
                <span>Bitstring</span>
              </div>
              <div className="text-[9px] font-mono mt-0.5">#{statusListStatus}</div>
            </div>
          </div>
        </div>

        {/* Offline Base45 QR Inspector */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-slate-700" />
                Base45 Offline QR Payload
              </h4>
              <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                1039 Chars
              </span>
            </div>

            <div className="mt-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <div className="mx-auto w-24 h-24 bg-white rounded-lg border-2 border-slate-900 p-1.5 grid place-items-center shadow-inner">
                {/* SVG QR Code Simulation */}
                <div className="grid grid-cols-6 gap-0.5 w-full h-full">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i < 8 || i > 28
                          ? "bg-slate-900"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-1.5 text-[10px] font-mono text-slate-500">
                Compact Base45 · Decodes Offline
              </p>
            </div>

            <div className="mt-2.5 text-[11px] text-slate-600 leading-snug space-y-1">
              <p><strong>Zero-Server Verification:</strong> Foreign universities or employers scan and verify signatures without connecting to Vidyadwaar servers.</p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>RFC 8785 (JCS)</span>
            <span>Verified in 9.4ms</span>
          </div>
        </div>
      </motion.div>

      {/* Operational Guarantee Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Distinguishes cryptographic signature validity, issuer authenticity, and real-time revocation status.
        </span>
        <span className="font-mono text-[11px] text-slate-400">Phase 8 Credentials</span>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle2, XCircle, QrCode, ShieldAlert, RefreshCw } from "lucide-react";

export default function Scene6VerifiableCredentials({ isReducedMotion }: { isReducedMotion: boolean }) {
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [isRevoked, setIsRevoked] = useState<boolean>(false);

  const signatureStatus = isTampered ? "INVALID" : "VALID";
  const statusListStatus = isRevoked ? "REVOKED" : "ACTIVE";

  return (
    <div className="space-y-8">
      {/* Editorial Headline */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          <Award className="h-3.5 w-3.5 text-emerald-600" />
          W3C Verifiable Credentials 2.0 (Phase 8)
        </div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Verifiable Academic Credentials.<br />
          <span className="text-emerald-700">Ed25519 signatures, Base45 QR codes & status lists.</span>
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Graduates receive tamper-evident digital degrees signed by the registrar using eddsa-jcs-2022. Anyone can verify authenticity offline in milliseconds with a Base45 QR code, while revocations are tracked via Bitstring Status Lists.
        </p>
      </div>

      {/* Interactive Tamper / Revocation Test Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsTampered(!isTampered)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            isTampered
              ? "bg-red-600 text-white shadow-sm ring-2 ring-red-600/20"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          {isTampered ? "Payload Tampered (Active Test)" : "Simulate Payload Tampering (GPA 9.42 -> 9.99)"}
        </button>

        <button
          type="button"
          onClick={() => setIsRevoked(!isRevoked)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            isRevoked
              ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          {isRevoked ? "Status Revoked in Bitstring" : "Simulate Status List Revocation"}
        </button>
      </div>

      {/* Main Interactive Stage */}
      <motion.div
        initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch"
      >
        {/* W3C Digital Credential Card */}
        <div className="lg:col-span-7 rounded-2xl border-2 border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">National Degree Credential</h4>
                  <p className="text-xs text-slate-500">W3C VC 2.0 · eddsa-jcs-2022</p>
                </div>
              </div>
              <span className="font-mono text-xs text-slate-400">ID: VC-2026-DEL-0042</span>
            </div>

            {/* Credential Subject Data */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Awarded To</span>
                <div className="font-bold text-slate-900 mt-0.5">Aarav S. Sharma</div>
                <div className="text-slate-500 font-mono text-[11px]">APAAR: 1000-0000-0042</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Qualification</span>
                <div className="font-bold text-slate-900 mt-0.5">Bachelor of Technology</div>
                <div className="text-slate-500 text-[11px]">Computer Science (Distinction)</div>
              </div>
            </div>

            {/* GPA Payload Display with Tamper Highlighting */}
            <div className={`mt-3 rounded-xl p-3 border text-xs font-mono transition-colors ${
              isTampered ? "bg-red-50 border-red-200 text-red-900" : "bg-slate-50 border-slate-100 text-slate-800"
            }`}>
              <div className="flex justify-between items-center text-[10px] uppercase font-bold pb-1 mb-1 border-b border-slate-200/60">
                <span>Subject Claims Payload</span>
                {isTampered && <span className="text-red-700 font-bold">DIGEST MISMATCH DETECTED</span>}
              </div>
              <div>cumulative_gpa: <strong className={isTampered ? "text-red-700 underline" : "text-emerald-700"}>
                {isTampered ? "9.99 (FORGED CLAIM)" : "9.42 (VERIFIED)"}
              </strong></div>
              <div>issuer_did: did:jwk:eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5Ii...</div>
            </div>
          </div>

          {/* Cryptographic Proof Verification Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className={`rounded-xl p-3 border flex items-center gap-2 ${
              signatureStatus === "VALID"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                : "bg-red-50/80 border-red-200 text-red-900"
            }`}>
              {signatureStatus === "VALID" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 shrink-0" />
              )}
              <div>
                <div className="font-bold">Ed25519 Signature</div>
                <div className="text-[11px] font-mono opacity-80">{signatureStatus}</div>
              </div>
            </div>

            <div className={`rounded-xl p-3 border flex items-center gap-2 ${
              statusListStatus === "ACTIVE"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                : "bg-amber-50/80 border-amber-200 text-amber-900"
            }`}>
              {statusListStatus === "ACTIVE" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="font-bold">Bitstring Status List</div>
                <div className="text-[11px] font-mono opacity-80">Index #42: {statusListStatus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Base45 QR Inspector */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-slate-700" />
                Base45 Offline QR Payload
              </h4>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                1039 Chars
              </span>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <div className="mx-auto w-32 h-32 bg-white rounded-lg border-2 border-slate-800 p-2 grid place-items-center shadow-inner">
                {/* SVG QR Code Simulation */}
                <div className="grid grid-cols-6 gap-1 w-full h-full p-1">
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
              <p className="mt-2 text-xs font-mono text-slate-500">
                QR alphanumeric · EC Level M
              </p>
            </div>

            <div className="mt-4 text-xs text-slate-600 leading-relaxed space-y-1">
              <p><strong>Offline Verification:</strong> Any Android or web camera decodes the Base45 envelope and verifies the signature using the cached public key.</p>
              <p className="text-slate-500">Zero dependence on centralized cloud availability at border immigration or job interviews.</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>RFC 8785 (JCS)</span>
            <span>Ed25519 Verified</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

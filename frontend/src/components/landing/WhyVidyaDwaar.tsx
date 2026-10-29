import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeAlert,
  Building2,
  CheckCircle2,
  Cpu,
  Download,
  FileCheck2,
  GraduationCap,
  HelpCircle,
  Layers,
  Lock,
  Network,
  Scale,
  Smartphone,
  Sparkles,
  XCircle,
} from "lucide-react";
import { GOLD_TEXT } from "./styles";

type PrimaryPillar = "conflict" | "source" | "workflow";

export default function WhyVidyaDwaar() {
  const [activePillar, setActivePillar] = useState<PrimaryPillar>("conflict");
  const [conflictSimState, setConflictSimState] = useState<"collision" | "resolved">("collision");
  const [evidenceMode, setEvidenceMode] = useState<"standard" | "vidyadwaar">("vidyadwaar");
  const [workflowStatus, setWorkflowStatus] = useState<"verified" | "conflict" | "unable">("verified");

  return (
    <section id="why-vidyadwaar" aria-labelledby="why-heading" className="scroll-mt-24 space-y-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>WHY VIDYADWAAR? · CORE ARCHITECTURAL DIFFERENTIATORS</span>
          </div>
          <h2
            id="why-heading"
            className="font-inter text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-white leading-tight"
          >
            From checking individual documents to{" "}
            <span className={GOLD_TEXT}>cross-institution integrity</span>.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Traditional portals only inspect uploaded PDFs and static QR links. VidyaDwaar identifies cross-college identity conflicts, verifies cryptographic institutional evidence, and guarantees non-punitive auditability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#/how-it-works"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-5 py-3 text-xs sm:text-sm font-bold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Watch Animated Infographic Story</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/vidyadwaar-student-portal.apk"
            download="vidyadwaar-student-portal.apk"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all"
            title="Download native Android Student Wallet APK"
          >
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span>Mobile APK (21.6MB)</span>
            <Download className="h-3.5 w-3.5 text-emerald-400 ml-0.5" />
          </a>
        </div>
      </div>

      {/* PART 1: The Three Primary Differentiators (Interactive Showcase) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            THREE PRIMARY PILLARS (INTERACTIVE DEMO)
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Select a pillar to test its interactive simulation
          </span>
        </div>

        {/* 3 Primary Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <button
            type="button"
            onClick={() => setActivePillar("conflict")}
            className={`text-left rounded-2xl p-5 transition-all relative overflow-hidden border ${
              activePillar === "conflict"
                ? "bg-gradient-to-b from-[#1f190e] to-[#120f08] border-amber-400 shadow-[0_0_30px_rgba(245,192,103,0.25)] ring-1 ring-amber-400/50"
                : "glass-premium border-white/10 hover:border-amber-400/40 hover:bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-mono text-xs font-extrabold text-amber-400">PILLAR 01</span>
              <Network className="h-5 w-5 text-amber-300" />
            </div>
            <h3 className="mt-3 text-base font-bold text-white">Cross-Institution Conflict Detection</h3>
            <p className="mt-1 text-xs text-slate-400 leading-snug">
              Detect duplicate identifiers across separate colleges and isolate collisions without raw PII exposure.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-white/5">
              <span className={`font-semibold ${activePillar === "conflict" ? "text-amber-300" : "text-slate-500"}`}>
                {activePillar === "conflict" ? "● Interactive Simulation" : "Click to Explore"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">ZERO FRAUD BIAS</span>
            </div>
          </button>

          {/* Pillar 2 */}
          <button
            type="button"
            onClick={() => setActivePillar("source")}
            className={`text-left rounded-2xl p-5 transition-all relative overflow-hidden border ${
              activePillar === "source"
                ? "bg-gradient-to-b from-[#1f190e] to-[#120f08] border-amber-400 shadow-[0_0_30px_rgba(245,192,103,0.25)] ring-1 ring-amber-400/50"
                : "glass-premium border-white/10 hover:border-amber-400/40 hover:bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-mono text-xs font-extrabold text-amber-400">PILLAR 02</span>
              <FileCheck2 className="h-5 w-5 text-amber-300" />
            </div>
            <h3 className="mt-3 text-base font-bold text-white">Source-Backed Academic Verification</h3>
            <p className="mt-1 text-xs text-slate-400 leading-snug">
              Don't just inspect an uploaded PDF. Verify cryptographic Ed25519 signatures from authorized registrar DIDs.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-white/5">
              <span className={`font-semibold ${activePillar === "source" ? "text-amber-300" : "text-slate-500"}`}>
                {activePillar === "source" ? "● Interactive Simulation" : "Click to Explore"}
              </span>
              <span className="text-[10px] font-mono text-blue-400">W3C VC 2.0</span>
            </div>
          </button>

          {/* Pillar 3 */}
          <button
            type="button"
            onClick={() => setActivePillar("workflow")}
            className={`text-left rounded-2xl p-5 transition-all relative overflow-hidden border ${
              activePillar === "workflow"
                ? "bg-gradient-to-b from-[#1f190e] to-[#120f08] border-amber-400 shadow-[0_0_30px_rgba(245,192,103,0.25)] ring-1 ring-amber-400/50"
                : "glass-premium border-white/10 hover:border-amber-400/40 hover:bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-mono text-xs font-extrabold text-amber-400">PILLAR 03</span>
              <Scale className="h-5 w-5 text-amber-300" />
            </div>
            <h3 className="mt-3 text-base font-bold text-white">Trustworthy Verification Workflows</h3>
            <p className="mt-1 text-xs text-slate-400 leading-snug">
              Produce three explainable outcomes: Verified, Conflict Detected, or Unable to Verify with human redressal.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-white/5">
              <span className={`font-semibold ${activePillar === "workflow" ? "text-amber-300" : "text-slate-500"}`}>
                {activePillar === "workflow" ? "● Interactive Simulation" : "Click to Explore"}
              </span>
              <span className="text-[10px] font-mono text-amber-400">HUMAN IN THE LOOP</span>
            </div>
          </button>
        </div>

        {/* Interactive Simulation Display Canvas */}
        <div className="glass-premium rounded-3xl border-2 border-amber-400/40 bg-gradient-to-b from-[#15120a] via-slate-950/95 to-[#0b0c10] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* PILLAR 1 SIMULATION */}
            {activePillar === "conflict" && (
              <motion.div
                key="conflict-sim"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      INTERACTIVE COLLISION ENGINE · DEMONSTRATION
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      One identifier. Multiple institutions. One conflict to investigate.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                      Observe how identical student identifiers across College A and College B are recognized as signals for verification rather than automatic proof of fraud.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConflictSimState("collision")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        conflictSimState === "collision"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      1. Trigger Collision
                    </button>
                    <button
                      type="button"
                      onClick={() => setConflictSimState("resolved")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        conflictSimState === "resolved"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      2. Resolve Non-Punitively
                    </button>
                  </div>
                </div>

                {/* 3-Column Visual Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  {/* Left: College A */}
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-amber-300 pb-2 border-b border-white/10">
                        <span className="font-bold">INSTITUTION A (DELHI)</span>
                        <Building2 className="h-4 w-4" />
                      </div>
                      <h4 className="mt-3 text-sm font-bold text-white">Vidyapeeth Inst of Tech & Science</h4>
                      <p className="text-[11px] text-slate-400">Independent institutional admissions roster</p>

                      <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 space-y-1.5">
                        <div className="text-[10px] text-slate-400 font-mono">STUDENT ENROLMENT</div>
                        <div className="text-xs font-bold text-white">Aarav Sharma · B.Tech CSE</div>
                        <div className="font-mono text-xs font-extrabold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-400/30 inline-block">
                          ID: STU-1042
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
                      Ingested via CSV Batch #8210
                    </div>
                  </div>

                  {/* Center: VidyaDwaar Quarantine & Matching Gateway */}
                  <div className="rounded-2xl border-2 border-amber-400/40 bg-gradient-to-b from-[#1a1408] to-black/90 p-5 space-y-3 flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between text-xs text-amber-300 pb-2 border-b border-white/10">
                        <span className="font-mono font-bold">VIDYADWAAR RADAR</span>
                        <Cpu className="h-4 w-4 text-amber-400" />
                      </div>

                      <div className="mt-4 text-center space-y-2">
                        {conflictSimState === "collision" ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300 animate-pulse">
                            <BadgeAlert className="h-4 w-4" />
                            <span>Potential Conflict Signal Flagged</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Resolved · Sit and Relax</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed pt-2">
                          {conflictSimState === "collision"
                            ? "Salted HMAC tokens matched: STU-1042 appears in 2 independent registries. Flagged for review without making fraud assumptions."
                            : "Human verification confirmed legitimate transfer: Candidate withdrew from College B and completed verified enrolment at College A."}
                        </p>
                      </div>

                      <div className="mt-4 rounded-xl bg-black/60 p-2.5 border border-white/10 text-center font-mono text-[10px] text-slate-400">
                        HMAC-SHA256: <span className="text-amber-300">e82a...91b4</span> (Masked)
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>DPDP Act 2023 Compliant</span>
                      <span className="text-emerald-400">0 PII LEAKED</span>
                    </div>
                  </div>

                  {/* Right: College B */}
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-amber-300 pb-2 border-b border-white/10">
                        <span className="font-bold">INSTITUTION B (MUMBAI)</span>
                        <Building2 className="h-4 w-4" />
                      </div>
                      <h4 className="mt-3 text-sm font-bold text-white">Apex Global Inst of Eng & Tech</h4>
                      <p className="text-[11px] text-slate-400">Affiliated state technical university roster</p>

                      <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 space-y-1.5">
                        <div className="text-[10px] text-slate-400 font-mono">STUDENT ENROLMENT</div>
                        <div className="text-xs font-bold text-white">Aarav Sharma · Mech Eng</div>
                        <div className="font-mono text-xs font-extrabold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-400/30 inline-block">
                          ID: STU-1042
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
                      Ingested via Webhook Ingestion #9403
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PILLAR 2 SIMULATION */}
            {activePillar === "source" && (
              <motion.div
                key="source-sim"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      CRYPTOGRAPHIC INTEGRITY · DEMONSTRATION
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Don't just inspect a document. Verify its evidence.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                      See why traditional portals that merely preview uploaded PDFs fail against modern tampering, and how VidyaDwaar uses W3C Verifiable Credentials with Ed25519 signatures.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEvidenceMode("standard")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        evidenceMode === "standard"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      Conventional PDF Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setEvidenceMode("vidyadwaar")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        evidenceMode === "vidyadwaar"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      VidyaDwaar Cryptographic VC
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Verification Journey Card */}
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-amber-400" />
                      <span>The End-to-End Credential Journey</span>
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="font-mono text-xs font-bold text-amber-400">01</span>
                        <div className="text-xs">
                          <strong className="text-white block">Issuing Institution:</strong>
                          <span className="text-slate-400">Registrar signs graduation ledger with private Ed25519 key.</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="font-mono text-xs font-bold text-amber-400">02</span>
                        <div className="text-xs">
                          <strong className="text-white block">Digital Credential:</strong>
                          <span className="text-slate-400">Canonical W3C VC 2.0 object issued directly to student's APAAR ID.</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="font-mono text-xs font-bold text-amber-400">03</span>
                        <div className="text-xs">
                          <strong className="text-white block">Student Wallet & Mobile APK:</strong>
                          <span className="text-slate-400">Student stores offline Base45 QR and shares scoped consent.</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="font-mono text-xs font-bold text-amber-400">04</span>
                        <div className="text-xs">
                          <strong className="text-white block">Verifier / Employer:</strong>
                          <span className="text-slate-400">Evaluates signature against AICTE Trust Registry in under 12ms.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Technical Inspector Comparison */}
                  <div className={`rounded-2xl border p-5 space-y-4 flex flex-col justify-between transition-all ${
                    evidenceMode === "standard"
                      ? "border-rose-500/30 bg-rose-950/20"
                      : "border-emerald-500/30 bg-emerald-950/20"
                  }`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                          {evidenceMode === "standard" ? "INSUFFICIENT EVIDENCE (PDF)" : "SOURCE-BACKED PROOF"}
                        </span>
                        {evidenceMode === "standard" ? (
                          <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                            Vulnerable to Photoshop
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                            Cryptographically Guaranteed
                          </span>
                        )}
                      </div>

                      {evidenceMode === "standard" ? (
                        <div className="rounded-xl bg-black/60 p-4 border border-rose-500/20 space-y-2 text-xs text-rose-200">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <XCircle className="h-4 w-4 text-rose-400" /> Static Visual OCR Scan Only
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            A forged PDF with modified GPA or degree name cannot be verified without calling back the university registrar manually. Visual checks provide zero cryptographic guarantees.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-black/60 p-4 border border-emerald-500/20 space-y-2 text-xs text-emerald-200">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Ed25519 Canonical JCS Signature
                          </p>
                          <div className="font-mono text-[10px] text-slate-400 space-y-1">
                            <div>DID: <span className="text-emerald-300">did:web:bntu.ac.in</span></div>
                            <div>Proof Type: <span className="text-emerald-300">eddsa-jcs-2022</span></div>
                            <div>Bitstring Status List: <span className="text-emerald-300">Index #1042 (Active)</span></div>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                            Any modified character breaks the Ed25519 signature immediately, returning an instant TAMPERED error.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Offline Verification:</span>
                      <strong className={evidenceMode === "standard" ? "text-rose-400" : "text-emerald-400"}>
                        {evidenceMode === "standard" ? "Impossible (Requires Central DB)" : "Sub-12ms via Base45 QR"}
                      </strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PILLAR 3 SIMULATION */}
            {activePillar === "workflow" && (
              <motion.div
                key="workflow-sim"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      EXPLAINABLE OUTCOMES · DEMONSTRATION
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Every result should have a clear meaning.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                      VidyaDwaar produces three distinct, transparent outcomes. We never automatically brand students fraudulent when records conflict.
                    </p>
                  </div>

                  {/* 3 Outcome State Selectors */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWorkflowStatus("verified")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        workflowStatus === "verified"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      1. Verified
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkflowStatus("conflict")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        workflowStatus === "conflict"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      2. Conflict Detected
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkflowStatus("unable")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        workflowStatus === "unable"
                          ? "bg-slate-500/20 text-slate-300 border border-slate-500/50 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      3. Unable to Verify
                    </button>
                  </div>
                </div>

                {/* 3 Outcome Display Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Status 1: VERIFIED */}
                  <div className={`rounded-2xl border p-5 space-y-3 transition-all ${
                    workflowStatus === "verified"
                      ? "border-emerald-400/80 bg-emerald-950/30 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                      : "border-white/10 bg-slate-900/40 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-mono text-xs font-bold text-emerald-400">OUTCOME A</span>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300">
                      VERIFIED
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The available evidence satisfies all implemented cryptographic checks. Signed by an AICTE-registered university, within validity window, and active on the Bitstring Status List.
                    </p>
                    <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-emerald-400">
                      ACTION: Degree Validated Instantly
                    </div>
                  </div>

                  {/* Status 2: CONFLICT DETECTED */}
                  <div className={`rounded-2xl border p-5 space-y-3 transition-all ${
                    workflowStatus === "conflict"
                      ? "border-amber-400/80 bg-amber-950/30 shadow-[0_0_25px_rgba(245,192,103,0.2)]"
                      : "border-white/10 bg-slate-900/40 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-mono text-xs font-bold text-amber-400">OUTCOME B</span>
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-extrabold text-amber-300">
                      CONFLICT DETECTED
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Discrepancy identified across institutional records (e.g. concurrent enrolment or quota mismatch). Non-punitive: routed to the AICTE officer inspection queue for review.
                    </p>
                    <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-amber-400">
                      ACTION: Human Evidence Review Initiated
                    </div>
                  </div>

                  {/* Status 3: UNABLE TO VERIFY */}
                  <div className={`rounded-2xl border p-5 space-y-3 transition-all ${
                    workflowStatus === "unable"
                      ? "border-slate-400/80 bg-slate-900/60 shadow-[0_0_25px_rgba(148,163,184,0.2)]"
                      : "border-white/10 bg-slate-900/40 opacity-50"
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-mono text-xs font-bold text-slate-400">OUTCOME C</span>
                      <HelpCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="inline-block rounded-full bg-slate-500/20 border border-slate-500/40 px-2.5 py-0.5 text-xs font-extrabold text-slate-300">
                      UNABLE TO VERIFY
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The available evidence is insufficient, or the issuing institution is not registered in the AICTE trust registry. Explicitly marked as unverified rather than failed.
                    </p>
                    <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-slate-400">
                      ACTION: Registry Inquiry Suggested
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PART 2: The Four Ecosystem & Platform Capabilities */}
      <div className="space-y-6 pt-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            CONNECTIVITY & TRUST LAYER
          </span>
          <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Capabilities for National Academic Trust
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Built as a modular, interoperable architecture that respects student privacy, enables sub-second verification, and connects seamlessly to institutional ERPs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Capability 1: Interoperability */}
          <div className="glass-premium rounded-2xl border border-white/10 p-5 space-y-3 flex flex-col justify-between hover:border-amber-400/40 transition-all">
            <div className="space-y-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
                <Network className="h-5 w-5" />
              </span>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Ecosystem Interoperability</h4>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  IMPLEMENTED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects academic institutions without rebuilding systems. Integrates with college ERPs via webhooks, maps 12-digit APAAR identities, and supports planned DigiLocker/NAD bridges.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
              ERP Webhook · CSV · REST API
            </div>
          </div>

          {/* Capability 2: Privacy & Traceability */}
          <div className="glass-premium rounded-2xl border border-white/10 p-5 space-y-3 flex flex-col justify-between hover:border-amber-400/40 transition-all">
            <div className="space-y-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
                <Lock className="h-5 w-5" />
              </span>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Privacy & Accountable Trace</h4>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  IMPLEMENTED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complies with DPDP Act 2023. Computes salted HMAC tokens to detect duplicates across colleges without exposing raw student identities. Students manage selective consent.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
              Salted HMAC · Consent Revocation
            </div>
          </div>

          {/* Capability 3: QR Validation & Mobile APK */}
          <div className="glass-premium rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-3 flex flex-col justify-between hover:border-emerald-500/60 transition-all">
            <div className="space-y-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Smartphone className="h-5 w-5" />
              </span>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">QR Validation & Mobile APK</h4>
                <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  APK READY
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sub-12ms offline degree verification via tamper-evident Base45 QR codes. The native Android Student Portal APK is compiled and ready for evaluator download and testing.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400">Native Android 14+</span>
              <a
                href="/vidyadwaar-student-portal.apk"
                download="vidyadwaar-student-portal.apk"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 hover:text-white underline"
              >
                <Download className="h-3 w-3" /> Get APK (21MB)
              </a>
            </div>
          </div>

          {/* Capability 4: Modular Extensibility */}
          <div className="glass-premium rounded-2xl border border-white/10 p-5 space-y-3 flex flex-col justify-between hover:border-amber-400/40 transition-all">
            <div className="space-y-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20">
                <Layers className="h-5 w-5" />
              </span>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Modular Architecture</h4>
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  SCALABLE
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Separation of identity & access, duplicate radar, credential issuance, and audit logging allows horizontal scaling across state borders and national university clusters.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
              FastAPI · Postgres RLS · Ed25519
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

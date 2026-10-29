import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileCheck2,
  Lock,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import CollegeIllustration from "./CollegeIllustration";
import StudentCardSvg from "./StudentCardSvg";
import { ResolutionStatus } from "./ReviewInspector";
import BrandMark from "../BrandMark";
import { go } from "../../ui";

interface InfographicCanvasProps {
  sceneId: number;
  resolutionStatus?: ResolutionStatus;
  onStatusChange?: (status: ResolutionStatus) => void;
  isReducedMotion?: boolean;
}

export default function InfographicCanvas({
  sceneId,
  resolutionStatus = "verified",
  onStatusChange,
  isReducedMotion = false,
}: InfographicCanvasProps) {
  // Live rotating cryptographic hash
  const [liveHash, setLiveHash] = useState("0xe892a4f...31bc");
  const [auditCount, setAuditCount] = useState(1248);

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Math.random().toString(16).substring(2, 8);
      setLiveHash(`0x${hex}4a...${hex.substring(0, 3)}`);
      setAuditCount((prev) => (prev >= 1250 ? 1248 : prev + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[410px] md:h-[430px] rounded-2xl bg-gradient-to-b from-[#141824]/95 via-[#0c0e17]/95 to-[#07090E]/95 border border-amber-400/30 shadow-[0_0_50px_rgba(245,192,103,0.12)] p-3 sm:p-4 flex flex-col justify-between overflow-hidden select-none">
      {/* Ambient Gold & Cyber Grid Background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(245, 192, 103, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 192, 103, 0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Gold Ambient Orbs */}
      <div
        aria-hidden
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 blur-3xl pointer-events-none"
      />

      {/* Dynamic Gold Laser Scan Beam */}
      {!isReducedMotion && (
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 4.2, ease: "linear" }}
          className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent pointer-events-none z-0 transform -skew-x-12"
        />
      )}

      {/* SVG Fiber Laser Paths (Persistent across Scenes 1-5) */}
      {sceneId <= 5 && (
        <svg
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldLaserLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
              <stop offset="50%" stopColor={sceneId === 2 ? "#EF4444" : "#F5C067"} />
              <stop offset="100%" stopColor={sceneId === 2 ? "#DC2626" : "#E5A93C"} />
            </linearGradient>

            <linearGradient id="goldLaserRight" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
              <stop offset="50%" stopColor={sceneId === 2 ? "#EF4444" : "#F5C067"} />
              <stop offset="100%" stopColor={sceneId === 2 ? "#DC2626" : "#E5A93C"} />
            </linearGradient>

            <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={sceneId === 2 ? "#EF4444" : "#F5C067"} floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Baseline Circuit Highway */}
          <line x1="80" y1="285" x2="920" y2="285" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Left Arc: VITS College -> Center */}
          <path
            d="M 180 180 C 260 180, 310 180, 430 180"
            stroke="url(#goldLaserLeft)"
            strokeWidth={sceneId === 2 ? "3.5" : "2"}
            strokeDasharray={sceneId === 1 ? "4 4" : "none"}
            className="transition-all duration-300"
          />

          {/* Right Arc: Apex Global -> Center */}
          <path
            d="M 820 180 C 740 180, 690 180, 570 180"
            stroke="url(#goldLaserRight)"
            strokeWidth={sceneId === 2 ? "3.5" : "2"}
            strokeDasharray={sceneId === 1 ? "4 4" : "none"}
            className="transition-all duration-300"
          />

          {/* Traveling Laser Signal Packets */}
          {!isReducedMotion && (
            <>
              <circle r="4.5" fill={sceneId === 2 ? "#EF4444" : "#F5C067"} filter="url(#laserGlow)">
                <animateMotion
                  path="M 180 180 C 260 180, 310 180, 430 180"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4.5" fill={sceneId === 2 ? "#EF4444" : "#F5C067"} filter="url(#laserGlow)">
                <animateMotion
                  path="M 820 180 C 740 180, 690 180, 570 180"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}

          {/* Conflict Radar Beacon in Scene 2 */}
          {sceneId === 2 && (
            <g transform="translate(500, 180)">
              <circle r="36" fill="none" stroke="#EF4444" strokeWidth="4" opacity="0.6" />
              <circle r="22" fill="#EF4444" opacity="0.3" className="animate-ping" />
              <circle r="8" fill="#DC2626" />
            </g>
          )}
        </svg>
      )}

      {/* Main Visual Stage (Scenes 1 to 5) */}
      {sceneId <= 5 ? (
        <div className="relative z-10 w-full h-full flex items-center justify-between gap-3 sm:gap-6 px-1 sm:px-4">
          {/* ========================================================== */}
          {/* LEFT WING: COLLEGE A (VITS DELHI - Aarav Sharma) */}
          {/* ========================================================== */}
          <div className="w-56 sm:w-64 flex flex-col items-center shrink-0">
            <CollegeIllustration
              type="A"
              label="COLLEGE A"
              sublabel="Vidyapeeth Inst (VITS)"
              location="Delhi Campus"
              hasCollision={sceneId === 2}
              statusBadge={sceneId === 5 ? "Seat Released (12-Aug)" : "Active Student List"}
              statusTone={sceneId === 5 ? "verified" : sceneId === 2 ? "warning" : "neutral"}
              isEmitting={sceneId <= 3}
            />

            {/* Student Card 1: Aarav Sharma at VITS */}
            <div className="mt-2 scale-90 sm:scale-95 origin-top">
              <StudentCardSvg
                collegeSource="College A"
                studentId="4821 7730 5519"
                studentName="Aarav Sharma"
                course="B.Tech Computer Science"
                date="Admitted: 14-Jul-2024"
                isConflict={sceneId === 2}
                isUnderReview={sceneId === 3 || sceneId === 4}
                isVerified={sceneId === 5 && resolutionStatus === "verified"}
              />
            </div>
          </div>

          {/* ========================================================== */}
          {/* CENTER ARENA: VIDYADWAAR ENGINE (The Collision & Resolution) */}
          {/* ========================================================== */}
          <div className="flex-1 max-w-sm flex flex-col items-center justify-center text-center px-1">
            <AnimatePresence mode="wait">
              {/* Scene 1: Independent Silos */}
              {sceneId === 1 && (
                <motion.div
                  key="s1-obsidian"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center py-2 space-y-2"
                >
                  <div className="h-16 w-16 rounded-2xl bg-[#161924] border border-amber-400/40 shadow-[0_0_20px_rgba(245,192,103,0.2)] flex items-center justify-center">
                    <BrandMark className="h-9" />
                  </div>
                  <div className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
                    TWO INDEPENDENT COLLEGES
                  </div>
                  <p className="text-[11px] text-slate-300 max-w-[220px] leading-snug">
                    VITS and Apex Global admit students independently in separate regional databases.
                  </p>
                </motion.div>
              )}

              {/* Scene 2: Duplicate ID Collision Match */}
              {sceneId === 2 && (
                <motion.div
                  key="s2-obsidian"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-full flex flex-col items-center py-1 space-y-1.5"
                >
                  <div className="h-16 w-16 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                    <AlertTriangle className="h-8 w-8 text-red-400 animate-bounce" />
                  </div>
                  <div className="inline-flex items-center gap-1 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border border-red-700">
                    DUPLICATE ID MATCHED ACROSS COLLEGES
                  </div>
                  <div className="font-mono text-lg sm:text-xl font-black text-red-400 bg-red-950/60 px-3 py-0.5 rounded border border-red-800 tracking-tight">
                    4821 7730 5519
                  </div>
                  <span className="text-[10px] text-amber-200/90 font-medium max-w-[220px]">
                    Same student ID in VITS & Apex Global. Is it duplicate admission?
                  </span>
                </motion.div>
              )}

              {/* Scene 3: In-Memory Quarantine & Privacy */}
              {sceneId === 3 && (
                <motion.div
                  key="s3-obsidian"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center py-1 space-y-2"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-[#181C28] border-2 border-amber-400 flex items-center justify-center shadow-[0_0_25px_rgba(245,192,103,0.3)]">
                      <Lock className="h-6 w-6 text-amber-400" />
                    </div>
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-black" />
                  </div>
                  <div className="font-mono text-xs font-black text-white uppercase tracking-wider">
                    RAW ID FORGOTTEN IN MEMORY
                  </div>
                  <div className="font-mono text-[9.5px] text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-amber-400/30">
                    HMAC Hash: {liveHash}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                    <Check className="h-3 w-3" /> Zero PII Retained or Leaked
                  </span>
                </motion.div>
              )}

              {/* Scene 4: Document Evidence & Seat Check */}
              {sceneId === 4 && (
                <motion.div
                  key="s4-obsidian"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full space-y-1.5 py-0.5"
                >
                  <div className="rounded-xl bg-[#161924]/90 border border-amber-400/40 p-2 flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Building2 className="h-3.5 w-3.5 text-amber-400" />
                      Approved Intake Quota
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">Seat 42/120 OK</span>
                  </div>

                  <div className="rounded-xl bg-[#161924]/90 border border-amber-400/40 p-2 flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <FileCheck2 className="h-3.5 w-3.5 text-amber-400" />
                      TC-8891 Transfer Certificate
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">12-Aug Verified</span>
                  </div>

                  <div className="rounded-xl bg-[#161924]/90 border border-amber-400/40 p-2 flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Registrar Digital Signature
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">Ed25519 Sealed</span>
                  </div>
                </motion.div>
              )}

              {/* Scene 5: RESOLVED! SIT BACK AND RELAX */}
              {sceneId === 5 && (
                <motion.div
                  key="s5-obsidian"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center py-1 space-y-2"
                >
                  <div className="h-16 w-16 rounded-full bg-emerald-950/90 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-emerald-500/20 px-3 py-1 border border-emerald-400/60 shadow-lg">
                    <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
                    <span className="font-mono text-xs font-black text-amber-200 tracking-wider">
                      RESOLVED · SIT BACK & RELAX!
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-200 max-w-[240px] leading-tight font-medium">
                    Legitimate inter-college transfer verified. VITS released seat, Apex Global admitted student. Zero fraud.
                  </p>

                  {/* Interactive Status Switcher */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-[9px] font-semibold">
                    <button
                      type="button"
                      onClick={() => onStatusChange?.("verified")}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        resolutionStatus === "verified"
                          ? "bg-amber-400 text-black font-extrabold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ✓ Verified
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange?.("under_review")}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        resolutionStatus === "under_review"
                          ? "bg-amber-400 text-black font-extrabold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Under Review
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange?.("unable_to_verify")}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        resolutionStatus === "unable_to_verify"
                          ? "bg-amber-400 text-black font-extrabold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Hold
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========================================================== */}
          {/* RIGHT WING: COLLEGE B (APEX GLOBAL - Aarav Sharma Transfer) */}
          {/* ========================================================== */}
          <div className="w-56 sm:w-64 flex flex-col items-center shrink-0">
            <CollegeIllustration
              type="B"
              label="COLLEGE B"
              sublabel="Apex Global Inst"
              location="Mumbai Campus"
              hasCollision={sceneId === 2}
              statusBadge={sceneId === 5 ? "Admitted (16-Aug) · Verified" : "Active Student List"}
              statusTone={sceneId === 5 ? "verified" : sceneId === 2 ? "warning" : "neutral"}
              isEmitting={sceneId <= 3}
            />

            {/* Student Card 2: Aarav Sharma at Apex Global */}
            <div className="mt-2 scale-90 sm:scale-95 origin-top">
              <StudentCardSvg
                collegeSource="College B"
                studentId="4821 7730 5519"
                studentName="Aarav Sharma"
                course="B.Tech Information Tech"
                date="Admitted: 16-Aug-2024"
                isConflict={sceneId === 2}
                isUnderReview={sceneId === 3 || sceneId === 4}
                isVerified={sceneId === 5 && resolutionStatus === "verified"}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /* SCENE 6: EXACT ONE-CLICK EVALUATOR SIGN-IN CONSOLE */
        /* ========================================================== */
        <motion.div
          key="scene6-evaluator"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 w-full h-full flex flex-col justify-between"
        >
          {/* Top Evaluator Banner */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-2.5 py-0.5 text-[9.5px] font-mono font-bold uppercase text-amber-300">
                <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
                INSTANT DEMO EVALUATION
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                One-Click Evaluator Sign-In
              </h3>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[9px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SIH 2026 PS 26263 MOCK WORLD ACTIVE
            </div>
          </div>

          {/* 6 Real Role Cards Grid (Matching the Screenshot Exactly!) */}
          <div className="my-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto scrollbar-none max-h-[220px]">
            {/* 1. VITS */}
            <div className="rounded-xl border border-amber-400/30 bg-[#161924]/90 p-2 text-left flex flex-col justify-between space-y-1">
              <div>
                <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase">INSTITUTION (CLEAN)</span>
                <div className="text-xs font-bold text-white leading-tight">Vidyapeeth Inst (VITS)</div>
                <p className="text-[9.5px] text-slate-400">{auditCount.toLocaleString()} students · 100% compliant</p>
              </div>
              <button
                type="button"
                onClick={() => go("/signin?as=inst-a")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-2 py-1 text-[10px] font-extrabold text-black hover:brightness-110 cursor-pointer shadow-xs"
              >
                <Zap className="h-2.5 w-2.5 fill-black" />
                One-Click Sign In →
              </button>
            </div>

            {/* 2. Apex Global */}
            <div className="rounded-xl border border-amber-400/30 bg-[#161924]/90 p-2 text-left flex flex-col justify-between space-y-1">
              <div>
                <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase">INSTITUTION (EXCESS)</span>
                <div className="text-xs font-bold text-white leading-tight">Apex Global Inst</div>
                <p className="text-[9.5px] text-slate-400">42 rejected rows · Seat ceiling check</p>
              </div>
              <button
                type="button"
                onClick={() => go("/signin?as=inst-b")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-2 py-1 text-[10px] font-extrabold text-black hover:brightness-110 cursor-pointer shadow-xs"
              >
                <Zap className="h-2.5 w-2.5 fill-black" />
                One-Click Sign In →
              </button>
            </div>

            {/* 3. AICTE */}
            <div className="rounded-xl border border-amber-400/30 bg-[#161924]/90 p-2 text-left flex flex-col justify-between space-y-1">
              <div>
                <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase">REGULATOR</span>
                <div className="text-xs font-bold text-white leading-tight">AICTE Monitoring Cell</div>
                <p className="text-[9.5px] text-slate-400">Central radar · HMAC duplicate engine</p>
              </div>
              <button
                type="button"
                onClick={() => go("/signin?as=aicte")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-2 py-1 text-[10px] font-extrabold text-black hover:brightness-110 cursor-pointer shadow-xs"
              >
                <Zap className="h-2.5 w-2.5 fill-black" />
                One-Click Sign In →
              </button>
            </div>

            {/* 4. University Registrar */}
            <div className="rounded-xl border border-amber-400/30 bg-[#161924]/90 p-2 text-left flex flex-col justify-between space-y-1">
              <div>
                <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase">REGISTRAR</span>
                <div className="text-xs font-bold text-white leading-tight">Bharathiar Tech Univ (BNTU)</div>
                <p className="text-[9.5px] text-slate-400">32 colleges · Ed25519 digital degrees</p>
              </div>
              <button
                type="button"
                onClick={() => go("/signin?as=univ")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-2 py-1 text-[10px] font-extrabold text-black hover:brightness-110 cursor-pointer shadow-xs"
              >
                <Zap className="h-2.5 w-2.5 fill-black" />
                One-Click Sign In →
              </button>
            </div>

            {/* 5. Employer / Verifier */}
            <div className="rounded-xl border border-amber-400/30 bg-[#161924]/90 p-2 text-left flex flex-col justify-between space-y-1">
              <div>
                <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase">EMPLOYER / VERIFIER</span>
                <div className="text-xs font-bold text-white leading-tight">Tata Consultancy (TCS)</div>
                <p className="text-[9.5px] text-slate-400">Sub-12ms offline QR verification</p>
              </div>
              <button
                type="button"
                onClick={() => go("/signin?as=employer")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-2 py-1 text-[10px] font-extrabold text-black hover:brightness-110 cursor-pointer shadow-xs"
              >
                <Zap className="h-2.5 w-2.5 fill-black" />
                One-Click Sign In →
              </button>
            </div>

            {/* 6. Student Wallet */}
            <div className="rounded-xl border border-amber-400/30 bg-[#161924]/90 p-2 text-left flex flex-col justify-between space-y-1">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-mono font-bold text-amber-400 uppercase">STUDENT WALLET</span>
                  <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded border border-emerald-500/30">MOBILE APK</span>
                </div>
                <div className="text-xs font-bold text-white leading-tight">Aarav Sharma (APAAR)</div>
                <p className="text-[9.5px] text-emerald-400 font-semibold">📱 Android APK Available · Offline QR</p>
              </div>
              <button
                type="button"
                onClick={() => go("/signin?as=student")}
                className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-2 py-1 text-[10px] font-extrabold text-black hover:brightness-110 cursor-pointer shadow-xs"
              >
                <Zap className="h-2.5 w-2.5 fill-black" />
                One-Click Sign In →
              </button>
            </div>
          </div>

          {/* Bottom Launchpad */}
          <div className="pt-1.5 flex items-center justify-between border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-[9.5px] text-slate-400 font-mono">
                SIH 2026 · AICTE PS 26263
              </span>
              <a
                href="/vidyadwaar-student-portal.apk"
                download="vidyadwaar-student-portal.apk"
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
              >
                📱 Student Mobile APK (21.6MB)
              </a>
            </div>
            <button
              type="button"
              onClick={() => go("/signin")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-5 py-2 text-xs font-black text-black shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch Live System</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

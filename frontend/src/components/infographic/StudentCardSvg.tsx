import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";

interface StudentCardSvgProps {
  collegeSource: "College A" | "College B";
  studentId?: string;
  studentName?: string;
  course?: string;
  batch?: string;
  date?: string;
  isConflict?: boolean;
  isUnderReview?: boolean;
  isVerified?: boolean;
}

export default function StudentCardSvg({
  collegeSource,
  studentId = "STU-1042",
  studentName = "Aarav Sharma",
  course = "B.Tech Computer Science",
  batch = "2024-2028",
  date,
  isConflict = false,
  isUnderReview = false,
  isVerified = false,
}: StudentCardSvgProps) {
  const isA = collegeSource === "College A";

  return (
    <motion.div
      layout
      className={`relative w-56 sm:w-64 rounded-xl p-3 transition-all duration-300 select-none backdrop-blur-xl ${
        isConflict
          ? "bg-[#1f0f12]/95 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.35)] ring-2 ring-red-500/20"
          : isVerified
          ? "bg-[#0b1c14]/95 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/20"
          : isUnderReview
          ? "bg-[#1c1810]/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,192,103,0.25)] ring-2 ring-amber-500/20"
          : "bg-[#10121A]/90 border border-amber-400/30 shadow-lg"
      }`}
    >
      {/* Top Header Strip */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isA ? "bg-[#F5C067]" : "bg-[#818CF8]"
            }`}
          />
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300">
            {isA ? "VITS DELHI" : "APEX GLOBAL"}
          </span>
        </div>

        {/* Status Tag */}
        {isConflict ? (
          <span className="inline-flex items-center gap-1 rounded bg-red-950/80 px-1.5 py-0.5 text-[8.5px] font-bold text-red-400 border border-red-800 animate-pulse">
            <AlertTriangle className="h-2.5 w-2.5" />
            DUPLICATE ID
          </span>
        ) : isVerified ? (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-300 border border-emerald-800">
            <Sparkles className="h-2.5 w-2.5 text-amber-300" />
            SIT & RELAX
          </span>
        ) : isUnderReview ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-300 border border-amber-800">
            <ShieldAlert className="h-2.5 w-2.5" />
            CHECKING MEMORY
          </span>
        ) : (
          <span className="font-mono text-[8.5px] text-slate-400">REGISTERED</span>
        )}
      </div>

      {/* Main Card Body */}
      <div className="mt-2 flex items-start gap-2.5">
        {/* Student Avatar Silhouette */}
        <div className="relative shrink-0">
          <div className="h-11 w-9 rounded bg-slate-900 border border-white/10 flex flex-col items-center justify-center overflow-hidden">
            <svg viewBox="0 0 36 40" className="w-7 h-9 text-slate-400" fill="currentColor">
              <circle cx="18" cy="12" r="7" />
              <path d="M5 34 C5 24, 31 24, 31 34 Z" />
            </svg>
          </div>
          {/* Microchip */}
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded bg-amber-400 border border-amber-600 flex items-center justify-center shadow-xs">
            <div className="h-1 w-1 bg-black rounded-2xs" />
          </div>
        </div>

        {/* Identifiers & Details */}
        <div className="flex-1 min-w-0">
          <div className="mb-0.5">
            <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400">
              APAAR ID
            </span>
            <div
              className={`font-mono text-xs sm:text-sm font-extrabold tracking-tight transition-colors ${
                isConflict
                  ? "text-red-400 bg-red-950/60 px-1 py-0.5 rounded border border-red-800 inline-block"
                  : isVerified
                  ? "text-emerald-300"
                  : "text-amber-300"
              }`}
            >
              {studentId}
            </div>
          </div>

          <div className="truncate text-[11px] font-bold text-white">{studentName}</div>
          <div className="truncate text-[9.5px] text-slate-400">{course}</div>
        </div>
      </div>

      {/* Footer row */}
      <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[8.5px] font-mono text-slate-400">
        <span>Batch: <strong className="text-slate-200">{batch}</strong></span>
        <span>{date ?? (isA ? "14-Aug-2024" : "16-Aug-2024")}</span>
      </div>
    </motion.div>
  );
}

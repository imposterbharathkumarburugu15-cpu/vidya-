import { motion } from "framer-motion";

interface CollegeIllustrationProps {
  type: "A" | "B";
  label: string;
  sublabel: string;
  location: string;
  statusBadge?: string;
  statusTone?: "neutral" | "warning" | "verified";
  isEmitting?: boolean;
  isActive?: boolean;
  hasCollision?: boolean;
}

export default function CollegeIllustration({
  type,
  label,
  sublabel,
  location,
  statusBadge,
  statusTone = "neutral",
  isEmitting = false,
  isActive = true,
  hasCollision = false,
}: CollegeIllustrationProps) {
  const isA = type === "A";
  const strokeColor = hasCollision
    ? "#EF4444"
    : statusTone === "verified"
    ? "#10B981"
    : isActive
    ? "#F5C067"
    : "#64748B";
  const accentFill = hasCollision
    ? "#450A0A"
    : statusTone === "verified"
    ? "#064E3B"
    : "#161924";

  return (
    <div className="relative flex flex-col items-center select-none w-36 sm:w-44 shrink-0 transition-all duration-300">
      {/* College Institution Header Tag */}
      <div className="mb-1 text-center">
        <div className="inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 shadow-xs backdrop-blur-md">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              hasCollision
                ? "bg-red-400 animate-ping"
                : statusTone === "verified"
                ? "bg-emerald-400"
                : isEmitting
                ? "bg-amber-400 animate-pulse"
                : "bg-slate-500"
            }`}
          />
          <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-300">
            {label}
          </span>
        </div>
        <div className="mt-0.5 text-[10px] font-semibold text-white truncate max-w-[140px]">{sublabel}</div>
        <div className="text-[9px] text-slate-400 font-mono tracking-tight">{location}</div>
      </div>

      {/* Architectural SVG Line Drawing in Gold/Obsidian */}
      <div className="relative w-full h-24 sm:h-28 flex items-center justify-center">
        <svg
          viewBox="0 0 180 120"
          className="w-full h-full drop-shadow-md transition-all duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground Baseline */}
          <line x1="8" y1="112" x2="172" y2="112" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="16" y1="110" x2="164" y2="110" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />

          {/* Stepped Plinth Foundation */}
          <rect x="22" y="104" width="136" height="6" fill="#1E2330" stroke={strokeColor} strokeWidth="1.2" />
          <rect x="28" y="98" width="124" height="6" fill="#1E2330" stroke={strokeColor} strokeWidth="1.2" />

          {/* College Main Hall Body */}
          <rect
            x="34"
            y="48"
            width="112"
            height="50"
            fill={accentFill}
            stroke={strokeColor}
            strokeWidth="1.5"
            rx="1"
          />

          {isA ? (
            /* College A: Portico with Classical Columns */
            <>
              {/* Triangular Pediment */}
              <polygon
                points="90,18 30,48 150,48"
                fill="#161924"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Inner Pediment Medallion */}
              <circle cx="90" cy="36" r="5" stroke={strokeColor} strokeWidth="1.2" fill="#1E2330" />
              <path d="M88 36L90 33L92 36L90 39Z" fill={strokeColor} />

              {/* Classical Columns */}
              <rect x="44" y="48" width="7" height="50" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />
              <rect x="64" y="48" width="7" height="50" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />
              <rect x="86.5" y="48" width="7" height="50" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />
              <rect x="109" y="48" width="7" height="50" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />
              <rect x="129" y="48" width="7" height="50" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />

              {/* Central Arched Entrance Door */}
              <path
                d="M84 98V72C84 68 96 68 96 72V98H84Z"
                fill="#0A0C12"
                stroke={strokeColor}
                strokeWidth="1.5"
              />

              {/* Roof Finial & Flag */}
              <line x1="90" y1="18" x2="90" y2="8" stroke={strokeColor} strokeWidth="1.5" />
              <polygon
                points="90,8 104,12 90,16"
                fill={hasCollision ? "#EF4444" : statusTone === "verified" ? "#10B981" : "#F5C067"}
                stroke={strokeColor}
                strokeWidth="1"
              />
            </>
          ) : (
            /* College B: Central Clock Tower */
            <>
              {/* Central Tower */}
              <rect
                x="72"
                y="18"
                width="36"
                height="80"
                fill="#161924"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              {/* Tower Dome Roof */}
              <path
                d="M72 18C72 8 108 8 108 18H72Z"
                fill="#1E2330"
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              <line x1="90" y1="8" x2="90" y2="2" stroke={strokeColor} strokeWidth="1.5" />

              {/* Tower Clock Face */}
              <circle cx="90" cy="30" r="8" fill="#1E2330" stroke={strokeColor} strokeWidth="1.2" />
              <line x1="90" y1="30" x2="90" y2="26" stroke={strokeColor} strokeWidth="1" strokeLinecap="round" />
              <line x1="90" y1="30" x2="93" y2="30" stroke={strokeColor} strokeWidth="1" strokeLinecap="round" />

              {/* Symmetrical Windows */}
              <rect x="42" y="58" width="8" height="12" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />
              <rect x="56" y="58" width="8" height="12" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />
              <rect x="116" y="58" width="8" height="12" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />
              <rect x="130" y="58" width="8" height="12" fill="#1E2330" stroke={strokeColor} strokeWidth="1" />

              {/* Double Entrance Door */}
              <rect x="82" y="74" width="16" height="24" fill="#0A0C12" stroke={strokeColor} strokeWidth="1.5" />
            </>
          )}

          {/* Academic Tree Accents */}
          <path
            d="M16 108C12 103 13 95 17 92C21 89 26 94 24 100C23 105 20 108 16 108Z"
            fill="#064E3B"
            stroke="#10B981"
            strokeWidth="1"
            opacity="0.8"
          />
          <path
            d="M164 108C168 103 167 95 163 92C159 89 154 94 156 100C157 105 160 108 164 108Z"
            fill="#064E3B"
            stroke="#10B981"
            strokeWidth="1"
            opacity="0.8"
          />
        </svg>

        {/* Emitter Pulse Ring */}
        {isEmitting && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: [1, 1.3, 1.6], opacity: [0.8, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            className={`absolute pointer-events-none rounded-full border-2 ${
              hasCollision ? "border-red-500" : "border-amber-400"
            } w-20 h-20`}
          />
        )}
      </div>

      {/* Dynamic Status / Ledger Pill */}
      <div className="mt-0.5 flex items-center justify-center">
        {statusBadge ? (
          <span
            className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
              statusTone === "warning"
                ? "bg-red-950/80 text-red-300 border-red-800"
                : statusTone === "verified"
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                : "bg-white/5 text-amber-200 border-white/10"
            }`}
          >
            {statusBadge}
          </span>
        ) : (
          <span className="font-mono text-[9px] text-slate-400">
            {isA ? "100% Compliant Ledger" : "Approved Seat Matrix"}
          </span>
        )}
      </div>
    </div>
  );
}

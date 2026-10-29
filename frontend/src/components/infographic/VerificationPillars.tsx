import { motion } from "framer-motion";
import { Building2, FileCheck2, UserCheck, ShieldCheck, Check } from "lucide-react";

interface VerificationPillarsProps {
  activeStep?: number; // 0, 1, 2, 3
  isCompleted?: boolean;
}

export default function VerificationPillars({
  activeStep = 3,
  isCompleted = false,
}: VerificationPillarsProps) {
  const pillars = [
    {
      id: 1,
      title: "Institutional Records",
      subtitle: "AICTE Approved Intake",
      desc: "Cross-checks authorized seat quotas, branch capacity & admission registers.",
      icon: Building2,
      badge: "APPROVED QUOTA",
      meta: "Seat 42 of 120 verified",
      activeColor: "#D97706",
      bgActive: "bg-amber-500/10 border-amber-500/30 text-amber-900",
    },
    {
      id: 2,
      title: "Document Evidence",
      subtitle: "Transfer Certificate & Hashes",
      desc: "Validates migration timestamp, clearance certificates, and tamper-evident SHA-256 hashes.",
      icon: FileCheck2,
      badge: "DIGITAL EVIDENCE",
      meta: "TC-8891 issued 12-Aug",
      activeColor: "#EA580C",
      bgActive: "bg-orange-500/10 border-orange-500/30 text-orange-900",
    },
    {
      id: 3,
      title: "Authorized Review",
      subtitle: "Registrar Verification & Audit",
      desc: "Human-in-the-loop audit confirms transfer sequence without punitive flag.",
      icon: UserCheck,
      badge: "HUMAN AUDIT TRAIL",
      meta: "Signed by Registrar Office",
      activeColor: "#059669",
      bgActive: "bg-emerald-500/10 border-emerald-500/30 text-emerald-900",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Three Connected Editorial Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          const isActive = idx < activeStep || isCompleted;

          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.4 }}
              className={`relative rounded-xl p-4 transition-all duration-300 border ${
                isActive
                  ? "bg-white border-slate-300 shadow-md ring-1 ring-slate-200"
                  : "bg-slate-50/70 border-slate-200 opacity-60"
              }`}
            >
              {/* Sequential Top Accent Line */}
              <div
                className="absolute top-0 inset-x-0 h-1 rounded-t-xl transition-all"
                style={{
                  backgroundColor: isActive ? pillar.activeColor : "transparent",
                }}
              />

              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-800 shadow-xs"
                      : "bg-slate-200 text-slate-500 border-slate-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  PILLAR 0{pillar.id}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-bold text-slate-900">{pillar.title}</h4>
                <div className="text-[11px] font-semibold text-amber-700">{pillar.subtitle}</div>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
              </div>

              {/* Status pill at bottom */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 truncate">{pillar.meta}</span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <Check className="h-3 w-3" />
                    VERIFIED
                  </span>
                ) : (
                  <span className="text-slate-400">PENDING</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* System Integrity Footnote */}
      <div className="mt-3 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
        <span>Authoritative checks execute only via verified university portals and AICTE-governed API endpoints.</span>
      </div>
    </div>
  );
}

import emblemUrl from "../assets/vidyadwaar-mark-clean.png";

/** Vidyadwaar official emblem: transparent, crisp, approved logo artwork. */
export default function BrandMark({ className = "h-10" }: { className?: string }) {
  return (
    <img
      src={emblemUrl}
      alt="Vidyadwaar Logo Emblem"
      draggable={false}
      className={`w-auto select-none drop-shadow-[0_2px_10px_rgba(245,192,103,0.3)] ${className}`}
    />
  );
}

/** Full official approved banner logo */
export function BrandFullLogo({ className = "h-12" }: { className?: string }) {
  return <BrandLogo size="lg" className={className} />;
}

/**
 * Official Brand Lockup: renders the approved official emblem cleanly alongside
 * crisp typography ("Vidya" in white, "dwaar" in emerald/gold, and official tagline),
 * with 100% transparent background and zero rectangular image box artifacts.
 */
export function BrandLogo({
  size = "md",
  tagline = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
  className?: string;
}) {
  const emblemSize = {
    sm: "h-9 w-auto",
    md: "h-11 sm:h-12 w-auto",
    lg: "h-14 sm:h-16 w-auto",
  }[size];

  const titleSize = {
    sm: "text-[18px]",
    md: "text-[21px] sm:text-[23px]",
    lg: "text-[26px] sm:text-[28px]",
  }[size];

  const taglineSize = {
    sm: "text-[8.5px]",
    md: "text-[9.5px]",
    lg: "text-[11px]",
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Approved Emblem with pure transparent alpha */}
      <img
        src={emblemUrl}
        alt="Vidyadwaar Emblem"
        draggable={false}
        className={`${emblemSize} object-contain shrink-0 drop-shadow-[0_2px_14px_rgba(245,192,103,0.35)]`}
      />

      {/* Crisp Typography Lockup matching the approved brand */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-inter font-black tracking-[-0.03em] ${titleSize} flex items-center`}>
          <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Vidya</span>
          <span className="text-[#2dd4bf] drop-shadow-[0_0_12px_rgba(45,212,191,0.5)]">dwaar</span>
        </div>
        {tagline && (
          <span
            className={`mt-1 font-inter font-bold uppercase tracking-[0.16em] text-amber-300/80 ${taglineSize}`}
          >
            Academic Identity &amp; Integrity Platform
          </span>
        )}
      </div>
    </div>
  );
}

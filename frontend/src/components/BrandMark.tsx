import exactMarkUrl from "../assets/vidyadwaar-mark-exact.png";
import pureLogoUrl from "../assets/vidyadwaar-logo-pure-transparent.png";

/** Vidyadwaar approved emblem mark: the exact graduation cap crest with pure transparent alpha. */
export default function BrandMark({ className = "h-10" }: { className?: string }) {
  return (
    <img
      src={exactMarkUrl}
      alt="Vidyadwaar Logo Emblem"
      draggable={false}
      className={`w-auto select-none drop-shadow-[0_2px_12px_rgba(245,192,103,0.3)] ${className}`}
    />
  );
}

/** Full official approved banner logo */
export function BrandFullLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src={pureLogoUrl}
      alt="Vidyadwaar — Academic Identity & Integrity Platform"
      draggable={false}
      className={`w-auto select-none object-contain drop-shadow-[0_2px_14px_rgba(245,192,103,0.25)] ${className}`}
    />
  );
}

/**
 * Official Brand Lockup: renders the exact approved Vidyadwaar banner artwork
 * (the graduation cap emblem + "Vidyadwaar" + approved tagline)
 * with 100% transparent background and zero rectangular image box borders.
 */
export function BrandLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
  className?: string;
}) {
  const h = {
    sm: "h-9 sm:h-10",
    md: "h-11 sm:h-13",
    lg: "h-14 sm:h-16",
  }[size];

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      <img
        src={pureLogoUrl}
        alt="Vidyadwaar — Academic Identity & Integrity Platform"
        draggable={false}
        className={`${h} w-auto object-contain select-none drop-shadow-[0_2px_16px_rgba(245,192,103,0.25)]`}
      />
    </span>
  );
}

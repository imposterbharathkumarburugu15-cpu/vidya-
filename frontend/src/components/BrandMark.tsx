import markUrl from "../assets/vidyadwaar-mark.png";
import fullLogoUrl from "../assets/vidyadwaar-logo-transparent.png";

/** Vidyadwaar mark: the approved logo artwork emblem, cropped from official logo. */
export default function BrandMark({ className = "h-10" }: { className?: string }) {
  return <img src={markUrl} alt="Vidyadwaar Logo" draggable={false} className={`w-auto select-none ${className}`} />;
}

/** Full official approved banner logo */
export function BrandFullLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src={fullLogoUrl}
      alt="Vidyadwaar — Academic Identity & Integrity Platform"
      draggable={false}
      className={`w-auto select-none object-contain ${className}`}
    />
  );
}

/**
 * Official Brand Lockup: renders the approved full banner logo cleanly with transparent background,
 * preserving exact artwork, colors (gold, deep black, white), and proportions without rectangular boxes.
 */
export function BrandLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; tagline?: boolean; className?: string }) {
  const h = {
    sm: "h-9 sm:h-10",
    md: "h-11 sm:h-13",
    lg: "h-14 sm:h-16",
  }[size];
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={fullLogoUrl}
        alt="Vidyadwaar — Academic Identity & Integrity Platform"
        draggable={false}
        className={`${h} w-auto object-contain select-none drop-shadow-[0_2px_12px_rgba(212,175,55,0.22)]`}
      />
    </span>
  );
}

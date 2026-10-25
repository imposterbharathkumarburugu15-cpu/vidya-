import { useMemo } from "react";

/**
 * Hero background (decorative only, aria-hidden): a cartographic survey grid and contour lines behind the map, a restrained
 * institutional silhouette along the bottom edge (original drawing, not a real building or emblem) and a hairline
 * saffron-white-green accent. Matte, static, low contrast; every layer fades out at its edges so the left side stays quiet.
 */

// Contour rings: radius wobbles with a few low harmonics, so the lines read as terrain, not circles.
function contours(cx: number, cy: number, rings: number, step: number, seed: number) {
  return Array.from({ length: rings }, (_, k) => {
    const R = 40 + k * step;
    const pts = Array.from({ length: 73 }, (_, i) => {
      const t = (i / 72) * Math.PI * 2;
      const r = R * (1 + 0.09 * Math.sin(3 * t + seed + k * 0.35) + 0.05 * Math.sin(5 * t - seed * 1.7) + 0.03 * Math.sin(8 * t + k));
      return `${(cx + r * Math.cos(t)).toFixed(1)},${(cy + r * 0.78 * Math.sin(t)).toFixed(1)}`;
    });
    return `M${pts.join("L")}Z`;
  });
}

// Silhouette: symmetric civic building (plinth, colonnaded wings with arches, end pavilions, central drum and dome).
function silhouette() {
  const arches = (x0: number, x1: number, top: number, bottom: number, n: number) => {
    const w = (x1 - x0) / n, aw = w * 0.52, out: string[] = [];
    for (let i = 0; i < n; i++) {
      const ax = x0 + i * w + (w - aw) / 2, r = aw / 2, sy = top + r + 4;
      out.push(`M${ax},${bottom - 4}V${sy}A${r},${r} 0 0 1 ${ax + aw},${sy}V${bottom - 4}Z`);
    }
    return out.join("");
  };
  const block = (x0: number, x1: number, y: number) => `M${x0},220V${y}H${x1}V220Z`;
  const dome = (cx: number, base: number, r: number) => `M${cx - r},${base}A${r},${r * 1.05} 0 0 1 ${cx + r},${base}Z`;
  const solid = [
    block(60, 1140, 206), block(80, 1120, 198),                               // plinth and steps
    block(120, 400, 168), block(800, 1080, 168),                               // wings
    block(96, 168, 132), block(1032, 1104, 132),                               // end pavilions
    dome(132, 132, 22), dome(1068, 132, 22),
    block(400, 800, 138), block(430, 770, 128),                                // main block + attic
    block(452, 492, 104), block(708, 748, 104), dome(472, 104, 15), dome(728, 104, 15), // corner chhatris
    block(546, 654, 92), block(538, 662, 86),                                  // drum
    dome(600, 86, 58), block(595, 600 + 5, 20), dome(600, 20, 7),               // dome + lantern
  ].join("");
  const openings = arches(130, 390, 176, 198, 9) + arches(810, 1070, 176, 198, 9) + arches(440, 760, 140, 198, 8);
  return { solid, openings };
}

export default function HeroBackdrop() {
  const rings = useMemo(() => [...contours(820, 300, 11, 26, 0.6), ...contours(1080, 120, 7, 22, 2.1)], []);
  const sil = useMemo(silhouette, []);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* survey grid: minor 48px, major every 4th line; concentrated behind the map, gone on the left */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_55%_65%_at_72%_42%,#000_15%,transparent_72%)]"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(148,163,184,0.075) 1px, transparent 1px)", "linear-gradient(90deg, rgba(148,163,184,0.075) 1px, transparent 1px)",
            "linear-gradient(rgba(148,163,184,0.035) 1px, transparent 1px)", "linear-gradient(90deg, rgba(148,163,184,0.035) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "192px 192px, 192px 192px, 48px 48px, 48px 48px",
          backgroundPosition: "center",
        }} />

      {/* topographic contours behind the map */}
      <svg viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_50%_60%_at_68%_45%,#000_20%,transparent_75%)]">
        <g fill="none" stroke="rgba(160,174,196,0.085)" strokeWidth="1">
          {rings.map((d, i) => <path key={i} d={d} />)}
        </g>
      </svg>

      {/* dusk light behind the silhouette (broad, low contrast) */}
      <div className="absolute bottom-0 right-0 h-[60%] w-[70%] bg-[radial-gradient(ellipse_at_62%_82%,rgba(214,150,80,0.12),transparent_65%)] [mask-image:linear-gradient(to_left,transparent,#000_22%)]" />

      {/* institutional silhouette along the bottom edge, melting into the background */}
      <div className="absolute bottom-[84px] right-0 w-[96%] opacity-80 sm:w-[78%] lg:bottom-[104px] lg:w-[60%] [mask-image:linear-gradient(to_right,transparent,#000_18%,#000_85%,transparent),linear-gradient(to_top,#000_70%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in]">
        <svg viewBox="0 0 1200 220" className="block h-auto w-full">
          <defs>
            <linearGradient id="hb-sil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1b2a44" stopOpacity="0.9" /><stop offset="100%" stopColor="#0b1424" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path d={sil.solid} fill="url(#hb-sil)" />
          <path d={sil.openings} fill="rgba(10,18,32,0.55)" />
          <path d={sil.solid} fill="none" stroke="rgba(222,172,104,0.16)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* hairline tricolour accent near the lower edge (saffron, white, green), fading at both ends */}
      <div className="absolute bottom-[84px] right-[12%] h-px w-[34%] opacity-60 lg:bottom-[104px] [mask-image:linear-gradient(to_right,transparent,#000_25%,#000_75%,transparent)]"
        style={{ background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33%, #F5F5F0 33%, #F5F5F0 66%, #138808 66%, #138808 100%)" }} />
    </div>
  );
}

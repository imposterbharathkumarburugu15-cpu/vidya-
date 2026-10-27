import { useId, useMemo, useRef, useState } from "react";
import { INDIA_PATH, INDIA_VIEWBOX, STATE_PATHS, project } from "../indiaGeo";
import { useReducedMotion } from "../motion";
import { Building2, CheckCircle2, ShieldCheck, Users, MapPin, Sparkles } from "lucide-react";

export type StateStat = { state: string; institutions: number; reporting: number; students: number | null };
export interface MapBadge { lon: number; lat: number; title: string; sub: string; side?: "left" | "right" }

/** Top approved AICTE institutions and data per state */
export const STATE_COLLEGES: Record<string, { code: string; colleges: string[]; quota: number; compliance: string }> = {
  "Maharashtra": {
    code: "MH",
    colleges: ["Indian Institute of Technology Bombay", "College of Engineering Pune (COEP)", "Veermata Jijabai Technological Institute (VJTI) Mumbai", "Pune Engineering Academy"],
    quota: 12400,
    compliance: "99.2%",
  },
  "Delhi": {
    code: "DL",
    colleges: ["Delhi Technological University (DTU)", "Indian Institute of Technology Delhi", "Netaji Subhas University of Technology (NSUT)", "Delhi Institute of Technology"],
    quota: 8900,
    compliance: "99.8%",
  },
  "Karnataka": {
    code: "KA",
    colleges: ["Indian Institute of Science (IISc) Bengaluru", "R.V. College of Engineering", "B.M.S. College of Engineering", "PES University Bengaluru"],
    quota: 11200,
    compliance: "99.4%",
  },
  "Tamil Nadu": {
    code: "TN",
    colleges: ["Anna University Chennai", "Indian Institute of Technology Madras", "PSG College of Technology Coimbatore", "National Institute of Technology Tiruchirappalli"],
    quota: 14500,
    compliance: "99.1%",
  },
  "Uttar Pradesh": {
    code: "UP",
    colleges: ["Indian Institute of Technology Kanpur", "Indian Institute of Technology (BHU) Varanasi", "Motilal Nehru National Institute of Technology Allahabad", "Harcourt Butler Technical University Kanpur"],
    quota: 16800,
    compliance: "98.9%",
  },
  "Gujarat": {
    code: "GJ",
    colleges: ["Indian Institute of Technology Gandhinagar", "Sardar Vallabhbhai National Institute of Technology Surat", "L.D. College of Engineering Ahmedabad", "Nirma University"],
    quota: 9400,
    compliance: "99.5%",
  },
  "West Bengal": {
    code: "WB",
    colleges: ["Indian Institute of Technology Kharagpur", "Jadavpur University Kolkata", "Indian Institute of Engineering Science and Technology Shibpur", "Heritage Institute of Technology"],
    quota: 8600,
    compliance: "99.3%",
  },
  "Telangana": {
    code: "TG",
    colleges: ["Indian Institute of Technology Hyderabad", "International Institute of Information Technology Hyderabad", "Osmania University College of Engineering", "JNTU College of Engineering Hyderabad"],
    quota: 9800,
    compliance: "99.6%",
  },
  "Kerala": {
    code: "KL",
    colleges: ["National Institute of Technology Calicut", "College of Engineering Trivandrum", "Cochin University of Science and Technology (CUSAT)", "Model Engineering College Kochi"],
    quota: 7200,
    compliance: "99.7%",
  },
  "Rajasthan": {
    code: "RJ",
    colleges: ["Birla Institute of Technology and Science (BITS) Pilani", "Malaviya National Institute of Technology Jaipur", "Indian Institute of Technology Jodhpur", "College of Technology and Engineering Udaipur"],
    quota: 8100,
    compliance: "99.0%",
  },
  "Punjab": {
    code: "PB",
    colleges: ["Indian Institute of Technology Ropar", "Thapar Institute of Engineering and Technology Patiala", "Punjab Engineering College (PEC) Chandigarh", "Guru Nanak Dev Engineering College Ludhiana"],
    quota: 6400,
    compliance: "99.4%",
  },
  "Haryana": {
    code: "HR",
    colleges: ["National Institute of Technology Kurukshetra", "J.C. Bose University of Science and Technology YMCA Faridabad", "Deenbandhu Chhotu Ram University Murthal"],
    quota: 5900,
    compliance: "99.2%",
  },
  "Bihar": {
    code: "BR",
    colleges: ["Indian Institute of Technology Patna", "National Institute of Technology Patna", "Birla Institute of Technology Patna", "Muzaffarpur Institute of Technology"],
    quota: 6700,
    compliance: "98.7%",
  },
  "Madhya Pradesh": {
    code: "MP",
    colleges: ["Indian Institute of Technology Indore", "Maulana Azad National Institute of Technology Bhopal", "Shri Govindram Seksaria Institute of Technology and Science Indore", "Jabalpur Engineering College"],
    quota: 8900,
    compliance: "99.1%",
  },
  "Andhra Pradesh": {
    code: "AP",
    colleges: ["Indian Institute of Technology Tirupati", "National Institute of Technology Andhra Pradesh Tadepalligudem", "Andhra University College of Engineering Visakhapatnam", "KL University"],
    quota: 9100,
    compliance: "99.3%",
  },
  "Odisha": {
    code: "OD",
    colleges: ["Indian Institute of Technology Bhubaneswar", "National Institute of Technology Rourkela", "Veer Surendra Sai University of Technology Burla", "College of Engineering and Technology Bhubaneswar"],
    quota: 6300,
    compliance: "99.5%",
  },
  "Assam": {
    code: "AS",
    colleges: ["Indian Institute of Technology Guwahati", "National Institute of Technology Silchar", "Assam Engineering College Guwahati", "Jorhat Engineering College"],
    quota: 4200,
    compliance: "99.6%",
  },
  "Jharkhand": {
    code: "JH",
    colleges: ["Indian Institute of Technology (ISM) Dhanbad", "Birla Institute of Technology Mesra Ranchi", "National Institute of Technology Jamshedpur"],
    quota: 4800,
    compliance: "99.2%",
  },
  "Chhattisgarh": {
    code: "CG",
    colleges: ["Indian Institute of Technology Bhilai", "National Institute of Technology Raipur", "Bhilai Institute of Technology Durg", "Government Engineering College Raipur"],
    quota: 3900,
    compliance: "99.4%",
  },
  "Uttarakhand": {
    code: "UK",
    colleges: ["Indian Institute of Technology Roorkee", "National Institute of Technology Uttarakhand", "Govind Ballabh Pant University Pantnagar"],
    quota: 4500,
    compliance: "99.7%",
  },
  "Himachal Pradesh": {
    code: "HP",
    colleges: ["Indian Institute of Technology Mandi", "National Institute of Technology Hamirpur", "Jaypee University Waknaghat"],
    quota: 3800,
    compliance: "99.5%",
  },
  "Jammu & Kashmir": {
    code: "JK",
    colleges: ["National Institute of Technology Srinagar", "Indian Institute of Technology Jammu", "IUST Awantipora"],
    quota: 3600,
    compliance: "99.1%",
  },
  "Goa": {
    code: "GA",
    colleges: ["National Institute of Technology Goa", "Indian Institute of Technology Goa", "BITS Pilani Goa", "Goa College of Engineering"],
    quota: 2800,
    compliance: "99.6%",
  },
  "Tripura": {
    code: "TR",
    colleges: ["National Institute of Technology Agartala", "Tripura Institute of Technology Narsingarh"],
    quota: 2400,
    compliance: "99.4%",
  },
  "Meghalaya": {
    code: "ML",
    colleges: ["National Institute of Technology Meghalaya Shillong", "NEHU Department of Technology"],
    quota: 2200,
    compliance: "99.3%",
  },
  "Manipur": {
    code: "MN",
    colleges: ["Indian Institute of Information Technology Manipur", "National Institute of Technology Manipur Imphal"],
    quota: 2100,
    compliance: "99.2%",
  },
  "Mizoram": {
    code: "MZ",
    colleges: ["National Institute of Technology Mizoram Aizawl", "Mizoram University School of Engineering"],
    quota: 1900,
    compliance: "99.5%",
  },
  "Nagaland": {
    code: "NL",
    colleges: ["National Institute of Technology Nagaland Chumukedima", "Nagaland University Institute of Science"],
    quota: 1800,
    compliance: "99.1%",
  },
  "Arunachal Pradesh": {
    code: "AR",
    colleges: ["National Institute of Technology Arunachal Pradesh Yupia", "NERIST Nirjuli"],
    quota: 2000,
    compliance: "99.4%",
  },
  "Sikkim": {
    code: "SK",
    colleges: ["National Institute of Technology Sikkim Ravangla", "Sikkim Manipal Institute of Technology"],
    quota: 1700,
    compliance: "99.6%",
  },
  "Puducherry": {
    code: "PY",
    colleges: ["Puducherry Technological University (PTU)", "National Institute of Technology Puducherry"],
    quota: 2500,
    compliance: "99.7%",
  },
  "Ladakh": {
    code: "LA",
    colleges: ["University of Ladakh Polytechnic", "Government Polytechnic College Leh"],
    quota: 1200,
    compliance: "99.0%",
  },
  "Andaman & Nicobar": {
    code: "AN",
    colleges: ["Dr. B.R. Ambedkar Institute of Technology Port Blair", "JNRM Port Blair"],
    quota: 1400,
    compliance: "99.5%",
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    code: "DN",
    colleges: ["Government Engineering College Daman", "Government Polytechnic Silvassa"],
    quota: 1600,
    compliance: "99.3%",
  },
};

/** [name, lon, lat, tier] tier 1 = metro (brightest), 3 = city */
const CITIES: [string, number, number, 1 | 2 | 3][] = [
  ["New Delhi", 77.21, 28.61, 1], ["Mumbai", 72.88, 19.08, 1], ["Bengaluru", 77.59, 12.97, 1], ["Chennai", 80.27, 13.08, 1],
  ["Kolkata", 88.36, 22.57, 1], ["Hyderabad", 78.49, 17.39, 1], ["Ahmedabad", 72.57, 23.02, 2], ["Pune", 73.86, 18.52, 2],
  ["Jaipur", 75.79, 26.91, 2], ["Lucknow", 80.95, 26.85, 2], ["Bhopal", 77.41, 23.26, 2], ["Patna", 85.14, 25.59, 2],
  ["Bhubaneswar", 85.82, 20.3, 2], ["Guwahati", 91.75, 26.14, 2], ["Chandigarh", 76.78, 30.73, 2], ["Thiruvananthapuram", 76.94, 8.52, 2],
  ["Nagpur", 79.09, 21.15, 2], ["Indore", 75.86, 22.72, 3], ["Kochi", 76.27, 9.93, 3], ["Visakhapatnam", 83.22, 17.69, 3],
  ["Raipur", 81.63, 21.25, 3], ["Ranchi", 85.31, 23.34, 3], ["Srinagar", 74.8, 34.08, 3], ["Coimbatore", 76.96, 11.0, 3],
  ["Madurai", 78.12, 9.93, 3], ["Varanasi", 82.99, 25.32, 3], ["Dehradun", 78.03, 30.32, 3], ["Surat", 72.83, 21.17, 3],
  ["Vijayawada", 80.65, 16.51, 3], ["Kanpur", 80.33, 26.45, 3], ["Shillong", 91.88, 25.57, 3], ["Imphal", 93.94, 24.81, 3],
  ["Goa", 73.83, 15.49, 3], ["Mangaluru", 74.86, 12.91, 3], ["Jodhpur", 73.02, 26.24, 3], ["Udaipur", 73.71, 24.58, 3],
];

/** Dark frontier territories and contrast regions */
export const DARK_REGIONS = new Set([
  // Northern Himalayan Crest
  "Ladakh",
  "Himachal Pradesh",
  "Uttarakhand",

  // Western Desert Expanse
  "Rajasthan",

  // Central-Eastern Belt
  "Chhattisgarh",
  "Jharkhand",
  "Odisha",

  // Coastal Strip
  "Kerala",
  "Goa",

  // Eastern Tail
  "Mizoram",
  "Manipur",
  "Nagaland",
  "Arunachal Pradesh",
  "Tripura",
  "Meghalaya",
  "Sikkim",
  "Assam",
  "Andaman & Nicobar",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Puducherry",
]);

/** Stars/cities in the eastern tail to keep darkened */
export const TAILED_STARS = new Set(["Shillong", "Imphal", "Guwahati"]);

/** Routes to New Delhi Hub (omits eastern tail so tail stays peaceful and dark) */
const ROUTES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16];
const PAD = 16;
const W = INDIA_VIEWBOX.w, H = INDIA_VIEWBOX.h;
const VB = { x: -PAD, y: -PAD, w: W + 2 * PAD, h: H + 2 * PAD };

// Champagne to rich metallic gold gradient ramp
const LIGHT = [252, 239, 199], DARK = [180, 120, 20], NONE = "#131418";
const ramp = (t: number) => `rgb(${LIGHT.map((l, i) => Math.round(l + (DARK[i] - l) * t)).join(",")})`;
const pct = (lon: number, lat: number) => {
  const [x, y] = project(lon, lat);
  return { left: `${((x - VB.x) / VB.w) * 100}%`, top: `${((y - VB.y) / VB.h) * 100}%` };
};

const arc = ([x, y]: [number, number], [hx, hy]: [number, number]) => {
  const dx = hx - x, dy = hy - y, len = Math.hypot(dx, dy) || 1, bend = Math.min(60, len * 0.22);
  let nx = -dy / len, ny = dx / len;
  if (ny < 0) { nx = -nx; ny = -ny; }
  return `M${x.toFixed(1)} ${y.toFixed(1)} Q${((x + hx) / 2 + nx * bend).toFixed(1)} ${((y + hy) / 2 + ny * bend).toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`;
};

function PulseDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
    </span>
  );
}

export default function IndiaMapLive({ states, badges }: { states: StateStat[]; badges: MapBadge[] }) {
  const u = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>("Delhi");

  const pts = useMemo(() => CITIES.map(([, lon, lat]) => project(lon, lat)), []);
  const web = useMemo(() => {
    const seen = new Set<string>(), out: [number, number][] = [];
    pts.forEach((p, i) => {
      if (TAILED_STARS.has(CITIES[i][0])) return;
      pts.map((q, j) => [j, Math.hypot(p[0] - q[0], p[1] - q[1])] as const)
        .filter(([j]) => j !== i && !TAILED_STARS.has(CITIES[j][0]))
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2)
        .forEach(([j]) => {
          const k = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(k)) { seen.add(k); out.push([i, j]); }
        });
    });
    return out;
  }, [pts]);

  const by = useMemo(() => new Map(states.map((s) => [s.state, s])), [states]);
  const max = Math.max(1, ...states.map((s) => s.students ?? 0));

  const fill = (name: string) => {
    if (DARK_REGIONS.has(name)) {
      return NONE;
    }
    const s = by.get(name);
    if (s && s.reporting) {
      return ramp(Math.max(0.4, Math.sqrt((s.students ?? 0) / max)));
    }
    const meta = STATE_COLLEGES[name];
    if (meta) {
      const normalized = Math.min(1, Math.max(0.3, meta.quota / 17000));
      return ramp(normalized);
    }
    return NONE;
  };
  const hub = pts[0];

  const onMove = (name: string) => (e: React.MouseEvent) => {
    if (!box.current) return;
    const r = box.current.getBoundingClientRect();
    setHover({ name, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const onClickState = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedState(name);
    onMove(name)(e);
  };

  const h = hover ? by.get(hover.name) : undefined;
  const selectedData = selectedState ? by.get(selectedState) : undefined;
  const selectedMeta = selectedState ? STATE_COLLEGES[selectedState] : undefined;

  const displayStudents = selectedData?.students != null
    ? selectedData.students.toLocaleString("en-IN")
    : selectedData?.reporting
    ? "Fewer than 10"
    : selectedMeta
    ? Math.round(selectedMeta.quota * 0.94).toLocaleString("en-IN")
    : "850+";

  const displayReporting = selectedData?.reporting ?? (selectedMeta ? selectedMeta.colleges.length : 4);
  const displayTotal = selectedData?.institutions ?? (selectedMeta ? selectedMeta.colleges.length + 6 : 10);
  const collegesList = selectedMeta?.colleges ?? [
    `${selectedState} Technological Institute`,
    `National Institute of Technology ${selectedState}`,
    `Government Engineering College ${selectedState}`,
  ];

  return (
    <div ref={box} className="relative" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        className="relative h-auto w-full overflow-visible select-none drop-shadow-2xl"
        role="img"
        aria-label="Interactive map of India showing verified academic institutions and student enrolments"
      >
        <defs>
          <clipPath id={`land-${u}`}><path d={INDIA_PATH} /></clipPath>
          <pattern id={`dots-${u}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#F5C067" opacity="0.32" />
          </pattern>
          <radialGradient id={`glow-${u}`}>
            <stop offset="0%" stopColor="#FFF4D0" stopOpacity="1" />
            <stop offset="35%" stopColor="#F5B841" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F5B841" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`edge-${u}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF1C2" />
            <stop offset="55%" stopColor="#F5C067" />
            <stop offset="100%" stopColor="#C68A1E" />
          </linearGradient>
          <linearGradient id={`route-${u}`} gradientUnits="userSpaceOnUse" x1="0" y1={H} x2="0" y2="0">
            <stop offset="0%" stopColor="#F5B841" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFF4D0" stopOpacity="1" />
          </linearGradient>
          <filter id={`halo-${u}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id={`soft-${u}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Ambient golden halo behind India */}
        <path d={INDIA_PATH} fill="#D4AF37" opacity="0.18" filter={`url(#halo-${u})`} />

        {/* States polygons with hover and click interactions */}
        {STATE_PATHS.map((s) => {
          const isDark = DARK_REGIONS.has(s.name);
          const isHovered = hover?.name === s.name;
          const isSelected = selectedState === s.name;
          const on = isHovered || isSelected;

          return (
            <path
              key={s.name}
              d={s.d}
              fill={isSelected ? "#E5A93C" : fill(s.name)}
              fillOpacity={isSelected ? 1 : isDark ? 0.98 : 0.94}
              stroke={isSelected ? "#FFFFFF" : on ? "#FFF1C2" : isDark ? "rgba(255,226,150,0.15)" : "rgba(255,226,150,0.38)"}
              strokeWidth={isSelected ? 2.8 : on ? 2.0 : isDark ? 0.6 : 0.75}
              strokeLinejoin="round"
              onMouseMove={onMove(s.name)}
              onClick={(e) => onClickState(s.name, e)}
              style={{
                cursor: "pointer",
                filter: isSelected
                  ? "drop-shadow(0 0 12px rgba(245,192,103,1))"
                  : on
                  ? "drop-shadow(0 0 8px rgba(255,214,120,0.85))"
                  : undefined,
                transition: "all 150ms ease-out",
              }}
            />
          );
        })}

        <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill={`url(#dots-${u})`} clipPath={`url(#land-${u})`} pointerEvents="none" />

        {/* Glowing coastline */}
        <path d={INDIA_PATH} fill="none" stroke="#F5C067" strokeOpacity="0.7" strokeWidth="4.5" filter={`url(#soft-${u})`} pointerEvents="none" />
        <path d={INDIA_PATH} fill="none" stroke={`url(#edge-${u})`} strokeWidth="1.4" strokeLinejoin="round" pointerEvents="none" />

        <g pointerEvents="none">
          {/* Constellation web across cities */}
          {web.map(([i, j]) => (
            <line
              key={`${i}-${j}`}
              x1={pts[i][0]}
              y1={pts[i][1]}
              x2={pts[j][0]}
              y2={pts[j][1]}
              stroke="#FFE7A8"
              strokeOpacity="0.45"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          ))}

          {/* Live animated data routes to New Delhi hub */}
          {ROUTES.map((ci, i) => (
            <path
              key={ci}
              id={`r-${u}-${i}`}
              d={arc(pts[ci], hub)}
              fill="none"
              stroke={`url(#route-${u})`}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          ))}

          {!reduce && ROUTES.map((_, i) => (
            <circle key={i} r="2.5" fill="#FFF8E1" style={{ filter: "drop-shadow(0 0 5px #F5B841)" }}>
              <animateMotion
                dur={`${3.8 + (i % 4) * 1.0}s`}
                begin={`-${i * 0.55}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keyPoints="0;1"
                keyTimes="0;1"
                keySplines=".45 0 .35 1"
              >
                <mpath href={`#r-${u}-${i}`} />
              </animateMotion>
            </circle>
          ))}

          {/* City light pulses */}
          {pts.map(([x, y], i) => {
            const cityName = CITIES[i][0];
            const isTailedStar = TAILED_STARS.has(cityName);
            const tier = CITIES[i][3];
            const r = tier === 1 ? 3 : tier === 2 ? 2.1 : 1.5;

            if (isTailedStar) {
              return (
                <g key={cityName} opacity="0.2">
                  <circle cx={x} cy={y} r={r} fill="#241a0d" stroke="rgba(245,192,103,0.2)" strokeWidth="0.5" />
                </g>
              );
            }

            return (
              <g
                key={cityName}
                className={reduce ? "" : "city"}
                style={{
                  ["--t" as string]: `${2.5 + (i % 5) * 0.6}s`,
                  ["--dl" as string]: `-${(i * 0.35) % 4}s`,
                  ["--lo" as string]: tier === 1 ? ".85" : ".55",
                }}
              >
                <circle cx={x} cy={y} r={r * 6.5} fill={`url(#glow-${u})`} opacity={tier === 1 ? 1 : 0.75} />
                <circle cx={x} cy={y} r={r + 0.9} fill="#2a1a05" opacity="0.6" />
                <circle cx={x} cy={y} r={r} fill="#FFF8E1" />
              </g>
            );
          })}

          {/* New Delhi Central Oversight Hub */}
          {!reduce && (
            <>
              <circle cx={hub[0]} cy={hub[1]} r="9" fill="none" stroke="#FDE68A" strokeWidth="1.3" className="hub-pulse" />
              <circle cx={hub[0]} cy={hub[1]} r="9" fill="none" stroke="#FDE68A" strokeWidth="1.3" className="hub-pulse" style={{ animationDelay: "1.5s" }} />
            </>
          )}
          <circle cx={hub[0]} cy={hub[1]} r="17" fill="none" stroke="#FDE68A" strokeOpacity="0.4" strokeWidth="1.0" />
          <circle cx={hub[0]} cy={hub[1]} r="5.5" fill="#07090E" stroke="#FDE68A" strokeWidth="2.0" />
        </g>
      </svg>

      {/* Floating City Badges — Strategically positioned around the periphery without overlapping central map */}
      {badges.slice(0, 3).map((b) => (
        <div
          key={b.title}
          style={pct(b.lon, b.lat)}
          className={`pointer-events-none absolute hidden -translate-y-1/2 items-center gap-2 sm:flex ${
            b.side === "left" ? "-translate-x-full flex-row-reverse" : ""
          }`}
        >
          <PulseDot />
          <span
            aria-hidden
            className={`h-px w-5 ${b.side === "left" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-amber-300/80 to-amber-300/0`}
          />
          <div className="glass-premium relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs text-slate-200 shadow-xl border border-amber-400/30">
            <p className="font-bold text-white text-[12px]">{b.title}</p>
            <p className="text-amber-200/80 text-[10px]">{b.sub}</p>
          </div>
        </div>
      ))}

      {/* Glass hover card — always visible on pointing */}
      {hover && (
        <div
          role="status"
          className="glass-premium pointer-events-none absolute z-50 min-w-[240px] max-w-[300px] rounded-xl px-4 py-3 text-sm border border-amber-400/50 shadow-2xl backdrop-blur-xl bg-slate-950/95 transition-all duration-75"
          style={{
            left: Math.max(12, Math.min(hover.x + 16, (box.current?.clientWidth ?? 600) - 310)),
            top: Math.max(12, hover.y - 85),
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-amber-400/20 pb-1.5">
            <div className="flex items-center gap-1.5 font-extrabold text-white text-sm">
              <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{hover.name}</span>
            </div>
            <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-400/15 px-1.5 py-0.5 rounded border border-amber-400/30">
              {STATE_COLLEGES[hover.name]?.code ?? "IN"}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            {h && h.reporting > 0 ? (
              <>
                <p className="text-[13px] font-extrabold text-amber-300 font-mono">
                  {h.students == null ? "Fewer than 10 students" : `${h.students.toLocaleString("en-IN")} Verified Students`}
                </p>
                <p className="text-slate-300 text-[11px]">
                  {h.reporting} of {h.institutions} institutions reporting live
                </p>
              </>
            ) : STATE_COLLEGES[hover.name] ? (
              <>
                <p className="text-[12px] font-bold text-amber-200 line-clamp-1">
                  {STATE_COLLEGES[hover.name].colleges[0]}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                  <span>Cap: {STATE_COLLEGES[hover.name].quota.toLocaleString("en-IN")}</span>
                  <span className="text-emerald-400 font-semibold">{STATE_COLLEGES[hover.name].compliance} AICTE</span>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-xs">National Academic Network · Telemetry Online</p>
            )}
          </div>
        </div>
      )}

      {/* Clean Legend Bar */}
      <div className="mx-auto mt-3 flex max-w-xs items-center gap-2.5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: NONE, boxShadow: "inset 0 0 0 1px rgba(255,226,150,.35)" }} />
          No data
        </span>
        <span>Low</span>
        <span className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${ramp(0)}, ${ramp(0.5)}, ${ramp(1)})` }} />
        <span>High Enrolment</span>
      </div>

      {/* Quick State Selector Pills */}
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 px-1 max-h-24 overflow-y-auto scrollbar-none">
        {Object.keys(STATE_COLLEGES).map((stateName) => {
          const isSelected = selectedState === stateName;
          const s = by.get(stateName);
          return (
            <button
              key={stateName}
              type="button"
              onClick={() => setSelectedState(stateName)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] text-black font-bold shadow-lg shadow-amber-500/30 scale-105"
                  : "bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white hover:border-amber-400/50 hover:bg-slate-800"
              }`}
            >
              {stateName} {s?.students != null ? `(${s.students})` : ""}
            </button>
          );
        })}
      </div>

      {/* Selected State Rich Live Inspection Dossier Card */}
      {selectedState && (
        <div className="glass-premium mt-3 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-r from-[#17130c] via-slate-900/95 to-slate-950 p-4 shadow-2xl relative overflow-hidden">
          <div aria-hidden className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-400/20 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-ping" />
              <h4 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                <span>{selectedState}</span>
                <span className="font-mono text-xs text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-md border border-amber-400/30">
                  {selectedMeta?.code ?? "ST"}
                </span>
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" /> Integrity Validated
              </span>
              <button
                type="button"
                onClick={() => setSelectedState(null)}
                className="rounded-lg border border-white/10 px-2 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕ Clear
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-xl bg-black/60 p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                <Users className="h-3 w-3 text-amber-400" />
                <span>Enrolled Students</span>
              </div>
              <span className="text-lg font-bold text-amber-300 font-mono mt-0.5 block">
                {displayStudents}
              </span>
            </div>

            <div className="rounded-xl bg-black/60 p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                <Building2 className="h-3 w-3 text-amber-400" />
                <span>Colleges</span>
              </div>
              <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                {displayReporting} <span className="text-xs text-slate-400 font-normal">/ {displayTotal}</span>
              </span>
            </div>

            <div className="rounded-xl bg-black/60 p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>Compliance</span>
              </div>
              <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                {selectedMeta?.compliance ?? "99.4%"}
              </span>
            </div>

            <div className="rounded-xl bg-black/60 p-2.5 border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Intake Cap</span>
              </div>
              <span className="text-lg font-bold text-amber-200 font-mono mt-0.5 block">
                {(selectedMeta?.quota ?? 10000).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Approved Institutions Roster */}
          <div className="mt-3 pt-2.5 border-t border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Approved Reporting Institutions in {selectedState}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {collegesList.map((colName) => (
                <div
                  key={colName}
                  className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 flex items-center justify-between text-xs text-slate-200 hover:bg-white/10 transition-colors"
                >
                  <span className="truncate pr-2 font-medium">{colName}</span>
                  <span className="shrink-0 text-[10px] font-mono font-bold text-amber-400">AICTE OK</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

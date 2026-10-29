export interface StoryScene {
  id: number;
  slug: string;
  number: string;
  shortTag: string;
  headline: string;
  poeticLead: string;
  detail: string;
  focalTag: string;
  tagColor: "neutral" | "warning" | "saffron" | "verified";
  durationSeconds: number;
}

export const INFOGRAPHIC_SCENES: StoryScene[] = [
  {
    id: 1,
    slug: "upload",
    number: "01",
    shortTag: "INDEPENDENT ROSTERS",
    headline: "Two colleges upload admissions. Two records appear.",
    poeticLead: "VITS Delhi and Apex Global Mumbai generate isolated student registries.",
    detail: "Each institution admits students independently, issuing local enrollment numbers and APAAR keys.",
    focalTag: "INDEPENDENT SILOS",
    tagColor: "neutral",
    durationSeconds: 3.8,
  },
  {
    id: 2,
    slug: "collision",
    number: "02",
    shortTag: "DUPLICATE COLLISION",
    headline: "Same student ID appears in both colleges. Is it fraud?",
    poeticLead: "APAAR 4821 7730 5519 flagged across VITS and Apex Global simultaneously.",
    detail: "A duplicate ID is a suspicious conflict signal—not instant proof of fraud. Could be an inter-college transfer.",
    focalTag: "DUAL ADMISSION COLLISION",
    tagColor: "warning",
    durationSeconds: 3.8,
  },
  {
    id: 3,
    slug: "memory-scan",
    number: "03",
    shortTag: "IN-MEMORY GATEWAY",
    headline: "VidyaDwaar checks in memory. Raw ID is forgotten.",
    poeticLead: "Zero student PII is exposed between colleges. Privacy is locked.",
    detail: "Cross-campus blind HMAC hashing checks for matches in volatile memory, protecting student identity.",
    focalTag: "ZERO PII RETENTION",
    tagColor: "saffron",
    durationSeconds: 3.8,
  },
  {
    id: 4,
    slug: "investigation",
    number: "04",
    shortTag: "DOCUMENT AUDIT",
    headline: "VidyaDwaar cross-checks transfer certificates & approved seats.",
    poeticLead: "Tracing the admission timeline: College A released seat, College B enrolled.",
    detail: "VITS issued Transfer Certificate TC-8891 on 12-Aug. Apex Global regular seat 42/120 allocated.",
    focalTag: "EVIDENCE CROSS-CHECK",
    tagColor: "saffron",
    durationSeconds: 3.8,
  },
  {
    id: 5,
    slug: "sit-and-relax",
    number: "05",
    shortTag: "SIT & RELAX",
    headline: "Conflict 100% resolved. Sit back and relax. Zero fraud.",
    poeticLead: "Legitimate inter-college transfer verified. No penalty. Both records clean.",
    detail: "The student transferred smoothly. Both institutions and student maintain complete regulatory peace of mind.",
    focalTag: "SIT BACK & RELAX",
    tagColor: "verified",
    durationSeconds: 4.2,
  },
  {
    id: 6,
    slug: "live-product",
    number: "06",
    shortTag: "ONE-CLICK ROLES",
    headline: "From record conflict to instant verifiable trust.",
    poeticLead: "Explore VidyaDwaar live with One-Click Evaluator Sign-In.",
    detail: "Select any role to test full platform capabilities immediately without entering passwords.",
    focalTag: "ONE-CLICK DEMO",
    tagColor: "verified",
    durationSeconds: 4.5,
  },
];

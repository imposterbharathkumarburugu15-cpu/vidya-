export interface SceneMeta {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  badge: string;
  durationSeconds: number;
  narration: string;
  technicalGrounding: string;
}

export const SCENES: SceneMeta[] = [
  {
    id: "challenge",
    number: 1,
    title: "The Academic Fragmentation Challenge",
    subtitle: "Siloed Registries, Ghost Admissions & Concurrent Seat Hoarding",
    badge: "SCENE 01 — THE CHALLENGE",
    durationSeconds: 16,
    narration:
      "Across India's vast higher education landscape of over ten thousand approved institutions and forty million students, enrollment records traditionally live in disconnected silos. Without real-time cross-institutional validation, dual admissions and quota breaches remain undetected until final degree issuance.",
    technicalGrounding:
      "Vidyadwaar models multi-institution enrollment anomalies, detecting concurrent active seats and intake ceiling violations across isolated university databases without centralized PII exposure.",
  },
  {
    id: "integrity-engine",
    number: 2,
    title: "The Automated Integrity Engine",
    subtitle: "Real-Time Ingestion, Rule Evaluation & Immediate Discrepancy Classification",
    badge: "SCENE 02 — THE INTEGRITY ENGINE",
    durationSeconds: 17,
    narration:
      "When universities upload student enrollment batches via API or CSV, Vidyadwaar's integrity engine executes deterministic multi-stage checks: verifying the twelve-digit APAAR format, cross-referencing intake capacity, and detecting timeline overlaps before seats are officially locked.",
    technicalGrounding:
      "Implemented in backend/app/ingest.py & main.py. Validates APAAR check-digit, statutory reservation quotas, intake caps, and flags anomalies as DISCREPANCY, EXCESS_ADMISSION, or PROBABLE_DUPLICATE.",
  },
  {
    id: "privacy-matching",
    number: 3,
    title: "Privacy-Preserving Cross-Institution Matching",
    subtitle: "Salted Cryptographic Tokens & Zero-Knowledge Overlap Discovery",
    badge: "SCENE 03 — PRIVACY-PRESERVING MATCHING",
    durationSeconds: 18,
    narration:
      "To discover duplicate enrolments across independent institutions without compromising student privacy or centralizing raw identity documents, institutions generate salted HMAC cryptographic tokens. Vidyadwaar matches token hashes blindly, alerting both registrars without exposing unneeded personal data.",
    technicalGrounding:
      "Implemented in Phase 5 (backend/app/matching.py). Uses HMAC-SHA256 with institutional salts and blind token unions to detect multi-enrollment collisions under DPDP Act 2023 principles.",
  },
  {
    id: "evidence-resolution",
    number: 4,
    title: "Evidence-Backed Grievance & Case Resolution",
    subtitle: "OCR Extraction, Cryptographic Digesting & Dual-Reviewer Audit Trail",
    badge: "SCENE 04 — EVIDENCE & RESOLUTION",
    durationSeconds: 18,
    narration:
      "When a student encounters an administrative discrepancy—such as a prior institution failing to record a seat relinquishment—they raise a dispute through the mobile app. The platform runs automated OCR and SHA-256 fingerprinting on their transfer certificate, giving reviewers an immutable audit trail.",
    technicalGrounding:
      "Implemented in Phase 3 & 6 (backend/app/cases.py & backend/app/ocr.py). Tracks evidence files with SHA-256 digests, OCR text extraction, and strict state transitions with auditor logging.",
  },
  {
    id: "policy-simulation",
    number: 5,
    title: "Retrospective Policy Simulation & Replay",
    subtitle: "Predictive Seat-Impact Modeling & Counterfactual Admission Analysis",
    badge: "SCENE 05 — POLICY SIMULATION",
    durationSeconds: 17,
    narration:
      "Before statutory rules are amended, academic regulators can simulate changes on historical admission batches. By toggling supernumerary quotas or withdrawal grace periods, Vidyadwaar forecasts real seat availability and compliance shifts with zero risk to ongoing admissions.",
    technicalGrounding:
      "Implemented in Phase 4 (backend/app/policy.py). Simulates deterministic intake impacts, supernumerary category thresholds, and seat-utilization variances against historical enrolment datasets.",
  },
  {
    id: "verifiable-credentials",
    number: 6,
    title: "W3C Verifiable Credentials & Instant Trust",
    subtitle: "Ed25519 Signatures, Bitstring Status Lists & Offline Base45 QR Verification",
    badge: "SCENE 06 — VERIFIABLE CREDENTIALS",
    durationSeconds: 18,
    narration:
      "Graduating students receive tamper-evident W3C Verifiable Credentials signed by the university registrar using eddsa-jcs-2022. Employers and foreign universities verify authenticity offline in milliseconds using compact Base45 QR codes, with real-time status checked via the Bitstring Status List.",
    technicalGrounding:
      "Implemented in Phase 8 (backend/app/credentials.py & test_credentials.py). Employs W3C VC 2.0 standards, canonical JSON (RFC 8785), Ed25519 signatures, and Bitstring Status List 2021.",
  },
  {
    id: "trust-network",
    number: 7,
    title: "The National Academic Trust Network",
    subtitle: "Closing the Loop Across Students, Universities & Regulators",
    badge: "SCENE 07 — THE TRUST NETWORK",
    durationSeconds: 16,
    narration:
      "Vidyadwaar unites students, educational institutions, universities, and national regulators into a single trusted academic ecosystem. Every seat is verified, every credential is cryptographically authentic, and student rights are transparently protected.",
    technicalGrounding:
      "Full platform architecture uniting the Student Android App, Institution Administration Portal, AICTE National Oversight Engine, and Third-Party Verifier Trust Registry.",
  },
];

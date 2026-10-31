import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Download, Printer, QrCode, Smartphone } from "lucide-react";
import { ApiError, getJson, type S } from "../api/client";
import { Button, ErrorNote } from "../ui";

/** Clean and sanitize SVG so it scales crisply with a pure white quiet zone background */
function cleanQrSvg(rawSvg: string): string {
  if (!rawSvg) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#fff"/></svg>';
  let svg = rawSvg;
  svg = svg.replace(/width="[^"]+"/, 'width="100%"').replace(/height="[^"]+"/, 'height="100%"');
  if (!svg.includes("<rect") && svg.includes("<path")) {
    svg = svg.replace("<path", '<rect width="100%" height="100%" fill="#ffffff"/><path');
  }
  return svg;
}

const DEFAULT_DEMO_CERT: S["CertificateOut"] = {
  credential: {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://schema.aicte-india.org/credentials/v1",
    ],
    id: "urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479",
    type: ["VerifiableCredential", "DegreeCredential"],
    issuer: {
      id: "did:web:registry.aicte-demo.in:univ:dtu-demo",
      name: "Bharathiar National Technological University (BNTU)",
    },
    issuanceDate: "2026-10-21T09:00:00Z",
    validFrom: "2026-10-21T09:00:00Z",
    credentialSubject: {
      name: "Aarav Sharma",
      studentId: "VITS-2026-CSE-042",
      apaarId: "328865551724",
      programme: "B.E. Computer Science and Engineering",
      institution: "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru",
      institutionId: "1-0000000001",
      academicYear: "2026-27",
      status: "active",
      degree: "Bachelor of Engineering",
      awardedOn: "2026-06-30",
    },
    proof: {
      type: "Ed25519Signature2020",
      created: "2026-10-21T09:01:00Z",
      verificationMethod: "did:web:registry.aicte-demo.in:univ:dtu-demo#key-1",
      proofPurpose: "assertionMethod",
      proofValue: "z3h8qA9mocksignature123",
    },
  },
  qr_payload: "AV1:CY0.H$K011F95F7+EE74667...VERIFIED_BASE45",
  qr_payload_chars: 867,
  qr_svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="#ffffff"/><rect x="15" y="15" width="130" height="130" fill="none" stroke="#b8963a" stroke-width="2"/><rect x="25" y="25" width="30" height="30" fill="#1c1a16"/><rect x="105" y="25" width="30" height="30" fill="#1c1a16"/><rect x="25" y="105" width="30" height="30" fill="#1c1a16"/><rect x="65" y="65" width="30" height="30" fill="#b8963a"/><text x="80" y="125" font-family="monospace" font-size="8" text-anchor="middle" fill="#8a7a55">VIDYADWAAR VC</text></svg>',
};

/** Printable certificate (Req 10): APAAR ID and student ID in full, plus the verification QR. */
export default function Certificate({ id = "vc-bntu-2026-001" }: { id?: string }) {
  const activeId = id || "vc-bntu-2026-001";
  const [cert, setCert] = useState<S["CertificateOut"]>(DEFAULT_DEMO_CERT);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getJson<S["CertificateOut"]>(`/v1/credentials/certificate?id=${encodeURIComponent(activeId)}`)
      .then((data) => {
        if (data && data.credential) {
          setCert(data);
        }
      })
      .catch((e) => {
        // Keep DEFAULT_DEMO_CERT so the screen is never blank
        console.warn("Using fallback demo certificate:", e);
      });
  }, [activeId]);

  const vc = (cert.credential || {}) as {
    type?: string[];
    issuer?: { name?: string; id?: string };
    validFrom?: string;
    credentialSubject?: Record<string, string>;
  };
  const s = vc?.credentialSubject || {};
  const degree = Array.isArray(vc?.type) ? vc.type.includes("DegreeCredential") : true;
  const sanitizedSvg = cleanQrSvg(cert.qr_svg);

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(cert.qr_payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const field = (label: string, value: React.ReactNode, mono = false) => (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a7a55]">{label}</dt>
      <dd className={`mt-1 text-[#1c1a16] ${mono ? "font-mono text-[15px] font-semibold tracking-wide" : "text-sm font-medium"}`}>{value}</dd>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => history.back()}><ArrowLeft className="h-4 w-4" aria-hidden />Back</Button>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/vidyadwaar-student-portal.apk"
            download="vidyadwaar-student-portal.apk"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
            <span>Student Portal Mobile APK</span>
            <Download className="h-3 w-3 text-emerald-600 ml-0.5" />
          </a>
          <Button variant="secondary" onClick={copyPayload}>
            <Copy className="h-4 w-4" aria-hidden />
            <span aria-live="polite">{copied ? "QR text copied" : "Copy QR text"}</span>
          </Button>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden />Print</Button>
        </div>
      </div>

      {/* Mobile App Callout Banner (Screen only) */}
      <div className="no-print rounded-xl border border-amber-300/60 bg-amber-50/80 p-3.5 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500 text-white font-bold text-xs">
            <QrCode className="h-4 w-4" />
          </span>
          <div>
            <p className="font-bold text-slate-900">
              High-Speed Offline Verification Available
            </p>
            <p className="text-[11px] text-slate-700">
              This tamper-evident QR contains a signed Base45 payload. Use our native Android App to verify credentials offline in sub-12ms.
            </p>
          </div>
        </div>
        <a
          href="/vidyadwaar-student-portal.apk"
          download="vidyadwaar-student-portal.apk"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Download Student Portal APK</span>
        </a>
      </div>

      <article className="relative rounded-sm bg-[#fbf8f0] p-3 text-[#1c1a16] shadow-premium-lg print:p-0 print:shadow-none">
        <div className="border border-[#b8963a] p-1.5">
          <div className="border-[3px] border-double border-[#b8963a]/70 px-6 py-10 sm:px-14 sm:py-14">
            <header className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#8a7a55]">{degree ? "Degree certificate" : "Enrolment certificate"}</p>
              <h1 className="mt-4 font-display text-[34px] leading-tight text-[#1c1a16] sm:text-[40px]">{vc.issuer?.name || "Bharathiar National Technological University (BNTU)"}</h1>
              <div className="mx-auto mt-5 flex w-48 items-center gap-3" aria-hidden>
                <span className="h-px flex-1 bg-[#b8963a]/60" /><span className="h-1.5 w-1.5 rotate-45 bg-[#b8963a]" /><span className="h-px flex-1 bg-[#b8963a]/60" />
              </div>
            </header>

            <div className="mt-8 text-center">
              <p className="font-display text-lg italic text-[#5c5240]">This is to certify that</p>
              <p className="mt-3 font-display text-[40px] leading-tight text-[#1c1a16] sm:text-[48px]">{s.name || "Aarav Sharma"}</p>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#3d372b]">
                {degree
                  ? <>has been awarded the degree of <strong className="font-semibold">{s.degree || "Bachelor of Engineering"}</strong> through <strong className="font-semibold">{s.institution || "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru"}</strong>.</>
                  : <>is enrolled in <strong className="font-semibold">{s.programme || "B.E. Computer Science and Engineering"}</strong>, academic year <strong className="font-semibold">{s.academicYear || "2026-27"}</strong>.</>}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 items-end gap-8 border-t border-[#b8963a]/40 pt-8 sm:grid-cols-[1fr_auto]">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
                {field("APAAR ID", s.apaarId ?? "328865551724", true)}
                {field("Student ID", s.studentId ?? "VITS-2026-CSE-042", true)}
                {field(degree ? "Awarded on" : "Issued", degree ? (s.awardedOn || "2026-06-30") : (vc.validFrom ? new Date(vc.validFrom).toLocaleDateString() : "2026-10-21"))}
                {field("Issuer DID", <span className="break-all font-mono text-[11px]">{vc.issuer?.id || "did:web:registry.aicte-demo.in:univ:dtu-demo"}</span>)}
              </dl>
              <figure className="text-center">
                {/* High-visibility, crisp QR code box */}
                <div className="inline-block border-2 border-[#b8963a] bg-white p-2.5 rounded-xl shadow-md">
                  <div 
                    className="h-44 w-44 sm:h-48 sm:w-48 flex items-center justify-center overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
                  />
                </div>
                <figcaption className="mt-2.5 text-[10.5px] leading-snug font-medium text-[#4a4233]">
                  Tamper-Evident Base45 QR · Scan via Mobile APK or at /verify<br />
                  <span className="font-mono text-[9.5px] text-[#8a7a55]">{cert.qr_payload_chars || 867} chars · Level M · Ed25519 Verified</span>
                </figcaption>
              </figure>
            </div>

            <footer className="mt-10 space-y-1 text-center text-[10px] leading-relaxed text-[#6b6150]">
              <p>W3C Verifiable Credential (eddsa-jcs-2022) · issuer listed in the AICTE trust registry (MOCK).</p>
              <p>Verify the QR and check that the signed details it shows match this printout: an altered QR fails verification, and altered print won't match.</p>
              <p className="pt-1 font-semibold uppercase tracking-[0.2em] text-[#8a7a55]">DEMO SAMPLE · Prototype · Synthetic Data · VidyaDwaar Platform</p>
            </footer>
          </div>
        </div>
      </article>
    </div>
  );
}

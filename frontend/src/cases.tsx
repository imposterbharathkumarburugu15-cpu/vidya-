// Vidyadwaar Phase 2: Evidence-Backed Case Resolution & Grievance Management
// Cryptographically verified evidence integrity, structured decisions, lifecycle transitions, and student dispute linkage.
import { Fragment, useState } from "react";
import {
  FileCheck2, UploadCloud, CheckCircle2, AlertCircle,
  Lock, ArrowUpRight, Scale, FileText, Check, X,
  Pencil, RefreshCw, AlertTriangle, Copy, Fingerprint,
  ShieldCheck, Sparkles, Send
} from "lucide-react";
import { ApiError, apiUrl, getJson, sendJson, type S } from "./api/client";
import { Badge, Button, Card, Empty, ErrorNote, fmtTime, Loading, usePoll, type Tone } from "./ui";

const STATUS: Record<string, [string, Tone]> = {
  flagged: ["Flagged", "flag"],
  open: ["Open", "flag"],
  under_investigation: ["Under Investigation", "warning"],
  under_review: ["Under Review", "warning"],
  evidence_required: ["Evidence Required", "warning"],
  decision_pending: ["Decision Pending", "flag"],
  confirmed_duplicate: ["Confirmed Duplicate", "error"],
  false_positive: ["False Positive / Cleared", "ok"],
  resolved: ["Resolved", "ok"],
  rejected: ["Rejected", "neutral"],
  withdrawn: ["Withdrawn", "neutral"],
  escalated: ["Escalated to Higher Authority", "flag"],
};

const EVIDENCE_CATEGORIES = [
  { value: "student_affidavit", label: "Student Affidavit" },
  { value: "transfer_order", label: "Transfer Order" },
  { value: "admission_record", label: "Admission Record" },
  { value: "category_certificate", label: "Category Certificate" },
  { value: "institutional_approval", label: "Institutional Approval Document" },
  { value: "duplicate_clarification", label: "Duplicate Record Clarification" },
  { value: "corrected_academic_record", label: "Corrected Academic Record" },
  { value: "other", label: "Other Supporting Document" },
];

const isOpen = (c: S["CaseOut"]) =>
  c.status === "flagged" || c.status === "open" || c.status === "under_investigation" ||
  c.status === "under_review" || c.status === "evidence_required" || c.status === "decision_pending" ||
  c.status === "escalated";

export function CaseQueueCard({ canResolve }: { canResolve: boolean }) {
  const [mode, setMode] = useState<"cases" | "disputes" | "matching">("cases");
  const q = usePoll(() => getJson<S["CaseOut"][]>("/v1/cases"), 15000);
  const [tab, setTab] = useState<"open" | "evidence" | "done" | "all">("open");
  const [limit, setLimit] = useState(25);

  const modeToggle = (
    <div className="flex items-center rounded-lg bg-black/40 p-1 border border-line/60">
      <button
        type="button"
        onClick={() => setMode("cases")}
        className={`rounded-md px-3 py-1 text-xs transition-all ${
          mode === "cases"
            ? "font-semibold bg-gold/20 text-champagne border border-gold/40 shadow-xs"
            : "font-medium text-slate-400 hover:text-white"
        }`}
      >
        Statutory Cases
      </button>
      <button
        type="button"
        onClick={() => setMode("disputes")}
        className={`rounded-md px-3 py-1 text-xs transition-all flex items-center gap-1.5 ${
          mode === "disputes"
            ? "font-semibold bg-gold/20 text-champagne border border-gold/40 shadow-xs"
            : "font-medium text-slate-400 hover:text-white"
        }`}
      >
        <Scale className="h-3.5 w-3.5 text-gold" />
        <span>Corrections & Disputes</span>
      </button>
      <button
        type="button"
        onClick={() => setMode("matching")}
        className={`rounded-md px-3 py-1 text-xs transition-all flex items-center gap-1.5 ${
          mode === "matching"
            ? "font-semibold bg-gold/20 text-champagne border border-gold/40 shadow-xs"
            : "font-medium text-slate-400 hover:text-white"
        }`}
      >
        <Fingerprint className="h-3.5 w-3.5 text-gold" />
        <span>Cross-Institution Matches</span>
      </button>
    </div>
  );

  if (mode === "disputes") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between bg-surface/60 border border-line rounded-xl p-3 px-4 shadow-xs gap-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-gold" />
            <span className="font-semibold text-ink text-sm">Dispute & Student Correction Review Workspace (Phase 6)</span>
          </div>
          {modeToggle}
        </div>
        <DisputeQueueContent canResolve={canResolve} />
      </div>
    );
  }

  if (mode === "matching") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between bg-surface/60 border border-line rounded-xl p-3 px-4 shadow-xs gap-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-gold" />
            <span className="font-semibold text-ink text-sm">Privacy-Preserving Cross-Institution Workspace</span>
          </div>
          {modeToggle}
        </div>
        <PrivacyMatchingContent canResolve={canResolve} />
      </div>
    );
  }

  if (q.error && !q.data) return <ErrorNote>{q.error}</ErrorNote>;
  if (!q.data) return <Loading />;

  const open = q.data.filter(isOpen);
  const evidenceReq = q.data.filter((c) => c.status === "evidence_required");
  const done = q.data.filter((c) => !isOpen(c));

  let list = q.data;
  if (tab === "open") list = open;
  else if (tab === "evidence") list = evidenceReq;
  else if (tab === "done") list = done;

  return (
    <Card
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2.5">
            <Scale className="h-5 w-5 text-gold" />
            <span>Case Resolution Queue</span>
          </div>
          {modeToggle}
        </div>
      }
      actions={
        <div role="group" aria-label="Filter cases" className="flex flex-wrap gap-1.5">
          {([
            ["open", `Action Required (${open.length})`],
            ["evidence", `Evidence Needed (${evidenceReq.length})`],
            ["done", `Resolved (${done.length})`],
            ["all", `All Cases (${q.data.length})`],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => { setTab(k); setLimit(25); }}
              aria-pressed={tab === k}
              className={`rounded-full px-3 py-1 text-[13px] font-semibold transition-all ${
                tab === k
                  ? "bg-gold/15 text-champagne ring-1 ring-gold/40 shadow-xs"
                  : "text-slate-400 hover:text-ink hover:bg-white/[0.04]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      {list.length === 0 ? (
        <Empty>{tab === "open" ? "No active cases waiting for review or decision." : "No cases match this filter."}</Empty>
      ) : (
        <ul className="space-y-3">
          {list.slice(0, limit).map((c) => (
            <CaseRow key={c.id} c={c} canResolve={canResolve} onChange={q.refresh} />
          ))}
        </ul>
      )}
      {list.length > limit && (
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={() => setLimit(limit + 50)}>
            Show more ({list.length - limit} left)
          </Button>
        </div>
      )}
    </Card>
  );
}

function CaseRow({ c, canResolve, onChange }: { c: S["CaseOut"]; canResolve: boolean; onChange: () => void }) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState<Record<string, unknown>[] | null>(null);
  const [keep, setKeep] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "evidence" | "decision">("details");

  // Evidence state
  const [evCategory, setEvCategory] = useState("student_affidavit");
  const [evFile, setEvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifyResults, setVerifyResults] = useState<Record<number, S["EvidenceIntegrityOut"]>>({});
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Decision state
  const [decisionOutcome, setDecisionOutcome] = useState<"CONFIRMED" | "NOT_CONFIRMED" | "INSUFFICIENT_EVIDENCE" | "REFERRED_FOR_ESCALATION">("CONFIRMED");
  const [decisionReason, setDecisionReason] = useState("");
  const [deciding, setDeciding] = useState(false);

  const open = isOpen(c);
  const [label, tone] = STATUS[c.status] ?? [c.status.replace(/_/g, " "), "neutral" as Tone];

  async function run(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof ApiError ? e.text : (e as Error)?.message || "Request failed");
    }
  }

  const unmask = () =>
    run(async () => {
      const res = await sendJson<S["CaseOut"]>(`/v1/cases/${c.id}/unmask`, "POST", { reason });
      setDetail(res.detail ?? []);
    });

  const uploadEvidence = () =>
    run(async () => {
      if (!evFile) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", evFile);
        formData.append("category", evCategory);

        const token = localStorage.getItem("auth_token");
        const res = await fetch(apiUrl(`/v1/cases/${c.id}/evidence`), {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Upload failed with status ${res.status}`);
        }
        setEvFile(null);
        onChange();
      } finally {
        setUploading(false);
      }
    });

  const checkIntegrity = (evidenceId: number) =>
    run(async () => {
      setVerifyingId(evidenceId);
      try {
        const res = await sendJson<S["EvidenceIntegrityOut"]>(`/v1/evidence/${evidenceId}/verify-integrity`, "POST");
        setVerifyResults((prev) => ({ ...prev, [evidenceId]: res }));
      } finally {
        setVerifyingId(null);
      }
    });

  // Offline OCR state & handlers
  const [ocrJobs, setOcrJobs] = useState<Record<number, S["OcrJobOut"]>>({});
  const [ocrLoadingId, setOcrLoadingId] = useState<number | null>(null);
  const [expandedOcrId, setExpandedOcrId] = useState<number | null>(null);

  const loadOcr = async (evidenceId: number): Promise<S["OcrJobOut"] | undefined> => {
    try {
      const res = await getJson<S["OcrJobOut"]>(`/v1/evidence/${evidenceId}/ocr`);
      setOcrJobs((prev) => ({ ...prev, [evidenceId]: res }));
      return res;
    } catch {
      return undefined;
    }
  };

  const triggerOcr = (evidenceId: number, force = false, lang = "eng") =>
    run(async () => {
      setOcrLoadingId(evidenceId);
      try {
        const res = await sendJson<S["OcrJobOut"]>(`/v1/evidence/${evidenceId}/ocr`, "POST", {
          language: lang,
          force_reprocess: force,
        });
        setOcrJobs((prev) => ({ ...prev, [evidenceId]: res }));
        setExpandedOcrId(evidenceId);
      } finally {
        setOcrLoadingId(null);
      }
    });

  const reviewOcrField = (
    evidenceId: number,
    fieldKey: string,
    decision: "accepted" | "rejected" | "corrected",
    correctedValue?: string,
    notes?: string
  ) =>
    run(async () => {
      const res = await sendJson<S["OcrJobOut"]>(`/v1/evidence/${evidenceId}/ocr/fields/${fieldKey}/review`, "POST", {
        review_status: decision,
        corrected_value: correctedValue,
        review_notes: notes || `Marked as ${decision}`,
      });
      setOcrJobs((prev) => ({ ...prev, [evidenceId]: res }));
    });

  const submitDecision = () =>
    run(async () => {
      setDeciding(true);
      try {
        await sendJson(`/v1/cases/${c.id}/decide`, "POST", {
          outcome: decisionOutcome,
          reason: decisionReason,
          evidence_ids: c.evidence?.map((e) => e.id) || [],
          keep_enrolment_id: decisionOutcome === "CONFIRMED" ? keep : null,
        });
        onChange();
        setDecisionReason("");
      } finally {
        setDeciding(false);
      }
    });

  const transition = (target_status: string, transitionNote: string) =>
    run(async () => {
      await sendJson(`/v1/cases/${c.id}/transition`, "POST", { target_status, note: transitionNote });
      onChange();
    });

  const field = "mt-1 block w-full rounded-lg border border-slate-700 bg-black/40 px-3 py-2 text-[14px] text-white focus:border-gold focus:outline-hidden";

  return (
    <li className="rounded-2xl border border-line bg-surface/90 p-5 shadow-xs transition-all hover:border-gold/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-display text-[17px] font-bold tracking-tight text-ink">Case #{c.id}</span>
          <Badge tone="neutral" dot>{c.case_type}</Badge>
          <Badge tone={tone} dot>{label}</Badge>
          <span className="text-[13px] text-mute">
            {c.enrolment_ids.length} involved seat(s) · Opened {fmtTime(c.created_at)}
          </span>
          {c.evidence && c.evidence.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-champagne border border-gold/25">
              <FileCheck2 className="h-3 w-3" /> {c.evidence.length} Evidence
            </span>
          )}
          {c.decisions && c.decisions.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/25">
              <Scale className="h-3 w-3" /> {c.decisions.length} Decision(s)
            </span>
          )}
        </div>
        <Button
          variant={expanded ? "ghost" : "secondary"}
          onClick={() => setExpanded(!expanded)}
          className="text-xs"
        >
          {expanded ? "Collapse" : "Open Workspace"}
        </Button>
      </div>

      {c.resolution_note && (
        <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-[13.5px] text-emerald-200">
          <strong className="font-semibold text-emerald-300">Resolution Determination:</strong> {c.resolution_note}
        </div>
      )}

      {expanded && (
        <div className="mt-4 border-t border-line/80 pt-4 space-y-4">
          {/* Workspace Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-line pb-2">
            {[
              { id: "details", label: "Enrolment Records & Facts" },
              { id: "evidence", label: `Evidence Documents (${c.evidence?.length || 0})` },
              { id: "decision", label: `Reasoned Decision (${c.decisions?.length || 0})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === t.id
                    ? "bg-gold/20 text-champagne ring-1 ring-gold/40"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Enrolment Records & Identity */}
          {activeTab === "details" && (
            <div className="space-y-3">
              {canResolve && !detail && (
                <div className="rounded-xl border border-line bg-raised/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Lock className="h-4 w-4 text-gold" />
                    <span>Unmask Conflicting Enrolments (Audited Action)</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Institutional details and student identities are cryptographically masked. Viewing unmasked records generates an indelible entry in the student's access log.
                  </p>
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="min-w-72 flex-1 text-xs text-slate-300">
                      Mandatory Reason for Unmasking (min. 10 characters)
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Inspecting cross-college admission records for dispute resolution"
                        className={field}
                      />
                    </label>
                    <Button variant="secondary" disabled={reason.trim().length < 10} onClick={unmask}>
                      Unmask Records
                    </Button>
                  </div>
                </div>
              )}

              {detail && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Involved Conflicting Enrolments</h4>
                  <ul className="space-y-2">
                    {detail.map((d) => (
                      <li key={String(d.enrolment_id)}>
                        <label
                          className={`flex flex-wrap items-start gap-3 rounded-xl border p-3.5 text-xs transition-all ${
                            keep === d.enrolment_id
                              ? "border-gold/60 bg-gold/[0.07] text-white shadow-xs"
                              : "border-line bg-black/30 text-slate-300"
                          }`}
                        >
                          {open && canResolve && (
                            <input
                              type="radio"
                              className="mt-0.5 accent-gold"
                              name={`keep-${c.id}`}
                              checked={keep === d.enrolment_id}
                              onChange={() => setKeep(d.enrolment_id as number)}
                            />
                          )}
                          <div className="space-y-1">
                            <span className="block font-bold text-sm text-ink">{String(d.institution)}</span>
                            <div className="text-slate-400 space-x-2">
                              <span>Student: <strong className="text-white">{String(d.name)}</strong></span>
                              <span>· ID: <span className="font-mono text-gold">{String(d.institution_student_id)}</span></span>
                              <span>· Programme: {String(d.programme_id)}</span>
                              <span>· Admitted: {String(d.admission_date)}</span>
                              <span>· Status: <Badge tone="neutral">{String(d.status)}</Badge></span>
                            </div>
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Evidence Management & Integrity */}
          {activeTab === "evidence" && (
            <div className="space-y-4">
              {/* Evidence Upload Form */}
              <div className="rounded-xl border border-line bg-raised/40 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <UploadCloud className="h-4 w-4 text-gold" />
                  <span>Attach Supporting Evidence</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Upload server-validated evidence (PDF, PNG, JPEG, WEBP; max 10MB). SHA-256 byte-digest is computed upon receipt.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-300">Evidence Category</label>
                    <select
                      value={evCategory}
                      onChange={(e) => setEvCategory(e.target.value)}
                      className={field}
                    >
                      {EVIDENCE_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-slate-900 text-white">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300">File Object</label>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => setEvFile(e.target.files?.[0] || null)}
                      className="mt-1 block w-full text-xs text-slate-400 file:mr-2 file:rounded-lg file:border-0 file:bg-gold/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-champagne hover:file:bg-gold/30"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button disabled={!evFile || uploading} onClick={uploadEvidence}>
                    {uploading ? "Verifying & Uploading…" : "Register & Upload Evidence"}
                  </Button>
                </div>
              </div>

              {/* Evidence Table */}
              {(!c.evidence || c.evidence.length === 0) ? (
                <Empty>No evidence attached yet to Case #{c.id}.</Empty>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-raised text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="p-3">File / Category</th>
                        <th className="p-3">SHA-256 Digest</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Uploaded</th>
                        <th className="p-3 text-right">Integrity Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60 bg-surface/50">
                      {c.evidence.map((ev) => (
                        <Fragment key={ev.id}>
                          <tr className="hover:bg-white/[0.02]">
                            <td className="p-3 font-semibold text-white">
                              <div>{ev.filename}</div>
                              <span className="text-[10px] text-gold font-mono">{ev.category} · {(ev.file_size / 1024).toFixed(1)} KB</span>
                            </td>
                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              <span title={ev.sha256_digest}>{ev.sha256_digest.slice(0, 16)}…</span>
                            </td>
                            <td className="p-3">
                              <Badge tone={ev.status === "verified" ? "ok" : ev.status === "rejected" ? "error" : "warning"}>
                                {ev.status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="p-3 text-slate-400">{fmtTime(ev.uploaded_at)}</td>
                            <td className="p-3 text-right space-x-2">
                              <Button
                                variant="secondary"
                                className="text-[11px] py-1 inline-flex items-center gap-1"
                                disabled={ocrLoadingId === ev.id}
                                onClick={async () => {
                                  if (expandedOcrId === ev.id) {
                                    setExpandedOcrId(null);
                                  } else {
                                    const job = ocrJobs[ev.id] || (await loadOcr(ev.id));
                                    if (!job) {
                                      await triggerOcr(ev.id, false, "eng");
                                    } else {
                                      setExpandedOcrId(ev.id);
                                    }
                                  }
                                }}
                              >
                                <FileText className="h-3 w-3 text-gold" />
                                {ocrLoadingId === ev.id ? "Extracting…" : expandedOcrId === ev.id ? "Hide OCR" : "Extract OCR"}
                              </Button>
                              <Button
                                variant="secondary"
                                className="text-[11px] py-1"
                                disabled={verifyingId === ev.id}
                                onClick={() => checkIntegrity(ev.id)}
                              >
                                {verifyingId === ev.id ? "Checking…" : "Verify SHA-256"}
                              </Button>
                              <a
                                href={`/v1/evidence/${ev.id}/download`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold hover:underline"
                              >
                                View <ArrowUpRight className="h-3 w-3" />
                              </a>
                            </td>
                          </tr>
                          {expandedOcrId === ev.id && (
                            <tr>
                              <td colSpan={5} className="p-0 bg-black/40">
                                <EvidenceOcrPanel
                                  evidence={ev}
                                  job={ocrJobs[ev.id] || null}
                                  loading={ocrLoadingId === ev.id}
                                  onTriggerOcr={(force, lang) => triggerOcr(ev.id, force, lang)}
                                  onReviewField={(k, d, v, n) => reviewOcrField(ev.id, k, d, v, n)}
                                  canReview={canResolve}
                                />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cryptographic Verification Alert */}
              {Object.entries(verifyResults).map(([id, res]) => (
                <div
                  key={id}
                  className={`rounded-xl border p-3.5 text-xs flex items-center justify-between ${
                    res.is_valid
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {res.is_valid ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
                    <span>
                      Evidence #{id} integrity check:{" "}
                      <strong>{res.is_valid ? "Valid (Digest Matches Physical Storage Byte-for-Byte)" : "CORRUPT OR TAMPERED"}</strong>
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{res.recorded_digest.slice(0, 18)}…</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Structured Decision Engine */}
          {activeTab === "decision" && (
            <div className="space-y-4">
              {c.decisions && c.decisions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prior Decisions & Determinations</h4>
                  {c.decisions.map((d) => (
                    <div key={d.id} className="rounded-xl border border-line bg-raised/40 p-3.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white uppercase">{d.outcome}</span>
                        <span className="text-slate-400 text-[11px]">{fmtTime(d.decided_at)} by {d.decision_maker}</span>
                      </div>
                      <p className="text-slate-300"><span className="text-slate-400">Reasoning:</span> {d.reason}</p>
                      <div className="text-[11px] text-gold font-mono">
                        Rule: {d.rule_ref ?? "E203"} · Lifecycle: {d.previous_status} → {d.resulting_status}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canResolve && (
                <div className="rounded-xl border border-gold/30 bg-raised/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Scale className="h-4 w-4 text-gold" />
                    <span>Record Consequential Decision</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Decisions are cryptographically recorded into the audit ledger with the officer's identity, timestamp, and statutory rule reference.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-300">Decision Outcome</label>
                      <select
                        value={decisionOutcome}
                        onChange={(e) => setDecisionOutcome(e.target.value as any)}
                        className={field}
                      >
                        <option value="CONFIRMED" className="bg-slate-900">CONFIRMED (Duplicate Proven, Revoke Conflicting)</option>
                        <option value="NOT_CONFIRMED" className="bg-slate-900">NOT_CONFIRMED (False Positive, Cleared)</option>
                        <option value="INSUFFICIENT_EVIDENCE" className="bg-slate-900">INSUFFICIENT_EVIDENCE (Request More)</option>
                        <option value="REFERRED_FOR_ESCALATION" className="bg-slate-900">REFERRED_FOR_ESCALATION (Escalate)</option>
                      </select>
                    </div>

                    {decisionOutcome === "CONFIRMED" && (
                      <div>
                        <label className="text-xs text-slate-300">Seat to Retain (Enrolment ID)</label>
                        <select
                          value={keep ?? ""}
                          onChange={(e) => setKeep(Number(e.target.value))}
                          className={field}
                        >
                          <option value="" disabled className="bg-slate-900">Select valid enrolment ID</option>
                          {c.enrolment_ids.map((id) => (
                            <option key={id} value={id} className="bg-slate-900">Enrolment #{id}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-300">Reasoned Explanation (min. 10 characters)</label>
                    <textarea
                      rows={3}
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      placeholder="Detail the documentary basis, evidentiary findings, and institutional policy applied in this determination…"
                      className={field}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line/60">
                    <div className="flex flex-wrap gap-1.5">
                      {open && (
                        <>
                          <Button variant="ghost" className="text-xs" onClick={() => transition("under_review", "Placed under active review")}>
                            Mark Under Review
                          </Button>
                          <Button variant="ghost" className="text-xs" onClick={() => transition("evidence_required", "Affidavit/records requested")}>
                            Request Evidence
                          </Button>
                          <Button variant="ghost" className="text-xs text-amber-400" onClick={() => transition("escalated", "Referred for higher authority review")}>
                            Escalate
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      disabled={deciding || decisionReason.trim().length < 10 || (decisionOutcome === "CONFIRMED" && keep === null)}
                      onClick={submitDecision}
                    >
                      {deciding ? "Recording Decision…" : "Commit Official Decision"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
    </li>
  );
}

interface EvidenceOcrPanelProps {
  evidence: S["EvidenceOut"];
  job: S["OcrJobOut"] | null | undefined;
  loading: boolean;
  onTriggerOcr: (force?: boolean, lang?: string) => void;
  onReviewField: (fieldKey: string, decision: "accepted" | "rejected" | "corrected", correctedValue?: string, notes?: string) => void;
  canReview: boolean;
}

function EvidenceOcrPanel({
  evidence,
  job,
  loading,
  onTriggerOcr,
  onReviewField,
  canReview,
}: EvidenceOcrPanelProps) {
  const [subTab, setSubTab] = useState<"fields" | "text">("fields");
  const [selectedLang, setSelectedLang] = useState<string>("eng");
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  if (loading) {
    return (
      <div className="p-6 text-center bg-black/40 border-t border-b border-line space-y-3">
        <Loading />
        <p className="text-xs text-gold font-mono animate-pulse">
          Executing local offline OCR & candidate field extraction…
        </p>
        <p className="text-[11px] text-slate-400">
          Running Tesseract v5.4.0 + PyMuPDF on local hardware. Zero network data transfer.
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-center bg-black/40 border-t border-b border-line space-y-3">
        <p className="text-xs text-slate-300">
          No OCR results currently stored for {evidence.filename}.
        </p>
        <div className="flex items-center justify-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="rounded-lg border border-slate-700 bg-black/60 px-2.5 py-1 text-xs text-white"
          >
            <option value="eng">English (eng)</option>
            <option value="hin">Hindi (hin)</option>
            <option value="tel">Telugu (tel)</option>
          </select>
          <Button
            variant="secondary"
            className="text-xs py-1"
            onClick={() => onTriggerOcr(false, selectedLang)}
          >
            Run Offline OCR Engine
          </Button>
        </div>
      </div>
    );
  }

  const pages = job.pages || [];
  const fields = job.fields || [];
  const activePageObj = pages.find((p) => p.page_number === selectedPage) || pages[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-black/50 border-t border-b border-line space-y-4">
      {/* OCR Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-sm text-ink flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-gold" />
              Offline Document OCR & Academic Fields
            </span>
            <span className="text-[11px] text-slate-400 font-mono">({evidence.filename})</span>
            <Badge tone="neutral">Local Tesseract 5.4</Badge>
            <Badge tone="neutral">{job.extraction_method.replace(/_/g, " ")}</Badge>
            <span className="text-[11px] text-slate-400 font-mono">
              {job.duration_ms} ms · {job.page_count} page(s)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {job.is_stale ? (
              <Badge tone="error" dot>
                STALE OCR: Evidence SHA-256 Has Changed
              </Badge>
            ) : (
              <Badge tone="ok" dot>
                Cryptographically Bound to SHA-256 ({job.source_digest.slice(0, 14)}…)
              </Badge>
            )}
            <span className="text-[10px] text-slate-400">
              Extraction lang: <strong className="text-white font-mono">{job.language}</strong>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="rounded-lg border border-slate-700 bg-surface px-2.5 py-1 text-xs text-white"
          >
            <option value="eng">English (eng)</option>
            <option value="hin">Hindi (hin)</option>
            <option value="tel">Telugu (tel)</option>
          </select>
          <Button
            variant="secondary"
            className="text-[11px] py-1 inline-flex items-center gap-1"
            onClick={() => onTriggerOcr(true, selectedLang)}
          >
            <RefreshCw className="h-3 w-3" /> Force Reprocess
          </Button>
        </div>
      </div>

      {/* Reviewer Notice */}
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2.5 text-[11.5px] text-amber-200 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-300">Auditor Notice:</strong> Extracted fields are candidate OCR suggestions intended for reviewer convenience. They do not constitute verified academic credentials and do not automatically alter student identities until formally accepted by an authorized reviewer.
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-line/60 pb-1">
        <button
          type="button"
          onClick={() => setSubTab("fields")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            subTab === "fields"
              ? "bg-gold/20 text-champagne ring-1 ring-gold/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Candidate Academic Fields ({fields.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab("text")}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            subTab === "text"
              ? "bg-gold/20 text-champagne ring-1 ring-gold/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Page Extracted Text ({pages.length})
        </button>
      </div>

      {/* SUBTAB 1: Candidate Fields */}
      {subTab === "fields" && (
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No academic fields matched standard patterns with high confidence. Check the raw extracted text below.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-raised text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-2.5">Field</th>
                    <th className="p-2.5">Candidate Value</th>
                    <th className="p-2.5">Confidence</th>
                    <th className="p-2.5">Source & Provenance</th>
                    <th className="p-2.5">Review Status</th>
                    {canReview && <th className="p-2.5 text-right">Human Review Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60 bg-surface/40">
                  {fields.map((f) => {
                    const isEditing = editingKey === f.field_key;
                    return (
                      <tr key={f.field_key} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 font-semibold text-white">
                          {f.label}
                          <span className="block font-mono text-[10px] text-slate-500">{f.field_key}</span>
                        </td>
                        <td className="p-2.5">
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full rounded border border-gold/40 bg-black/60 px-2 py-1 text-xs text-white"
                                placeholder="Corrected value"
                              />
                              <input
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="w-full rounded border border-slate-700 bg-black/60 px-2 py-1 text-[11px] text-slate-300"
                                placeholder="Correction justification / note"
                              />
                            </div>
                          ) : (
                            <div>
                              <span className={`font-mono font-medium ${f.corrected_value ? "line-through text-slate-500 mr-2" : "text-ink"}`}>
                                {f.candidate_value}
                              </span>
                              {f.corrected_value && (
                                <span className="font-mono font-bold text-gold">
                                  {f.corrected_value}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className="font-mono text-[11px] text-emerald-400">
                            {(f.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400 max-w-xs truncate" title={f.provenance_context || ""}>
                          <span className="font-semibold text-white">Page {f.source_page}</span>
                          {f.provenance_context && (
                            <div className="text-[10px] text-slate-500 truncate">
                              "{f.provenance_context}"
                            </div>
                          )}
                        </td>
                        <td className="p-2.5">
                          <Badge
                            tone={
                              f.review_status === "accepted"
                                ? "ok"
                                : f.review_status === "rejected"
                                ? "error"
                                : f.review_status === "corrected"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {f.review_status.replace(/_/g, " ")}
                          </Badge>
                          {f.reviewed_by && (
                            <div className="text-[9.5px] text-slate-400 mt-0.5">
                              by {f.reviewed_by}
                            </div>
                          )}
                        </td>
                        {canReview && (
                          <td className="p-2.5 text-right space-x-1.5 whitespace-nowrap">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onReviewField(f.field_key, "corrected", editValue, editNotes);
                                    setEditingKey(null);
                                  }}
                                  className="rounded bg-gold/20 px-2 py-1 text-[11px] font-semibold text-champagne hover:bg-gold/30"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingKey(null)}
                                  className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onReviewField(f.field_key, "accepted")}
                                  title="Accept Candidate Value"
                                  className="rounded p-1 text-emerald-400 hover:bg-emerald-500/10"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingKey(f.field_key);
                                    setEditValue(f.corrected_value || f.candidate_value);
                                    setEditNotes("");
                                  }}
                                  title="Enter Corrected Value"
                                  className="rounded p-1 text-gold hover:bg-gold/10"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onReviewField(f.field_key, "rejected")}
                                  title="Reject Candidate Field"
                                  className="rounded p-1 text-rose-400 hover:bg-rose-500/10"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: Page-by-Page Raw Text */}
      {subTab === "text" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {pages.map((p) => (
                <button
                  key={p.page_number}
                  type="button"
                  onClick={() => setSelectedPage(p.page_number)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    selectedPage === p.page_number
                      ? "bg-gold/20 text-champagne ring-1 ring-gold/40"
                      : "bg-surface/50 text-slate-400 hover:text-white"
                  }`}
                >
                  Page {p.page_number} ({p.word_count} w)
                </button>
              ))}
            </div>

            {activePageObj && (
              <button
                type="button"
                onClick={() => handleCopy(activePageObj.extracted_text)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-gold"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied!" : "Copy Page Text"}
              </button>
            )}
          </div>

          {activePageObj ? (
            <div className="rounded-lg border border-line bg-black/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-line/40 pb-1.5">
                <span>Method: <strong className="text-white">{activePageObj.extraction_method}</strong></span>
                <span>Confidence: <strong className="text-emerald-400">{(activePageObj.confidence * 100).toFixed(0)}%</strong></span>
              </div>
              <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-slate-200 leading-relaxed selection:bg-gold/30">
                {activePageObj.extracted_text || "(No text content extracted on this page)"}
              </pre>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              No page text available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ============================================================================
 * Phase 5: Privacy-Preserving Cross-Institution Matching Components
 * ============================================================================ */

const MATCH_STATUS_MAP: Record<string, [string, Tone]> = {
  PENDING_REVIEW: ["Pending Review", "warning"],
  UNDER_REVIEW: ["Under Review", "warning"],
  CONFIRMED_DUPLICATE: ["Confirmed Duplicate", "error"],
  FALSE_POSITIVE: ["False Positive / Cleared", "ok"],
  INSUFFICIENT_EVIDENCE: ["Evidence Required", "warning"],
  ESCALATED: ["Escalated to AICTE", "flag"],
};

const CLASSIFICATION_MAP: Record<string, { label: string; tone: Tone; desc: string }> = {
  HIGH_CONFIDENCE_EXACT: {
    label: "Exact APAAR Blind Index",
    tone: "ok",
    desc: "Deterministic agreement on verified APAAR HMAC-SHA256 blind index.",
  },
  MULTI_FIELD_COMPOSITE: {
    label: "Composite Agreement",
    tone: "flag",
    desc: "High phonetic name token overlap (Jaccard >= 0.75) and identical DOB bucket.",
  },
  CONFLICTING_INFO: {
    label: "Conflicting Demographics",
    tone: "error",
    desc: "Same identifier with divergent DOB bucket or demographic records.",
  },
  NAME_ONLY_LEAD: {
    label: "Name-Only Lead",
    tone: "neutral",
    desc: "Phonetic similarity without secondary demographic corroboration (investigation lead only).",
  },
};

export function PrivacyMatchingCard({ canResolve }: { canResolve: boolean }) {
  return (
    <Card
      title={
        <div className="flex items-center gap-2.5">
          <Fingerprint className="h-5 w-5 text-gold" />
          <span>Privacy-Preserving Cross-Institution Matches</span>
        </div>
      }
    >
      <PrivacyMatchingContent canResolve={canResolve} />
    </Card>
  );
}

function PrivacyMatchingContent({ canResolve }: { canResolve: boolean }) {
  const qMatches = usePoll(() => getJson<S["CandidateMatchesPage"]>("/v1/matching/candidates?page_size=50"), 15000);
  const qStats = usePoll(() => getJson<S["MatchingStatsOut"]>("/v1/matching/stats"), 20000);

  const [tab, setTab] = useState<"all" | "pending" | "high_confidence" | "composite" | "conflicting" | "name_only" | "resolved">("pending");
  const [running, setRunning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleRunMatching = async () => {
    setRunning(true);
    setScanResult(null);
    setScanError(null);
    try {
      const res = await sendJson<S["MatchingJobOut"]>("/v1/matching/run", "POST", { academic_year: "2026-27" });
      setScanResult(
        `Cross-institution scan completed in ${res.duration_ms}ms: evaluated ${res.total_evaluated_records} active enrolments across ${res.candidate_pairs_evaluated} pairs. Found ${res.total_candidates} candidates (${res.candidates_created} new).`
      );
      qMatches.refresh();
      qStats.refresh();
    } catch (err) {
      setScanError(err instanceof ApiError ? err.text : "Failed to execute cross-institution matching scan");
    } finally {
      setRunning(false);
    }
  };

  if (qMatches.error && !qMatches.data) return <ErrorNote>{qMatches.error}</ErrorNote>;
  if (!qMatches.data) return <Loading />;

  const candidates = qMatches.data.items || [];
  const stats = qStats.data;

  const filtered = candidates.filter((m) => {
    if (tab === "pending") return m.status === "PENDING_REVIEW" || m.status === "UNDER_REVIEW";
    if (tab === "high_confidence") return m.classification === "HIGH_CONFIDENCE_EXACT";
    if (tab === "composite") return m.classification === "MULTI_FIELD_COMPOSITE";
    if (tab === "conflicting") return m.classification === "CONFLICTING_INFO";
    if (tab === "name_only") return m.classification === "NAME_ONLY_LEAD";
    if (tab === "resolved") return m.status === "CONFIRMED_DUPLICATE" || m.status === "FALSE_POSITIVE";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Privacy banner & explainability header */}
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-xs leading-relaxed text-slate-300 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-champagne text-sm">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>Privacy-Preserving Cross-Institution Matcher (SIH PS 26263)</span>
          </div>
          <span className="rounded-md border border-gold/40 bg-black/40 px-2 py-0.5 font-mono text-[11px] text-gold">
            RULE_V1_0 · NORM_V1_0
          </span>
        </div>
        <p>
          Candidate matches are identified via versioned <strong>HMAC-SHA256 blind indexing</strong> (<code className="text-gold">apaar_bi</code>) and privacy-preserving buckets (<code className="text-gold">dob_bucket</code>, <code className="text-gold">name_phonetic</code>) without disclosing student personal information across institutional boundaries. Peer institution student records are redacted for non-regulators.
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-gold/20 text-[11px] text-slate-400">
          <span>⚠️ <em>A candidate match is a lead for review, NOT proof of identity, fraud, or misconduct. Consequential decisions require authorized human review.</em></span>
          {canResolve && (
            <Button
              variant="primary"
              onClick={handleRunMatching}
              disabled={running}
              className="py-1 px-3 text-xs flex items-center gap-1.5"
            >
              {running ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>{running ? "Evaluating..." : "Run Cross-Institution Scan"}</span>
            </Button>
          )}
        </div>
        {scanResult && (
          <div className="mt-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-2 text-emerald-300 text-xs">
            {scanResult}
          </div>
        )}
        {scanError && (
          <div className="mt-2 rounded-lg bg-rose-950/40 border border-rose-500/30 p-2 text-rose-300 text-xs">
            {scanError}
          </div>
        )}
      </div>

      {/* Summary Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-lg border border-line bg-surface/40 p-2.5">
            <div className="text-[11px] text-slate-400">Total Candidates</div>
            <div className="text-lg font-bold text-ink">{stats.total_candidates}</div>
          </div>
          <div className="rounded-lg border border-line bg-surface/40 p-2.5">
            <div className="text-[11px] text-slate-400">Pending Review</div>
            <div className="text-lg font-bold text-amber-400">{stats.pending_review_count}</div>
          </div>
          <div className="rounded-lg border border-line bg-surface/40 p-2.5">
            <div className="text-[11px] text-slate-400">Confirmed Duplicates</div>
            <div className="text-lg font-bold text-rose-400">{stats.confirmed_duplicate_count}</div>
          </div>
          <div className="rounded-lg border border-line bg-surface/40 p-2.5">
            <div className="text-[11px] text-slate-400">False Positives Cleared</div>
            <div className="text-lg font-bold text-emerald-400">{stats.false_positive_count}</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div role="group" aria-label="Filter matches" className="flex flex-wrap gap-1.5 border-b border-line/60 pb-2">
        {([
          ["pending", "Action Required"],
          ["all", `All (${candidates.length})`],
          ["high_confidence", "Exact Match"],
          ["composite", "Composite"],
          ["conflicting", "Conflicting"],
          ["name_only", "Name-Only Leads"],
          ["resolved", "Resolved"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            aria-pressed={tab === k}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
              tab === k
                ? "bg-gold/20 text-champagne ring-1 ring-gold/40 shadow-xs font-semibold"
                : "text-slate-400 hover:text-ink hover:bg-white/[0.04]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Candidate Matches List */}
      {filtered.length === 0 ? (
        <Empty>
          {tab === "pending"
            ? "No candidate matches currently pending review."
            : "No candidate matches match the selected filter."}
        </Empty>
      ) : (
        <ul className="space-y-3">
          {filtered.map((match) => (
            <CandidateMatchItem
              key={match.id}
              match={match}
              canResolve={canResolve}
              onUpdated={() => {
                qMatches.refresh();
                qStats.refresh();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CandidateMatchItem({
  match,
  canResolve,
  onUpdated,
}: {
  match: S["CandidateMatchOut"];
  canResolve: boolean;
  onUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<"CONFIRM_DUPLICATE" | "MARK_FALSE_POSITIVE" | "REQUEST_EVIDENCE" | "ESCALATE" | "SET_UNDER_REVIEW">("CONFIRM_DUPLICATE");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusInfo = MATCH_STATUS_MAP[match.status] || [match.status, "neutral" as Tone];
  const classInfo = CLASSIFICATION_MAP[match.classification] || {
    label: match.classification,
    tone: "neutral" as Tone,
    desc: "",
  };

  const handleReview = async () => {
    if (notes.trim().length < 5) {
      setError("Review rationale is required and must be at least 5 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await sendJson<S["CandidateMatchOut"]>(`/v1/matching/candidates/${match.id}/review`, "POST", {
        action,
        notes: notes.trim(),
      });
      onUpdated();
      setExpanded(false);
      setNotes("");
    } catch (err) {
      setError(err instanceof ApiError ? err.text : "Failed to record review decision");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="rounded-xl border border-line/80 bg-surface/30 p-4 transition-all hover:border-gold/30 hover:bg-surface/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-gold">{match.id}</span>
            <Badge tone={classInfo.tone}>{classInfo.label}</Badge>
            <Badge tone={statusInfo[1]}>{statusInfo[0]}</Badge>
            <span className="text-[11px] text-slate-500 font-mono">
              Confidence: <strong className="text-slate-200">{(match.confidence_score * 100).toFixed(0)}%</strong>
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-normal">{classInfo.desc}</p>
        </div>

        <div className="flex items-center gap-2">
          {match.linked_case_id && (
            <span className="rounded-md border border-line bg-black/40 px-2.5 py-1 text-[11px] text-slate-300 font-mono">
              Linked Case #{match.linked_case_id} (E203)
            </span>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-line bg-surface/60 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white hover:border-gold/40 transition-all"
          >
            {expanded ? "Hide Details" : "Inspect Records"}
          </button>
        </div>
      </div>

      {/* Field matching tags */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-slate-400">Matched:</span>
        {match.matched_fields.map((f) => (
          <span key={f} className="rounded bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.5 text-emerald-300 font-mono">
            {f}
          </span>
        ))}
        {match.conflicting_fields.length > 0 && (
          <>
            <span className="text-slate-400 ml-2">Conflicting:</span>
            {match.conflicting_fields.map((f) => (
              <span key={f} className="rounded bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 text-rose-300 font-mono">
                {f}
              </span>
            ))}
          </>
        )}
      </div>

      {/* Expanded Inspection & Review Panel */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t border-line/60 pt-4">
          {/* Side-by-side Record Inspection with Data Minimization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Record A */}
            <div className="rounded-lg border border-line bg-black/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-line/40 pb-2">
                <span className="font-semibold text-ink">Record A (Enrolment #{match.record_a.enrolment_id})</span>
                {match.record_a.is_own_institution ? (
                  <span className="rounded bg-gold/15 border border-gold/40 px-2 py-0.5 text-[10px] text-champagne font-semibold">
                    Own Institution
                  </span>
                ) : (
                  <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                    Peer Record
                  </span>
                )}
              </div>
              <div className="space-y-1 text-xs">
                <div><span className="text-slate-400">Institution:</span> <strong className="text-slate-200">{match.record_a.institution_name} ({match.record_a.institution_id})</strong></div>
                <div><span className="text-slate-400">Programme:</span> <strong className="text-slate-200">{match.record_a.programme_name || match.record_a.programme_id}</strong></div>
                <div><span className="text-slate-400">Student ID / Roll:</span> <strong className="text-slate-200 font-mono">{match.record_a.institution_student_id}</strong></div>
                <div><span className="text-slate-400">APAAR Masked:</span> <strong className="text-slate-200 font-mono">{match.record_a.apaar_masked}</strong></div>
              </div>
            </div>

            {/* Record B */}
            <div className="rounded-lg border border-line bg-black/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-line/40 pb-2">
                <span className="font-semibold text-ink">Record B (Enrolment #{match.record_b.enrolment_id})</span>
                {match.record_b.is_own_institution ? (
                  <span className="rounded bg-gold/15 border border-gold/40 px-2 py-0.5 text-[10px] text-champagne font-semibold">
                    Own Institution
                  </span>
                ) : (
                  <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                    Peer Record (Minimised)
                  </span>
                )}
              </div>
              <div className="space-y-1 text-xs">
                <div><span className="text-slate-400">Institution:</span> <strong className="text-slate-200">{match.record_b.institution_name} ({match.record_b.institution_id})</strong></div>
                <div><span className="text-slate-400">Programme:</span> <strong className="text-slate-200">{match.record_b.programme_name || match.record_b.programme_id}</strong></div>
                <div><span className="text-slate-400">Student ID / Roll:</span> <strong className="text-slate-200 font-mono">{match.record_b.institution_student_id}</strong></div>
                <div><span className="text-slate-400">APAAR Masked:</span> <strong className="text-slate-200 font-mono">{match.record_b.apaar_masked}</strong></div>
              </div>
            </div>
          </div>

          {/* Audit & Decision Trail if already reviewed */}
          {match.reviewed_by && (
            <div className="rounded-lg border border-line/60 bg-surface/20 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Reviewed by: <strong className="text-slate-200">{match.reviewed_by}</strong></span>
                <span>{match.reviewed_at ? fmtTime(match.reviewed_at) : ""}</span>
              </div>
              {match.review_notes && (
                <div className="text-slate-300"><span className="text-slate-400 font-medium">Notes:</span> {match.review_notes}</div>
              )}
              {match.audit_ref && (
                <div className="text-slate-500 font-mono text-[10px]">Ref: {match.audit_ref}</div>
              )}
            </div>
          )}

          {/* Human Review Form */}
          {canResolve && (
            <div className="rounded-lg border border-gold/30 bg-surface/40 p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-champagne text-xs">
                <Pencil className="h-4 w-4 text-gold" />
                <span>Record Human Review Decision (Synchronizes with E203 Duplicate Case)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor={`decision-${match.id}`} className="block text-slate-400 mb-1">Determination Outcome</label>
                  <select
                    id={`decision-${match.id}`}
                    value={action}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="w-full rounded-lg border border-line bg-black/60 px-3 py-1.5 text-xs text-white focus:border-gold focus:outline-hidden"
                  >
                    <option value="CONFIRM_DUPLICATE">Confirm Duplicate (Consequential finding)</option>
                    <option value="MARK_FALSE_POSITIVE">Mark False Positive / Cleared</option>
                    <option value="REQUEST_EVIDENCE">Request Evidence from Institutions</option>
                    <option value="ESCALATE">Escalate to AICTE Appellate Authority</option>
                    <option value="SET_UNDER_REVIEW">Keep Under Active Review</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`notes-${match.id}`} className="block text-slate-400 mb-1">Review Rationale / Notes (Min 5 chars)</label>
                  <input
                    id={`notes-${match.id}`}
                    type="text"
                    placeholder="Enter factual basis for determination..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-line bg-black/60 px-3 py-1.5 text-xs text-white focus:border-gold focus:outline-hidden"
                  />
                </div>
              </div>

              {error && <div className="text-rose-400 text-xs">{error}</div>}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="secondary"
                  onClick={() => setExpanded(false)}
                  disabled={saving}
                  className="py-1 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleReview}
                  disabled={saving}
                  className="py-1 px-3 text-xs flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="h-3 w-3 animate-spin" />}
                  <span>Confirm & Save Decision</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------
 * Phase 6: Student Corrections & Dispute Review Queue
 * ------------------------------------------------------------------------- */

export function DisputeQueueContent({ canResolve }: { canResolve: boolean }) {
  const q = usePoll(() => getJson<S["GrievanceOut"][]>("/v1/grievances"), 10000);
  const [tab, setTab] = useState<"pending" | "corrections" | "disputes" | "resolved" | "all">("pending");
  const [limit, setLimit] = useState(25);

  if (q.error && !q.data) return <ErrorNote>{q.error}</ErrorNote>;
  if (!q.data) return <Loading />;

  const isPending = (g: S["GrievanceOut"]) =>
    g.status === "submitted" ||
    g.status === "under_review" ||
    g.status === "needs_more_information" ||
    g.status === "acknowledged" ||
    g.status === "response_required";

  const pending = q.data.filter(isPending);
  const corrections = q.data.filter((g) => g.record_type === "correction_request");
  const disputes = q.data.filter((g) => g.record_type !== "correction_request");
  const resolved = q.data.filter((g) => !isPending(g));

  let list = q.data;
  if (tab === "pending") list = pending;
  else if (tab === "corrections") list = corrections;
  else if (tab === "disputes") list = disputes;
  else if (tab === "resolved") list = resolved;

  return (
    <Card
      title={
        <div className="flex items-center gap-2.5">
          <Scale className="h-5 w-5 text-gold" />
          <span>Student Corrections & Dispute Review Queue</span>
        </div>
      }
      actions={
        <div role="group" aria-label="Filter disputes" className="flex flex-wrap gap-1.5">
          {([
            ["pending", `Pending Action (${pending.length})`],
            ["corrections", `Corrections (${corrections.length})`],
            ["disputes", `Disputes (${disputes.length})`],
            ["resolved", `Decided (${resolved.length})`],
            ["all", `All (${q.data.length})`],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => { setTab(k); setLimit(25); }}
              aria-pressed={tab === k}
              className={`rounded-full px-3 py-1 text-[13px] font-semibold transition-all ${
                tab === k
                  ? "bg-gold/15 text-champagne ring-1 ring-gold/40 shadow-xs"
                  : "text-slate-400 hover:text-ink hover:bg-white/[0.04]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <p className="text-xs text-slate-400 mb-4">
        Review student academic record correction requests and contested duplicate enrolments. Reviewers inspect evidentiary proof,
        verify file integrity hashes, request additional clarification, or approve corrections that automatically update authoritative institutional records.
      </p>

      {list.length === 0 ? (
        <Empty>{tab === "pending" ? "No correction requests or disputes waiting for review." : "No records match this filter."}</Empty>
      ) : (
        <ul className="space-y-4">
          {list.slice(0, limit).map((g) => (
            <ReviewGrievanceRow key={g.id} g={g} canResolve={canResolve} onChange={q.refresh} />
          ))}
        </ul>
      )}

      {list.length > limit && (
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={() => setLimit(limit + 50)}>
            Show more ({list.length - limit} left)
          </Button>
        </div>
      )}
    </Card>
  );
}

function ReviewGrievanceRow({
  g,
  canResolve,
  onChange,
}: {
  g: S["GrievanceOut"];
  canResolve: boolean;
  onChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "evidence" | "review">("details");

  // Communication state
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Evidence verification state
  const [verifyResults, setVerifyResults] = useState<Record<number, S["EvidenceIntegrityOut"]>>({});
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Review action state
  const [decision, setDecision] = useState<"approved" | "rejected" | "more_info_needed" | "escalated">("approved");
  const [rationale, setRationale] = useState("");
  const [applyChanges, setApplyChanges] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const isCorrection = g.record_type === "correction_request";
  const isPending =
    g.status === "submitted" ||
    g.status === "under_review" ||
    g.status === "needs_more_information" ||
    g.status === "acknowledged" ||
    g.status === "response_required";

  const statusToneMap: Record<string, Tone> = {
    submitted: "neutral",
    acknowledged: "ok",
    under_review: "warning",
    needs_more_information: "flag",
    response_required: "flag",
    resolution_proposed: "ok",
    accepted: "ok",
    resolved: "ok",
    rejected: "neutral",
    escalated: "flag",
    withdrawn: "neutral",
    closed: "neutral",
  };

  const handleVerifyIntegrity = async (evidenceId: number) => {
    setVerifyingId(evidenceId);
    try {
      const res = await sendJson<S["EvidenceIntegrityOut"]>(`/v1/evidence/${evidenceId}/verify-integrity`, "POST");
      setVerifyResults((prev) => ({ ...prev, [evidenceId]: res }));
    } catch {
      // ignore
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSendResponse = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    setReviewError(null);
    try {
      await sendJson(`/v1/grievances/${g.id}/responses`, "POST", {
        message: replyText.trim(),
        visibility: "student_visible",
      });
      setReplyText("");
      onChange();
    } catch (e: any) {
      setReviewError(e instanceof ApiError ? e.text : e.message || "Failed to post response");
    } finally {
      setSendingReply(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rationale.trim().length < 5) {
      setReviewError("Review rationale must be at least 5 characters.");
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await sendJson(`/v1/grievances/${g.id}/review`, "POST", {
        decision,
        rationale: rationale.trim(),
        apply_changes: applyChanges,
      });
      onChange();
      setExpanded(false);
    } catch (e: any) {
      setReviewError(e instanceof ApiError ? e.text : e.message || "Review submission failed");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <li className="rounded-2xl border border-line bg-surface/90 p-5 shadow-xs transition-all hover:border-gold/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                isCorrection
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-blue-500/15 text-blue-300 border-blue-500/30"
              }`}
            >
              {isCorrection ? "Correction Request" : "Student Dispute"}
            </span>

            <span className="font-display text-[16px] font-bold text-white">
              #{g.id}: {g.subject}
            </span>

            <Badge tone={statusToneMap[g.status] ?? "neutral"} dot>
              {g.status.replace(/_/g, " ")}
            </Badge>

            {g.enrolment_id && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700">
                Enrolment #{g.enrolment_id}
              </span>
            )}

            {g.institution_id && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700">
                Inst: {g.institution_id}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 space-x-2">
            <span>Student Ref: <strong className="font-mono text-slate-300">{g.student_id}</strong></span>
            <span>· Category: <strong className="text-slate-300">{g.category}</strong></span>
            <span>· Submitted: {fmtTime(g.created_at)}</span>
            {g.evidence && g.evidence.length > 0 && <span>· {g.evidence.length} Evidence File(s)</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canResolve && isPending && (
            <Button
              className="text-xs font-semibold"
              onClick={() => {
                setExpanded(true);
                setActiveTab("review");
              }}
            >
              Take Action
            </Button>
          )}
          <Button variant={expanded ? "secondary" : "ghost"} onClick={() => setExpanded(!expanded)} className="text-xs">
            {expanded ? "Hide Details" : "Inspect Request"}
          </Button>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-slate-300 leading-relaxed bg-raised/30 p-3 rounded-xl border border-line/60">
        {g.description}
      </p>

      {/* Side-by-Side Comparison of Proposed Changes */}
      {isCorrection && g.proposed_changes && Object.keys(g.proposed_changes).length > 0 && (
        <div className="mt-3 rounded-xl border border-line bg-raised/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Requested Academic Record Correction</span>
            {g.enrolment_id && <span className="font-mono text-slate-400">Target Enrolment #{g.enrolment_id}</span>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-slate-700/80 bg-black/40 p-2.5">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Current Authoritative Value(s)</span>
              {g.current_values && Object.keys(g.current_values).length > 0 ? (
                <div className="mt-1 space-y-1 font-mono text-slate-300">
                  {Object.entries(g.current_values).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-400 font-sans">{k.replace("_", " ")}: </span>
                      <span className="font-semibold">{String(v ?? "None")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="mt-1 block text-slate-500 italic text-[11px]">Snapshot not recorded</span>
              )}
            </div>

            <div className="rounded-lg border border-gold/40 bg-gold/10 p-2.5">
              <span className="block text-[10px] uppercase font-bold text-champagne">Proposed Value(s) to Apply</span>
              <div className="mt-1 space-y-1 font-mono text-amber-200">
                {Object.entries(g.proposed_changes).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-champagne/80 font-sans">{k.replace("_", " ")}: </span>
                    <span className="font-bold underline">{String(v ?? "")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Summary if already decided */}
      {g.review_decision && (
        <div
          className={`mt-3 rounded-xl border p-3 text-xs ${
            g.review_decision === "approved"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : g.review_decision === "rejected"
              ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
              : "border-amber-500/40 bg-amber-500/10 text-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <strong className="font-bold uppercase tracking-wider">
              Decision: {g.review_decision}
            </strong>
            <span className="font-mono text-[10px] text-slate-400">
              {g.reviewed_at ? fmtTime(g.reviewed_at) : ""}
            </span>
          </div>
          <p className="mt-1">{g.resolution_summary}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-slate-400 font-mono">
            {g.reviewed_by && <span>Reviewer: {g.reviewed_by}</span>}
            {g.applied_at && <span className="text-emerald-400">Applied: {fmtTime(g.applied_at)}</span>}
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-4 border-t border-line/80 pt-4 space-y-4 animate-fade-in">
          {/* Tab buttons */}
          <div className="flex border-b border-line gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`pb-2 text-xs font-semibold transition-all ${
                activeTab === "details" ? "border-b-2 border-gold text-champagne" : "text-slate-400 hover:text-white"
              }`}
            >
              Communication & History ({g.responses?.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("evidence")}
              className={`pb-2 text-xs font-semibold transition-all ${
                activeTab === "evidence" ? "border-b-2 border-gold text-champagne" : "text-slate-400 hover:text-white"
              }`}
            >
              Supporting Evidence ({g.evidence?.length ?? 0})
            </button>
            {canResolve && isPending && (
              <button
                type="button"
                onClick={() => setActiveTab("review")}
                className={`pb-2 text-xs font-semibold transition-all ${
                  activeTab === "review" ? "border-b-2 border-gold text-champagne" : "text-slate-400 hover:text-white"
                }`}
              >
                Review & Determine Action
              </button>
            )}
          </div>

          {activeTab === "details" && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Discussion Thread</h5>
              {!g.responses || g.responses.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No responses logged yet.</p>
              ) : (
                <ol className="space-y-2 border-l-2 border-gold/30 pl-3">
                  {g.responses.map((r) => (
                    <li key={r.id} className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white capitalize">{r.responder_role.replace("_", " ")}</strong>
                        <span className="text-[10px] text-slate-500">{fmtTime(r.created_at)}</span>
                      </div>
                      <p className="rounded-xl border border-line bg-raised/60 p-2.5 text-slate-200">{r.message}</p>
                    </li>
                  ))}
                </ol>
              )}

              {/* Add Official Response */}
              <div className="mt-3 flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Post an official response or instructions to the student…"
                  className="flex-1 rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-xs text-white focus:border-gold focus:outline-hidden"
                />
                <Button disabled={sendingReply || !replyText.trim()} onClick={handleSendResponse} className="text-xs">
                  <Send className="mr-1 h-3.5 w-3.5" /> Post Response
                </Button>
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Submitted Evidence</h5>
              {!g.evidence || g.evidence.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No evidence documents attached to this submission.</p>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {g.evidence.map((ev) => {
                    const check = verifyResults[ev.id];
                    return (
                      <div key={ev.id} className="rounded-xl border border-line bg-raised/50 p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white truncate max-w-[200px]">{ev.filename}</span>
                          <a
                            href={`/v1/evidence/${ev.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gold hover:underline font-semibold"
                          >
                            Download
                          </a>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {ev.category} · {(ev.file_size / 1024).toFixed(1)} KB · SHA-256: {ev.sha256_digest?.slice(0, 12)}…
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-line/60">
                          <button
                            type="button"
                            onClick={() => handleVerifyIntegrity(ev.id)}
                            disabled={verifyingId === ev.id}
                            className="text-[11px] text-slate-300 hover:text-champagne flex items-center gap-1 font-mono"
                          >
                            <FileCheck2 className="h-3.5 w-3.5 text-gold" />
                            {verifyingId === ev.id ? "Verifying…" : check ? "Re-verify Hash" : "Verify SHA-256 Integrity"}
                          </button>

                          {check && (
                            <span className={`text-[11px] font-bold ${check.is_valid ? "text-emerald-400" : "text-rose-400"}`}>
                              {check.is_valid ? "✓ SHA-256 Valid" : "✗ Hash Mismatch"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "review" && canResolve && isPending && (
            <div className="rounded-xl border border-gold/40 bg-raised/50 p-4 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-champagne">Reviewer Determination & Action</h5>

              <div>
                <label className="text-xs font-semibold text-slate-300">Decision Outcome</label>
                <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("approved")}
                    className={`rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      decision === "approved"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                        : "border-slate-700 bg-black/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    ✓ Approve Correction
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("more_info_needed")}
                    className={`rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      decision === "more_info_needed"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500"
                        : "border-slate-700 bg-black/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    Request More Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("rejected")}
                    className={`rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      decision === "rejected"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500"
                        : "border-slate-700 bg-black/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    ✗ Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("escalated")}
                    className={`rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      decision === "escalated"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500"
                        : "border-slate-700 bg-black/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    Escalate to AICTE
                  </button>
                </div>
              </div>

              {decision === "approved" && isCorrection && (
                <label className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/30">
                  <input
                    type="checkbox"
                    checked={applyChanges}
                    onChange={(e) => setApplyChanges(e.target.checked)}
                    className="rounded border-slate-700 bg-black/40 text-gold focus:ring-gold"
                  />
                  <span>
                    <strong>Apply Changes Authoritatively:</strong> Update encrypted student / enrolment attributes immediately and commit cryptographic audit log.
                  </span>
                </label>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Decision Rationale & Determination Notes (min. 5 chars) *
                </label>
                <textarea
                  rows={3}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Record justification, verified document identifiers, or reasons for rejection / information request…"
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-xs text-white focus:border-gold focus:outline-hidden"
                />
              </div>

              {reviewError && <ErrorNote>{reviewError}</ErrorNote>}

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button variant="ghost" className="text-xs" onClick={() => setExpanded(false)}>
                  Cancel
                </Button>
                <Button
                  className="text-xs"
                  disabled={submittingReview || rationale.trim().length < 5}
                  onClick={handleSubmitReview}
                >
                  {submittingReview ? "Submitting Review…" : "Commit Review Decision"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}



// Vidyadwaar Phase 2 & Phase 6: Student Correction Requests & Dispute Resolution Flow
// Allows authenticated students to submit correction requests, contest duplicate flags,
// upload evidentiary documents with cryptographic integrity checks, track timeline, and view reviewer decisions.
import { useEffect, useState } from "react";
import { Plus, Send, Scale, FileCheck2 } from "lucide-react";
import { ApiError, getJson, sendJson, type S } from "../api/client";
import { Badge, Button, Card, Empty, ErrorNote, fmtTime, Loading, usePoll, type Tone } from "../ui";

const GRIEVANCE_CATEGORIES = [
  { value: "incorrect_duplicate", label: "Incorrect Duplicate Record Identification (E203)" },
  { value: "incorrect_personal_info", label: "Incorrect Personal or Academic Information" },
  { value: "incorrect_intake", label: "Incorrect Admission / Seat Intake Classification (E301/E302)" },
  { value: "incorrect_document_verification", label: "Disputed Document Verification Finding" },
  { value: "disputed_decision", label: "Disputed Institutional or Administrative Decision" },
  { value: "missing_record", label: "Missing or Delayed Academic Identity Record" },
  { value: "other", label: "Other Academic Identity or Integrity Dispute" },
];

const CORRECTION_FIELDS = [
  { value: "name", label: "Legal Name Correction", description: "Correct spelling or legal name changes" },
  { value: "dob", label: "Date of Birth (YYYY-MM-DD)", description: "Correction to birth record" },
  { value: "category_code", label: "Seat Intake Category", description: "Quota/category alignment (e.g. REGULAR, SC, ST, OBC, EWS, TFW)" },
  { value: "institution_student_id", label: "Institutional Roll / Student ID", description: "College roll number or registration ID" },
];

const STATUS_MAP: Record<string, [string, Tone]> = {
  submitted: ["Submitted", "neutral"],
  acknowledged: ["Acknowledged by Authority", "ok"],
  under_review: ["Under Review", "warning"],
  needs_more_information: ["Action Required: Info Requested", "flag"],
  response_required: ["Student Action Required", "flag"],
  resolution_proposed: ["Resolution Proposed", "ok"],
  accepted: ["Correction Approved & Applied", "ok"],
  resolved: ["Resolved & Closed", "ok"],
  rejected: ["Rejected", "neutral"],
  escalated: ["Escalated to AICTE", "flag"],
  withdrawn: ["Withdrawn", "neutral"],
  closed: ["Closed", "neutral"],
};

export function StudentGrievanceSection() {
  const grievances = usePoll(() => getJson<S["GrievanceOut"][]>("/v1/students/me/grievances"), 8000);
  const [filter, setFilter] = useState<"all" | "corrections" | "disputes">("all");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMode, setSubmitMode] = useState<"correction" | "dispute">("correction");
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<number | null>(null);

  if (grievances.error && !grievances.data) return <ErrorNote>{grievances.error}</ErrorNote>;

  const allItems = grievances.data ?? [];
  const corrections = allItems.filter((g) => g.record_type === "correction_request");
  const disputes = allItems.filter((g) => g.record_type !== "correction_request");

  let displayed = allItems;
  if (filter === "corrections") displayed = corrections;
  else if (filter === "disputes") displayed = disputes;

  return (
    <Card
      id="grievances"
      title={
        <div className="flex items-center gap-2.5">
          <Scale className="h-5 w-5 text-gold" />
          <span>Academic Corrections & Disputes</span>
        </div>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setSubmitMode("correction");
              setShowSubmitModal(true);
            }}
            className="text-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Request Correction
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSubmitMode("dispute");
              setShowSubmitModal(true);
            }}
            className="text-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> File Dispute
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs text-slate-400 max-w-xl">
          Submit corrections for personal or enrolment details, or dispute incorrect duplicate flags. Every submission
          undergoes institutional or regulatory review with complete cryptographic provenance and audit trails.
        </p>

        {/* Filter Pills */}
        <div className="flex rounded-lg bg-black/40 p-1 border border-line">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              filter === "all" ? "bg-gold/20 text-champagne border border-gold/40 shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            All ({allItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("corrections")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              filter === "corrections" ? "bg-gold/20 text-champagne border border-gold/40 shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Corrections ({corrections.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("disputes")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              filter === "disputes" ? "bg-gold/20 text-champagne border border-gold/40 shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Disputes ({disputes.length})
          </button>
        </div>
      </div>

      {!grievances.data ? (
        <Loading />
      ) : displayed.length === 0 ? (
        <Empty>
          {filter === "corrections"
            ? "You have no academic record correction requests on file."
            : filter === "disputes"
            ? "You have no active or historical dispute cases on file."
            : "You have no active or historical correction requests or grievances."}
        </Empty>
      ) : (
        <div className="space-y-4">
          {displayed.map((g) => (
            <GrievanceItem
              key={g.id}
              g={g}
              expanded={selectedGrievanceId === g.id}
              onToggle={() => setSelectedGrievanceId(selectedGrievanceId === g.id ? null : g.id)}
              onRefresh={grievances.refresh}
            />
          ))}
        </div>
      )}

      {showSubmitModal && (
        <SubmitGrievanceModal
          initialMode={submitMode}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false);
            grievances.refresh();
          }}
        />
      )}
    </Card>
  );
}

function GrievanceItem({
  g,
  expanded,
  onToggle,
  onRefresh,
}: {
  g: S["GrievanceOut"];
  expanded: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evCategory = "student_affidavit";
  const [evFile, setEvFile] = useState<File | null>(null);
  const [uploadingEv, setUploadingEv] = useState(false);

  const [verifyResults, setVerifyResults] = useState<Record<number, S["EvidenceIntegrityOut"]>>({});
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const [statusLabel, statusTone] = STATUS_MAP[g.status] ?? [g.status, "neutral"];
  const isCorrection = g.record_type === "correction_request";

  const isTerminal =
    g.status === "resolved" ||
    g.status === "accepted" ||
    g.status === "rejected" ||
    g.status === "withdrawn" ||
    g.status === "closed";

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    setError(null);
    try {
      await sendJson(`/v1/grievances/${g.id}/responses`, "POST", {
        message: replyText.trim(),
        visibility: "student_visible",
      });
      setReplyText("");
      onRefresh();
    } catch (e: any) {
      setError(e instanceof ApiError ? e.text : e.message || "Failed to submit response");
    } finally {
      setSendingReply(false);
    }
  };

  const uploadEvidence = async () => {
    if (!evFile) return;
    setUploadingEv(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", evFile);
      formData.append("category", evCategory);

      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/v1/students/me/grievances/${g.id}/evidence`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to upload document");
      }
      setEvFile(null);
      onRefresh();
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploadingEv(false);
    }
  };

  const verifyDocIntegrity = async (evId: number) => {
    setVerifyingId(evId);
    try {
      const res = await sendJson<S["EvidenceIntegrityOut"]>(`/v1/evidence/${evId}/verify-integrity`, "POST");
      setVerifyResults((prev) => ({ ...prev, [evId]: res }));
    } catch (e: any) {
      setError(e.message || "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const withdrawGrievance = async () => {
    if (!window.confirm("Are you sure you want to withdraw this request? This action cannot be undone.")) return;
    setWithdrawing(true);
    setError(null);
    try {
      await sendJson(`/v1/grievances/${g.id}/status`, "POST", {
        status: "withdrawn",
        summary: "Withdrawn by student",
      });
      onRefresh();
    } catch (e: any) {
      setError(e instanceof ApiError ? e.text : e.message || "Failed to withdraw");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface/90 p-5 shadow-xs transition-all hover:border-gold/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
              isCorrection
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                : "bg-blue-500/15 text-blue-300 border-blue-500/30"
            }`}>
              {isCorrection ? "Correction Request" : "Dispute"}
            </span>

            <span className="font-display text-[16px] font-bold text-white">
              #{g.id}: {g.subject}
            </span>

            <Badge tone={statusTone} dot>{statusLabel}</Badge>

            {g.enrolment_id && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700">
                Enrolment #{g.enrolment_id}
              </span>
            )}

            {g.case_id && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-champagne border border-gold/30">
                Case #{g.case_id}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 space-x-2">
            <span>Category: <strong className="text-slate-300">{g.category}</strong></span>
            <span>· Submitted: {fmtTime(g.created_at)}</span>
            {g.responses && g.responses.length > 0 && (
              <span>· {g.responses.length} Official Response(s)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isTerminal && (
            <Button
              variant="ghost"
              className="text-xs text-rose-400 hover:text-rose-300"
              disabled={withdrawing}
              onClick={withdrawGrievance}
            >
              Withdraw
            </Button>
          )}
          <Button variant={expanded ? "secondary" : "ghost"} onClick={onToggle} className="text-xs">
            {expanded ? "Hide Details" : "View Details & History"}
          </Button>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-slate-300 leading-relaxed bg-raised/30 p-3 rounded-xl border border-line/60">
        {g.description}
      </p>

      {/* Side-by-side proposed changes comparison */}
      {isCorrection && g.proposed_changes && Object.keys(g.proposed_changes).length > 0 && (
        <div className="mt-3 rounded-xl border border-line bg-raised/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Requested Record Corrections</span>
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
                <span className="mt-1 block text-slate-500 italic text-[11px]">Snapshot not recorded at submission</span>
              )}
            </div>

            <div className="rounded-lg border border-gold/40 bg-gold/10 p-2.5">
              <span className="block text-[10px] uppercase font-bold text-champagne">Proposed Correct Value(s)</span>
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

      {/* Reviewer Determination & Decision Details */}
      {g.review_decision === "approved" && (
        <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <strong className="font-bold text-emerald-300">Official Decision: Approved & Applied</strong>
          <p className="mt-0.5">{g.resolution_summary || "The proposed correction was reviewed, verified, and applied to the authoritative records."}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-emerald-400 font-mono">
            {g.reviewed_by && <span>Reviewed by: {g.reviewed_by}</span>}
            {g.applied_at && <span>Applied at: {fmtTime(g.applied_at)}</span>}
          </div>
        </div>
      )}

      {g.review_decision === "rejected" && (
        <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
          <strong className="font-bold text-rose-300">Official Decision: Rejected</strong>
          <p className="mt-0.5">{g.resolution_summary || "The requested correction or dispute was evaluated and rejected."}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-rose-400 font-mono">
            {g.reviewed_by && <span>Reviewed by: {g.reviewed_by}</span>}
            {g.reviewed_at && <span>Decided: {fmtTime(g.reviewed_at)}</span>}
          </div>
        </div>
      )}

      {g.status === "needs_more_information" && (
        <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
          <strong className="font-bold text-amber-300">Reviewer Notice: Additional Information or Documents Required</strong>
          <p className="mt-0.5">{g.resolution_summary || "The institutional reviewer requires further documentation to process this request. Please reply below or attach additional evidence."}</p>
        </div>
      )}

      {g.review_decision === "escalated" && (
        <div className="mt-3 rounded-xl border border-purple-500/40 bg-purple-500/10 p-3 text-xs text-purple-200">
          <strong className="font-bold text-purple-300">Escalated to AICTE / Regulatory Oversight</strong>
          <p className="mt-0.5">{g.resolution_summary || "This case requires statutory review and has been escalated to higher authority."}</p>
        </div>
      )}

      {g.resolution_summary && !g.review_decision && (
        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <strong className="font-bold text-emerald-300">Resolution Summary:</strong> {g.resolution_summary}
        </div>
      )}

      {expanded && (
        <div className="mt-4 border-t border-line/80 pt-4 space-y-4 animate-fade-in">
          {/* Attached Supporting Documents */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attached Supporting Documents</h5>
            {!g.evidence || g.evidence.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No documents attached yet.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {g.evidence.map((ev) => {
                  const check = verifyResults[ev.id];
                  return (
                    <div key={ev.id} className="rounded-xl border border-line bg-raised/50 p-2.5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-white truncate max-w-[180px]">{ev.filename}</div>
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
                        {ev.category} · {(ev.file_size / 1024).toFixed(1)} KB · <span className="text-gold">{ev.status}</span>
                      </div>

                      <div className="pt-1 flex items-center justify-between border-t border-line/50">
                        <button
                          type="button"
                          onClick={() => verifyDocIntegrity(ev.id)}
                          disabled={verifyingId === ev.id}
                          className="text-[10px] text-slate-400 hover:text-champagne flex items-center gap-1 font-mono"
                        >
                          <FileCheck2 className="h-3 w-3 text-gold" />
                          {verifyingId === ev.id ? "Verifying…" : check ? "Re-verify Hash" : "Verify Integrity"}
                        </button>

                        {check && (
                          <span className={`text-[10px] font-bold ${check.is_valid ? "text-emerald-400" : "text-rose-400"}`}>
                            {check.is_valid ? "✓ SHA-256 Intact" : "✗ Hash Mismatch"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Document to grievance */}
            {!isTerminal && (
              <div className="mt-2 rounded-xl border border-line bg-raised/30 p-3">
                <span className="text-xs font-semibold text-slate-300">Upload Additional Evidence (Affidavit / Proof)</span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setEvFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-400 file:mr-2 file:rounded-lg file:border-0 file:bg-gold/20 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-champagne hover:file:bg-gold/30"
                  />
                  <Button variant="secondary" className="text-xs" disabled={!evFile || uploadingEv} onClick={uploadEvidence}>
                    {uploadingEv ? "Uploading…" : "Attach Evidence"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Official Communication & Timeline */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Communication Timeline</h5>
            {!g.responses || g.responses.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No responses from reviewer yet. An institutional or AICTE officer will respond here.</p>
            ) : (
              <ol className="space-y-2.5 border-l-2 border-gold/30 pl-3 py-1">
                {g.responses.map((r) => (
                  <li key={r.id} className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white capitalize">{r.responder_role.replace("_", " ")}</strong>
                      <span className="text-[10px] text-slate-500">{fmtTime(r.created_at)}</span>
                    </div>
                    <p className="rounded-xl border border-line bg-raised/60 p-3 text-slate-200">{r.message}</p>
                  </li>
                ))}
              </ol>
            )}

            {/* Reply Input */}
            {!isTerminal && (
              <div className="mt-3 flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide clarification or response to the reviewer…"
                  className="flex-1 rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-xs text-white focus:border-gold focus:outline-hidden"
                />
                <Button disabled={sendingReply || !replyText.trim()} onClick={sendReply} className="text-xs">
                  <Send className="mr-1 h-3.5 w-3.5" /> Reply
                </Button>
              </div>
            )}
          </div>

          {error && <ErrorNote>{error}</ErrorNote>}
        </div>
      )}
    </div>
  );
}

function SubmitGrievanceModal({
  initialMode,
  onClose,
  onSuccess,
}: {
  initialMode: "correction" | "dispute";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<"correction" | "dispute">(initialMode);
  const [profile, setProfile] = useState<S["StudentProfile"] | null>(null);

  // Correction specific fields
  const [selectedEnrolmentId, setSelectedEnrolmentId] = useState<number | null>(null);
  const [fieldToCorrect, setFieldToCorrect] = useState<string>("name");
  const [proposedValue, setProposedValue] = useState<string>("");

  // Dispute specific fields
  const [category, setCategory] = useState("incorrect_duplicate");
  const [caseId, setCaseId] = useState<string>("");

  // Common fields
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load student profile for enrolment picker
  useEffect(() => {
    getJson<S["StudentProfile"]>("/v1/students/me")
      .then((p) => {
        setProfile(p);
        if (p.enrolments && p.enrolments.length > 0) {
          setSelectedEnrolmentId(p.enrolments[0].id ?? null);
        }
      })
      .catch(() => {});
  }, []);

  // Update default subject when mode or field changes
  useEffect(() => {
    if (mode === "correction") {
      const fieldObj = CORRECTION_FIELDS.find((f) => f.value === fieldToCorrect);
      setSubject(`Request for Correction: ${fieldObj?.label ?? fieldToCorrect}`);
    } else {
      setSubject("Disputed Academic Record / Enrolment Inconsistency");
    }
  }, [mode, fieldToCorrect]);

  const selectedEnrolment = profile?.enrolments?.find((e) => e.id === selectedEnrolmentId);

  // Derive current value for the selected field
  let currentValue = "";
  if (fieldToCorrect === "category_code") {
    currentValue = selectedEnrolment?.category_code ?? "REGULAR";
  } else if (fieldToCorrect === "institution_student_id") {
    currentValue = selectedEnrolment?.institution_student_id ?? "";
  } else if (fieldToCorrect === "name") {
    currentValue = "Authoritative Name (Encrypted)";
  } else if (fieldToCorrect === "dob") {
    currentValue = "Authoritative DOB (Encrypted)";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 5) {
      setError("Subject must be at least 5 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Please provide a comprehensive explanation (at least 10 characters).");
      return;
    }
    if (mode === "correction" && !proposedValue.trim()) {
      setError("Please provide the proposed corrected value.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let created: S["GrievanceOut"];

      if (mode === "correction") {
        const proposedChanges: Record<string, any> = {};
        proposedChanges[fieldToCorrect] = proposedValue.trim();

        created = await sendJson<S["GrievanceOut"]>("/v1/students/me/corrections", "POST", {
          category: `correction_${fieldToCorrect}`,
          subject: subject.trim(),
          description: description.trim(),
          enrolment_id: selectedEnrolmentId,
          institution_id: selectedEnrolment?.institution_id ?? null,
          proposed_changes: proposedChanges,
        });
      } else {
        created = await sendJson<S["GrievanceOut"]>("/v1/students/me/grievances", "POST", {
          category,
          subject: subject.trim(),
          description: description.trim(),
          case_id: caseId ? Number(caseId) : null,
          enrolment_id: selectedEnrolmentId,
          record_type: "grievance",
        });
      }

      // If document attached, upload it
      if (file && created.id) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", mode === "correction" ? "corrected_academic_record" : "student_affidavit");
        const token = localStorage.getItem("auth_token");
        await fetch(`/v1/students/me/grievances/${created.id}/evidence`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err instanceof ApiError ? err.text : err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = "mt-1 block w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-xs text-white focus:border-gold focus:outline-hidden";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-gold/30 bg-surface p-6 shadow-premium-lg animate-fade-in space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-gold" />
            <h3 className="font-display text-lg font-bold text-ink">
              {mode === "correction" ? "Request Academic Record Correction" : "Submit Student Dispute / Grievance"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Segmented Mode Selector */}
        <div className="flex rounded-xl bg-black/50 p-1 border border-line">
          <button
            type="button"
            onClick={() => setMode("correction")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === "correction"
                ? "bg-gold/20 text-champagne border border-gold/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Academic Record Correction
          </button>
          <button
            type="button"
            onClick={() => setMode("dispute")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === "dispute"
                ? "bg-gold/20 text-champagne border border-gold/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Dispute / Grievance
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "correction" ? (
            <>
              {/* Enrolment Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300">Target Academic Enrolment</label>
                {profile?.enrolments && profile.enrolments.length > 0 ? (
                  <select
                    value={selectedEnrolmentId ?? ""}
                    onChange={(e) => setSelectedEnrolmentId(Number(e.target.value))}
                    className={inputStyle}
                  >
                    {profile.enrolments.map((enr, i) => (
                      <option key={enr.id ?? i} value={enr.id ?? ""} className="bg-slate-900 text-white">
                        {enr.programme} · {enr.institution} ({enr.academic_year}) [ID: {enr.institution_student_id}]
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-1">No active enrolment records found to correct.</p>
                )}
              </div>

              {/* Field to correct */}
              <div>
                <label className="text-xs font-semibold text-slate-300">Data Field to Correct</label>
                <select
                  value={fieldToCorrect}
                  onChange={(e) => setFieldToCorrect(e.target.value)}
                  className={inputStyle}
                >
                  {CORRECTION_FIELDS.map((f) => (
                    <option key={f.value} value={f.value} className="bg-slate-900 text-white">
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Value vs Proposed Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Current Value</label>
                  <div className="mt-1 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 font-mono truncate">
                    {currentValue || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-champagne">Proposed Correct Value *</label>
                  <input
                    value={proposedValue}
                    onChange={(e) => setProposedValue(e.target.value)}
                    placeholder={fieldToCorrect === "dob" ? "YYYY-MM-DD" : "Enter corrected value…"}
                    className={inputStyle}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300">Dispute Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyle}>
                  {GRIEVANCE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-slate-900 text-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Related Case ID (Optional)</label>
                <input
                  type="number"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="e.g. 1"
                  className={inputStyle}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300">Subject / Headline (min. 5 chars)</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of correction or dispute"
              className={inputStyle}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              {mode === "correction" ? "Reason for Correction & Factual Context (min. 10 chars)" : "Detailed Statement of Facts (min. 10 chars)"}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                mode === "correction"
                  ? "Explain why this correction is needed and reference any official documents submitted (e.g. Gazette notification, corrected mark sheet, birth certificate)…"
                  : "Describe the discrepancy, admission timeline, communications, and relief sought…"
              }
              className={inputStyle}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              Supporting Proof / Evidence (PDF, Image; max 10MB)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-xs text-slate-400 file:mr-2 file:rounded-lg file:border-0 file:bg-gold/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-champagne hover:file:bg-gold/30"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Files are hashed with SHA-256 upon receipt. Reviewers can verify file integrity against official institutional records.
            </p>
          </div>

          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
            <Button disabled={submitting} type="submit">
              {submitting ? "Submitting…" : mode === "correction" ? "Submit Correction Request" : "Register Grievance"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"""API contract: the single source of truth for request/response shapes.
`py -m app.export_openapi` writes openapi.json; the frontend codes against it.
Change this file first, then backend and frontend.
"""
import re
from datetime import date, datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

# ---------- upload row (data dictionary, PRD Req 2) ----------
CSV_COLUMNS = [
    "apaar_id",               # 12 digits, or blank with apaar_reason
    "apaar_reason",           # REFUSED | NOT_GENERATED | PENDING (only when apaar_id blank)
    "institution_student_id", # institution roll number, printed on certificates (Req 10)
    "student_name",
    "dob",                    # YYYY-MM-DD
    "guardian_name",
    "programme_code",         # programme code within the uploading institution
    "academic_year",          # e.g. 2026-27
    "year_of_study",          # 1..duration
    "seat_category",          # REGULAR | SN_FN_OCI_CIWG
    "is_supernumerary",       # Y/N, must agree with seat_category scope
    "is_lateral_entry",       # Y/N, only valid with year_of_study = 2
    "is_nri", "is_oci", "is_fn", "is_ciwg",  # Y/N
    "admission_date",         # YYYY-MM-DD
    "declared_intake",        # optional; compared with AICTE registry (E303), never used as the limit
]
REQUIRED_COLUMNS = [c for c in CSV_COLUMNS if c not in ("apaar_id", "apaar_reason", "guardian_name", "declared_intake")]
APAAR_REASONS = ("REFUSED", "NOT_GENERATED", "PENDING")

Severity = Literal["error", "warning", "flag"]
Role = Literal["institution_admin", "aicte_officer", "auditor", "verifier", "student", "guardian", "university_registrar"]


class StudentRow(BaseModel):
    """JSON channel body row; same fields as the CSV, already typed."""
    apaar_id: str | None = None
    apaar_reason: Literal["REFUSED", "NOT_GENERATED", "PENDING"] | None = None
    institution_student_id: str
    student_name: str
    dob: date
    guardian_name: str | None = None
    programme_code: str
    academic_year: str
    year_of_study: int
    seat_category: str
    is_supernumerary: bool = False
    is_lateral_entry: bool = False
    is_nri: bool = False
    is_oci: bool = False
    is_fn: bool = False
    is_ciwg: bool = False
    admission_date: date
    declared_intake: int | None = None


class BatchJsonIn(BaseModel):
    rows: list[StudentRow]


class Issue(BaseModel):
    row_no: int = Field(description="1-based data row; 0 = batch level")
    code: str
    severity: Severity
    field: str | None = None
    title: str = Field(description="short plain-language name of the problem (same for every row with this code)")
    message: str = Field(description="rendered from i18n/<locale>.json for the requested locale")
    fix_hint: str


class BatchCounts(BaseModel):
    rows: int = 0
    accepted: int = 0
    rejected: int = 0
    warnings: int = Field(0, description="rows with at least one warning")
    flags: int = Field(0, description="rows with at least one AICTE-review flag")
    cases_opened: int = 0


class BatchOut(BaseModel):
    batch_id: int
    institution_id: str
    status: Literal["processing", "completed", "failed"]
    channel: Literal["portal_csv", "api_json"]
    created_at: datetime
    counts: "BatchCounts"
    replayed: bool = Field(False, description="true when returned for a repeated Idempotency-Key")


class IssuesPage(BaseModel):
    items: list[Issue]
    next_cursor: int | None


class EnrolmentPatch(BaseModel):
    status: Literal["active", "withdrawn", "migrated", "completed"] | None = None
    ended_on: date | None = None
    year_of_study: int | None = None
    reason: str = Field(min_length=3)


class EnrolmentOut(BaseModel):
    id: int
    programme_id: str
    academic_year: str
    institution_student_id: str
    apaar_masked: str | None
    provisional_id: str | None
    apaar_status: str
    status: str
    seat_category_code: str
    flags: list[str] = Field(description="codes raised by this change, e.g. E501")


class SeatLine(BaseModel):
    category_code: str
    filled: int
    cap: int
    excess: int


class ProgrammeSeats(BaseModel):
    programme_id: str
    name: str
    academic_year: str
    approved_intake: int
    source: Literal["mock"] = "mock"
    lines: list[SeatLine]


class InstitutionDashboard(BaseModel):
    institution_id: str
    name: str
    programmes: list[ProgrammeSeats]
    batches: list[BatchOut]
    open_notices: list[str] = Field(description="neutral case notices, no other-institution data (F4)")
    rejected_rows_total: int = Field(description="rows rejected with errors across all batches (not counted toward intake until resubmitted)")
    apaar_coverage: dict[str, int]


class AicteTotals(BaseModel):
    institutions: int
    active_enrolments: int
    approved_intake: int
    excess_seats: int
    batches: int
    post_deadline_mutations: int


class ExcessRow(BaseModel):
    programme_id: str
    name: str
    institution: str
    state: str
    category_code: str
    filled: int
    cap: int
    excess: int


class CategoryMix(BaseModel):
    regular: int
    nri: int
    oci: int
    fn: int
    ciwg: int
    no_apaar: int


class StateRow(BaseModel):
    state: str
    approved: int
    filled: int
    fill_pct: float | None


class ComplianceRow(BaseModel):
    id: str
    name: str
    state: str
    status: str
    last_upload: datetime | None
    batches: int
    activation_reissues: int = Field(0, description="activation codes reissued (insider-impersonation signal, P1)")


class AicteDashboard(BaseModel):
    totals: AicteTotals
    excess_ranking: list[ExcessRow]
    category_mix: CategoryMix
    by_state: list[StateRow]
    open_cases: int
    upload_compliance: list[ComplianceRow]
    ledger_ok: bool


class AnomalyFlag(BaseModel):
    type: Literal["ENROLMENT_SPIKE", "CATEGORY_MIX_SHIFT", "DOB_CLUSTER", "SEQUENTIAL_APAAR", "DEADLINE_DUMP", "PEER_OUTLIER",
                  "SHARED_STUDENT_RING", "SEAT_BLOCKING"]
    institution_id: str
    programme: str | None
    score: float
    evidence: dict = Field(description="the numbers that triggered the rule")
    explanation: str
    label: str = Field(description="always: risk indicator for review, not proof of misconduct")
    flag_key: str | None = Field(None, description="A4: stable identity of the flag (regulator views)")
    weight: float | None = Field(None, description="A4: current weight of this rule in the inspection queue")
    severity: float | None = Field(None, description="A4: severity mapped to 0..1, comparable across rules")
    review: dict | None = Field(None, description="A4: latest inspector review (decision, reason, reviewer, reviewed_at)")
    suppressed: bool = Field(False, description="A4: dismissed and the primary evidence hasn't changed by more than 20%")


class NetworkNode(BaseModel):
    id: str
    name: str
    state: str
    active: int = Field(description="active enrolments this year")
    ring: str | None = Field(description="id of the flagged ring this college belongs to")
    connected: bool = Field(description="has at least one kept edge")


class NetworkEdge(BaseModel):
    inst_a: str
    inst_b: str
    active_shared: int = Field(description="students active at both colleges this year")
    historical_shared: int = Field(description="students enrolled at both in the last 3 years, not active at both now")
    carousel: int = Field(description="students who moved A -> B -> A")
    weight: float
    kept: bool


class NetworkComponent(BaseModel):
    id: str
    members: list[str]
    colleges: int
    density: float
    shared_students: int
    carousel: int
    active_shared_inside: int
    shared_ratio: float
    has_cycle: bool
    flagged: bool


class NetworkOut(BaseModel):
    academic_year: str
    nodes: list[NetworkNode]
    edges: list[NetworkEdge]
    components: list[NetworkComponent]
    flags: list[AnomalyFlag]
    edge_min: float
    note: str


class FlagReviewIn(BaseModel):
    decision: Literal["confirmed", "dismissed", "needs_info"]
    reason: str = Field(min_length=10, max_length=500, description="written reason without IDs, phone numbers or dates; stored, not audit-logged")

    @field_validator("reason")
    @classmethod
    def no_pii(cls, v: str) -> str:
        # digit runs of 6+ (APAAR, phone, Aadhaar) or dates (DOB): reasons are shown to every regulator
        if re.search(r"\d[\d\s-]{4,}\d|\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}", v):
            raise ValueError("reason must not contain ID numbers, phone numbers or dates")
        return v


class FlagReviewOut(BaseModel):
    id: int
    flag_key: str
    rule: str
    institution_id: str
    decision: str
    reason: str
    reviewer: str
    reviewed_at: datetime
    replayed: bool = False


class RulePerformanceRow(BaseModel):
    rule: str
    confirmed: int
    dismissed: int
    needs_info: int
    precision: float = Field(description="(confirmed + 1) / (confirmed + dismissed + 2), Beta(1,1) prior")
    interval: list[float] = Field(description="90% credible interval")
    weight: float = Field(description="max(weight_floor, precision)")


class ReviewerRow(BaseModel):
    reviewer: str
    reviews: int
    dismissed: int
    dismissal_rate: float


class RulePerformance(BaseModel):
    rules: list[RulePerformanceRow]
    reviewers: list[ReviewerRow]
    weight_floor: float
    flag_dqs_points: float
    note: str


class PeerStatus(BaseModel):
    tests: int = Field(description="peer comparisons run nationally (programme and institution level)")
    flagged: int = Field(description="comparisons that survived Benjamini-Hochberg and the minimum practical gap")
    insufficient: int = Field(description="comparisons skipped because the peer group had fewer than min_peers members")
    min_peers: int
    fdr_q: float = Field(description="false discovery rate controlled across all tests")
    note: str


class Dqs(BaseModel):
    score: float = Field(description="0-100 = 100 x sum(weight x component)")
    components: dict[str, float] = Field(description="each 0-1")
    points: dict[str, float] = Field(description="100 x weight x component; sums to score")
    weights: dict[str, float]


class InstitutionRisk(BaseModel):
    institution_id: str
    dqs: Dqs | None = Field(description="null when nothing was submitted")
    flags: list[AnomalyFlag]


class InspectionEntry(BaseModel):
    rank: int
    institution_id: str
    name: str
    state: str
    status: str
    active: int
    dqs: Dqs | None
    risk: float | None = Field(description="active x ((100 - DQS) + flag_points); null = not submitted (listed first)")
    flag_points: float | None = Field(None, description="sum of weight(rule) x severity x 10 over visible flags, in DQS points")
    why: list[str]
    flags: list[AnomalyFlag]


class LedgerVerifyOut(BaseModel):
    ok: bool
    entries: int
    checkpoint_ok: bool
    problems: list[str] = Field(description="first 20 problems found (chain, checkpoint, or live-row mismatches)")


class CheckpointOut(BaseModel):
    id: int
    upto_seq: int
    root_hash: str
    aicte_sig: str
    published_at: datetime


class EvidenceOut(BaseModel):
    id: int
    case_id: int | None = None
    grievance_id: int | None = None
    category: str
    filename: str
    media_type: str
    file_size: int
    sha256_digest: str
    status: str
    verification_notes: str | None = None
    uploaded_by: str
    uploaded_at: datetime
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    audit_ref: str | None = None


class EvidenceReviewIn(BaseModel):
    status: Literal["verified", "rejected", "needs_clarification", "under_review"]
    notes: str = Field(min_length=3, max_length=500)


class EvidenceIntegrityOut(BaseModel):
    evidence_id: int
    recorded_digest: str
    computed_digest: str
    is_valid: bool
    byte_integrity: str = "INTACT"
    verified_at: datetime
    audit_ref: str | None = None
    disclaimer: str = "Byte-level hash verification confirms file contents match the recorded upload digest. It does not certify legal validity or document authenticity without human evaluation."


class CaseDecisionIn(BaseModel):
    outcome: Literal["CONFIRMED", "NOT_CONFIRMED", "INSUFFICIENT_EVIDENCE", "REFERRED_FOR_ESCALATION"]
    reason: str = Field(min_length=5, max_length=1000)
    evidence_ids: list[int] = Field(default_factory=list)
    rule_ref: str | None = Field(None, description="e.g. E203, E301, E302")
    keep_enrolment_id: int | None = Field(None, description="Required if confirming duplicate: the enrolment that stands")


class CaseDecisionOut(BaseModel):
    id: int
    case_id: int
    outcome: str
    reason: str
    evidence_ids: list[int]
    rule_ref: str | None
    previous_status: str
    resulting_status: str
    decision_maker: str
    decided_at: datetime
    audit_ref: str | None = None


class CaseOut(BaseModel):
    id: int
    status: str
    case_type: str = "E203"
    created_at: datetime
    notice: str = Field(description="Neutral text: names no other institution (F4)")
    enrolment_ids: list[int] = Field(description="Institutions: only their own enrolments in the case. Regulators: all")
    resolution_note: str | None = Field(None, description="Regulators only")
    resolved_at: datetime | None = None
    detail: list[dict] | None = Field(None, description="AICTE officer only, from POST /v1/cases/{id}/unmask with a reason")
    evidence: list[EvidenceOut] = Field(default_factory=list)
    decisions: list[CaseDecisionOut] = Field(default_factory=list)
    linked_grievances: list[int] = Field(default_factory=list)


class CaseResolve(BaseModel):
    status: Literal["confirmed_duplicate", "false_positive", "under_investigation", "under_review", "evidence_required", "decision_pending", "resolved", "rejected", "withdrawn", "escalated"]
    note: str = Field(min_length=3, max_length=500)
    keep_enrolment_id: int | None = Field(None, description="Required for confirmed_duplicate: the enrolment that stands. "
                                          "Credentials of the other enrolments in the case are revoked")


class CaseUnmask(BaseModel):
    reason: str = Field(min_length=10, max_length=300, description="Recorded in the audit log and shown to the student (D6)")


class CorrectionRequestIn(BaseModel):
    category: str
    subject: str = Field(min_length=5, max_length=150)
    description: str = Field(min_length=10, max_length=2000)
    enrolment_id: int | None = None
    case_id: int | None = None
    institution_id: str | None = None
    proposed_changes: dict[str, Any] = Field(default_factory=dict)


class CorrectionReviewIn(BaseModel):
    decision: Literal["approved", "rejected", "more_info_needed", "escalated"]
    rationale: str = Field(min_length=5, max_length=1000)
    apply_changes: bool = True


class GrievanceSubmitIn(BaseModel):
    category: str
    subject: str = Field(min_length=5, max_length=150)
    description: str = Field(min_length=10, max_length=2000)
    enrolment_id: int | None = None
    case_id: int | None = None
    institution_id: str | None = None
    record_type: Literal["grievance", "correction_request"] = "grievance"
    proposed_changes: dict[str, Any] = Field(default_factory=dict)


class GrievanceResponseIn(BaseModel):
    message: str = Field(min_length=2, max_length=2000)
    visibility: Literal["student_visible", "internal_only"] = "student_visible"


class GrievanceResponseOut(BaseModel):
    id: int
    grievance_id: int
    responder_id: str
    responder_role: str
    message: str
    visibility: str
    created_at: datetime


class GrievanceStatusUpdateIn(BaseModel):
    status: Literal["acknowledged", "under_review", "response_required", "needs_more_information", "resolution_proposed", "resolved", "accepted", "rejected", "escalated", "withdrawn", "closed"]
    summary: str | None = Field(None, max_length=500)


class GrievanceOut(BaseModel):
    id: int
    student_id: int
    case_id: int | None = None
    enrolment_id: int | None = None
    institution_id: str | None = None
    record_type: str = "grievance"
    category: str
    subject: str
    description: str
    proposed_changes: dict[str, Any] = Field(default_factory=dict)
    current_values: dict[str, Any] = Field(default_factory=dict)
    status: str
    assigned_to: str | None = None
    resolution_summary: str | None = None
    review_decision: str | None = None
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    applied_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None
    responses: list[GrievanceResponseOut] = Field(default_factory=list)
    evidence: list[EvidenceOut] = Field(default_factory=list)


# ---------- Offline OCR & Candidate Field Extraction Contracts ----------
class OcrCapabilityOut(BaseModel):
    tesseract_available: bool
    tesseract_version: str | None = None
    installed_languages: list[str] = Field(default_factory=list)
    pymupdf_available: bool
    pymupdf_version: str | None = None
    supported_formats: list[str] = Field(default_factory=list)
    offline_mode: bool = True
    model_source: str


class OcrJobTriggerIn(BaseModel):
    language: str = "eng"
    force_reprocess: bool = False


class OcrPageResult(BaseModel):
    page_number: int
    extracted_text: str
    confidence: float
    extraction_method: str
    word_count: int


class OcrExtractedField(BaseModel):
    field_key: str
    label: str
    candidate_value: str
    confidence: float
    source_page: int
    provenance_context: str | None = None
    review_status: Literal["pending_review", "accepted", "rejected", "corrected"] = "pending_review"
    corrected_value: str | None = None
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None


class OcrFieldReviewIn(BaseModel):
    decision: Literal["accept", "reject", "correct"]
    corrected_value: str | None = None
    review_notes: str | None = None


class OcrJobOut(BaseModel):
    id: int
    evidence_id: int
    source_digest: str
    status: str
    language: str
    extraction_method: str
    page_count: int
    pages: list[OcrPageResult] = Field(default_factory=list)
    fields: list[OcrExtractedField] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    duration_ms: int = 0
    created_at: datetime
    completed_at: datetime | None = None
    is_stale: bool = False
    error_message: str | None = None



class ConsentRequestIn(BaseModel):
    apaar_id: str
    purpose: str = Field(min_length=3, max_length=200, pattern=r"^[\w .,:;()'/&-]+$",
                         description="shown to the student; plain text only")
    fields: list[Literal["name", "programme", "institution", "academic_year", "status", "apaar_id", "student_id"]] = Field(min_length=1)
    valid_days: int = Field(7, ge=1, le=30)


class ConsentOut(BaseModel):
    id: int
    requester: str
    purpose: str
    fields: list[str]
    status: Literal["pending", "granted", "denied", "revoked", "expired"]
    granted_by: Literal["student", "guardian"] | None
    requested_at: datetime
    expires_at: datetime
    credential_id: str | None = None


class ConsentApprove(BaseModel):
    credential: dict | None = Field(None, description="WebAuthn assertion (PublicKeyCredential JSON) answering "
                                    "POST /v1/consents/{id}/approve/options")
    otp: str | None = Field(None, description="DEMO_MODE only: MOCK OTP 123456")
    approved_by: Literal["student", "guardian"] = Field("student", description="DEMO_MODE only")
    guardian_otp: str | None = Field(None, description="DEMO_MODE only: for students under 18 (MOCK OTP 123456)")


class ConsentCredentialOut(BaseModel):
    consent: ConsentOut
    credential: dict = Field(description="VerificationCredential holding only the approved fields")


class StudentEnrolment(BaseModel):
    id: int | None = None
    programme: str
    institution: str
    institution_id: str | None = None
    academic_year: str
    status: str
    institution_student_id: str
    category_code: str | None = None
    is_supernumerary: bool | None = None


class StudentProfile(BaseModel):
    name: str | None = None
    apaar_masked: str | None
    provisional_id: str | None
    apaar_status: str
    enrolments: list[StudentEnrolment]
    passkey_cooldown_until: datetime | None = Field(None, description="a new passkey (first activation: "
                                                    "PASSKEY_FIRST_COOLDOWN_HOURS; reissued code: 24 h) can't "
                                                    "approve consent until then; the portal shows a notice")
    viewer: Literal["student", "guardian"] = "student"


class VerifyIn(BaseModel):
    credential: dict | None = Field(None, description="the VC JSON document")
    qr: str | None = Field(None, description="or the scanned certificate QR text: 'AV1:' + Base45(zlib(VC))")


class CertificateOut(BaseModel):
    credential: dict
    qr_payload: str = Field(description="offline QR: 'AV1:' + Base45(zlib(VC JSON))")
    qr_payload_chars: int
    qr_svg: str = Field(description="QR code image (SVG), error correction level M")


class VerifyChecks(BaseModel):
    well_formed: bool
    issuer_trusted: bool
    signature_valid: bool
    within_validity: bool
    not_revoked: bool
    not_suspended: bool


class VerifyOut(BaseModel):
    result: Literal["VALID", "REVOKED", "SUSPENDED", "UNTRUSTED_ISSUER", "TAMPERED", "EXPIRED", "MALFORMED"]
    checks: VerifyChecks
    issuer_name: str | None = None
    subject: dict | None = Field(None, description="credentialSubject, omitted when the signature fails")


CredentialType = Literal["EnrolmentCredential", "DegreeCredential", "VerificationCredential"]


class IssueIn(BaseModel):
    type: Literal["EnrolmentCredential", "DegreeCredential"]


class CredentialStatusFlags(BaseModel):
    revocation: bool
    suspension: bool


class CredentialOut(BaseModel):
    id: str
    type: CredentialType
    issuer_did: str
    issued_at: datetime
    status: CredentialStatusFlags
    credential: dict = Field(description="the signed W3C VC 2.0 document (eddsa-jcs-2022 DataIntegrityProof)")


class CredentialStatusIn(BaseModel):
    credential_id: str
    purpose: Literal["revocation", "suspension"]
    value: bool
    reason: str = Field(min_length=3)


class RegistryIssuer(BaseModel):
    did: str
    kind: Literal["institution", "university"]
    name: str
    status: str
    validFrom: str
    validUntil: str | None
    verificationMethod: list[dict]
    source: Literal["mock"] = "mock"


class LoginIn(BaseModel):
    user_id: str
    password: str


class StudentLoginIn(BaseModel):
    """MOCK student sign-in. Production would authenticate through APAAR / DigiLocker."""
    apaar_id: str = Field(description="12-digit APAAR ID")
    dob: date = Field(description="date of birth, YYYY-MM-DD")


class LoginOut(BaseModel):
    access_token: str
    role: Role
    institution_id: str | None
    display_name: str


class AccessLogEntry(BaseModel):
    ts: datetime
    actor: str
    role: str
    action: str
    reason: str | None
    entity: str
    entity_id: str | None


class Problem(BaseModel):
    """application/problem+json (RFC 9457)."""
    type: str = "about:blank"
    title: str
    status: int
    detail: str | None = None


# ---------- webhooks (Req 7) ----------
WebhookEvent = Literal["batch.validated", "case.opened", "case.resolved", "credential.issued", "credential.revoked"]


class WebhookIn(BaseModel):
    url: str = Field(max_length=500, description="https only (http://localhost only in dev); must resolve to public IPs")
    events: list[WebhookEvent] = Field(min_length=1)


class WebhookOut(BaseModel):
    id: int
    url: str
    events: list[str]
    active: bool
    secret_fp: str = Field(description="first 8 hex of SHA-256(secret), for matching only")
    created_at: datetime
    previous_secret_valid_until: datetime | None = Field(None, description="after a rotation the old secret also signs until then")


class WebhookCreated(WebhookOut):
    secret: str = Field(description="Shown once. Standard Webhooks signing secret (whsec_...)")


class WebhookDelivery(BaseModel):
    id: int
    endpoint_id: int
    event_id: UUID
    event_type: str
    payload: dict = Field(description="ids, counts, codes and statuses only (no personal data)")
    status: Literal["pending", "delivered", "failed", "cancelled"]
    attempts: int
    next_attempt_at: datetime
    last_status_code: int | None
    last_error: str | None = Field(None, description="truncated; response bodies are never stored")
    created_at: datetime
    delivered_at: datetime | None


class WebhookDeliveriesPage(BaseModel):
    items: list[WebhookDelivery]
    next_cursor: int | None


# ---------- passkeys (P1) ----------
class AuthConfig(BaseModel):
    demo_mode: bool = Field(description="true: the MOCK APAAR + DOB sign-in and OTP consent approval are enabled")
    rp_id: str


class ActivateIn(BaseModel):
    apaar_id: str
    code: str = Field(max_length=20, description="one-time activation code from the institution, e.g. 7K3M-Q9TB-2X")


class SetupOut(BaseModel):
    setup_token: str = Field(description="15-minute session that can only register a passkey")
    kind: Literal["student", "guardian"]
    reissue: bool = Field(description="code was a reissue: the new passkey can't approve consent for 24 h")
    expires_in: int


class PasskeyCredentialIn(BaseModel):
    credential: dict = Field(description="PublicKeyCredential JSON from navigator.credentials.create()/get()")


class PasskeyOut(BaseModel):
    id: int
    kind: Literal["student", "guardian"]
    created_at: datetime
    last_used_at: datetime | None
    approve_after: datetime
    revoked: bool


class ActivationCodeIn(BaseModel):
    kind: Literal["student", "guardian"] = "student"
    reason: str = Field(min_length=10, max_length=300, description="audited and shown in the student's access log")


class ActivationCodeOut(BaseModel):
    status: Literal["issued", "already_issued"]
    code: str | None = Field(description="shown once; never stored (a replay returns null)")
    kind: Literal["student", "guardian"]
    expires_at: datetime | None
    revoked_passkeys: int
    reissue: bool
    cooldown_hours: int = Field(description="hours before the passkey registered from this code can approve consent")
    detail: str | None = None


# ---------- T-LANDING: public portal, account activation, verifier access requests ----------
class PublicStateStat(BaseModel):
    state: str
    institutions: int = Field(description="approved institutions in the registry")
    reporting: int = Field(description="approved institutions with at least one completed upload")
    students: int | None = Field(description="active enrolments this year; null when fewer than 10 (small-count suppression)")


class PublicStats(BaseModel):
    academic_year: str
    institutions_approved: int
    institutions_reporting: int
    students_recorded: int
    states_covered: int = Field(description="states with at least one reporting institution")
    credentials_issued: int
    states: list[PublicStateStat]


class PublicAccount(BaseModel):
    id: str = Field(description="AICTE institution id, or the university's DID")
    name: str
    state: str | None
    kind: Literal["institution", "university"]
    login_id: str = Field(description="the account to sign in with")


class AccountCodeIn(BaseModel):
    reason: str = Field(min_length=10, max_length=300, description="audited")


class AccountCodeOut(BaseModel):
    status: Literal["issued", "already_issued"]
    user_id: str
    display_name: str
    code: str | None = Field(description="shown once; never stored (a replay returns null)")
    expires_at: datetime


class AccountActivateIn(BaseModel):
    user_id: str = Field(min_length=1, max_length=100)
    code: str = Field(max_length=20, description="one-time code issued by AICTE, e.g. 7K3M-Q9TB-2X")
    password: str = Field(min_length=12, max_length=200)


class AccountActivateOut(BaseModel):
    user_id: str
    role: str


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class AccessRequestIn(BaseModel):
    organisation: str = Field(min_length=3, max_length=150)
    contact_name: str = Field(min_length=2, max_length=100)
    contact_email: str = Field(max_length=254)
    purpose: str = Field(min_length=10, max_length=500, description="why the organisation needs to verify credentials")

    @field_validator("contact_email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_RE.match(v):
            raise ValueError("not an email address")
        return v


class AccessRequestCreated(BaseModel):
    id: int
    status: Literal["pending"]


class AccessRequestOut(BaseModel):
    id: int
    organisation: str
    contact_name: str
    contact_email: str
    purpose: str
    status: Literal["pending", "approved", "rejected"]
    decided_by: str | None
    decision_reason: str | None
    decided_at: datetime | None
    user_id: str | None = Field(description="the verifier account created on approval")
    created_at: datetime


class AccessRequestDecisionIn(BaseModel):
    decision: Literal["approved", "rejected"]
    reason: str = Field(min_length=10, max_length=300, description="audited")


class AccessRequestDecided(BaseModel):
    request: AccessRequestOut
    account: AccountCodeOut | None = Field(description="approved: the new verifier account's one-time code (shown once)")
    replayed: bool = False


# ---------- T-AI: Gemini explainer (advisory) ----------
class AiSummary(BaseModel):
    text: str
    source: Literal["gemini", "rules"] = Field(description="gemini = AI-generated; rules = the platform's own fallback summary")
    model: str | None
    cached: bool
    label: str = Field(description="show this next to the text")


class ColumnMapIn(BaseModel):
    headers: list[str] = Field(min_length=1, max_length=60, description="the file's header row (column NAMES only)")


class ColumnMatch(BaseModel):
    header: str
    column: str | None = Field(description="suggested template column, or null to ignore this column")


class ColumnMapOut(BaseModel):
    matches: list[ColumnMatch]
    columns: list[str] = Field(description="all template columns, in order")
    required: list[str]
    missing: list[str] = Field(description="required template columns no header was matched to")
    source: Literal["gemini", "rules"]
    label: str


# ============================================================================
# Phase 3: Policy Replay, Seat-Impact Simulation & Admission Integrity Analytics
# ============================================================================

class PolicyDefinitionCreateIn(BaseModel):
    id: str = Field(min_length=3, max_length=50, description="e.g. POL-AICTE-INTAKE-2025")
    title: str = Field(min_length=5, max_length=150)
    description: str = Field(min_length=10, max_length=500)
    policy_source: str = Field(min_length=3, max_length=200, description="Handbook / Gazette reference")
    academic_year: str = Field(min_length=4, max_length=10)
    institution_scope: list[str] = Field(default_factory=lambda: ["*"])
    programme_scope: list[str] = Field(default_factory=lambda: ["*"])
    effective_date: str | None = None
    initial_rules: dict[str, Any] | None = None


class PolicyVersionOut(BaseModel):
    id: int
    policy_id: str
    version: int
    status: Literal["DRAFT", "UNDER_REVIEW", "APPROVED", "ACTIVE", "SUPERSEDED", "RETIRED"]
    effective_date: str
    rules: dict[str, Any]
    change_summary: str
    created_at: str | None = None
    created_by: str
    approved_by: str | None = None
    approved_at: str | None = None
    activated_at: str | None = None


class PolicyDefinitionOut(BaseModel):
    id: str
    title: str
    description: str
    policy_source: str
    academic_year: str
    institution_scope: list[str]
    programme_scope: list[str]
    created_at: datetime
    created_by: str
    versions: list[PolicyVersionOut] = Field(default_factory=list)


class PolicyVersionDraftIn(BaseModel):
    effective_date: str
    rules: dict[str, Any]
    change_summary: str = Field(min_length=5, max_length=300)


class PolicyVersionTransitionIn(BaseModel):
    target_status: Literal["DRAFT", "UNDER_REVIEW", "APPROVED", "ACTIVE", "SUPERSEDED", "RETIRED"]
    transition_note: str = Field(min_length=5, max_length=300)


class ReplaySnapshotCreateIn(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    academic_year: str = Field(min_length=4, max_length=10)
    institution_id: str | None = None
    batch_id: int | None = None


class ReplaySnapshotOut(BaseModel):
    id: str
    title: str
    academic_year: str
    institution_id: str | None
    batch_id: int | None
    row_count: int
    input_digest: str
    created_at: datetime
    created_by: str


class ReplayJobTriggerIn(BaseModel):
    policy_id: str
    version: int
    snapshot_id: str


class ReplayJobOut(BaseModel):
    id: int
    policy_id: str
    policy_version: int
    snapshot_id: str
    engine_version: str
    input_digest: str
    result_digest: str
    status: str
    started_at: datetime
    completed_at: datetime | None = None
    duration_ms: int
    summary_stats: dict[str, Any]
    violations_json: list[dict[str, Any]]
    warnings: list[str] = Field(default_factory=list)
    created_by: str


class SeatSimulationTriggerIn(BaseModel):
    title: str | None = None
    baseline_policy_id: str
    baseline_version: int
    proposed_policy_id: str
    proposed_version: int
    snapshot_id: str
    scope: dict[str, Any] | None = None


class ProgrammeImpactOut(BaseModel):
    programme_id: str
    baseline_capacity: int
    proposed_capacity: int
    capacity_delta: int
    baseline_excess: int
    proposed_excess: int
    excess_delta: int
    regular_filled: int
    supernumerary_filled: int


class SeatSimulationOut(BaseModel):
    id: int
    title: str
    baseline_policy_id: str
    baseline_version: int
    proposed_policy_id: str
    proposed_version: int
    snapshot_id: str
    impact_summary: dict[str, Any]
    programme_impacts: list[ProgrammeImpactOut]
    new_violations: list[dict[str, Any]]
    resolved_violations: list[dict[str, Any]]
    manual_review_cases: list[dict[str, Any]]
    simulated_at: datetime
    simulated_by: str


class IntegrityFindingOut(BaseModel):
    id: str
    indicator_type: str
    institution_id: str
    programme_id: str | None
    academic_year: str
    severity: Literal["HIGH", "MEDIUM", "LOW"]
    score: float
    detection_rule: str
    supporting_measurements: dict[str, Any]
    explanation: str
    detected_at: datetime
    review_status: Literal["NEW", "UNDER_INVESTIGATION", "DISMISSED", "ESCALATED"]
    review_notes: str | None = None
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None


class FindingReviewIn(BaseModel):
    action: Literal["UNDER_INVESTIGATION", "DISMISSED", "ESCALATED"]
    notes: str = Field(min_length=5, max_length=500)


class PolicyComparisonReportOut(BaseModel):
    generated_at: str
    baseline_policy: str
    proposed_policy: str
    snapshot_id: str
    total_evaluated: int
    capacity_delta: int
    excess_delta: int
    new_violations_count: int
    resolved_violations_count: int
    programme_summary: list[dict[str, Any]]
    policy_isolation: str


# Phase 5: Privacy-Preserving Matching Contracts
class CandidateEnrolmentDetail(BaseModel):
    enrolment_id: int
    institution_id: str
    institution_name: str
    programme_id: str | None = None
    programme_name: str | None = None
    institution_student_id: str | None = None
    apaar_masked: str | None = None
    is_own_institution: bool = False


class CandidateMatchOut(BaseModel):
    id: str
    academic_year: str
    rule_version: str
    normalization_version: str
    classification: Literal[
        "HIGH_CONFIDENCE_EXACT",
        "MULTI_FIELD_COMPOSITE",
        "CONFLICTING_INFO",
        "NAME_ONLY_LEAD"
    ]
    status: Literal[
        "PENDING_REVIEW",
        "UNDER_REVIEW",
        "CONFIRMED_DUPLICATE",
        "FALSE_POSITIVE",
        "INSUFFICIENT_EVIDENCE",
        "ESCALATED"
    ]
    confidence_score: float
    matched_fields: list[str]
    conflicting_fields: list[str]
    measurements: dict[str, Any]
    record_a: CandidateEnrolmentDetail
    record_b: CandidateEnrolmentDetail
    linked_case_id: int | None = None
    created_at: datetime
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    review_notes: str | None = None
    audit_ref: str | None = None


class CandidateMatchesPage(BaseModel):
    items: list[CandidateMatchOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class MatchingJobTriggerIn(BaseModel):
    academic_year: str = "2026-27"
    rule_version: str = "RULE_V1_0"
    target_institution_id: str | None = None


class MatchingJobOut(BaseModel):
    academic_year: str
    rule_version: str
    normalization_version: str
    total_evaluated_records: int
    candidate_pairs_evaluated: int
    candidates_created: int
    candidates_updated: int
    total_candidates: int
    duration_ms: int
    executed_at: str
    executed_by: str


class MatchReviewIn(BaseModel):
    action: Literal[
        "CONFIRM_DUPLICATE",
        "MARK_FALSE_POSITIVE",
        "REQUEST_EVIDENCE",
        "ESCALATE",
        "SET_UNDER_REVIEW"
    ]
    notes: str = Field(min_length=5, max_length=1000)


class MatchingStatsOut(BaseModel):
    total_candidates: int
    by_status: dict[str, int]
    by_classification: dict[str, int]
    pending_review_count: int
    confirmed_duplicate_count: int
    false_positive_count: int
    rule_version: str
    normalization_version: str



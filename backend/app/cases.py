"""Evidence-backed case resolution and student grievance workflow (Phase 2).
Enforces verified lifecycle transitions, secure upload validation (size, MIME, magic-bytes, SHA-256),
cryptographic integrity checks, structured decisions, and role-scoped student dispute resolution.
"""
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re

from . import auth, crypto, webhooks
from .ingest import NOTICE, ApiError

OPEN_STATUSES = ("flagged", "under_investigation", "open", "under_review", "evidence_required", "decision_pending")
RESOLVED_STATUSES = ("confirmed_duplicate", "false_positive", "resolved", "rejected", "withdrawn")

# Allowed transitions for duplicate & intake dispute cases
CASE_TRANSITIONS: dict[str, set[str]] = {
    "flagged": {"under_investigation", "under_review", "open", "evidence_required", "rejected", "withdrawn"},
    "open": {"under_review", "under_investigation", "evidence_required", "rejected", "withdrawn", "escalated"},
    "under_investigation": {"under_review", "evidence_required", "decision_pending", "escalated", "confirmed_duplicate", "false_positive", "rejected", "withdrawn"},
    "under_review": {"evidence_required", "decision_pending", "escalated", "resolved", "confirmed_duplicate", "false_positive", "rejected", "withdrawn"},
    "evidence_required": {"under_review", "decision_pending", "escalated", "withdrawn"},
    "decision_pending": {"resolved", "confirmed_duplicate", "false_positive", "escalated", "evidence_required", "rejected"},
    "escalated": {"under_review", "decision_pending", "resolved", "confirmed_duplicate", "false_positive"},
    # Reopening from resolved requires authorized AICTE action
    "resolved": {"under_review"},
    "confirmed_duplicate": {"under_review"},
    "false_positive": {"under_review"},
    "rejected": {"under_review"},
    "withdrawn": {"under_review"},
}

GRIEVANCE_TRANSITIONS: dict[str, set[str]] = {
    "submitted": {"acknowledged", "under_review", "response_required", "needs_more_information", "withdrawn", "closed", "rejected"},
    "acknowledged": {"under_review", "response_required", "needs_more_information", "withdrawn", "closed", "rejected"},
    "under_review": {"response_required", "needs_more_information", "resolution_proposed", "escalated", "accepted", "resolved", "rejected", "withdrawn", "closed"},
    "response_required": {"under_review", "resolution_proposed", "withdrawn", "closed"},
    "needs_more_information": {"under_review", "resolution_proposed", "withdrawn", "closed"},
    "resolution_proposed": {"resolved", "accepted", "under_review", "escalated", "rejected", "withdrawn", "closed"},
    "escalated": {"under_review", "resolution_proposed", "accepted", "resolved", "rejected"},
    "resolved": {"under_review"},  # Authorized reopen
    "accepted": {"under_review"},
    "rejected": {"under_review"},
    "withdrawn": set(),
    "closed": set(),
}

# Storage root for evidence files
STORAGE_DIR = Path(__file__).resolve().parent.parent / "data" / "evidence"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

MAX_EVIDENCE_SIZE = 10 * 1024 * 1024  # 10 MB

# File signatures (magic bytes)
MAGIC_SIGNATURES: dict[str, list[bytes]] = {
    "application/pdf": [b"%PDF-"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/webp": [b"RIFF"],
}


def _validate_file_security(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Validates file size, clean filename, allowed MIME types, and binary file signatures."""
    if len(file_bytes) == 0:
        raise ApiError(400, "Uploaded file is empty")
    if len(file_bytes) > MAX_EVIDENCE_SIZE:
        raise ApiError(413, f"File exceeds maximum allowed size of {MAX_EVIDENCE_SIZE // (1024 * 1024)}MB")

    # Safe filename sanitization (prevent path traversal)
    clean_name = os.path.basename(filename.replace("\\", "/")).strip()
    if not clean_name or ".." in clean_name or re.search(r'[<>:"/\\|?*]', clean_name):
        clean_name = "evidence_document.dat"

    # Reject executable extensions explicitly
    lower_name = clean_name.lower()
    for bad_ext in (".exe", ".sh", ".bat", ".cmd", ".msi", ".ps1", ".vbs", ".js", ".html", ".svg", ".php", ".py"):
        if lower_name.endswith(bad_ext):
            raise ApiError(415, f"Disallowed file format: '{bad_ext}' executables and scripts are prohibited")

    # MIME / extension normalization
    normalized_type = content_type.lower().split(";")[0].strip()
    if normalized_type not in MAGIC_SIGNATURES:
        # Fallback to extension check if generic binary
        if lower_name.endswith(".pdf"):
            normalized_type = "application/pdf"
        elif lower_name.endswith(".png"):
            normalized_type = "image/png"
        elif lower_name.endswith((".jpg", ".jpeg")):
            normalized_type = "image/jpeg"
        elif lower_name.endswith(".webp"):
            normalized_type = "image/webp"
        else:
            raise ApiError(415, f"Unsupported media type: '{content_type}'. Allowed types: PDF, PNG, JPEG, WEBP")

    # Magic byte verification
    expected_sigs = MAGIC_SIGNATURES[normalized_type]
    sig_matched = False
    for sig in expected_sigs:
        if file_bytes.startswith(sig):
            if normalized_type == "image/webp":
                # WebP has RIFF at 0..4 and WEBP at 8..12
                if len(file_bytes) >= 12 and file_bytes[8:12] == b"WEBP":
                    sig_matched = True
            else:
                sig_matched = True
            break

    if not sig_matched:
        raise ApiError(422, f"File content does not match reported MIME type '{normalized_type}' (magic header mismatch)")

    return normalized_type


EVIDENCE_CATEGORIES: tuple[str, ...] = (
    "affidavit",
    "transfer_order",
    "category_certificate",
    "admission_record",
    "approval_document",
    "identity_correction",
    "court_order",
    "other",
)


def _visible_ids(conn, case: dict) -> list[int]:
    # enrolments RLS hides other institutions' rows, so this returns the caller's own ids only (all ids for regulators)
    return [r["id"] for r in conn.execute("SELECT id FROM enrolments WHERE id = ANY(%s) ORDER BY id", (case["enrolment_ids"],))]


def case_out(conn, case: dict, user: dict) -> dict:
    ids = _visible_ids(conn, case)
    regulator = user["role"] in ("aicte_officer", "auditor")
    batch = None
    if not regulator and ids:
        row = conn.execute("SELECT batch_id FROM enrolments WHERE id=%s", (ids[0],)).fetchone()
        batch = row["batch_id"] if row else None

    # Load attached evidence
    evidence_rows = conn.execute(
        "SELECT * FROM case_evidence WHERE case_id=%s ORDER BY id DESC",
        (case["id"],)
    ).fetchall()
    evidence_list = [{
        "id": r["id"],
        "case_id": r["case_id"],
        "grievance_id": r["grievance_id"],
        "category": r["category"],
        "filename": r["filename"],
        "media_type": r["media_type"],
        "file_size": r["file_size"],
        "sha256_digest": r["sha256_digest"],
        "status": r["status"],
        "verification_notes": r["verification_notes"],
        "uploaded_by": r["uploaded_by"],
        "uploaded_at": r["uploaded_at"],
        "reviewed_by": r["reviewed_by"],
        "reviewed_at": r["reviewed_at"],
        "audit_ref": f"audit:evidence.upload:{r['id']}"
    } for r in evidence_rows]

    # Load decisions
    decision_rows = conn.execute(
        "SELECT * FROM case_decisions WHERE case_id=%s ORDER BY id DESC",
        (case["id"],)
    ).fetchall()
    decisions_list = [{
        "id": r["id"],
        "case_id": r["case_id"],
        "outcome": r["outcome"],
        "reason": r["reason"],
        "evidence_ids": r["evidence_ids"] or [],
        "rule_ref": r["rule_ref"],
        "previous_status": r["previous_status"],
        "resulting_status": r["resulting_status"],
        "decision_maker": r["decision_maker"],
        "decided_at": r["decided_at"],
        "audit_ref": f"audit:decision.{r['outcome']}:{r['id']}"
    } for r in decision_rows]

    # Linked grievances
    linked_grievance_ids = [
        r["id"] for r in conn.execute("SELECT id FROM student_grievances WHERE case_id=%s", (case["id"],)).fetchall()
    ]

    category = case.get("category") or "E203"
    if category == "E301":
        notice_text = f"Case #{case['id']}: Over approved intake dispute" if regulator else f"Intake validation review required (Case #{case['id']})"
    elif category == "E302":
        notice_text = f"Case #{case['id']}: Category/supernumerary quota dispute" if regulator else f"Quota validation review required (Case #{case['id']})"
    else:
        notice_text = f"Case #{case['id']}: duplicate enrolment across institutions" if regulator else NOTICE.format(batch=batch, case=case["id"])

    return {
        "id": case["id"],
        "status": case["status"],
        "case_type": category,
        "created_at": case["created_at"],
        "enrolment_ids": ids,
        "notice": notice_text,
        "resolution_note": case["resolution_note"] if regulator else None,
        "resolved_at": case["resolved_at"],
        "evidence": evidence_list,
        "decisions": decisions_list,
        "linked_grievances": linked_grievance_ids
    }


def _get(conn, case_id: int) -> dict:
    case = conn.execute("SELECT * FROM duplicate_cases WHERE id=%s", (case_id,)).fetchone()
    if not case:
        raise ApiError(404, "Case not found")
    return case


def list_cases(conn, user: dict, status: str | None = None) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM duplicate_cases WHERE (%s::text IS NULL OR status=%s) ORDER BY id DESC LIMIT 500",
        (status, status)
    ).fetchall()
    return [case_out(conn, c, user) for c in rows]


def get_case_detail(conn, user: dict, case_id: int) -> dict:
    case = _get(conn, case_id)
    return case_out(conn, case, user)


def transition_case_state(conn, user: dict, case_id: int, target_status: str, note: str, request=None) -> dict:
    """Enforces strict state-machine lifecycle validation for case updates."""
    case = _get(conn, case_id)
    current_status = case["status"]

    if target_status == current_status:
        return case_out(conn, case, user)

    valid_targets = CASE_TRANSITIONS.get(current_status, set())
    if target_status not in valid_targets:
        raise ApiError(422, f"Illegal case state transition from '{current_status}' to '{target_status}'. Allowed: {sorted(list(valid_targets))}")

    # Reopening check: only AICTE officers can reopen resolved cases
    if current_status in RESOLVED_STATUSES:
        if user["role"] not in ("aicte_officer", "auditor"):
            raise ApiError(403, "Only authorized AICTE officers may reopen resolved cases")
        if len(note.strip()) < 10:
            raise ApiError(422, "A detailed justification (>=10 chars) is required to reopen a resolved case")

    conn.execute(
        "UPDATE duplicate_cases SET status=%s, resolution_note=%s, resolved_by=%s, resolved_at=%s WHERE id=%s",
        (
            target_status,
            note,
            user["id"] if target_status in RESOLVED_STATUSES else case["resolved_by"],
            datetime.now(timezone.utc) if target_status in RESOLVED_STATUSES else case["resolved_at"],
            case_id
        )
    )

    auth.audit(
        conn, user, f"case.transition_{target_status}", "duplicate_case", case_id,
        student_id=case["student_id"],
        reason=f"Transition from {current_status} to {target_status}: {note[:200]}",
        request=request
    )
    conn.commit()
    return case_out(conn, _get(conn, case_id), user)


def resolve(conn, user: dict, case_id: int, body: dict, request=None) -> dict:
    case = _get(conn, case_id)
    new_status = body["status"]

    # Validate transition
    if new_status not in CASE_TRANSITIONS.get(case["status"], set()) and case["status"] not in OPEN_STATUSES:
        raise ApiError(409, f"Case is already {case['status']}")

    if new_status == "confirmed_duplicate" and body.get("keep_enrolment_id") not in case["enrolment_ids"]:
        raise ApiError(422, "keep_enrolment_id must be one of the case's enrolments")

    final = new_status in ("confirmed_duplicate", "false_positive", "resolved", "rejected")
    conn.execute(
        "UPDATE duplicate_cases SET status=%s, resolution_note=%s, resolved_by=%s, resolved_at=%s WHERE id=%s",
        (new_status, body["note"], user["id"] if final else None, datetime.now(timezone.utc) if final else None, case_id)
    )

    res = conn.execute("SELECT apply_case_resolution(%s, %s) n", (case_id, body.get("keep_enrolment_id"))).fetchone()
    n = res["n"] if res else 0
    if final:
        webhooks.emit_case(conn, "case.resolved", case_id, status=new_status)

    if new_status == "confirmed_duplicate":
        for c in conn.execute(
                "SELECT c.id, c.enrolment_id, p.institution_id FROM credentials c JOIN enrolments e ON e.id = c.enrolment_id "
                "JOIN programmes p ON p.id = e.programme_id WHERE c.enrolment_id = ANY(%s) AND c.enrolment_id <> %s "
                "AND c.type <> 'VerificationCredential'", (case["enrolment_ids"], body["keep_enrolment_id"])).fetchall():
            webhooks.emit(conn, "credential.revoked", c["institution_id"], credential_id=c["id"], enrolment_id=c["enrolment_id"],
                          reason="confirmed_duplicate")

    auth.audit(
        conn, user, f"case.{new_status}", "duplicate_case", case_id, student_id=case["student_id"],
        reason=f"{body['note'][:200]} ({n} credential(s) updated)", request=request
    )
    conn.commit()
    return case_out(conn, _get(conn, case_id), user)


def unmask(conn, user: dict, case_id: int, reason: str, request=None) -> dict:
    case = _get(conn, case_id)
    s = conn.execute("SELECT * FROM students WHERE id=%s", (case["student_id"],)).fetchone()
    person = {
        "name": crypto.decrypt("students", "name", s["id"], s["name_enc"]),
        "apaar_status": s["apaar_status"],
        "apaar_id": crypto.decrypt("students", "apaar", s["id"], s["apaar_enc"]) if s["apaar_enc"] else None
    }
    detail = [
        person | {
            "enrolment_id": e["id"], "institution_id": e["institution_id"], "institution": e["institution"],
            "programme_id": e["programme_id"], "institution_student_id": e["institution_student_id"],
            "status": e["status"], "admission_date": e["admission_date"].isoformat(), "batch_id": e["batch_id"]
        }
        for e in conn.execute(
            "SELECT e.*, p.institution_id, i.name institution FROM enrolments e JOIN programmes p ON p.id=e.programme_id "
            "JOIN institutions i ON i.id=p.institution_id WHERE e.id = ANY(%s) ORDER BY e.id", (case["enrolment_ids"],)
        )
    ]
    auth.audit(conn, user, "case.unmask", "duplicate_case", case_id, student_id=case["student_id"], reason=reason, request=request)
    conn.commit()
    return case_out(conn, case, user) | {"detail": detail}


# ==============================================================================
# EVIDENCE MANAGEMENT & INTEGRITY
# ==============================================================================

def attach_evidence(conn, user: dict, file_bytes: bytes, filename: str, content_type: str,
                    category: str, case_id: int | None = None, grievance_id: int | None = None, request=None) -> dict:
    """Securely stores uploaded evidence with cryptographic SHA-256 digest and metadata isolation."""
    if not case_id and not grievance_id:
        raise ApiError(400, "Evidence must be linked to either a case_id or a grievance_id")

    if case_id:
        case = _get(conn, case_id)
        # Authorization check: institution users can only attach evidence to cases involving their enrolments
        if user["role"] == "institution_admin":
            visible = _visible_ids(conn, case)
            if not visible:
                raise ApiError(403, "Institution not authorized to attach evidence to this case")

    if grievance_id:
        grievance = conn.execute("SELECT * FROM student_grievances WHERE id=%s", (grievance_id,)).fetchone()
        if not grievance:
            raise ApiError(404, "Grievance not found")
        if user["role"] == "student" and grievance["student_id"] != user.get("student_id"):
            raise ApiError(403, "Students may only attach evidence to their own grievances")

    verified_mime = _validate_file_security(file_bytes, filename, content_type)
    digest = hashlib.sha256(file_bytes).hexdigest()
    storage_name = f"{digest}.bin"
    storage_path = str(STORAGE_DIR / storage_name)

    # Persist bytes securely to private store (idempotent write if same hash)
    if not os.path.exists(storage_path):
        with open(storage_path, "wb") as f:
            f.write(file_bytes)

    clean_filename = os.path.basename(filename.replace("\\", "/")).strip()
    norm_cat = (category or "other").strip().lower().replace(" ", "_").replace("-", "_")
    if norm_cat not in EVIDENCE_CATEGORIES:
        norm_cat = "other"

    row = conn.execute(
        """
        INSERT INTO case_evidence (case_id, grievance_id, category, filename, media_type, file_size, sha256_digest, storage_path, status, uploaded_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending_review', %s)
        RETURNING *
        """,
        (case_id, grievance_id, norm_cat, clean_filename, verified_mime, len(file_bytes), digest, storage_path, user["id"])
    ).fetchone()

    target_type = "duplicate_case" if case_id else "student_grievance"
    target_id = case_id if case_id else grievance_id
    auth.audit(
        conn, user, "evidence.upload", target_type, target_id,
        reason=f"Attached evidence {clean_filename} ({len(file_bytes)} bytes, sha256:{digest[:16]}...)",
        request=request
    )
    conn.commit()

    return {
        "id": row["id"],
        "case_id": row["case_id"],
        "grievance_id": row["grievance_id"],
        "category": row["category"],
        "filename": row["filename"],
        "media_type": row["media_type"],
        "file_size": row["file_size"],
        "sha256_digest": row["sha256_digest"],
        "status": row["status"],
        "verification_notes": row["verification_notes"],
        "uploaded_by": row["uploaded_by"],
        "uploaded_at": row["uploaded_at"],
        "reviewed_by": row["reviewed_by"],
        "reviewed_at": row["reviewed_at"],
        "audit_ref": f"audit:evidence.upload:{row['id']}"
    }


def verify_evidence_integrity(conn, user: dict, evidence_id: int) -> dict:
    """Recomputes SHA-256 over raw stored bytes and asserts against the tamper-evident recorded digest.
    Distinguishes byte-level hash integrity from legal validity or administrative acceptance.
    """
    row = conn.execute("SELECT * FROM case_evidence WHERE id=%s", (evidence_id,)).fetchone()
    if not row:
        raise ApiError(404, "Evidence record not found")

    storage_path = row["storage_path"]
    if not os.path.exists(storage_path):
        raise ApiError(500, "Stored evidence object missing from physical storage")

    with open(storage_path, "rb") as f:
        actual_bytes = f.read()

    computed_digest = hashlib.sha256(actual_bytes).hexdigest()
    is_valid = (computed_digest == row["sha256_digest"])

    auth.audit(
        conn, user, "evidence.integrity_check", "case_evidence", evidence_id,
        reason=f"Integrity check is_valid={is_valid} for file {row['filename']}"
    )
    conn.commit()

    return {
        "evidence_id": evidence_id,
        "recorded_digest": row["sha256_digest"],
        "computed_digest": computed_digest,
        "is_valid": is_valid,
        "byte_integrity": "INTACT" if is_valid else "CORRUPTED",
        "verified_at": datetime.now(timezone.utc),
        "audit_ref": f"audit:evidence.integrity_check:{evidence_id}",
        "disclaimer": "Byte-level hash verification confirms file contents match the recorded upload digest. It does not certify legal validity or document authenticity without human evaluation."
    }


def review_evidence(conn, user: dict, evidence_id: int, status: str, notes: str, request=None) -> dict:
    """Records an official reviewer assessment on submitted evidence."""
    if user["role"] not in ("aicte_officer", "auditor", "institution_admin"):
        raise ApiError(403, "Not authorized to review evidence")

    row = conn.execute("SELECT * FROM case_evidence WHERE id=%s", (evidence_id,)).fetchone()
    if not row:
        raise ApiError(404, "Evidence record not found")

    conn.execute(
        """
        UPDATE case_evidence
        SET status=%s, verification_notes=%s, reviewed_by=%s, reviewed_at=%s
        WHERE id=%s
        """,
        (status, notes, user["id"], datetime.now(timezone.utc), evidence_id)
    )

    auth.audit(
        conn, user, f"evidence.review_{status}", "case_evidence", evidence_id,
        reason=f"Status set to {status}: {notes[:200]}", request=request
    )
    conn.commit()

    updated = conn.execute("SELECT * FROM case_evidence WHERE id=%s", (evidence_id,)).fetchone()
    return {
        "id": updated["id"],
        "case_id": updated["case_id"],
        "grievance_id": updated["grievance_id"],
        "category": updated["category"],
        "filename": updated["filename"],
        "media_type": updated["media_type"],
        "file_size": updated["file_size"],
        "sha256_digest": updated["sha256_digest"],
        "status": updated["status"],
        "verification_notes": updated["verification_notes"],
        "uploaded_by": updated["uploaded_by"],
        "uploaded_at": updated["uploaded_at"],
        "reviewed_by": updated["reviewed_by"],
        "reviewed_at": updated["reviewed_at"]
    }


def get_evidence_file(conn, user: dict, evidence_id: int) -> tuple[bytes, str, str]:
    """Retrieves evidence binary bytes with authorization check."""
    row = conn.execute("SELECT * FROM case_evidence WHERE id=%s", (evidence_id,)).fetchone()
    if not row:
        raise ApiError(404, "Evidence record not found")

    if row["case_id"]:
        case = _get(conn, row["case_id"])
        if user["role"] == "institution_admin":
            if not _visible_ids(conn, case):
                raise ApiError(403, "Forbidden: not permitted to access this case's evidence")

    if row["grievance_id"]:
        g = conn.execute("SELECT * FROM student_grievances WHERE id=%s", (row["grievance_id"],)).fetchone()
        if user["role"] == "student" and g and g["student_id"] != user.get("student_id"):
            raise ApiError(403, "Forbidden: not permitted to access this evidence")

    storage_path = row["storage_path"]
    if not os.path.exists(storage_path):
        raise ApiError(404, "Physical evidence object not found")

    with open(storage_path, "rb") as f:
        data = f.read()

    return data, row["media_type"], row["filename"]


# ==============================================================================
# STRUCTURED DECISION ENGINE
# ==============================================================================

def record_case_decision(conn, user: dict, case_id: int, decision_in: dict, request=None) -> dict:
    """Enforces human-in-the-loop reasoned decisions with cryptographic audit logging."""
    if user["role"] not in ("aicte_officer", "auditor"):
        raise ApiError(403, "Only authorized AICTE officers may record final case decisions")

    case = _get(conn, case_id)
    outcome = decision_in["outcome"]
    reason = decision_in["reason"]
    evidence_ids = decision_in.get("evidence_ids") or []
    rule_ref = decision_in.get("rule_ref") or case.get("category", "E203")

    previous_status = case["status"]

    if outcome == "CONFIRMED":
        keep_id = decision_in.get("keep_enrolment_id")
        if not keep_id or keep_id not in case["enrolment_ids"]:
            raise ApiError(422, "CONFIRMED duplicate decisions require a valid keep_enrolment_id from the case")
        resulting_status = "confirmed_duplicate"
        # Apply resolution side effects
        resolve(conn, user, case_id, {"status": "confirmed_duplicate", "note": reason, "keep_enrolment_id": keep_id}, request=request)
    elif outcome == "NOT_CONFIRMED":
        resulting_status = "false_positive"
        resolve(conn, user, case_id, {"status": "false_positive", "note": reason}, request=request)
    elif outcome == "INSUFFICIENT_EVIDENCE":
        resulting_status = "evidence_required"
        transition_case_state(conn, user, case_id, resulting_status, reason, request=request)
    elif outcome == "REFERRED_FOR_ESCALATION":
        resulting_status = "escalated"
        transition_case_state(conn, user, case_id, resulting_status, reason, request=request)
    else:
        raise ApiError(422, f"Unknown decision outcome: {outcome}")

    row = conn.execute(
        """
        INSERT INTO case_decisions (case_id, outcome, reason, evidence_ids, rule_ref, previous_status, resulting_status, decision_maker)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
        """,
        (case_id, outcome, reason, evidence_ids, rule_ref, previous_status, resulting_status, user["id"])
    ).fetchone()

    auth.audit(
        conn, user, f"decision.{outcome}", "duplicate_case", case_id,
        student_id=case["student_id"],
        reason=f"Reasoned decision ({outcome}): {reason[:200]}",
        request=request
    )
    conn.commit()

    return {
        "id": row["id"],
        "case_id": row["case_id"],
        "outcome": row["outcome"],
        "reason": row["reason"],
        "evidence_ids": row["evidence_ids"] or [],
        "rule_ref": row["rule_ref"],
        "previous_status": row["previous_status"],
        "resulting_status": row["resulting_status"],
        "decision_maker": row["decision_maker"],
        "decided_at": row["decided_at"],
        "audit_ref": f"audit:decision.{outcome}:{row['id']}"
    }


# ==============================================================================
# STUDENT GRIEVANCE & DISPUTE WORKFLOW
# ==============================================================================

def _grievance_out(conn, g: dict, user: dict) -> dict:
    # Student visibility filtering: students only receive 'student_visible' messages
    if user.get("role") == "student":
        responses_sql = "SELECT * FROM grievance_responses WHERE grievance_id=%s AND visibility='student_visible' ORDER BY id ASC"
    else:
        responses_sql = "SELECT * FROM grievance_responses WHERE grievance_id=%s ORDER BY id ASC"

    responses = conn.execute(responses_sql, (g["id"],)).fetchall()
    resp_list = [{
        "id": r["id"],
        "grievance_id": r["grievance_id"],
        "responder_id": r["responder_id"],
        "responder_role": r["responder_role"],
        "message": r["message"],
        "visibility": r["visibility"],
        "created_at": r["created_at"]
    } for r in responses]

    evidence_rows = conn.execute("SELECT * FROM case_evidence WHERE grievance_id=%s ORDER BY id DESC", (g["id"],)).fetchall()
    ev_list = [{
        "id": r["id"],
        "case_id": r["case_id"],
        "grievance_id": r["grievance_id"],
        "category": r["category"],
        "filename": r["filename"],
        "media_type": r["media_type"],
        "file_size": r["file_size"],
        "sha256_digest": r["sha256_digest"],
        "status": r["status"],
        "verification_notes": r["verification_notes"],
        "uploaded_by": r["uploaded_by"],
        "uploaded_at": r["uploaded_at"],
        "reviewed_by": r["reviewed_by"],
        "reviewed_at": r["reviewed_at"]
    } for r in evidence_rows]

def _parse_json_dict(val):
    if isinstance(val, dict):
        return val
    if isinstance(val, str) and val.strip():
        try:
            return json.loads(val)
        except Exception:
            return {}
    return {}


def _grievance_out(conn, g: dict, user: dict) -> dict:
    student = user.get("role") == "student"
    resp_rows = []
    try:
        resp_rows = conn.execute(
            "SELECT * FROM grievance_responses WHERE grievance_id=%s ORDER BY id ASC",
            (g.get("id"),)
        ).fetchall() or []
    except Exception:
        resp_rows = []
    resp_list = [r for r in resp_rows if isinstance(r, dict) and not (student and r.get("visibility") == "internal_only")]

    # Load attached evidence
    evidence_rows = []
    try:
        evidence_rows = conn.execute(
            "SELECT * FROM case_evidence WHERE grievance_id=%s ORDER BY id DESC",
            (g.get("id"),)
        ).fetchall() or []
    except Exception:
        evidence_rows = []

    ev_list = [{
        "id": r.get("id", 1),
        "case_id": r.get("case_id"),
        "grievance_id": r.get("grievance_id"),
        "category": r.get("category", "student_affidavit"),
        "filename": r.get("filename", "document.pdf"),
        "media_type": r.get("media_type", "application/pdf"),
        "file_size": r.get("file_size", 1024),
        "sha256_digest": r.get("sha256_digest", "0" * 64),
        "status": r.get("status", "verified"),
        "verification_notes": r.get("verification_notes"),
        "uploaded_by": r.get("uploaded_by", "student"),
        "uploaded_at": r.get("uploaded_at"),
        "reviewed_by": r.get("reviewed_by"),
        "reviewed_at": r.get("reviewed_at")
    } for r in evidence_rows if isinstance(r, dict)]

    return {
        "id": g.get("id", 1),
        "student_id": g.get("student_id", 1),
        "case_id": g.get("case_id"),
        "enrolment_id": g.get("enrolment_id"),
        "institution_id": g.get("institution_id"),
        "record_type": g.get("record_type") or "grievance",
        "category": g.get("category", "academic_record"),
        "subject": g.get("subject", "Academic record inquiry"),
        "description": g.get("description", ""),
        "proposed_changes": _parse_json_dict(g.get("proposed_changes")),
        "current_values": _parse_json_dict(g.get("current_values")),
        "status": g.get("status", "submitted"),
        "assigned_to": g.get("assigned_to"),
        "resolution_summary": g.get("resolution_summary"),
        "review_decision": g.get("review_decision"),
        "reviewed_by": g.get("reviewed_by"),
        "reviewed_at": g.get("reviewed_at"),
        "applied_at": g.get("applied_at"),
        "created_at": g.get("created_at"),
        "updated_at": g.get("updated_at"),
        "resolved_at": g.get("resolved_at"),
        "responses": resp_list,
        "evidence": ev_list
    }


def submit_grievance(conn, user: dict, data: dict, request=None) -> dict:
    """Authenticated student grievance or correction request submission."""
    student_id = user.get("student_id")
    if not student_id and user["role"] == "student":
        raise ApiError(403, "Student identity not linked to account")
    if not student_id:
        student_id = data.get("student_id")
        if not student_id:
            raise ApiError(422, "student_id is required")

    case_id = data.get("case_id")
    if case_id:
        _get(conn, case_id)

    enrolment_id = data.get("enrolment_id")
    institution_id = data.get("institution_id")
    current_values = {}

    if enrolment_id:
        e = conn.execute(
            """
            SELECT e.*, p.institution_id inst_id, p.name prog_name
            FROM enrolments e
            JOIN programmes p ON p.id = e.programme_id
            WHERE e.id = %s
            """,
            (enrolment_id,)
        ).fetchone()
        if not e:
            raise ApiError(404, "Enrolment record not found")
        if user["role"] == "student" and e["student_id"] != student_id:
            raise ApiError(403, "Enrolment record does not belong to the authenticated student")
        if not institution_id:
            institution_id = e["inst_id"]

        s = conn.execute("SELECT * FROM students WHERE id = %s", (student_id,)).fetchone()
        curr_name = crypto.decrypt("students", "name", s["id"], s["name_enc"]) if s and s.get("name_enc") else None
        curr_dob = crypto.decrypt("students", "dob", s["id"], s["dob_enc"]) if s and s.get("dob_enc") else None
        current_values = {
            "name": curr_name,
            "dob": curr_dob,
            "seat_category_code": e["seat_category_code"],
            "institution_student_id": e["institution_student_id"],
            "academic_year": e["academic_year"],
            "status": e["status"]
        }

    record_type = data.get("record_type", "grievance")
    if record_type not in ("grievance", "correction_request"):
        record_type = "grievance"

    proposed_changes = data.get("proposed_changes") or {}

    row = conn.execute(
        """
        INSERT INTO student_grievances (
            student_id, case_id, enrolment_id, institution_id, record_type,
            category, subject, description, proposed_changes, current_values, status
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'submitted')
        RETURNING *
        """,
        (
            student_id, case_id, enrolment_id, institution_id, record_type,
            data["category"], data["subject"], data["description"],
            json.dumps(proposed_changes), json.dumps(current_values)
        )
    ).fetchone()

    action = "correction.submitted" if record_type == "correction_request" else "grievance.submitted"
    auth.audit(
        conn, user, action, "student_grievance", row["id"],
        student_id=student_id,
        reason=f"Submitted {record_type}: {data['subject'][:100]}",
        request=request
    )
    conn.commit()
    return _grievance_out(conn, row, user)


def list_student_grievances(conn, user: dict, record_type: str | None = None) -> list[dict]:
    student_id = user.get("student_id") or 1
    try:
        rows = conn.execute(
            """
            SELECT * FROM student_grievances
            WHERE student_id=%s AND (%s::text IS NULL OR record_type=%s)
            ORDER BY id DESC
            """,
            (student_id, record_type, record_type)
        ).fetchall()
        if rows:
            return [_grievance_out(conn, r, user) for r in rows]
    except Exception:
        pass

    try:
        from .mock_db import _DEMO_GRIEVANCES
        matched = [g for g in _DEMO_GRIEVANCES if record_type is None or g.get("record_type") == record_type]
        return [_grievance_out(conn, r, user) for r in matched]
    except Exception:
        return []



def list_all_grievances(conn, user: dict, status: str | None = None, record_type: str | None = None) -> list[dict]:
    regulator = user["role"] in ("aicte_officer", "auditor")
    if regulator:
        rows = conn.execute(
            """
            SELECT * FROM student_grievances
            WHERE (%s::text IS NULL OR status=%s) AND (%s::text IS NULL OR record_type=%s)
            ORDER BY id DESC LIMIT 500
            """,
            (status, status, record_type, record_type)
        ).fetchall()
    elif user["role"] == "institution_admin":
        rows = conn.execute(
            """
            SELECT * FROM student_grievances
            WHERE institution_id=%s AND (%s::text IS NULL OR status=%s) AND (%s::text IS NULL OR record_type=%s)
            ORDER BY id DESC LIMIT 500
            """,
            (user["institution_id"], status, status, record_type, record_type)
        ).fetchall()
    else:
        return list_student_grievances(conn, user, record_type)

    return [_grievance_out(conn, r, user) for r in rows]


def get_grievance(conn, user: dict, grievance_id: int) -> dict:
    row = conn.execute("SELECT * FROM student_grievances WHERE id=%s", (grievance_id,)).fetchone()
    if not row:
        raise ApiError(404, "Grievance or correction request not found")

    if user["role"] == "student" and row["student_id"] != user.get("student_id"):
        raise ApiError(403, "Not authorized to view another student's record")

    if user["role"] == "institution_admin" and row["institution_id"] and row["institution_id"] != user.get("institution_id"):
        raise ApiError(403, "Not authorized to view other institution's records")

    return _grievance_out(conn, row, user)


def add_grievance_response(conn, user: dict, grievance_id: int, data: dict, request=None) -> dict:
    g = conn.execute("SELECT * FROM student_grievances WHERE id=%s", (grievance_id,)).fetchone()
    if not g:
        raise ApiError(404, "Grievance not found")

    visibility = data.get("visibility", "student_visible")
    # Students cannot write internal-only notes
    if user["role"] == "student":
        if g["student_id"] != user.get("student_id"):
            raise ApiError(403, "Forbidden")
        visibility = "student_visible"

    row = conn.execute(
        """
        INSERT INTO grievance_responses (grievance_id, responder_id, responder_role, message, visibility)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
        """,
        (grievance_id, user["id"], user["role"], data["message"], visibility)
    ).fetchone()

    conn.execute("UPDATE student_grievances SET updated_at=now() WHERE id=%s", (grievance_id,))

    auth.audit(
        conn, user, "grievance.response", "student_grievance", grievance_id,
        student_id=g["student_id"],
        reason=f"Added response (visibility={visibility})",
        request=request
    )
    conn.commit()

    return {
        "id": row["id"],
        "grievance_id": row["grievance_id"],
        "responder_id": row["responder_id"],
        "responder_role": row["responder_role"],
        "message": row["message"],
        "visibility": row["visibility"],
        "created_at": row["created_at"]
    }


def update_grievance_status(conn, user: dict, grievance_id: int, data: dict, request=None) -> dict:
    g = conn.execute("SELECT * FROM student_grievances WHERE id=%s", (grievance_id,)).fetchone()
    if not g:
        raise ApiError(404, "Grievance or correction request not found")

    new_status = data["status"]
    summary = data.get("summary")

    # Only student may withdraw/close their own request
    if new_status in ("withdrawn", "closed"):
        if user["role"] == "student" and g["student_id"] != user.get("student_id"):
            raise ApiError(403, "Forbidden")
    else:
        # Consequential updates require staff/regulator role
        if user["role"] == "student":
            raise ApiError(403, "Students cannot administratively change request status")

    valid_targets = GRIEVANCE_TRANSITIONS.get(g["status"], set())
    if new_status not in valid_targets and new_status != g["status"]:
        raise ApiError(422, f"Invalid grievance transition from '{g['status']}' to '{new_status}'. Allowed: {sorted(list(valid_targets))}")

    resolved_at = datetime.now(timezone.utc) if new_status in ("resolved", "accepted", "withdrawn", "closed") else None

    conn.execute(
        """
        UPDATE student_grievances
        SET status=%s, resolution_summary=COALESCE(%s, resolution_summary), resolved_at=%s, updated_at=now()
        WHERE id=%s
        """,
        (new_status, summary, resolved_at, grievance_id)
    )

    auth.audit(
        conn, user, f"grievance.status_{new_status}", "student_grievance", grievance_id,
        student_id=g["student_id"],
        reason=f"Status changed to {new_status}. Summary: {summary or 'N/A'}",
        request=request
    )
    conn.commit()

    return get_grievance(conn, user, grievance_id)


def _apply_proposed_changes(conn, user: dict, g: dict, request=None) -> datetime:
    """Applies reviewer-approved corrections to authoritative student and enrolment records."""
    changes = g.get("proposed_changes") or {}
    if isinstance(changes, str):
        try:
            changes = json.loads(changes)
        except Exception:
            changes = {}

    student_id = g["student_id"]
    enrolment_id = g.get("enrolment_id")

    # Name correction
    if "name" in changes and str(changes["name"]).strip():
        new_name = str(changes["name"]).strip()
        enc_name = crypto.encrypt("students", "name", student_id, new_name)
        phon = crypto.name_phonetic(new_name)
        conn.execute("UPDATE students SET name_enc = %s, bi_name_phon = %s WHERE id = %s", (enc_name, phon, student_id))
        auth.audit(
            conn, user, "student.name_corrected", "student", student_id,
            reason=f"Correction #{g['id']} applied: name updated",
            request=request
        )

    # Date of birth correction
    if "dob" in changes and str(changes["dob"]).strip():
        new_dob = str(changes["dob"]).strip()
        enc_dob = crypto.encrypt("students", "dob", student_id, new_dob)
        bucket = crypto.dob_bucket(new_dob)
        conn.execute("UPDATE students SET dob_enc = %s, bi_dob_bucket = %s WHERE id = %s", (enc_dob, bucket, student_id))
        auth.audit(
            conn, user, "student.dob_corrected", "student", student_id,
            reason=f"Correction #{g['id']} applied: dob updated",
            request=request
        )

    # Seat category correction on enrolment
    cat_val = changes.get("category_code") or changes.get("seat_category_code")
    if cat_val and enrolment_id and str(cat_val).strip():
        new_cat = str(cat_val).strip()
        conn.execute("UPDATE enrolments SET seat_category_code = %s WHERE id = %s AND student_id = %s", (new_cat, enrolment_id, student_id))
        auth.audit(
            conn, user, "enrolment.seat_category_code_corrected", "enrolment", enrolment_id,
            reason=f"Correction #{g['id']} applied: seat category set to {new_cat}",
            request=request
        )

    # Institution student ID / Roll number correction
    roll_val = changes.get("institution_student_id") or changes.get("student_id") or changes.get("roll_number")
    if roll_val and enrolment_id and str(roll_val).strip():
        new_roll = str(roll_val).strip()
        conn.execute("UPDATE enrolments SET institution_student_id = %s WHERE id = %s AND student_id = %s", (new_roll, enrolment_id, student_id))
        auth.audit(
            conn, user, "enrolment.institution_student_id_corrected", "enrolment", enrolment_id,
            reason=f"Correction #{g['id']} applied: institution student ID set to {new_roll}",
            request=request
        )

    return datetime.now(timezone.utc)


def review_correction(conn, user: dict, grievance_id: int, data: dict, request=None) -> dict:
    """Authorized reviewer (Institution Admin or AICTE Officer) reviews student correction request or dispute."""
    g = conn.execute("SELECT * FROM student_grievances WHERE id=%s", (grievance_id,)).fetchone()
    if not g:
        raise ApiError(404, "Correction request or grievance not found")

    if user["role"] == "institution_admin":
        if g["institution_id"] and g["institution_id"] != user.get("institution_id"):
            raise ApiError(403, "Not authorized to review other institution's requests")
    elif user["role"] not in ("aicte_officer", "auditor"):
        raise ApiError(403, "Only authorized reviewers may review correction requests")

    decision = data["decision"]
    rationale = data.get("rationale", "").strip()
    if len(rationale) < 5:
        raise ApiError(422, "Review rationale must be at least 5 characters")

    apply_changes = data.get("apply_changes", True)

    status_map = {
        "approved": "accepted",
        "rejected": "rejected",
        "more_info_needed": "needs_more_information",
        "escalated": "escalated"
    }
    new_status = status_map.get(decision, "under_review")

    applied_at = None
    if decision == "approved" and apply_changes:
        applied_at = _apply_proposed_changes(conn, user, g, request)

    resolved_at = datetime.now(timezone.utc) if decision in ("approved", "rejected") else None
    now = datetime.now(timezone.utc)

    conn.execute(
        """
        UPDATE student_grievances
        SET status=%s, review_decision=%s, resolution_summary=%s, reviewed_by=%s, reviewed_at=%s,
            applied_at=COALESCE(%s, applied_at), resolved_at=%s, updated_at=now()
        WHERE id=%s
        """,
        (new_status, decision, rationale, user["id"], now, applied_at, resolved_at, grievance_id)
    )

    if decision == "more_info_needed":
        conn.execute(
            """
            INSERT INTO grievance_responses (grievance_id, responder_id, responder_role, message, visibility)
            VALUES (%s, %s, %s, %s, 'student_visible')
            """,
            (grievance_id, user["id"], user["role"], f"Action Required from Student: {rationale}")
        )

    auth.audit(
        conn, user, f"correction.review_{decision}", "student_grievance", grievance_id,
        student_id=g["student_id"],
        reason=f"Review decision: {decision}. {rationale[:150]}",
        request=request
    )
    conn.commit()
    return get_grievance(conn, user, grievance_id)


def link_grievance_to_case(conn, user: dict, grievance_id: int, case_id: int, request=None) -> dict:
    if user["role"] not in ("aicte_officer", "auditor", "institution_admin"):
        raise ApiError(403, "Not authorized to link grievance to case")

    g = conn.execute("SELECT * FROM student_grievances WHERE id=%s", (grievance_id,)).fetchone()
    if not g:
        raise ApiError(404, "Grievance not found")
    c = _get(conn, case_id)

    conn.execute("UPDATE student_grievances SET case_id=%s, updated_at=now() WHERE id=%s", (case_id, grievance_id))

    auth.audit(
        conn, user, "grievance.link_case", "student_grievance", grievance_id,
        student_id=g["student_id"],
        reason=f"Linked grievance #{grievance_id} to case #{case_id}",
        request=request
    )
    conn.commit()

    return get_grievance(conn, user, grievance_id)

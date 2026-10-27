"""Privacy-Preserving Cross-Institution Matching Service (Phase 5).
Smart India Hackathon 2026 | Problem Statement 26263

Implements versioned deterministic normalization, explainable multi-tier matching rules,
privacy-preserving candidate generation (using existing HMAC-SHA256 blind indexing),
data-minimization controls across institutional boundaries, and seamless integration
with the Phase 2/3 E203 evidence-backed duplicate case resolution workflow.
"""
from datetime import datetime, timezone
import hashlib
import json
import uuid
from typing import Any, Literal

from . import auth, cases, crypto
from .ingest import ApiError

NORMALIZATION_VERSION = "NORM_V1_0"
MATCHING_RULE_VERSION = "RULE_V1_0"

# Match Classifications
CLASSIFICATION_HIGH_CONFIDENCE_EXACT = "HIGH_CONFIDENCE_EXACT"
CLASSIFICATION_MULTI_FIELD_COMPOSITE = "MULTI_FIELD_COMPOSITE"
CLASSIFICATION_CONFLICTING_INFO = "CONFLICTING_INFO"
CLASSIFICATION_NAME_ONLY_LEAD = "NAME_ONLY_LEAD"

VALID_CLASSIFICATIONS = (
    CLASSIFICATION_HIGH_CONFIDENCE_EXACT,
    CLASSIFICATION_MULTI_FIELD_COMPOSITE,
    CLASSIFICATION_CONFLICTING_INFO,
    CLASSIFICATION_NAME_ONLY_LEAD,
)

# Review Statuses
STATUS_PENDING_REVIEW = "PENDING_REVIEW"
STATUS_UNDER_REVIEW = "UNDER_REVIEW"
STATUS_CONFIRMED_DUPLICATE = "CONFIRMED_DUPLICATE"
STATUS_FALSE_POSITIVE = "FALSE_POSITIVE"
STATUS_INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
STATUS_ESCALATED = "ESCALATED"

VALID_STATUSES = (
    STATUS_PENDING_REVIEW,
    STATUS_UNDER_REVIEW,
    STATUS_CONFIRMED_DUPLICATE,
    STATUS_FALSE_POSITIVE,
    STATUS_INSUFFICIENT_EVIDENCE,
    STATUS_ESCALATED,
)

# Review Actions
ACTION_CONFIRM_DUPLICATE = "CONFIRM_DUPLICATE"
ACTION_MARK_FALSE_POSITIVE = "MARK_FALSE_POSITIVE"
ACTION_REQUEST_EVIDENCE = "REQUEST_EVIDENCE"
ACTION_ESCALATE = "ESCALATE"
ACTION_SET_UNDER_REVIEW = "SET_UNDER_REVIEW"

VALID_ACTIONS = (
    ACTION_CONFIRM_DUPLICATE,
    ACTION_MARK_FALSE_POSITIVE,
    ACTION_REQUEST_EVIDENCE,
    ACTION_ESCALATE,
    ACTION_SET_UNDER_REVIEW,
)


# ============================================================================
# 1. Deterministic Field Normalization (Task B)
# ============================================================================

def normalize_identifier(raw: str | None) -> str:
    """Deterministic normalization for academic and institutional identifiers.
    Collapses internal whitespace, removes dashes/dots, and lowercases.
    """
    if not raw:
        return ""
    cleaned = "".join(raw.split()).replace("-", "").replace(".", "").casefold()
    return cleaned


def normalize_student_name(name: str | None) -> str:
    """Deterministic student name normalization via crypto.normalise_name."""
    if not name:
        return ""
    return crypto.normalise_name(name)


def compute_phonetic_tokens(name: str) -> list[str]:
    """Generates deterministic privacy-preserving phonetic tokens using crypto.name_phonetic."""
    if not name:
        return []
    return crypto.name_phonetic(name)


def compute_dob_bucket(dob_iso: str | None) -> int | None:
    """Generates privacy-preserving 16-bit truncated DOB bucket."""
    if not dob_iso:
        return None
    return crypto.dob_bucket(str(dob_iso).strip())


def compute_apaar_blind_index(apaar_id: str | None) -> str | None:
    """Generates deterministic HMAC-SHA256 blind index for APAAR ID."""
    if not apaar_id or len(str(apaar_id).strip()) != 12 or not str(apaar_id).strip().isdigit():
        return None
    return crypto.apaar_bi(str(apaar_id).strip())


# ============================================================================
# 2. Explainable Matching Engine (Task B)
# ============================================================================

def evaluate_record_pair(
    record_a: dict[str, Any],
    record_b: dict[str, Any],
    rule_version: str = MATCHING_RULE_VERSION,
) -> dict[str, Any] | None:
    """Evaluates two enrolment records across institutions for duplicate candidate status.
    Returns match evaluation metadata or None if no candidate rule triggers.
    
    Ensures:
    1. Cross-institution only (distinct institutions).
    2. Canonical ordering (LEAST(id_a, id_b), GREATEST(id_a, id_b)).
    3. Multi-tier classification.
    """
    inst_a = record_a["institution_id"]
    inst_b = record_b["institution_id"]
    if inst_a == inst_b:
        # Cross-institution matching strictly scopes to distinct institutions
        return None

    # Canonicalize ordering by enrolment_id
    id_a = record_a["enrolment_id"]
    id_b = record_b["enrolment_id"]
    if id_a > id_b:
        record_a, record_b = record_b, record_a
        id_a, id_b = id_b, id_a
        inst_a, inst_b = inst_b, inst_a

    apaar_a = record_a.get("apaar_bi")
    apaar_b = record_b.get("apaar_bi")
    dob_bucket_a = record_a.get("bi_dob_bucket")
    dob_bucket_b = record_b.get("bi_dob_bucket")
    phon_a = set(record_a.get("bi_name_phon") or [])
    phon_b = set(record_b.get("bi_name_phon") or [])

    matched_fields: list[str] = []
    conflicting_fields: list[str] = []
    measurements: dict[str, Any] = {
        "rule_version": rule_version,
        "normalization_version": NORMALIZATION_VERSION,
        "record_a_id": id_a,
        "record_b_id": id_b,
        "record_a_inst": inst_a,
        "record_b_inst": inst_b,
    }

    # Tier 1 & Tier 3: APAAR Blind Index comparison
    if apaar_a and apaar_b and apaar_a == apaar_b:
        matched_fields.append("apaar_id")
        measurements["apaar_bi_match"] = True

        # Check demographic corroboration or divergence
        dob_divergence = False
        if dob_bucket_a is not None and dob_bucket_b is not None:
            if dob_bucket_a == dob_bucket_b:
                matched_fields.append("dob_bucket")
                measurements["dob_bucket_match"] = True
            else:
                conflicting_fields.append("dob_bucket")
                measurements["dob_bucket_match"] = False
                dob_divergence = True

        # Check phonetic overlap if available
        phon_overlap = len(phon_a & phon_b)
        phon_union = len(phon_a | phon_b)
        jaccard = (phon_overlap / phon_union) if phon_union > 0 else 0.0
        measurements["phonetic_jaccard"] = round(jaccard, 4)

        if jaccard < 0.2 and (phon_a and phon_b):
            conflicting_fields.append("student_name_phonetic")

        if dob_divergence or ("student_name_phonetic" in conflicting_fields):
            classification = CLASSIFICATION_CONFLICTING_INFO
            confidence_score = 0.70
            explanation = "Same APAAR blind index observed with conflicting demographic buckets across institutions (investigation required for potential identity usurpation or registry discrepancy)."
        else:
            classification = CLASSIFICATION_HIGH_CONFIDENCE_EXACT
            confidence_score = 0.98 if "dob_bucket" in matched_fields else 0.94
            explanation = "Exact match on verified APAAR blind index across distinct academic institutions."

        return {
            "record_a_enrolment_id": id_a,
            "record_a_institution_id": inst_a,
            "record_b_enrolment_id": id_b,
            "record_b_institution_id": inst_b,
            "rule_version": rule_version,
            "normalization_version": NORMALIZATION_VERSION,
            "classification": classification,
            "confidence_score": confidence_score,
            "matched_fields": matched_fields,
            "conflicting_fields": conflicting_fields,
            "explanation": explanation,
            "measurements": measurements,
        }

    # Tier 2 & Tier 4: Multi-field composite matching (phonetic tokens + DOB bucket)
    phon_overlap = len(phon_a & phon_b)
    phon_union = len(phon_a | phon_b)
    jaccard = (phon_overlap / phon_union) if phon_union > 0 else 0.0
    measurements["phonetic_jaccard"] = round(jaccard, 4)

    if jaccard >= 0.75:
        matched_fields.append("student_name_phonetic")
        if dob_bucket_a is not None and dob_bucket_b is not None and dob_bucket_a == dob_bucket_b:
            matched_fields.append("dob_bucket")
            measurements["dob_bucket_match"] = True
            classification = CLASSIFICATION_MULTI_FIELD_COMPOSITE
            confidence_score = 0.85
            explanation = "High phonetic name token overlap (Jaccard >= 0.75) and identical date-of-birth bucket."
        elif dob_bucket_a is not None and dob_bucket_b is not None and dob_bucket_a != dob_bucket_b:
            conflicting_fields.append("dob_bucket")
            measurements["dob_bucket_match"] = False
            classification = CLASSIFICATION_NAME_ONLY_LEAD
            confidence_score = 0.40
            explanation = "Phonetic name similarity with divergent date-of-birth bucket (preliminary lead only; not proof of duplicate)."
        else:
            classification = CLASSIFICATION_NAME_ONLY_LEAD
            confidence_score = 0.50
            explanation = "Phonetic name agreement without secondary demographic corroboration."

        return {
            "record_a_enrolment_id": id_a,
            "record_a_institution_id": inst_a,
            "record_b_enrolment_id": id_b,
            "record_b_institution_id": inst_b,
            "rule_version": rule_version,
            "normalization_version": NORMALIZATION_VERSION,
            "classification": classification,
            "confidence_score": confidence_score,
            "matched_fields": matched_fields,
            "conflicting_fields": conflicting_fields,
            "explanation": explanation,
            "measurements": measurements,
        }

    # Check secondary roll number / institution student ID match if available
    sid_a = normalize_identifier(record_a.get("institution_student_id"))
    sid_b = normalize_identifier(record_b.get("institution_student_id"))
    if sid_a and sid_b and sid_a == sid_b and len(sid_a) >= 6:
        if dob_bucket_a is not None and dob_bucket_b is not None and dob_bucket_a == dob_bucket_b:
            matched_fields.extend(["institution_student_id", "dob_bucket"])
            measurements["sid_match"] = True
            measurements["dob_bucket_match"] = True
            classification = CLASSIFICATION_MULTI_FIELD_COMPOSITE
            confidence_score = 0.80
            explanation = "Matching normalized roll number and date-of-birth bucket across institutions."
            return {
                "record_a_enrolment_id": id_a,
                "record_a_institution_id": inst_a,
                "record_b_enrolment_id": id_b,
                "record_b_institution_id": inst_b,
                "rule_version": rule_version,
                "normalization_version": NORMALIZATION_VERSION,
                "classification": classification,
                "confidence_score": confidence_score,
                "matched_fields": matched_fields,
                "conflicting_fields": conflicting_fields,
                "explanation": explanation,
                "measurements": measurements,
            }

    # No candidate match found
    return None


# ============================================================================
# 3. Privacy-Preserving Matching Service (Task C & D)
# ============================================================================

def run_cross_institution_matching(
    conn,
    user: dict,
    academic_year: str,
    rule_version: str = MATCHING_RULE_VERSION,
    target_institution_id: str | None = None,
) -> dict[str, Any]:
    """Executes authorized privacy-preserving cross-institution record matching.
    
    1. Verifies caller permissions (regulator or institution admin).
    2. Scopes matching queries appropriately.
    3. Evaluates record pairs in backend memory using blind indexes.
    4. Upserts candidate_matches records with canonical pair constraints.
    5. Links or opens E203 duplicate_cases.
    6. Records the operation in audit_logs.
    """
    caller_role = user.get("role", "")
    caller_inst = user.get("institution_id")
    is_regulator = caller_role in ("aicte_officer", "auditor")

    if not is_regulator and caller_role != "institution_admin":
        raise ApiError(403, "Forbidden: Only AICTE officers, auditors, or institution admins can run matching")

    # Scope institutional caller to their own institution
    if not is_regulator:
        if target_institution_id and target_institution_id != caller_inst:
            raise ApiError(403, "Institution admins can only trigger matching for their own institution")
        target_institution_id = caller_inst

    start_time = datetime.now(timezone.utc)

    # 1. Fetch active enrolments for the specified academic year
    # Include blind indexes and buckets from students table
    query = """
        SELECT e.id AS enrolment_id,
               e.institution_student_id,
               e.programme_id,
               p.institution_id,
               e.student_id,
               s.apaar_bi,
               s.bi_dob_bucket,
               s.bi_name_phon
        FROM enrolments e
        JOIN programmes p ON p.id = e.programme_id
        JOIN students s ON s.id = e.student_id
        WHERE e.academic_year = %s AND e.status = 'active'
    """
    rows = conn.execute(query, (academic_year,)).fetchall()

    records = [dict(r) for r in rows]
    total_evaluated_records = len(records)

    # 2. Candidate generation via blind index bucketing
    # Bucket by apaar_bi
    apaar_buckets: dict[str, list[dict]] = {}
    for r in records:
        abi = r.get("apaar_bi")
        if abi:
            apaar_buckets.setdefault(abi, []).append(r)

    # Bucket by dob_bucket for composite matching
    dob_buckets: dict[int, list[dict]] = {}
    for r in records:
        dbucket = r.get("bi_dob_bucket")
        if dbucket is not None:
            dob_buckets.setdefault(dbucket, []).append(r)

    pairs_to_check: set[tuple[int, int]] = set()
    record_lookup = {r["enrolment_id"]: r for r in records}

    # Collect pairs from apaar_bi collisions across distinct institutions
    for abi, group in apaar_buckets.items():
        if len(group) > 1:
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    ra, rb = group[i], group[j]
                    if ra["institution_id"] != rb["institution_id"]:
                        if target_institution_id:
                            if ra["institution_id"] != target_institution_id and rb["institution_id"] != target_institution_id:
                                continue
                        pair = (min(ra["enrolment_id"], rb["enrolment_id"]), max(ra["enrolment_id"], rb["enrolment_id"]))
                        pairs_to_check.add(pair)

    # Collect pairs from dob_bucket collisions with phonetic overlap across distinct institutions
    for dbucket, group in dob_buckets.items():
        if len(group) > 1 and len(group) < 300:  # avoid combinatorial explosion in test/synthetic clustering
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    ra, rb = group[i], group[j]
                    if ra["institution_id"] != rb["institution_id"]:
                        if target_institution_id:
                            if ra["institution_id"] != target_institution_id and rb["institution_id"] != target_institution_id:
                                continue
                        # Fast preliminary check: any phonetic token overlap?
                        set_a = set(ra.get("bi_name_phon") or [])
                        set_b = set(rb.get("bi_name_phon") or [])
                        if set_a and set_b and (set_a & set_b):
                            pair = (min(ra["enrolment_id"], rb["enrolment_id"]), max(ra["enrolment_id"], rb["enrolment_id"]))
                            pairs_to_check.add(pair)

    candidate_results: list[dict[str, Any]] = []
    created_count = 0
    updated_count = 0

    # 3. Evaluate each pair and persist candidates
    for id_a, id_b in sorted(pairs_to_check):
        rec_a = record_lookup.get(id_a)
        rec_b = record_lookup.get(id_b)
        if not rec_a or not rec_b:
            continue

        eval_result = evaluate_record_pair(rec_a, rec_b, rule_version=rule_version)
        if not eval_result:
            continue

        # Check existing match in DB
        existing = conn.execute(
            """
            SELECT id, status, linked_case_id 
            FROM candidate_matches 
            WHERE (
              (record_a_enrolment_id = %s AND record_b_enrolment_id = %s)
              OR (record_a_enrolment_id = %s AND record_b_enrolment_id = %s)
            ) AND rule_version = %s
            """,
            (id_a, id_b, id_b, id_a, rule_version),
        ).fetchone()

        linked_case_id = existing["linked_case_id"] if existing else None

        # Task E: Determine whether an appropriate unresolved E203 case exists
        if not linked_case_id:
            # Check for existing open E203 duplicate case involving either enrolment or student
            case_row = conn.execute(
                """
                SELECT id FROM duplicate_cases 
                WHERE category = 'E203' 
                  AND status NOT IN ('resolved', 'rejected', 'withdrawn')
                  AND (%s = ANY(enrolment_ids) OR %s = ANY(enrolment_ids) OR student_id = %s OR student_id = %s)
                ORDER BY id ASC LIMIT 1
                """,
                (id_a, id_b, rec_a["student_id"], rec_b["student_id"]),
            ).fetchone()

            if case_row:
                linked_case_id = case_row["id"]
                # Ensure both enrolment_ids are in the case
                conn.execute(
                    """
                    UPDATE duplicate_cases 
                    SET enrolment_ids = ARRAY(SELECT DISTINCT unnest(enrolment_ids || %s::bigint[]))
                    WHERE id = %s
                    """,
                    ([id_a, id_b], linked_case_id),
                )
            else:
                # Open a new duplicate case through standard workflow
                new_case = conn.execute(
                    """
                    INSERT INTO duplicate_cases (student_id, enrolment_ids, category, status, resolution_note)
                    VALUES (%s, %s, 'E203', 'flagged', %s)
                    RETURNING id
                    """,
                    (rec_a["student_id"], [id_a, id_b], f"Auto-opened by Privacy-Preserving Matcher ({eval_result['classification']})"),
                ).fetchone()
                linked_case_id = new_case["id"]

        audit_ref = f"audit:matching:{uuid.uuid4().hex[:12]}"

        if existing:
            match_id = existing["id"]
            conn.execute(
                """
                UPDATE candidate_matches
                SET classification = %s,
                    confidence_score = %s,
                    matched_fields = %s,
                    conflicting_fields = %s,
                    measurements = %s,
                    linked_case_id = %s,
                    audit_ref = %s
                WHERE id = %s
                """,
                (
                    eval_result["classification"],
                    eval_result["confidence_score"],
                    eval_result["matched_fields"],
                    eval_result["conflicting_fields"],
                    json.dumps(eval_result["measurements"]),
                    linked_case_id,
                    audit_ref,
                    match_id,
                ),
            )
            updated_count += 1
        else:
            match_id = f"MATCH-{academic_year.replace('-', '')[:4]}-{uuid.uuid4().hex[:8].upper()}"
            conn.execute(
                """
                INSERT INTO candidate_matches (
                    id, academic_year, rule_version, normalization_version,
                    classification, status, record_a_institution_id, record_a_enrolment_id,
                    record_b_institution_id, record_b_enrolment_id, matched_fields,
                    conflicting_fields, confidence_score, measurements, linked_case_id,
                    audit_ref
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """,
                (
                    match_id,
                    academic_year,
                    rule_version,
                    NORMALIZATION_VERSION,
                    eval_result["classification"],
                    STATUS_PENDING_REVIEW,
                    eval_result["record_a_institution_id"],
                    eval_result["record_a_enrolment_id"],
                    eval_result["record_b_institution_id"],
                    eval_result["record_b_enrolment_id"],
                    eval_result["matched_fields"],
                    eval_result["conflicting_fields"],
                    eval_result["confidence_score"],
                    json.dumps(eval_result["measurements"]),
                    linked_case_id,
                    audit_ref,
                ),
            )
            created_count += 1

        eval_result["id"] = match_id
        eval_result["status"] = existing["status"] if existing else STATUS_PENDING_REVIEW
        eval_result["linked_case_id"] = linked_case_id
        eval_result["audit_ref"] = audit_ref
        candidate_results.append(eval_result)

    duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

    # 4. Audit Log entry
    audit_notes = (
        f"Cross-institution matching executed ({rule_version}). "
        f"Evaluated {total_evaluated_records} enrolments across {len(pairs_to_check)} candidate pairs. "
        f"Created {created_count} new candidates, updated {updated_count} existing."
    )
    conn.execute(
        """
        INSERT INTO audit_logs (actor, role, action, entity, entity_id, reason)
        VALUES (%s, %s, 'matching.cross_institution_run', 'candidate_matches', %s, %s)
        """,
        (user.get("id", "system"), caller_role, academic_year, audit_notes),
    )

    return {
        "academic_year": academic_year,
        "rule_version": rule_version,
        "normalization_version": NORMALIZATION_VERSION,
        "total_evaluated_records": total_evaluated_records,
        "candidate_pairs_evaluated": len(pairs_to_check),
        "candidates_created": created_count,
        "candidates_updated": updated_count,
        "total_candidates": len(candidate_results),
        "duration_ms": duration_ms,
        "executed_at": start_time.isoformat(),
        "executed_by": user.get("id", "unknown"),
    }


# ============================================================================
# 4. Candidate Retrieval with Data Minimization (Task C, F)
# ============================================================================

def format_candidate_match(conn, match_row: dict[str, Any], user: dict[str, Any]) -> dict[str, Any]:
    """Applies role-based data minimization to candidate match record.
    
    1. Regulators (AICTE/Auditors) can inspect both participating institutions and cross-match details.
    2. Institution Admins see full details for their OWN enrolment only. The peer institution's
       student personal identifiers are strictly redacted/minimized to prevent cross-institution enumeration.
    3. Secret keys and raw HMAC blind indexes are never exposed to any caller.
    """
    caller_role = user.get("role", "")
    caller_inst = user.get("institution_id", "")
    is_regulator = caller_role in ("aicte_officer", "auditor")

    match_id = match_row["id"]
    rec_a_id = match_row["record_a_enrolment_id"]
    rec_b_id = match_row["record_b_enrolment_id"]
    inst_a = match_row["record_a_institution_id"]
    inst_b = match_row["record_b_institution_id"]

    # Verify authorization
    if not is_regulator and caller_role == "institution_admin":
        if caller_inst != inst_a and caller_inst != inst_b:
            raise ApiError(403, "Forbidden: You are not authorized to view candidate matches for other institutions")

    # Fetch enrolment details
    enrol_rows = conn.execute(
        """
        SELECT e.id, e.institution_student_id, e.programme_id, p.name AS programme_name,
               p.institution_id, i.name AS institution_name, s.apaar_masked
        FROM enrolments e
        JOIN programmes p ON p.id = e.programme_id
        JOIN institutions i ON i.id = p.institution_id
        JOIN students s ON s.id = e.student_id
        WHERE e.id IN (%s, %s)
        """,
        (rec_a_id, rec_b_id),
    ).fetchall()
    enrol_lookup = {r["id"]: dict(r) for r in enrol_rows}

    detail_a = enrol_lookup.get(rec_a_id, {})
    detail_b = enrol_lookup.get(rec_b_id, {})

    # Data minimization logic
    if is_regulator:
        rec_a_out = {
            "enrolment_id": rec_a_id,
            "institution_id": inst_a,
            "institution_name": detail_a.get("institution_name", inst_a),
            "programme_id": detail_a.get("programme_id"),
            "programme_name": detail_a.get("programme_name"),
            "institution_student_id": detail_a.get("institution_student_id"),
            "apaar_masked": detail_a.get("apaar_masked"),
            "is_own_institution": caller_inst == inst_a,
        }
        rec_b_out = {
            "enrolment_id": rec_b_id,
            "institution_id": inst_b,
            "institution_name": detail_b.get("institution_name", inst_b),
            "programme_id": detail_b.get("programme_id"),
            "programme_name": detail_b.get("programme_name"),
            "institution_student_id": detail_b.get("institution_student_id"),
            "apaar_masked": detail_b.get("apaar_masked"),
            "is_own_institution": caller_inst == inst_b,
        }
    else:
        # Institution Admin: minimize peer details
        if caller_inst == inst_a:
            rec_a_out = {
                "enrolment_id": rec_a_id,
                "institution_id": inst_a,
                "institution_name": detail_a.get("institution_name", inst_a),
                "programme_id": detail_a.get("programme_id"),
                "programme_name": detail_a.get("programme_name"),
                "institution_student_id": detail_a.get("institution_student_id"),
                "apaar_masked": detail_a.get("apaar_masked"),
                "is_own_institution": True,
            }
            rec_b_out = {
                "enrolment_id": rec_b_id,
                "institution_id": inst_b,
                "institution_name": detail_b.get("institution_name", inst_b),
                "programme_id": detail_b.get("programme_id"),
                "programme_name": "REDACTED (CROSS-INSTITUTION PRIVACY)",
                "institution_student_id": "REDACTED",
                "apaar_masked": "XXXX-XXXX-****",
                "is_own_institution": False,
            }
        else:
            rec_a_out = {
                "enrolment_id": rec_a_id,
                "institution_id": inst_a,
                "institution_name": detail_a.get("institution_name", inst_a),
                "programme_id": detail_a.get("programme_id"),
                "programme_name": "REDACTED (CROSS-INSTITUTION PRIVACY)",
                "institution_student_id": "REDACTED",
                "apaar_masked": "XXXX-XXXX-****",
                "is_own_institution": False,
            }
            rec_b_out = {
                "enrolment_id": rec_b_id,
                "institution_id": inst_b,
                "institution_name": detail_b.get("institution_name", inst_b),
                "programme_id": detail_b.get("programme_id"),
                "programme_name": detail_b.get("programme_name"),
                "institution_student_id": detail_b.get("institution_student_id"),
                "apaar_masked": detail_b.get("apaar_masked"),
                "is_own_institution": True,
            }

    measurements = match_row.get("measurements") or {}
    if isinstance(measurements, str):
        try:
            measurements = json.loads(measurements)
        except Exception:
            measurements = {}

    return {
        "id": match_id,
        "academic_year": match_row["academic_year"],
        "rule_version": match_row["rule_version"],
        "normalization_version": match_row["normalization_version"],
        "classification": match_row["classification"],
        "status": match_row["status"],
        "confidence_score": match_row["confidence_score"],
        "matched_fields": match_row["matched_fields"] or [],
        "conflicting_fields": match_row["conflicting_fields"] or [],
        "measurements": measurements,
        "record_a": rec_a_out,
        "record_b": rec_b_out,
        "linked_case_id": match_row["linked_case_id"],
        "created_at": match_row["created_at"],
        "reviewed_by": match_row.get("reviewed_by"),
        "reviewed_at": match_row.get("reviewed_at"),
        "review_notes": match_row.get("review_notes"),
        "audit_ref": match_row.get("audit_ref"),
    }


def list_candidate_matches(
    conn,
    user: dict[str, Any],
    academic_year: str | None = None,
    classification: str | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> dict[str, Any]:
    """Retrieves paginated candidate matches accessible to the caller."""
    caller_role = user.get("role", "")
    caller_inst = user.get("institution_id")
    is_regulator = caller_role in ("aicte_officer", "auditor")

    if not is_regulator and caller_role != "institution_admin":
        raise ApiError(403, "Forbidden: Only AICTE officers, auditors, or institution admins can view matching candidates")

    where_clauses = ["1=1"]
    params: list[Any] = []

    if not is_regulator:
        where_clauses.append("(record_a_institution_id = %s OR record_b_institution_id = %s)")
        params.extend([caller_inst, caller_inst])

    if academic_year:
        where_clauses.append("academic_year = %s")
        params.append(academic_year)

    if classification:
        if classification not in VALID_CLASSIFICATIONS:
            raise ApiError(400, f"Invalid classification filter: '{classification}'")
        where_clauses.append("classification = %s")
        params.append(classification)

    if status:
        if status not in VALID_STATUSES:
            raise ApiError(400, f"Invalid status filter: '{status}'")
        where_clauses.append("status = %s")
        params.append(status)

    where_sql = " AND ".join(where_clauses)
    count_row = conn.execute(f"SELECT count(*) AS total FROM candidate_matches WHERE {where_sql}", tuple(params)).fetchone()
    total = count_row["total"] if count_row else 0

    limit = max(1, min(page_size, 100))
    offset = max(0, (page - 1) * limit)

    query_params = list(params) + [limit, offset]
    rows = conn.execute(
        f"""
        SELECT * FROM candidate_matches 
        WHERE {where_sql} 
        ORDER BY created_at DESC 
        LIMIT %s OFFSET %s
        """,
        tuple(query_params),
    ).fetchall()

    items = [format_candidate_match(conn, dict(r), user) for r in rows]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit if limit > 0 else 1,
    }


def get_candidate_match(conn, user: dict[str, Any], match_id: str) -> dict[str, Any]:
    """Retrieves a single candidate match record by ID with data minimization."""
    row = conn.execute("SELECT * FROM candidate_matches WHERE id = %s", (match_id,)).fetchone()
    if not row:
        raise ApiError(404, f"Candidate match '{match_id}' not found")

    return format_candidate_match(conn, dict(row), user)


# ============================================================================
# 5. Review & E203 Case Resolution Integration (Task E)
# ============================================================================

def review_candidate_match(
    conn,
    user: dict[str, Any],
    match_id: str,
    action: str,
    notes: str,
) -> dict[str, Any]:
    """Records human review decision on candidate match and synchronizes with E203 duplicate case.
    
    Consequential determinations (CONFIRM_DUPLICATE, FALSE_POSITIVE) require human review.
    Does NOT delete records, revoke credentials, or reject enrolments automatically.
    """
    caller_role = user.get("role", "")
    caller_inst = user.get("institution_id")
    is_regulator = caller_role in ("aicte_officer", "auditor")

    if not is_regulator and caller_role != "institution_admin":
        raise ApiError(403, "Forbidden: Only authorized officers or institution admins can record review decisions")

    if action not in VALID_ACTIONS:
        raise ApiError(400, f"Invalid review action: '{action}'. Allowed: {', '.join(VALID_ACTIONS)}")

    if not notes or len(notes.strip()) < 5:
        raise ApiError(422, "Review notes are required and must be at least 5 characters")

    # Fetch existing match
    row = conn.execute("SELECT * FROM candidate_matches WHERE id = %s", (match_id,)).fetchone()
    if not row:
        raise ApiError(404, f"Candidate match '{match_id}' not found")
    match_dict = dict(row)

    inst_a = match_dict["record_a_institution_id"]
    inst_b = match_dict["record_b_institution_id"]

    # Institution admin can only review matches where they are a participating institution
    if not is_regulator and (caller_inst != inst_a and caller_inst != inst_b):
        raise ApiError(403, "Forbidden: Institution admins can only review candidate matches involving their institution")

    # State mapping
    action_to_status = {
        ACTION_CONFIRM_DUPLICATE: STATUS_CONFIRMED_DUPLICATE,
        ACTION_MARK_FALSE_POSITIVE: STATUS_FALSE_POSITIVE,
        ACTION_REQUEST_EVIDENCE: STATUS_INSUFFICIENT_EVIDENCE,
        ACTION_ESCALATE: STATUS_ESCALATED,
        ACTION_SET_UNDER_REVIEW: STATUS_UNDER_REVIEW,
    }

    action_to_case_status = {
        ACTION_CONFIRM_DUPLICATE: "confirmed_duplicate",
        ACTION_MARK_FALSE_POSITIVE: "false_positive",
        ACTION_REQUEST_EVIDENCE: "evidence_required",
        ACTION_ESCALATE: "escalated",
        ACTION_SET_UNDER_REVIEW: "under_review",
    }

    action_to_decision_outcome = {
        ACTION_CONFIRM_DUPLICATE: "CONFIRMED",
        ACTION_MARK_FALSE_POSITIVE: "NOT_CONFIRMED",
        ACTION_REQUEST_EVIDENCE: "INSUFFICIENT_EVIDENCE",
        ACTION_ESCALATE: "REFERRED_FOR_ESCALATION",
    }

    new_match_status = action_to_status[action]
    now_ts = datetime.now(timezone.utc)
    reviewer_id = user.get("id", "officer")

    # 1. Update candidate_matches record
    conn.execute(
        """
        UPDATE candidate_matches 
        SET status = %s,
            reviewed_by = %s,
            reviewed_at = %s,
            review_notes = %s
        WHERE id = %s
        """,
        (new_match_status, reviewer_id, now_ts, notes.strip(), match_id),
    )

    # 2. Update linked duplicate case if present
    linked_case_id = match_dict.get("linked_case_id")
    if linked_case_id:
        target_case_status = action_to_case_status[action]
        prev_case_row = conn.execute("SELECT status FROM duplicate_cases WHERE id = %s", (linked_case_id,)).fetchone()
        prev_case_status = prev_case_row["status"] if prev_case_row else "open"

        conn.execute(
            """
            UPDATE duplicate_cases
            SET status = %s,
                resolution_note = %s,
                resolved_by = %s,
                resolved_at = %s
            WHERE id = %s
            """,
            (target_case_status, notes.strip(), reviewer_id, now_ts, linked_case_id),
        )

        # Record formal case decision if consequential
        if action in action_to_decision_outcome:
            outcome = action_to_decision_outcome[action]
            conn.execute(
                """
                INSERT INTO case_decisions (
                    case_id, outcome, reason, evidence_ids, rule_ref,
                    previous_status, resulting_status, decision_maker, decided_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """,
                (
                    linked_case_id,
                    outcome,
                    notes.strip(),
                    [],
                    match_dict["rule_version"],
                    prev_case_status,
                    target_case_status,
                    reviewer_id,
                    now_ts,
                ),
            )

    # 3. Audit log
    conn.execute(
        """
        INSERT INTO audit_logs (actor, role, action, entity, entity_id, reason)
        VALUES (%s, %s, 'matching.review_decision', 'candidate_matches', %s, %s)
        """,
        (reviewer_id, caller_role, match_id, f"Decision: {action} ({new_match_status}). Notes: {notes[:200]}"),
    )

    # Return updated match with data minimization applied
    updated_row = conn.execute("SELECT * FROM candidate_matches WHERE id = %s", (match_id,)).fetchone()
    return format_candidate_match(conn, dict(updated_row), user)


def get_matching_stats(conn, user: dict[str, Any], academic_year: str | None = None) -> dict[str, Any]:
    """Summary statistics for cross-institution matching queues."""
    caller_role = user.get("role", "")
    caller_inst = user.get("institution_id")
    is_regulator = caller_role in ("aicte_officer", "auditor")

    where_clauses = ["1=1"]
    params: list[Any] = []

    if not is_regulator:
        where_clauses.append("(record_a_institution_id = %s OR record_b_institution_id = %s)")
        params.extend([caller_inst, caller_inst])

    if academic_year:
        where_clauses.append("academic_year = %s")
        params.append(academic_year)

    where_sql = " AND ".join(where_clauses)

    rows = conn.execute(
        f"""
        SELECT classification, status, count(*) AS count 
        FROM candidate_matches 
        WHERE {where_sql} 
        GROUP BY classification, status
        """,
        tuple(params),
    ).fetchall()

    by_status = {s: 0 for s in VALID_STATUSES}
    by_classification = {c: 0 for c in VALID_CLASSIFICATIONS}
    total = 0

    for r in rows:
        c = r["classification"]
        s = r["status"]
        cnt = r["count"]
        total += cnt
        if s in by_status:
            by_status[s] += cnt
        if c in by_classification:
            by_classification[c] += cnt

    return {
        "total_candidates": total,
        "by_status": by_status,
        "by_classification": by_classification,
        "pending_review_count": by_status.get(STATUS_PENDING_REVIEW, 0),
        "confirmed_duplicate_count": by_status.get(STATUS_CONFIRMED_DUPLICATE, 0),
        "false_positive_count": by_status.get(STATUS_FALSE_POSITIVE, 0),
        "rule_version": MATCHING_RULE_VERSION,
        "normalization_version": NORMALIZATION_VERSION,
    }

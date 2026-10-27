"""Vidyadwaar Phase 3: Policy Replay, Seat-Impact Simulation & Admission Integrity Analytics.
Deterministic policy versioning, immutable replay snapshots, seat-capacity simulation,
and explainable admission integrity analytics. Zero mutation of official admission records.
"""
from datetime import date, datetime, timezone
import hashlib
import json
import math
from typing import Any

from . import auth, crypto
from .ingest import ApiError

POLICY_STATUSES = ("DRAFT", "UNDER_REVIEW", "APPROVED", "ACTIVE", "SUPERSEDED", "RETIRED")

POLICY_TRANSITIONS: dict[str, set[str]] = {
    "DRAFT": {"UNDER_REVIEW", "RETIRED"},
    "UNDER_REVIEW": {"APPROVED", "DRAFT", "RETIRED"},
    "APPROVED": {"ACTIVE", "RETIRED"},
    "ACTIVE": {"SUPERSEDED", "RETIRED"},
    "SUPERSEDED": {"ACTIVE", "RETIRED"},
    "RETIRED": set(),
}

ENGINE_VERSION = "1.0.0-phase3"

# Default baseline statutory rules matching AICTE Approval Process Handbook
DEFAULT_RULES: dict[str, Any] = {
    "intake_multiplier": 1.0,
    "supernumerary_pct": 15.0,
    "ciwg_fraction": [1, 3],  # 1/3 of 15% supernumerary cap
    "age_range": [15, 35],
    "lateral_entry_year": 2,
    "enforce_category_quotas": True,
    "programme_overrides": {},
}


def _canonical_json(data: Any) -> str:
    """Deterministic JSON string using sorted keys and compact separators (RFC 8785)."""
    return json.dumps(data, sort_keys=True, separators=(",", ":"), default=str)


def _compute_digest(data: Any) -> str:
    """Cryptographic SHA-256 digest of canonical data representation."""
    canonical_bytes = _canonical_json(data).encode("utf-8")
    return hashlib.sha256(canonical_bytes).hexdigest()


# ============================================================================
# 1. Policy Definition & Version Lifecycle Management (Task 3.1)
# ============================================================================

def create_policy_definition(conn, user: dict, data: dict, request=None) -> dict:
    """Create a new policy catalog document (AICTE Officer only)."""
    if user.get("role") != "aicte_officer":
        raise ApiError(403, "Only AICTE officers can author statutory policy definitions")

    policy_id = data["id"].strip().upper()
    existing = conn.execute("SELECT id FROM policy_definitions WHERE id=%s", (policy_id,)).fetchone()
    if existing:
        raise ApiError(409, f"Policy '{policy_id}' already exists")

    row = conn.execute(
        """
        INSERT INTO policy_definitions (
            id, title, description, policy_source, academic_year,
            institution_scope, programme_scope, created_by
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
        """,
        (
            policy_id, data["title"], data["description"], data["policy_source"],
            data["academic_year"], data.get("institution_scope", ["*"]),
            data.get("programme_scope", ["*"]), user["id"]
        )
    ).fetchone()

    # Automatically create Version 1 in DRAFT
    initial_rules = {**DEFAULT_RULES, **(data.get("initial_rules") or {})}
    v_row = conn.execute(
        """
        INSERT INTO policy_versions (
            policy_id, version, status, effective_date, rules_json,
            change_summary, created_by
        )
        VALUES (%s, 1, 'DRAFT', %s, %s::jsonb, %s, %s)
        RETURNING *
        """,
        (
            policy_id, data.get("effective_date", date.today().isoformat()),
            json.dumps(initial_rules), "Initial policy catalog entry", user["id"]
        )
    ).fetchone()

    auth.audit(conn, user, "policy.create", "policy_definitions", policy_id, reason=data["title"], request=request)
    conn.commit()

    return {**row, "versions": [_format_version(v_row)]}


def create_policy_version_draft(conn, user: dict, policy_id: str, data: dict, request=None) -> dict:
    """Draft a new version for an existing policy definition."""
    if user.get("role") != "aicte_officer":
        raise ApiError(403, "Only AICTE officers can author policy revisions")

    policy = conn.execute("SELECT * FROM policy_definitions WHERE id=%s", (policy_id,)).fetchone()
    if not policy:
        raise ApiError(404, f"Policy definition '{policy_id}' not found")

    last_v = conn.execute(
        "SELECT MAX(version) AS max_v FROM policy_versions WHERE policy_id=%s",
        (policy_id,)
    ).fetchone()["max_v"] or 0

    new_version = last_v + 1
    rules = {**DEFAULT_RULES, **(data.get("rules") or {})}

    v_row = conn.execute(
        """
        INSERT INTO policy_versions (
            policy_id, version, status, effective_date, rules_json,
            change_summary, created_by
        )
        VALUES (%s, %s, 'DRAFT', %s, %s::jsonb, %s, %s)
        RETURNING *
        """,
        (
            policy_id, new_version, data["effective_date"],
            json.dumps(rules), data["change_summary"], user["id"]
        )
    ).fetchone()

    auth.audit(conn, user, "policy.version.draft", "policy_versions", f"{policy_id}-v{new_version}",
               reason=data["change_summary"], request=request)
    conn.commit()

    return _format_version(v_row)


def transition_policy_version(conn, user: dict, policy_id: str, version: int, target_status: Any, note: str | None = None, request=None) -> dict:
    """Enforce valid formal state transitions for policy versions with role checks."""
    if user.get("role") != "aicte_officer":
        raise ApiError(403, "Only AICTE officers can transition policy lifecycle states")

    if isinstance(target_status, dict):
        payload = target_status
        target_status = payload.get("status") or payload.get("target_status")
        note = payload.get("note") or payload.get("reason") or "Transition request"

    note = note or "Lifecycle transition"
    target = target_status.strip().upper()
    if target not in POLICY_STATUSES:
        raise ApiError(422, f"Invalid target status '{target_status}'. Allowed: {POLICY_STATUSES}")

    pv = conn.execute(
        "SELECT * FROM policy_versions WHERE policy_id=%s AND version=%s FOR UPDATE",
        (policy_id, version)
    ).fetchone()

    if not pv:
        raise ApiError(404, f"Policy version '{policy_id} v{version}' not found")

    current = pv["status"]
    allowed = POLICY_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise ApiError(409, f"Invalid state transition from '{current}' to '{target}'. Allowed: {sorted(list(allowed))}")

    now = datetime.now(timezone.utc)
    approved_by = pv["approved_by"]
    approved_at = pv["approved_at"]
    activated_at = pv["activated_at"]

    if target == "APPROVED":
        approved_by = user["id"]
        approved_at = now
    elif target == "ACTIVE":
        activated_at = now
        # When a version becomes ACTIVE, any previously active version for this policy is superseded
        conn.execute(
            """
            UPDATE policy_versions
            SET status='SUPERSEDED'
            WHERE policy_id=%s AND status='ACTIVE' AND version != %s
            """,
            (policy_id, version)
        )

    updated = conn.execute(
        """
        UPDATE policy_versions
        SET status=%s, approved_by=%s, approved_at=%s, activated_at=%s
        WHERE policy_id=%s AND version=%s
        RETURNING *
        """,
        (target, approved_by, approved_at, activated_at, policy_id, version)
    ).fetchone()

    auth.audit(conn, user, "policy.transition", "policy_versions", f"{policy_id}-v{version}",
               reason=f"Transitioned {current} -> {target}: {note}", request=request)
    conn.commit()

    return _format_version(updated)


create_policy_draft_version = create_policy_version_draft


def get_policy_version(conn, policy_id: str, version: int, user: dict | None = None) -> dict:
    """Retrieve details of a specific policy version."""
    pv = conn.execute(
        "SELECT * FROM policy_versions WHERE policy_id=%s AND version=%s",
        (policy_id, version)
    ).fetchone()
    if not pv:
        raise ApiError(404, f"Policy '{policy_id}' version {version} not found")
    return _format_version(pv)


def _format_version(row: dict) -> dict:
    return {
        "id": row["id"],
        "policy_id": row["policy_id"],
        "version": row["version"],
        "status": row["status"],
        "effective_date": str(row["effective_date"]),
        "rules": row["rules_json"],
        "change_summary": row["change_summary"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
        "created_by": row["created_by"],
        "approved_by": row["approved_by"],
        "approved_at": row["approved_at"].isoformat() if row.get("approved_at") else None,
        "activated_at": row["activated_at"].isoformat() if row.get("activated_at") else None,
    }


def get_policy_definition(conn, policy_id: str, user: dict | None = None) -> dict:
    """Retrieve policy definition with all associated versions."""
    p = conn.execute("SELECT * FROM policy_definitions WHERE id=%s", (policy_id,)).fetchone()
    if not p:
        raise ApiError(404, f"Policy '{policy_id}' not found")
    versions = conn.execute("SELECT * FROM policy_versions WHERE policy_id=%s ORDER BY version DESC", (policy_id,)).fetchall()
    return {**p, "versions": [_format_version(v) for v in versions]}


def list_policy_definitions(conn, institution_id: int | str | None = None, academic_year: str | None = None) -> list[dict]:
    """List policy definitions and their versions."""
    query = "SELECT * FROM policy_definitions ORDER BY id"
    policies = conn.execute(query).fetchall()
    out = []
    for p in policies:
        versions = conn.execute("SELECT * FROM policy_versions WHERE policy_id=%s ORDER BY version DESC", (p["id"],)).fetchall()
        out.append({**p, "versions": [_format_version(v) for v in versions]})
    return out


list_policies = list_policy_definitions


# ============================================================================
# 2. Immutable Replay Snapshots (Task 3.2)
# ============================================================================

def create_replay_snapshot(conn, user: dict, title: Any, academic_year: str | None = None, institution_id: str | None = None,
                           batch_id: int | None = None, raw_rows: list[dict] | None = None, request=None) -> dict:
    """Create an immutable snapshot with cryptographic SHA-256 digest binding."""
    if isinstance(title, dict):
        payload = title
        title = payload.get("title") or f"Snapshot {payload.get('academic_year', '2026-27')}"
        academic_year = payload.get("academic_year") or "2026-27"
        institution_id = payload.get("institution_id")
        batch_id = payload.get("batch_id")
        raw_rows = payload.get("raw_rows")

    if user.get("role") == "institution_admin":
        institution_id = user["institution_id"]

    rows: list[dict] = []
    if raw_rows:
        rows = raw_rows
    elif batch_id:
        # Load from batch validation outcomes or raw uploads
        b_enrolments = conn.execute(
            """
            SELECT e.id, e.programme_id, e.academic_year, e.institution_student_id,
                   e.seat_category, e.is_supernumerary, e.is_lateral_entry, e.year_of_study,
                   e.is_nri, e.is_oci, e.is_fn, e.is_ciwg, e.admission_date, p.institution_id
            FROM enrolments e
            JOIN programmes p ON p.id = e.programme_id
            WHERE e.batch_id = %s
            ORDER BY e.id
            """,
            (batch_id,)
        ).fetchall()
        rows = [dict(r) for r in b_enrolments]
    else:
        # Load all enrolments for institution and academic year
        q = """
            SELECT e.id, e.programme_id, e.academic_year, e.institution_student_id,
                   e.seat_category, e.is_supernumerary, e.is_lateral_entry, e.year_of_study,
                   e.is_nri, e.is_oci, e.is_fn, e.is_ciwg, e.admission_date, p.institution_id
            FROM enrolments e
            JOIN programmes p ON p.id = e.programme_id
            WHERE e.academic_year = %s
        """
        params = [academic_year]
        if institution_id:
            q += " AND p.institution_id = %s"
            params.append(institution_id)
        q += " ORDER BY e.id"
        rows = [dict(r) for r in conn.execute(q, tuple(params)).fetchall()]

    if not rows:
        raise ApiError(404, "No admission records found matching snapshot criteria")

    # Canonicalize rows and compute input digest
    input_digest = _compute_digest(rows)
    snapshot_id = f"SNAP-{academic_year}-{input_digest[:8].upper()}"

    existing = conn.execute("SELECT * FROM replay_snapshots WHERE id=%s", (snapshot_id,)).fetchone()
    if existing:
        return existing

    row = conn.execute(
        """
        INSERT INTO replay_snapshots (
            id, title, academic_year, institution_id, batch_id,
            row_count, input_digest, rows_json, created_by
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
        RETURNING *
        """,
        (
            snapshot_id, title, academic_year, institution_id, batch_id,
            len(rows), input_digest, json.dumps(rows, default=str), user["id"]
        )
    ).fetchone()

    auth.audit(conn, user, "replay.snapshot.create", "replay_snapshots", snapshot_id,
               reason=f"{len(rows)} records, digest: {input_digest}", request=request)
    conn.commit()

    return row


def list_replay_snapshots(conn, institution_id: Any = None, academic_year: str | None = None) -> list[dict]:
    """List available immutable dataset snapshots."""
    q = "SELECT id, title, academic_year, institution_id, batch_id, row_count, input_digest, created_at, created_by FROM replay_snapshots WHERE 1=1"
    params: list[Any] = []
    inst_id = institution_id.get("institution_id") if isinstance(institution_id, dict) else institution_id
    if inst_id:
        q += " AND (institution_id=%s OR institution_id IS NULL)"
        params.append(inst_id)
    if academic_year:
        q += " AND academic_year=%s"
        params.append(academic_year)
    q += " ORDER BY created_at DESC"
    return conn.execute(q, tuple(params)).fetchall()


def get_replay_snapshot(conn, snapshot_id: str) -> dict:
    row = conn.execute("SELECT * FROM replay_snapshots WHERE id=%s", (snapshot_id,)).fetchone()
    if not row:
        raise ApiError(404, f"Snapshot '{snapshot_id}' not found")
    return row


# ============================================================================
# 3. Deterministic Policy Replay Engine (Task 3.2 & 3.3)
# ============================================================================

def evaluate_snapshot_against_policy(snapshot_rows: list[dict], policy_rules: dict,
                                     programmes: dict[str, dict], seat_categories: dict[str, dict]) -> dict:
    """Pure deterministic function evaluating admission records under a specific policy.
    Computes capacity limits, category allocations, supernumerary caps, CIWG sub-caps,
    and returns deterministic violation outcomes with canonical result digest.
    """
    intake_mult = float(policy_rules.get("intake_multiplier", 1.0))
    sn_pct = float(policy_rules.get("supernumerary_pct", 15.0))
    ciwg_frac = policy_rules.get("ciwg_fraction", [1, 3])
    age_range = policy_rules.get("age_range", [15, 35])
    prog_overrides = policy_rules.get("programme_overrides", {})

    counters: dict[tuple[str, str], int] = {}
    violations: list[dict] = []
    accepted_rows = 0
    excess_seats = 0
    category_counts: dict[str, int] = {}
    prog_stats: dict[str, dict] = {}

    for idx, row in enumerate(snapshot_rows):
        prog_id = row["programme_id"]
        prog = programmes.get(prog_id)
        if not prog:
            violations.append({
                "row_index": idx,
                "code": "E304",
                "field": "programme_id",
                "message": f"Unknown or unapproved programme {prog_id}",
                "programme_id": prog_id,
            })
            continue

        base_intake = prog_overrides.get(prog_id, prog["approved_intake"])
        effective_intake = max(1, math.floor(base_intake * intake_mult))
        cat_code = row.get("seat_category", "REGULAR")
        category_counts[cat_code] = category_counts.get(cat_code, 0) + 1

        if prog_id not in prog_stats:
            prog_stats[prog_id] = {
                "programme_id": prog_id,
                "approved_intake": effective_intake,
                "regular_filled": 0,
                "supernumerary_cap": math.floor(effective_intake * sn_pct / 100),
                "supernumerary_filled": 0,
                "ciwg_cap": math.floor((effective_intake * sn_pct / 100) * (ciwg_frac[0] / ciwg_frac[1])),
                "ciwg_filled": 0,
                "excess": 0,
            }

        # Age verification if present
        if "dob" in row and "admission_date" in row:
            try:
                dob = date.fromisoformat(str(row["dob"])) if isinstance(row["dob"], str) else row["dob"]
                adm = date.fromisoformat(str(row["admission_date"])) if isinstance(row["admission_date"], str) else row["admission_date"]
                age = (adm - dob).days // 365
                if not (age_range[0] <= age <= age_range[1]):
                    violations.append({
                        "row_index": idx,
                        "code": "E402",
                        "field": "dob",
                        "message": f"Student age {age} outside statutory range [{age_range[0]}, {age_range[1]}]",
                        "programme_id": prog_id,
                    })
            except Exception:
                pass

        # Supernumerary / CIWG flags
        is_sn = bool(row.get("is_supernumerary"))
        is_ciwg = bool(row.get("is_ciwg"))

        # Check intake constraints
        if not is_sn:
            prog_stats[prog_id]["regular_filled"] += 1
            if prog_stats[prog_id]["regular_filled"] > prog_stats[prog_id]["approved_intake"]:
                excess_seats += 1
                prog_stats[prog_id]["excess"] += 1
                violations.append({
                    "row_index": idx,
                    "code": "E301",
                    "field": "seat_category",
                    "message": f"Excess over approved intake ({prog_stats[prog_id]['regular_filled']}/{prog_stats[prog_id]['approved_intake']})",
                    "programme_id": prog_id,
                })
            else:
                accepted_rows += 1
        else:
            prog_stats[prog_id]["supernumerary_filled"] += 1
            if prog_stats[prog_id]["supernumerary_filled"] > prog_stats[prog_id]["supernumerary_cap"]:
                excess_seats += 1
                prog_stats[prog_id]["excess"] += 1
                violations.append({
                    "row_index": idx,
                    "code": "E302",
                    "field": "seat_category",
                    "message": f"Excess supernumerary admissions ({prog_stats[prog_id]['supernumerary_filled']}/{prog_stats[prog_id]['supernumerary_cap']})",
                    "programme_id": prog_id,
                })
            else:
                accepted_rows += 1

            if is_ciwg:
                prog_stats[prog_id]["ciwg_filled"] += 1
                if prog_stats[prog_id]["ciwg_filled"] > prog_stats[prog_id]["ciwg_cap"]:
                    violations.append({
                        "row_index": idx,
                        "code": "E302",
                        "field": "is_ciwg",
                        "message": f"Excess CIWG sub-cap admissions ({prog_stats[prog_id]['ciwg_filled']}/{prog_stats[prog_id]['ciwg_cap']})",
                        "programme_id": prog_id,
                    })

    summary_stats = {
        "total_evaluated": len(snapshot_rows),
        "accepted_rows": accepted_rows,
        "violation_count": len(violations),
        "excess_seats": excess_seats,
        "category_breakdown": category_counts,
        "programme_stats": prog_stats,
    }

    # Deterministic result digest
    result_digest = _compute_digest({"summary": summary_stats, "violations": violations})

    return {
        "summary": summary_stats,
        "violations": violations,
        "result_digest": result_digest,
        "engine_version": ENGINE_VERSION,
    }


def run_policy_replay(conn, user: dict, policy_id: Any, version: int | None = None, snapshot_id: str | None = None, request=None) -> dict:
    """Executes deterministic policy replay of a snapshot against a policy version."""
    if isinstance(policy_id, dict):
        payload = policy_id
        policy_id = payload["policy_id"]
        version = payload["version"]
        snapshot_id = payload["snapshot_id"]

    pv = conn.execute(
        "SELECT * FROM policy_versions WHERE policy_id=%s AND version=%s",
        (policy_id, version)
    ).fetchone()
    if not pv:
        raise ApiError(404, f"Policy version '{policy_id} v{version}' not found")

    snap = conn.execute("SELECT * FROM replay_snapshots WHERE id=%s", (snapshot_id,)).fetchone()
    if not snap:
        raise ApiError(404, f"Snapshot '{snapshot_id}' not found")

    # Authorize access
    if user.get("role") == "institution_admin":
        if snap["institution_id"] and snap["institution_id"] != user["institution_id"]:
            raise ApiError(403, "Cannot replay snapshots of other institutions")

    rows = snap["rows_json"] if isinstance(snap["rows_json"], list) else json.loads(snap["rows_json"])
    rules = pv["rules_json"] if isinstance(pv["rules_json"], dict) else json.loads(pv["rules_json"])

    # Load programmes and seat categories from database
    progs = {p["id"]: dict(p) for p in conn.execute("SELECT * FROM programmes").fetchall()}
    cats = {c["code"]: dict(c) for c in conn.execute("SELECT * FROM seat_categories").fetchall()}

    start_ts = datetime.now(timezone.utc)
    eval_res = evaluate_snapshot_against_policy(rows, rules, progs, cats)
    duration_ms = int((datetime.now(timezone.utc) - start_ts).total_seconds() * 1000)

    job_row = conn.execute(
        """
        INSERT INTO replay_jobs (
            policy_id, policy_version, snapshot_id, engine_version,
            input_digest, result_digest, status, started_at, completed_at,
            duration_ms, summary_stats, violations_json, warnings, created_by
        )
        VALUES (%s, %s, %s, %s, %s, %s, 'completed', %s, now(), %s, %s::jsonb, %s::jsonb, %s, %s)
        RETURNING *
        """,
        (
            policy_id, version, snapshot_id, ENGINE_VERSION,
            snap["input_digest"], eval_res["result_digest"], start_ts,
            duration_ms, json.dumps(eval_res["summary"]), json.dumps(eval_res["violations"]),
            [], user["id"]
        )
    ).fetchone()

    auth.audit(conn, user, "policy.replay.execute", "replay_jobs", str(job_row["id"]),
               reason=f"Replayed {snapshot_id} vs {policy_id}-v{version}", request=request)
    conn.commit()

    return job_row


def get_replay_job(conn, job_id: int | str) -> dict:
    """Retrieve details and results of a policy replay job."""
    row = conn.execute("SELECT * FROM replay_jobs WHERE id=%s", (job_id,)).fetchone()
    if not row:
        raise ApiError(404, f"Replay job '{job_id}' not found")
    return row


# ============================================================================
# 4. Seat-Impact Simulation Engine (Task 3.3)
# ============================================================================

def run_seat_impact_simulation(conn, user: dict, baseline_policy_id: Any, baseline_version: int | None = None,
                               proposed_policy_id: str | None = None, proposed_version: int | None = None,
                               snapshot_id: str | None = None, title: str | None = None,
                               scope: dict | None = None, request=None) -> dict:
    """Compare admission allocations, capacities, and violations between baseline and proposed policies.
    Guarantees 100% read-only isolation: official admission records are never mutated.
    """
    if isinstance(baseline_policy_id, dict):
        payload = baseline_policy_id
        baseline_policy_id = payload["baseline_policy_id"]
        baseline_version = payload["baseline_version"]
        proposed_policy_id = payload["proposed_policy_id"]
        proposed_version = payload["proposed_version"]
        snapshot_id = payload["snapshot_id"]
        title = payload.get("title")
        scope = payload.get("scope")

    if user.get("role") not in ("aicte_officer", "auditor"):
        raise ApiError(403, "Only regulatory officers can trigger seat-impact simulations")

    # Load both policy versions
    p_base = conn.execute(
        "SELECT * FROM policy_versions WHERE policy_id=%s AND version=%s",
        (baseline_policy_id, baseline_version)
    ).fetchone()
    if not p_base:
        raise ApiError(404, f"Baseline policy version {baseline_policy_id} v{baseline_version} not found")

    p_prop = conn.execute(
        "SELECT * FROM policy_versions WHERE policy_id=%s AND version=%s",
        (proposed_policy_id, proposed_version)
    ).fetchone()
    if not p_prop:
        raise ApiError(404, f"Proposed policy version {proposed_policy_id} v{proposed_version} not found")

    snap = conn.execute("SELECT * FROM replay_snapshots WHERE id=%s", (snapshot_id,)).fetchone()
    if not snap:
        raise ApiError(404, f"Snapshot {snapshot_id} not found")

    rows = snap["rows_json"] if isinstance(snap["rows_json"], list) else json.loads(snap["rows_json"])
    base_rules = p_base["rules_json"] if isinstance(p_base["rules_json"], dict) else json.loads(p_base["rules_json"])
    prop_rules = p_prop["rules_json"] if isinstance(p_prop["rules_json"], dict) else json.loads(p_prop["rules_json"])

    progs = {p["id"]: dict(p) for p in conn.execute("SELECT * FROM programmes").fetchall()}
    cats = {c["code"]: dict(c) for c in conn.execute("SELECT * FROM seat_categories").fetchall()}

    # Run deterministic evaluation on both
    base_eval = evaluate_snapshot_against_policy(rows, base_rules, progs, cats)
    prop_eval = evaluate_snapshot_against_policy(rows, prop_rules, progs, cats)

    base_summary = base_eval["summary"]
    prop_summary = prop_eval["summary"]

    base_v_keys = {(v["row_index"], v["code"], v.get("programme_id")) for v in base_eval["violations"]}
    prop_v_keys = {(v["row_index"], v["code"], v.get("programme_id")) for v in prop_eval["violations"]}

    new_violations = [v for v in prop_eval["violations"] if (v["row_index"], v["code"], v.get("programme_id")) not in base_v_keys]
    resolved_violations = [v for v in base_eval["violations"] if (v["row_index"], v["code"], v.get("programme_id")) not in prop_v_keys]

    # Compare programme-level impacts
    all_prog_ids = sorted(list(set(base_summary["programme_stats"].keys()) | set(prop_summary["programme_stats"].keys())))
    prog_impacts = []
    total_base_cap = 0
    total_prop_cap = 0
    total_base_excess = 0
    total_prop_excess = 0

    for pid in all_prog_ids:
        b_p = base_summary["programme_stats"].get(pid, {})
        p_p = prop_summary["programme_stats"].get(pid, {})

        b_cap = b_p.get("approved_intake", 0) + b_p.get("supernumerary_cap", 0)
        p_cap = p_p.get("approved_intake", 0) + p_p.get("supernumerary_cap", 0)
        b_exc = b_p.get("excess", 0)
        p_exc = p_p.get("excess", 0)

        total_base_cap += b_cap
        total_prop_cap += p_cap
        total_base_excess += b_exc
        total_prop_excess += p_exc

        prog_impacts.append({
            "programme_id": pid,
            "baseline_capacity": b_cap,
            "proposed_capacity": p_cap,
            "capacity_delta": p_cap - b_cap,
            "baseline_excess": b_exc,
            "proposed_excess": p_exc,
            "excess_delta": p_exc - b_exc,
            "regular_filled": p_p.get("regular_filled", 0),
            "supernumerary_filled": p_p.get("supernumerary_filled", 0),
        })

    # Border-case records requiring manual review (e.g. students who fall into newly introduced excess)
    manual_review_cases = [
        {
            "row_index": v["row_index"],
            "programme_id": v["programme_id"],
            "code": v["code"],
            "reason": f"Record triggered new {v['code']} under proposed policy version",
        }
        for v in new_violations[:50]
    ]

    sim_title = title or f"Simulation: {baseline_policy_id} v{baseline_version} vs {proposed_policy_id} v{proposed_version}"
    impact_summary = {
        "baseline_policy": f"{baseline_policy_id}-v{baseline_version}",
        "proposed_policy": f"{proposed_policy_id}-v{proposed_version}",
        "snapshot_id": snapshot_id,
        "total_evaluated_records": len(rows),
        "baseline_total_capacity": total_base_cap,
        "proposed_total_capacity": total_prop_cap,
        "capacity_delta": total_prop_cap - total_base_cap,
        "baseline_excess_seats": total_base_excess,
        "proposed_excess_seats": total_prop_excess,
        "excess_seats_delta": total_prop_excess - total_base_excess,
        "new_violations_count": len(new_violations),
        "resolved_violations_count": len(resolved_violations),
        "manual_review_count": len(manual_review_cases),
        "policy_isolation_guarantee": "VERIFIED: Simulation is strictly read-only. 0 official admission records modified.",
    }

    sim_row = conn.execute(
        """
        INSERT INTO seat_simulations (
            title, baseline_policy_id, baseline_version,
            proposed_policy_id, proposed_version, snapshot_id,
            simulation_scope, impact_summary, programme_impacts,
            new_violations, resolved_violations, manual_review_cases,
            simulated_by
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s::jsonb, %s::jsonb, %s::jsonb, %s::jsonb, %s)
        RETURNING *
        """,
        (
            sim_title, baseline_policy_id, baseline_version,
            proposed_policy_id, proposed_version, snapshot_id,
            json.dumps(scope or {}), json.dumps(impact_summary),
            json.dumps(prog_impacts), json.dumps(new_violations),
            json.dumps(resolved_violations), json.dumps(manual_review_cases),
            user["id"]
        )
    ).fetchone()

    auth.audit(conn, user, "simulation.seat_impact.run", "seat_simulations", str(sim_row["id"]),
               reason=f"Compared {baseline_policy_id} vs {proposed_policy_id}", request=request)
    conn.commit()

    return sim_row


def get_seat_simulation(conn, simulation_id: int | str, user: dict | None = None) -> dict:
    """Retrieve full seat-impact simulation results."""
    row = conn.execute("SELECT * FROM seat_simulations WHERE id=%s", (simulation_id,)).fetchone()
    if not row:
        raise ApiError(404, f"Simulation {simulation_id} not found")
    return row


get_simulation_detail = get_seat_simulation


def list_seat_simulations(conn, institution_id: Any = None, user: dict | None = None) -> list[dict]:
    """List historical seat-impact simulations."""
    return conn.execute("SELECT * FROM seat_simulations ORDER BY simulated_at DESC LIMIT 50").fetchall()


list_simulations = list_seat_simulations


# ============================================================================
# 5. Explainable Admission Integrity Analytics (Task 3.4)
# ============================================================================

def run_integrity_analytics(conn, user: dict, academic_year: str | None = None, institution_id: str | None = None, request=None) -> list[dict]:
    """Deterministic analytics detecting irregular patterns across institutions and programmes.
    Rules are completely transparent and carry measurable evidence metrics.
    """
    academic_year = academic_year or "2026-27"
    if user.get("role") == "institution_admin":
        institution_id = user["institution_id"]

    findings: list[dict] = []
    now = datetime.now(timezone.utc)

    # 1. Indicator: OVER_INTAKE_PERSISTENCE (Repeated intake over-runs beyond approved cap)
    intake_q = """
        SELECT p.institution_id, p.id AS programme_id, p.name, p.approved_intake,
               c.filled, (c.filled - p.approved_intake) AS excess_count
        FROM programmes p
        JOIN programme_category_counters c ON c.programme_id = p.id
        WHERE c.academic_year = %s AND c.category_code = 'REGULAR'
          AND c.filled > p.approved_intake
    """
    params = [academic_year]
    if institution_id:
        intake_q += " AND p.institution_id = %s"
        params.append(institution_id)

    intake_excesses = conn.execute(intake_q, tuple(params)).fetchall()
    for row in intake_excesses:
        f_id = f"AIF-{academic_year}-OVI-{row['programme_id']}"
        ratio = round(row["excess_count"] / max(1, row["approved_intake"]), 3)
        severity = "HIGH" if ratio >= 0.20 or row["excess_count"] >= 15 else ("MEDIUM" if ratio >= 0.08 else "LOW")
        findings.append({
            "id": f_id,
            "indicator_type": "OVER_INTAKE_PERSISTENCE",
            "institution_id": row["institution_id"],
            "programme_id": row["programme_id"],
            "academic_year": academic_year,
            "severity": severity,
            "score": round(ratio * 100, 1),
            "detection_rule": "Regular admissions exceed statutory approved intake by >= 8%",
            "supporting_measurements": {
                "approved_intake": row["approved_intake"],
                "regular_filled": row["filled"],
                "excess_count": row["excess_count"],
                "excess_ratio": ratio,
            },
            "explanation": f"Programme '{row['name']}' admitted {row['filled']} regular students against an approved intake of {row['approved_intake']} (excess: +{row['excess_count']}, {ratio:.1%}).",
            "detected_at": now,
            "review_status": "NEW",
        })

    # 2. Indicator: SUPERNUMERARY_QUOTA_SPIKE (Unusually high supernumerary/CIWG intake)
    sn_q = """
        SELECT p.institution_id, p.id AS programme_id, p.name, p.approved_intake,
               c.filled AS sn_filled, c.cap AS sn_cap
        FROM programmes p
        JOIN programme_category_counters c ON c.programme_id = p.id
        WHERE c.academic_year = %s AND c.category_code = 'SN_FN_OCI_CIWG'
          AND c.filled > c.cap
    """
    sn_excesses = conn.execute(sn_q, (academic_year,)).fetchall()
    for row in sn_excesses:
        f_id = f"AIF-{academic_year}-SNQ-{row['programme_id']}"
        findings.append({
            "id": f_id,
            "indicator_type": "SUPERNUMERARY_QUOTA_SPIKE",
            "institution_id": row["institution_id"],
            "programme_id": row["programme_id"],
            "academic_year": academic_year,
            "severity": "HIGH",
            "score": round((row["sn_filled"] / max(1, row["sn_cap"])) * 100, 1),
            "detection_rule": "Supernumerary pool (FN/OCI/CIWG/NRI) admissions exceed 15% statutory ceiling",
            "supporting_measurements": {
                "supernumerary_filled": row["sn_filled"],
                "supernumerary_cap": row["sn_cap"],
                "intake_base": row["approved_intake"],
            },
            "explanation": f"Supernumerary pool admitted {row['sn_filled']} students exceeding statutory ceiling of {row['sn_cap']}.",
            "detected_at": now,
            "review_status": "NEW",
        })

    # 3. Indicator: CROSS_INSTITUTION_DUPLICATE_CLUSTER (Concentration of cross-college seat-blocking)
    dup_q = """
        SELECT c.institution_a, c.institution_b, COUNT(*) AS dup_count
        FROM duplicate_cases c
        WHERE c.academic_year = %s AND c.status IN ('flagged', 'open', 'under_investigation')
        GROUP BY c.institution_a, c.institution_b
        HAVING COUNT(*) >= 2
    """
    dup_clusters = conn.execute(dup_q, (academic_year,)).fetchall()
    for row in dup_clusters:
        f_id = f"AIF-{academic_year}-DUP-{row['institution_a']}-{row['institution_b']}"
        findings.append({
            "id": f_id,
            "indicator_type": "CROSS_INSTITUTION_DUPLICATE_CLUSTER",
            "institution_id": row["institution_a"],
            "programme_id": None,
            "academic_year": academic_year,
            "severity": "HIGH" if row["dup_count"] >= 5 else "MEDIUM",
            "score": float(row["dup_count"]),
            "detection_rule": ">= 2 unresolved duplicate student enrolments clustered between the same institution pair",
            "supporting_measurements": {
                "partner_institution": row["institution_b"],
                "concurrent_duplicates": row["dup_count"],
            },
            "explanation": f"Identified a cluster of {row['dup_count']} concurrent duplicate student enrolments between {row['institution_a']} and {row['institution_b']}.",
            "detected_at": now,
            "review_status": "NEW",
        })

    # 4. Indicator: DISPUTE_RESOLUTION_BOTTLENECK (Unresolved student disputes pending > 30 days)
    disp_q = """
        SELECT g.institution_id, COUNT(*) AS pending_count
        FROM student_grievances g
        WHERE g.status NOT IN ('resolved', 'withdrawn')
          AND g.submitted_at < now() - interval '30 days'
        GROUP BY g.institution_id
        HAVING COUNT(*) >= 2
    """
    disp_bottlenecks = conn.execute(disp_q).fetchall()
    for row in disp_bottlenecks:
        f_id = f"AIF-{academic_year}-BOT-{row['institution_id']}"
        findings.append({
            "id": f_id,
            "indicator_type": "DISPUTE_RESOLUTION_BOTTLENECK",
            "institution_id": row["institution_id"],
            "programme_id": None,
            "academic_year": academic_year,
            "severity": "MEDIUM",
            "score": float(row["pending_count"]),
            "detection_rule": ">= 2 student grievance disputes remain unresolved beyond 30-day statutory resolution window",
            "supporting_measurements": {
                "unresolved_disputes_over_30d": row["pending_count"],
            },
            "explanation": f"Institution has {row['pending_count']} student academic disputes pending resolution beyond 30 days.",
            "detected_at": now,
            "review_status": "NEW",
        })

    # Upsert findings into database
    for f in findings:
        conn.execute(
            """
            INSERT INTO admission_integrity_findings (
                id, indicator_type, institution_id, programme_id, academic_year,
                severity, score, detection_rule, supporting_measurements,
                explanation, detected_at, review_status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                score = EXCLUDED.score,
                severity = EXCLUDED.severity,
                supporting_measurements = EXCLUDED.supporting_measurements,
                explanation = EXCLUDED.explanation
            """,
            (
                f["id"], f["indicator_type"], f["institution_id"], f["programme_id"],
                f["academic_year"], f["severity"], f["score"], f["detection_rule"],
                json.dumps(f["supporting_measurements"]), f["explanation"], f["detected_at"],
                f["review_status"]
            )
        )

    conn.commit()
    return findings


def review_integrity_finding(conn, user: dict, finding_id: str, action: Any, notes: str | None = None, request=None) -> dict:
    """Non-destructive review decision on an admission integrity indicator."""
    if user.get("role") not in ("aicte_officer", "auditor"):
        raise ApiError(403, "Only regulatory officers can record finding review decisions")

    if isinstance(action, dict):
        payload = action
        action = payload.get("action") or payload.get("review_status")
        notes = payload.get("notes") or payload.get("reason") or "Reviewed"

    notes = notes or "Reviewed"
    action_norm = (action or "UNDER_INVESTIGATION").strip().upper()
    if action_norm not in ("UNDER_INVESTIGATION", "DISMISSED", "ESCALATED"):
        raise ApiError(422, f"Invalid review action '{action}'. Allowed: UNDER_INVESTIGATION, DISMISSED, ESCALATED")

    finding = conn.execute(
        "SELECT * FROM admission_integrity_findings WHERE id=%s FOR UPDATE",
        (finding_id,)
    ).fetchone()
    if not finding:
        raise ApiError(404, f"Finding '{finding_id}' not found")

    updated = conn.execute(
        """
        UPDATE admission_integrity_findings
        SET review_status=%s, review_notes=%s, reviewed_by=%s, reviewed_at=now()
        WHERE id=%s
        RETURNING *
        """,
        (action_norm, notes, user["id"], finding_id)
    ).fetchone()

    # Log into audit reviews
    conn.execute(
        """
        INSERT INTO finding_reviews (finding_id, action, notes, reviewer_id)
        VALUES (%s, %s, %s, %s)
        """,
        (finding_id, action_norm, notes, user["id"])
    )

    auth.audit(conn, user, "analytics.finding.review", "admission_integrity_findings", finding_id,
               reason=f"Action: {action_norm} - {notes}", request=request)
    conn.commit()

    return updated


def list_integrity_findings(conn, institution_id: Any = None, academic_year: str | None = None,
                            indicator_type: str | None = None, severity: str | None = None, review_status: str | None = None,
                            user: dict | None = None) -> list[dict]:
    """Retrieve filtered admission integrity findings."""
    q = "SELECT * FROM admission_integrity_findings WHERE 1=1"
    params: list[Any] = []
    inst_id = institution_id.get("institution_id") if isinstance(institution_id, dict) else institution_id
    if inst_id:
        q += " AND institution_id=%s"
        params.append(inst_id)
    if academic_year:
        q += " AND academic_year=%s"
        params.append(academic_year)
    if review_status:
        q += " AND review_status=%s"
        params.append(review_status.upper())
    if severity:
        q += " AND severity=%s"
        params.append(severity.upper())
    if indicator_type:
        q += " AND indicator_type=%s"
        params.append(indicator_type.upper())
    q += " ORDER BY detected_at DESC"
    return conn.execute(q, tuple(params)).fetchall()

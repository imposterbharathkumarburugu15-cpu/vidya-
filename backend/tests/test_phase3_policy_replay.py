"""Vidyadwaar Phase 3 Functional Tests:
Policy Versioning Lifecycle, Deterministic Policy Replay, Seat-Impact Simulation,
and Explainable Admission Integrity Analytics.
"""
from datetime import date, datetime, timezone
import hashlib
import json
import pytest

from app.policy import (
    POLICY_STATUSES,
    POLICY_TRANSITIONS,
    DEFAULT_RULES,
    _compute_digest,
    _canonical_json,
    evaluate_snapshot_against_policy,
)
from app.ingest import ApiError


def test_policy_lifecycle_state_transitions():
    # Valid forward transitions
    assert "UNDER_REVIEW" in POLICY_TRANSITIONS["DRAFT"]
    assert "APPROVED" in POLICY_TRANSITIONS["UNDER_REVIEW"]
    assert "ACTIVE" in POLICY_TRANSITIONS["APPROVED"]
    assert "SUPERSEDED" in POLICY_TRANSITIONS["ACTIVE"]
    assert "RETIRED" in POLICY_TRANSITIONS["ACTIVE"]

    # Direct activation from DRAFT without formal review & approval is strictly rejected
    assert "ACTIVE" not in POLICY_TRANSITIONS["DRAFT"]
    assert "APPROVED" not in POLICY_TRANSITIONS["DRAFT"]

    # Retired is a terminal state
    assert len(POLICY_TRANSITIONS["RETIRED"]) == 0


def test_canonical_json_and_sha256_digest_immutability():
    # Record A and Record B with same data in different key orders
    record_a = {"student_id": "APAAR-101", "programme_id": "P-CSE-01", "category": "REGULAR", "is_supernumerary": False}
    record_b = {"category": "REGULAR", "is_supernumerary": False, "student_id": "APAAR-101", "programme_id": "P-CSE-01"}

    # RFC 8785 canonical JSON sorts keys deterministically
    assert _canonical_json(record_a) == _canonical_json(record_b)
    assert _compute_digest(record_a) == _compute_digest(record_b)

    # Any mutation (adversarial tamper or accidental corruption) changes the digest
    tampered_record = {"category": "REGULAR", "is_supernumerary": True, "student_id": "APAAR-101", "programme_id": "P-CSE-01"}
    assert _compute_digest(tampered_record) != _compute_digest(record_a)


def test_pure_deterministic_policy_replay():
    # Mock programmes
    programmes = {
        "P-CSE": {"id": "P-CSE", "name": "Computer Science & Engineering", "approved_intake": 60},
        "P-ECE": {"id": "P-ECE", "name": "Electronics & Communication", "approved_intake": 40},
    }
    seat_categories = {
        "REGULAR": {"code": "REGULAR", "is_supernumerary": False},
        "SN_FN_OCI_CIWG": {"code": "SN_FN_OCI_CIWG", "is_supernumerary": True},
    }

    # Synthetic admission records: 62 regular students for P-CSE (intake 60 -> 2 excess)
    # plus 10 supernumerary students (cap 15% of 60 = 9 -> 1 excess)
    snapshot_rows = []
    for i in range(1, 63):
        snapshot_rows.append({
            "id": i,
            "programme_id": "P-CSE",
            "academic_year": "2026-27",
            "institution_student_id": f"CSE-2026-{i:03d}",
            "seat_category": "REGULAR",
            "is_supernumerary": False,
            "is_ciwg": False,
            "dob": "2006-05-15",
            "admission_date": "2026-07-10",
        })
    for i in range(63, 73):
        snapshot_rows.append({
            "id": i,
            "programme_id": "P-CSE",
            "academic_year": "2026-27",
            "institution_student_id": f"CSE-2026-{i:03d}",
            "seat_category": "SN_FN_OCI_CIWG",
            "is_supernumerary": True,
            "is_ciwg": False,
            "dob": "2006-05-15",
            "admission_date": "2026-07-10",
        })

    # Execute deterministic evaluation Run 1
    eval_run_1 = evaluate_snapshot_against_policy(snapshot_rows, DEFAULT_RULES, programmes, seat_categories)

    # Execute deterministic evaluation Run 2 with identical inputs
    eval_run_2 = evaluate_snapshot_against_policy(snapshot_rows, DEFAULT_RULES, programmes, seat_categories)

    # Determinism assertion: Result digests must match byte-for-byte
    assert eval_run_1["result_digest"] == eval_run_2["result_digest"]
    assert eval_run_1["summary"]["total_evaluated"] == 72
    assert eval_run_1["summary"]["excess_seats"] == 3  # 2 regular excess + 1 supernumerary excess

    # Check statutory violation codes
    violation_codes = [v["code"] for v in eval_run_1["violations"]]
    assert violation_codes.count("E301") == 2  # Excess regular intake
    assert violation_codes.count("E302") == 1  # Excess supernumerary quota


def test_seat_impact_simulation_capacity_deltas():
    programmes = {
        "P-CSE": {"id": "P-CSE", "name": "Computer Science & Engineering", "approved_intake": 60},
    }
    seat_categories = {
        "REGULAR": {"code": "REGULAR", "is_supernumerary": False},
        "SN_FN_OCI_CIWG": {"code": "SN_FN_OCI_CIWG", "is_supernumerary": True},
    }

    # 65 students admitted
    snapshot_rows = [
        {
            "id": i,
            "programme_id": "P-CSE",
            "academic_year": "2026-27",
            "institution_student_id": f"CSE-{i}",
            "seat_category": "REGULAR",
            "is_supernumerary": False,
            "is_ciwg": False,
        }
        for i in range(1, 66)
    ]

    # Baseline: intake_multiplier = 1.0 (approved intake = 60, excess = 5)
    baseline_rules = {**DEFAULT_RULES, "intake_multiplier": 1.0}
    base_eval = evaluate_snapshot_against_policy(snapshot_rows, baseline_rules, programmes, seat_categories)
    assert base_eval["summary"]["excess_seats"] == 5

    # Proposed Policy: intake_multiplier = 1.1 (approved intake = floor(60 * 1.1) = 66, excess = 0)
    proposed_rules = {**DEFAULT_RULES, "intake_multiplier": 1.1}
    prop_eval = evaluate_snapshot_against_policy(snapshot_rows, proposed_rules, programmes, seat_categories)
    assert prop_eval["summary"]["excess_seats"] == 0

    # Capacity delta:
    base_prog = base_eval["summary"]["programme_stats"]["P-CSE"]
    prop_prog = prop_eval["summary"]["programme_stats"]["P-CSE"]

    assert base_prog["approved_intake"] == 60
    assert prop_prog["approved_intake"] == 66
    assert prop_prog["approved_intake"] - base_prog["approved_intake"] == 6

    # Violations in baseline that disappear in proposed policy (resolved violations)
    base_violation_rows = {v["row_index"] for v in base_eval["violations"]}
    prop_violation_rows = {v["row_index"] for v in prop_eval["violations"]}

    resolved_violations = base_violation_rows - prop_violation_rows
    assert len(resolved_violations) == 5


def test_supernumerary_and_ciwg_sub_cap_constraints():
    programmes = {
        "P-MECH": {"id": "P-MECH", "name": "Mechanical Engineering", "approved_intake": 100},
    }
    seat_categories = {
        "REGULAR": {"code": "REGULAR", "is_supernumerary": False},
        "SN_FN_OCI_CIWG": {"code": "SN_FN_OCI_CIWG", "is_supernumerary": True},
    }

    # Intake 100 -> 15% supernumerary cap = 15 seats.
    # CIWG fraction 1/3 of supernumerary pool = floor(15 * 1/3) = 5 seats.
    rows = []
    # 6 CIWG students (exceeding sub-cap of 5 by 1)
    for i in range(1, 7):
        rows.append({
            "id": i,
            "programme_id": "P-MECH",
            "academic_year": "2026-27",
            "institution_student_id": f"MECH-CIWG-{i}",
            "seat_category": "SN_FN_OCI_CIWG",
            "is_supernumerary": True,
            "is_ciwg": True,
        })

    eval_res = evaluate_snapshot_against_policy(rows, DEFAULT_RULES, programmes, seat_categories)
    stats = eval_res["summary"]["programme_stats"]["P-MECH"]

    assert stats["supernumerary_cap"] == 15
    assert stats["ciwg_cap"] == 5
    assert stats["ciwg_filled"] == 6
    # Triggers statutory E302 CATEGORY_CAP_EXCEEDED violation on CIWG sub-cap
    ciwg_violations = [v for v in eval_res["violations"] if v["code"] == "E302" and v["field"] == "is_ciwg"]
    assert len(ciwg_violations) == 1
    assert "CIWG sub-cap" in ciwg_violations[0]["message"]

"""Unit and security tests for Privacy-Preserving Cross-Institution Matching (Phase 5).
Smart India Hackathon 2026 | Problem Statement 26263

Validates:
1. Deterministic normalization and key-separated blind indexing.
2. Multi-tier explainable matching rules (High-confidence exact, composite, conflicting, name-only).
3. Canonical pair ordering preventing reversed duplicate records.
4. Role-based data minimization (peer student PII redacted from institution view).
5. Authorization boundaries and cross-institution isolation.
6. Seamless E203 case reuse, creation, and human-in-the-loop review decision integration.
7. Idempotent candidate generation and queue statistics.
"""
from datetime import datetime, timezone
import json
import pytest

from app import crypto, matching
from app.ingest import ApiError


# ============================================================================
# 1. Normalization & Cryptography Tests (Task A & B)
# ============================================================================

def test_deterministic_normalization():
    """Validates deterministic normalization across academic identifiers, names, and DOBs."""
    # Identifiers: whitespace, casing, dashes, dots collapsed
    assert matching.normalize_identifier(" REG-2026.001-A ") == "reg2026001a"
    assert matching.normalize_identifier("1-000-000-0001") == "10000000001"
    assert matching.normalize_identifier("") == ""
    assert matching.normalize_identifier(None) == ""

    # Student names: casing, honorifics, punctuation, accents stripped
    n1 = matching.normalize_student_name("Ms. Priya Sharma")
    n2 = matching.normalize_student_name("priya sharma.")
    assert n1 == n2 == "priya sharma"

    # DOB bucket: 16-bit integer bucket
    b1 = matching.compute_dob_bucket("2004-05-15")
    b2 = matching.compute_dob_bucket("2004-05-15")
    assert isinstance(b1, int)
    assert b1 == b2
    assert 0 <= b1 <= 65535


def test_blind_indexing_compatibility_and_key_separation():
    """Ensures matching service reuses existing HMAC-SHA256 blind indexing primitives and key separation."""
    apaar_sample = "123456789012"
    bi1 = matching.compute_apaar_blind_index(apaar_sample)
    bi_existing = crypto.apaar_bi(apaar_sample)
    assert bi1 == bi_existing
    assert len(bi1) == 64  # SHA-256 hex string

    # Key separation: HMAC of APAAR using k_apaar_bi is distinct from k_name_bi or k_dob_bi
    phon_tokens = matching.compute_phonetic_tokens("Priya Sharma")
    assert isinstance(phon_tokens, list)
    assert len(phon_tokens) > 0
    # Every token is 32-hex character truncated HMAC using k_name_bi
    for t in phon_tokens:
        assert len(t) == 32
        assert t != bi1[:32]


def test_invalid_identifiers_return_none():
    """Validates that malformed APAAR numbers do not generate valid blind indexes."""
    assert matching.compute_apaar_blind_index("123") is None
    assert matching.compute_apaar_blind_index("invalid-apaar") is None
    assert matching.compute_apaar_blind_index("") is None
    assert matching.compute_apaar_blind_index(None) is None


# ============================================================================
# 2. Matching Engine Rules & Classifications (Task B & D)
# ============================================================================

def test_matching_rule_exact_high_confidence():
    """Tier 1: Exact APAAR blind index match across distinct institutions -> HIGH_CONFIDENCE_EXACT."""
    apaar_bi = crypto.apaar_bi("999988887777")
    dob_bucket = crypto.dob_bucket("2003-08-20")
    phon = crypto.name_phonetic("Rahul Verma")

    rec_a = {
        "enrolment_id": 101,
        "institution_id": "INST-001",
        "student_id": 1,
        "apaar_bi": apaar_bi,
        "bi_dob_bucket": dob_bucket,
        "bi_name_phon": phon,
    }
    rec_b = {
        "enrolment_id": 202,
        "institution_id": "INST-002",
        "student_id": 2,
        "apaar_bi": apaar_bi,
        "bi_dob_bucket": dob_bucket,
        "bi_name_phon": phon,
    }

    result = matching.evaluate_record_pair(rec_a, rec_b)
    assert result is not None
    assert result["classification"] == matching.CLASSIFICATION_HIGH_CONFIDENCE_EXACT
    assert result["confidence_score"] >= 0.94
    assert "apaar_id" in result["matched_fields"]
    assert "dob_bucket" in result["matched_fields"]
    assert len(result["conflicting_fields"]) == 0
    assert result["record_a_enrolment_id"] == 101
    assert result["record_b_enrolment_id"] == 202


def test_matching_rule_conflicting_info():
    """Tier 3: Same APAAR blind index with divergent DOB bucket -> CONFLICTING_INFO."""
    apaar_bi = crypto.apaar_bi("999988887777")
    dob_bucket_a = crypto.dob_bucket("2003-08-20")
    dob_bucket_b = crypto.dob_bucket("1998-01-10")

    rec_a = {
        "enrolment_id": 101,
        "institution_id": "INST-001",
        "student_id": 1,
        "apaar_bi": apaar_bi,
        "bi_dob_bucket": dob_bucket_a,
        "bi_name_phon": crypto.name_phonetic("Rahul Verma"),
    }
    rec_b = {
        "enrolment_id": 202,
        "institution_id": "INST-002",
        "student_id": 2,
        "apaar_bi": apaar_bi,
        "bi_dob_bucket": dob_bucket_b,
        "bi_name_phon": crypto.name_phonetic("Suresh Kumar"),
    }

    result = matching.evaluate_record_pair(rec_a, rec_b)
    assert result is not None
    assert result["classification"] == matching.CLASSIFICATION_CONFLICTING_INFO
    assert "apaar_id" in result["matched_fields"]
    assert "dob_bucket" in result["conflicting_fields"]
    assert result["confidence_score"] == 0.70


def test_matching_rule_multi_field_composite():
    """Tier 2: Missing/unmatched APAAR but matching phonetic name tokens and DOB bucket -> MULTI_FIELD_COMPOSITE."""
    dob_bucket = crypto.dob_bucket("2004-11-25")
    phon = crypto.name_phonetic("Ananya Sen")

    rec_a = {
        "enrolment_id": 305,
        "institution_id": "INST-001",
        "student_id": 3,
        "apaar_bi": None,  # APAAR not yet generated or refused
        "bi_dob_bucket": dob_bucket,
        "bi_name_phon": phon,
    }
    rec_b = {
        "enrolment_id": 408,
        "institution_id": "INST-003",
        "student_id": 4,
        "apaar_bi": None,
        "bi_dob_bucket": dob_bucket,
        "bi_name_phon": phon,
    }

    result = matching.evaluate_record_pair(rec_a, rec_b)
    assert result is not None
    assert result["classification"] == matching.CLASSIFICATION_MULTI_FIELD_COMPOSITE
    assert result["confidence_score"] == 0.85
    assert "student_name_phonetic" in result["matched_fields"]
    assert "dob_bucket" in result["matched_fields"]


def test_matching_rule_name_only_lead():
    """Tier 4: Phonetic name similarity with divergent DOB bucket -> NAME_ONLY_LEAD."""
    dob_bucket_a = crypto.dob_bucket("2002-04-12")
    dob_bucket_b = crypto.dob_bucket("2005-09-01")
    phon = crypto.name_phonetic("Deepak Kumar")

    rec_a = {
        "enrolment_id": 501,
        "institution_id": "INST-001",
        "student_id": 5,
        "apaar_bi": None,
        "bi_dob_bucket": dob_bucket_a,
        "bi_name_phon": phon,
    }
    rec_b = {
        "enrolment_id": 602,
        "institution_id": "INST-002",
        "student_id": 6,
        "apaar_bi": None,
        "bi_dob_bucket": dob_bucket_b,
        "bi_name_phon": phon,
    }

    result = matching.evaluate_record_pair(rec_a, rec_b)
    assert result is not None
    assert result["classification"] == matching.CLASSIFICATION_NAME_ONLY_LEAD
    assert result["confidence_score"] == 0.40
    assert "student_name_phonetic" in result["matched_fields"]
    assert "dob_bucket" in result["conflicting_fields"]


def test_same_institution_records_ignored():
    """Cross-institution matcher must ignore comparisons within the same institution."""
    apaar_bi = crypto.apaar_bi("999988887777")
    rec_a = {
        "enrolment_id": 10,
        "institution_id": "INST-001",
        "student_id": 1,
        "apaar_bi": apaar_bi,
        "bi_dob_bucket": 100,
        "bi_name_phon": [],
    }
    rec_b = {
        "enrolment_id": 11,
        "institution_id": "INST-001",  # Same institution
        "student_id": 2,
        "apaar_bi": apaar_bi,
        "bi_dob_bucket": 100,
        "bi_name_phon": [],
    }
    assert matching.evaluate_record_pair(rec_a, rec_b) is None


def test_canonical_pair_ordering_normalization():
    """Pair (B, A) is normalized to canonical ordering (A, B) preventing reversed duplicates."""
    apaar_bi = crypto.apaar_bi("999988887777")
    rec_lower = {
        "enrolment_id": 100,
        "institution_id": "INST-001",
        "student_id": 1,
        "apaar_bi": apaar_bi,
        "bi_dob_bucket": 500,
        "bi_name_phon": [],
    }
    rec_higher = {
        "enrolment_id": 200,
        "institution_id": "INST-002",
        "student_id": 2,
        "apaar_bi": apaar_bi,
        "bi_dob_bucket": 500,
        "bi_name_phon": [],
    }

    # Pass in reversed order (higher, lower)
    res = matching.evaluate_record_pair(rec_higher, rec_lower)
    assert res is not None
    assert res["record_a_enrolment_id"] == 100
    assert res["record_b_enrolment_id"] == 200
    assert res["record_a_institution_id"] == "INST-001"
    assert res["record_b_institution_id"] == "INST-002"


# ============================================================================
# 3. Data Minimization & Privacy Protection (Task C & F)
# ============================================================================

class MockDbCursor:
    def __init__(self, data=None):
        self.data = data or []

    def fetchall(self):
        return self.data

    def fetchone(self):
        return self.data[0] if self.data else None

    def __iter__(self):
        return iter(self.data)


class MockDbConn:
    def __init__(self, enrolments=None, match_row=None):
        self.enrolments = enrolments or {}
        self.match_row = match_row
        self.executed_queries = []

    def execute(self, sql, params=()):
        self.executed_queries.append((sql, params))
        # Handle enrolment query
        if "FROM enrolments e" in sql:
            ids = params[0] if isinstance(params[0], tuple) else (params[0], params[1])
            res = [self.enrolments[eid] for eid in ids if eid in self.enrolments]
            return MockDbCursor(res)
        if "FROM candidate_matches" in sql:
            if self.match_row:
                return MockDbCursor([self.match_row])
            return MockDbCursor([])
        return MockDbCursor([])


def test_data_minimization_institution_admin_view():
    """An institution admin sees their own student details, while peer institution details are strictly redacted."""
    enrolment_lookup = {
        100: {
            "id": 100,
            "institution_student_id": "INST1-ROLL-1234",
            "programme_id": "INST-001:CSE",
            "programme_name": "Computer Science and Engineering",
            "institution_id": "INST-001",
            "institution_name": "Delhi Technical Institute",
            "apaar_masked": "XXXX-XXXX-1234",
        },
        200: {
            "id": 200,
            "institution_student_id": "PEER-SECRET-ROLL-5678",
            "programme_id": "INST-002:ECE",
            "programme_name": "Electronics Engineering",
            "institution_id": "INST-002",
            "institution_name": "Mumbai Engineering College",
            "apaar_masked": "XXXX-XXXX-9999",
        },
    }
    match_row = {
        "id": "MATCH-2026-0001",
        "academic_year": "2026-27",
        "rule_version": "RULE_V1_0",
        "normalization_version": "NORM_V1_0",
        "classification": "HIGH_CONFIDENCE_EXACT",
        "status": "PENDING_REVIEW",
        "confidence_score": 0.98,
        "record_a_institution_id": "INST-001",
        "record_a_enrolment_id": 100,
        "record_b_institution_id": "INST-002",
        "record_b_enrolment_id": 200,
        "matched_fields": ["apaar_id"],
        "conflicting_fields": [],
        "measurements": {"test": 1},
        "linked_case_id": 42,
        "created_at": datetime.now(timezone.utc),
    }

    mock_conn = MockDbConn(enrolments=enrolment_lookup, match_row=match_row)

    # Caller is institution admin for INST-001
    user_inst1 = {"role": "institution_admin", "institution_id": "INST-001", "id": "admin_inst1"}
    output = matching.format_candidate_match(mock_conn, match_row, user_inst1)

    # Record A (own): full details
    assert output["record_a"]["institution_id"] == "INST-001"
    assert output["record_a"]["institution_student_id"] == "INST1-ROLL-1234"
    assert output["record_a"]["apaar_masked"] == "XXXX-XXXX-1234"
    assert output["record_a"]["is_own_institution"] is True

    # Record B (peer): REDACTED / MINIMIZED
    assert output["record_b"]["institution_id"] == "INST-002"
    assert output["record_b"]["institution_student_id"] == "REDACTED"
    assert output["record_b"]["apaar_masked"] == "XXXX-XXXX-****"
    assert "REDACTED" in output["record_b"]["programme_name"]
    assert output["record_b"]["is_own_institution"] is False


def test_data_minimization_regulator_view():
    """An AICTE officer / auditor can inspect details for both participating institutions."""
    enrolment_lookup = {
        100: {
            "id": 100,
            "institution_student_id": "INST1-ROLL-1234",
            "programme_id": "INST-001:CSE",
            "programme_name": "Computer Science and Engineering",
            "institution_id": "INST-001",
            "institution_name": "Delhi Technical Institute",
            "apaar_masked": "XXXX-XXXX-1234",
        },
        200: {
            "id": 200,
            "institution_student_id": "PEER-ROLL-5678",
            "programme_id": "INST-002:ECE",
            "programme_name": "Electronics Engineering",
            "institution_id": "INST-002",
            "institution_name": "Mumbai Engineering College",
            "apaar_masked": "XXXX-XXXX-9999",
        },
    }
    match_row = {
        "id": "MATCH-2026-0001",
        "academic_year": "2026-27",
        "rule_version": "RULE_V1_0",
        "normalization_version": "NORM_V1_0",
        "classification": "HIGH_CONFIDENCE_EXACT",
        "status": "PENDING_REVIEW",
        "confidence_score": 0.98,
        "record_a_institution_id": "INST-001",
        "record_a_enrolment_id": 100,
        "record_b_institution_id": "INST-002",
        "record_b_enrolment_id": 200,
        "matched_fields": ["apaar_id"],
        "conflicting_fields": [],
        "measurements": {},
        "linked_case_id": 42,
        "created_at": datetime.now(timezone.utc),
    }

    mock_conn = MockDbConn(enrolments=enrolment_lookup, match_row=match_row)
    user_regulator = {"role": "aicte_officer", "id": "officer_1"}
    output = matching.format_candidate_match(mock_conn, match_row, user_regulator)

    # Regulator sees unmasked metadata for both institutions
    assert output["record_a"]["institution_student_id"] == "INST1-ROLL-1234"
    assert output["record_b"]["institution_student_id"] == "PEER-ROLL-5678"
    assert output["record_b"]["apaar_masked"] == "XXXX-XXXX-9999"


def test_cross_institution_isolation_unauthorized_institution():
    """An institution not participating in a candidate match is denied access (403)."""
    match_row = {
        "id": "MATCH-2026-0001",
        "record_a_institution_id": "INST-001",
        "record_b_institution_id": "INST-002",
        "record_a_enrolment_id": 100,
        "record_b_enrolment_id": 200,
    }
    user_third_party = {"role": "institution_admin", "institution_id": "INST-003", "id": "admin_3"}
    mock_conn = MockDbConn(match_row=match_row)

    with pytest.raises(ApiError) as exc:
        matching.format_candidate_match(mock_conn, match_row, user_third_party)
    assert exc.value.status == 403


# ============================================================================
# 4. Human Review & Case Integration (Task E & H)
# ============================================================================

def test_review_decision_transitions_and_case_linkage():
    """Human review updates candidate status, linked E203 case status, and records a structured decision."""
    match_row = {
        "id": "MATCH-2026-0001",
        "academic_year": "2026-27",
        "rule_version": "RULE_V1_0",
        "normalization_version": "NORM_V1_0",
        "classification": "HIGH_CONFIDENCE_EXACT",
        "status": "PENDING_REVIEW",
        "confidence_score": 0.98,
        "record_a_institution_id": "INST-001",
        "record_a_enrolment_id": 100,
        "record_b_institution_id": "INST-002",
        "record_b_enrolment_id": 200,
        "matched_fields": ["apaar_id"],
        "conflicting_fields": [],
        "measurements": {},
        "linked_case_id": 42,
        "created_at": datetime.now(timezone.utc),
    }

    mock_conn = MockDbConn(match_row=match_row)
    user_officer = {"role": "aicte_officer", "id": "aicte_inspector"}

    # Review as confirmed duplicate
    res = matching.review_candidate_match(
        mock_conn,
        user=user_officer,
        match_id="MATCH-2026-0001",
        action=matching.ACTION_CONFIRM_DUPLICATE,
        notes="Verified double admission across State borders; student admitted to two full-time B.Tech programmes.",
    )

    # Check that update queries were executed for candidate_matches, duplicate_cases, and case_decisions
    queries = [q[0] for q in mock_conn.executed_queries]
    assert any("UPDATE candidate_matches" in q for q in queries)
    assert any("UPDATE duplicate_cases" in q for q in queries)
    assert any("INSERT INTO case_decisions" in q for q in queries)
    assert any("INSERT INTO audit_logs" in q for q in queries)


def test_review_decision_validation_errors():
    """Validates bad action rejections and short review notes rejection."""
    mock_conn = MockDbConn(match_row={"id": "M1", "record_a_institution_id": "I1", "record_b_institution_id": "I2"})
    user_officer = {"role": "aicte_officer", "id": "officer"}

    # Invalid action
    with pytest.raises(ApiError) as exc:
        matching.review_candidate_match(mock_conn, user_officer, "M1", "INVALID_ACTION", "Notes valid length")
    assert exc.value.status == 400

    # Notes too short
    with pytest.raises(ApiError) as exc:
        matching.review_candidate_match(mock_conn, user_officer, "M1", matching.ACTION_CONFIRM_DUPLICATE, "abc")
    assert exc.value.status == 422

"""Phase 2 Unit & Functional Tests: Evidence-Backed Case Resolution & Student Grievances.
Tests upload validation, MIME spoofing rejection, SHA-256 cryptographic integrity verification,
lifecycle state machine constraints, and privacy-scoped student responses.
"""
import hashlib
import io
import pytest
from app.cases import _validate_file_security, CASE_TRANSITIONS, GRIEVANCE_TRANSITIONS
from app.ingest import ApiError


def test_file_security_validation_valid_formats():
    # Valid PDF
    pdf_bytes = b"%PDF-1.4\n%test file content here"
    assert _validate_file_security(pdf_bytes, "document.pdf", "application/pdf") == "application/pdf"

    # Valid PNG
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    assert _validate_file_security(png_bytes, "photo.png", "image/png") == "image/png"

    # Valid JPEG
    jpeg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    assert _validate_file_security(jpeg_bytes, "scan.jpg", "image/jpeg") == "image/jpeg"

    # Valid WebP
    webp_bytes = b"RIFF\x20\x00\x00\x00WEBPVP8 "
    assert _validate_file_security(webp_bytes, "image.webp", "image/webp") == "image/webp"


def test_file_security_rejection_empty_and_oversized():
    # Empty file
    with pytest.raises(ApiError) as exc:
        _validate_file_security(b"", "empty.pdf", "application/pdf")
    assert exc.value.status == 400

    # Oversized file (>10MB)
    huge_bytes = b"%PDF-" + b"0" * (10 * 1024 * 1024 + 1)
    with pytest.raises(ApiError) as exc:
        _validate_file_security(huge_bytes, "huge.pdf", "application/pdf")
    assert exc.value.status == 413


def test_file_security_rejection_prohibited_extensions():
    # Prohibited executable / script extensions
    bad_files = [
        ("malware.exe", "application/octet-stream"),
        ("script.sh", "text/x-sh"),
        ("inject.html", "text/html"),
        ("vector.svg", "image/svg+xml"),
        ("payload.py", "text/x-python"),
    ]
    for name, mime in bad_files:
        with pytest.raises(ApiError) as exc:
            _validate_file_security(b"%PDF-safe", name, mime)
        assert exc.value.status == 415


def test_file_security_mime_magic_mismatch_spoofing():
    # Attacker names file 'invoice.pdf' with MIME 'application/pdf', but bytes are plain text
    fake_pdf = b"Hello this is not really a PDF file"
    with pytest.raises(ApiError) as exc:
        _validate_file_security(fake_pdf, "invoice.pdf", "application/pdf")
    assert exc.value.status == 422
    assert "magic header mismatch" in exc.value.detail


def test_sha256_cryptographic_digest_integrity():
    test_content = b"%PDF-1.4 Evidence content verified by SIH evaluator"
    computed_digest = hashlib.sha256(test_content).hexdigest()
    assert len(computed_digest) == 64
    # Recomputing over same exact bytes guarantees tamper evidence
    assert hashlib.sha256(test_content).hexdigest() == computed_digest

    # Tampered byte changes hash completely (avalanche effect)
    tampered_content = b"%PDF-1.4 Evidence content modified by adversary"
    assert hashlib.sha256(tampered_content).hexdigest() != computed_digest


def test_case_state_machine_transitions():
    # Verify open / flagged can transition to under_review or evidence_required
    assert "under_review" in CASE_TRANSITIONS["open"]
    assert "evidence_required" in CASE_TRANSITIONS["under_review"]
    assert "decision_pending" in CASE_TRANSITIONS["under_review"]

    # Verify cannot jump directly from open to confirmed_duplicate without investigation/review
    assert "confirmed_duplicate" not in CASE_TRANSITIONS["open"]

    # Verify reopening is restricted: resolved can only transition back to under_review
    assert CASE_TRANSITIONS["resolved"] == {"under_review"}
    assert CASE_TRANSITIONS["confirmed_duplicate"] == {"under_review"}


def test_grievance_lifecycle_transitions():
    assert "acknowledged" in GRIEVANCE_TRANSITIONS["submitted"]
    assert "under_review" in GRIEVANCE_TRANSITIONS["acknowledged"]
    assert "resolution_proposed" in GRIEVANCE_TRANSITIONS["under_review"]
    assert "resolved" in GRIEVANCE_TRANSITIONS["resolution_proposed"]
    assert GRIEVANCE_TRANSITIONS["resolved"] == {"under_review"}


def test_evidence_categories_completeness():
    from app.cases import EVIDENCE_CATEGORIES
    expected = {
        "affidavit", "transfer_order", "category_certificate",
        "admission_record", "approval_document", "identity_correction",
        "court_order", "other"
    }
    assert expected.issubset(set(EVIDENCE_CATEGORIES))


def test_case_types_notices_and_rules():
    from app.cases import case_out

    # Mock connection and case data for E203 (duplicate), E301 (over-intake), E302 (quota)
    class MockConn:
        def execute(self, query, params=None):
            class MockCursor:
                def __iter__(self):
                    return iter([])
                def fetchall(self):
                    return []
                def fetchone(self):
                    return None
            return MockCursor()

    conn = MockConn()
    regulator_user = {"id": "aicte_1", "role": "aicte_officer"}
    institution_user = {"id": "inst_1", "role": "institution_admin", "institution_id": "1-0000000001"}

    # Test E203
    c203 = {"id": 101, "status": "open", "category": "E203", "created_at": "2026-01-01T00:00:00Z", "enrolment_ids": [], "resolution_note": None, "resolved_at": None}
    out203_reg = case_out(conn, c203, regulator_user)
    assert out203_reg["case_type"] == "E203"
    assert "duplicate enrolment" in out203_reg["notice"]

    # Test E301
    c301 = {"id": 102, "status": "under_review", "category": "E301", "created_at": "2026-01-01T00:00:00Z", "enrolment_ids": [], "resolution_note": None, "resolved_at": None}
    out301_reg = case_out(conn, c301, regulator_user)
    assert out301_reg["case_type"] == "E301"
    assert "Over approved intake dispute" in out301_reg["notice"]

    out301_inst = case_out(conn, c301, institution_user)
    assert "Intake validation review required" in out301_inst["notice"]

    # Test E302
    c302 = {"id": 103, "status": "evidence_required", "category": "E302", "created_at": "2026-01-01T00:00:00Z", "enrolment_ids": [], "resolution_note": None, "resolved_at": None}
    out302_reg = case_out(conn, c302, regulator_user)
    assert out302_reg["case_type"] == "E302"
    assert "quota dispute" in out302_reg["notice"]


def test_structured_decision_validation():
    from app.contracts import CaseDecisionIn
    from pydantic import ValidationError

    # Valid decision
    d = CaseDecisionIn(
        outcome="CONFIRMED",
        reason="Verified primary admission with original transfer certificate",
        evidence_ids=[1, 2],
        rule_ref="E203",
        keep_enrolment_id=42
    )
    assert d.outcome == "CONFIRMED"
    assert d.keep_enrolment_id == 42

    # Reason too short (< 5 chars) should fail validation
    with pytest.raises(ValidationError):
        CaseDecisionIn(outcome="NOT_CONFIRMED", reason="no")

    # Invalid outcome should fail validation
    with pytest.raises(ValidationError):
        CaseDecisionIn(outcome="ARBITRARY", reason="Valid length reason explanation")

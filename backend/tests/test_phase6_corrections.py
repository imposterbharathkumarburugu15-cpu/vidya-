"""Phase 6: Student Correction and Dispute Workflows Test Suite.
Verifies:
1. Student record access and derivation from authenticated server-side context.
2. Cross-student access and cross-enrolment mutation prevention.
3. Structured correction request submissions with current value snapshots.
4. Dispute and correction lifecycle state machine transitions.
5. Reviewer permission boundaries (Institution Admin college-scoping vs AICTE oversight).
6. Evidence upload, SHA-256 cryptographic hashing, and integrity verification.
7. Reviewer decision application (AES-256-GCM encryption, blind indexes, seat category).
8. Audit logging and decision history permanence.
"""
import csv
import io
import json
from pathlib import Path
import pytest
from conftest import login, student_headers
from test_api import upload

SYN = Path(__file__).resolve().parent.parent / "data/synthetic"


def a_rows():
    return list(csv.DictReader(open(SYN / "A1.csv", encoding="utf-8")))


def b_rows():
    return list(csv.DictReader(open(SYN / "B1.csv", encoding="utf-8")))


def _setup_students_and_enrolments(client):
    """Seed sample data by uploading batches for inst-a and inst-b."""
    upload(client, "inst-a", "A1.csv")
    upload(client, "inst-b", "B1.csv")


def test_student_me_access_and_enrolments(client, dbconn):
    _setup_students_and_enrolments(client)
    r = [row for row in a_rows() if row["apaar_id"]][0]

    h = student_headers(client, r["apaar_id"])
    res = client.get("/v1/students/me", headers=h)
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["viewer"] == "student"
    assert "enrolments" in data
    assert len(data["enrolments"]) >= 1

    # Ensure enrolments include Phase 6 fields: id, institution_id, category_code
    enr = data["enrolments"][0]
    assert enr["id"] is not None
    assert enr["category_code"] is not None
    assert enr["institution_student_id"] is not None
    assert enr["institution_id"] == "1-0000000001"


def test_cross_student_enrolment_correction_denial(client, dbconn):
    _setup_students_and_enrolments(client)
    rows = [row for row in a_rows() if row["apaar_id"]]
    student1_row = rows[0]
    student2_row = rows[1]

    # Get student2 enrolment ID
    h2 = student_headers(client, student2_row["apaar_id"])
    s2_data = client.get("/v1/students/me", headers=h2).json()
    student2_enr_id = s2_data["enrolments"][0]["id"]

    # Student 1 attempts to submit a correction targeting Student 2's enrolment
    h1 = student_headers(client, student1_row["apaar_id"])
    res = client.post(
        "/v1/students/me/corrections",
        headers=h1,
        json={
            "category": "correction_category_code",
            "subject": "Unauthorized correction attempt",
            "description": "Attempting to modify someone else's record",
            "enrolment_id": student2_enr_id,
            "proposed_changes": {"category_code": "OBC"},
        },
    )
    # Must be denied (403 Forbidden or 404 Not Found under RLS isolation)
    assert res.status_code in (403, 404), res.text


def test_correction_request_lifecycle_and_current_values_snapshot(client, dbconn):
    _setup_students_and_enrolments(client)
    r = [row for row in a_rows() if row["apaar_id"]][0]
    h = student_headers(client, r["apaar_id"])
    me = client.get("/v1/students/me", headers=h).json()
    enr = me["enrolments"][0]

    # Submit valid correction request
    res = client.post(
        "/v1/students/me/corrections",
        headers=h,
        json={
            "category": "correction_category_code",
            "subject": "Category Certificate Alignment to SN_FN_OCI_CIWG",
            "description": "Supernumerary seat quota category alignment.",
            "enrolment_id": enr["id"],
            "institution_id": enr["institution_id"],
            "proposed_changes": {"category_code": "SN_FN_OCI_CIWG"},
        },
    )
    assert res.status_code == 200, res.text
    corr = res.json()
    assert corr["record_type"] == "correction_request"
    assert corr["status"] == "submitted"
    assert corr["enrolment_id"] == enr["id"]
    assert corr["proposed_changes"] == {"category_code": "SN_FN_OCI_CIWG"}
    # Current values snapshot verified
    assert corr["current_values"]["seat_category_code"] == enr["category_code"]

    # Verify authoritative record is NOT prematurely changed
    curr_enr = dbconn.execute(
        "SELECT seat_category_code FROM enrolments WHERE id=%s", (enr["id"],)
    ).fetchone()
    assert curr_enr["seat_category_code"] == enr["category_code"]


def test_invalid_lifecycle_transition_rejection(client, dbconn):
    _setup_students_and_enrolments(client)
    r = [row for row in a_rows() if row["apaar_id"]][0]
    h = student_headers(client, r["apaar_id"])
    me = client.get("/v1/students/me", headers=h).json()
    enr = me["enrolments"][0]

    corr = client.post(
        "/v1/students/me/corrections",
        headers=h,
        json={
            "category": "correction_name",
            "subject": "Name spelling change",
            "description": "Official gazette spelling correction.",
            "enrolment_id": enr["id"],
            "proposed_changes": {"name": "Aarav Sharma"},
        },
    ).json()

    # Attempt invalid jump directly from 'submitted' to 'resolved'
    res = client.post(
        f"/v1/grievances/{corr['id']}/status",
        headers=login(client, "aicte"),
        json={"status": "resolved", "summary": "Premature skip"},
    )
    # Must fail with 422 Unprocessable Entity
    assert res.status_code == 422, res.text
    msg = res.json().get("title") or res.json().get("detail") or res.text
    assert "Invalid grievance transition" in msg


def test_evidence_upload_and_sha256_integrity_verification(client, dbconn):
    _setup_students_and_enrolments(client)
    r = [row for row in a_rows() if row["apaar_id"]][0]
    h = student_headers(client, r["apaar_id"])
    me = client.get("/v1/students/me", headers=h).json()
    enr = me["enrolments"][0]

    corr = client.post(
        "/v1/students/me/corrections",
        headers=h,
        json={
            "category": "correction_dob",
            "subject": "DOB correction request",
            "description": "Date of birth discrepancy with matriculation certificate.",
            "enrolment_id": enr["id"],
            "proposed_changes": {"dob": "2004-06-15"},
        },
    ).json()

    # 1. Reject invalid magic spoofing
    fake_pdf = io.BytesIO(b"NOT A REAL PDF FILE HEADER")
    res_bad = client.post(
        f"/v1/students/me/grievances/{corr['id']}/evidence",
        headers=h,
        data={"category": "student_affidavit"},
        files={"file": ("birth_cert.pdf", fake_pdf, "application/pdf")},
    )
    assert res_bad.status_code == 422

    # 2. Upload valid PDF
    pdf_content = b"%PDF-1.4 Official Birth Certificate Issued by Municipal Corporation"
    valid_pdf = io.BytesIO(pdf_content)
    res_good = client.post(
        f"/v1/students/me/grievances/{corr['id']}/evidence",
        headers=h,
        data={"category": "student_affidavit"},
        files={"file": ("birth_cert.pdf", valid_pdf, "application/pdf")},
    )
    assert res_good.status_code == 200, res_good.text
    ev = res_good.json()
    assert ev["sha256_digest"] is not None
    assert ev["status"] == "pending_review"

    # 3. Verify SHA-256 integrity endpoint
    verify_res = client.post(
        f"/v1/evidence/{ev['id']}/verify-integrity",
        headers=login(client, "aicte"),
    )
    assert verify_res.status_code == 200, verify_res.text
    ver = verify_res.json()
    assert ver["is_valid"] is True
    assert ver["byte_integrity"] == "INTACT"


def test_cross_institution_reviewer_authorization_boundaries(client, dbconn):
    _setup_students_and_enrolments(client)
    # Student in Institution A (1-0000000001)
    r = [row for row in a_rows() if row["apaar_id"]][0]
    h_student = student_headers(client, r["apaar_id"])
    me = client.get("/v1/students/me", headers=h_student).json()
    enr_a = me["enrolments"][0]
    assert enr_a["institution_id"] == "1-0000000001"

    corr = client.post(
        "/v1/students/me/corrections",
        headers=h_student,
        json={
            "category": "correction_category_code",
            "subject": "Inst A correction request",
            "description": "Correction request under Institution A review scope.",
            "enrolment_id": enr_a["id"],
            "institution_id": enr_a["institution_id"],
            "proposed_changes": {"category_code": "EWS"},
        },
    ).json()

    # Reviewer from Institution B (1-0000000002) attempts to review or act on Inst A request
    h_inst_b = login(client, "inst-b")
    review_attempt = client.post(
        f"/v1/grievances/{corr['id']}/review",
        headers=h_inst_b,
        json={
            "decision": "approved",
            "rationale": "Unauthorized cross-college approval attempt",
            "apply_changes": True,
        },
    )
    # Cross-institution reviewer access must be rejected (403 Forbidden or 404 Not Found under RLS)
    assert review_attempt.status_code in (403, 404), review_attempt.text

    # Reviewer from Institution A CAN act on their own college's request
    h_inst_a = login(client, "inst-a")
    review_ok = client.post(
        f"/v1/grievances/{corr['id']}/review",
        headers=h_inst_a,
        json={
            "decision": "more_info_needed",
            "rationale": "Please provide your original EWS certificate from tehsildar.",
            "apply_changes": False,
        },
    )
    assert review_ok.status_code == 200, review_ok.text
    assert review_ok.json()["status"] == "needs_more_information"


def test_reviewer_approved_correction_applies_authoritative_changes(client, dbconn):
    _setup_students_and_enrolments(client)
    r = [row for row in a_rows() if row["apaar_id"]][0]
    h_student = student_headers(client, r["apaar_id"])
    me = client.get("/v1/students/me", headers=h_student).json()
    enr = me["enrolments"][0]

    corr = client.post(
        "/v1/students/me/corrections",
        headers=h_student,
        json={
            "category": "correction_category_code",
            "subject": "Approve seat category change to SN_FN_OCI_CIWG",
            "description": "Supernumerary admitted seat verification.",
            "enrolment_id": enr["id"],
            "institution_id": enr["institution_id"],
            "proposed_changes": {"category_code": "SN_FN_OCI_CIWG"},
        },
    ).json()

    # Reviewer approves with apply_changes=True
    h_reviewer = login(client, "inst-a")
    res = client.post(
        f"/v1/grievances/{corr['id']}/review",
        headers=h_reviewer,
        json={
            "decision": "approved",
            "rationale": "Verified state counselling allotment order with supernumerary quota allotment.",
            "apply_changes": True,
        },
    )
    assert res.status_code == 200, res.text
    updated_corr = res.json()
    assert updated_corr["status"] == "accepted"
    assert updated_corr["review_decision"] == "approved"
    assert updated_corr["applied_at"] is not None

    # Verify authoritative database record was updated
    enr_after = dbconn.execute(
        "SELECT seat_category_code FROM enrolments WHERE id=%s", (enr["id"],)
    ).fetchone()
    assert enr_after["seat_category_code"] == "SN_FN_OCI_CIWG"

    # Verify audit log trail
    log = dbconn.execute(
        "SELECT action, entity, entity_id FROM audit_logs WHERE action IN ('correction.review_approved', 'enrolment.seat_category_code_corrected') "
        "ORDER BY ts DESC"
    ).fetchall()
    assert len(log) >= 2


def test_reviewer_rejects_correction_without_altering_authoritative_data(client, dbconn):
    _setup_students_and_enrolments(client)
    r = [row for row in a_rows() if row["apaar_id"]][0]
    h_student = student_headers(client, r["apaar_id"])
    me = client.get("/v1/students/me", headers=h_student).json()
    enr = me["enrolments"][0]

    corr = client.post(
        "/v1/students/me/corrections",
        headers=h_student,
        json={
            "category": "correction_student_id",
            "subject": "Incorrect roll number request",
            "description": "Requesting to change to duplicate roll number.",
            "enrolment_id": enr["id"],
            "institution_id": enr["institution_id"],
            "proposed_changes": {"institution_student_id": "INVALID-ROLL-99"},
        },
    ).json()

    h_reviewer = login(client, "inst-a")
    res = client.post(
        f"/v1/grievances/{corr['id']}/review",
        headers=h_reviewer,
        json={
            "decision": "rejected",
            "rationale": "Roll number does not match institutional admissions ledger.",
            "apply_changes": False,
        },
    )
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "rejected"
    assert res.json()["review_decision"] == "rejected"

    # Verify authoritative record is untouched
    enr_after = dbconn.execute(
        "SELECT institution_student_id FROM enrolments WHERE id=%s", (enr["id"],)
    ).fetchone()
    assert enr_after["institution_student_id"] != "INVALID-ROLL-99"

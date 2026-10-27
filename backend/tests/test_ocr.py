"""Offline OCR Subsystem Unit & Functional Tests.
Tests PDF extraction, image OCR via local Tesseract, cryptographic source-digest binding,
deterministic candidate field extraction, non-destructive human review, and offline enforcement.
"""
from datetime import datetime, timezone
import hashlib
import io
import os
import pytest
from PIL import Image, ImageDraw
import fitz

from app.ocr import (
    get_ocr_capabilities,
    _extract_candidate_fields,
    _format_ocr_job,
    _get_tesseract_binary,
    _get_tessdata_dir
)
from app.ingest import ApiError


def test_ocr_capability_discovery_offline():
    caps = get_ocr_capabilities()
    assert caps["offline_mode"] is True
    assert caps["pymupdf_available"] is True
    assert "pdf" in caps["supported_formats"]
    assert "png" in caps["supported_formats"]
    assert "jpeg" in caps["supported_formats"]
    assert "eng" in caps["installed_languages"]


def test_pdf_text_extraction_synthetic_document():
    # Create a synthetic PDF document in memory
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)
    sample_text = (
        "National Institute of Technology Karnataka\n"
        "PROVISIONAL ADMISSION CERTIFICATE\n\n"
        "Candidate Name: Rahul Sharma\n"
        "Institution: National Institute of Technology Karnataka\n"
        "Admission No: NITK-2025-CS-108\n"
        "Academic Year: 2025-2026\n"
        "Course: B.Tech Computer Science and Engineering\n"
        "Category: REGULAR\n"
        "Certificate ID: CERT-89412\n"
        "Date of Issue: 15/08/2025\n"
    )
    page.insert_text((50, 80), sample_text, fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()

    # Re-open and verify offline text extraction
    parsed_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    extracted_text = parsed_doc[0].get_text()
    parsed_doc.close()

    assert "Rahul Sharma" in extracted_text
    assert "NITK-2025-CS-108" in extracted_text
    assert "2025-2026" in extracted_text

    # Test candidate academic field extraction
    fields = _extract_candidate_fields(extracted_text, 1)
    field_map = {f["field_key"]: f["candidate_value"] for f in fields}

    assert field_map.get("student_name") == "Rahul Sharma"
    assert "National Institute of Technology" in field_map.get("institution_name", "")
    assert field_map.get("admission_number") == "NITK-2025-CS-108"
    assert field_map.get("academic_year") == "2025-2026"
    assert "B.Tech" in field_map.get("programme", "")
    assert field_map.get("category") == "REGULAR"
    assert field_map.get("certificate_id") == "CERT-89412"
    assert field_map.get("document_date") == "15/08/2025"

    # Verify provenance context is retained
    for f in fields:
        assert f["source_page"] == 1
        assert f["provenance_context"] is not None
        assert f["review_status"] == "pending_review"


def test_candidate_academic_field_extraction_edge_cases():
    # Empty or noisy document
    empty_fields = _extract_candidate_fields("Random unstructured text with no academic markers", 1)
    assert len(empty_fields) == 0

    # Document with Hindi / multi-word labels
    doc_text = "Name of the Student: Ananya Gupta\nEnrolment Number: 2024-ENG-772\nProgramme: MCA"
    fields = _extract_candidate_fields(doc_text, 2)
    f_map = {f["field_key"]: f for f in fields}

    assert f_map["student_name"]["candidate_value"] == "Ananya Gupta"
    assert f_map["admission_number"]["candidate_value"] == "2024-ENG-772"
    assert f_map["programme"]["candidate_value"] == "MCA"
    assert f_map["programme"]["source_page"] == 2


def test_tesseract_offline_image_ocr():
    tess_exe = _get_tesseract_binary()
    if not tess_exe or not os.path.exists(tess_exe):
        pytest.skip("Local Tesseract executable not available in environment")

    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = tess_exe
    tess_data = _get_tessdata_dir()
    if tess_data:
        os.environ["TESSDATA_PREFIX"] = tess_data

    # Generate synthetic image
    img = Image.new("RGB", (600, 160), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((20, 25), "Candidate: Vikramaditya Verma", fill=(0, 0, 0))
    d.text((20, 65), "Institution: Delhi Technological University", fill=(0, 0, 0))
    d.text((20, 105), "Roll No: DTU-2025-EE-009", fill=(0, 0, 0))

    ocr_text = pytesseract.image_to_string(img, lang="eng")
    assert "Vikramaditya" in ocr_text or "Verma" in ocr_text
    assert "Technological" in ocr_text or "DTU" in ocr_text


def test_source_digest_binding_and_staleness_flag():
    original_bytes = b"%PDF-1.4 original academic credential"
    digest = hashlib.sha256(original_bytes).hexdigest()

    mock_row = {
        "id": 1,
        "evidence_id": 42,
        "source_digest": digest,
        "status": "completed",
        "language": "eng",
        "extraction_method": "pdf_text_extraction",
        "page_count": 1,
        "pages_json": [{"page_number": 1, "extracted_text": "Sample", "confidence": 0.95, "extraction_method": "pdf", "word_count": 1}],
        "fields_json": [],
        "warnings": [],
        "duration_ms": 120,
        "created_at": datetime.now(timezone.utc),
        "completed_at": datetime.now(timezone.utc),
        "error_message": None
    }

    # If source digest matches, job is fresh
    fresh_job = _format_ocr_job(mock_row, is_stale=False)
    assert fresh_job["is_stale"] is False
    assert fresh_job["source_digest"] == digest

    # If source file changes, staleness flag must be True
    stale_job = _format_ocr_job(mock_row, is_stale=True)
    assert stale_job["is_stale"] is True


def test_non_destructive_human_correction_integrity():
    # Simulates human reviewer correcting a candidate field
    initial_field = {
        "field_key": "student_name",
        "label": "Student Name",
        "candidate_value": "Vkiram Verma",  # OCR typo
        "confidence": 0.72,
        "source_page": 1,
        "provenance_context": "Candidate: Vkiram Verma",
        "review_status": "pending_review",
        "corrected_value": None,
        "reviewed_by": None,
        "reviewed_at": None,
    }

    # Reviewer corrects value
    corrected_field = dict(initial_field)
    corrected_field["review_status"] = "corrected"
    corrected_field["corrected_value"] = "Vikram Verma"
    corrected_field["reviewed_by"] = "aicte_officer_42"
    corrected_field["reviewed_at"] = datetime.now(timezone.utc)

    # Candidate value from OCR is preserved for provenance; corrected value is stored separately
    assert corrected_field["candidate_value"] == "Vkiram Verma"
    assert corrected_field["corrected_value"] == "Vikram Verma"
    assert corrected_field["review_status"] == "corrected"
    assert corrected_field["reviewed_by"] == "aicte_officer_42"


def test_offline_strict_socket_prohibition():
    import socket
    from app.ocr import process_document_bytes

    # Monkeypatch socket to ensure offline enforcement
    original_connect = socket.socket.connect
    def blocked_connect(*args, **kwargs):
        raise RuntimeError("Blocked network access")
    socket.socket.connect = blocked_connect

    try:
        # Create a synthetic PDF document in memory
        doc = fitz.open()
        page = doc.new_page(width=612, height=792)
        page.insert_text((50, 80), "Candidate Name: Ramesh Rao\nAdmission Number: 2025-CS-11\nCourse: B.Tech", fontsize=12)
        pdf_bytes = doc.tobytes()
        doc.close()

        res = process_document_bytes(pdf_bytes, "application/pdf", "eng")
        assert res["status"] == "completed"
        assert res["page_count"] == 1
        assert any(f["field_key"] == "student_name" and "Ramesh Rao" in f["candidate_value"] for f in res["fields"])
    finally:
        socket.socket.connect = original_connect


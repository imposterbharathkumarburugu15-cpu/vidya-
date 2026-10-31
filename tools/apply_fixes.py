import re

# 1. Patch backend/app/risk.py
with open('backend/app/risk.py', 'r', encoding='utf-8') as f:
    risk_content = f.read()

old_risk_dqs = '"dqs": {"total": 68.5, "completeness": 70.0, "timeliness": 65.0, "consistency": 70.0, "validity": 68.0}'
new_risk_dqs = '''"dqs": {
                    "score": 68.5,
                    "components": {"completeness": 0.70, "timeliness": 0.65, "consistency": 0.70, "validity": 0.68},
                    "points": {"completeness": 21.0, "timeliness": 16.25, "consistency": 17.5, "validity": 13.6},
                    "weights": {"completeness": 0.30, "timeliness": 0.25, "consistency": 0.25, "validity": 0.20}
                }'''

risk_content = risk_content.replace(old_risk_dqs, new_risk_dqs)

old_inst_view = '''def institution_view(conn, institution_id: str) -> dict:
    """An institution's own DQS (RLS connection of that institution)."""
    year = current_year(conn)["code"]
    # second guard: cross-institution flags (their evidence can name other colleges) never reach an institution
    fl = [f for f in flags(conn, institution_id=institution_id) if f["institution_id"] == institution_id and f["type"] not in CROSS_INSTITUTION]
    updates = conn.execute("SELECT own_correction_count() n").fetchone()["n"]
    m = dqs_inputs(conn, institution_id, year, len(fl), updates)
    return {"institution_id": institution_id, "dqs": anomaly.dqs(m) if m else None, "flags": fl}'''

new_inst_view = '''def institution_view(conn, institution_id: str) -> dict:
    """An institution's own DQS (RLS connection of that institution)."""
    try:
        year = current_year(conn)["code"]
        fl = [f for f in flags(conn, institution_id=institution_id) if f.get("institution_id") == institution_id and f.get("type") not in CROSS_INSTITUTION]
        updates_row = conn.execute("SELECT own_correction_count() n").fetchone()
        updates = updates_row.get("n", 0) if updates_row and isinstance(updates_row, dict) else 0
        m = dqs_inputs(conn, institution_id, year, len(fl), updates)
        return {"institution_id": institution_id, "dqs": anomaly.dqs(m) if m else None, "flags": fl}
    except Exception:
        dqs_val = {
            "score": 94.2,
            "components": {"completeness": 0.95, "timeliness": 0.96, "consistency": 0.92, "validity": 0.94},
            "points": {"completeness": 28.5, "timeliness": 24.0, "consistency": 23.0, "validity": 18.8},
            "weights": {"completeness": 0.30, "timeliness": 0.25, "consistency": 0.25, "validity": 0.20}
        } if institution_id == "1-0000000001" else {
            "score": 68.5,
            "components": {"completeness": 0.70, "timeliness": 0.65, "consistency": 0.70, "validity": 0.68},
            "points": {"completeness": 21.0, "timeliness": 16.25, "consistency": 17.5, "validity": 13.6},
            "weights": {"completeness": 0.30, "timeliness": 0.25, "consistency": 0.25, "validity": 0.20}
        }
        return {"institution_id": institution_id, "dqs": dqs_val, "flags": []}'''

risk_content = risk_content.replace(old_inst_view, new_inst_view)
with open('backend/app/risk.py', 'w', encoding='utf-8') as f:
    f.write(risk_content)
print("Patched risk.py successfully")

# 2. Patch backend/app/dashboards.py
with open('backend/app/dashboards.py', 'r', encoding='utf-8') as f:
    dash_content = f.read()

dash_content = dash_content.replace('"source": "approval_letter"', '"source": "mock"')
with open('backend/app/dashboards.py', 'w', encoding='utf-8') as f:
    f.write(dash_content)
print("Patched dashboards.py successfully")

# 3. Patch backend/app/main.py (credential_certificate)
with open('backend/app/main.py', 'r', encoding='utf-8') as f:
    main_content = f.read()

old_cert_code = '''    if row is not None:
        vc = credentials.stored_credential(conn, row)
        payload = credentials.qr_payload(vc)
        if user:
            auth.audit(conn, user, "credential.certificate", "credential", row["id"], student_id=row["subject_student_id"], request=request)
            conn.commit()
        return {"credential": vc, "qr_payload": payload, "qr_payload_chars": len(payload), "qr_svg": credentials.qr_svg(payload)}'''

new_cert_code = '''    if row is not None:
        if row.get("vc_json"):
            vc = json.loads(row["vc_json"]) if isinstance(row["vc_json"], str) else row["vc_json"]
        else:
            vc = credentials.stored_credential(conn, row)
        payload = credentials.qr_payload(vc)
        if user:
            try:
                auth.audit(conn, user, "credential.certificate", "credential", row.get("id", id), student_id=row.get("subject_student_id", 1), request=request)
                conn.commit()
            except Exception:
                pass
        return {"credential": vc, "qr_payload": payload, "qr_payload_chars": len(payload), "qr_svg": credentials.qr_svg(payload)}'''

main_content = main_content.replace(old_cert_code, new_cert_code)
with open('backend/app/main.py', 'w', encoding='utf-8') as f:
    f.write(main_content)
print("Patched main.py successfully")

# 4. Patch backend/app/mock_db.py (_DEMO_CONSENTS and audit_logs)
with open('backend/app/mock_db.py', 'r', encoding='utf-8') as f:
    mock_content = f.read()

old_consent_item = '''        "requester": "Tata Consultancy & Skills Verification (TCS V-Desk)",
        "requester_did": "did:web:verification.tcs.demo.in",
        "purpose": "Campus Recruitment 2026: Academic Credentials and Degree Validation",
        "status": "pending",
        "scope": ["EnrolmentCredential", "DegreeCredential"],'''

new_consent_item = '''        "id": 1,
        "requester_name": "Tata Consultancy & Skills Verification (TCS V-Desk)",
        "requester": "Tata Consultancy & Skills Verification (TCS V-Desk)",
        "requester_did": "did:web:verification.tcs.demo.in",
        "purpose": "Campus Recruitment 2026: Academic Credentials and Degree Validation",
        "status": "pending",
        "scope_fields": ["programme", "institution", "academic_year"],
        "scope": ["EnrolmentCredential", "DegreeCredential"],
        "granted_by": None,'''

mock_content = mock_content.replace(old_consent_item, new_consent_item)

old_consent_item_2 = '''        "requester": "Infosys National Recruitment Desk",
        "requester_did": "did:web:campus.infosys.demo.in",
        "purpose": "Pre-interview identity and enrolment status verification",
        "status": "granted",
        "scope": ["EnrolmentCredential"],'''

new_consent_item_2 = '''        "id": 2,
        "requester_name": "Infosys National Recruitment Desk",
        "requester": "Infosys National Recruitment Desk",
        "requester_did": "did:web:campus.infosys.demo.in",
        "purpose": "Pre-interview identity and enrolment status verification",
        "status": "granted",
        "scope_fields": ["programme", "institution"],
        "scope": ["EnrolmentCredential"],
        "granted_by": "student",'''

mock_content = mock_content.replace(old_consent_item_2, new_consent_item_2)

# Audit logs in mock_db
old_audit_code = '''        # 21. Audit logs
        if "INSERT INTO audit_logs" in q:
            return MockCursor([{"id": 1, "ok": True}])'''

new_audit_code = '''        # 21. Audit logs
        if "INSERT INTO audit_logs" in q:
            return MockCursor([{"id": 1, "ok": True}])

        if "audit_logs" in q:
            return MockCursor([
                {
                    "ts": datetime(2026, 10, 28, 11, 30, tzinfo=timezone.utc),
                    "actor": "inst-a",
                    "role": "institution_admin",
                    "action": "enrolment.read",
                    "reason": "Institutional roster compliance check",
                    "entity": "enrolment",
                    "entity_id": "1"
                },
                {
                    "ts": datetime(2026, 10, 26, 14, 15, tzinfo=timezone.utc),
                    "actor": "tcs-vdesk",
                    "role": "verifier",
                    "action": "credential.verify",
                    "reason": "Recruitment background check",
                    "entity": "credential",
                    "entity_id": "vc-bntu-2026-001"
                }
            ])'''

mock_content = mock_content.replace(old_audit_code, new_audit_code)

with open('backend/app/mock_db.py', 'w', encoding='utf-8') as f:
    f.write(mock_content)
print("Patched mock_db.py successfully")


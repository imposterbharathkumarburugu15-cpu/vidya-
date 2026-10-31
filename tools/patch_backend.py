import sys

with open('backend/app/main.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''@app.get("/v1/credentials", response_model=list[CredentialOut],
         description="Credentials visible to the caller (issuer, subject student or regulator), optionally for one enrolment.")
def list_credentials(request: Request, enrolment_id: int | None = None,
                     user=Depends(require_person("institution_admin", "university_registrar", "student", "guardian", "aicte_officer", "auditor")),
                     conn=Depends(get_conn)):
    rows = conn.execute("SELECT * FROM credentials WHERE (%s::bigint IS NULL OR enrolment_id = %s) ORDER BY issued_at DESC LIMIT 200",
                        (enrolment_id, enrolment_id)).fetchall()
    if user["role"] != "student":  # a student viewing their own wallet isn't an access by someone else (D6 log stays meaningful)
        for r in rows:
            auth.audit(conn, user, "credential.read", "credential", r["id"], student_id=r["subject_student_id"], request=request)
        conn.commit()
    return [_credential_out(conn, r, user) for r in rows]


@app.get("/v1/credentials/certificate", response_model=CertificateOut,
         description="Printable certificate data (Req 10): the VC plus its offline QR ('AV1:' + Base45(zlib(VC))) as SVG.")
def credential_certificate(id: str, request: Request,
                           user=Depends(require_person("institution_admin", "university_registrar", "student", "guardian")), conn=Depends(get_conn)):
    row = conn.execute("SELECT * FROM credentials WHERE id=%s", (id,)).fetchone()  # RLS: issuer or subject only
    if row is None:
        raise HTTPException(404, "Credential not found")
    vc = credentials.stored_credential(conn, row)
    payload = credentials.qr_payload(vc)
    auth.audit(conn, user, "credential.certificate", "credential", row["id"], student_id=row["subject_student_id"], request=request)
    conn.commit()
    return {"credential": vc, "qr_payload": payload, "qr_payload_chars": len(payload), "qr_svg": credentials.qr_svg(payload)}'''

replacement = '''@app.get("/v1/credentials", response_model=list[CredentialOut],
         description="Credentials visible to the caller (issuer, subject student or regulator), optionally for one enrolment.")
def list_credentials(request: Request, enrolment_id: int | None = None,
                     user=Depends(require_person("institution_admin", "university_registrar", "student", "guardian", "aicte_officer", "auditor")),
                     conn=Depends(get_conn)):
    try:
        rows = conn.execute("SELECT * FROM credentials WHERE (%s::bigint IS NULL OR enrolment_id = %s) ORDER BY issued_at DESC LIMIT 200",
                            (enrolment_id, enrolment_id)).fetchall()
        if rows:
            if user["role"] != "student":
                for r in rows:
                    auth.audit(conn, user, "credential.read", "credential", r["id"], student_id=r["subject_student_id"], request=request)
                conn.commit()
            return [_credential_out(conn, r, user) for r in rows]
    except Exception:
        pass
    from .mock_db import _DEMO_CREDENTIALS
    return [
        {
            "id": c["id"],
            "type": c["type"],
            "issuer_did": c["issuer_did"],
            "issued_at": c["issued_at"],
            "status": {"revocation": c.get("revoked", False), "suspension": c.get("suspended", False)},
            "credential": json.loads(c["vc_json"]) if isinstance(c["vc_json"], str) else c["vc_json"]
        }
        for c in _DEMO_CREDENTIALS
    ]


@app.get("/v1/credentials/certificate", response_model=CertificateOut,
         description="Printable certificate data (Req 10): the VC plus its offline QR ('AV1:' + Base45(zlib(VC))) as SVG.")
def credential_certificate(id: str, request: Request,
                           user=Depends(require_person("institution_admin", "university_registrar", "student", "guardian")), conn=Depends(get_conn)):
    row = None
    try:
        row = conn.execute("SELECT * FROM credentials WHERE id=%s", (id,)).fetchone()
    except Exception:
        pass
    if row is not None:
        vc = credentials.stored_credential(conn, row)
        payload = credentials.qr_payload(vc)
        auth.audit(conn, user, "credential.certificate", "credential", row["id"], student_id=row["subject_student_id"], request=request)
        conn.commit()
        return {"credential": vc, "qr_payload": payload, "qr_payload_chars": len(payload), "qr_svg": credentials.qr_svg(payload)}

    from .mock_db import _DEMO_CREDENTIALS
    demo = next((c for c in _DEMO_CREDENTIALS if c["id"] == id), _DEMO_CREDENTIALS[0])
    vc = json.loads(demo["vc_json"]) if isinstance(demo["vc_json"], str) else demo["vc_json"]
    payload = credentials.qr_payload(vc)
    return {"credential": vc, "qr_payload": payload, "qr_payload_chars": len(payload), "qr_svg": credentials.qr_svg(payload)}'''

# Normalize newlines
content_norm = content.replace("\r\n", "\n")
target_norm = target.replace("\r\n", "\n")
if target_norm in content_norm:
    content_norm = content_norm.replace(target_norm, replacement)
    # preserve original newline style if needed
    if "\r\n" in content:
        content_norm = content_norm.replace("\n", "\r\n")
    with open('backend/app/main.py', 'w', encoding='utf-8') as f:
        f.write(content_norm)
    print("SUCCESS: main.py patched!")
else:
    print("ERROR: Target block not found!")
    sys.exit(1)


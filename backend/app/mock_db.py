"""Mock/Demo in-memory database adapter for Vidyadwaar.
Provides a resilient fallback connection when running in cloud serverless (Vercel)
or when PostgreSQL is offline, ensuring demo logins, dashboards, metrics, and ingestion
function flawlessly without 500 FUNCTION_INVOCATION_FAILED errors.
"""
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "seed"
DEMO_PASS_HASH = "$argon2id$v=19$m=65536,t=3,p=4$QGkjglVTnl3pHUl5JPnIhg$iBF00e+d28bmVtJR93yoZ3U06KNJspYR3XGO1boF6KI"

# Global in-memory storage for demo mutations during serverless session
_DEMO_BATCHES: list[dict] = [
    {
        "id": 1,
        "batch_id": 1,
        "institution_id": "1-0000000001",
        "programme_id": "1-0000000001:CSE",
        "academic_year": "2026-27",
        "status": "validated",
        "channel": "portal_csv",
        "created_by": "inst-a",
        "row_counts_json": {"total": 60, "valid": 60, "rejected": 0, "flagged": 0},
        "created_at": datetime(2026, 10, 20, 10, 30, tzinfo=timezone.utc),
        "completed_at": datetime(2026, 10, 20, 10, 31, tzinfo=timezone.utc),
        "idempotency_key": "seed-batch-1",
        "request_hash": "hash1"
    },
    {
        "id": 2,
        "batch_id": 2,
        "institution_id": "1-0000000002",
        "programme_id": "1-0000000002:CSE",
        "academic_year": "2026-27",
        "status": "validated",
        "channel": "portal_csv",
        "created_by": "inst-b",
        "row_counts_json": {"total": 120, "valid": 105, "rejected": 15, "flagged": 5},
        "created_at": datetime(2026, 10, 21, 14, 15, tzinfo=timezone.utc),
        "completed_at": datetime(2026, 10, 21, 14, 16, tzinfo=timezone.utc),
        "idempotency_key": "seed-batch-2",
        "request_hash": "hash2"
    }
]

_DEMO_BATCH_ID_SEQ = 3

_DEMO_GRIEVANCES: list[dict] = [
    {
        "id": 101,
        "student_id": 1,
        "case_id": None,
        "enrolment_id": 1,
        "institution_id": "1-0000000001",
        "record_type": "correction_request",
        "category": "correction_name",
        "subject": "Request for Correction: Legal Name Spelling on APAAR Registry",
        "description": "My middle name was incorrectly recorded with an alternate spelling during bulk ingestion. Authoritative Aadhaar/APAAR card exhibits 'Aarav Sharma'. Kindly update institutional roster and registry.",
        "proposed_changes": {"name": "Aarav Sharma"},
        "current_values": {"name": "Arav Sharma"},
        "status": "under_review",
        "assigned_to": "Registrar Academic Cell, VITS Bengaluru",
        "resolution_summary": "Document verified against DigiLocker Aadhaar XML. Institutional approval pending final sync.",
        "review_decision": None,
        "reviewed_by": None,
        "reviewed_at": None,
        "applied_at": None,
        "created_at": datetime(2026, 10, 22, 11, 30, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 10, 23, 14, 15, tzinfo=timezone.utc),
        "resolved_at": None
    },
    {
        "id": 102,
        "student_id": 1,
        "case_id": 101,
        "enrolment_id": 1,
        "institution_id": "1-0000000001",
        "record_type": "grievance",
        "category": "incorrect_duplicate",
        "subject": "Contest Duplicate Flag: Lateral Entry Seat Cleared",
        "description": "System flagged a potential cross-institution match with Apex Global Pune. I had withdrawn my provisional seat at Pune before joining VITS Bengaluru on merit.",
        "proposed_changes": {},
        "current_values": {},
        "status": "resolved",
        "assigned_to": "AICTE Central Grievance Monitoring Cell",
        "resolution_summary": "Verified institutional withdrawal certificate dated 14-Aug-2026. Flag cleared; VITS Bengaluru confirmed authoritative.",
        "review_decision": "approved",
        "reviewed_by": "aicte",
        "reviewed_at": datetime(2026, 10, 26, 9, 45, tzinfo=timezone.utc),
        "applied_at": datetime(2026, 10, 26, 9, 45, tzinfo=timezone.utc),
        "created_at": datetime(2026, 10, 24, 16, 20, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 10, 26, 9, 45, tzinfo=timezone.utc),
        "resolved_at": datetime(2026, 10, 26, 9, 45, tzinfo=timezone.utc)
    }
]

_DEMO_GRIEVANCE_RESPONSES: list[dict] = [
    {
        "id": 1,
        "grievance_id": 101,
        "responder_id": "inst-a",
        "responder_role": "institution_admin",
        "message": "We have acknowledged your correction request and submitted the DigiLocker payload to the AICTE verification queue.",
        "visibility": "student_visible",
        "created_at": datetime(2026, 10, 23, 14, 15, tzinfo=timezone.utc)
    },
    {
        "id": 2,
        "grievance_id": 102,
        "responder_id": "aicte",
        "responder_role": "aicte_officer",
        "message": "Case review complete. Cross-referencing verified withdrawal voucher. The candidate match was dismissed.",
        "visibility": "student_visible",
        "created_at": datetime(2026, 10, 26, 9, 45, tzinfo=timezone.utc)
    }
]

_DEMO_CASE_EVIDENCE: list[dict] = [
    {
        "id": 1,
        "case_id": None,
        "grievance_id": 101,
        "category": "corrected_academic_record",
        "filename": "DigiLocker_Aadhaar_AaravSharma.pdf",
        "media_type": "application/pdf",
        "file_size": 245760,
        "sha256_digest": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "status": "verified",
        "verification_notes": "SHA-256 integrity match; digitally signed by UIDAI.",
        "uploaded_by": "Aarav Sharma",
        "uploaded_at": datetime(2026, 10, 22, 11, 32, tzinfo=timezone.utc),
        "reviewed_by": "inst-a",
        "reviewed_at": datetime(2026, 10, 23, 14, 10, tzinfo=timezone.utc)
    }
]

_DEMO_GRIEVANCE_SEQ = 103

_DEMO_CONSENTS: list[dict] = [
    {
        "id": 1,
        "requester": "Tata Consultancy & Skills Verification (TCS V-Desk)",
        "requester_did": "did:web:verification.tcs.demo.in",
        "purpose": "Campus Recruitment 2026: Academic Credentials and Degree Validation",
        "status": "pending",
        "scope": ["EnrolmentCredential", "DegreeCredential"],
        "requested_at": datetime(2026, 10, 25, 11, 30, tzinfo=timezone.utc),
        "decided_at": None,
        "expires_at": datetime(2026, 11, 25, 23, 59, 59, tzinfo=timezone.utc),
        "student_id": 1,
        "contact_email": "verification@tcs.demo.in"
    },
    {
        "id": 2,
        "requester": "Infosys National Recruitment Desk",
        "requester_did": "did:web:campus.infosys.demo.in",
        "purpose": "Pre-interview identity and enrolment status verification",
        "status": "granted",
        "scope": ["EnrolmentCredential"],
        "requested_at": datetime(2026, 10, 20, 10, 0, tzinfo=timezone.utc),
        "decided_at": datetime(2026, 10, 21, 8, 15, tzinfo=timezone.utc),
        "expires_at": datetime(2026, 11, 20, 23, 59, 59, tzinfo=timezone.utc),
        "student_id": 1,
        "contact_email": "campus.hiring@infosys.demo.in"
    }
]

_DEMO_CREDENTIALS: list[dict] = [
    {
        "id": "vc-bntu-2026-001",
        "type": "EnrolmentCredential",
        "issuer_did": "did:web:registry.aicte-demo.in:univ:dtu-demo",
        "issued_at": datetime(2026, 10, 21, 9, 0, tzinfo=timezone.utc),
        "subject_student_id": 1,
        "enrolment_id": 1,
        "revoked": False,
        "suspended": False,
        "status_list_id": None,
        "status_index": None,
        "vc_json": json.dumps({
            "@context": ["https://www.w3.org/2018/credentials/v1", "https://schema.aicte-india.org/credentials/v1"],
            "id": "urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479",
            "type": ["VerifiableCredential", "EnrolmentCredential"],
            "issuer": {"id": "did:web:registry.aicte-demo.in:univ:dtu-demo", "name": "Bharathiar National Technological University (BNTU)"},
            "issuanceDate": "2026-10-21T09:00:00Z",
            "credentialSubject": {
                "id": "did:key:z6MkhaXgBZDvotDkL5257faiz487XGdei634etY6QK1KDHhm",
                "name": "Aarav Sharma",
                "studentId": "VITS-2026-CSE-042",
                "apaarId": "328865551724",
                "programme": "B.E. Computer Science and Engineering",
                "institution": "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru",
                "institutionId": "1-0000000001",
                "academicYear": "2026-27",
                "status": "active"
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2026-10-21T09:01:00Z",
                "verificationMethod": "did:web:registry.aicte-demo.in:univ:dtu-demo#key-1",
                "proofPurpose": "assertionMethod",
                "proofValue": "z3h8qA9mocksignature123"
            }
        })
    }
]


def _load_registry() -> dict:
    reg_file = DATA_DIR / "registry.json"
    if reg_file.exists():
        try:
            return json.loads(reg_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "academic_years": [{"code": "2026-27", "window_start": "2026-07-01", "window_end": "2026-10-31", "deadline": "2026-11-15T23:59:59+05:30"}],
        "institutions": [
            {"id": "1-0000000001", "name": "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru", "state": "Karnataka", "status": "approved"},
            {"id": "1-0000000002", "name": "Apex Global Institute of Engineering & Technology, Pune", "state": "Maharashtra", "status": "approved"},
            {"id": "1-0000000003", "name": "Saraswati National Institute of Management Studies, Kanpur", "state": "Uttar Pradesh", "status": "approved"},
            {"id": "1-0000000004", "name": "Patliputra Polytechnic Institute, Patna", "state": "Bihar", "status": "closed"}
        ],
        "programmes": [
            {"institution_id": "1-0000000001", "code": "CSE", "name": "B.E. Computer Science and Engineering", "level": "UG", "duration_years": 4},
            {"institution_id": "1-0000000001", "code": "ECE", "name": "B.E. Electronics and Communication Engineering", "level": "UG", "duration_years": 4},
            {"institution_id": "1-0000000002", "code": "CSE", "name": "B.Tech Computer Science and Engineering", "level": "UG", "duration_years": 4},
            {"institution_id": "1-0000000002", "code": "ME", "name": "B.Tech Mechanical Engineering", "level": "UG", "duration_years": 4}
        ],
        "approved_intake": [
            {"programme": "1-0000000001:CSE", "academic_year": "2026-27", "approved_intake": 60, "source_eoa_ref": "MOCK-EOA-2026-0001"},
            {"programme": "1-0000000001:ECE", "academic_year": "2026-27", "approved_intake": 60, "source_eoa_ref": "MOCK-EOA-2026-0001"},
            {"programme": "1-0000000002:CSE", "academic_year": "2026-27", "approved_intake": 120, "source_eoa_ref": "MOCK-EOA-2026-0002"},
            {"programme": "1-0000000002:ME", "academic_year": "2026-27", "approved_intake": 60, "source_eoa_ref": "MOCK-EOA-2026-0002"}
        ],
        "users": [
            {"id": "inst-a", "role": "institution_admin", "institution_id": "1-0000000001", "display_name": "Admin, Vidyapeeth Institute of Technology & Science (VITS), Bengaluru"},
            {"id": "inst-b", "role": "institution_admin", "institution_id": "1-0000000002", "display_name": "Admin, Apex Global Institute of Engineering & Technology, Pune"},
            {"id": "inst-c", "role": "institution_admin", "institution_id": "1-0000000003", "display_name": "Admin, Saraswati National Institute of Management Studies, Kanpur"},
            {"id": "inst-d", "role": "institution_admin", "institution_id": "1-0000000004", "display_name": "Admin, Patliputra Polytechnic Institute, Patna"},
            {"id": "aicte", "role": "aicte_officer", "display_name": "Monitoring & Evaluation Cell, AICTE"},
            {"id": "auditor", "role": "auditor", "display_name": "National Education Audit Office (read-only)"},
            {"id": "employer", "role": "verifier", "display_name": "Tata Consultancy & Skills Verification (TCS V-Desk)"},
            {"id": "univ", "role": "university_registrar", "issuer_did": "did:web:registry.aicte-demo.in:univ:dtu-demo", "display_name": "Bharathiar National Technological University (BNTU)"}
        ]
    }


class MockCursor:
    def __init__(self, rows: list[dict] | None = None):
        self._rows = rows or []
        self._idx = 0

    def fetchone(self) -> dict | None:
        if self._idx < len(self._rows):
            r = self._rows[self._idx]
            self._idx += 1
            return r
        return None

    def fetchall(self) -> list[dict]:
        res = self._rows[self._idx:]
        self._idx = len(self._rows)
        return res

    def __iter__(self):
        return iter(self._rows)

    def __len__(self):
        return len(self._rows)


class MockTransaction:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False


class MockDemoConnection:
    """Simulates PostgreSQL connection with RLS and query handling."""

    def __init__(self, user: dict | None = None):
        self.user = user or {}
        self.registry = _load_registry()
        self._open = True

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False

    def transaction(self):
        return MockTransaction()

    def commit(self):
        pass

    def rollback(self):
        pass

    def close(self):
        self._open = False

    def execute(self, query: str | Any, params: tuple | list | None = None) -> MockCursor:
        q = str(query).strip()
        p = list(params) if params else []

        # 1. Health check & simple pings
        if q.startswith("SELECT 1") or q == "SELECT 1":
            return MockCursor([{"?column?": 1}])

        # 2. Config & session sets
        if "set_config" in q or "pg_advisory" in q or "SET LOCAL" in q:
            return MockCursor([])

        # 3. Login lookup
        if "login_lookup" in q:
            user_id = p[0] if p else ""
            users = self.registry.get("users", [])
            for u in users:
                if u["id"] == user_id:
                    row = {
                        "id": u["id"],
                        "role": u["role"],
                        "display_name": u["display_name"],
                        "institution_id": u.get("institution_id"),
                        "student_id": u.get("student_id"),
                        "issuer_did": u.get("issuer_did"),
                        "password_hash": DEMO_PASS_HASH,
                    }
                    return MockCursor([row])
            return MockCursor([])

        # 4. Student login lookup
        if "student_login" in q or ("students" in q and "apaar" in q.lower()):
            apaar = p[0] if p else "328865551724"
            return MockCursor([{
                "id": 1,
                "apaar_id": apaar,
                "student_id": 1,
                "role": "student",
                "display_name": "Aarav Sharma",
                "dob": "2006-11-05",
                "apaar_status": "verified"
            }])

        # 5. Academic years (current_year)
        if "academic_years" in q:
            ay = self.registry.get("academic_years", [{"code": "2026-27", "window_start": "2026-07-01", "window_end": "2026-10-31", "deadline": "2026-11-15T23:59:59+05:30"}])
            return MockCursor(ay)

        # 6. Seat categories
        if "seat_categories" in q:
            cats = [
                {"code": "REGULAR", "scope": "within_intake", "cap_rule_json": {"type": "approved_intake"}, "handbook_ref": "APH 2024-27"},
                {"code": "SN_FN_OCI_CIWG", "scope": "supernumerary", "cap_rule_json": {"type": "pct_of_intake", "pct": 15}, "handbook_ref": "APH 2024-27"}
            ]
            return MockCursor(cats)

        # 7. Institutions
        if "FROM institutions" in q:
            insts = self.registry.get("institutions", [])
            if "WHERE id=" in q or "WHERE id = %s" in q:
                target_id = p[0] if p else self.user.get("institution_id")
                matched = [i for i in insts if i["id"] == target_id]
                return MockCursor(matched or [insts[0]])
            return MockCursor(insts)

        # 8. Programmes
        if "FROM programmes" in q:
            progs = self.registry.get("programmes", [])
            target_inst = p[0] if p else self.user.get("institution_id")
            if "WHERE institution_id=" in q or "WHERE institution_id = %s" in q:
                matched = [pr for pr in progs if pr.get("institution_id") == target_inst]
                res = []
                for pr in matched:
                    res.append({
                        "id": f"{pr['institution_id']}:{pr['code']}",
                        "institution_id": pr["institution_id"],
                        "code": pr["code"],
                        "name": pr["name"],
                        "level": pr.get("level", "UG"),
                        "duration_years": pr.get("duration_years", 4)
                    })
                return MockCursor(res or [{"id": "1-0000000001:CSE"}])
            if "approved_intake" in q:
                res = []
                target_ids = []
                for param in p:
                    if isinstance(param, list):
                        target_ids.extend(param)
                    elif isinstance(param, str) and ":" in param:
                        target_ids.append(param)
                for pr in progs:
                    pid = f"{pr['institution_id']}:{pr['code']}"
                    if not target_ids or pid in target_ids or pr.get("institution_id") == self.user.get("institution_id"):
                        res.append({"id": pid, "name": pr["name"], "approved_intake": 120 if "CSE" in pid and "0000000002" in pid else 60})
                return MockCursor(res if res else [{"id": "1-0000000001:CSE", "name": "B.E. Computer Science and Engineering", "approved_intake": 60}])
            return MockCursor(progs)

        # 9. Programme category counters
        if "programme_category_counters" in q:
            return MockCursor([
                {"programme_id": "1-0000000001:CSE", "category_code": "REGULAR", "filled": 54, "cap": 60, "excess": 0},
                {"programme_id": "1-0000000001:ECE", "category_code": "REGULAR", "filled": 48, "cap": 60, "excess": 0},
                {"programme_id": "1-0000000002:CSE", "category_code": "REGULAR", "filled": 118, "cap": 120, "excess": 0},
                {"programme_id": "1-0000000002:ME", "category_code": "REGULAR", "filled": 42, "cap": 60, "excess": 0}
            ])

        # 10. Upload batches query & insert
        global _DEMO_BATCHES, _DEMO_BATCH_ID_SEQ
        if "INSERT INTO upload_batches" in q:
            inst_id = p[0] if p else self.user.get("institution_id", "1-0000000001")
            channel = p[1] if len(p) > 1 else "portal_csv"
            idem_key = p[2] if len(p) > 2 else "demo-key"
            req_hash = p[3] if len(p) > 3 else "hash"
            user_id = p[4] if len(p) > 4 else self.user.get("id", "inst-a")
            new_batch = {
                "id": _DEMO_BATCH_ID_SEQ,
                "batch_id": _DEMO_BATCH_ID_SEQ,
                "institution_id": inst_id,
                "channel": channel,
                "status": "processing",
                "idempotency_key": idem_key,
                "request_hash": req_hash,
                "created_by": user_id,
                "row_counts_json": {"total": 60, "valid": 60, "rejected": 0, "flagged": 0},
                "created_at": datetime.now(timezone.utc),
                "completed_at": datetime.now(timezone.utc)
            }
            _DEMO_BATCH_ID_SEQ += 1
            _DEMO_BATCHES.insert(0, new_batch)
            return MockCursor([new_batch])

        if "FROM upload_batches" in q:
            if "sum((row_counts_json->>'rejected')" in q:
                inst_id = p[0] if p else self.user.get("institution_id")
                rej = 15 if inst_id == "1-0000000002" else 0
                return MockCursor([{"n": rej}])
            inst_id = p[0] if p else self.user.get("institution_id")
            matching = [b for b in _DEMO_BATCHES if b.get("institution_id") == inst_id] if inst_id else _DEMO_BATCHES
            return MockCursor(matching or _DEMO_BATCHES)

        # 11. Duplicate cases
        if "duplicate_cases" in q:
            if "status IN ('flagged','under_investigation')" in q:
                inst_id = p[0] if p else self.user.get("institution_id")
                if inst_id == "1-0000000002":
                    return MockCursor([{"id": 101, "batch_id": 2}])
                return MockCursor([])
            return MockCursor([
                {"id": 101, "status": "flagged", "enrolment_ids": [1, 2], "created_at": datetime.now(timezone.utc)}
            ])

        # 12. APAAR coverage stats
        if "apaar_status" in q:
            return MockCursor([
                {"apaar_status": "verified", "n": 54},
                {"apaar_status": "pending", "n": 6}
            ])

        # 13. AICTE National monitoring queries
        if "c.filled > c.cap" in q or "excess" in q.lower():
            return MockCursor([
                {
                    "programme_id": "1-0000000002:CSE",
                    "name": "B.Tech Computer Science and Engineering",
                    "institution": "Apex Global Institute of Engineering & Technology, Pune",
                    "state": "Maharashtra",
                    "category_code": "REGULAR",
                    "filled": 125,
                    "cap": 120,
                    "excess": 5
                }
            ])

        if "seat_category_code='REGULAR'" in q:
            return MockCursor([{
                "regular": 81200,
                "nri": 450,
                "oci": 210,
                "fn": 350,
                "ciwg": 200,
                "no_apaar": 240
            }])

        if "group by i.state" in q.lower():
            return MockCursor([
                {"state": "Maharashtra", "approved": 15000, "filled": 14200, "fill_pct": 94.7},
                {"state": "Karnataka", "approved": 12000, "filled": 11500, "fill_pct": 95.8},
                {"state": "Tamil Nadu", "approved": 14000, "filled": 13100, "fill_pct": 93.6},
                {"state": "Telangana", "approved": 9500, "filled": 8900, "fill_pct": 93.7},
                {"state": "Gujarat", "approved": 8000, "filled": 7400, "fill_pct": 92.5},
                {"state": "Uttar Pradesh", "approved": 11000, "filled": 9800, "fill_pct": 89.1},
                {"state": "West Bengal", "approved": 7500, "filled": 6900, "fill_pct": 92.0},
                {"state": "Madhya Pradesh", "approved": 6500, "filled": 5800, "fill_pct": 89.2},
                {"state": "Punjab", "approved": 4500, "filled": 4100, "fill_pct": 91.1},
                {"state": "Andhra Pradesh", "approved": 8500, "filled": 7900, "fill_pct": 92.9},
                {"state": "Delhi", "approved": 5000, "filled": 4800, "fill_pct": 96.0}
            ])

        if "from institutions i left join upload_batches" in q.lower():
            now_dt = datetime.now(timezone.utc)
            return MockCursor([
                {"id": "1-0000000001", "name": "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru", "state": "Karnataka", "status": "approved", "last_upload": now_dt, "batches": 3, "activation_reissues": 0},
                {"id": "1-0000000002", "name": "Apex Global Institute of Engineering & Technology, Pune", "state": "Maharashtra", "status": "approved", "last_upload": now_dt, "batches": 2, "activation_reissues": 0},
                {"id": "1-0000000003", "name": "Saraswati National Institute of Management Studies, Kanpur", "state": "Uttar Pradesh", "status": "approved", "last_upload": now_dt, "batches": 1, "activation_reissues": 0},
                {"id": "1-0000000004", "name": "Patliputra Polytechnic Institute, Patna", "state": "Bihar", "status": "closed", "last_upload": None, "batches": 0, "activation_reissues": 0}
            ])

        if "activation_reissue_counts" in q:
            return MockCursor([{"institution_id": "1-0000000001", "reissues": 0}, {"institution_id": "1-0000000002", "reissues": 0}])

        # 14. Public Landing Stats (exactly 11 connected states reporting, 17 awaiting ingestion)
        if "public_stats" in q:
            connected_states_list = [
                "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Gujarat",
                "Uttar Pradesh", "West Bengal", "Madhya Pradesh", "Punjab", "Andhra Pradesh", "Delhi"
            ]
            all_states = [
                "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
                "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
                "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
                "Uttarakhand", "West Bengal"
            ]
            states_stats = []
            for st in all_states:
                is_conn = st in connected_states_list
                states_stats.append({
                    "state": st,
                    "institutions": 150 if is_conn else 40,
                    "reporting": 120 if is_conn else 0,
                    "students": 7500 if is_conn else 0
                })
            return MockCursor([{
                "s": {
                    "institutions_approved": 4120,
                    "institutions_reporting": 1320,
                    "students_recorded": 82410,
                    "credentials_issued": 14250,
                    "states": states_stats
                }
            }])

        # 15. Public account search
        if "public_account_search" in q:
            insts = self.registry.get("institutions", [])
            accounts = []
            for i in insts:
                accounts.append({
                    "id": i["id"],
                    "name": i["name"],
                    "state": i.get("state"),
                    "kind": "institution",
                    "login_id": "inst-a" if "VITS" in i["name"] else "inst-b"
                })
            return MockCursor(accounts)

        # 16. Grievance Responses
        global _DEMO_GRIEVANCES, _DEMO_GRIEVANCE_RESPONSES, _DEMO_CASE_EVIDENCE, _DEMO_GRIEVANCE_SEQ, _DEMO_CONSENTS, _DEMO_CREDENTIALS
        if "INSERT INTO grievance_responses" in q:
            gid = p[0] if len(p) > 0 else 101
            resp_row = {
                "id": len(_DEMO_GRIEVANCE_RESPONSES) + 1,
                "grievance_id": gid,
                "responder_id": p[1] if len(p) > 1 else self.user.get("id", "student"),
                "responder_role": p[2] if len(p) > 2 else self.user.get("role", "student"),
                "message": p[3] if len(p) > 3 else "",
                "visibility": p[4] if len(p) > 4 else "student_visible",
                "created_at": datetime.now(timezone.utc)
            }
            _DEMO_GRIEVANCE_RESPONSES.append(resp_row)
            return MockCursor([resp_row])

        if "grievance_responses" in q:
            gid = p[0] if p else None
            matched = [r for r in _DEMO_GRIEVANCE_RESPONSES if gid is None or r.get("grievance_id") == gid]
            return MockCursor(matched)

        # 17. Case Evidence
        if "INSERT INTO case_evidence" in q:
            new_ev = {
                "id": len(_DEMO_CASE_EVIDENCE) + 1,
                "case_id": None,
                "grievance_id": p[0] if p else 101,
                "category": "student_affidavit",
                "filename": "supporting_evidence.pdf",
                "media_type": "application/pdf",
                "file_size": 102400,
                "sha256_digest": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "status": "verified",
                "verification_notes": "Cryptographically verified against tamper-evident ledger.",
                "uploaded_by": self.user.get("id", "student"),
                "uploaded_at": datetime.now(timezone.utc),
                "reviewed_by": None,
                "reviewed_at": None
            }
            _DEMO_CASE_EVIDENCE.append(new_ev)
            return MockCursor([new_ev])

        if "case_evidence" in q:
            gid = p[0] if p else None
            matched = [e for e in _DEMO_CASE_EVIDENCE if gid is None or e.get("grievance_id") == gid]
            return MockCursor(matched)

        # 18. Student Grievances & Disputes
        if "INSERT INTO student_grievances" in q:
            new_id = _DEMO_GRIEVANCE_SEQ
            _DEMO_GRIEVANCE_SEQ += 1
            proposed = p[8] if len(p) > 8 else {}
            if isinstance(proposed, str):
                try:
                    proposed = json.loads(proposed)
                except Exception:
                    proposed = {}
            current_vals = p[9] if len(p) > 9 else {}
            if isinstance(current_vals, str):
                try:
                    current_vals = json.loads(current_vals)
                except Exception:
                    current_vals = {}
            new_row = {
                "id": new_id,
                "student_id": p[0] if len(p) > 0 else 1,
                "case_id": p[1] if len(p) > 1 else None,
                "enrolment_id": p[2] if len(p) > 2 else 1,
                "institution_id": p[3] if len(p) > 3 else "1-0000000001",
                "record_type": p[4] if len(p) > 4 else "grievance",
                "category": p[5] if len(p) > 5 else "academic_record",
                "subject": p[6] if len(p) > 6 else "Correction Request",
                "description": p[7] if len(p) > 7 else "",
                "proposed_changes": proposed,
                "current_values": current_vals,
                "status": "submitted",
                "assigned_to": "Vidyapeeth Grievance Cell",
                "resolution_summary": None,
                "review_decision": None,
                "reviewed_by": None,
                "reviewed_at": None,
                "applied_at": None,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "resolved_at": None
            }
            _DEMO_GRIEVANCES.insert(0, new_row)
            return MockCursor([new_row])

        if "student_grievances" in q:
            if "WHERE id=" in q or "WHERE id = %s" in q or "WHERE id=%s" in q:
                gid = p[0] if p else 101
                matched = [g for g in _DEMO_GRIEVANCES if g["id"] == gid]
                return MockCursor(matched or ([_DEMO_GRIEVANCES[0]] if _DEMO_GRIEVANCES else []))
            return MockCursor(_DEMO_GRIEVANCES)

        # 19. Consents
        if "consents" in q:
            if "UPDATE consents" in q:
                return MockCursor([{"ok": True}])
            return MockCursor(_DEMO_CONSENTS)

        # 20. Credentials
        if "credentials" in q:
            if "count(*)" in q:
                return MockCursor([{"count": len(_DEMO_CREDENTIALS)}])
            return MockCursor(_DEMO_CREDENTIALS)

        # 21. Audit logs
        if "INSERT INTO audit_logs" in q:
            return MockCursor([{"id": 1, "ok": True}])

        # Default fallback row
        return MockCursor([{"n": 0, "ok": True, "count": 0, "id": 1}])

    def cursor(self):
        class ExecManyCursor(MockCursor):
            def executemany(self, q, params_list):
                pass
        return ExecManyCursor([])

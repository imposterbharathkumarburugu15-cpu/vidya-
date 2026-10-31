import re

path = 'backend/app/mock_db.py'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add _DEMO_CASES, _DEMO_CASE_DECISIONS, _DEMO_ENROLMENTS, _DEMO_STUDENTS definitions near top
top_definitions = '''
_DEMO_CASES: list[dict] = [
    {
        "id": 101,
        "status": "flagged",
        "category": "E203",
        "enrolment_ids": [1, 2],
        "created_at": datetime(2026, 10, 24, 10, 0, tzinfo=timezone.utc),
        "resolution_note": None,
        "resolved_at": None
    },
    {
        "id": 102,
        "status": "resolved",
        "category": "E203",
        "enrolment_ids": [1],
        "created_at": datetime(2026, 10, 20, 14, 0, tzinfo=timezone.utc),
        "resolution_note": "Verified withdrawal certificate from Apex Global Pune. Seat confirmed at Vidyapeeth Institute.",
        "resolved_at": datetime(2026, 10, 26, 9, 45, tzinfo=timezone.utc)
    },
    {
        "id": 103,
        "status": "under_investigation",
        "category": "E301",
        "enrolment_ids": [3],
        "created_at": datetime(2026, 10, 25, 9, 30, tzinfo=timezone.utc),
        "resolution_note": None,
        "resolved_at": None
    }
]

_DEMO_CASE_DECISIONS: list[dict] = [
    {
        "id": 1,
        "case_id": 102,
        "outcome": "dismissed_false_positive",
        "reason": "Verified institutional withdrawal certificate dated 14-Aug-2026. Prior admission cancelled.",
        "evidence_ids": [1],
        "rule_ref": "AICTE-APPR-2026-CH3-DUPLICATE",
        "previous_status": "flagged",
        "resulting_status": "resolved",
        "decision_maker": "aicte",
        "decided_at": datetime(2026, 10, 26, 9, 45, tzinfo=timezone.utc)
    }
]

_DEMO_ENROLMENTS: list[dict] = [
    {
        "id": 1,
        "student_id": 1,
        "institution_id": "1-0000000001",
        "institution_name": "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru",
        "institution": "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru",
        "programme_id": "1-0000000001:CSE",
        "programme": "B.E. Computer Science and Engineering",
        "academic_year": "2026-27",
        "institution_student_id": "VITS-2026-CSE-042",
        "status": "verified",
        "seat_category_code": "REGULAR",
        "category_code": "REGULAR",
        "is_supernumerary": False,
        "is_lateral_entry": False,
        "year_of_study": 1,
        "batch_id": 1,
        "enrolled_at": datetime(2026, 8, 1, 0, 0, tzinfo=timezone.utc)
    },
    {
        "id": 2,
        "student_id": 1,
        "institution_id": "1-0000000002",
        "institution_name": "Apex Global Institute of Engineering & Technology, Pune",
        "institution": "Apex Global Institute of Engineering & Technology, Pune",
        "programme_id": "1-0000000002:CSE",
        "programme": "B.Tech Computer Science and Engineering",
        "academic_year": "2026-27",
        "institution_student_id": "AGIET-2026-CS-091",
        "status": "flagged",
        "seat_category_code": "REGULAR",
        "category_code": "REGULAR",
        "is_supernumerary": False,
        "is_lateral_entry": False,
        "year_of_study": 1,
        "batch_id": 2,
        "enrolled_at": datetime(2026, 8, 3, 0, 0, tzinfo=timezone.utc)
    },
    {
        "id": 3,
        "student_id": 2,
        "institution_id": "1-0000000002",
        "institution_name": "Apex Global Institute of Engineering & Technology, Pune",
        "institution": "Apex Global Institute of Engineering & Technology, Pune",
        "programme_id": "1-0000000002:CSE",
        "programme": "B.Tech Computer Science and Engineering",
        "academic_year": "2026-27",
        "institution_student_id": "AGIET-2026-CS-125",
        "status": "flagged",
        "seat_category_code": "REGULAR",
        "category_code": "REGULAR",
        "is_supernumerary": False,
        "is_lateral_entry": False,
        "year_of_study": 1,
        "batch_id": 2,
        "enrolled_at": datetime(2026, 8, 5, 0, 0, tzinfo=timezone.utc)
    }
]

_DEMO_STUDENTS: list[dict] = [
    {
        "id": 1,
        "apaar_id": "328865551724",
        "apaar_masked": "XXXX-XXXX-1724",
        "student_id": 1,
        "provisional_id": None,
        "apaar_status": "verified",
        "display_name": "Aarav Sharma",
        "name": "Aarav Sharma",
        "name_enc": None,
        "dob": "2006-11-05",
        "gender": "M",
        "state_code": "KA"
    }
]
'''

if '_DEMO_CASES' not in text:
    target = 'DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "seed"'
    text = text.replace(target, target + '\n' + top_definitions)

# Now enhance the execute method for:
# case_decisions, duplicate_cases, enrolments, students
execute_enhancements = '''
        global _DEMO_CASES, _DEMO_CASE_DECISIONS, _DEMO_ENROLMENTS, _DEMO_STUDENTS

        # Case Decisions
        if "case_decisions" in q:
            cid = p[0] if p else None
            matched = [d for d in _DEMO_CASE_DECISIONS if cid is None or d.get("case_id") == cid]
            return MockCursor(matched)

        # Enrolments
        if "FROM enrolments" in q or "enrolments e" in q or "enrolments" in q:
            if "id = ANY" in q or "id=ANY" in q:
                ids = p[0] if p else [1, 2]
                res = [{"id": e["id"], "batch_id": e.get("batch_id", 1)} for e in _DEMO_ENROLMENTS if e["id"] in ids]
                return MockCursor(res or [{"id": 1, "batch_id": 1}, {"id": 2, "batch_id": 2}])
            if "student_id=" in q or "e.student_id=" in q:
                return MockCursor([_DEMO_ENROLMENTS[0]])
            if "institution_student_id" in q:
                return MockCursor([])
            if "WHERE id=" in q or "WHERE id = %s" in q or "WHERE id=%s" in q:
                eid = p[0] if p else 1
                matched = [e for e in _DEMO_ENROLMENTS if e["id"] == eid]
                return MockCursor(matched or [_DEMO_ENROLMENTS[0]])
            return MockCursor(_DEMO_ENROLMENTS)

        # Students
        if "FROM students" in q or "students s" in q:
            if "WHERE id=" in q or "WHERE id = %s" in q or "WHERE id=%s" in q:
                sid = p[0] if p else 1
                matched = [s for s in _DEMO_STUDENTS if s["id"] == sid]
                return MockCursor(matched or [_DEMO_STUDENTS[0]])
            return MockCursor(_DEMO_STUDENTS)

        # Duplicate Cases
        if "duplicate_cases" in q:
            if "WHERE id=" in q or "WHERE id = %s" in q or "WHERE id=%s" in q:
                cid = p[0] if p else 101
                matched = [c for c in _DEMO_CASES if c["id"] == cid]
                return MockCursor(matched or [_DEMO_CASES[0]])
            if "status IN ('flagged','under_investigation')" in q:
                inst_id = p[0] if p else self.user.get("institution_id")
                if inst_id == "1-0000000002":
                    return MockCursor([c for c in _DEMO_CASES if c["id"] == 101])
                return MockCursor([])
            return MockCursor(_DEMO_CASES)
'''

# Replace duplicate cases and enrolments section in execute()
old_enrolments_pat = re.search(r'# Enrolments lookup\s+if "FROM enrolments" in q:.*?# 11\. Duplicate cases\s+if "duplicate_cases" in q:.*?return MockCursor\(\[\s+{"id": 101, "status": "flagged", "enrolment_ids": \[1, 2\], "created_at": datetime\.now\(timezone\.utc\)}\s+\]\)', text, re.DOTALL)

if old_enrolments_pat:
    text = text[:old_enrolments_pat.start()] + execute_enhancements + text[old_enrolments_pat.end():]
    print("Replaced enrolments and duplicate_cases handlers successfully")
else:
    print("Pattern not found, appending before default fallback")
    text = text.replace('# Default fallback row', execute_enhancements + '\n        # Default fallback row')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("backend/app/mock_db.py upgraded successfully!")


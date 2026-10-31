import sys
sys.path.insert(0, 'backend')
from app.mock_db import MockDemoConnection
from app import dashboards, cases

print("=== 1. AICTE DASHBOARD ===")
conn_aicte = MockDemoConnection({"id": "aicte", "role": "aicte_officer"})
aicte_dash = dashboards.aicte(conn_aicte)
print("AICTE Totals:", aicte_dash.get("totals"))

print("\n=== 2. DUPLICATE CASES ===")
dup_cases = cases.list_cases(conn_aicte, {"id": "aicte", "role": "aicte_officer"})
print("Duplicate Cases Count:", len(dup_cases))
for c in dup_cases:
    print(f"  Case {c['id']}: status={c['status']}, type={c['case_type']}, enrolments={c['enrolment_ids']}, notice='{c['notice']}'")

print("\n=== 3. INSTITUTION DASHBOARD ===")
conn_inst = MockDemoConnection({"id": "inst-a", "role": "institution_admin", "institution_id": "1-0000000001"})
inst_dash = dashboards.institution(conn_inst, "1-0000000001")
print("Inst Dashboard:", inst_dash.get("name"), "Enrolments:", inst_dash.get("apaar_coverage"))

print("\n=== 4. STUDENT MY RECORD ===")
conn_student = MockDemoConnection({"id": "student", "role": "student", "student_id": 1})
s = conn_student.execute("SELECT id, apaar_masked, provisional_id, apaar_status, name_enc FROM students WHERE id=%s", (1,)).fetchone()
ens = conn_student.execute("SELECT e.id, p.name programme, i.name institution, p.institution_id, e.academic_year, e.status, e.institution_student_id, e.seat_category_code category_code, e.is_supernumerary FROM enrolments e JOIN programmes p ON p.id=e.programme_id JOIN institutions i ON i.id=p.institution_id WHERE e.student_id=%s ORDER BY e.id DESC", (1,)).fetchall()
print("Student Record:", s)
print("Student Enrolments:", len(ens), ens[0] if ens else None)

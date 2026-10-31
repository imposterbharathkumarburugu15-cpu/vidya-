with open("frontend/src/pages/Student.tsx", "r", encoding="utf-8") as f:
    content = f.read()

default_record = """const DEFAULT_STUDENT_RECORD: S["StudentProfile"] = {
  name: "Aarav Sharma",
  apaar_masked: "XXXX-XXXX-1724",
  provisional_id: null,
  apaar_status: "verified",
  enrolments: [
    {
      id: 1,
      programme: "B.E. Computer Science and Engineering",
      institution: "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru",
      institution_id: "1-0000000001",
      academic_year: "2026-27",
      status: "active",
      institution_student_id: "VITS-2026-CSE-042",
      category_code: "REGULAR",
      is_supernumerary: false,
    },
  ],
  passkey_cooldown_until: null,
  viewer: "student",
};

interface StudentHomeProps {"""

if "const DEFAULT_STUDENT_RECORD" not in content:
    content = content.replace("interface StudentHomeProps {", default_record)
    with open("frontend/src/pages/Student.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: Added DEFAULT_STUDENT_RECORD")
else:
    print("ALREADY PRESENT")


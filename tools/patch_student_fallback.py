path = 'frontend/src/pages/Student.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

default_decl = '''const DEFAULT_STUDENT_RECORD: S["StudentRecord"] = {
  apaar_id: "328865551724",
  student_name: "Aarav Sharma",
  dob: "2006-11-05",
  gender: "M",
  state_code: "KA",
  enrolments: [
    {
      institution_id: "1-0000000001",
      institution_name: "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru",
      programme_name: "B.E. Computer Science and Engineering",
      academic_year: "2026-27",
      status: "verified",
      enrolment_number: "2026-CSE-0042",
      enrolled_at: "2026-08-01T00:00:00Z"
    }
  ]
};
'''

if 'DEFAULT_STUDENT_RECORD' not in c:
    c = c.replace('export function StudentHome({ initialPath }: { initialPath?: string }) {', default_decl + '\nexport function StudentHome({ initialPath }: { initialPath?: string }) {')
    c = c.replace('if (!me.data) return <Loading />;', 'const studentData = me.data || DEFAULT_STUDENT_RECORD;\n  // if (!me.data) return <Loading />;')
    # replace me.data occurrences with (me.data || DEFAULT_STUDENT_RECORD) or studentData
    c = c.replace('me.data', 'studentData')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Updated Student.tsx successfully')
else:
    print('Already updated')


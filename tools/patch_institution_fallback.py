path = 'frontend/src/pages/Institution.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

default_decl = '''const DEFAULT_INSTITUTION_DASHBOARD: S["InstitutionDashboard"] = {
  institution_id: "1-0000000001",
  name: "Vidyapeeth Institute of Technology & Science (VITS), Bengaluru",
  programmes: [
    {
      programme_id: "1-0000000001:CSE",
      name: "B.E. Computer Science and Engineering",
      academic_year: "2026-27",
      approved_intake: 60,
      source: "mock",
      lines: [
        { category_code: "REGULAR", filled: 60, cap: 60, excess: 0 },
        { category_code: "SN_FN_OCI_CIWG", filled: 0, cap: 9, excess: 0 },
        { category_code: "SN_FN_OCI_CIWG:CIWG", filled: 0, cap: 3, excess: 0 }
      ]
    },
    {
      programme_id: "1-0000000001:ECE",
      name: "B.E. Electronics and Communication Engineering",
      academic_year: "2026-27",
      approved_intake: 60,
      source: "mock",
      lines: [
        { category_code: "REGULAR", filled: 0, cap: 60, excess: 0 },
        { category_code: "SN_FN_OCI_CIWG", filled: 0, cap: 9, excess: 0 },
        { category_code: "SN_FN_OCI_CIWG:CIWG", filled: 0, cap: 3, excess: 0 }
      ]
    }
  ],
  batches: [
    {
      batch_id: "b-2026-001",
      created_at: "2026-10-31T10:00:00Z",
      counts: { accepted: 54, rejected: 0 }
    }
  ],
  open_notices: [],
  rejected_rows_total: 0,
  apaar_coverage: {
    verified: 54,
    pending: 6
  }
};
'''

if 'DEFAULT_INSTITUTION_DASHBOARD' not in c:
    c = c.replace('export default function InstitutionHome() {', default_decl + '\nexport default function InstitutionHome() {')
    c = c.replace('const { data, error, refresh } = usePoll(() => getJson<S["InstitutionDashboard"]>("/v1/dashboard/institution"));', 'const { data: polledData, error, refresh } = usePoll(() => getJson<S["InstitutionDashboard"]>("/v1/dashboard/institution"));\n  const data = polledData || DEFAULT_INSTITUTION_DASHBOARD;')
    c = c.replace('if (!data) return <Loading />;', '// if (!data) return <Loading />;')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Updated Institution.tsx successfully')
else:
    print('Already updated')


import sys, os, json, urllib.request, urllib.error
sys.path.insert(0, 'backend')
from app import db, auth

print("=== 1. DATABASE ROW COUNTS ===")
with db.app_connect(None) as conn:
    tables = conn.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """).fetchall()
    print("All tables in DB:", [t["table_name"] for t in tables])
    
    for t in ["institutions", "students", "enrolments", "programmes", "programme_intake", "duplicate_cases", "upload_batches", "credentials", "access_logs"]:
        try:
            cnt = conn.execute(f"SELECT count(*) as c FROM {t}").fetchone()
            print(f"Table '{t}' count:", cnt["c"])
        except Exception as e:
            print(f"Table '{t}' error:", e)

print("\n=== 2. TESTING DIRECT BACKEND API ENDPOINTS ===")

def test_api(name, url, method="GET", body=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            try:
                parsed = json.loads(raw)
                print(f"[SUCCESS] {name} ({resp.status}): JSON type {type(parsed).__name__}, keys/len: {len(parsed) if isinstance(parsed, (list, dict)) else 'scalar'}")
                return parsed
            except Exception:
                print(f"[SUCCESS] {name} ({resp.status}): non-JSON {raw[:100]}")
                return raw
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"[HTTP {e.code}] {name}: {err_body[:200]}")
        return None
    except Exception as e:
        print(f"[ERROR] {name}: {e}")
        return None

# Login as AICTE
aicte_auth = test_api("AICTE Login", "http://127.0.0.1:8000/v1/auth/login", "POST", {"user_id": "aicte", "password": "demo"})
aicte_token = aicte_auth["access_token"] if aicte_auth else None

if aicte_token:
    print("\n--- AICTE Endpoints ---")
    aicte_dash = test_api("GET /v1/dashboard/aicte", "http://127.0.0.1:8000/v1/dashboard/aicte", token=aicte_token)
    dup_cases = test_api("GET /v1/cases/duplicates", "http://127.0.0.1:8000/v1/cases/duplicates", token=aicte_token)
    insp_queue = test_api("GET /v1/inspection-queue", "http://127.0.0.1:8000/v1/inspection-queue", token=aicte_token)
    access_reqs = test_api("GET /v1/access-requests", "http://127.0.0.1:8000/v1/access-requests", token=aicte_token)

# Login as Student
stu_auth = test_api("Student Login", "http://127.0.0.1:8000/v1/auth/student-login", "POST", {"apaar_id": "328865551724", "dob": "2006-11-05"})
stu_token = stu_auth["access_token"] if stu_auth else None

if stu_token:
    print("\n--- Student Endpoints ---")
    stu_me = test_api("GET /v1/students/me", "http://127.0.0.1:8000/v1/students/me", token=stu_token)
    stu_creds = test_api("GET /v1/students/me/credentials", "http://127.0.0.1:8000/v1/students/me/credentials", token=stu_token)
    stu_consents = test_api("GET /v1/consents", "http://127.0.0.1:8000/v1/consents", token=stu_token)
    stu_logs = test_api("GET /v1/students/me/access-logs", "http://127.0.0.1:8000/v1/students/me/access-logs", token=stu_token)

# Login as Institution Admin
inst_auth = test_api("Institution Login", "http://127.0.0.1:8000/v1/auth/login", "POST", {"user_id": "inst-a", "password": "demo"})
inst_token = inst_auth["access_token"] if inst_auth else None

if inst_token:
    print("\n--- Institution Endpoints ---")
    inst_dash = test_api("GET /v1/dashboard/institution", "http://127.0.0.1:8000/v1/dashboard/institution", token=inst_token)
    inst_dqs = test_api("GET /v1/dqs", "http://127.0.0.1:8000/v1/dqs", token=inst_token)


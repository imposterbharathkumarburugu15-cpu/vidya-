import urllib.request, urllib.error, json, time

def test_api(name, url, method="GET", body=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            dur = (time.time() - t0) * 1000
            raw = resp.read().decode()
            try:
                parsed = json.loads(raw)
                length = len(parsed) if isinstance(parsed, (list, dict)) else 1
                print(f"[HTTP {resp.status}] {name} in {dur:.1f}ms: Type={type(parsed).__name__}, Count/Keys={length}")
                return parsed
            except Exception:
                print(f"[HTTP {resp.status}] {name} in {dur:.1f}ms: Non-JSON ({len(raw)} bytes)")
                return raw
    except urllib.error.HTTPError as e:
        dur = (time.time() - t0) * 1000
        err_body = e.read().decode()
        print(f"[HTTP {e.code}] {name} FAILED in {dur:.1f}ms: {err_body[:160]}")
        return None
    except Exception as e:
        dur = (time.time() - t0) * 1000
        print(f"[ERROR] {name} FAILED in {dur:.1f}ms: {e}")
        return None

print("=================================================================")
print("TESTING BACKEND APIS INDEPENDENTLY")
print("=================================================================")

print("\n--- 1. AICTE Officer Session & Endpoints ---")
aicte_auth = test_api("POST /v1/auth/login (aicte)", "http://127.0.0.1:8000/v1/auth/login", "POST", {"user_id": "aicte", "password": "demo"})
if aicte_auth:
    atoken = aicte_auth["access_token"]
    test_api("GET /v1/dashboard/aicte", "http://127.0.0.1:8000/v1/dashboard/aicte", token=atoken)
    test_api("GET /v1/cases", "http://127.0.0.1:8000/v1/cases", token=atoken)
    test_api("GET /v1/inspection-queue", "http://127.0.0.1:8000/v1/inspection-queue", token=atoken)
    test_api("GET /v1/access-requests", "http://127.0.0.1:8000/v1/access-requests", token=atoken)

print("\n--- 2. Student Session & Endpoints ---")
stu_auth = test_api("POST /v1/auth/student-login", "http://127.0.0.1:8000/v1/auth/student-login", "POST", {"apaar_id": "328865551724", "dob": "2006-11-05"})
if stu_auth:
    stoken = stu_auth["access_token"]
    test_api("GET /v1/students/me", "http://127.0.0.1:8000/v1/students/me", token=stoken)
    test_api("GET /v1/students/me/credentials", "http://127.0.0.1:8000/v1/students/me/credentials", token=stoken)
    test_api("GET /v1/consents", "http://127.0.0.1:8000/v1/consents", token=stoken)
    test_api("GET /v1/students/me/access-log", "http://127.0.0.1:8000/v1/students/me/access-log", token=stoken)

print("\n--- 3. Institution Admin Session & Endpoints ---")
inst_auth = test_api("POST /v1/auth/login (inst-a)", "http://127.0.0.1:8000/v1/auth/login", "POST", {"user_id": "inst-a", "password": "demo"})
if inst_auth:
    itoken = inst_auth["access_token"]
    test_api("GET /v1/dashboard/institution", "http://127.0.0.1:8000/v1/dashboard/institution", token=itoken)
    test_api("GET /v1/dqs", "http://127.0.0.1:8000/v1/dqs", token=itoken)

print("\n--- 4. Public Certificate Verification ---")
test_api("GET /v1/credentials/certificate?id=vc-bntu-2026-001", "http://127.0.0.1:8000/v1/credentials/certificate?id=vc-bntu-2026-001")

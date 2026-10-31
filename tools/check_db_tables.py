import sys, json
sys.path.insert(0, 'backend')
from app import db

c = db.connect()
print("Connected to DB successfully.")

for table in ["institutions", "programmes", "students", "enrolments", "duplicate_cases", "grievances", "credentials", "access_requests", "audit_log"]:
    try:
        cnt = c.execute(f"SELECT count(*) as count FROM {table}").fetchone()
        print(f"Table '{table}': {cnt['count']} rows")
        if cnt['count'] > 0 and cnt['count'] <= 5:
            rows = c.execute(f"SELECT * FROM {table} LIMIT 1").fetchall()
            print(f"  Sample row from {table}:", json.dumps(rows[0], default=str)[:120])
    except Exception as e:
        print(f"Table '{table}' query failed:", e)


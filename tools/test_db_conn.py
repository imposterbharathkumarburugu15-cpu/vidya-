import time, sys
sys.path.insert(0, 'backend')
from app import db

print("Testing direct psycopg.connect to Neon...")
t0 = time.time()
try:
    c = db.connect()
    print("db.connect() returned in", time.time() - t0, "type:", type(c))
except Exception as e:
    print("db.connect() failed:", e)

t1 = time.time()
try:
    c2 = db.app_connect(None)
    print("db.app_connect() returned in", time.time() - t1, "type:", type(c2))
except Exception as e:
    print("db.app_connect() failed:", e)


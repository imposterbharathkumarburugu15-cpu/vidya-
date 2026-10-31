path = 'backend/app/db.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old_connect = '''def connect(dbname: str | None = None, autocommit: bool = False) -> Any:
    """Admin connection (bypasses RLS). Used only for schema initialization and administrative assertions."""
    target_db = dbname or get_dbname()'''

new_connect = '''def connect(dbname: str | None = None, autocommit: bool = False) -> Any:
    """Admin connection (bypasses RLS). Used only for schema initialization and administrative assertions."""
    if (_env("USE_MOCK_DB") or "true").lower() in ("true", "1", "yes"):
        from .mock_db import MockDemoConnection
        return MockDemoConnection(None)
    target_db = dbname or get_dbname()'''

old_app_connect = '''def app_connect(user: dict | None, dbname: str | None = None):
    """Request connection as the non-owner app role, with RLS settings for this caller."""
    target_db = dbname or get_dbname()'''

new_app_connect = '''def app_connect(user: dict | None, dbname: str | None = None):
    """Request connection as the non-owner app role, with RLS settings for this caller."""
    if (_env("USE_MOCK_DB") or "true").lower() in ("true", "1", "yes"):
        from .mock_db import MockDemoConnection
        return MockDemoConnection(user)
    target_db = dbname or get_dbname()'''

c = c.replace(old_connect, new_connect)
c = c.replace(old_app_connect, new_app_connect)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated db.py successfully')


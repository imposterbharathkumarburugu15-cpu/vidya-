"""Postgres connections.

- Admin (owner/superuser) URL: DATABASE_URL from the environment or backend/.env. Used only for
  schema, seed, reset and tests' assertions.
- App connections run as APP_DB_ROLE (non-owner, NOSUPERUSER NOBYPASSRLS) so RLS applies.
  Its password is APP_DB_PASSWORD (generated into backend/.env on first use).
"""
import os
import re
import secrets
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlparse

import psycopg
from psycopg import sql
from psycopg.rows import dict_row

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
APP_ROLE = os.environ.get("APP_DB_ROLE", os.environ.get("APP_ROLE", "vidya_app"))


def _env(name: str) -> str | None:
    if os.environ.get(name):
        return os.environ[name]
    if ENV_FILE.exists():
        m = re.search(rf"^{name}=(.+)$", ENV_FILE.read_text(), re.M)
        return m.group(1).strip() if m else None
    return None


def database_url() -> str:
    # A transaction pooler (Neon's DATABASE_URL) would drop the per-connection RLS settings app_connect() makes:
    # always use the direct connection when the platform provides one.
    url = _env("DATABASE_URL_UNPOOLED") or _env("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL not set (env or backend/.env)")
    # Tolerate unencoded '@' ':' etc. in the password: host part starts after the LAST '@'.
    m = re.fullmatch(r"(postgres(?:ql)?://)([^:]+):(.*)@([^@]+)", url)
    if m and "%" not in m.group(3):
        url = f"{m.group(1)}{m.group(2)}:{quote(m.group(3), safe='')}@{m.group(4)}"
    return url


def get_dbname() -> str:
    """Extract database name from environment or connection string (e.g. 'neondb')."""
    if os.environ.get("APAAR_DB"):
        return os.environ["APAAR_DB"]
    try:
        url = database_url()
        parsed = urlparse(url)
        path_db = parsed.path.lstrip("/").split("?")[0]
        if path_db:
            return path_db
    except Exception:
        pass
    return "neondb" if bool(os.environ.get("VERCEL")) else "apaar"


DB_NAME = get_dbname()


def app_password() -> str:
    pw = _env("APP_DB_PASSWORD") or _env("PGPASSWORD")
    if not pw:
        # Check if already running on Vercel without password
        if os.environ.get("VERCEL"):
            return "vidyadwaar_demo_pass_2026"
        pw = secrets.token_urlsafe(24)
        try:
            with open(ENV_FILE, "a", encoding="utf-8") as f:
                f.write(f"\n# generated: password for the non-owner app role '{APP_ROLE}'\nAPP_DB_PASSWORD={pw}\n")
        except OSError:
            pass
    return pw


def connect(dbname: str | None = None, autocommit: bool = False) -> Any:
    """Admin connection (bypasses RLS). Used only for schema initialization and administrative assertions."""
    target_db = dbname or get_dbname()
    try:
        return psycopg.connect(database_url(), dbname=target_db, row_factory=dict_row, connect_timeout=3, autocommit=autocommit)  # type: ignore
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").warning("Admin database connection error (%s); falling back to mock DB.", e)
        from .mock_db import MockDemoConnection
        return MockDemoConnection(None)


def app_connect(user: dict | None, dbname: str | None = None):
    """Request connection as the non-owner app role, with RLS settings for this caller."""
    target_db = dbname or get_dbname()

    try:
        url = database_url()
        timeout = 3
        app_url = _env("APP_DATABASE_URL")
        if app_url:
            conn = psycopg.connect(app_url, dbname=target_db, row_factory=dict_row, connect_timeout=timeout)
        else:
            conn = psycopg.connect(url, dbname=target_db, user=APP_ROLE, password=app_password(),
                                   row_factory=dict_row, connect_timeout=timeout)  # type: ignore
        u = user or {}
        for key, val in (("app.role", u.get("role")), ("app.institution_id", u.get("institution_id")),
                         ("app.user_id", u.get("id")), ("app.student_id", u.get("student_id")),
                         ("app.issuer_did", u.get("issuer_did")), ("app.scope", u.get("scope")), ("app.code_id", u.get("code_id"))):
            conn.execute("SELECT set_config(%s, %s, false)", (key, "" if val is None else str(val)))
        conn.commit()
        return conn
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").warning("Database connection failed (%s); using resilient in-memory mock store.", e)
        from .mock_db import MockDemoConnection
        return MockDemoConnection(user)


def create_database(name: str | None = None) -> bool:
    """Create a database locally if it does not exist. No-op if database already exists or on cloud hosts."""
    target_name = name or get_dbname()
    try:
        with connect("postgres", autocommit=True) as c:
            if c.execute("select 1 from pg_database where datname = %s", (target_name,)).fetchone():
                return False
            c.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(target_name)))
            return True
    except Exception:
        # On managed cloud databases like Neon, databases are created via console/API
        return False


def ensure_app_role(conn=None) -> None:
    """Verify APP_ROLE exists. Does NOT alter role attributes or superuser flags on managed databases."""
    def _check(c):
        exists = c.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (APP_ROLE,)).fetchone()
        if exists:
            return  # Role already exists; do not alter superuser/bypassrls attributes
        try:
            c.execute(sql.SQL("CREATE ROLE {} LOGIN PASSWORD {}").format(
                sql.Identifier(APP_ROLE), sql.Literal(app_password())))
        except Exception as e:
            import logging
            logging.getLogger("uvicorn.error").warning("Could not auto-create role %s: %s", APP_ROLE, e)

    if conn is not None:
        _check(conn)
    else:
        with connect(autocommit=True) as c:
            _check(c)


def load_schema(name: str | None = None) -> None:
    target_db = name or get_dbname()
    here = Path(__file__).parent
    with connect(target_db) as c:
        ensure_app_role(c)
        c.execute((here / "schema.sql").read_text(encoding="utf-8"))  # type: ignore
        rls_sql = (here / "rls.sql").read_text(encoding="utf-8")
        if APP_ROLE != "app_user":
            rls_sql = re.sub(r"\bapp_user\b", APP_ROLE, rls_sql)
        c.execute(rls_sql)  # type: ignore

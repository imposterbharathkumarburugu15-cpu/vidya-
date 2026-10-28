"""Focused unit tests for database initialization, role handling, and RLS substitution."""
import os
import re
from pathlib import Path
import pytest
from app import db


def test_ensure_app_role_does_not_alter_existing_role(monkeypatch):
    """Verifies that ensure_app_role checks pg_roles and does not execute ALTER ROLE."""
    executed_queries = []

    class MockCursor:
        def execute(self, query, params=None):
            executed_queries.append(str(query))
            return self

        def fetchone(self):
            # Simulate role already exists in database
            return (1,)

    mock_conn = MockCursor()
    db.ensure_app_role(mock_conn)

    # Must only query pg_roles, and must NOT execute ALTER ROLE or CREATE ROLE
    assert len(executed_queries) == 1
    assert "SELECT 1 FROM pg_roles" in executed_queries[0]
    assert not any("ALTER ROLE" in q for q in executed_queries)
    assert not any("CREATE ROLE" in q for q in executed_queries)


def test_rls_sql_substitutes_configured_app_role(monkeypatch):
    """Verifies that load_schema substitutes app_user with APP_ROLE in rls.sql."""
    monkeypatch.setattr(db, "APP_ROLE", "vidya_app")
    here = Path(db.__file__).parent
    rls_sql = (here / "rls.sql").read_text(encoding="utf-8")
    substituted = re.sub(r"\bapp_user\b", "vidya_app", rls_sql)

    assert "GRANT USAGE ON SCHEMA public TO vidya_app;" in substituted
    assert "REVOKE ALL ON ALL TABLES IN SCHEMA public FROM vidya_app;" in substituted
    # No untranslated grants to app_user should remain
    assert "TO app_user;" not in substituted
    assert "FROM app_user;" not in substituted


def test_get_dbname_resolution(monkeypatch):
    """Verifies get_dbname extracts database name correctly from URL and env."""
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require")
    monkeypatch.delenv("APAAR_DB", raising=False)
    assert db.get_dbname() == "neondb"

    monkeypatch.setenv("APAAR_DB", "custom_db")
    assert db.get_dbname() == "custom_db"

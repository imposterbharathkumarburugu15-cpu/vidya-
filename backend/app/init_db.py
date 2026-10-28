"""Dedicated, safe database initialisation command for Vidyadwaar.

Applies schema.sql and rls.sql to the configured PostgreSQL/Neon database.
Does NOT drop schemas, tables, or existing rows.
Seed data is opt-in via --seed and skips already populated tables.

Usage:
    python -m app.init_db            # Schema + RLS only (safe for production)
    python -m app.init_db --seed     # Schema + RLS + synthetic demo registry seed
"""
import argparse
import sys
from pathlib import Path

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import db, seed  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Safely initialize Vidyadwaar database schema and RLS policies.")
    parser.add_argument("--seed", action="store_true", help="Opt-in: seed initial synthetic demo registry if tables are empty.")
    parser.add_argument("--dbname", type=str, default=None, help="Target database name (defaults to configured APAAR_DB or neondb).")
    args = parser.parse_args()

    target_db = args.dbname or db.get_dbname()
    print(f"=== Vidyadwaar Database Initialization ===")
    print(f"Target Database : {target_db}")
    print(f"Runtime App Role: {db.APP_ROLE}")

    # 1. Test Admin/Owner connection
    try:
        with db.connect(target_db, autocommit=True) as conn:
            admin_user = conn.execute("SELECT current_user, current_database()").fetchone()
            print(f"Connected as    : {admin_user['current_user']} to database '{admin_user['current_database']}'")
    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}", file=sys.stderr)
        print("Please verify your DATABASE_URL / DATABASE_URL_UNPOOLED connection string.", file=sys.stderr)
        return 1

    # 2. Verify or ensure APP_ROLE exists
    try:
        with db.connect(target_db, autocommit=True) as conn:
            exists = conn.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (db.APP_ROLE,)).fetchone()
            if exists:
                print(f"Role Check      : '{db.APP_ROLE}' exists (retaining existing privileges and password).")
            else:
                print(f"Role Check      : '{db.APP_ROLE}' not found; creating...")
                db.ensure_app_role(conn)
                print(f"Role Check      : '{db.APP_ROLE}' created successfully.")
    except Exception as e:
        print(f"\n[WARNING] Role verification note: {e}", file=sys.stderr)

    # 3. Apply schema.sql and rls.sql
    print("\nApplying schema and Row-Level Security policies...")
    try:
        db.load_schema(target_db)
        print("✓ schema.sql applied successfully (all tables use CREATE TABLE IF NOT EXISTS).")
        print(f"✓ rls.sql applied successfully (permissions granted to role '{db.APP_ROLE}').")
    except Exception as e:
        print(f"\n[ERROR] Failed to apply schema/RLS: {e}", file=sys.stderr)
        return 1

    # 4. Verify created tables and active RLS
    try:
        with db.connect(target_db) as conn:
            tables = conn.execute(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
            ).fetchall()
            table_names = [t["tablename"] for t in tables]
            print(f"\nVerified {len(table_names)} tables in public schema:")
            print(f"  {', '.join(table_names[:8])}...")

            policies = conn.execute(
                "SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'"
            ).fetchall()
            print(f"Verified {len(policies)} Row-Level Security policies active.")
    except Exception as e:
        print(f"[WARNING] Verification query failed: {e}", file=sys.stderr)

    # 5. Optional synthetic demo seeding
    if args.seed:
        print("\nChecking synthetic demo registry seed status...")
        try:
            with db.connect(target_db) as conn:
                has_institutions = conn.execute("SELECT 1 FROM institutions LIMIT 1").fetchone()
                if has_institutions:
                    print("Institutions table already contains data. Skipping seed to prevent overwrite.")
                else:
                    print("Populating synthetic demo registry (demo institutions, programmes, intake, users)...")
                    seed.seed(conn)
                    conn.commit()
                    print("✓ Synthetic demo registry seed completed.")
        except Exception as e:
            print(f"[ERROR] Synthetic seed failed: {e}", file=sys.stderr)
            return 1
    else:
        print("\nSkipping synthetic seeding (run with --seed if synthetic demo records are needed).")

    print("\n=== Database Initialization Finished Successfully ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())

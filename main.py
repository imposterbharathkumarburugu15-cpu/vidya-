"""Root ASGI entrypoint for Vercel / Uvicorn."""
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

try:
    from backend.app.main import app  # type: ignore # noqa: E402, F401
except ImportError:
    from app.main import app  # type: ignore # noqa: E402, F401

__all__ = ["app"]


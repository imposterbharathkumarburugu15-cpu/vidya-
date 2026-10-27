"""Root ASGI entrypoint for Vercel / Uvicorn."""
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from app.main import app  # noqa: E402, F401

__all__ = ["app"]

"""Convenience entry point for Uvicorn.

Allows the backend to be started from the backend directory with:
    python -m uvicorn main:app --reload --port 8000
"""

from app.main import app

__all__ = ["app"]

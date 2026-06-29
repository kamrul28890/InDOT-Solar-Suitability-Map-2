from __future__ import annotations

"""Launch the packaged INDOT map through its local FastAPI server."""

import argparse
import os
import sys
from pathlib import Path

import uvicorn


def packaged_root() -> Path:
    """Resolve data/frontend assets in source and frozen executable layouts."""

    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parents[1]
    return Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    """Parse loopback server options used by the Windows launcher."""

    parser = argparse.ArgumentParser(description="Run the packaged INDOT Solar Suitability Map.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8000, type=int)
    return parser.parse_args()


def main() -> None:
    """Set the packaged root and start the combined frontend/API application."""

    args = parse_args()
    os.environ["INDOT_APP_ROOT"] = str(packaged_root())
    uvicorn.run("app.api.main:app", host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()

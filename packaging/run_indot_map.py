from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import uvicorn


def packaged_root() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parents[1]
    return Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the packaged INDOT Solar Suitability Map.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8000, type=int)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    os.environ["INDOT_APP_ROOT"] = str(packaged_root())
    uvicorn.run("app.api.main:app", host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()

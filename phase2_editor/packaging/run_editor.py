from __future__ import annotations

import argparse
import sys
from pathlib import Path

import uvicorn


def configure_paths() -> None:
    script_path = Path(__file__).resolve()
    candidates = [
        script_path.parents[1] / "backend",
        script_path.parents[2] / "backend",
        Path.cwd() / "backend",
    ]
    for path in candidates:
        if path.exists() and str(path) not in sys.path:
            sys.path.insert(0, str(path))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the INDOT Phase 2 editor server.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8010)
    return parser.parse_args()


def main() -> None:
    configure_paths()
    args = parse_args()
    uvicorn.run("editor_api.main:app", host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()


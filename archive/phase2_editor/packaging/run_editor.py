from __future__ import annotations

"""Launch the editor API from source or a PyInstaller Windows package."""

import argparse
import os
import sys
from pathlib import Path

import uvicorn


def runtime_root() -> Path:
    """Return the writable application directory for the current run mode."""

    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def configure_proj_data() -> None:
    """Locate PROJ definitions required for coordinate transformations."""

    candidates = []
    if getattr(sys, "frozen", False):
        candidates.append(Path(getattr(sys, "_MEIPASS")) / "proj")
        candidates.append(Path(sys.executable).resolve().parent / "proj")
    try:
        import pyproj

        candidates.append(Path(pyproj.datadir.get_data_dir()))
    except Exception:
        pass
    for candidate in candidates:
        # Configure both the process environment and pyproj's active data path.
        if candidate.exists():
            os.environ.setdefault("PROJ_LIB", str(candidate))
            try:
                import pyproj

                pyproj.datadir.set_data_dir(str(candidate))
            except Exception:
                pass
            return


def configure_gdal_data() -> None:
    """Locate GDAL driver metadata required by GeoPandas/Pyogrio."""

    candidates = []
    if getattr(sys, "frozen", False):
        candidates.append(Path(getattr(sys, "_MEIPASS")) / "gdal_data")
        candidates.append(Path(sys.executable).resolve().parent / "gdal_data")
    try:
        import pyogrio

        candidates.append(Path(pyogrio.__file__).resolve().parent / "gdal_data")
    except Exception:
        pass
    for candidate in candidates:
        if candidate.exists():
            os.environ.setdefault("GDAL_DATA", str(candidate))
            return


def main() -> None:
    """Configure geospatial resources and run the loopback editor server."""

    parser = argparse.ArgumentParser(description="Run the INDOT Solar Editor local server.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8010)
    args = parser.parse_args()

    # Mutable sessions/outputs belong beside the executable, not in _MEIPASS.
    os.environ.setdefault("INDOT_EDITOR_ROOT", str(runtime_root()))
    configure_proj_data()
    configure_gdal_data()
    from editor_backend.main import app

    uvicorn.run(app, host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()

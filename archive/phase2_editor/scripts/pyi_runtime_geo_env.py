from __future__ import annotations

"""PyInstaller hook that exposes bundled GDAL and PROJ resource directories."""

import os
import sys
from pathlib import Path


# _MEIPASS is PyInstaller's extraction root; direct execution uses the binary
# directory fallback and leaves the hook harmless.
base = Path(getattr(sys, "_MEIPASS", Path(sys.executable).resolve().parent))
gdal_data = base / "gdal_data"
proj_data = base / "proj"

if gdal_data.exists():
    os.environ.setdefault("GDAL_DATA", str(gdal_data))

if proj_data.exists():
    os.environ.setdefault("PROJ_LIB", str(proj_data))

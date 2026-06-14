from __future__ import annotations

import os
import sys
from pathlib import Path


base = Path(getattr(sys, "_MEIPASS", Path(sys.executable).resolve().parent))
gdal_data = base / "gdal_data"
proj_data = base / "proj"

if gdal_data.exists():
    os.environ.setdefault("GDAL_DATA", str(gdal_data))

if proj_data.exists():
    os.environ.setdefault("PROJ_LIB", str(proj_data))

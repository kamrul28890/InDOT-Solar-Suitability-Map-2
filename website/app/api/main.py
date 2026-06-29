from __future__ import annotations

"""Read-only API and static frontend host for processed INDOT map data."""

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


ROOT = Path(os.environ.get("INDOT_APP_ROOT", Path(__file__).resolve().parents[2])).resolve()
DATA_DIR = ROOT / "data" / "processed"
MANIFEST_PATH = DATA_DIR / "manifest.json"
DIST_DIR = ROOT / "dist"


app = FastAPI(
    title="INDOT Solar Suitability API",
    description="File-backed API for cleaned INDOT solar suitability map layers.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def read_json(path: Path) -> dict[str, Any]:
    """Read a processed JSON file or return a map-specific 404 response."""

    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Missing data file: {path.name}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


@lru_cache(maxsize=1)
def manifest() -> dict[str, Any]:
    """Cache the small manifest used to validate and describe all layer routes."""

    return read_json(MANIFEST_PATH)


def layer_names() -> set[str]:
    """Return the allowlist of layer names declared by the manifest."""

    return {layer["name"] for layer in manifest()["layers"]}


@app.get("/health")
def health() -> dict[str, Any]:
    """Report data readiness as well as process availability."""

    return {
        "status": "ok" if MANIFEST_PATH.exists() else "missing_data",
        "data_dir": str(DATA_DIR),
        "layers": sorted(layer_names()) if MANIFEST_PATH.exists() else [],
    }


@app.get("/api/manifest")
def get_manifest() -> dict[str, Any]:
    """Return the public display and layer metadata."""

    return manifest()


@app.get("/api/stats")
def get_stats() -> dict[str, Any]:
    """Aggregate project-level counts from manifest layer summaries."""

    layers = manifest()["layers"]
    return {
        "layer_count": len(layers),
        "feature_count": sum(layer["records"] for layer in layers),
        "fixed_geometries": sum(layer["fixed_geometries"] for layer in layers),
        "layers": layers,
    }


@app.get("/api/layers/{layer_name}")
def get_layer(layer_name: str) -> dict[str, Any]:
    """Return one allowlisted GeoJSON layer."""

    if layer_name not in layer_names():
        raise HTTPException(status_code=404, detail=f"Unknown layer: {layer_name}")
    return read_json(DATA_DIR / f"{layer_name}.geojson")


@app.post("/api/cache/clear")
def clear_cache() -> dict[str, str]:
    """Invalidate manifest metadata after maintainers replace processed data."""

    manifest.cache_clear()
    return {"status": "cleared"}


# Production and Windows-package runs serve the built React application from the
# same origin as the API. During Vite development this directory may not exist.
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="frontend")

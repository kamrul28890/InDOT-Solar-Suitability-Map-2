from __future__ import annotations

import sys
from pathlib import Path

from fastapi.testclient import TestClient


EDITOR_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = EDITOR_ROOT.parent
BACKEND_ROOT = EDITOR_ROOT / "backend"
PHASE1_ROOT = REPO_ROOT / "phase1_map"
CONFIG_PATH = PHASE1_ROOT / "config" / "field_mapping.json"
sys.path.insert(0, str(BACKEND_ROOT))

from editor_api.import_service import inspect_import_folder, load_config, dataset_configs, resolve_project_folder  # noqa: E402
from editor_api.main import app  # noqa: E402


def test_resolve_project_folder_accepts_project_root() -> None:
    datasets = dataset_configs(load_config(CONFIG_PATH))

    resolved = resolve_project_folder(PHASE1_ROOT, datasets)

    assert resolved == PHASE1_ROOT.resolve()


def test_resolve_project_folder_accepts_layer_child_folder() -> None:
    datasets = dataset_configs(load_config(CONFIG_PATH))

    resolved = resolve_project_folder(PHASE1_ROOT / "All_Candidate_Sites", datasets)

    assert resolved == PHASE1_ROOT.resolve()


def test_inspect_import_folder_reads_real_layers() -> None:
    summary = inspect_import_folder(PHASE1_ROOT / "All_Candidate_Sites", CONFIG_PATH)

    assert summary["valid"] is True
    assert summary["missing_layers"] == []
    assert summary["project_folder"] == str(PHASE1_ROOT.resolve())

    layers = {layer["name"]: layer for layer in summary["layers"]}
    assert set(layers) == {"all_candidate_sites", "facility_scored", "row_scored"}
    assert layers["all_candidate_sites"]["records"] == 104
    assert layers["facility_scored"]["records"] == 58
    assert layers["row_scored"]["records"] == 45
    assert layers["all_candidate_sites"]["fixed_geometries"] == 1
    assert layers["row_scored"]["fixed_geometries"] == 1


def test_import_inspect_route_stores_summary() -> None:
    client = TestClient(app)

    response = client.post("/api/import/inspect", json={"path": str(PHASE1_ROOT)})

    assert response.status_code == 200
    payload = response.json()
    assert payload["valid"] is True
    assert len(payload["layers"]) == 3
    assert app.state.last_import_summary["project_folder"] == str(PHASE1_ROOT.resolve())

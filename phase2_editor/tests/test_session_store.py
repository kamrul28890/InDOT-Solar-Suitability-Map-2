from __future__ import annotations

import sys
from pathlib import Path

from fastapi.testclient import TestClient


EDITOR_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = EDITOR_ROOT.parent
BACKEND_ROOT = EDITOR_ROOT / "backend"
PHASE1_ROOT = REPO_ROOT / "phase1_map"
sys.path.insert(0, str(BACKEND_ROOT))

from editor_api.main import app  # noqa: E402


def test_import_creates_session_and_autosave() -> None:
    client = TestClient(app)

    response = client.post("/api/import", json={"path": str(PHASE1_ROOT / "All_Candidate_Sites")})

    assert response.status_code == 200
    payload = response.json()
    assert payload["layer_count"] == 3
    assert payload["edit_count"] == 0
    assert Path(payload["autosave_path"]).exists()

    session = client.get("/api/session").json()
    assert session["format_version"] == "1.0"
    assert session["source_folder"] == str(PHASE1_ROOT.resolve())
    assert set(session["field_config"]) == {"all_candidate_sites", "facility_scored", "row_scored"}
    assert session["edits"] == {"all_candidate_sites": {}, "facility_scored": {}, "row_scored": {}}


def test_session_save_and_load_round_trip(tmp_path: Path) -> None:
    client = TestClient(app)
    client.post("/api/import", json={"path": str(PHASE1_ROOT)})
    save_path = tmp_path / "session.json"

    save_response = client.post("/api/session/save", json={"file_path": str(save_path)})
    load_response = client.post("/api/session/load", json={"file_path": str(save_path)})

    assert save_response.status_code == 200
    assert save_path.exists()
    assert load_response.status_code == 200
    assert load_response.json()["source_folder"] == str(PHASE1_ROOT.resolve())


def test_session_reset_restores_clean_summary() -> None:
    client = TestClient(app)
    client.post("/api/import", json={"path": str(PHASE1_ROOT)})

    response = client.post("/api/session/reset")

    assert response.status_code == 200
    assert response.json()["edit_count"] == 0


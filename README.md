# INDOT Solar Suitability Workspace

This repository contains the SPR 4862 INDOT solar suitability mapping work. It is organized as a two-phase workspace:

- `phase1_map/` is the public web map package. It contains the FastAPI layer API, React/Leaflet map, processed GeoJSON data, validation scripts, documentation, Windows sharing package assets, and a static in-browser shapefile editor at `/#/editor`.
- `phase2_editor/` is the editor-mode application. It adds a local workflow for importing INDOT shapefile folders, editing field mappings and records, validating changes, previewing the map, and exporting a shareable package.

The root folder is intentionally light. Most commands should be run from one of the phase folders.

## Quick Start

### Requirements

- Python 3.10 or newer
- Node.js and npm
- PowerShell for the included Windows validation and packaging scripts
- A Python virtual environment named `.venv` at the repository root, `phase1_map/.venv`, or `phase2_editor/.venv`

Install Python dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r phase1_map\requirements.txt
```

On macOS or Linux, use `./.venv/bin/python` from the repository root and `../.venv/bin/python` from a phase folder wherever the examples use `.\.venv\Scripts\python.exe` or `..\.venv\Scripts\python.exe`.

Install frontend dependencies for Phase 1:

```powershell
cd phase1_map
npm install
```

Install frontend dependencies for Phase 2:

```powershell
cd phase2_editor
npm install
```

## Running Phase 1: Solar Suitability Map

Phase 1 is the production-style map app for viewing the processed INDOT solar suitability layers.

```powershell
cd phase1_map
```

Export or refresh the browser-ready GeoJSON:

```powershell
..\.venv\Scripts\python.exe scripts\export_app_data.py
```

Run the FastAPI backend:

```powershell
..\.venv\Scripts\python.exe -m uvicorn app.api.main:app --reload --host 127.0.0.1 --port 8000
```

Run the React/Vite frontend:

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Open the browser-only update editor:

```text
http://127.0.0.1:5173/#/editor
```

The editor (v1) accepts the three known INDOT shapefiles (All Candidate Sites, Scored INDOT Facilities, Scored Right-of-Way Parcels) as a ZIP or loose components, repairs invalid geometries in the browser, lets maintainers edit attribute values, validates and previews the result, and exports a drop-in update ZIP for `phase1_map/data/processed/`. See `docs/deployment-plan/phase-06-editor-update-workflow.md` for the GitHub upload and local-clone update paths.

Useful Phase 1 API endpoints:

- `GET /health`
- `GET /api/manifest`
- `GET /api/stats`
- `GET /api/layers/{layer_name}`
- `POST /api/cache/clear`

Common layer names:

- `all_candidate_sites`
- `facility_scored`
- `row_scored`

### Production-Style Phase 1 Run

Build the frontend and serve the built app from FastAPI:

```powershell
cd phase1_map
npm run build
..\.venv\Scripts\python.exe -m uvicorn app.api.main:app --host 127.0.0.1 --port 8000
```

Open:

```text
http://127.0.0.1:8000
```

### Phase 1 Checks

Run the full Phase 1 validation workflow:

```powershell
cd phase1_map
npm run check:full
```

This script:

1. Regenerates app-ready data with `scripts/export_app_data.py`.
2. Runs the Python test suite with `pytest`.
3. Builds the Vite frontend.

### Phase 1 Windows Package

Build the click-to-run Windows map package:

```powershell
cd phase1_map
npm run release:windows
```

The package is generated under `phase1_map/release/`. The intended user workflow is to unzip the package and double-click `Run_INDOT_Map.bat`.

## Running Phase 2: Editor Application

Phase 2 is the local editor workflow. It is meant for editing or reviewing project data before producing a refreshed map package.

```powershell
cd phase2_editor
```

Run the editor backend:

```powershell
..\.venv\Scripts\python.exe -m uvicorn backend.editor_api.main:app --reload --host 127.0.0.1 --port 8001
```

Run the editor frontend during development:

```powershell
npm exec vite -- --config frontend/vite.config.js --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174
```

The editor backend also serves a fallback page at:

```text
http://127.0.0.1:8001
```

### Phase 2 Backend Capabilities

The editor API currently supports:

- Health checks
- Native folder browsing on Windows through `tkinter`
- Import inspection for INDOT shapefile project folders
- Project import into an in-memory editing session
- Session save, load, reset, and retrieval
- Field configuration review and updates
- Feature-level record edits and edit reverts
- Validation of the current session
- Preview map generation
- Export ZIP generation and download

Important Phase 2 API endpoints:

- `GET /health`
- `POST /api/browse-folder`
- `POST /api/import/inspect`
- `POST /api/import`
- `GET /api/session`
- `POST /api/session/save`
- `POST /api/session/load`
- `POST /api/session/reset`
- `GET /api/fields/{layer_name}`
- `PUT /api/fields/{layer_name}`
- `GET /api/layers/{layer_name}`
- `PATCH /api/layers/{layer_name}/{feature_id}`
- `POST /api/validate`
- `POST /api/preview/generate`
- `GET /preview/`
- `POST /api/export`
- `GET /api/export/download/{token}`

### Phase 2 Checks

Run the full editor validation workflow:

```powershell
cd phase2_editor
.\scripts\check_editor.ps1
```

This script:

1. Runs editor backend tests from `phase2_editor/tests`.
2. Builds the editor frontend.
3. Builds the static map preview app.

You can also run the frontend builds directly:

```powershell
npm run check
```

### Phase 2 Windows Package

Build the editor package:

```powershell
cd phase2_editor
.\scripts\build_editor_package.ps1
```

The script creates:

- `phase2_editor/release/INDOT_Solar_Editor_Windows/`
- `phase2_editor/release/INDOT_Solar_Editor_Windows.zip`

The package includes launcher batch files, the editor backend, built frontend assets, built preview map assets, the shared Python environment, and the Phase 1 field configuration.

## Repository Structure

```text
.
|-- README.md
|-- phase1_map/
|   |-- app/api/
|   |-- config/
|   |-- data/processed/
|   |-- docs/
|   |-- packaging/
|   |-- r_scripts/
|   |-- release_assets/
|   |-- scripts/
|   |-- src/
|   |-- tests/
|   |-- Dockerfile
|   |-- docker-compose.yml
|   |-- package.json
|   |-- requirements.txt
|   `-- vite.config.js
`-- phase2_editor/
    |-- backend/editor_api/
    |-- docs/
    |-- frontend/
    |-- map_app/
    |-- packaging/
    |-- scripts/
    |-- tests/
    `-- package.json
```

### Root

- `README.md` is this top-level guide.
- `.gitignore` excludes virtual environments, frontend build folders, generated release packages, local GIS source files, and large local planning artifacts.

### `phase1_map/`

- `app/api/main.py` defines the FastAPI app for serving the processed map data and, after a frontend build, the static web app.
- `config/field_mapping.json` controls how source fields are interpreted and exported.
- `data/processed/` contains browser-ready GeoJSON files and `manifest.json`.
- `docs/` contains deployment, testing, data contract, inventory, Windows release, and technical summary notes.
- `packaging/` contains helper code used by the Windows map package.
- `r_scripts/` contains R-based shapefile inspection tooling.
- `release_assets/` contains Windows launcher files and user instructions for the Phase 1 package.
- `scripts/` contains export, inspection, validation, comparison, presentation-conversion, and Windows release automation scripts.
- `src/` contains the React/Leaflet frontend.
- `tests/` contains API and export tests.
- `Dockerfile` and `docker-compose.yml` support containerized running.

### `phase1_map/src/`

- `App.jsx` wires the map application together.
- `components/` contains the header, sidebar, layer directory, map view, search box, and stats grid.
- `config/mapConfig.js` defines map constants, layer metadata, colors, basemaps, and zoom behavior.
- `map/mapStyles.js` defines Leaflet feature styles and popup behavior.
- `services/api.js` centralizes API calls.
- `utils/` contains feature, formatting, and search helpers.
- `styles.css` contains the Phase 1 UI styling.

### `phase2_editor/`

- `backend/editor_api/main.py` defines the editor FastAPI app.
- `backend/editor_api/import_service.py` inspects INDOT shapefile project folders.
- `backend/editor_api/session_store.py` manages imported layers, field settings, edits, saves, loads, resets, and session state.
- `backend/editor_api/validation_service.py` validates the current editing session.
- `backend/editor_api/export_service.py` generates preview data and export ZIP files.
- `docs/indot_editor_implementation_plan.md` documents the editor architecture and implementation plan.
- `frontend/` contains the React editor wizard.
- `map_app/` contains the static map app used for preview/export.
- `packaging/` contains Windows launcher and package support files.
- `scripts/check_editor.ps1` runs tests and frontend builds.
- `scripts/build_editor_package.ps1` creates the editor Windows package.
- `tests/` contains editor backend tests.

## Data Flow

### Phase 1 Map Flow

1. Source INDOT shapefiles are kept locally and are not committed.
2. `phase1_map/scripts/export_app_data.py` reads the configured source layers.
3. Field rules from `phase1_map/config/field_mapping.json` are applied.
4. Cleaned GeoJSON is written to `phase1_map/data/processed/`.
5. `phase1_map/app/api/main.py` serves the manifest, stats, and layer GeoJSON.
6. The React/Leaflet app loads the API data and renders the map.

### Phase 2 Editor Flow

1. The user selects or enters an INDOT shapefile project folder.
2. The editor backend inspects the folder and identifies required layer inputs.
3. The project is imported into a session.
4. The user reviews field mappings and edits layer records.
5. The backend validates the current session.
6. The backend generates preview map data.
7. The editor exports a package that can be shared or used to refresh the map.

## Data and Git Policy

Large or local GIS source files are intentionally ignored by Git. This includes shapefiles, geodatabases, ArcGIS project files, generated release folders, virtual environments, build output, and local-only planning files.

Committed data under `phase1_map/data/processed/` is the browser-ready dataset used by the map app. If source shapefiles change, regenerate the processed data before testing or packaging.

## Testing Summary

Phase 1:

```powershell
cd phase1_map
npm run check:full
```

Phase 2:

```powershell
cd phase2_editor
.\scripts\check_editor.ps1
```

Python tests only:

```powershell
cd phase1_map
..\.venv\Scripts\python.exe -m pytest -q
```

```powershell
cd phase2_editor
..\.venv\Scripts\python.exe -m pytest -q tests
```

Frontend builds only:

```powershell
cd phase1_map
npm run build
```

```powershell
cd phase2_editor
npm run check
```

## Docker

Phase 1 includes Docker files:

```powershell
cd phase1_map
docker compose up --build
```

The Docker setup is for the Phase 1 map app. Phase 2 packaging currently uses the local Python and Node toolchain instead.

## Common Troubleshooting

### `Could not find project Python`

Create a `.venv` either at the repository root or inside the relevant phase folder, then install `phase1_map/requirements.txt`.

### `ModuleNotFoundError` for GIS or FastAPI packages

Install the Python requirements:

```powershell
.\.venv\Scripts\python.exe -m pip install -r phase1_map\requirements.txt
```

### `npm` commands fail

Run `npm install` inside the phase folder you are working in:

```powershell
cd phase1_map
npm install
```

or:

```powershell
cd phase2_editor
npm install
```

### The Phase 1 API says `missing_data`

Check that `phase1_map/data/processed/manifest.json` exists. If needed, rerun:

```powershell
cd phase1_map
..\.venv\Scripts\python.exe scripts\export_app_data.py
```

### The Phase 2 editor cannot preview a map

Generate a preview first through `POST /api/preview/generate` or through the editor UI. The preview route reads generated preview files managed by `ExportManager`.

### Native folder browsing does not work

The `/api/browse-folder` route uses Python `tkinter`. If `tkinter` is unavailable, enter the folder path manually through the UI or API.

## Development Notes

- Keep Phase 1 map changes inside `phase1_map/`.
- Keep editor changes inside `phase2_editor/`.
- Reuse `phase1_map/config/field_mapping.json` as the shared source of field mapping truth.
- Run the relevant check script before pushing changes.
- Do not commit local source shapefiles, generated release ZIPs, virtual environments, `node_modules`, or build folders.

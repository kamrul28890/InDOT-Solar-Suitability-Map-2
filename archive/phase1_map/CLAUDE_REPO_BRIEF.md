# Claude Repository Brief: INDOT Solar Suitability Map

This document is a compact handoff for understanding the `D:\My Projects\InDOT` repository without reading the entire codebase. It explains what the project does, how data moves through it, which modules are working, what scripts are used, and how the separate shapefile-editing GUI relates to the main app.

## 1. Project Purpose

The main repository is a browser-based INDOT solar suitability map for SPR 4862. It takes local INDOT shapefile datasets, converts them into browser-ready GeoJSON, serves those files through a small FastAPI backend, and renders them in a React/Leaflet web map.

The core workflow is:

1. Read local shapefiles.
2. Normalize fields and repair invalid output geometry.
3. Export app-ready GeoJSON layers into `data/processed/`.
4. Serve those generated files through FastAPI.
5. Display searchable/filterable map layers in React/Leaflet.
6. Optionally package the whole app as a professor-friendly Windows ZIP.

The main app is intentionally read-only from the user interface. It does not modify shapefiles or edit map records.

## 2. Important Repositories And Separation

### Main map app

Path:

```text
D:\My Projects\InDOT
```

This is the pure map/data/API codebase. Keep it focused on export, API serving, frontend visualization, tests, docs, and release packaging.

### Separate shapefile editor

Path:

```text
D:\My Projects\InDOT-Shapefile-Editor
```

This is a sibling project created separately so shapefile modification does not pollute the main map app. It has its own FastAPI backend and React/Vite GUI. It imports the three shapefile folders, lets users edit attributes and geometry, validates the edits, and writes a standalone generated map folder under its own `outputs/` directory.

Do not merge editor routes or editing UI into the main `InDOT` app unless the project direction changes explicitly.

## 3. Main Repository Layout

```text
app/api/
  FastAPI backend for health, manifest, stats, layer GeoJSON, and static frontend serving.

config/
  Data-layer and field mapping configuration.

data/processed/
  Generated browser-ready GeoJSON and manifest files.

docs/
  Existing technical, data-contract, testing, deployment, and release docs.

scripts/
  Data export, shapefile inspection, project checks, and Windows release automation.

src/
  React/Leaflet frontend.

tests/
  Pytest tests for exporter helpers, generated app data, and API routes.

release_assets/
  Batch files and user-facing launcher notes for the Windows release package.

packaging/
  Python launcher used by PyInstaller for the Windows release executable.
```

## 4. Source Data And Generated Data

The current source shapefile folders in the repo are:

```text
All_Candidate_Sites/
Facility_Scored/
ROW_Scored/
```

The app expects these shapefile paths:

```text
All_Candidate_Sites/All_Candidate_Sites_Final.shp
Facility_Scored/solar_potential_scored_indotfacility.shp
ROW_Scored/solar_potential_scored_interchange.shp
```

Each shapefile set includes at least:

```text
.shp
.dbf
.shx
.prj
```

The generated app-ready outputs are:

```text
data/processed/all_candidate_sites.geojson
data/processed/facility_scored.geojson
data/processed/row_scored.geojson
data/processed/manifest.json
```

Known feature counts:

```text
all_candidate_sites: 104
facility_scored: 58
row_scored: 45
total: 207
```

Known fixed source geometry counts in the current data:

```text
all_candidate_sites: 1
facility_scored: 0
row_scored: 1
total fixed_geometries: 2
```

## 5. Data Contract

The data export is controlled by:

```text
config/field_mapping.json
```

It defines:

- Project metadata.
- Dataset names, titles, source shapefiles, output file names, and layer types.
- Identity fields.
- Display fields.
- Score fields.
- Land-cover fields.

Current layer names are fixed and used throughout the frontend/API:

```text
all_candidate_sites
facility_scored
row_scored
```

Current score fields are:

```text
sol_s
slp_s
trn_s
evp_s
dem_s
fld_s
lc_s
```

Important generated/derived fields:

```text
dataset
layer_title
layer_type
center_longitude
center_latitude
source_latitude
source_longitude
land_cover_sum
source_geometry_valid
```

Geometry rules:

- Output geometry is reprojected to `EPSG:4326`.
- Invalid source geometries are repaired in generated output using Shapely `make_valid()`.
- The original shapefiles are not modified by the exporter.

Coordinate rules:

- Source `Lat` and `Long` are preserved as `source_latitude` and `source_longitude`.
- They are not trusted for map placement because they contain placeholder zero values.
- The app uses `center_latitude` and `center_longitude`, derived from representative points.

## 6. Data Export Module

Primary file:

```text
scripts/export_app_data.py
```

Main responsibilities:

- Load `config/field_mapping.json`.
- Build dataset configs from the config file.
- Read shapefiles with GeoPandas.
- Verify source files exist.
- Verify CRS exists.
- Add `source_geometry_valid`.
- Repair source geometries for output with `make_valid()`.
- Keep only configured display, score, land-cover, and provenance fields.
- Add layer metadata.
- Derive representative-point center coordinates.
- Preserve source `Lat`/`Long` as source coordinate fields.
- Compute `land_cover_sum` if land-cover fields exist.
- Clean pandas/numpy values into JSON-safe Python values.
- Reproject output to `EPSG:4326`.
- Write the three GeoJSON layer files.
- Write `manifest.json` with counts, bounds, geometry-repair counts, and available score fields.

Run it with:

```powershell
.venv\Scripts\python.exe scripts\export_app_data.py
```

## 7. Backend API

Primary file:

```text
app/api/main.py
```

The backend is file-backed. It reads generated JSON from:

```text
data/processed/
```

Important environment/config behavior:

- `INDOT_APP_ROOT` can override the app root.
- Default app root is the repository root.
- `DATA_DIR` is `data/processed`.
- `DIST_DIR` is `dist`.
- If `dist/` exists, FastAPI mounts it as the static frontend.

Routes:

```text
GET  /health
GET  /api/manifest
GET  /api/stats
GET  /api/layers/{layer_name}
POST /api/cache/clear
```

Route behavior:

- `/health` reports whether `manifest.json` exists and lists known layers.
- `/api/manifest` returns `data/processed/manifest.json`.
- `/api/stats` returns layer count, total feature count, fixed geometry count, and layer stats.
- `/api/layers/{layer_name}` returns the matching GeoJSON layer.
- `/api/cache/clear` clears the in-memory manifest cache after regeneration.

The API does not edit data. It only reads generated files.

## 8. Frontend App

Frontend entry:

```text
src/main.jsx
src/App.jsx
```

Main responsibilities in `src/App.jsx`:

- Load manifest, stats, and layer GeoJSON from the API.
- Track enabled/disabled layers.
- Track search query.
- Track selected site.
- Track current map zoom.
- Track light/dark theme.
- Track selected basemap in local storage.
- Filter visible features based on search.
- Decide whether to show overview dots or detailed polygons.

API loading helper:

```text
src/services/api.js
```

This loads:

```text
/api/manifest
/api/stats
/api/layers/{layer_name}
```

## 9. Frontend Components

Important components:

```text
src/components/AppHeader.jsx
src/components/Sidebar.jsx
src/components/SearchBox.jsx
src/components/LayerDirectory.jsx
src/components/StatsGrid.jsx
src/components/MapView.jsx
```

`Sidebar.jsx` composes:

- App header.
- Basemap/theme controls through `AppHeader`.
- Search input.
- Layer directory/tree.
- Stats panel.
- Reload button.
- API error message.

`MapView.jsx` handles:

- Leaflet map container.
- Basemap tile layer.
- Optional overlay tile layer.
- Selected-site fly-to behavior.
- Zoom state updates.
- Overview mode using `CircleMarker`.
- Detail mode using `GeoJSON`.
- Popup content for dots.

Current map behavior:

- Low zoom shows blue overview dots.
- At or above `DETAIL_ZOOM`, it shows detailed polygon GeoJSON.
- The settled `DETAIL_ZOOM` value is `14`.
- `MIN_ZOOM` must remain compatible with the detail zoom threshold.

## 10. Frontend Utilities

Important utility files:

```text
src/utils/features.js
src/utils/search.js
src/utils/format.js
src/map/mapStyles.js
src/config/mapConfig.js
```

`src/utils/search.js`:

- Builds a search blob from all primitive feature properties.
- Normalizes accents/case.
- Also builds compact strings so partial searches can match through punctuation/spaces.
- Groups features by layer and subgroup for the sidebar directory.

`src/utils/features.js`:

- Provides feature keys.
- Gets display labels.
- Gets feature center coordinates.

`src/map/mapStyles.js`:

- Defines marker style.
- Defines polygon style.
- Binds popup content for detailed GeoJSON features.

`src/config/mapConfig.js`:

- Defines initial map center/zoom.
- Defines `MIN_ZOOM`.
- Defines `DETAIL_ZOOM`.
- Defines basemap layers.
- Defines local-storage key for basemap selection.

## 11. Scripts And Commands

### Install dependencies

```powershell
npm install
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Export generated app data

```powershell
.venv\Scripts\python.exe scripts\export_app_data.py
```

### Run backend API

```powershell
.venv\Scripts\python.exe -m uvicorn app.api.main:app --reload --host 127.0.0.1 --port 8000
```

Useful URLs:

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/api/manifest
http://127.0.0.1:8000/api/stats
http://127.0.0.1:8000/api/layers/facility_scored
```

### Run frontend dev server

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

### Build frontend

```powershell
npm run build
```

### Full validation gate

```powershell
npm run check:full
```

This runs:

1. `scripts/export_app_data.py`
2. `pytest -q`
3. `npm run build`

### Windows release package

```powershell
npm run release:windows
```

This script:

1. Runs the full validation gate.
2. Ensures PyInstaller is installed.
3. Cleans old release/build artifacts.
4. Builds a server executable from `packaging/run_indot_map.py`.
5. Copies `dist/`, `data/`, release launcher assets, and the server executable.
6. Creates:

```text
release/INDOT_Solar_Map_Windows.zip
```

The recipient unzips it and runs:

```text
Run_INDOT_Map.bat
```

## 12. Tests

Test files:

```text
tests/test_export_helpers.py
tests/test_export_app_data.py
tests/test_api.py
```

`test_export_helpers.py` checks:

- Representative-point center derivation.
- Normalized properties include scores and centers.
- No old aggregate `score_mean` fields are emitted.
- Stats count records and fixed geometries.

`test_export_app_data.py` checks:

- Three expected layers are written.
- Output files exist.
- Output type is `FeatureCollection`.
- Feature count matches manifest records.
- Geometry type is `Polygon` or `MultiPolygon`.
- Center coordinate fields exist.
- Known invalid geometry repair counts are correct.

`test_api.py` checks:

- Health reports expected layers.
- Manifest and stats agree.
- Total feature count is `207`.
- Total fixed geometry count is `2`.
- Facility layer endpoint returns `58` features.
- Unknown layer returns `404`.

## 13. What Is Working Now

Working modules:

- Shapefile-to-GeoJSON exporter.
- Geometry repair for generated output.
- Manifest generation.
- FastAPI file-backed API.
- API cache clearing.
- React/Leaflet map.
- Layer toggles.
- Broad property search.
- Sidebar grouping/tree.
- Basemap picker.
- Light/dark theme toggle.
- Overview dot rendering below detail zoom.
- Detailed polygon rendering at/above detail zoom.
- Popups.
- Full project check command.
- Windows release ZIP generation workflow.

Known current data facts:

- Source CRS is `EPSG:26916`.
- Output CRS is `EPSG:4326`.
- Source `Lat`/`Long` are placeholders and should not drive map placement.
- The app depends on derived representative-point centers.

## 14. Things To Avoid

Do not reintroduce old aggregate score fields:

```text
score_mean
score_mean_min
score_mean_max
```

Those were intentionally removed from exporter/API/UI contracts. The individual score fields remain.

Do not modify source shapefiles in the main map app.

Do not add shapefile editing routes into `app/api/main.py` unless explicitly asked. Editing belongs in the separate `InDOT-Shapefile-Editor` project.

Do not trust `Lat` and `Long` for map coordinates.

Do not change `DETAIL_ZOOM` without checking `MIN_ZOOM` and the overview/detailed rendering transition.

## 15. Separate Shapefile Editor Summary

Sibling path:

```text
D:\My Projects\InDOT-Shapefile-Editor
```

Purpose:

- A separate browser GUI for modifying shapefile-derived data.
- Keeps the main `InDOT` map repo pure.
- Never modifies the original shapefiles.
- Writes standalone generated map folders under its own `outputs/`.

Editor backend:

```text
editor_backend/main.py
editor_backend/service.py
editor_backend/config.py
editor_backend/schemas.py
```

Editor frontend:

```text
src/App.jsx
src/components/AttributeTable.jsx
src/components/EditorMap.jsx
```

Editor API routes:

```text
GET   /health
POST  /api/import
GET   /api/session/{session_id}/schema
POST  /api/session/{session_id}/fields
GET   /api/session/{session_id}/records/{layer_name}
PATCH /api/session/{session_id}/records/{layer_name}/{record_id}
PATCH /api/session/{session_id}/geometry/{layer_name}/{record_id}
POST  /api/session/{session_id}/validate
POST  /api/session/{session_id}/generate-map
```

Editor behavior:

- User chooses the parent folder containing the three shapefile folders.
- Backend detects required shapefile components.
- Backend normalizes layers to `EPSG:4326`.
- UI displays records and editable fields.
- Attribute edits are type-checked.
- Score fields must stay between `0` and `1`.
- Geometry edits must remain `Polygon` or `MultiPolygon`.
- Invalid geometry is repaired with Shapely if possible.
- Generated output includes:

```text
index.html
Run_Modified_Map.bat
metadata.json
data/manifest.json
edited GeoJSON layers
```

Editor commands:

```powershell
cd "D:\My Projects\InDOT-Shapefile-Editor"
npm run api
npm run dev
```

Editor URL:

```text
http://127.0.0.1:5174
```

Editor checks:

```powershell
npm run build
.\.venv\Scripts\python.exe -m pytest
```

## 16. Suggested Mental Model For Future Work

Treat the project as two layers:

1. Main map app: source shapefiles -> generated GeoJSON -> API -> React map.
2. Separate editor: source shapefiles -> editable session -> validated edited GeoJSON -> standalone generated map.

The main app is the stable visualization and release product. The editor is an auxiliary tool for preparing modified map outputs.

When changing behavior, first identify which layer owns it:

- Field inclusion, CRS conversion, center derivation, geometry repair: exporter/data contract.
- API route behavior: `app/api/main.py`.
- Search/grouping/filtering: `src/utils/search.js`.
- Map rendering/zoom behavior: `src/components/MapView.jsx` and `src/config/mapConfig.js`.
- Popup styling/content: `src/map/mapStyles.js`.
- Release packaging: `scripts/build_windows_release.ps1`.
- Editing records/geometry: separate `InDOT-Shapefile-Editor`, not the main app.

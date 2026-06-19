---
name: run-indot
description: Run, start, build, screenshot, or smoke-test the INDOT Solar Suitability workspace. Covers Phase 1 (map viewer) and Phase 2 (shapefile editor). Use this skill whenever asked to run, launch, verify, screenshot, or test either phase of the INDOT app.
---

# INDOT Solar Suitability – Run Skill

Two web apps in one repo. Both are FastAPI (Python) backends + React/Vite frontends.

- **Phase 1** – read-only map viewer. Backend: port 8000. Frontend dev: port 5173.
- **Phase 2** – shapefile editor workflow. Backend: port 8010. Frontend dev: port 5174.

The interaction driver is `.claude/skills/run-indot/driver.mjs`. It uses Playwright
(from the npx cache — no local install). Run it from the repo root.

---

## Prerequisites

- Python 3.10+ (`.venv` at the repo root already exists)
- Node 18+ and npm (both available)
- Playwright Chromium browser installed once:

```
npx playwright install chromium
```

npm deps for each phase (run once per clean checkout):

```
cd phase1_map && npm install
cd ../phase2_editor && npm install
```

---

## Phase 1 – Solar Suitability Map

### Start backend

```
cd phase1_map
../.venv/Scripts/python.exe -m uvicorn app.api.main:app --host 127.0.0.1 --port 8000
```

Check: `curl http://127.0.0.1:8000/health`
Expected: `{"status":"ok","data_dir":"...","layers":["all_candidate_sites","facility_scored","row_scored"]}`

### Start frontend (dev mode)

```
cd phase1_map
npm run dev
```

Serves at `http://127.0.0.1:5173`.

### Agent path – driver

Run API smoke tests (no browser needed):

```
node .claude/skills/run-indot/driver.mjs smoke phase1
```

Take a screenshot of the running map:

```
node .claude/skills/run-indot/driver.mjs screenshot phase1 [out.png]
```

Default output path: `phase1_screenshot.png` in the repo root.

Both commands require the backend (`port 8000`) and frontend (`port 5173`) to be running.

### API endpoints verified

```
GET  /health                         → {status, data_dir, layers[]}
GET  /api/manifest                   → project info + layer summaries
GET  /api/stats                      → {feature_count, layer_count, fixed_geometries}
GET  /api/layers/{layer_name}        → GeoJSON FeatureCollection
     layer_name: all_candidate_sites | facility_scored | row_scored
POST /api/cache/clear
```

### Production build (single server, port 8000)

```
cd phase1_map
npm run build
../.venv/Scripts/python.exe -m uvicorn app.api.main:app --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000`.

---

## Phase 2 – Solar Suitability Map Editor

### Start backend

```
cd phase2_editor
../.venv/Scripts/python.exe -m uvicorn editor_backend.main:app --host 127.0.0.1 --port 8010
```

Check: `curl http://127.0.0.1:8010/health`
Expected: `{"status":"ok"}`

### Start frontend (dev mode)

```
cd phase2_editor
npm run dev
```

Serves at `http://127.0.0.1:5174`.

### Agent path – driver

API smoke test:

```
node .claude/skills/run-indot/driver.mjs smoke phase2
```

Screenshot:

```
node .claude/skills/run-indot/driver.mjs screenshot phase2 [out.png]
```

### API endpoints verified

All Phase 2 session routes include a `{session_id}` path segment.

```
GET  /health
GET  /api/autosave                                  → {available, session_id, source_folder, last_saved_at}
POST /api/autosave/resume                           → full session object
POST /api/import                                    body: {"folder_path": "..."}
GET  /api/session/{session_id}
POST /api/session/{session_id}/save                 body: {"file_path": "..."}
GET  /api/fields/{session_id}
PUT  /api/fields/{session_id}/{layer_name}
POST /api/fields/{session_id}/reset
GET  /api/layers/{session_id}/{layer_name}
PATCH /api/layers/{session_id}/{layer_name}/{feature_id}
POST /api/validate/{session_id}
POST /api/preview/generate/{session_id}
POST /api/export/{session_id}
```

---

## Running full test suites

Phase 1:

```
cd phase1_map
npm run check:full
```

Phase 2:

```
cd phase2_editor
npm run check
```

Python tests only:

```
cd phase1_map && ../.venv/Scripts/python.exe -m pytest -q
cd phase2_editor && ../.venv/Scripts/python.exe -m pytest -q tests
```

---

## Gotchas

- **Phase 2 session_id in every route.** Unlike Phase 1, Phase 2 URLs are all
  `/api/.../{session_id}/...`. Call `GET /api/autosave` to find the active session_id,
  or `POST /api/autosave/resume` to load it.

- **Playwright in npx cache, not local deps.** The driver imports playwright from
  `C:/Users/Scarecrow/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs`.
  If the npx cache hash ever changes (playwright version upgrade), update that path
  in `driver.mjs`. Run `npm cache ls playwright` and look in `_npx/` for the new hash.

- **`npx playwright install chromium` warning about missing deps.** It complains
  about no local playwright dep, but it still installs the browsers correctly. Safe to ignore.

- **Phase 2 `/api/browse-folder` uses tkinter.** The browse-folder endpoint opens a
  native Windows folder picker via Python tkinter. It will hang or error in headless
  environments. Enter the folder path manually via the text field or POST directly to
  `/api/import` with `{"folder_path": "..."}`.

- **Port 8001 mentioned in README is wrong.** Phase 2 backend runs on 8010, not 8001.
  The `npm run api` script in `phase2_editor/package.json` confirms port 8010.

---

## Troubleshooting

**`ModuleNotFoundError: editor_backend`** when starting Phase 2 backend
→ Run uvicorn from inside `phase2_editor/`, not repo root:
  `cd phase2_editor && ../.venv/Scripts/python.exe -m uvicorn editor_backend.main:app ...`

**Playwright: `Executable doesn't exist`**
→ Run: `npx playwright install chromium`

**Phase 1 API returns `missing_data` on any layer route**
→ `data/processed/manifest.json` is missing. Regenerate:
  `cd phase1_map && ../.venv/Scripts/python.exe scripts/export_app_data.py`
  (Requires local source shapefiles – see `phase1_map/data/` README.)

**Vite fails with `Cannot find module` on first run**
→ Run `npm install` inside the relevant phase folder.

# INDOT Solar Suitability Map — Phase 2 Editor: Implementation Plan

**Document type:** Architecture and design specification  
**Audience:** Developer(s) building the application  
**Scope:** Full specification for a self-contained Windows application that allows non-programmer GIS analysts to review, correct, and publish the INDOT solar suitability map without touching a terminal.

---

## 1. Project Overview

### What this project is

A purpose-built Windows application that replaces the manual Phase 1 pipeline. It guides a GIS analyst through a five-stage wizard: import the three source shapefiles, configure display fields, review and edit attribute values, validate the result, preview the final map, and export a deployment-ready ZIP. The analyst uploads that ZIP to a public web server. Visitors to that URL see a fully interactive map identical in design to the Phase 1 product.

### What the analyst never has to touch

- A terminal or command prompt
- Python scripts
- JSON configuration files
- Raw GeoJSON output
- The source shapefiles (they are never modified)

### What the final deployed map looks like

The deployed map is functionally identical to the existing Phase 1 product:

- Blue dot overview markers at low zoom levels
- Detailed polygon rendering at zoom level 14 and above
- Popup attribute tables on feature click
- Multiple basemap choices (OpenStreetMap, satellite, etc.)
- Layer toggles for all three datasets
- Broad text search across all feature properties
- Light and dark theme toggle
- The map loads basemap tiles from public CDNs; an internet connection is required for visitors

---

## 2. Guiding Principles

These principles should drive every implementation decision.

**Never lose work.** Every edit is auto-saved to a temp session file. Closing the browser tab does not destroy progress. The analyst can resume by reopening the app.

**Original values are always recoverable.** No edit overwrites source data. All changes are stored as a delta layer on top of the original shapefile values. Reverting any cell to its original value is one click.

**Source shapefiles are never modified.** The shapefiles on disk remain exactly as loaded. The export pipeline applies edits at generation time from the session delta, then writes to output files.

**One primary action per stage.** Each screen has one obvious next step. Secondary actions (save, go back, undo) are present but not dominant.

**Plain language everywhere.** Field codes like `sol_s` are replaced by configured display labels like "Solar Score." Error messages say what is wrong and how to fix it. No Python tracebacks are shown to the user.

**The app is the authority on what is valid.** Validation rules are enforced uniformly by the backend; the frontend surfaces them immediately. The analyst never discovers an error at export time that was not already flagged during editing.

---

## 3. Relationship to Phase 1

Phase 2 absorbs and replaces Phase 1 entirely. The analyst no longer runs `export_app_data.py` manually or touches the FastAPI backend configuration. However, the core processing logic from Phase 1 is reused, not rewritten.

| Phase 1 component | Fate in Phase 2 |
|---|---|
| `scripts/export_app_data.py` | Core logic absorbed into Phase 2 backend export pipeline |
| `config/field_mapping.json` | Default field configuration seeded from this file; user can override in Stage 2 |
| `app/api/main.py` (read-only API) | Replaced by the Phase 2 editor backend |
| `data/processed/` (generated files) | Replaced by the session's in-memory data and temp export directory |
| React/Leaflet frontend (`src/`) | Becomes the Map App, rebuilt to fetch from relative static paths instead of API routes |
| Windows ZIP release approach | Kept; Phase 2 uses the same PyInstaller + batch launcher pattern |
| Existing `InDOT-Shapefile-Editor` sibling project | Phase 2 supersedes it; that project can be archived |

The geometry repair logic (`make_valid()`), CRS reprojection to EPSG:4326, representative-point center coordinate derivation, and manifest generation are all reused verbatim inside Phase 2's backend export pipeline.

---

## 4. System Architecture Overview

Phase 2 is a local web application delivered as a Windows executable. It consists of three logical parts that work together.

### Part 1: Editor Backend (Python / FastAPI)

Runs locally on the analyst's machine. Responsible for all file system access, shapefile processing, session management, validation, and export generation. The analyst never sees this component directly; it runs silently in the background.

### Part 2: Editor Frontend (React)

The wizard interface the analyst interacts with in their browser. Communicates with the Editor Backend over a local HTTP connection. Contains no file system access itself.

### Part 3: Map App (React / Leaflet — static)

The final deliverable that gets bundled into the export ZIP. This is a separate build of the Leaflet map, modified from Phase 1 to fetch data from relative static paths instead of a live API. It is also embedded inside the Editor Frontend during the Preview stage, served temporarily by the Editor Backend with live edited data.

### How the three parts relate

```
Analyst double-clicks Run_Editor.bat
        |
        v
Editor Backend starts (FastAPI, localhost:PORT)
        |
        |-- Serves Editor Frontend at  http://localhost:PORT/
        |-- Serves preview map at      http://localhost:PORT/preview/
        |-- Handles editor API at      http://localhost:PORT/api/
        |
        v
Default browser opens at http://localhost:PORT/
Analyst uses the five-stage wizard

        When analyst reaches Preview stage:
        Backend writes edited GeoJSON to a temp directory
        Backend serves Map App + data at /preview/
        Browser navigates to /preview/ (or opens it in an iframe)

        When analyst clicks Export:
        Backend zips [Map App build + processed GeoJSON + manifest]
        Analyst downloads the ZIP
        Analyst uploads ZIP contents to public web server
```

---

## 5. Application Delivery: Windows Package

The delivery format follows the exact same pattern as the existing Phase 1 Windows ZIP.

### Contents of the Windows package

```
INDOT_Solar_Editor_Windows.zip
├── Run_Editor.bat              — Analyst double-clicks this to start
├── editor_server.exe           — PyInstaller bundle of Editor Backend + Editor Frontend build
├── INSTRUCTIONS.txt            — Plain-language setup and usage guide (one page)
└── (no other files required)
```

### What `Run_Editor.bat` does

1. Launches `editor_server.exe`
2. Waits for the server to confirm it is ready (polls the health endpoint)
3. Opens the default browser to `http://localhost:PORT`

The port is chosen dynamically from a range of safe local ports to avoid conflicts. The chosen port is displayed in the system tray or a small console window so the analyst knows where to navigate if the browser does not open automatically.

### What `editor_server.exe` contains (PyInstaller bundle)

- The complete Python runtime
- All Python dependencies (FastAPI, Uvicorn, GeoPandas, Shapely, Fiona, NumPy, Pandas)
- The built Editor Frontend (static HTML/JS/CSS)
- The built Map App (static HTML/JS/CSS, used for preview and bundled into exports)

### Shutdown

A small tray icon or console window allows the analyst to shut down the server cleanly. Alternatively, closing the console window terminates the process.

---

## 6. User Workflow: Five-Stage Wizard

The wizard is a single-page application with a persistent progress bar across the top showing the five stages. Navigation between stages uses Back and Continue buttons. The analyst can always go back to any completed stage. No data is irreversibly committed until the export is downloaded.

---

### Stage 1: Import

**Purpose:** Load the three source shapefiles and confirm they are valid.

**What the analyst sees:**

A clean screen with a large folder selection area. Two options are presented:

- A "Browse" button that opens a native Windows folder picker dialog (triggered via the backend, not the browser's file API, since the app runs locally and can invoke native dialogs)
- A text field where they can paste a folder path directly

After selecting a folder, the backend scans for the three required shapefile sets:

```
<selected_folder>/All_Candidate_Sites/All_Candidate_Sites_Final.shp
<selected_folder>/Facility_Scored/solar_potential_scored_indotfacility.shp
<selected_folder>/ROW_Scored/solar_potential_scored_interchange.shp
```

The UI immediately shows a status card for each layer:

- Green checkmark: found and readable, shows feature count and CRS
- Yellow warning: found but has geometry issues (will be auto-repaired at export)
- Red error: missing, unreadable, or incompatible format

If all three layers show green or yellow, the Continue button activates. A red layer blocks progression with a clear explanation of what file is missing or what is wrong.

**Notes for implementation:**

- The native folder picker is invoked via a dedicated backend route. The backend calls Python's `tkinter.filedialog.askdirectory()`, which opens a real Windows dialog, then returns the selected path string to the frontend via a normal JSON response.
- After a successful import, the session is initialized with the source folder path and all original feature data is loaded into in-memory structures.
- If an auto-save file from a previous session exists, the app offers to resume it at the top of this screen before the analyst selects a new folder.

---

### Stage 2: Field Configuration

**Purpose:** Let the analyst control which fields appear in the final map and what they are called.

**What the analyst sees:**

Three tabs, one per layer. Each tab shows a table with one row per configured field:

| Visible | Field Code | Display Label | Type |
|---|---|---|---|
| ✓ | sol_s | Solar Score | Score (0–1) |
| ✓ | slp_s | Slope Score | Score (0–1) |
| ✓ | trn_s | Transportation Score | Score (0–1) |
| ☐ | dataset | (internal) | Text |
| ... | | | |

The analyst can:

- Toggle the "Visible" checkbox to include or exclude a field from map popups
- Edit the "Display Label" to set a human-readable name
- Reorder fields by drag-and-drop (this controls popup field order)

Score fields (those in the `sol_s`, `slp_s`, `trn_s`, `evp_s`, `dem_s`, `fld_s`, `lc_s` set) are pre-marked and their type constraint (0–1 numeric) is shown and non-editable. Internal/derived fields (`dataset`, `layer_title`, `center_latitude`, etc.) are pre-hidden and listed at the bottom with a note that they are used by the map but not shown in popups.

A "Reset to Defaults" button restores the configuration from the original `field_mapping.json` defaults.

**Notes for implementation:**

- This stage is pre-populated from `field_mapping.json` on first run. The analyst's choices are saved to the session file.
- If the analyst changes nothing here (common case), they click Continue and move on in seconds.
- Field visibility and labels configured here apply to both the popup display and the export GeoJSON output.

---

### Stage 3: Review and Edit

**Purpose:** The core editing stage. The analyst reviews all feature attributes and corrects errors.

**Layout:**

The screen is split horizontally into two panels.

**Left panel (approximately 65% width): Data table**

- A tab bar across the top switches between the three layers
- The table shows one row per feature and one column per field
- Only fields marked "Visible" in Stage 2 are shown as columns (internal fields are hidden)
- A row number column and a unique feature identifier column are always present and non-editable

**Right panel (approximately 35% width): Reference map**

- A small interactive Leaflet map
- All features for the currently selected layer are shown as muted polygons
- The currently selected table row is highlighted on the map in an accent color and the map zooms to it
- The map is display-only; no editing controls

**Editing mechanics:**

- Clicking a cell enters edit mode; a text input appears in place
- Pressing Enter or clicking away commits the edit
- Pressing Escape cancels the edit and restores the previous value
- Edited cells are highlighted with a subtle yellow/amber background
- Invalid cells (value fails type or range validation) are highlighted in red with a small error icon; hovering the icon shows a tooltip explaining the problem
- Hovering over any edited cell shows a tooltip with "Original: [original value] — Edited: [current value]"

**Toolbar (above the table):**

- Search/filter box: filters rows by any matching value across all visible columns
- "Show edited only" toggle: hides rows with no changes
- "Show errors only" toggle: hides rows with no validation errors
- Undo button: reverts the most recent single-cell edit
- Redo button
- "Revert selected row" button: restores all fields in the selected row to their original values
- Save Session button: saves the session JSON to a user-chosen file path
- Session auto-save indicator: "Auto-saved 42 seconds ago"

**Status bar (below the table):**

Shows per-layer and aggregate counts: total features, number of edited cells, number of validation errors.

**Validation that happens in real time during Stage 3:**

- Score fields must be numeric and in the range 0.0 to 1.0 inclusive
- Fields configured as numeric type must not contain non-numeric text
- Fields that are required (identity fields) must not be blank
- These rules fire on cell commit and update the error highlight immediately

**Notes for implementation:**

- For ~207 total features across three layers, no virtualization is required in the table. A simple rendered table performs fine at this scale.
- The reference map panel updates on row selection change (debounced to avoid excessive map redraws).
- Undo/redo operates on a per-session stack stored in memory. There is no arbitrary undo depth limit, but the stack is cleared when a new session is loaded.
- Auto-save writes to `%TEMP%\indot_editor_autosave.json` after every edit, with a debounce delay of 2 seconds to avoid excessive disk writes.

---

### Stage 4: Validate

**Purpose:** Surface all remaining issues before generating any output. Give the analyst a chance to fix them or consciously proceed.

**What the analyst sees:**

A summary screen with three metric cards at the top:

- Total edits made (cells changed from original)
- Warnings (issues that are unusual but not blocking)
- Errors (issues that must be resolved before export)

Below the cards, a filterable list of all issues:

| Layer | Feature ID | Field | Issue | Severity |
|---|---|---|---|---|
| facility_scored | FAC-012 | sol_s | Value 1.3 is outside the valid range 0–1 | Error |
| row_scored | ROW-007 | name | Value is unchanged from original placeholder text | Warning |

Clicking any row in this list navigates back to Stage 3 with that exact cell focused and selected.

**Progression rules:**

- If any errors exist: Continue button is disabled. A message says "Fix all errors to continue." The analyst must go back and resolve them.
- If only warnings exist: Continue button is enabled. A checkbox labeled "I have reviewed all warnings and want to proceed" must be checked first.
- If no issues: Continue button is immediately active with a success message.

**Warning types (non-blocking):**

- A name or label field appears to still contain placeholder or default text
- A score field is exactly 0.0 (may be valid, but unusual)
- A feature has no edits (informational, not actually a warning flag unless all features in a layer are untouched)

**Error types (blocking):**

- A score field contains a value outside 0–1
- A required identity field is blank
- A numeric field contains non-numeric text

---

### Stage 5: Preview and Export

**Purpose:** Let the analyst see the final map exactly as visitors will, confirm it is correct, then generate the deployment package.

**Preview sub-stage:**

When the analyst enters Stage 5, the backend:

1. Applies all session edits to the in-memory data
2. Runs the full export pipeline (CRS reprojection, geometry repair, center coordinate derivation, manifest generation)
3. Writes the processed output to a temporary directory
4. Begins serving the static Map App from that temp directory at `/preview/`

The analyst sees the fully interactive map, identical to what will be deployed. They can zoom, click features, toggle layers, switch basemaps, search, and interact with popups. All popup values reflect their edits.

A persistent "Back to Edit" button in the top-left corner returns them to Stage 3. A "Generate Export Package" button in the top-right corner is the primary action.

**Export sub-stage:**

After the analyst clicks "Generate Export Package":

1. A progress screen replaces the map
2. The backend assembles the final ZIP
3. A download link appears when complete
4. A second panel shows simple upload instructions (example: "Unzip and upload all files into your web server's public HTML folder. No additional configuration is needed.")

The export summary shown before downloading:

- Three layers, X total features
- Y fields configured for display
- Z cells edited from original values
- Session file name and timestamp

A "Start New Session" button appears for the next project. A "Close Application" button shuts down the backend server.

---

## 7. Data Model

### Session File Format

The session is stored as a single JSON file. The analyst can save it at any time and reload it later to resume work. The format is self-contained: a developer reading it can reconstruct the full editing state without any other context.

```
{
  "format_version": "1.0",
  "session_id": "<uuid>",
  "created_at": "<ISO 8601 timestamp>",
  "last_saved_at": "<ISO 8601 timestamp>",
  "source_folder": "<absolute path to shapefile parent folder>",

  "field_config": {
    "<layer_name>": {
      "<field_code>": {
        "visible": <bool>,
        "label": "<display label string>",
        "order": <integer position in popup display>
      }
    }
  },

  "edits": {
    "<layer_name>": {
      "<feature_id>": {
        "<field_code>": {
          "original": <original value, any JSON type>,
          "edited": <new value, any JSON type>,
          "timestamp": "<ISO 8601 timestamp of most recent edit>"
        }
      }
    }
  },

  "validation_acknowledged_warnings": [
    { "layer": "<layer_name>", "feature_id": "<id>", "field": "<field_code>" }
  ]
}
```

**Feature IDs** are assigned by the backend at import time as zero-padded row indices (e.g., `"0042"`). They are stable for the lifetime of a session and are used internally to correlate edits back to specific features. They are not exposed to the analyst in the UI.

### In-Memory State

The backend maintains the following in-memory structures for the duration of a session:

- **Original data store:** A dict keyed by layer name, containing the full list of feature records as loaded from shapefiles before any edits. This is read-only after import.
- **Session edits:** The `edits` dict from the session file, kept in memory and flushed to the auto-save file after each change.
- **Field configuration:** The `field_config` dict from the session file.
- **Derived/computed values:** Representative-point center coordinates and land cover sums are computed from original geometry at import time and cached. They do not change when attribute edits are made.
- **Validation state:** Recomputed on demand; not stored between requests.

### How Edited Data is Materialized

Whenever the backend needs the current state of a feature (for the API, for preview, or for export), it merges the original record with the delta from the edits store:

1. Start with the original record values
2. For each field in `edits[layer][feature_id]`, replace the original value with the edited value
3. Apply derived fields (center coordinates, land cover sum) on top
4. Return the merged result

This ensures the original data is never mutated and any edit can be reverted by removing it from the edits dict.

---

## 8. Backend API Design

All routes are served under `http://localhost:PORT`. The Editor Frontend communicates exclusively through these routes.

### System Routes

**`GET /health`**  
Returns server status. Used by the batch launcher to confirm the server is ready before opening the browser.

**`GET /`**  
Serves the Editor Frontend (built React app, `index.html`).

**`GET /preview/`**  
Serves the Map App (static, built React app) for the preview stage. Only active after a preview has been generated.

**`GET /preview/data/{filename}`**  
Serves the processed GeoJSON and manifest files for the preview. These are generated fresh each time the analyst enters Stage 5.

### Import Routes

**`POST /api/browse-folder`**  
No request body. Invokes `tkinter.filedialog.askdirectory()` on the server side, blocking until the analyst selects a folder in the native Windows dialog. Returns the selected absolute path string.

**`POST /api/import`**  
Request body: `{ "folder_path": "<absolute path>" }`  
Loads all three shapefiles, validates presence and readability, computes preliminary stats, initializes session state. Returns per-layer summaries: feature count, CRS, geometry validity count, any import errors.

### Session Routes

**`GET /api/session`**  
Returns the current full session state including edits and field configuration.

**`POST /api/session/save`**  
Request body: `{ "file_path": "<absolute save path>" }`  
Serializes the current session to JSON and writes it to the specified path.

**`POST /api/session/load`**  
Invokes a native file picker for `.json` files. Loads the selected session file, validates that the source folder still exists, restores session state. Returns the loaded session summary.

**`POST /api/session/reset`**  
Clears all edits and field configuration overrides, reverting to defaults. Original data remains loaded.

### Data Routes

**`GET /api/layers/{layer_name}`**  
Returns all features for the specified layer with current edits applied. Response includes per-feature validation status so the frontend can show error highlighting without a separate round-trip.

**`PATCH /api/layers/{layer_name}/{feature_id}`**  
Request body: `{ "field_code": "<code>", "value": <new value> }`  
Applies a single edit to a single field on a single feature. Validates the new value immediately. Returns the updated field value, its validation status, and the updated session edit count. Also triggers auto-save to the temp file.

**`DELETE /api/layers/{layer_name}/{feature_id}/edits`**  
Reverts all edits for a single feature to original values.

**`DELETE /api/layers/{layer_name}/{feature_id}/edits/{field_code}`**  
Reverts a single field on a single feature to its original value.

### Field Configuration Routes

**`GET /api/fields/{layer_name}`**  
Returns the current field configuration for the specified layer.

**`PUT /api/fields/{layer_name}`**  
Request body: full field configuration dict for the layer.  
Replaces the layer's field configuration.

**`POST /api/fields/reset`**  
Resets all field configuration to defaults from `field_mapping.json`.

### Validation Routes

**`POST /api/validate`**  
Runs full validation across all layers and all fields. Returns a list of issues with layer name, feature ID, field code, message, and severity (`error` or `warning`).

### Preview and Export Routes

**`POST /api/preview/generate`**  
Materializes the current edited data through the full export pipeline and writes output to a temp directory. Serves that directory under `/preview/data/`. Returns the count of features processed and any geometry repair events. After this call returns successfully, the `/preview/` route becomes active.

**`POST /api/export`**  
Assembles the final deployment ZIP from the temp preview directory and the built Map App. Writes the ZIP to a temp file. Returns a download token.

**`GET /api/export/download/{token}`**  
Streams the generated ZIP file to the browser as a file download.

---

## 9. Frontend Architecture

### Editor Frontend (the wizard)

The Editor Frontend is a React application. It is built into static files and bundled inside `editor_server.exe`. It has no routing library dependency; stage navigation is handled by local component state.

**Top-level structure:**

- `App.jsx`: Holds wizard stage state, session state, and global error state. Renders the stage progress bar and the active stage component.
- `stages/ImportStage.jsx`
- `stages/FieldConfigStage.jsx`
- `stages/EditStage.jsx`
- `stages/ValidateStage.jsx`
- `stages/PreviewExportStage.jsx`
- `components/DataTable.jsx`: The spreadsheet-style table used in Stage 3
- `components/ReferenceMap.jsx`: The small Leaflet reference map in Stage 3
- `components/ValidationList.jsx`: The issue list in Stage 4
- `services/api.js`: All backend communication; all fetch calls are here, not in components

**State management:**

Session state (edits, field config, current layer selection, validation results) lives in the top-level `App` component and is passed down via props. No external state library is required at this scale.

**The data table in Stage 3:**

At 207 total rows across three layers, a simple rendered HTML table is sufficient. No virtualization library is needed. The table re-renders on each edit; this is fine at this scale.

Columns are generated dynamically from the field configuration for the active layer. Cells render in view mode by default and switch to an edit mode input on click. The edit mode input type (text vs number) is set from the field type in configuration.

### Map App (the static deliverable)

The Map App is a second React application. It is largely identical to the Phase 1 Leaflet frontend, with one key change: it fetches data from a configurable base URL rather than hardcoded API routes.

**Data fetching change:**

In Phase 1, `src/services/api.js` fetched from `/api/manifest`, `/api/layers/{name}`. In Phase 2's Map App, it fetches from:

```
{window.INDOT_DATA_BASE}/manifest.json
{window.INDOT_DATA_BASE}/{layer_name}.geojson
```

`window.INDOT_DATA_BASE` is injected into the HTML at build time or by the serving context:

- During preview: the Editor Backend sets it to `/preview/data`
- In the exported ZIP: the `index.html` sets it to `./data`

This single change makes the Map App work identically in both preview and production without two separate builds.

**Map App build output:**

```
map_app_build/
├── index.html           — Has window.INDOT_DATA_BASE = "./data" set in a <script> tag
├── assets/
│   ├── main.[hash].js
│   └── main.[hash].css
```

This build is included inside `editor_server.exe`. At preview time, the Editor Backend copies it to the temp directory and sets `window.INDOT_DATA_BASE = "/preview/data"` (by rewriting that line in `index.html` at serve time, or by serving a wrapper HTML that sets the variable before loading the app).

---

## 10. Export Pipeline

The export pipeline is the sequence of operations the backend runs when generating the preview and when producing the final ZIP. It is the same code path for both; only the output destination differs.

### Pipeline steps (in order)

**Step 1: Materialize edited features**  
For each layer, merge original records with session edits to produce the final feature list. This is an in-memory operation.

**Step 2: Apply geometry repair**  
For features where `source_geometry_valid` is false, apply Shapely `make_valid()` to the output geometry. The original shapefile geometry is not changed. Track the count of repaired geometries.

**Step 3: Reproject to EPSG:4326**  
Convert all feature geometries from the source CRS (EPSG:26916) to EPSG:4326 for browser compatibility.

**Step 4: Derive center coordinates**  
Compute representative-point center coordinates from each feature's (reprojected, repaired) geometry. Store as `center_latitude` and `center_longitude`. Do not use `Lat`/`Long` source fields for map placement.

**Step 5: Apply field configuration**  
Keep only fields marked visible in the session field configuration, plus required internal fields (`dataset`, `layer_title`, `layer_type`, `center_latitude`, `center_longitude`, `source_geometry_valid`). Apply display labels to the GeoJSON properties.

**Step 6: Compute land cover sum**  
If land-cover fields are present, compute `land_cover_sum` as their sum. Otherwise omit this field.

**Step 7: Write GeoJSON files**  
Write three GeoJSON files to the output directory:

```
all_candidate_sites.geojson
facility_scored.geojson
row_scored.geojson
```

**Step 8: Generate manifest**  
Write `manifest.json` containing: layer names and titles, feature counts per layer, total feature count, bounding boxes per layer, geometry repair counts per layer, available score fields, and the generation timestamp.

**Step 9 (export only): Assemble ZIP**  
Copy the Map App build into the output directory. Rewrite `index.html` to set `window.INDOT_DATA_BASE = "./data"`. Zip the contents of the output directory. The ZIP internal structure is:

```
INDOT_Solar_Map_[YYYYMMDD_HHMMSS].zip
├── index.html
├── assets/
│   ├── main.[hash].js
│   └── main.[hash].css
├── data/
│   ├── manifest.json
│   ├── all_candidate_sites.geojson
│   ├── facility_scored.geojson
│   └── row_scored.geojson
└── README.txt
```

`README.txt` contains plain-language instructions: unzip, upload all files to the public web root, verify the map loads at the expected URL.

---

## 11. Key Technical Decisions and Rationale

### Local web app, not native desktop app

A native desktop app (Electron, Tauri, wxPython) would require significantly different technology from the existing Phase 1 stack, increasing build and maintenance complexity. The local web app pattern (PyInstaller + browser) is already proven by Phase 1's Windows release and leverages the same FastAPI + React codebase the project has already invested in.

### Native folder picker via tkinter

Browsers cannot invoke OS-native folder pickers for security reasons. Since the server runs locally, the backend can invoke `tkinter.filedialog.askdirectory()` directly on the user's machine and return the selected path. This gives a familiar, native Windows dialog experience without requiring any browser extensions or Electron-style workarounds.

### Delta-based edit model

Storing edits as a delta (only what changed) rather than a full copy of all features ensures the session file is small, the original is always recoverable, and it is immediately clear which values were changed. The merge operation is trivial at this feature count.

### Single export format (static ZIP)

Because the target is a public web server, the output is a purely static bundle: HTML, JS, CSS, and JSON data files. No server-side runtime is required for deployment. This makes the output hostable on any web server, CDN, or static hosting provider. The analyst or their IT department does not need to install Python, Node.js, or any backend framework on the hosting server.

### One Map App build served in two contexts

Rather than maintaining two separate builds of the Map App (one for preview, one for export), a single build is reused in both contexts. The `window.INDOT_DATA_BASE` injection pattern allows the data URL to differ between contexts without code changes. This eliminates the risk of preview and production behaving differently.

### Score field range enforcement

Score fields (0–1) are enforced as blocking errors in Stage 4. The physical meaning of the scores (solar potential scoring) makes out-of-range values a genuine data integrity issue, not just a cosmetic concern. Analysts should not be able to unknowingly export a map with invalid scores.

### No geometry editing

Geometry editing significantly increases implementation complexity (drawing tools, snapping, topology validation, coordinate precision management). For the current use case, analysts need to correct attribute values, not reshape polygons. Deferring geometry editing keeps the tool focused and deliverable on a reasonable timeline.

---

## 12. Future Extension Points

The following features are explicitly out of scope for Phase 2 but should be kept in mind during implementation to avoid architectural dead ends.

**Multi-project support:** The current tool is fixed to the three INDOT layers. A future version might support arbitrary shapefile sets with configurable layer detection. The field configuration system should be designed so layer names and required fields are not hardcoded outside of configuration files.

**Geometry editing:** If geometry correction becomes necessary in a future phase, the reference map panel in Stage 3 is the natural location for a drawing toolbar. The backend already has the geometry pipeline in place. The main addition would be a Leaflet draw plugin and corresponding backend PATCH routes for geometry.

**Change log / audit trail:** The session file already stores per-edit timestamps. A future change log view could display a chronological history of every edit made in a session, exportable as a CSV alongside the deployment ZIP.

**Multi-user collaboration:** Currently designed for a single analyst working sequentially. If multiple analysts need to work on the same dataset simultaneously, the session model would need to be replaced with a shared server session (with conflict detection) and the backend would need to be deployed centrally rather than locally.

**Automated geometry validation reports:** The manifest currently reports geometry repair counts. A future enhancement could produce a human-readable PDF or HTML report of all geometry issues found and repaired, attached to the export ZIP for documentation purposes.

**Variable basemap configuration:** The basemap layers available in the deployed map are currently defined in `src/config/mapConfig.js`. A future Stage 2 enhancement could expose basemap selection and ordering to the analyst without requiring code changes.
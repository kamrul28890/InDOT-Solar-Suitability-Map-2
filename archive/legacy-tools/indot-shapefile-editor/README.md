# INDOT Solar Editor

This is the separate Phase 2 editor for the INDOT solar suitability map. It is a local Windows-style web app: a FastAPI backend runs on the analyst's machine, the browser shows a five-stage wizard, and the export is a static map ZIP that can be uploaded to a public web server.

The original shapefiles are never modified. All edits are stored as deltas in a session file and autosaved to `%TEMP%\indot_editor_autosave.json`.

## Workflow

1. **Import**: choose the parent folder containing the three source shapefile folders.
2. **Fields**: choose popup/display fields, labels, and order.
3. **Edit**: review and edit attribute values in a table. The right-side map is a display-only reference map.
4. **Validate**: review blocking errors and non-blocking warnings.
5. **Preview and Export**: preview the final static map and generate a deployment ZIP.

## Expected Input

Choose the parent folder containing:

```text
All_Candidate_Sites/All_Candidate_Sites_Final.shp
Facility_Scored/solar_potential_scored_indotfacility.shp
ROW_Scored/solar_potential_scored_interchange.shp
```

Each shapefile set must include `.shp`, `.dbf`, `.shx`, and `.prj`.

## Setup

```powershell
cd "D:\My Projects\InDOT-Shapefile-Editor"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm install
```

## Run During Development

Start the API:

```powershell
npm run api
```

Start the browser UI in a second PowerShell window:

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:5174
```

## Validation

```powershell
npm run check
```

This builds the frontend and runs backend tests against the real InDOT shapefiles.

## Windows Release

```powershell
npm run release:windows
```

This creates:

```text
release/INDOT_Solar_Editor_Windows.zip
```

The package contains:

```text
Run_Editor.bat
INSTRUCTIONS.txt
server/editor_server.exe
```

## Export Output

The generated map ZIP contains:

```text
index.html
README.txt
data/manifest.json
data/all_candidate_sites.geojson
data/facility_scored.geojson
data/row_scored.geojson
```

Unzip the generated map package and upload all files to the public web server folder. No Python, Node, or FastAPI server is required for the deployed map.

# INDOT Solar Suitability Map

This repository contains the data-processing, API, and web-map implementation for the SPR 4862 INDOT solar development suitability map.

## Current Workflow

1. Inspect the source shapefiles.
2. Export cleaned, browser-ready GeoJSON layers.
3. Serve the exported layers through the API.
4. Visualize and filter layers in the web map.

## Data Export

Source shapefiles stay local and are ignored by Git. The app-ready export is generated from `config/field_mapping.json`.

```powershell
.venv\Scripts\python.exe scripts\export_app_data.py
```

The export writes GeoJSON layers and `manifest.json` to `data/processed/`.

## API

```powershell
.venv\Scripts\python.exe -m uvicorn app.api.main:app --reload --host 127.0.0.1 --port 8000
```

Useful endpoints:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/api/manifest`
- `http://127.0.0.1:8000/api/stats`
- `http://127.0.0.1:8000/api/layers/facility_scored`

## Web Map

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Tests

```powershell
.\scripts\check_project.ps1
```

## Windows Sharing Package

Build a click-to-run ZIP for non-technical Windows users:

```powershell
.\scripts\build_windows_release.ps1
```

Share `release\INDOT_Solar_Map_Windows.zip`. The recipient unzips it and double-clicks `Run_INDOT_Map.bat`.

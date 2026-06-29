# INDOT Phase 2 Editor

This folder contains the integrated editor-mode application for the INDOT solar suitability map. The mature standalone editor implementation from `D:\My Projects\InDOT-Shapefile-Editor` has been imported here and adapted to the organized Phase 2 workspace.

Current contents:

- `docs/indot_editor_implementation_plan.md` - architecture and implementation plan for the five-stage editor workflow.
- `docs/shapefile_inputs_and_fields.md` - shapefile sidecar roles, imported field counts, raw DBF attributes, editor-derived fields, exported GeoJSON properties, Fields screen columns, and Review/Edit parameter meanings.
- `editor_backend/` - active FastAPI editor backend with import, delta edits, autosave, validation, preview, and export.
- `backend/` - earlier modular scaffold retained for reference while the imported backend is active.
- `frontend/` - React five-stage editor interface.
- `map_app/` - Phase 1-derived static map app build retained for preview/export parity work.
- `packaging/` - Windows launcher assets.
- `scripts/check_editor.ps1` - editor validation command.
- `scripts/build_windows_release.ps1` - PyInstaller Windows release builder.

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

The production backend also serves the built editor at:

```text
http://127.0.0.1:8010
```

## Validation

```powershell
.\scripts\check_editor.ps1
```

This runs backend tests against the real `phase1_map` shapefiles and builds both the editor frontend and retained static map app.

## Windows Release

```powershell
npm run release:windows
```

This creates:

```text
release/INDOT_Solar_Editor_Windows.zip
```

## Active Workflow

The editor now supports the full five-stage workflow:

1. Import project folder with a native Browse button or typed path.
2. Configure visible fields, labels, and field order.
3. Edit feature attributes in a table with search, filters, undo, and revert actions.
4. Validate blocking errors and warnings.
5. Generate preview and export a static deployment ZIP.

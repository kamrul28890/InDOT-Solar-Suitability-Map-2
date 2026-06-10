# INDOT Phase 2 Editor

This folder contains the editor-mode application work.

Current contents:

- `docs/indot_editor_implementation_plan.md` - architecture and implementation plan for the five-stage editor workflow.
- `backend/` - FastAPI editor backend.
- `frontend/` - React wizard frontend placeholder.
- `map_app/` - future static map app for preview/export.
- `packaging/` - future Windows packaging assets.
- `scripts/check_editor.ps1` - editor validation command.

The implementation will be built phase by phase, with validation after each phase before moving to the next.

Current validation:

```powershell
.\scripts\check_editor.ps1
```

Package assembly:

```powershell
.\scripts\build_editor_package.ps1
```

Current backend routes:

- `GET /health` - confirms the editor backend is running.
- `POST /api/browse-folder` - opens the native Windows folder picker.
- `POST /api/import/inspect` - accepts a folder path, resolves the INDOT project folder, reads the three shapefile layers, repairs geometries for inspection, and returns layer summaries.

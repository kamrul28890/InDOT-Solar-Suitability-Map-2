# Editor Backend

FastAPI backend for the local Phase 2 editor application.

Current checkpoint:

- `editor_api.main:app` exposes `/health`.
- `POST /api/import/inspect` reads the real INDOT shapefile folders and returns import summaries.
- Selecting `All_Candidate_Sites`, `Facility_Scored`, or `ROW_Scored` resolves back to the parent project folder when all sibling layers are present.

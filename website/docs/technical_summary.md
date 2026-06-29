# Technical Summary

The project now has a staged implementation path from source shapefiles to a browser map.

## Data Foundation

- `config/field_mapping.json` defines source layers and display fields.
- `scripts/export_app_data.py` exports browser-ready GeoJSON.
- `data/processed/manifest.json` records layer counts, bounds, score fields, and geometry repair counts.

## Backend API

- `app/api/main.py` exposes health, manifest, stats, and layer endpoints.
- API tests verify the generated data and route behavior.

## Frontend

- `src/main.jsx` implements the first-screen web map.
- Users can toggle layers, search sites, filter by mean score, inspect popups, and see summary counts.

## Integration Checks

- `scripts/check_project.ps1` regenerates data, runs Python tests, and builds the frontend.

## Deployment

- FastAPI serves the production frontend from `dist/` when present.
- `Dockerfile` and `docker-compose.yml` provide a reproducible local deployment path.


# Data Contract

The web application uses generated GeoJSON files under `data/processed/`.

## Source Inputs

Source shapefiles are kept local and are not committed:

- `All_Candidate_Sites/All_Candidate_Sites_Final.shp`
- `Facility_Scored/solar_potential_scored_indotfacility.shp`
- `ROW_Scored/solar_potential_scored_interchange.shp`

## Generated Outputs

Run:

```powershell
.venv\Scripts\python.exe scripts\export_app_data.py
```

The exporter writes:

- `data/processed/all_candidate_sites.geojson`
- `data/processed/facility_scored.geojson`
- `data/processed/row_scored.geojson`
- `data/processed/manifest.json`

## Geometry Rules

All output geometry is reprojected to `EPSG:4326` for browser mapping. Invalid source geometries are repaired with Shapely `make_valid()` in the generated output only; the source shapefiles are not modified.

## Coordinate Rules

The source `Lat` and `Long` fields are retained as `source_latitude` and `source_longitude`, but they are not trusted for map positioning because they contain placeholder zero values. The app uses `center_latitude` and `center_longitude`, derived from representative points after reprojection.

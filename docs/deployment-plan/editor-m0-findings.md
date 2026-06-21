# Editor M0 Findings

## Shapefile Parsing

`shpjs` successfully loads the local INDOT shapefiles from loose `.shp`, `.dbf`, `.shx`, and `.prj` components.

| Layer | shpjs count | Processed GeoJSON count | CRS |
| --- | ---: | ---: | --- |
| `all_candidate_sites` | 104 | 104 | NAD 1983 UTM Zone 16N |
| `facility_scored` | 58 | 58 | NAD 1983 UTM Zone 16N |
| `row_scored` | 45 | 45 | NAD 1983 UTM Zone 16N |

The `.prj` files reproject correctly to WGS84 through `shpjs`; no CRS failure was observed.

## Geometry Validity

The browser `jsts` build exposes `IsValidOp`, but it does not expose `GeometryFixer`. The editor therefore uses the required fallback chain:

1. `jsts` `IsValidOp`
2. `buffer(0)` for polygonal invalid geometries
3. Lazy `geos-wasm` `GEOSMakeValid` escalation only if `buffer(0)` does not produce valid output

The known invalid INDOT feature is detected in the same layers as the Python manifest:

| Layer | Invalid feature | Browser repair |
| --- | --- | --- |
| `all_candidate_sites` | SPR_ID `371` | `buffer(0)` repairs to valid `MultiPolygon` |
| `facility_scored` | none | n/a |
| `row_scored` | SPR_ID `371` | `buffer(0)` repairs to valid `MultiPolygon` |

These counts match the existing manifest: `all_candidate_sites` has one repaired geometry, `facility_scored` has zero, and `row_scored` has one.

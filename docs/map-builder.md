# Map Builder Operation Guide

The Map Builder is an in-browser workspace for preparing static data updates for the INDOT Solar Suitability Map. It is available at:

```text
/#/builder
```

In local development:

```text
http://127.0.0.1:5173/#/builder
```

## Purpose

Use the Map Builder to:

- upload the three project shapefile datasets
- inspect retained attributes
- make simple attribute edits before export
- validate geometry, required fields, and expected data structure
- preview the normalized map layers
- download a ZIP package that can replace `website/data/processed/`

The builder runs in the browser. The app does not upload shapefiles to a server.

## Accepted Datasets

The builder accepts the three known project datasets only.

| Dataset | Expected source stem | Output file |
| --- | --- | --- |
| Candidate sites | `All_Candidate_Sites_Final` | `all_candidate_sites.geojson` |
| Scored INDOT facilities | `solar_potential_scored_indotfacility` | `facility_scored.geojson` |
| Scored right-of-way parcels | `solar_potential_scored_interchange` | `row_scored.geojson` |

Upload all three datasets together. A missing or unrecognized dataset will stop the import.

## Recommended Input Files

For each shapefile dataset, provide the complete sidecar set when available:

```text
.shp
.dbf
.shx
.prj
.cpg
```

The parser requires geometry, attributes, and projection information. Keeping the full sidecar set avoids avoidable import problems.

You may upload:

- one ZIP containing the shapefile components
- multiple ZIP files
- loose shapefile sidecar files

## Builder Steps

### 1. Upload

Open `/#/builder`, start the workspace, and upload all three shapefile datasets.

The builder matches files by source filename stem. If the source filenames change, update `website/src/builder/config/schema.js` intentionally before relying on the builder.

### 2. Edit

Review the imported tables. The builder retains the fields required by the public map and data contract.

Typical edits should be limited to project attributes that need correction before publishing. Avoid changing field meanings or inventing new project facts in the data.

### 3. Validate

The Validate step checks each normalized layer and reports errors or warnings. Resolve blocking errors before exporting.

The validation cards show:

- valid geometry count
- repaired geometry count
- escalated geometry count
- error count
- warning count

### 4. Preview

Use the preview to confirm that the normalized layers still render as expected before creating a package.

### 5. Export

Export downloads a ZIP named like:

```text
INDOT_Map_Update_YYYYMMDDTHHMMSS.zip
```

The ZIP contains:

```text
README.txt
data/processed/manifest.json
data/processed/all_candidate_sites.geojson
data/processed/facility_scored.geojson
data/processed/row_scored.geojson
```

## Applying an Exported Package

Extract the ZIP, then run from the repository root:

```powershell
.\scripts\apply_update_package.ps1 -PackagePath .\path\to\extracted-update-package
```

Then verify:

```powershell
cd website
npm test
$env:VITE_DATA_MODE='static'
$env:VITE_PUBLIC_BASE='/InDOT-Solar-Suitability-Map-2/'
npm run publish:ready
```

## Important Constraints

- The builder does not publish by itself; it only creates a data update package.
- The builder accepts only the three configured project datasets.
- The public site displays individual criteria only.
- Do not add a composite/mean/overall suitability score.
- Source shapefiles are not committed to the public site unless a maintainer intentionally changes that policy.

## Troubleshooting

| Problem | Likely cause | Action |
| --- | --- | --- |
| Upload says a dataset is missing | One required shapefile set was not included or the filename stem changed | Upload all three datasets or update the schema configuration intentionally |
| Upload says a shapefile is unrecognized | Filename does not match a known dataset stem | Confirm the source file name and schema configuration |
| Validation reports missing fields | Source DBF does not include expected attributes | Check source data export before publishing |
| Map preview is blank | Geometry failed parsing or all features were removed by validation/normalization | Review validation errors and source projection files |
| Build works locally but fails in Linux CI | The Pages preparation script uses PowerShell | Use the existing Windows runner workflow |

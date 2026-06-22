# Phase 6: Editor Update Workflow

## Purpose

The in-browser map editor (v1) accepts the three INDOT project shapefiles
(All Candidate Sites, Scored INDOT Facilities, Scored Right-of-Way Parcels) and exports a
ZIP package with this fixed layout:

```text
data/processed/manifest.json
data/processed/all_candidate_sites.geojson
data/processed/facility_scored.geojson
data/processed/row_scored.geojson
README.txt
```

Those files are drop-in replacements for `phase1_map/data/processed/`. Once committed to `main`, the existing GitHub Actions workflow rebuilds and republishes the public GitHub Pages site.

## Web Upload Path

Use this path when the maintainer does not have a local Git setup.

1. Open https://github.com/s2hublab/InDoT-map-project on github.com. (This is the
   maintainer repo wired to publish the live site — `PUBLIC_SITE_DEPLOY_TOKEN` is
   configured here. Uploads to the `kamrul28890/InDoT-map-project` mirror will build but
   will not publish.)
2. Navigate to `phase1_map/data/processed/`.
3. Choose `Add file` then `Upload files`.
4. Drag in the exported `manifest.json` and the three `*.geojson` files from the ZIP's `data/processed/` folder.
5. Commit the upload to `main`.
6. Wait for the public-site deployment action to finish.

v1 always exports the same three layers, so this is a straightforward overwrite of the existing files — no files need to be deleted.

## Local Clone Path

Use this path when the maintainer has the repository locally.

```powershell
Expand-Archive .\INDOT_Map_Update_YYYYMMDDTHHMMSS.zip -DestinationPath .\map-update
.\scripts\apply_update_package.ps1 -PackagePath .\map-update
git status --short
git add phase1_map\data\processed
git commit -m "Update public map data"
git push lab main
```

Push to the `lab` remote (`s2hublab/InDoT-map-project`) specifically — that is the repo with `PUBLIC_SITE_DEPLOY_TOKEN` configured. The push triggers `.github/workflows/deploy-public-site.yml`, which builds the static site and publishes it to `s2hublab/indot-solar-suitability-map`.

## Verification

- `phase1_map/data/processed/manifest.json` exists.
- Every layer listed in the manifest has a matching `<name>.geojson` file.
- `cd phase1_map; $env:VITE_DATA_MODE='static'; npm run build` succeeds.
- The public site opens at `https://s2hublab.github.io/indot-solar-suitability-map/` after the deployment finishes.

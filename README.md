# INDOT Solar Suitability Map

This repository builds and publishes the INDOT Solar Suitability Map for SPR 4862 / Indiana Solar Roadmap. The active application lives in `website/` and is a static React + Vite + Leaflet website with an integrated browser-based Map Builder for maintainers.

## Active Structure

```text
.
|-- website/                 # Public website source, data, tests, and build scripts
|-- docs/deployment/         # Deployment and maintainer workflow notes
|-- archive/                 # Retired reference material and local generated leftovers
|-- scripts/                 # Root maintenance helpers
|-- .github/workflows/       # GitHub Pages deployment workflow
`-- README.md
```

The published site is static. It reads `website/data/processed/manifest.json` and the referenced GeoJSON files at runtime. The Map Builder runs fully in the browser and exports drop-in data update ZIPs.

## Local Development

Install dependencies:

```powershell
cd website
npm install
```

Run the site locally:

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Useful routes:

```text
/#/
/#/map
/#/insights
/#/criteria
/#/data
/#/builder
```

## Static Build

Build the GitHub Pages artifact the same way CI does:

```powershell
cd website
$env:VITE_DATA_MODE='static'
$env:VITE_PUBLIC_BASE='/indot-solar-suitability-map/'
npm run publish:ready
```

The static artifact is written to `website/dist/`.

## Data Updates

Processed public data lives in:

```text
website/data/processed/
```

The browser Map Builder at `/#/builder` accepts the three INDOT shapefile datasets, validates and previews the output, and exports a ZIP containing:

```text
data/processed/manifest.json
data/processed/all_candidate_sites.geojson
data/processed/facility_scored.geojson
data/processed/row_scored.geojson
```

To apply an exported ZIP to a local checkout:

```powershell
.\scripts\apply_update_package.ps1 -PackagePath .\map-update
```

Then rebuild and verify from `website/`.

## Checks

```powershell
cd website
npm test
$env:VITE_DATA_MODE='static'
$env:VITE_PUBLIC_BASE='/indot-solar-suitability-map/'
npm run publish:ready
```

For the broader project check:

```powershell
cd website
npm run check:full
```

## Deployment

`.github/workflows/deploy-public-site.yml` builds from `website/` and publishes `website/dist/` to the public website repository when configured with `PUBLIC_SITE_DEPLOY_TOKEN`.

Do not push or deploy without maintainer approval.

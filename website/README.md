# Website Package

This folder contains the active INDOT Solar Suitability Map website.

## What Is Included

- `src/` - React + Vite + Leaflet public website.
- `src/builder/` - browser-based Map Builder for maintainer data updates.
- `data/processed/` - committed static GeoJSON and manifest files used by the public site.
- `app/api/` - local FastAPI host used for development and offline packaging only.
- `scripts/` - data export, validation, Pages artifact, and Windows package scripts.
- `tests/` - Python API/export checks.

## Run Locally

```powershell
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

## Static Build

```powershell
$env:VITE_DATA_MODE='static'
$env:VITE_PUBLIC_BASE='/indot-solar-suitability-map/'
npm run publish:ready
```

The build output is written to `dist/`.

## Tests

```powershell
npm test
npm run check:full
```

## Map Builder

Open the browser-based Map Builder at:

```text
http://127.0.0.1:5173/#/builder
```

It accepts the three known INDOT shapefile datasets, validates and previews the output, and exports a ZIP whose `data/processed/` files can replace the committed static data.

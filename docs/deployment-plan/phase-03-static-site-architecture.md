# Phase 3: Static Site Architecture

## Goal

The public map must run on GitHub Pages without FastAPI, Python, Node.js, shapefiles, or a local server. It should load the same browser-ready map data from static files.

## Current Source Architecture

- Phase 1 map source lives in `phase1_map`.
- Phase 1 currently supports a local FastAPI API and a React/Leaflet frontend.
- Processed public map data lives under `phase1_map/data/processed`.
- Phase 2 editor remains the local data preparation and export workflow.

## Static Website Architecture

The public website should use the built frontend plus static data files:

- Static app shell: built HTML, CSS, and JavaScript.
- Static data: manifest and GeoJSON files.
- Static assets: icons, styles, and generated frontend assets.
- External map tiles: loaded from configured basemap providers.

The public site should not call `/api` endpoints unless a future backend is intentionally added. For GitHub Pages, all data loading should resolve to static files under the deployed site path.

## Data Flow

- Source shapefiles stay local and ignored by Git.
- Maintainer uses the local editor or existing export workflow to prepare browser-ready data.
- Refreshed manifest and GeoJSON files are placed in the source repo's processed data location.
- Validation runs in the source repo.
- The public website build includes the processed data files.
- The website repo receives publish-ready static output.
- GitHub Pages serves the static output.

## Source Repo Responsibilities

- Own the full project code and documentation.
- Own data processing and editor workflows.
- Own validation and package-building workflows.
- Produce the public website artifact.
- Keep large local source GIS files out of Git.

## Website Repo Responsibilities

- Own the public website deployment target.
- Keep the public map artifact easy to inspect.
- Avoid storing local source shapefiles, editor sessions, virtual environments, or Windows release folders.
- Preserve enough metadata for maintainers to trace a deployment back to the source repo commit.

## Architecture Decision Needed Before Automation

Chosen publishing model:

- Built artifact model: source repo builds the app and pushes only static website output to the website repo.

This keeps the public repo clean and prevents the editor/backend workspace from being duplicated.

## Implemented Static Build Behavior

- Normal local builds continue to use API mode.
- Public builds set the data mode to static.
- In static mode, the app loads `data/processed/manifest.json` and each referenced GeoJSON file from the deployed website.
- Static stats are computed from the manifest so the public site does not need `/api/stats`.
- The Pages artifact preparation step copies processed data into the built site output.

## Acceptance Criteria

- The static site works without FastAPI.
- All public data files resolve from the deployed GitHub Pages path.
- The local FastAPI and Windows package workflows remain intact.
- The public website artifact is small enough for GitHub Pages.
- Future data updates follow a clear local editor/export to static website path.

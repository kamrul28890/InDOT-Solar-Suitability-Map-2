# INDOT Public Website Deployment Plan

## Purpose

This folder is the decision record and phase-by-phase plan for publishing the INDOT Solar Suitability Map as a free, polished, map-only public website.

The source and handoff repository remains `s2hublab/InDoT-map-project`. The clean public website repository will be `s2hublab/indot-solar-suitability-map`, with the target website URL:

`https://s2hublab.github.io/indot-solar-suitability-map/`

The first public release is intentionally map-only. It should present the current suitability layers cleanly and reliably without requiring Python, Node.js, FastAPI, shapefiles, or the local editor.

## Repository Roles

- `s2hublab/InDoT-map-project`: private source code, Phase 1 map, Phase 2 editor, documentation, tests, local packaging, and future data update workflow.
- `s2hublab/indot-solar-suitability-map`: public website deployment target for the static map viewer.
- Local Windows editor package: maintainer tool for importing shapefile folders, validating changes, previewing, and exporting updated static map data.

## Phase Index

- Phase 1: URL and repo setup: `phase-01-url-repo.md`
- Phase 2: public map layout and user experience: `phase-02-public-map-layout.md`
- Phase 3: static site architecture: `phase-03-static-site-architecture.md`
- Phase 4: deployment workflow: `phase-04-deployment-workflow.md`
- Phase 5: maintainer handoff: `phase-05-maintainer-handoff.md`
- Phase 6: editor update workflow: `phase-06-editor-update-workflow.md`

## Overall Acceptance Criteria

- The public website opens at the canonical GitHub Pages URL.
- The site is map-first and does not feel like a temporary demo.
- The site loads all layers directly from static files.
- No backend server is required for the public website.
- The local source repo still supports development, tests, packaging, and editor workflows.
- A future maintainer can update data, validate it, publish it, and recover from a failed deployment by following the documentation.

## Implementation Boundary

These documents are planning documents only. They define decisions, architecture, feature expectations, verification steps, and handoff rules. They do not contain application code, workflow code, or deployment scripts.

## Implementation Status

- Static data mode has been added to the Phase 1 map so the public site can load processed GeoJSON without FastAPI.
- A Pages artifact preparation step copies `phase1_map/data/processed` into the built `dist` folder.
- A source-repo GitHub Actions workflow has been added to publish the built artifact to the public website repo after a deploy token is configured.
- An in-browser editor route can export drop-in `data/processed/` update packages for web upload or local-clone application.

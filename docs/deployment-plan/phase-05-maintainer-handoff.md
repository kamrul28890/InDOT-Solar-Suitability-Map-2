# Phase 5: Maintainer Handoff

## Goal

The project should remain maintainable after the current developer leaves. A future maintainer should understand how to update data, test the map, publish the website, and avoid common mistakes.

## Maintainer Roles

- Data maintainer: prepares or receives updated shapefile folders.
- App maintainer: validates processed data and website behavior.
- Repo maintainer: reviews commits, protects branches, and manages deployment.
- Professor or project owner: reviews the map output and approves public changes.

One person may fill multiple roles, but the workflow should still separate data preparation, validation, and publication.

## Data Update Workflow

- Start from the source repo, not the website repo.
- Use the local editor package or source editor workflow to import the shapefile project folder.
- Review field mapping and visible fields.
- Edit records only when the change is intentional and documented.
- Run validation before export.
- Preview the updated map before publishing.
- Export updated static map data.
- Apply the exported data to the Phase 1 processed data location.
- Run source repo checks.
- Commit the source repo changes.
- Publish the public website artifact.

## What To Commit

- Source code changes.
- Planning and maintenance documentation.
- Processed public map data that is intentionally used by the website.
- Configuration files needed to reproduce the public viewer.
- Deployment metadata that helps trace releases.

## Updating Left Panel Text

- Edit `phase1_map/src/config/sidebarContent.js`.
- Use that file for project title text, stat labels, ownership text, lab links, and contact email.
- Do not edit repeated strings directly inside `AppHeader`, `StatsGrid`, or `ProjectInfo` unless the layout itself is changing.
- After text changes, rebuild and redeploy the public site artifact.

## What Not To Commit

- Raw shapefiles.
- Geodatabases.
- Local ArcGIS project files.
- Virtual environments.
- Node dependency folders.
- Build folders.
- Local logs.
- Editor session folders.
- Generated Windows release ZIPs unless intentionally managed through a separate release process.

## Testing Checklist Before Push

- Phase 1 checks pass.
- Static map build succeeds.
- Public data files are present.
- Manifest layer names match actual data file names.
- Search still works.
- Stats still match the manifest.
- Popups or detail views still display meaningful fields.
- No local-only absolute paths appear in committed files.
- No source shapefiles or generated local artifacts are staged.

## Public Website Checklist After Deploy

- Open the canonical URL.
- Confirm the map renders.
- Confirm all layers load.
- Confirm search works.
- Confirm layer toggles work.
- Confirm feature details work.
- Confirm the site works after a browser refresh.
- Confirm desktop and mobile layouts are usable.
- Record any issues before announcing the update.

## Troubleshooting

- If the map is blank, check whether static asset paths match the GitHub Pages repo path.
- If layers do not load, check whether data files were included in the deployed artifact.
- If stats are wrong, check whether the manifest was refreshed with the latest processed data.
- If search is missing records, check whether field names changed in the processed GeoJSON.
- If the website deploy fails, check GitHub Pages settings and repository permissions.
- If the local editor import fails, confirm the selected folder contains `All_Candidate_Sites`, `Facility_Scored`, and `ROW_Scored`.
- If an exported package works locally but not on GitHub Pages, check for backend-only assumptions in the public viewer.

## Handoff Acceptance Criteria

- A new maintainer can identify the source repo and website repo.
- A new maintainer can update data without committing raw shapefiles.
- A new maintainer can run checks before publishing.
- A new maintainer can publish or request publication of the public website.
- A new maintainer can rollback a broken public deployment.
- The professor receives a stable public URL and a documented maintenance path.

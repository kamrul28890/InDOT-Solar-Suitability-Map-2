# Phase 4: Deployment Workflow

## Goal

Deployment should be repeatable by a future maintainer. A maintainer should be able to validate the source repo, publish the static map, and verify the public site without needing to reverse-engineer the project.

## Recommended Workflow

- Source repo is updated and validated.
- Static public map is built from `phase1_map`.
- Static data files are included with the build output.
- Build output is published to `s2hublab/indot-solar-suitability-map`.
- GitHub Pages deploys the website.
- Maintainer verifies the public URL.

## Automation Requirements

- The source repository must define a `PUBLIC_SITE_DEPLOY_TOKEN` GitHub Actions secret.
- The token must have write access to `s2hublab/indot-solar-suitability-map`.
- The deploy workflow builds the Phase 1 public map in static mode, prepares the `dist` folder, and pushes the artifact to the website repo.
- The prepared artifact includes a small website-repo Pages workflow so the website repo can publish the pushed static files through GitHub Pages.
- The website-repo Pages workflow enables Pages on first run if it has not already been configured.

## Pre-Deploy Checklist

- Confirm working tree contains only intended changes.
- Confirm processed map data is current.
- Confirm source shapefiles are not staged.
- Confirm generated release ZIPs are not staged unless intentionally publishing through a release process.
- Run the Phase 1 validation workflow.
- Confirm local public build loads map layers successfully.
- Record the source repo commit that produced the deployment.

## GitHub Pages Setup

- Website repo: `s2hublab/indot-solar-suitability-map`.
- Pages source: GitHub Actions.
- Default branch: `main`.
- Public URL: `https://s2hublab.github.io/indot-solar-suitability-map/`.
- Deployment should not depend on a developer's local machine after changes are pushed.

## Current Website Repo Status

- Initial static site artifact has been pushed to the website repo `main` branch.
- The website repo Pages workflow is present at `.github/workflows/pages.yml`.
- The first workflow runs failed because Pages has not been enabled and the workflow token cannot create the Pages site by itself in the lab repository.
- A repository admin should open Settings, Pages, choose GitHub Actions as the Pages source, save, and rerun the latest failed workflow.

## Deployment Verification

After deployment, verify:

- The public URL opens successfully.
- Browser refresh still loads the map.
- Main JavaScript and CSS assets load.
- Manifest loads.
- All expected GeoJSON layers load.
- Search returns expected matches.
- Layer toggles work.
- Basemap selector works.
- Popups or feature details work.
- The page works in a fresh browser session.
- The page works at mobile width.

## Rollback Plan

- Identify the last known good website repo commit.
- Revert the broken website repo deployment commit or redeploy the last known good artifact.
- Confirm GitHub Pages completes a new deployment.
- Reopen the public URL and repeat the deployment verification checklist.
- Fix the source repo issue separately before attempting another publish.

## Failure Modes To Document

- GitHub Pages is not enabled or not set to GitHub Actions.
- Static asset paths are wrong for the repository URL path.
- Data files were not copied into the public build artifact.
- Manifest references layer files that are missing.
- A data update changed field names used by popups, search, or stats.
- Browser cache shows an old build during verification.
- Website repo permissions prevent publish automation.

## Acceptance Criteria

- Deployment steps are documented clearly enough for a new maintainer.
- Rollback steps are documented before the first public deploy.
- Deployment verification covers data, UI, and responsive behavior.
- The source repo commit and website repo deployment can be linked.

# Phase 1: URL And Repo Setup

## Decisions

- Canonical source repository: `s2hublab/InDoT-map-project`.
- Public website repository: `s2hublab/indot-solar-suitability-map`.
- Public website URL: `https://s2hublab.github.io/indot-solar-suitability-map/`.
- Public website scope: map-only first release.
- Ownership target: lab organization, not a personal account.

## Current Setup Status

- `s2hublab/InDoT-map-project` exists and is private.
- `s2hublab/indot-solar-suitability-map` exists and is public.
- The website repository has been created under the lab organization.
- The website repository has an initialized `main` branch with the initial static site artifact.
- GitHub Pages still needs to be enabled by a repo admin in the website repository settings.
- The current account can push website files but cannot edit the lab website repo settings or create the Pages site through the GitHub API.
- The earlier accidental personal repository `kamrul28890/indot-solar-suitability-map` is intentionally not part of the canonical deployment path.

## Repo Creation Requirements

- The website repository must be created under the `s2hublab` GitHub organization.
- The repository should remain public if the website is intended to be openly accessible.
- The default branch should be `main`.
- GitHub Pages should use GitHub Actions as the publishing source.
- The repository description should identify it as the public static website for the INDOT Solar Suitability Map.
- The repository should not become the main development repository for Phase 2 editor work.

## Recommended Repo Relationship

The source repo should be the place where maintainers edit, validate, and prepare the app. The website repo should receive publish-ready static website output.

This split keeps the public repo small and clean while preserving the full project history, tests, and local tooling in the source repo.

## Branch Policy

- `main` in the source repo should represent the latest handoff-ready source state.
- `main` in the website repo should represent the latest deployed static site source or artifact state, depending on the final deployment method.
- Deployment changes should be traceable back to a source repo commit.
- If branch protection is enabled, require passing checks before merging to `main`.

## Setup Checklist

- Confirm the website repo exists in the lab organization.
- Add a concise repo description.
- Initialize the website repo with a `main` branch. Done.
- Enable GitHub Pages with GitHub Actions as the source in repository settings.
- Confirm the expected Pages URL.
- Decide whether the website repo stores only built static artifacts or a lightweight copy of the public map source.
- Document the final publishing model in Phase 3 and Phase 4 before adding automation.

## Acceptance Criteria

- A lab-owned repo exists for the website.
- The canonical website URL is documented.
- Maintainers can clearly tell which repo is the source repo and which repo is the public website repo.
- No generated release ZIPs, shapefiles, local build folders, or editor sessions are added to the website repo.

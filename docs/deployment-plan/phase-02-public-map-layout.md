# Phase 2: Public Map Layout And User Experience

## Goal

The public website should open directly into a polished map experience. A professor, reviewer, or public stakeholder should immediately understand that the page is an interactive INDOT solar suitability map, not a development test page.

## First Release Scope

Included:

- Full-screen interactive map.
- Layer toggles.
- Search.
- Basemap selector.
- Summary stats.
- Feature popups or detail panel.
- Loading, empty, and error states.
- Desktop and mobile responsive layout.

Excluded from first release:

- Multi-page project portal.
- Online shapefile editor.
- User accounts or authentication.
- Server-side data editing.
- Live database.
- Uploading new shapefiles through the public website.

## Layout Requirements

- The map should occupy the main screen area immediately on load.
- The header should be compact and professional.
- The project title should be visible but should not dominate the map.
- Controls should be grouped logically: layers, search, basemap, stats, and feature details.
- Desktop layout should use a side panel or compact overlay that does not hide important map areas.
- Mobile layout should use collapsible panels or a bottom sheet so controls do not overlap the map.
- Text should remain readable at common laptop, desktop, tablet, and phone widths.
- No controls should clip, overlap, or shift unexpectedly when data loads.

## Map Controls

- Layer controls must allow users to turn each major layer on and off.
- Search must allow users to find relevant features from visible map data.
- Basemap switching should support a clean default basemap and at least one imagery option.
- Stats should summarize layer count, feature count, and layer-specific record counts.
- Popups or details should show the most useful fields first.
- Feature details should avoid dumping every raw attribute without structure.

## Left Panel Content Management

- Left-panel editable text should be centralized in `phase1_map/src/config/sidebarContent.js`.
- Header text, stat labels, project information, links, contact email, and notes should be changed there instead of inside individual React components.
- Purdue/S2-HUB ownership and contact information should appear below the Reload Data button so it is visible but does not compete with map controls.
- The Purdue logo should be stored as a public static asset and referenced from the content config.

## Visual Design Direction

- Use a restrained professional style.
- Prefer clear neutral backgrounds, strong contrast, and map-friendly accent colors.
- Avoid decorative visuals that compete with the map.
- Keep cards and panels compact.
- Use spacing and hierarchy to make controls scannable.
- Use consistent layer colors between map features, legends, and labels.

## Data Display Requirements

- Candidate sites should be distinguishable from scored facility and right-of-way layers.
- Scored layers should expose individual score fields when available.
- Missing or unavailable fields should be handled cleanly.
- Field labels should be human-readable.
- Geometry or layer loading problems should produce a visible, understandable error state.

## Performance Expectations

- Initial loading should show progress or a clear loading state.
- Map interaction should remain smooth with the current static GeoJSON size.
- Heavy data should be loaded once and reused in memory.
- Avoid repeated network requests for the same layer during normal interactions.

## Acceptance Criteria

- A first-time visitor can open the URL and use the map without instructions.
- The map looks intentional and complete on desktop and mobile.
- Search, layers, basemap, stats, and feature details are all discoverable.
- Empty, loading, and error states are visible and understandable.
- The public site remains map-only for the first release.

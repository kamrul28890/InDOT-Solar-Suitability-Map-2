---
name: ds-data-visualization-dashboarding
description: Curated prompts for data visualization and dashboarding — chart selection, Tableau/Power BI/matplotlib design, dashboard UX for stakeholders. Use when designing a chart, report, or dashboard.
---

# Data Visualization & Dashboarding — Prompt Library (Data Scientist)

Visualization work in 2026 spans everything from a one-off matplotlib chart in a notebook to a self-service Tableau or Power BI dashboard that hundreds of stakeholders will click through unsupervised, and the bar for "good" is different at each end but the underlying discipline is the same: pick the chart type that matches the comparison you're making (bar for categorical comparison, line for trend over time, scatter for relationship, heatmap for matrix/density), and never let a default setting — a truncated y-axis, a gratuitous dual axis, a 3D pie chart — quietly distort the message. Good dashboard design additionally means thinking in information hierarchy (the one number that matters first, supporting detail on click-through), respecting accessibility (colorblind-safe palettes, sufficient contrast), and being honest about performance limits when a dataset has millions of rows and a live filter needs to stay responsive. AI assistants are now routinely used to draft chart-selection logic, generate matplotlib/seaborn/plotly boilerplate, and critique a dashboard mockup for misleading framing — but the judgment of what story the data should tell, and what would mislead a busy stakeholder skimming for ten seconds, is still the data scientist's call.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I need to show `[describe the comparison, e.g., "how conversion rate changed across 5 marketing channels over 12 months"]` — help me decide between a line chart, grouped bar chart, and small multiples, and explain the trade-off each makes for this specific message.
2. What's wrong with using a dual-axis chart to compare `[metric A, e.g., "revenue"]` and `[metric B, e.g., "customer count"]` over time, and what alternative (e.g., indexed values, small multiples) would convey the relationship without the distortion risk?
3. I'm building a dashboard for `[audience, e.g., "regional sales managers"]` who will check it `[frequency]` — help me think through the information hierarchy: what single number or chart should be the first thing they see, and what should be one click deeper?
4. Compare Tableau, Power BI, and a custom plotly/Dash app for `[use case, e.g., "a self-service dashboard with 50+ concurrent users and row-level security needs"]`, focusing on what each handles well for performance and access control.
5. Explain how to choose a colorblind-safe palette for a chart that needs to distinguish `[N]` categories, and what tools or libraries (e.g., ColorBrewer, viridis) I should pull from instead of default software palettes.
6. I have `[N million]` rows of `[describe data]` that need to back an interactive dashboard with `[filter/drill-down requirements]` — what aggregation, pre-computation, or extract strategy should I use so the dashboard stays responsive?
7. Help me decide whether this report should be a static PDF/image export or an interactive dashboard, given the audience is `[describe]` and the typical use case is `[describe, e.g., "monthly review meeting" vs "ad hoc exploration"]`.
8. I want to add annotations or a storytelling overlay to highlight `[specific event, e.g., "the week a pricing change took effect"]` on a time series chart — what's the right way to do this without cluttering the visual for other readers who don't care about that event?
9. What heatmap design choices (color scale type — sequential vs diverging, cell aggregation, axis ordering) make sense for showing `[describe matrix data, e.g., "correlation between 20 features"]` versus `[describe matrix data, e.g., "hourly traffic by day of week"]`?
10. I'm designing a self-service dashboard where users will build their own filtered views — help me think through what guardrails (default date ranges, pre-set views, locked aggregation levels) prevent them from accidentally creating a misleading chart.

## Implementation prompts (build & debug)

1. Write a matplotlib/seaborn script to plot `[describe data, e.g., "monthly revenue by region as small multiples"]` with consistent y-axis scaling across panels, proper labeling, and an accessible color palette.
2. Write a plotly script to build an interactive `[chart type]` with a hover tooltip showing `[fields]` and a dropdown filter for `[dimension]`, suitable for embedding in a Dash app or Jupyter notebook.
3. My Tableau dashboard with `[N]` worksheets and a `[data source size]` extract is loading slowly when users apply the `[filter]` — help me debug whether this is an extract design, calculated-field, or context-filter issue and how to fix it.
4. Refactor this chart `[paste code or describe]` that currently uses a truncated y-axis starting at `[value]` instead of zero — show me the corrected version and a one-sentence explanation of why the truncation was misleading for `[this metric]`.
5. Write Power BI DAX measures to calculate `[business metric, e.g., "rolling 28-day active users"]` that updates correctly when users apply date-range slicers, and explain how to avoid the common context-filter pitfall with time intelligence functions.
6. Build a dashboard mockup (described in words or as a wireframe) for `[use case]` that puts `[the one key metric]` at the top-left as the primary KPI card, with `[supporting breakdowns]` below, and explain the visual hierarchy reasoning.
7. Debug why my heatmap of `[data]` is unreadable — colors all look similar / outliers dominate the scale — and recommend whether a log scale, percentile-based color binning, or diverging palette centered at `[value]` would fix it.
8. Write code to export a static, presentation-ready version of `[interactive chart]` (resolution, font sizes, legend placement) suitable for dropping into a slide deck, distinct from the interactive version used in the dashboard.
9. I need a chart that shows uncertainty — `[describe, e.g., "a forecast with a confidence band"]` — write the matplotlib/plotly code to render the point estimate and interval clearly without the band visually overwhelming the central line.
10. Set up row-level security in `[Tableau/Power BI]` so that `[role, e.g., "regional managers"]` only see data for `[their region]` in a shared dashboard, and explain how to test that the security model actually works before sharing broadly.

## Advanced prompts (architecture, optimization, edge cases)

1. Design the data model (star schema, aggregation tables) behind a Power BI/Tableau dashboard that needs to support drill-down from `[company level]` to `[transaction level]` for `[N million]` rows without timing out on interactive filters.
2. I'm deciding between pre-aggregating data into a summary table versus relying on live query against the raw warehouse table for a dashboard refreshed `[frequency]` with `[N]` concurrent users — walk through the trade-offs on freshness, cost, and performance.
3. Critique this dashboard design: it has `[N]` charts on one screen covering `[list metrics]` for `[audience]` — identify which charts are competing for attention, what should be cut or moved to a drill-down page, and what the single most important visual should be.
4. Help me design a consistent visual design system (color mapping per category, chart type conventions, typography) across `[N]` dashboards built by different team members, so stakeholders see a consistent visual language company-wide.
5. I need to visualize `[high-cardinality categorical data, e.g., "500 product SKUs"]` in a way that doesn't produce an unreadable legend or chart — compare small multiples, treemaps, and a "top N + other" bucketing approach.
6. Design an approach for a real-time or near-real-time dashboard on `[streaming metric]` that balances refresh latency against query cost on `[data warehouse/BI tool]`, including what sampling or windowing trade-offs are reasonable.
7. I want to A/B test two dashboard layouts for `[audience]` to see which drives faster or more accurate decisions — help me design what to measure (time-to-insight, click depth, follow-up question rate) and how to instrument it.
8. Walk me through accessibility auditing for a public-facing dashboard — contrast ratios, screen-reader-friendly chart alternatives (data tables), and colorblind simulation — and what changes `[my current design]` needs to pass.
9. I have conflicting stakeholder requests: `[group A]` wants a high-level KPI view and `[group B]` wants raw drill-down access on the same dashboard — design an information architecture (tabs, parameter-driven views, separate dashboards) that serves both without compromising either.
10. Help me design a versioning and change-management process for a widely used dashboard (`[N]` weekly viewers) so that metric definition changes or visual redesigns don't silently break trust with regular users.

## Follow-up / chaining prompts

1. Given the chart-type recommendation above, now write the actual `[matplotlib/plotly/Tableau calculated field]` code to implement it using my real column names: `[list columns]`.
2. Based on the information hierarchy we just designed, mock up the actual dashboard layout (rows/columns/tabs) with the KPI card positions specified.
3. Now that we've identified the dual-axis chart as misleading, redo the same comparison using indexed values (base 100) and show me what story that version of the chart actually tells.
4. Take the colorblind-safe palette you recommended and apply it specifically to my `[N]`-category chart, listing the exact hex codes I should use.
5. Given the performance bottleneck diagnosis above, write the specific aggregation table or extract definition that would fix it for my `[N million]`-row dataset.
6. Now write the one-paragraph annotation text I should overlay on the chart to explain the `[event]` spike to a viewer with no prior context.

## Anti-patterns: prompts that get weak answers

**Weak:** "Make my chart better."
**Sharper:** "I have a bar chart comparing 5 regions' Q3 revenue with a y-axis truncated at 80 instead of 0 — explain why that's misleading for a bar chart specifically (versus a line chart) and show me the corrected version."

**Weak:** "What chart should I use for my data?"
**Sharper:** "I'm showing weekly active users for 8 product lines over 18 months and want viewers to spot which lines are diverging from the pack — compare a single multi-line chart versus small multiples for that specific 'find the outlier' task."

**Weak:** "Help me build a dashboard."
**Sharper:** "I'm building a Power BI dashboard for regional managers checking it every Monday morning, backed by a 40-million-row transactions table — help me design the aggregation table and the top-of-page KPI layout so it loads in under 3 seconds."

**Weak:** "Is this color scheme okay?"
**Sharper:** "I'm using a default rainbow palette to distinguish 7 product categories in a stacked bar chart — check it against colorblind-safe alternatives like ColorBrewer's Set2, and tell me if 7 categories is even a reasonable number to encode with color alone."

**Weak:** "How do I show uncertainty in my forecast chart?"
**Sharper:** "I have a 12-month revenue forecast with 80% and 95% prediction intervals — write the plotly code to show both bands without the visual implying false precision, and explain how to label them so executives don't read the point estimate as a guarantee."

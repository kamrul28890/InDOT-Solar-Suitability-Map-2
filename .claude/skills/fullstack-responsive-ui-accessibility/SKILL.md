---
name: fullstack-responsive-ui-accessibility
description: Curated prompts for responsive UI implementation and accessibility — layout systems, breakpoints, ARIA, keyboard navigation. Use when building or auditing UI for responsiveness and accessibility.
---

# Responsive UI & Accessibility — Prompt Library (Full Stack Developer)

Responsive layout and accessibility are no longer separable "nice to have" passes tacked on at the end — in 2026, container queries, fluid typography, and ARIA-correct components are expected from the first commit, and accessibility lawsuits plus WCAG 2.2 AA compliance requirements have made this a real production risk, not a checkbox. Good responsive work means choosing flexbox versus grid deliberately per layout problem, picking a breakpoint strategy (mobile-first with `min-width` queries, or container queries when a component's context matters more than viewport size) and sticking to it, and treating images and fonts as performance surfaces, not afterthoughts. Good accessibility means real keyboard navigation and focus management, ARIA used to clarify semantics rather than paper over bad markup, color contrast that passes 4.5:1 for body text, and form errors announced to screen readers, not just shown in red text. This skill is for building new responsive/accessible UI, debugging layout breakage across breakpoints, and auditing existing screens with tools like axe and Lighthouse.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain when to use CSS Grid versus Flexbox for [a product card grid that needs to reflow from 4 columns to 1 as the viewport shrinks], with a concrete example of each approach.
2. Compare mobile-first (`min-width` media queries) versus desktop-first (`max-width`) breakpoint strategy for [a marketing site that gets 70% mobile traffic], and tell me which fits better.
3. Explain container queries versus traditional viewport media queries for [a sidebar widget that gets reused in both a wide dashboard and a narrow modal], with browser support caveats as of 2026.
4. Walk me through which ARIA roles and labels are actually needed for [a custom dropdown/combobox component built from `div`s] versus what a native `<select>` already gives me for free.
5. Explain the keyboard navigation and focus-management requirements for [a modal dialog] — what needs to happen on open, on Tab, on Escape, and on close.
6. Compare `srcset`/`sizes` versus the `<picture>` element for [a hero image that needs different crops on mobile versus desktop, not just different resolutions].
7. Explain how to test color contrast properly for [a dark-mode theme with a teal accent on charcoal background] and what WCAG AA actually requires numerically.
8. What's the difference between `aria-live="polite"` and `aria-live="assertive"` for [a form that shows validation errors after submit], and which should I use where?
9. Explain how screen readers actually navigate [a data table with sortable column headers and expandable rows] so I understand what markup decisions matter.
10. Compare lazy-loading strategies (`loading="lazy"`, Intersection Observer, library like `react-lazy-load-image-component`) for [an infinite-scroll image gallery with 200+ images].

## Implementation prompts (build & debug)

1. Build a responsive [3-column pricing table] using CSS Grid that collapses to a single stacked column below [768px], with the most popular plan visually emphasized at all breakpoints.
2. Write the ARIA markup and keyboard handlers for a custom [combobox/autocomplete component] so it behaves like the native pattern from the ARIA Authoring Practices Guide — Tab, Arrow keys, Enter, Escape all need to work.
3. Debug why this [modal component] traps focus incorrectly — Tab is escaping to the page behind it instead of cycling within the dialog: [paste code].
4. Implement a mobile-first responsive navbar that collapses into a hamburger menu below [640px], with the hamburger button properly keyboard-accessible and announced as "menu, collapsed/expanded" to screen readers.
5. Fix this form so validation errors are announced to screen reader users and visually associated with their inputs via `aria-describedby`, not just colored red text: [paste form code].
6. Convert this [fixed-pixel layout built with absolute positioning] into a responsive flexbox/grid layout that adapts from [320px to 1920px] without horizontal scroll or overlap.
7. Implement responsive images for [a blog post hero image] using `srcset` and `sizes` so mobile devices don't download a 2400px desktop asset, and add lazy loading for below-the-fold images.
8. Audit this component's color palette against WCAG AA contrast ratios and tell me exactly which text/background pairs fail, with corrected hex values: [paste palette/CSS].
9. Add visible focus indicators to this component that currently relies on `outline: none` everywhere, without breaking the existing visual design — show me a focus-ring approach that still looks intentional.
10. Implement a skip-to-main-content link and proper heading hierarchy (`h1`→`h2`→`h3`) for [a page that currently jumps levels and has no skip link], and explain why each fix matters for screen reader users.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a breakpoint and container-query strategy for a component library used across [a dashboard, a marketing site, and an embedded widget], where the same component must adapt to its container, not the viewport.
2. Critique this [responsive layout's CLS (Cumulative Layout Shift) behavior] when images and ads load asynchronously, and propose a fix using aspect-ratio boxes or skeleton placeholders.
3. Design an accessible drag-and-drop interface for [a kanban board] that also works via keyboard (e.g., picking up a card with Space, moving with arrows, dropping with Space again) per WAI-ARIA drag-and-drop patterns.
4. Run an accessibility audit plan for [a 40-page existing application] using axe-core and Lighthouse CI — show me how to set up automated scanning in CI plus what manual screen-reader testing still needs to happen on top.
5. Explain how to handle focus management in a [single-page app with client-side routing] so that screen reader users get notified of route changes and focus lands somewhere sensible, not stuck on a stale element.
6. Design a fluid typography system using `clamp()` for [a content-heavy site with headings and body text across 320px–2560px viewports] that avoids both tiny mobile text and oversized desktop text.
7. Propose a strategy for testing [a complex data visualization/chart component] for accessibility when the information is inherently visual — what's the accessible alternative representation?
8. Critique this [custom video player UI]'s accessibility for keyboard-only and screen-reader users — controls, captions, and focus order: [paste markup/code].
9. Design a dark-mode and high-contrast-mode strategy using CSS custom properties that satisfies WCAG AA in both themes without maintaining two separate stylesheets.
10. Identify performance bottlenecks in this responsive image pipeline for [an e-commerce site with thousands of product images] and propose a CDN/format strategy (AVIF/WebP fallback chain, responsive breakpoints) to cut load time.

## Follow-up / chaining prompts

1. Now apply the same ARIA combobox pattern you described to my [multi-select tag input], which has similar keyboard requirements but needs to support multiple selections.
2. Given the breakpoint strategy you recommended, show me the actual CSS custom properties / Tailwind config I'd set up to enforce it consistently across the app.
3. You flagged several contrast failures in my palette — now generate a full accessible color token set (text, background, border, focus) that I can drop into my design tokens file.
4. Take the focus-management fix you proposed for the SPA route changes and show me exactly where in [React Router's navigation lifecycle] to hook the focus call.
5. Based on the axe-core audit plan, write the actual CI config (GitHub Actions) that fails the build when a new accessibility violation is introduced.
6. Now extend the skip-link and heading-hierarchy fix to the rest of the app's templates — give me a checklist I can run page-by-page.

## Anti-patterns: prompts that get weak answers

**Weak:** "Make my site responsive."
**Sharper:** "Build a responsive 3-column pricing table using CSS Grid that collapses to a single stacked column below 768px, with the popular plan emphasized at every breakpoint."

**Weak:** "How do I make this accessible?"
**Sharper:** "Write the ARIA markup and keyboard handlers for my custom combobox so it matches the ARIA Authoring Practices Guide pattern — Tab, arrows, Enter, and Escape all need to work."

**Weak:** "Check my colors for accessibility."
**Sharper:** "Audit this color palette against WCAG AA contrast ratios and tell me exactly which text/background pairs fail, with corrected hex values: [paste palette]."

**Weak:** "Fix my modal's focus issue."
**Sharper:** "My modal's Tab key is escaping focus to the page behind it instead of cycling within the dialog — here's the code, debug the focus trap."

**Weak:** "What's the best way to do images?"
**Sharper:** "Implement responsive images for a blog hero using srcset and sizes so mobile doesn't download a 2400px desktop asset, plus lazy loading for below-the-fold images."

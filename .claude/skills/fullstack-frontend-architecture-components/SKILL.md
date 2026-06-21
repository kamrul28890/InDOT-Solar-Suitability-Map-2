---
name: fullstack-frontend-architecture-components
description: Curated prompts for frontend architecture and component design in React/Vue/Angular — component boundaries, state management, composition patterns. Use when structuring or refactoring a frontend application.
---

# Frontend Architecture & Components — Prompt Library (Full Stack Developer)

Frontend architecture in 2026 is dominated by decisions that compound: where state lives, how components are sliced, whether a tree leans on React Server Components or stays fully client-rendered, and how a design system is wired into the codebase so fifty engineers don't reinvent the same button. Getting this wrong shows up months later as prop-drilling chains six levels deep, re-render storms in list views, or a component library nobody trusts enough to use consistently. Good architecture here means component boundaries that map to actual domain concepts (not just visual regions of a page), state colocated as close to its consumers as possible, a folder structure that scales past 50 routes without becoming a junk drawer, and explicit, written-down reasoning for framework and state-library choices rather than cargo-culting whatever the last project used. This skill is for the moments where you're structuring a new app, untangling a messy one, or defending an architectural choice in a design review.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain the trade-offs between Context API, Redux Toolkit, Zustand, and Pinia for managing [shopping cart state shared across 6 routes] in a [React 18 / Vue 3] app, and recommend one given that the team is [4 engineers, mid experience].
2. Compare container/presentational component splitting versus colocated logic-and-view components for a [data table with sorting, filtering, and inline editing], and tell me which scales better as the table grows features.
3. I have a `[UserProfileCard]` component that's grown to 400 lines and handles fetching, form state, and three modals — walk me through how you'd decide where to draw new component boundaries.
4. What are the real differences between React Server Components and client components for a [dashboard with live-updating charts], and where exactly should the server/client boundary sit?
5. Compare React, Vue 3, and Angular specifically for a [greenfield internal admin tool with ~30 screens, team has mixed React/Angular experience] — not generically, but for this team and this app shape.
6. Explain when prop drilling is actually fine versus when it signals I need Context, a state library, or component composition, using my [3-level-deep `<Settings><Section><Field>` prop chain] as the concrete example.
7. Walk me through how design tokens (color, spacing, typography scales) should flow from a [Figma file] into a [Tailwind config / styled-components theme] without manual re-entry drift.
8. What's the difference between lifting state up versus using a state machine (XState) for a [multi-step checkout wizard with branching logic], and which fits my case better?
9. Explain how to share state across routes in [Next.js App Router] without a global store — e.g., a [filter panel that should persist when navigating from `/products` to `/products/[id]` and back].
10. Compare building on top of an existing component library (MUI, Chakra, shadcn/ui) versus building a custom design system from scratch for a [B2B SaaS product expected to last 5+ years].

## Implementation prompts (build & debug)

1. Design a folder structure for a [React + TypeScript] app with [40 routes, 15 shared components, 5 feature domains] that scales without becoming a dumping ground — show me the directory tree and explain the reasoning per folder.
2. Refactor this [800-line `Dashboard.tsx`] component into smaller pieces using container/presentational separation — keep data-fetching in the container and make the presentational pieces pure.
3. Write a Zustand store for [authenticated user session + permissions] that supports selective subscriptions so unrelated components don't re-render on every auth state change.
4. Debug why my [memoized `<ProductList>` component] still re-renders on every parent state update even though I wrapped it in `React.memo` — here's the component and its parent: [paste code].
5. Implement virtualization for a [10,000-row table] using `react-window` or `@tanstack/virtual`, and show me how to keep row height dynamic without breaking scroll performance.
6. Convert this [class component with `componentDidUpdate` lifecycle logic] to a functional component using hooks, preserving the exact same update-triggering behavior.
7. Build a composable `<Modal>` system using the compound component pattern (like `<Modal.Trigger>`, `<Modal.Content>`, `<Modal.Footer>`) so consumers don't need a giant props API.
8. Refactor [3 nearly-identical form components] into one configurable component using composition instead of a giant conditional-prop interface — show me the before/after.
9. Set up a shared state slice in [Redux Toolkit] for [cart + inventory check] that two unrelated routes both read and write to, with proper selector memoization via `reselect`.
10. Migrate this [Vue 2 Options API component] to Vue 3 Composition API with `<script setup>`, keeping reactive behavior identical and flagging any subtle reactivity gotchas.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a micro-frontend boundary strategy for [a monolith React app being split across 3 teams] — compare Module Federation, iframes, and build-time package composition for this specific team structure.
2. Critique this component hierarchy for a [real-time collaborative editor with 200+ concurrent users] and identify where re-render cascades will hurt at scale: [paste tree/code].
3. Design a state management architecture that cleanly separates server state (React Query / TanStack Query) from client UI state (Zustand) for an app with [heavy API dependency plus complex local UI state like multi-select, drag state, and modals].
4. What happens to my component architecture if I need to support [offline-first behavior with optimistic updates and conflict resolution] — what changes structurally versus what's just an add-on?
5. Walk me through a strategy for code-splitting a [React Router v6] app with [25 routes] so initial bundle size stays under [200KB gzipped], including how to handle shared chunks.
6. Design a design-system versioning strategy so that [12 consuming apps] can upgrade component library versions independently without a synchronized big-bang release.
7. Identify the failure modes in this [global event-bus pattern used for cross-component communication] and propose a more maintainable alternative for an app this size: [paste pattern/code].
8. Compare the performance and architectural implications of React Server Components fetching data server-side versus a client-side React Query cache, specifically for [a product catalog with personalized pricing per logged-in user].
9. Design a multi-tenant frontend architecture where [white-labeled themes and feature flags] vary per tenant, without forking the codebase or bloating every component with tenant conditionals.
10. Propose a strategy to detect and prevent prop-drilling regressions and unnecessary re-renders automatically in CI — e.g., via ESLint rules, `why-did-you-render`, or React DevTools Profiler snapshots.

## Follow-up / chaining prompts

1. Given the state management choice you just recommended, show me exactly how the [shopping cart] slice/store would be structured, including selectors and update actions.
2. Now apply that same component-boundary reasoning to my [`OrderHistoryPage`], which has similar complexity to the example we just discussed.
3. You proposed [Module Federation] for the micro-frontend split — now walk me through the specific webpack/Vite config changes needed to wire up the host and one remote.
4. Take the folder structure you designed and show me how a new feature domain (e.g., [`billing`]) would be added to it end-to-end, including tests and shared component reuse.
5. Based on the re-render issues you identified, write the specific `React.memo`/`useMemo`/`useCallback` changes needed, and explain why each one is necessary rather than just adding memoization everywhere.
6. Given the RSC/client boundary you recommended, show me what the actual file split looks like (`page.tsx` vs `*-client.tsx`) for my [dashboard with live charts] example.

## Anti-patterns: prompts that get weak answers

**Weak:** "What's the best way to manage state in React?"
**Sharper:** "Compare Zustand vs Redux Toolkit vs Context API specifically for a cart shared across 6 routes in a React 18 app with a 4-person team — recommend one with reasoning."

**Weak:** "How should I structure my components?"
**Sharper:** "My 400-line `UserProfileCard` mixes fetching, form state, and three modals — show me exactly where to split it into container/presentational pieces."

**Weak:** "Should I use React or Vue?"
**Sharper:** "For a greenfield 30-screen internal admin tool with a team that has mixed React/Angular experience, compare React, Vue 3, and Angular for this specific case."

**Weak:** "My component re-renders too much, help."
**Sharper:** "My `React.memo`-wrapped `ProductList` still re-renders on every parent update — here's the component and parent code, debug why memoization isn't taking effect."

**Weak:** "Design a good folder structure for my app."
**Sharper:** "Design a folder structure for a React + TypeScript app with 40 routes, 15 shared components, and 5 feature domains that scales without becoming a dumping ground — show the tree and explain each folder's purpose."

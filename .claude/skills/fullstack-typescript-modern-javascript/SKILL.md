---
name: fullstack-typescript-modern-javascript
description: Curated prompts for TypeScript and modern JavaScript — type design, generics, async patterns, migrating JS to TS. Use when writing, typing, or debugging TypeScript/JavaScript code.
---

# TypeScript & Modern JavaScript — Prompt Library (Full Stack Developer)

By 2026, TypeScript in strict mode is the default expectation on any serious full-stack codebase, and the bar for "good types" has moved past "no red squiggles" to types that actually model the domain and make illegal states unrepresentable. This means discriminated unions instead of optional-field soup, generics that capture real reuse rather than `any`-with-extra-steps, and utility types (`Partial`, `Pick`, `Omit`, `Record`) used deliberately instead of by habit. On the JavaScript side, async error handling has matured beyond bare `try/catch` toward Result-style patterns that make failure paths explicit, and module resolution (ESM vs CommonJS, `"type": "module"`, dual-package hazards) trips up even experienced developers when packages, bundlers, and Node's resolver disagree. This skill is for type design decisions, migrating legacy JS to strict TS, hunting down the last `any`, and reasoning through async/module edge cases that don't have one obvious right answer.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain when I should reach for a generic type parameter versus a union type for a function like [`fetchEntity<T>(id: string): Promise<T>`] that needs to work across [User, Order, and Invoice] shapes.
2. Compare discriminated unions versus a single interface with optional fields for modeling [an API response that can be `success`, `error`, or `loading`] — show me both and explain why one prevents bugs the other doesn't.
3. Walk me through the differences between `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, and `Record<K, T>` using my actual [`Product`] interface as the example for each.
4. What's the real difference between a Result type (`{ ok: true, value } | { ok: false, error }`) and `try/catch` for handling [API call failures], and when is each the better default?
5. Explain TypeScript's type narrowing rules for [a function that accepts `string | number | null` and needs to branch safely] — walk through exactly what narrows and what doesn't.
6. Compare migrating [a 15,000-line Express + JS codebase] to TypeScript incrementally with `allowJs` and `checkJs` versus a big-bang rewrite — which fits a team that can't freeze feature work?
7. Explain the practical differences between ESM and CommonJS module resolution in Node 20+, specifically why my [package marked `"type": "module"`] fails when a dependency still ships CommonJS.
8. What are the concrete dangers of `any` versus `unknown` in this [function that parses arbitrary JSON from a third-party webhook], and how do I type it properly instead?
9. Explain how `satisfies` differs from a type annotation (`: T`) for [a config object with literal string keys that I also want autocomplete on], with an example.
10. Compare optional chaining (`?.`) and nullish coalescing (`??`) against manual null checks for [a deeply nested API response like `user.profile.address.city`], and tell me where each can still hide bugs.

## Implementation prompts (build & debug)

1. Design a discriminated union type for [an order state machine: `pending`, `shipped`, `cancelled`, `refunded`] where each variant carries only the fields relevant to that state, and write the type guards to narrow safely.
2. Write a generic `Repository<T>` interface with `findById`, `findMany`, and `save` methods that I can implement for [User, Product, and Order] without duplicating CRUD boilerplate.
3. Migrate this [JavaScript Express route handler] to strict TypeScript, adding proper types for `req.body`, `req.params`, and the response shape: [paste code].
4. Debug this TypeScript error: [paste exact error message and code] — explain why it's happening and give me the minimal fix, not just a `// @ts-ignore`.
5. Refactor this nested `try/catch` async chain into a Result-type pattern so callers can't forget to handle the error case: [paste code].
6. Write utility types using `Pick` and `Partial` to derive a [`CreateUserDto`] and [`UpdateUserDto`] from a single [`User`] interface without manually duplicating fields.
7. Fix this module resolution error: [paste "Cannot find module" or "require() of ES Module" error] happening when I import [a CommonJS package] from my ESM TypeScript project.
8. Convert this callback-based [Node.js `fs` file-reading function] to use `async/await` with top-level await where appropriate, and add proper error typing.
9. Add strict null checks to this [legacy file with `strictNullChecks: false` assumptions] and show me every place the compiler now correctly flags a real bug versus noise I can suppress.
10. Write a type-safe event emitter where the event name string literal determines the allowed payload type, e.g. [`emit('user:created', { id, email })` vs `emit('order:shipped', { orderId })`] — no `any` in the payload.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a branded/nominal type pattern (e.g., `type UserId = string & { __brand: 'UserId' }`) to prevent mixing up [`UserId` and `OrderId`, both currently plain strings] across a 200-file codebase, and show the migration path.
2. Critique this generic constraint setup for [a `mapValues<T, R>(obj: Record<string, T>, fn: (v: T) => R)` utility] and tell me where the inference breaks down on edge cases like empty objects or unions.
3. Design a strict-mode migration plan for a [large monorepo with 8 packages, mixed JS/TS, some using CommonJS and some ESM] — sequence the rollout so nothing breaks mid-migration.
4. Explain the trade-offs of using `zod` (or `io-ts`) to validate and infer types from [runtime API request bodies] versus hand-writing TypeScript interfaces that can drift from reality.
5. Walk me through diagnosing a "dual package hazard" where [my library is being loaded twice — once as ESM, once as CJS — causing `instanceof` checks to fail across the boundary].
6. Design a typed builder pattern for [constructing complex SQL-like query objects] where invalid method chains (e.g., calling `.orderBy()` before `.select()`) are caught at compile time.
7. Compare structural typing pitfalls in TypeScript (e.g., [an object accidentally satisfying an interface it shouldn't]) versus nominal typing in [a language like Java/C#], and show me how to simulate nominal typing where it matters.
8. Profile and explain why this [recursive conditional type for deep object key paths] is slowing down `tsc` compilation on a large codebase, and propose a less expensive alternative.
9. Design error-handling types for [a multi-step async pipeline: validate → transform → persist] where each step can fail differently, and the caller needs to know exactly which step failed and why.
10. Explain how to safely type a [plugin system where third-party modules register handlers with `unknown` payloads] without leaking `any` into the core application's type safety.

## Follow-up / chaining prompts

1. Now write the type guards (`isPending`, `isShipped`, etc.) for the discriminated union you just designed, so I can narrow safely in switch statements.
2. Take the Result-type pattern you proposed and show me how to chain three sequential async operations (validate → save → notify) without nested `if (!result.ok)` pyramids.
3. Apply the same strict-mode migration sequencing you outlined, but now to my [`payments` package] specifically — what's the first file I should convert and why?
4. Given the branded-type approach you suggested for `UserId`/`OrderId`, show me the codemod or find-replace strategy to retrofit it across the 200 files without breaking builds mid-way.
5. You flagged the dual-package hazard — now show me the exact `package.json` `exports` field configuration that fixes it for both ESM and CJS consumers.
6. Take the zod schema you wrote for the request body and show me how to derive the TypeScript type from it with `z.infer` so I'm not maintaining two sources of truth.

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I use generics in TypeScript?"
**Sharper:** "Write a generic `Repository<T>` interface with `findById`/`findMany`/`save` that I can implement for User, Product, and Order without duplicating CRUD code."

**Weak:** "My TypeScript code has an error, fix it."
**Sharper:** "Here's the exact TypeScript error and code: [paste] — explain why it's happening and give the minimal fix, not a `@ts-ignore`."

**Weak:** "Should I migrate to TypeScript?"
**Sharper:** "Compare incremental migration with `allowJs`/`checkJs` versus a big-bang rewrite for a 15,000-line Express + JS codebase, for a team that can't freeze feature work."

**Weak:** "What's the difference between any and unknown?"
**Sharper:** "I'm parsing arbitrary JSON from a third-party webhook — show me concretely why `any` is dangerous here versus `unknown`, and how to type the parser properly."

**Weak:** "Help me with async error handling."
**Sharper:** "Refactor this nested try/catch async chain into a Result-type pattern so callers can't forget to handle the error case: [paste code]."

---
name: fullstack-testing-strategy
description: Curated prompts for testing strategy — unit, integration, and e2e test design, mocking, coverage trade-offs. Use when designing a test suite or deciding what and how to test.
---

# Testing Strategy — Prompt Library (Full Stack Developer)

A healthy 2026 test suite is shaped like a pyramid for a reason: lots of fast, isolated unit tests, a meaningful layer of integration tests that exercise real boundaries (often via Testcontainers spinning up real Postgres/Redis instead of mocking them away), and a thin layer of e2e tests covering only the critical user journeys, because e2e suites are slow and the first thing to rot into flakiness. Good testing work means being deliberate about what to mock — mock external third-party APIs and non-deterministic time/randomness, but prefer real dependencies via testcontainers for your own database and queue so tests catch real integration bugs instead of bugs in your mocks. Contract testing (Pact) earns its place specifically at service boundaries in a microservices system, where an integration test would require spinning up every dependent service. Coverage percentage is a vanity metric on its own — 90% line coverage with no assertions on edge cases is worse than 70% coverage that actually exercises failure paths, race conditions, and boundary values. Flaky tests are a leading cause of CI distrust and "just rerun it" culture, so diagnosing root causes (shared state, real timers, network calls, order-dependence) rather than retry-looping past them is what separates a trustworthy suite from a fragile one. CI speed matters too: parallelization and test sharding (Jest `--shard`, pytest-xdist, GitHub Actions matrix) keep feedback loops short enough that engineers actually wait for results before merging.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain the test pyramid trade-offs for my context: [a REST API with a Postgres database and 3 downstream service dependencies] — what ratio of unit to integration to e2e tests should I aim for?
2. Where's the actual boundary between a unit test and an integration test when my function calls a repository that hits [a real database] — should I mock the repository or use Testcontainers?
3. Compare mocking versus using Testcontainers for testing my [Postgres/Redis/Kafka] integration in [Jest/pytest/JUnit], including startup-time cost in CI.
4. Explain contract testing with Pact and when it's worth adopting versus just writing integration tests against a staging environment for [my microservices setup with N services].
5. What's the difference between meaningful coverage and vanity coverage percentage, and how would I audit my current [85%] coverage number to find the gaps that matter?
6. Compare test factories versus fixtures for setting up test data in [my ORM/framework], and tell me which scales better as my domain model grows more complex.
7. Explain common causes of flaky tests — shared state, real timers, network calls, test order dependence — and how I'd diagnose which one is causing flakiness in [describe symptom].
8. Walk me through the risks of snapshot testing for [React components / API response shapes] and when a snapshot test is actually hiding a real bug instead of catching one.
9. Explain strategies for testing async code and race conditions in [JavaScript/Python], specifically around [a function that fires multiple concurrent requests].
10. Compare running my e2e suite with Playwright versus Cypress for [my app type], focusing on parallelization support and flakiness under CI load.

## Implementation prompts (build & debug)

1. Write a unit test suite for this function, focusing on edge cases and boundary values, not just the happy path: [paste function].
2. Set up Testcontainers in [Jest/pytest] to spin up a real Postgres instance for my repository-layer integration tests, including teardown between test runs.
3. Debug why this test is flaky — it passes locally but fails intermittently in CI: [paste test code], here's the function under test: [paste code].
4. Write a test-data factory pattern for [my domain entity, e.g. Order with nested LineItems] in [language/framework] that lets me override specific fields per test without restating the whole object.
5. Write a Pact contract test between [consumer service] and [provider service] for the [specific endpoint], including how the provider verifies the contract in its own CI pipeline.
6. Refactor this snapshot test to assert on specific meaningful properties instead of the whole snapshot, because it's currently failing on unrelated whitespace changes: [paste test].
7. Write tests for this race condition: two concurrent requests both try to [decrement inventory / claim a unique slot] — show me how to write a test that reliably reproduces the race before I fix it.
8. Write an e2e test in [Playwright/Cypress] for the critical user journey of [checkout flow / signup flow], and tell me which parts of this journey should instead be covered by faster integration tests.
9. Set up test parallelization/sharding for my [Jest/pytest] suite in GitHub Actions so the [12-minute] suite runs in under [3 minutes] using a matrix strategy.
10. Debug why my integration tests are leaking state between runs — here's my test setup/teardown: [paste code] — is this a shared database connection, uncommitted transaction, or static singleton issue?

## Advanced prompts (architecture, optimization, edge cases)

1. Design a testing strategy for a system with [N microservices] where I can't run the full system locally — recommend the right mix of contract tests, mocked integration tests, and a staging smoke-test suite.
2. Critique my current test suite's mock usage — here's a sample of how I mock [the database layer / external API]: [paste code] — am I mocking so much that my tests no longer catch real bugs?
3. Design a strategy for testing eventual-consistency behavior in a system using [Kafka/event sourcing], where an integration test needs to wait for an async side effect without using a brittle fixed sleep.
4. Design a coverage-quality audit process — not just a percentage threshold — that flags untested error-handling branches and untested edge cases in [my codebase/language].
5. Design a test strategy for a critical [payment processing] path that needs both fast feedback in CI and high confidence before production deploy — what's the right e2e vs integration split here?
6. Critique this CI test-suite architecture for speed: [describe current pipeline stages and timings] — where would sharding, caching, or test-selection (running only affected tests) save the most time?
7. Design a chaos/fault-injection test for [a service dependency timing out or returning 500s] to verify my circuit breaker and retry logic actually behave correctly under failure.
8. Design a strategy for testing database migrations safely — both forward migration correctness and rollback behavior — for [my ORM/migration tool] in a CI pipeline.
9. Design an approach for testing multi-tenant data isolation — write the specific test cases that would catch a cross-tenant data leak in [my schema/query layer].
10. Design a test-impact-analysis setup (e.g., Nx affected, Turborepo) so a monorepo with [N packages] only runs tests for packages actually affected by a given PR's changes.

## Follow-up / chaining prompts

1. Given the test pyramid ratio you recommended, now audit my actual test counts — [X unit, Y integration, Z e2e] — and tell me where I'm over- or under-invested.
2. Now that the Testcontainers setup works locally, adapt it to run efficiently in GitHub Actions without re-pulling the Postgres image on every job.
3. Take the flaky test you just diagnosed and write a regression test that specifically guards against the root cause recurring.
4. Given the Pact contract test above, now set up the CI step that breaks the provider's build if it fails contract verification against the consumer's expectations.
5. Now that coverage gaps are identified, prioritize which 5 untested branches are highest-risk to write tests for first, given [production incident history or critical-path status].
6. Given the e2e test for checkout above, identify which assertions inside it could be pushed down into a faster integration test instead, to shrink e2e runtime.

## Anti-patterns: prompts that get weak answers

**Weak:** "Write tests for my code."
**Sharper:** "Write a unit test suite for this `calculateDiscount` function covering boundary values (0% discount, 100% discount, negative input) and the rounding edge case at $0.005: [paste function]."

**Weak:** "Why is my test flaky?"
**Sharper:** "This Jest test passes locally but fails ~1 in 10 runs in GitHub Actions CI — here's the test and the function under test: [paste both]. Diagnose whether it's a race condition, a real timer, or test-order dependence."

**Weak:** "How much test coverage do I need?"
**Sharper:** "I have 85% line coverage on this payment module but a production bug slipped through in the refund-edge-case branch — audit this code for untested error paths, not just coverage percentage: [paste code]."

**Weak:** "Should I mock or not?"
**Sharper:** "For this repository class that queries Postgres, should my test mock the database client or spin up a real Postgres via Testcontainers — walk through the trade-off given this test runs in a CI job billed per minute."

**Weak:** "Make my CI faster."
**Sharper:** "My Jest suite takes 12 minutes in GitHub Actions on a single runner — design a sharding strategy using a matrix job to get this under 3 minutes, accounting for uneven test-file runtimes."

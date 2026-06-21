---
name: fullstack-cicd-git-workflows
description: Curated prompts for CI/CD pipelines and Git workflows — branching strategy, pipeline design, automated checks, release process. Use when setting up or improving CI/CD and Git practices.
---

# CI/CD & Git Workflows — Prompt Library (Full Stack Developer)

By 2026, trunk-based development with short-lived feature branches and feature flags has become the default for teams shipping continuously, with long-lived GitFlow-style release branches mostly reserved for products with strict, infrequent release trains (e.g., embedded firmware, regulated industries). A solid CI/CD setup runs lint, test, build, and deploy as distinct, fast-failing stages, uses dependency caching aggressively (npm/yarn/pnpm cache, Docker layer caching) to keep pipelines under a few minutes, and treats secrets as first-class infrastructure via GitHub Secrets, Vault, or a cloud secrets manager rather than `.env` files committed by accident. Pre-commit hooks via husky and lint-staged catch cheap mistakes before they ever reach CI, while semantic-release or changesets automate versioning and changelogs so releases aren't a manual, error-prone ritual. Monorepo CI (Nx, Turborepo) earns its complexity by running only affected builds/tests instead of the whole repo on every PR, which is the difference between a 2-minute and a 40-minute pipeline at scale. Rollback strategy deserves the same design attention as the deploy itself — a deploy you can't cleanly revert is a deploy that turns a small bug into a multi-hour incident, which is why feature flags increasingly replace branch-based gating for decoupling deploy from release.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare trunk-based development versus GitFlow for my team of [N engineers] shipping [daily/weekly] — which fits better given our release cadence and need for hotfixes?
2. Explain how feature flags can replace long-lived feature branches, and what I'd need (a flag service like LaunchDarkly, or a homegrown config) to make that switch for [my app].
3. Walk me through the standard CI pipeline stages — lint, test, build, deploy — and tell me what should block a merge versus what should only block a production deploy for [my stack].
4. Compare GitHub Actions and GitLab CI for [my project], specifically around caching, matrix builds, and self-hosted runner support for [my constraint, e.g. needing GPU runners].
5. Explain semantic-release versus changesets for automated versioning — which fits better for [a single-package app] versus [a monorepo with N publishable packages]?
6. What's the right PR review workflow for a team of [N engineers] — how many required approvals, what should be automated (linting, test status) versus human-reviewed?
7. Explain how Nx or Turborepo's affected-only build/test detection works under the hood, and what it would take to retrofit it onto my existing monorepo with [current CI setup].
8. Compare storing secrets in GitHub Secrets versus HashiCorp Vault versus AWS Secrets Manager for a pipeline that needs to deploy to [my cloud environment].
9. Explain blue-green versus rolling deploys as rollback strategies, and which one lets me revert fastest if [a bad deploy reaches production].
10. Walk me through designing a pre-commit hook setup with husky and lint-staged that catches [lint errors, type errors, formatting] before a commit, without slowing down every commit by running the full test suite.

## Implementation prompts (build & debug)

1. Write a GitHub Actions workflow with separate jobs for lint, test, build, and deploy for [my Node.js/Python app], using dependency caching so reinstalling packages doesn't happen on every run.
2. Set up a husky + lint-staged pre-commit hook that runs [ESLint/Prettier/mypy] only on staged files, and a pre-push hook that runs the fast unit test suite.
3. Debug why my GitHub Actions cache isn't hitting — here's my cache key configuration and workflow file: [paste yaml] — is the cache key including something that changes every run?
4. Configure semantic-release for my repo so commits following [Conventional Commits] automatically bump the version and generate a changelog on merge to main.
5. Write the Nx (or Turborepo) configuration so that a PR touching only [package X] only triggers builds and tests for [package X] and its dependents, not the entire monorepo.
6. Set up GitHub branch protection rules and required status checks for [main branch] so PRs can't merge without [lint, test, and a passing build] succeeding.
7. Write a deploy job that pulls secrets from [AWS Secrets Manager/Vault] at deploy time rather than baking them into the Docker image or committing them to the repo.
8. Debug why my CI pipeline takes [15 minutes] when it used to take 4 — here's the recent diff to the workflow file: [paste diff] — identify the regression.
9. Write a rollback job/script that can redeploy the previous known-good container image tag within [my CI/CD tool] if a deploy fails its post-deploy health check.
10. Set up a feature-flag check (using [LaunchDarkly/Unleash/a config table]) so a merged-but-disabled feature can ship to production without being user-visible until flipped on.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a zero-downtime rollback strategy for a database-migration-coupled deploy, where rolling back the app code but not the migration would break things — what's the safe sequencing?
2. Critique this branching strategy for a team of [30 engineers] shipping to [3 environments] — here's our current flow: [describe branches/merges] — where will this break down as the team grows?
3. Design a CI pipeline that runs security scanning (dependency vulnerabilities via [Dependabot/Snyk], SAST via [Semgrep/CodeQL]) without adding more than [2 minutes] to pipeline time.
4. Design a canary release pipeline where [5%] of traffic goes to the new version first, with automated rollback if [error rate or latency SLO] is breached within [10 minutes].
5. Design a monorepo CI strategy for [N packages with interdependencies] that correctly invalidates the affected-build cache when a shared library changes, without rebuilding everything every time.
6. Audit this pipeline for secrets-handling mistakes — are credentials echoed in logs, passed as build args that end up in image layers, or scoped too broadly: [paste pipeline config].
7. Design a strategy for running database migrations safely in CI/CD across [staging and production] so a migration that fails halfway doesn't leave the schema in an inconsistent state.
8. Compare self-hosted GitHub Actions runners versus GitHub-hosted runners for [my workload, e.g. GPU-dependent integration tests], factoring in cost and maintenance burden.
9. Design a hotfix process that can ship a critical patch to production within [30 minutes] while bypassing the normal [N-day] release cadence, without skipping required checks.
10. Design a strategy for managing environment parity across dev/staging/prod using [Terraform/Pulumi + the same CI pipeline], so config drift between environments stops causing "works in staging, fails in prod" bugs.

## Follow-up / chaining prompts

1. Given the GitHub Actions workflow above, now add a manual-approval gate before the production deploy job that doesn't block staging deploys.
2. Now that semantic-release is configured, add a Slack/Discord notification step that posts the changelog when a new version is released.
3. Take the affected-only Nx build setup and now add a nightly full-rebuild job as a safety net in case the affected-detection misses something.
4. Given the canary deploy design above, define the exact automated rollback trigger conditions and write the monitoring query that checks them.
5. Now that branch protection and required checks are set up, add a status check that blocks merge if [bundle size / Docker image size] regresses beyond a threshold.
6. Given the secrets-management setup, now add automatic secret rotation on a [90-day] schedule without requiring a manual pipeline re-run.

## Anti-patterns: prompts that get weak answers

**Weak:** "Set up CI for my project."
**Sharper:** "Write a GitHub Actions workflow for a Node.js monorepo with separate lint, test, build, and deploy jobs, using pnpm's dependency cache and Turborepo's affected-only test selection."

**Weak:** "What Git workflow should I use?"
**Sharper:** "Compare trunk-based development with feature flags versus GitFlow for a 12-engineer team shipping to production multiple times a day with an occasional need for emergency hotfixes."

**Weak:** "My pipeline is slow."
**Sharper:** "My GitHub Actions pipeline takes 15 minutes; here's the workflow file [paste] — identify which steps aren't using caching and which jobs could run in parallel instead of sequentially."

**Weak:** "How do I manage secrets?"
**Sharper:** "Design a secrets-management setup using AWS Secrets Manager so my GitHub Actions deploy job pulls database credentials at deploy time instead of storing them as repo secrets, including IAM role scoping."

**Weak:** "Help with versioning."
**Sharper:** "Set up semantic-release with Conventional Commits for a monorepo with 4 publishable npm packages, so each package gets independent version bumps based on its own changed files."

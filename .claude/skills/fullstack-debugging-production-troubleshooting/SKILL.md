---
name: fullstack-debugging-production-troubleshooting
description: Curated prompts for debugging and production troubleshooting — root-causing bugs, reading stack traces/logs, incident triage. Use when something is broken and you need to find and fix the root cause.
---

# Debugging & Production Troubleshooting — Prompt Library (Full Stack Developer)

Debugging in a 2026 full-stack system rarely means staring at one stack trace in isolation — it means correlating a frontend error, a backend log line, and a trace span across services using a correlation ID, then deciding whether what you're looking at is the root cause or just the most visible symptom. "Good" looks like systematic narrowing (bisecting by time, by deploy, by request shape) instead of guessing, reproducing intermittent and race-condition bugs deliberately (stress-running the suspect code path, adding deterministic delays to widen a race window) rather than declaring them "unreproducible," and using observability tooling — Datadog, Grafana, Sentry, distributed tracing — to localize an issue before reading code. In production specifically, the discipline shifts: you debug with feature flags and read-only diagnostics rather than live edits, you make a fast, reversible call between a rollback and a hotfix based on blast radius and confidence in the fix, and you close the loop with a blameless postmortem that captures contributing factors rather than a single scapegoat cause. Memory leaks, N+1-induced timeouts, and silent third-party API failures remain the most common root causes behind "it's slow/broken and we don't know why" tickets, well ahead of anything exotic.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Walk me through how to apply bisection to narrow down [a regression that appeared sometime in the last 15 deploys] when I don't have a failing test yet, just a user complaint.
2. Explain how to read a stack trace that crosses the frontend/backend boundary — given this browser console error: [paste] and this server log around the same timestamp: [paste], how do I tell if they're the same incident?
3. Explain what a correlation ID actually does in distributed tracing, and walk me through how I'd add one to [my microservices setup, e.g. API gateway + 3 backend services] if I don't have one today.
4. Compare reading a Sentry error group versus a Datadog APM trace versus raw Grafana logs for the same incident — which should I open first when [a user reports a 500 error on checkout]?
5. Explain the difference between a symptom and a root cause using [a real example: e.g. "the page is blank" symptom versus an unhandled promise rejection in a data-fetch hook] — how do I keep digging instead of stopping at the first error I see?
6. Walk me through how to reproduce an intermittent race condition in [my code: e.g. two async handlers writing to the same record] by deliberately widening the timing window instead of hoping it happens again.
7. Explain what's safe to do for live debugging in production — compare adding a read-only diagnostic log versus toggling a feature flag versus attaching a debugger, and where the line is for [my regulated/high-traffic app].
8. Walk me through how to take a heap snapshot in [Node.js/Chrome DevTools/Java with a profiler] and read it to find what's actually retaining memory in [a service with a slow memory creep].
9. Explain what should go in a blameless postmortem versus what turns it into a blame exercise — give me a template structure for [an incident where a deploy caused a 20-minute outage].
10. Walk me through the decision criteria for rollback versus hotfix when [a bad deploy is causing errors for 5% of users] — what factors (confidence in fix, deploy time, blast radius) actually drive this decision?

## Implementation prompts (build & debug)

1. Debug this stack trace and tell me the most likely root cause before I start changing code: [paste full stack trace and surrounding log lines].
2. Add correlation-ID propagation across these services so a single request can be traced end to end: [paste service entry points/middleware], using [a header like X-Request-ID and a logging library like Pino/Winston/structlog].
3. Write a reproduction script that deliberately triggers this suspected race condition between [two async operations, describe them] by adding controlled delays, so I can confirm the bug before fixing it.
4. Debug this memory leak — here's a heap snapshot diff showing [object type] growing unbounded over [time period]: [paste/describe snapshot], and tell me what's likely holding a reference that should have been released.
5. Set up a Sentry/Datadog alert that fires when [error rate on this endpoint exceeds X% over 5 minutes] and route it to [the right on-call channel] without paging for noise like [known transient third-party timeouts].
6. Debug why this error only happens intermittently in production but never locally — walk through environment differences I should check: [connection pool size, timezone, concurrency level, feature flag state].
7. Write the read-only diagnostic logging I should add to [this production code path] to narrow down [an issue affecting some but not all requests] without changing behavior or risking a side effect.
8. Given this incident timeline — [deploy at T, first error at T+2min, alert fired at T+8min] — help me draft the blameless postmortem, focusing on contributing factors and process gaps, not who pushed the deploy.
9. Debug this N+1-induced timeout that only shows up under production load — here's the slow query log and the request volume graph: [paste both] — confirm whether this is the root cause or a downstream symptom of something else.
10. Write the rollback plan for [a database migration that's already partially applied in production] versus a forward-fix plan, and tell me which is safer given [the migration has already run on 60% of traffic via canary].

## Advanced prompts (architecture, optimization, edge cases)

1. Design a log-correlation strategy across [a frontend SPA, an API gateway, and 4 backend microservices] so that a single user-reported bug can be traced end-to-end in under [5 minutes] using [correlation IDs plus a tool like Grafana Loki or Datadog Logs].
2. Walk through how to distinguish a symptom from a root cause in a cascading-failure scenario where [service A times out because service B is slow because the database is under load] — which layer actually gets the fix?
3. Design a canary-based debugging approach for [a suspected memory leak] where I roll the suspect change out to 1% of production traffic with heap-snapshot capture enabled, without risking the full fleet.
4. Critique this current incident-response process for [my team] — where are the gaps between "alert fires" and "root cause identified," and what observability investment (traces vs logs vs metrics) would close the biggest one?
5. Design a strategy for debugging a race condition that only manifests under [real production concurrency, e.g. 200 simultaneous checkout requests] and never reproduces in a single-user local environment — what load-testing or chaos-engineering approach would surface it safely?
6. Walk through the trade-offs of rollback versus hotfix when the bad deploy includes [a database migration that can't be cleanly reversed] — what does "rollback" even mean here, and what's the safer path?
7. Design a feature-flag-gated debugging approach for [a production-only bug affecting a specific customer segment] so I can enable verbose diagnostics for just that segment without a redeploy.
8. Audit this distributed trace for where time is actually being lost across [5 services]: [paste trace/span breakdown] — is the bottleneck a real backend issue or an artifact of how spans are instrumented?
9. Design a postmortem follow-up process that turns action items from [a recent incident] into tracked, prioritized work instead of a document that gets written once and never revisited.
10. Walk through how I'd build a "debugging in production" runbook for [an on-call engineer with 2 weeks of experience] — what's safe for them to do unsupervised (read-only log queries, dashboard checks) versus what needs a second pair of eyes (toggling flags, running scripts against prod)?

## Follow-up / chaining prompts

1. Given the root cause you identified from the stack trace, now write the regression test that would have caught this before it reached production.
2. Now that correlation IDs are propagating across services, show me the Grafana/Datadog query that finds every log line for [a specific request ID] in one view.
3. Take the heap snapshot analysis above and now show me the code fix that releases the reference that was leaking, plus how to verify the fix with a follow-up snapshot.
4. Given the postmortem draft above, generate the specific monitoring/alerting follow-up so this exact failure mode pages someone before users notice next time.
5. Now that you've confirmed the N+1 query is the root cause and not just a symptom, trace one level further back — why did this query path only become slow recently? What changed upstream?
6. Take the rollback-vs-hotfix decision above and write the actual runbook steps for executing whichever path you recommended, including the verification step that confirms it worked.

## Anti-patterns: prompts that get weak answers

**Weak:** "My app is broken, help me fix it."
**Sharper:** "Users are getting a 500 on /api/checkout starting at 14:02 UTC today, right after a deploy at 14:00 — here's the Sentry error group and the deploy diff: [paste both]. Help me confirm whether the deploy caused this before I roll back."

**Weak:** "Why is this error happening?"
**Sharper:** "This NullPointerException only happens in production, never locally — here's the full stack trace and the environment config diff between staging and prod: [paste both]. What environment-specific factor could explain it?"

**Weak:** "Find the memory leak."
**Sharper:** "Here are two heap snapshots taken 1 hour apart showing Connection objects growing from 40 to 4,000 — [paste snapshot diff] — help me trace which code path is creating these without releasing them."

**Weak:** "Should I roll back?"
**Sharper:** "5% of checkout requests are failing since a deploy 10 minutes ago that included a non-reversible DB migration already applied to 60% of traffic — walk me through whether rollback is even viable here or if a forward hotfix is safer."

**Weak:** "Write a postmortem."
**Sharper:** "Draft a blameless postmortem for a 20-minute outage caused by a connection-pool exhaustion bug introduced in yesterday's deploy — timeline: deploy at 09:00, first alert at 09:14, mitigated at 09:20 via rollback — focus on the monitoring gap that delayed detection by 14 minutes."

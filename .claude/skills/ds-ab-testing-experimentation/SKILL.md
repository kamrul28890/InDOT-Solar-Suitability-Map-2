---
name: ds-ab-testing-experimentation
description: Curated prompts for A/B testing and experimentation design — sample size, randomization, guardrail metrics, novelty effects. Use when designing, running, or interpreting an experiment.
---

# A/B Testing & Experimentation — Prompt Library (Data Scientist)

Experimentation is how data science earns causal claims rather than correlational ones, and in 2026 most mature product orgs run dozens of concurrent experiments through platforms (Statsig, GrowthBook, Eppo, in-house) that make it dangerously easy to launch a test without thinking through randomization unit, power, or guardrails first. This skill area covers the full lifecycle: picking the right randomization unit and computing sample size/power before launch, separating success metrics from guardrail metrics, anticipating novelty and primacy effects that fade or grow over time, avoiding the peeking problem with proper sequential testing corrections, detecting network effects/interference when treatment and control users interact, deciding when a holdout group is warranted, interpreting null and negative results without spin, running multi-variant (A/B/n) tests without inflating false positives, and catching post-hoc segmentation traps like Simpson's paradox. "Good" experimentation work pre-registers the hypothesis and primary metric before launch, commits to a stopping rule instead of eyeballing a dashboard daily, and treats a null result as informative rather than something to explain away by slicing until something turns significant. The costliest mistakes in this domain are almost always procedural — peeking and stopping early, ignoring interference between arms, or shipping on a metric that looks good in aggregate but masks a guardrail violation in a key segment.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I'm designing an experiment to test `[feature/change]` — help me decide whether the randomization unit should be `[user / session / device]`, given that `[describe constraint, e.g., users can switch devices mid-session]`.
2. Walk me through computing the sample size needed to detect a `[X]%` relative lift in `[primary metric, e.g., 7-day retention]` from a baseline of `[Y]%`, at `[alpha]`/`[power]`, and how long that takes given `[traffic, e.g., 10K users/day]`.
3. Explain the difference between a success metric and a guardrail metric for an experiment testing `[feature]` — what would the guardrails be if the primary metric is `[metric]` but I'm worried about `[risk, e.g., increased latency or churn]`?
4. I'm worried about a novelty effect inflating short-term results for `[feature, e.g., a redesigned homepage]` — explain how to detect a novelty or primacy effect by looking at the treatment effect trend over the course of the experiment.
5. What is "the peeking problem" in A/B testing, and how does it differ from properly designed sequential testing (e.g., using alpha-spending or always-valid p-values) that lets me look at results continuously without inflating false positives?
6. I'm testing a feature where `[describe potential interference, e.g., a marketplace feature where treatment sellers compete with control sellers for the same buyers]` — explain how network effects/interference could bias my experiment and what design (cluster randomization, switchback) would address it.
7. When should I use a long-running holdout group versus a standard time-boxed A/B test for `[describe initiative, e.g., a major recommendation algorithm change]`?
8. I'm comparing `[N]` variants (A/B/n test) for `[feature]` — explain how the multiple comparison problem applies here and what correction or design (e.g., a single omnibus test before pairwise comparisons) I should use.
9. Explain what pre-registering an experiment (hypothesis, primary metric, MDE, stopping rule) buys me, and what specifically should go in a pre-registration doc for `[describe planned experiment]`.
10. My experiment on `[feature]` came back with a null result on `[primary metric]` — walk me through how to determine whether that's a true null effect or an underpowered test before concluding the feature "didn't work."

## Implementation prompts (build & debug)

1. Write Python code to compute the required sample size and experiment duration for detecting a `[X]%` lift in `[metric, e.g., click-through rate]` from a baseline of `[Y]%`, given `[daily traffic]`.
2. Write a randomization assignment function that buckets `[randomization unit, e.g., user_id]` into `[N]` variants using a consistent hash, ensuring the same unit always gets the same variant across sessions.
3. Debug my experiment results — the aggregate effect on `[metric]` is positive, but when I segment by `[dimension, e.g., new vs returning users]`, the effect reverses in one segment; help me determine if this is Simpson's paradox and how to report it correctly.
4. Write a sequential testing implementation (e.g., using mSPRT or an always-valid confidence sequence) so I can monitor `[metric]` daily during the experiment without inflating my false positive rate.
5. Write code to detect a novelty effect by fitting the treatment effect on `[metric]` as a function of days-since-first-exposure, and test whether the slope is significantly different from zero.
6. Write an analysis script that computes both the primary metric (`[metric]`) and guardrail metrics (`[list guardrails, e.g., latency, error rate, unsubscribe rate]`) for `[experiment name]`, flagging any guardrail breach even if the primary metric is positive.
7. Debug why my A/B test shows a statistically significant result after only `[N]` days when my pre-registered sample size calculation said I needed `[M]` days — am I at risk of a false positive from peeking?
8. Write code to run an A/B/n test across `[N]` variants for `[metric]`, using an omnibus ANOVA/chi-square test first, then Tukey-style pairwise comparisons only if the omnibus test is significant.
9. Write a power analysis that accounts for clustering/interference when the randomization unit is `[cluster, e.g., geographic market]` rather than individual users, adjusting for the design effect from intra-cluster correlation.
10. Write code to compute a post-experiment CUPED-adjusted (variance reduction using pre-experiment covariate) estimate of the treatment effect on `[metric]` to increase statistical power without more traffic.

## Advanced prompts (architecture, optimization, edge cases)

1. I'm testing a feature in a two-sided marketplace where `[describe interference, e.g., treatment drivers and control drivers compete for the same riders]` — design an experiment using switchback or cluster-based randomization that mitigates this interference, and explain the trade-offs versus simple randomization.
2. Critique my experiment design: I'm randomizing at the `[user level]` but the actual treatment exposure happens at the `[session/page level]`, creating a mismatch — what statistical and practical problems does this cause, and how do I fix the unit of analysis?
3. Walk me through designing a long-term holdout strategy for `[describe org-wide initiative]` that lets me measure cumulative effects over `[timeframe]` while still shipping incremental wins to the majority of users.
4. I have `[N]` experiments running concurrently on overlapping user populations for `[product area]` — explain how to detect and correct for interaction effects between simultaneously running experiments.
5. Critique this stopping decision: the team wants to end the experiment early because `[metric]` is significant at day `[X]` of a planned `[Y]`-day test — what's the risk, and what would justify an early stop without inflating false positives (e.g., a pre-specified sequential design)?
6. Design an analysis plan for an experiment with a heavy-tailed primary metric (e.g., revenue per user with a few whale users) — compare trimming/winsorizing, using a non-parametric test, or modeling the metric differently to get a stable effect estimate.
7. Explain the trade-off between optimizing for a short-term metric (`[e.g., click-through rate]`) versus a long-term guardrail (`[e.g., 90-day retention]`) when a feature shows opposite signals on each — how should the decision be framed for stakeholders?
8. I shipped a feature based on a positive A/B test result, but 3 months post-launch the metric has reverted — walk me through how to distinguish a novelty-effect decay from a genuine regression introduced by something else that shipped concurrently.
9. Critique my plan to use an AI assistant to auto-generate the experiment readout/summary directly from the raw metrics table — what should a human data scientist still independently verify (guardrail breaches, segment reversals, novelty trend) before trusting the AI's narrative?
10. Design a framework for prioritizing which of `[N]` candidate experiments to run first given limited traffic, balancing expected information value, minimum detectable effect feasibility, and business risk if `[describe a risky feature]` underperforms.

## Follow-up / chaining prompts

1. Given the sample size calculation you just ran, show me how the required duration changes if I can only allocate `[X]%` of traffic to the treatment arm instead of a 50/50 split.
2. Now that we've confirmed this is Simpson's paradox, help me decide whether to report the segment-level effects separately or build a single stratified estimate.
3. Take the guardrail metric breach you just flagged and help me write the go/no-go recommendation for the launch review, weighing it against the positive primary metric result.
4. Based on the novelty effect decay you identified, help me design a follow-up extended observation window to estimate the steady-state effect size.
5. Now extend the CUPED variance-reduction approach you used to also work for a binary conversion metric rather than a continuous one.
6. Given the interference/network-effect risk you described, help me design a smaller pilot using cluster randomization to validate the design before committing full traffic.

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I run an A/B test?"
**Sharper:** "I want to test a new checkout flow against the current one, measuring conversion rate with a baseline of 3.2% — compute the sample size needed to detect a 10% relative lift at 80% power and 5% significance, given 20K daily checkouts."

**Weak:** "Is it okay to check results early?"
**Sharper:** "My team wants to peek at results daily during a 2-week experiment without inflating false positives — walk me through implementing an always-valid sequential testing approach (mSPRT) instead of a fixed-horizon t-test."

**Weak:** "Why did my experiment results look weird?"
**Sharper:** "My experiment shows a +4% lift in conversion overall, but a -2% effect among returning users and +9% among new users — walk me through whether this is Simpson's paradox and how segment mix shifted between arms."

**Weak:** "What metrics should I track in an experiment?"
**Sharper:** "I'm testing a more aggressive notification frequency to lift 7-day engagement — help me define guardrail metrics (unsubscribe rate, app uninstall rate, support ticket volume) that should block launch even if engagement goes up."

**Weak:** "My A/B test result wasn't significant, what now?"
**Sharper:** "My test on a new onboarding flow got p=0.18 on activation rate with n=2,400 per arm — walk me through whether this is a true null or whether my pre-experiment power analysis was underpowered for the actual effect size I should have expected."

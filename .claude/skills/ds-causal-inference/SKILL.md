---
name: ds-causal-inference
description: Curated prompts for causal inference — identifying confounders, choosing causal methods, distinguishing correlation from causation. Use when a question requires causal, not just predictive, answers.
---

# Causal Inference — Prompt Library (Data Scientist)

Causal inference is the discipline that keeps a data scientist from telling a VP "users who saw the new feature converted 12% more" when the real story is that power users self-selected into seeing it. In real 2026 practice this shows up constantly — pricing changes, feature rollouts, policy interventions, marketing spend — where leadership wants a causal answer ("did X cause Y") but only observational data exists. Good work here means explicitly drawing out the assumed causal structure (a DAG), naming the confounders versus colliders versus mediators before reaching for any method, and matching the method to what the data and design actually allow: propensity score matching or IPW when confounders are observed, instrumental variables when there's a valid instrument, diff-in-diff or synthetic control when there's a policy change with a comparison group, regression discontinuity when there's a sharp eligibility cutoff. It also means being honest in front of stakeholders about identification assumptions that can't be tested and shouldn't be glossed over with a confident point estimate. AI assistants are now used heavily to draft DAGs, check identifiability conditions, and translate causal estimates into business language — but choosing the right design and refusing to overclaim causality from a regression coefficient is still squarely the analyst's job.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I'm looking at the relationship between `[X]` and `[Y]` in observational data showing a correlation of `[describe]` — walk me through the questions I should ask to determine whether this could be causal versus confounded versus reverse causation.
2. Help me build a DAG (directed acyclic graph) for the relationship between `[treatment/exposure]` and `[outcome]`, given that I believe `[list suspected confounders, mediators, or colliders]` are involved — and tell me which variables I should and shouldn't control for.
3. Explain the difference between a confounder, a collider, and a mediator using my specific scenario — `[describe scenario, e.g., "does customer support contact frequency affect churn, when both might be driven by product issues"]` — and what happens to my estimate if I mistakenly control for a collider.
4. I can't run a randomized controlled trial for `[describe reason, e.g., "ethical or business constraints on withholding a feature"]` — compare propensity score matching, instrumental variables, difference-in-differences, and regression discontinuity as quasi-experimental alternatives for my situation: `[describe data and intervention]`.
5. What assumptions does difference-in-differences require to give a valid causal estimate for `[my policy/feature change]`, and how would I test the parallel trends assumption with the pre-period data I have (`[describe pre-period length and groups]`)?
6. I have a natural experiment where `[describe eligibility rule or cutoff, e.g., "customers above a $500 spend threshold get a discount"]` — explain whether regression discontinuity design is applicable here and what bandwidth and functional form choices I'd need to make.
7. Compare synthetic control versus difference-in-differences for estimating the effect of `[a single intervention, e.g., "a new state-level regulation"]` when I only have one treated unit and `[N]` potential control units.
8. I want to use an instrumental variable for `[treatment]` — here's my candidate instrument: `[describe]`. Walk me through how to argue for relevance and exclusion restriction, and what falsification tests I could run.
9. Explain when a simple matched comparison (e.g., nearest-neighbor propensity score matching) is good enough versus when I actually need a more complex method like doubly robust estimation or targeted maximum likelihood estimation (TMLE) for `[my use case]`.
10. Help me scope a causal question from a vague business ask — stakeholders are asking "did `[intervention]` cause `[outcome]`?" — what data, comparison group, and time window would I need to even attempt a defensible causal estimate?

## Implementation prompts (build & debug)

1. Write Python code using `[statsmodels/causalml/DoWhy/EconML]` to estimate the average treatment effect of `[treatment]` on `[outcome]` using propensity score matching, including the balance diagnostics I should check after matching.
2. My propensity score matching produced poor covariate balance on `[variable]` after matching — here's my code and balance table: `[paste]`. Help me debug whether this is a model specification issue, a common support issue, or a sign the treatment groups are fundamentally non-comparable.
3. Implement a difference-in-differences regression in `[Python/R]` for my panel data with `[describe structure: units, time periods, treatment timing]`, including unit and time fixed effects, and clustered standard errors at the `[unit]` level.
4. Write code to test the parallel trends assumption for my diff-in-diff setup by plotting pre-treatment trends for treated versus control groups and running an event-study specification with leads and lags.
5. I'm implementing an instrumental variables (2SLS) estimate for `[treatment]` using `[instrument]` as the instrument — write the first-stage and second-stage regression code and show me how to check first-stage strength (F-statistic) and interpret weak-instrument bias risk.
6. Build a synthetic control for `[treated unit]` using `[list of potential donor units]` and pre-treatment outcome series — write the code to select donor weights, and a placebo-in-time and placebo-in-space test to validate the result.
7. Debug my regression discontinuity design — here's my data near the cutoff `[describe cutoff value]` and my local linear regression code: `[paste]`. Help me check for manipulation of the running variable (McCrary density test) and sensitivity to bandwidth choice.
8. Write code to estimate heterogeneous treatment effects (CATE) for `[treatment]` across subgroups defined by `[covariates]` using a causal forest or `[causalml]` uplift model, and flag which subgroup effects are statistically distinguishable from the average effect.
9. I need to do a sensitivity analysis for unmeasured confounding on my observational estimate of `[treatment effect]` — implement a Rosenbaum bounds or E-value calculation and explain what result would make me trust or distrust the estimate.
10. Refactor this causal analysis script `[paste code]` so it explicitly separates the identification step (DAG/assumptions), the estimation step (method), and the robustness-check step, so a reviewer can audit each piece independently.

## Advanced prompts (architecture, optimization, edge cases)

1. I have treatment assignment that's likely confounded by both observed covariates and an unobserved variable I suspect is `[describe, e.g., "manager discretion"]` — walk me through how doubly robust estimation or a bounding approach (Rosenbaum bounds, Manski bounds) would let me quantify how sensitive my result is to that unobserved confounder.
2. Design a causal analysis plan for a situation with simultaneous treatments — `[describe, e.g., "customers received both a price change and a UI redesign in overlapping windows"]` — where I need to disentangle the effect of each, given the data I have.
3. My instrumental variable has a first-stage F-statistic of `[value]` — walk me through whether this indicates a weak instrument problem, what bias I should expect in my 2SLS estimate as a result, and whether I should switch to a limited-information maximum likelihood (LIML) estimator instead.
4. I'm building a synthetic control for `[treated unit]` but there are only `[N]` pre-treatment periods, which is short — explain the implications for inference (e.g., conformal inference for synthetic control) and how I should report uncertainty given so few periods.
5. Critique my plan to use propensity score matching when treatment assignment is suspected to depend on a variable that's also a mediator of the outcome — walk through whether this would bias the estimate and how I should restructure the analysis.
6. I need to combine evidence from a quasi-experimental estimate (diff-in-diff, effect size `[X]`) with a prior RCT result (effect size `[Y]`) on a related but not identical population — how should I reason about reconciling the two for a stakeholder who wants one number?
7. Design a pre-registration document for an upcoming causal analysis of `[intervention]` using `[method]`, specifying the estimand, identification assumptions, and planned robustness checks before I see the outcome data, so I avoid p-hacking the causal claim.
8. Walk me through how to extend a regression discontinuity design to a fuzzy RD setting where compliance with `[treatment]` at the cutoff is only `[X]`%, and what local average treatment effect (LATE) interpretation applies.
9. I have hierarchical/clustered treatment assignment (e.g., treatment varies at the `[store/region]` level but outcomes are measured at the `[customer]` level) — explain how this affects standard error calculation and what clustering or multilevel modeling approach I need for valid inference.
10. Help me design a causal mediation analysis to decompose the total effect of `[treatment]` on `[outcome]` into the direct effect and the indirect effect through `[mediator]`, and explain what assumptions (sequential ignorability) this requires that are often violated in practice.

## Follow-up / chaining prompts

1. Given the DAG we just built, now tell me specifically which variables in my dataset (`[list columns]`) I should include as covariates in the matching or regression model, and which I should exclude as colliders or mediators.
2. Based on the parallel trends check above showing `[describe result]`, tell me whether my diff-in-diff estimate is still defensible, or whether I need to switch to a different design.
3. Now that we've estimated the average treatment effect as `[value with CI]`, help me draft the caveat language I should put alongside it for a stakeholder audience, given the identification assumptions we discussed.
4. Take the heterogeneous treatment effect results from before and tell me which subgroup, if any, I should prioritize for a follow-up targeted intervention, and what additional data would strengthen that subgroup-specific claim.
5. Given the weak-instrument diagnosis above, walk me through what alternative identification strategy I should pursue instead, using the same dataset.
6. Now translate the sensitivity analysis (Rosenbaum bounds/E-value) result into one sentence I can put in an executive summary about how robust this causal claim is to unmeasured confounding.

## Anti-patterns: prompts that get weak answers

**Weak:** "Is this correlation actually causal?"
**Sharper:** "I see a 0.6 correlation between weekly active usage and renewal rate — help me build a DAG of plausible confounders (account size, onboarding quality, sales rep) and tell me which quasi-experimental method could plausibly identify the causal effect given I only have observational data."

**Weak:** "What causal method should I use?"
**Sharper:** "I have a policy that rolled out to one state in 2025 with 10 comparable control states and 8 quarters of pre-period data — compare difference-in-differences versus synthetic control for estimating the policy's effect on unemployment claims, and tell me which parallel-trends or pre-period-fit diagnostic would decide between them."

**Weak:** "Can you check my regression for confounders?"
**Sharper:** "In my regression of `marketing_spend` on `sales`, I'm currently controlling for `region` and `season` — walk through whether `region` could be a collider given that sales team allocation also depends on it, and whether that changes my estimate's validity."

**Weak:** "Explain instrumental variables to me."
**Sharper:** "I want to use distance-to-nearest-clinic as an instrument for healthcare utilization in my effect-on-outcomes model — assess whether this instrument plausibly satisfies the exclusion restriction, and design a falsification test using a covariate that shouldn't be affected by distance."

**Weak:** "How do I tell my boss this is causal?"
**Sharper:** "Given that my synthetic control estimate shows a 7% lift with a placebo-in-space test showing only 2 of 19 control units producing a comparably large effect, draft the one-paragraph causal claim and caveat I'd put in a leadership summary that's honest about the assumptions without burying the finding in hedges."

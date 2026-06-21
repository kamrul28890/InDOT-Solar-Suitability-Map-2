---
name: ds-statistical-analysis-hypothesis-testing
description: Curated prompts for statistical analysis and hypothesis testing — choosing tests, interpreting p-values, confidence intervals. Use when validating findings or designing a statistical analysis.
---

# Statistical Analysis & Hypothesis Testing — Prompt Library (Data Scientist)

Statistical rigor is what separates a defensible finding from a story that happens to fit the data, and in 2026 — when an AI assistant can generate a t-test or a regression in seconds — the data scientist's real value is knowing which test is valid, whether its assumptions hold, and how to interpret the output honestly. This skill area covers choosing the right test (t-test vs Mann-Whitney, chi-square vs ANOVA), correcting for multiple comparisons (Bonferroni, FDR/Benjamini-Hochberg), distinguishing p-values from confidence intervals and effect sizes, running power analyses before collecting data rather than after, framing questions as Bayesian versus frequentist, checking assumptions like normality and homoscedasticity, using bootstrapping when parametric assumptions fail, and reading regression diagnostics (residual plots, VIF, leverage) rather than trusting an R² alone. "Good" statistical work states the hypothesis and significance threshold before looking at the data, reports effect size and confidence intervals alongside (or instead of) a bare p-value, and is explicit about what a non-significant result does and doesn't imply. The most common and costly failure mode is p-hacking — running many tests and reporting only the significant one — followed closely by treating "statistically significant" as synonymous with "practically important."

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I want to compare `[metric]` between `[group A]` and `[group B]` — walk me through how to decide between a two-sample t-test, Mann-Whitney U test, and a permutation test based on `[describe distribution/sample size]`.
2. Explain the difference between a p-value and a confidence interval for `[describe finding, e.g., a 2.3% lift in conversion rate]`, and why reporting only the p-value can be misleading to a non-technical stakeholder.
3. I'm running `[N]` simultaneous hypothesis tests on `[describe analysis, e.g., conversion rate across 15 marketing segments]` — explain when I should apply Bonferroni correction versus the Benjamini-Hochberg FDR procedure, and how the choice changes my significance threshold.
4. Walk me through how to compute the required sample size for detecting an effect size of `[Cohen's d or % lift]` at `[alpha, e.g., 0.05]` significance and `[power, e.g., 80%]` power, before I start collecting data for `[describe study]`.
5. Compare a chi-square test of independence and a Fisher's exact test for `[describe categorical data, e.g., a 2x2 table of conversion by treatment group with small cell counts]` — which is appropriate here?
6. Explain when I should reach for ANOVA versus running multiple pairwise t-tests to compare `[metric]` across `[N]` groups (`[group names]`), and what "post-hoc test" (Tukey HSD) adds after a significant ANOVA result.
7. I have a small sample (`[N]`) and I'm not confident the data is normally distributed — explain how bootstrapping a confidence interval for `[statistic, e.g., the median difference]` works and when it's preferable to a parametric test.
8. Explain the Bayesian framing of `[describe question, e.g., whether treatment increased revenue]` versus the frequentist framing — what would a posterior probability and credible interval tell me that a p-value and confidence interval don't?
9. What assumptions does a linear regression on `[describe model, e.g., predicting house price from square footage and location]` require (linearity, homoscedasticity, normal residuals, no multicollinearity), and how would I check each one?
10. I got a non-significant result (p = `[value]`) for `[describe test]` — walk me through what I can and cannot conclude from this, and whether the issue might be insufficient power rather than a true null effect.

## Implementation prompts (build & debug)

1. Write Python code (scipy/statsmodels) to run a two-sample t-test comparing `[metric]` between `[group A]` and `[group B]`, including a check for equal variances (Levene's test) to decide between Student's and Welch's t-test.
2. Write a power analysis function in Python (`statsmodels.stats.power`) to compute the minimum sample size needed to detect a `[effect size]` difference in `[metric]` at `[alpha]`/`[power]`.
3. Write code to apply Benjamini-Hochberg FDR correction to a list of `[N]` p-values from `[describe analysis]`, and show which findings survive correction versus the raw threshold.
4. Debug my regression diagnostics — here's my residual-vs-fitted plot showing `[describe pattern, e.g., a funnel shape]` and my code: `[paste code/describe]` — what does this pattern indicate and how do I fix it?
5. Write a bootstrap resampling function in Python to estimate a 95% confidence interval for the difference in `[statistic]` between `[group A]` and `[group B]`, using `[N]` resamples.
6. Write code to check linear regression assumptions for `[model description]`: Shapiro-Wilk on residuals, Breusch-Pagan for heteroscedasticity, and VIF for multicollinearity among `[predictor list]`.
7. Write a chi-square test implementation in Python for `[describe contingency table]`, and add a check that flags if any expected cell count is below 5 so I know to switch to Fisher's exact test.
8. Debug why my paired t-test on `[before/after metric]` gives a different conclusion than the equivalent Wilcoxon signed-rank test — walk me through what assumption violation might explain the discrepancy.
9. Write code implementing a simple Bayesian A/B test (Beta-Binomial conjugate model) for `[conversion metric]` between `[group A]` and `[group B]`, outputting the posterior probability that B beats A.
10. Write an ANOVA + Tukey HSD post-hoc analysis in Python (`statsmodels`) for `[metric]` across `[group list]`, and interpret which pairwise differences are significant after correction.

## Advanced prompts (architecture, optimization, edge cases)

1. I ran `[N]` exploratory tests on `[dataset]` before deciding which result to report — walk me through how to honestly account for this multiple-testing exposure even though I didn't pre-register the analysis.
2. Critique this regression model: `[describe model and predictors]` — the VIF for `[predictor]` is `[value]`, indicating multicollinearity; how should I decide between dropping the variable, combining it, or using ridge regression instead?
3. Explain the edge case where a statistically significant result (p = `[value]`) has a tiny effect size (Cohen's d = `[value]`) due to a very large sample (`[N]`) — how do I communicate that this might not be practically meaningful?
4. I have repeated measurements per subject in `[describe design, e.g., the same users measured at 3 time points]` — explain why a standard t-test or ANOVA is invalid here and what mixed-effects model or repeated-measures ANOVA I should use instead.
5. Walk me through diagnosing Simpson's paradox in `[describe finding, e.g., an aggregate trend that reverses when segmented by region]` and how to determine which level of aggregation reflects the true causal story.
6. Compare frequentist sequential testing corrections (alpha-spending functions) versus a fully Bayesian approach for a test I want to monitor continuously rather than at one fixed sample size — what's the right tool if I can't commit to a fixed N in advance?
7. Critique my use of an AI assistant to auto-select a statistical test based on a natural-language description of my data — what should I independently verify (test assumptions, data structure, hypothesis direction) before trusting its choice?
8. I'm testing for a difference in `[metric]` between `[group A]` and `[group B]` but the variances are wildly different (`[describe, e.g., 5x ratio]`) — explain why Welch's t-test, not Student's, is appropriate, and what happens if I use the wrong one.
9. Design a robust pipeline for routinely testing `[N]` metrics across `[M]` segments every week without inflating false discovery rate over time — how should the correction method account for the fact this is an ongoing, not one-shot, testing program?
10. Explain how to interpret a confidence interval for an odds ratio from logistic regression on `[predictor]` predicting `[binary outcome]` when the interval is `[e.g., 0.95 to 1.4]` and crosses 1 — what does that tell me about both significance and direction of uncertainty?

## Follow-up / chaining prompts

1. Given the t-test result you just walked me through, now show me how to compute and report the effect size (Cohen's d) alongside the p-value.
2. Now that we've identified the regression assumption violation, show me how the conclusion changes if I instead fit a robust regression or transform the predictor.
3. Take the FDR-corrected results you just produced and help me write a one-paragraph summary for a non-technical stakeholder that doesn't overstate certainty.
4. Based on the power analysis you ran, tell me how the required sample size changes if I'm only willing to detect a 50% larger effect size.
5. Now extend the bootstrap confidence interval approach you used to also compute a bootstrapped p-value via permutation, and compare it to the parametric test result.
6. Given the Simpson's paradox you just diagnosed, help me decide which segmentation variable to control for in a stratified or regression-adjusted re-analysis.

## Anti-patterns: prompts that get weak answers

**Weak:** "Is this result statistically significant?"
**Sharper:** "I got p = 0.03 comparing conversion rate between two groups (n=450 each) — walk me through whether this survives Bonferroni correction given I also ran 8 other segment comparisons, and what the effect size (Cohen's d) tells me beyond the p-value."

**Weak:** "What statistical test should I use?"
**Sharper:** "I'm comparing median time-on-page between a treatment and control group, n=80 per group, and the distribution is heavily right-skewed — should I use a Mann-Whitney U test instead of a t-test, and how do I justify that choice?"

**Weak:** "Check my regression for problems."
**Sharper:** "My linear regression predicting house price has a VIF of 9.2 on square footage and 8.7 on number of rooms — walk me through whether to drop one variable, combine them into a single feature, or switch to ridge regression."

**Weak:** "How many samples do I need?"
**Sharper:** "I want to detect a 5% relative lift in a baseline 12% conversion rate at alpha=0.05 and 80% power — compute the required sample size per group for a two-proportion z-test."

**Weak:** "Explain p-values to me."
**Sharper:** "I have p=0.04 for a test with n=50,000 and a Cohen's d of 0.02 — explain why this is statistically significant but likely not practically meaningful, and how I'd phrase that distinction to a product manager."

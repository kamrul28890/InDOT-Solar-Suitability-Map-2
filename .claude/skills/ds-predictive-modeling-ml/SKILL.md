---
name: ds-predictive-modeling-ml
description: Curated prompts for predictive modeling and applied machine learning — model selection, validation, tuning, interpretation for business problems. Use when building a predictive model end-to-end.
---

# Predictive Modeling & Applied ML — Prompt Library (Data Scientist)

Predictive modeling in 2026 data science work is less about squeezing out the last 0.5% of AUC and more about framing the right problem, choosing a model that survives contact with production data drift, and being able to defend every prediction to a stakeholder who will ask "why did it say that about this customer." Good work here means a validation strategy that actually mirrors how the model will be used (time-based splits for time-dependent data, grouped splits to avoid leakage), an evaluation metric chosen for the business cost of errors rather than the default the library ships with, and an interpretation layer (SHAP, partial dependence) that a non-technical reviewer can sanity-check. It also means having the discipline to recommend a simple heuristic or rule-based system when a model isn't actually buying you anything over it. AI assistants are now routinely used to draft model cards, debug leakage, generate SHAP narratives, and red-team a modeling plan before a single line of training code is written — but the judgment about what's overfit, what's leaking, and what's defensible to the business still has to be the data scientist's.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I need to turn this business problem — `[describe the business problem, e.g., "predict which customers will churn in the next 90 days"]` — into a modeling problem. Help me decide whether this should be framed as binary classification, multi-class, regression, or survival analysis, and explain the trade-offs of each framing for my use case.
2. Walk me through the trade-offs between logistic regression and gradient boosting (e.g., XGBoost/LightGBM) for `[my use case]`, specifically on interpretability, training data size requirements (`[N rows]`), and expected performance ceiling.
3. What's the right validation strategy for a dataset with `[describe structure, e.g., "repeated measurements per customer over 2 years"]` — explain why a naive random k-fold split would leak information here and what grouped or time-based cross-validation would look like instead.
4. Given that my target event rate is `[X]%` positive class, explain how class imbalance will affect model training for `[algorithm]`, and compare class weighting, SMOTE-style oversampling, and threshold adjustment as mitigation strategies.
5. I'm choosing between AUC-ROC, precision-recall AUC, F1, and calibration metrics (Brier score) for a model where `[describe cost asymmetry, e.g., "false negatives cost 10x more than false positives"]`. Which metric should drive my model selection and why?
6. Explain how I should think about the difference between a model that's well-calibrated versus one that's merely well-ranked, and why `[business stakeholder, e.g., "the pricing team"]` should care about calibration specifically for `[use case]`.
7. Before I build anything: help me figure out if a simple rule-based heuristic (e.g., `[describe a candidate rule, e.g., "flag accounts with 2+ missed payments"]`) could plausibly match ML performance here, and what evidence I'd need to gather to make that comparison fair.
8. What feature leakage risks should I be hunting for in a dataset where features are computed `[describe timing, e.g., "as of the prediction date using a nightly batch job"]`, and how would I systematically test for leakage before training?
9. Compare how I'd approach this same prediction problem (`[task]`) with a tree-based ensemble versus a neural network, given I have `[N]` rows and `[M]` features, mostly `[tabular/categorical/text/mixed]`.
10. Help me draft a one-page model framing document covering target definition, prediction window, training population, and exclusion criteria for `[use case]`, so I can validate the framing with stakeholders before writing any code.

## Implementation prompts (build & debug)

1. Write a scikit-learn pipeline that does `[preprocessing steps, e.g., "median imputation, one-hot encoding of categoricals, standard scaling of numerics"]` followed by a `[model, e.g., "gradient boosting classifier"]`, wrapped so it can be cross-validated without leakage.
2. My nested cross-validation setup for hyperparameter tuning on `[model]` is taking too long / giving unstable scores across folds — here's my code: `[paste code]`. Debug whether this is a search-space, fold-count, or data-size issue.
3. Set up a hyperparameter tuning run for `[XGBoost/LightGBM/random forest]` using `[Optuna/GridSearchCV/RandomizedSearchCV]` that optimizes for `[metric]`, with early stopping on a held-out validation fold, and explain what search space bounds make sense for `[N]` training rows.
4. Write code to compute SHAP values for my trained `[model type]` and produce a summary plot plus 3 individual force plots for representative predictions, formatted so I can hand the explanation to `[stakeholder role]` without them needing to know what SHAP is.
5. I'm getting `[describe symptom, e.g., "near-perfect training AUC but 0.55 test AUC"]` on `[model]` — help me debug whether this is overfitting, leakage, or a train/test distribution mismatch, and give me a checklist of diagnostics to run in order.
6. Refactor this feature engineering script `[paste code]` so the same transformations can be applied consistently at training time and inference time without train/serve skew.
7. Write a script to compare two model versions — `[model A description]` vs `[model B description]` — on the same held-out test set, reporting metric deltas, a McNemar's test or bootstrap confidence interval on the difference, and per-segment performance breakdown by `[segment, e.g., "customer tenure bucket"]`.
8. Implement threshold selection for my binary classifier that optimizes `[business metric, e.g., "expected cost given $X false positive cost and $Y false negative cost"]` rather than defaulting to 0.5, and show me the resulting precision/recall trade-off curve.
9. Debug why my `[model]` calibration curve is systematically off in the `[low/high]` probability range — here's my reliability diagram code and output: `[paste]`. Suggest whether Platt scaling or isotonic regression is more appropriate given `[N]` calibration samples.
10. Write a monitoring script that flags feature drift (e.g., PSI or KL divergence) between training data and the last `[N days/weeks]` of production scoring data for `[model]`, with alert thresholds I can tune.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a model validation strategy for a setting with `[describe non-IID structure, e.g., "geographic clustering and seasonal effects"]` that avoids both temporal leakage and spatial leakage simultaneously — walk through what the train/validation/test split should actually look like.
2. My production model's performance has degraded from `[metric at launch]` to `[metric now]` over `[time period]` — help me design a systematic investigation distinguishing concept drift, covariate shift, label drift, and pipeline/data-quality regressions.
3. I have a multi-class problem with severe imbalance across `[K]` classes (`[describe distribution]`) — compare hierarchical classification, one-vs-rest with per-class threshold tuning, and a cost-sensitive loss function approach, and recommend one given `[business priority, e.g., "minimizing false negatives on the rarest class"]`.
4. Walk me through how to build an ensemble that combines `[model A]` and `[model B]` (e.g., a linear model and a gradient boosting model) via stacking versus simple weighted averaging, and when the added complexity of stacking is actually justified given `[N]` validation samples.
5. I need to scale model retraining to `[N]` models across `[M]` segments (e.g., one model per region/product line) — help me design the infrastructure and validation approach so I can detect when a global model would outperform the segmented approach.
6. Critique this model interpretation: I'm using SHAP values to claim `[feature]` "causes" `[outcome]` in a stakeholder presentation — explain why this is a correlation/causation overreach and how I should rephrase the claim while still being useful to the audience.
7. Design an A/B test or shadow-deployment plan to validate that my new model (`[describe]`) is genuinely better than the production model (`[describe]`) before full rollout, including how to handle the case where offline metrics improved but online business KPIs are the real bar.
8. Help me reason through whether to use a single global model versus per-segment models for `[use case]` when segments have wildly different base rates (`[describe]`) — what's the right way to test this empirically rather than guessing?
9. I suspect my training data has selection bias because `[describe, e.g., "we only have labels for customers who were already approved"]` — explain how this would bias my model and what correction techniques (e.g., reject inference, inverse probability weighting) are applicable here.
10. Design a champion/challenger framework for continuously evaluating new model versions against the current production model on live traffic for `[use case]`, including how much traffic to allocate to challengers and what guardrail metrics should trigger automatic rollback.

## Follow-up / chaining prompts

1. Given the validation strategy you just proposed, now show me what the actual train/validation/test split code would look like for my specific data structure, with row counts at each stage.
2. Based on the SHAP analysis above, draft the 3-bullet, non-technical summary I'd put in a slide for `[stakeholder]`, translating the top 3 features into business language without using the word "SHAP."
3. Now that we've identified `[overfitting/leakage/drift]` as the likely cause, give me the specific code change to fix it, and a before/after metric comparison I should expect to see.
4. You recommended `[metric]` for model selection — now show me how that choice changes which of my two candidate models (`[A]` vs `[B]`) I should actually ship, using the numbers I gave you earlier.
5. Take the threshold-selection logic from before and extend it to show how the optimal threshold shifts if the false-negative cost assumption changes from `[$X]` to `[$Y]`.
6. Given the drift diagnosis above, now draft the alerting rule (metric, threshold, check frequency) I should add to my monitoring pipeline so this doesn't go undetected next time.

## Anti-patterns: prompts that get weak answers

**Weak:** "What model should I use for my data?"
**Sharper:** "I have 50,000 rows, 30 features (mostly categorical), a 4% positive class rate, and need to predict customer churn 90 days out — compare logistic regression, random forest, and LightGBM on interpretability, training time, and expected handling of the class imbalance."

**Weak:** "My model isn't working well, can you help?"
**Sharper:** "My XGBoost classifier gets 0.91 AUC on training data but 0.58 on a time-based test split — walk me through a checklist to distinguish leakage, overfitting, and train/test distribution shift, in priority order."

**Weak:** "Explain SHAP to me."
**Sharper:** "I have SHAP summary plot output showing 'tenure_months' and 'last_login_days_ago' as the top two features for my churn model — write the 3-sentence explanation I'd give a non-technical VP about what's driving the model's predictions, without using statistical jargon."

**Weak:** "Is my model good?"
**Sharper:** "My churn model has 0.78 AUC-ROC, 0.42 PR-AUC, and a Brier score of 0.15 on a held-out test set with 6% base rate — given that false negatives cost roughly 8x more than false positives in this business, tell me whether I should be optimizing threshold differently and whether PR-AUC or calibration matters more here."

**Weak:** "Should I use ML for this?"
**Sharper:** "Before building a gradient boosting model for fraud flagging, help me design a fair comparison against a rule-based heuristic that flags transactions over $X from new accounts — what offline evaluation would tell me if the heuristic alone captures 80%+ of the value?"

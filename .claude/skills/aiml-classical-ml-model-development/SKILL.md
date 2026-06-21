---
name: aiml-classical-ml-model-development
description: Curated prompts for building classical ML models — algorithm selection, scikit-learn/XGBoost/LightGBM implementation, hyperparameter tuning, cross-validation. Use for supervised or unsupervised modeling tasks.
---

# Classical ML Model Development — Prompt Library (AI/ML Engineer)

Classical ML — gradient-boosted trees, linear/logistic models, clustering, and their scikit-learn-shaped pipelines — remains the workhorse for tabular problems even as LLMs dominate headlines; in 2026 it's common to see XGBoost/LightGBM/CatBoost models in production alongside LLM-based features, often as the final ranking or scoring layer behind an agentic system. Good work here means the model is validated with a cross-validation strategy that actually matches the deployment scenario (time-series split for temporal data, stratified k-fold for imbalanced classes), tuned with a principled search (Optuna/Bayesian over grid search at any real scale), and explainable via SHAP/LIME well enough to defend to a stakeholder or auditor. The recurring failure modes are subtle: leakage through improper CV, overfitting to a validation set via excessive hyperparameter search, treating accuracy as the metric when the business cares about precision at a fixed recall, or picking an ensemble that adds complexity without measurable lift. This skill area is about disciplined model selection and validation, not just calling `.fit()`.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare logistic regression, random forest, and XGBoost for my [classification task] with [N] rows, [M] features (mix of numeric and categorical), and a [class imbalance ratio] — which should I prototype first and why?
2. Explain the difference between XGBoost, LightGBM, and CatBoost specifically around how each handles categorical features and missing values natively, given my dataset has [N] categorical columns with [cardinality description].
3. Walk me through choosing between k-fold, stratified k-fold, and `TimeSeriesSplit` for my [task] where the data has [temporal structure / class imbalance / grouped structure, e.g., multiple rows per patient] — what goes wrong if I pick the wrong one?
4. Compare grid search, random search, and Bayesian optimization (Optuna) for tuning [model type] with a [N]-dimensional hyperparameter space and a training run that takes [time] — at what point does Bayesian optimization actually pay off over random search?
5. Explain SHAP values versus LIME for explaining predictions from my [XGBoost/LightGBM] model to [stakeholder type, e.g., compliance team] — which gives more trustworthy global feature importance versus local per-prediction explanations?
6. Compare stacking, blending, and simple averaging ensembles for combining [model A] and [model B] on my [task] — under what conditions does an ensemble actually beat the best single model versus just adding latency?
7. I have [class imbalance ratio, e.g., 1:50] in my [binary classification] target — compare class-weighting, SMOTE, and threshold tuning on the precision-recall curve, and tell me which is appropriate given I care about [business metric, e.g., precision at 90% recall].
8. Explain the bias-variance trade-off concretely for my [decision tree depth / regularization strength] choice in [model type], using my validation curve showing [describe pattern, e.g., "train AUC 0.95, val AUC 0.79"] as the example.
9. Compare k-means, DBSCAN, and hierarchical clustering for my unsupervised task on [dataset description] where I [do/don't] know the expected number of clusters and the data has [shape/density characteristics].
10. Explain what model selection criteria (cross-validated AUC/F1 vs AIC/BIC vs business-metric-at-threshold) I should use to choose between [model A] and [model B] when their cross-validated scores differ by only [small margin] — is that difference statistically meaningful at [N] folds?

## Implementation prompts (build & debug)

1. Write a scikit-learn `Pipeline` that combines a `ColumnTransformer` (scaling numeric, encoding categorical) with an XGBoost classifier, wired so it's safe to pass directly into `GridSearchCV` or `Optuna` without leaking preprocessing statistics across folds.
2. Set up an Optuna study to tune [LightGBM] hyperparameters [num_leaves, learning_rate, min_child_samples, feature_fraction] with a [TPE/CMA-ES] sampler, pruning unpromising trials early using `MedianPruner`, optimizing for [metric] over [N] trials.
3. Debug why my cross-validated AUC is [0.89] but my held-out test AUC is [0.71] — here's my CV and preprocessing code: [paste code]. Find where the leakage or distribution mismatch is happening.
4. Write code to compute SHAP values for my trained [XGBoost] model on [N] test instances, then generate a summary plot and a force plot for the single highest-confidence false positive, so I can explain to [stakeholder] why the model got it wrong.
5. Implement stratified time-series cross-validation for my [forecasting/classification] task where data is grouped by [entity, e.g., customer_id] and ordered by [date column] — make sure no group leaks across the train/validation boundary.
6. Refactor this manual grid search loop into `GridSearchCV` (or Optuna if the space is large) with proper nested cross-validation so my reported performance isn't optimistically biased by hyperparameter tuning on the same folds used for evaluation: [paste code].
7. Write a stacking ensemble using scikit-learn's `StackingClassifier` that combines [LightGBM], [logistic regression], and [random forest] as base learners with a [logistic regression/XGBoost] meta-learner, and validate that it beats the best individual base learner via cross-validation, not just on one split.
8. Debug why my CatBoost model trained on [N] rows with [M] categorical features is overfitting (train logloss [X] vs val logloss [Y]) — walk through `depth`, `l2_leaf_reg`, and `bagging_temperature` settings I should try first.
9. Implement a custom scorer for `GridSearchCV`/`Optuna` that optimizes for precision at a fixed recall of [90%] rather than the default AUC or accuracy, since my business constraint is [false positive cost description].
10. Write code to detect and handle multicollinearity in my [linear/logistic regression] feature set using VIF (variance inflation factor), and show me how to decide which correlated feature to drop versus apply PCA/regularization instead.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a model selection protocol comparing [3-4 candidate model types] on my [task] that accounts for both cross-validated performance and inference latency, since my production SLA is [latency budget] at [QPS].
2. My XGBoost model's performance degrades [X%] within [timeframe] of deployment — design a monitoring and retraining strategy that distinguishes concept drift from data drift, and specify what statistical test triggers an automatic retrain versus a paged alert.
3. Critique my nested cross-validation setup for hyperparameter tuning plus unbiased performance estimation — here's the structure: [describe inner/outer fold counts and search method] — is the outer loop actually held out from all tuning decisions, including feature selection?
4. Design an ensembling strategy for combining a classical [LightGBM] model with predictions/embeddings from an LLM-based feature (e.g., sentiment score, entity extraction) — how do I validate the LLM-derived feature isn't leaking test-time information and is worth the added latency/cost?
5. Stress-test my [model type]'s robustness to adversarial or out-of-distribution inputs — for example [describe edge case, e.g., a feature value far outside training range] — and design a guardrail (input validation, prediction confidence thresholding) before this reaches production.
6. Evaluate whether my reported SHAP-based feature importances are stable across [N] bootstrap resamples of my training data — design an experiment to check if the top-5 features by SHAP importance change meaningfully, which would undermine the explanation I'm giving to [stakeholder].
7. Design a champion/challenger deployment strategy to compare my new [XGBoost v2] model against the current production [XGBoost v1] model using a [shadow deployment / A/B test], specifying the statistical test and minimum sample size to declare a winner on [business metric].
8. My imbalanced classification model (positive rate [X%]) needs to operate at a specific point on the precision-recall curve for [business reason] — design a threshold-selection and re-calibration strategy (Platt scaling/isotonic regression) that holds up when the class balance shifts in production.
9. Compare the computational and memory cost of deploying [XGBoost with N trees] versus [LightGBM with leaf-wise growth] versus a distilled single decision tree for my latency-constrained [edge/real-time] deployment target of [latency budget].
10. Design an interpretability-vs-performance trade-off analysis comparing a fully interpretable [logistic regression/GAM] against a [gradient-boosted tree ensemble] for my [regulated domain, e.g., credit/healthcare] use case, including what regulatory requirement (e.g., adverse action reasons) the simpler model satisfies that SHAP-on-a-black-box might not.

## Follow-up / chaining prompts

1. Now stress-test the Optuna-tuned LightGBM model you just configured against a held-out time period that's [N months] after training to check for temporal degradation before I trust the CV score.
2. Now explain the trade-off you just made choosing [class weighting] over [SMOTE] for the imbalance problem, and tell me at what imbalance ratio I'd need to switch approaches.
3. Take the stacking ensemble we just built and show me whether the lift over the single best base learner is statistically significant given [N] cross-validation folds, or whether it's noise.
4. Now recompute the SHAP analysis we just ran but on a stratified sample that includes more of the minority class, since the original sample under-represented [class], and tell me if the top features change.
5. Given the champion/challenger test design you proposed, calculate the minimum sample size and test duration needed to detect a [X%] lift in [metric] with [power/significance level].
6. Now take the threshold we tuned for 90% recall and show me how it should be re-calibrated if the production class balance shifts from [current ratio] to [new ratio].

## Anti-patterns: prompts that get weak answers

**Weak:** "What's the best model for classification?"
**Sharper:** "Compare XGBoost vs LightGBM vs logistic regression for a binary fraud classifier with 2M rows, 40 features, a 1:300 class imbalance, and a 50ms inference latency budget."

**Weak:** "How do I tune hyperparameters?"
**Sharper:** "Set up an Optuna study with TPE sampling and median pruning to tune LightGBM's num_leaves, learning_rate, and min_child_samples over 200 trials, optimizing for PR-AUC instead of accuracy."

**Weak:** "My model is overfitting, help."
**Sharper:** "My CatBoost model shows train logloss 0.12 vs validation logloss 0.41 after 500 iterations with depth=10 — walk through whether to reduce depth, increase l2_leaf_reg, or add bagging_temperature first."

**Weak:** "Explain SHAP."
**Sharper:** "Generate SHAP force plots for the 5 highest-confidence false positives from my XGBoost churn model so I can explain to the retention team why the model flagged low-risk customers."

**Weak:** "How do I validate my model properly?"
**Sharper:** "My data has multiple rows per patient_id and is ordered by visit_date — design a GroupKFold plus TimeSeriesSplit hybrid so no patient or future visit leaks across my train/validation boundary."

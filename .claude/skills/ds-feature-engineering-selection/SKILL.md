---
name: ds-feature-engineering-selection
description: Curated prompts for feature engineering and selection — transformations, interaction terms, dimensionality reduction, leakage checks. Use when preparing features for a predictive model.
---

# Feature Engineering & Selection — Prompt Library (Data Scientist)

Feature engineering is still where most of the predictive lift in real-world models comes from, even in 2026 when gradient boosting and deep learning can absorb some raw signal automatically — a well-constructed feature encodes domain knowledge a model can't infer from raw columns alone. This skill area covers transformations (log, Box-Cox, binning) to fix skew and non-linearity, interaction and polynomial features, categorical encoding choices (one-hot, target, embeddings) and their leakage risks, dimensionality reduction (PCA, UMAP) for high-dimensional or correlated feature spaces, and feature selection across the filter/wrapper/embedded spectrum (mutual information, recursive feature elimination, L1 regularization). It also covers the failure modes that quietly wreck models: high-cardinality categoricals that overfit, temporal leakage where a feature encodes information from after the prediction point, and over-engineering features no one can explain when a model goes to production. "Good" feature engineering is domain-driven first and statistically validated second — every feature should have a plausible causal or correlational story, pass a leakage check against the prediction timestamp, and have its importance interpreted with SHAP or permutation importance rather than just trusted because the model's accuracy went up. The single most expensive mistake in this area is leakage: a feature that's only available because the outcome already happened, producing a model that looks excellent offline and fails completely in production.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I have a heavily right-skewed feature (`[column name]`) feeding into `[model type, e.g., linear regression]` — compare log transform, Box-Cox, and quantile binning for normalizing it, and which preserves the most signal for this model type.
2. Explain when adding interaction terms (e.g., `[feature A] * [feature B]`) or polynomial features actually helps a model like `[model type]` versus when it just adds noise and overfitting risk.
3. I have a categorical feature with `[N]` unique values (`[column name]`) — compare one-hot encoding, target encoding, and learned embeddings for feeding this into `[model type]`, and what leakage risk each carries.
4. Walk me through when PCA is appropriate for dimensionality reduction on `[describe feature set, e.g., 200 correlated sensor readings]` versus when UMAP would preserve more useful structure for `[downstream task]`.
5. Compare filter methods (mutual information, correlation), wrapper methods (RFE), and embedded methods (L1/Lasso) for selecting features from a set of `[N]` candidates predicting `[target]` — which should I start with given `[N]` features and `[M]` rows?
6. I'm building features from `[describe time-series/event data]` to predict `[target]` at `[prediction time]` — walk me through how to audit each candidate feature for temporal leakage (information that wouldn't have been available at prediction time).
7. Explain how mutual information differs from a simple correlation coefficient for feature selection when the relationship between `[feature]` and `[target]` might be non-linear.
8. I have a high-cardinality categorical (`[column, e.g., zip code with 30K levels]`) — compare hashing, frequency-based bucketing, hierarchical rollup (e.g., zip → county → state), and target encoding with regularization for this case.
9. Walk me through how to generate domain-driven feature ideas for predicting `[target, e.g., loan default]` using `[available raw data sources]`, going beyond what's directly in the columns (e.g., ratios, rolling aggregates, recency/frequency features).
10. Explain what SHAP values tell me about feature importance for `[model type]` that a simple feature_importances_ / gain-based importance from the model doesn't.

## Implementation prompts (build & debug)

1. Write Python code to apply a log1p transform and a Box-Cox transform to `[column name]`, compare the resulting skewness, and pick the better one for `[model type]`.
2. Write code to generate pairwise interaction features between `[feature list]` and then filter them down using mutual information against `[target]` before they all go into the model.
3. Write a target encoding implementation with k-fold cross-fitting (to prevent leakage) for `[categorical column]` predicting `[target]`, and show how it differs from naive target encoding fit on the full training set.
4. Write code to run PCA on `[feature set]`, plot the cumulative explained variance, and decide how many components to keep to preserve `[X]%` of variance.
5. Debug this RFE (recursive feature elimination) run — it's selecting `[describe unexpected features, e.g., a feature I suspect is leaking]` as top predictors for `[target]`; help me check it against the prediction timestamp for leakage.
6. Write code using scikit-learn's `SelectKBest` with mutual information as the scoring function to select the top `[K]` features from `[feature set]` predicting `[target]`.
7. Write a feature pipeline (sklearn `Pipeline`/`ColumnTransformer`) that applies one-hot encoding to `[low-cardinality categoricals]`, target encoding to `[high-cardinality categoricals]`, and a log transform to `[skewed numeric columns]`, all leakage-safe within cross-validation folds.
8. Write code to compute SHAP values for `[model type]` trained on `[feature set]`, and produce a summary plot showing the top 15 features by mean absolute SHAP value.
9. Write an L1-regularized (Lasso) logistic regression on `[feature set]` predicting `[binary target]`, and extract which features were zeroed out at `[regularization strength]`.
10. Write a function that audits every feature in `[feature set]` against `[prediction timestamp column]` to flag any feature computed using data after that point in time (temporal leakage check).

## Advanced prompts (architecture, optimization, edge cases)

1. Critique this feature pipeline: I'm computing `[describe feature, e.g., a customer's lifetime average order value]` using all historical data including orders placed after the prediction point — walk me through the leakage this introduces and how to recompute it as a point-in-time-correct feature.
2. I have `[N]` candidate features and only `[M]` training examples — explain the overfitting risk of running wrapper-method feature selection (RFE) in this regime versus a simpler filter method, and how cross-validation should be nested around the selection step itself.
3. Design a feature store architecture for `[describe use case]` that guarantees point-in-time correctness for training versus serving, so the same feature logic can't drift between offline training and online inference.
4. Critique my use of target encoding on `[categorical column]` without k-fold cross-fitting — walk me through exactly how this leaks target information and inflates validation metrics relative to true production performance.
5. I have two highly correlated features (`[feature A]`, `[feature B]`, correlation `[value]`) both with high individual mutual information with `[target]` — explain how multicollinearity affects feature selection differently for a linear model versus a tree-based model, and whether I should drop one.
6. Walk me through the trade-off between PCA-transformed features (uninterpretable but decorrelated) and raw features with a tree-based model that handles correlation natively — which architecture should I choose for `[describe deployment constraint, e.g., a model that needs to be explainable to regulators]`?
7. Critique my plan to use an AI assistant to auto-generate dozens of candidate engineered features from raw columns — what's the risk of generating features that look statistically promising on training data but encode leakage or spurious correlation, and how should I gate AI-suggested features before including them?
8. I'm seeing SHAP importance rank `[feature]` very high, but domain experts are skeptical it should matter for `[target]` — walk me through how to investigate whether this is a genuine signal, a proxy for leakage, or a confound with `[other variable]`.
9. Design a feature selection strategy for a model that needs to be retrained weekly on `[describe streaming/refreshing data]` — should feature selection be re-run every retrain, or fixed and only the model refit, and what's the risk of each choice?
10. Explain how feature importance from SHAP can be misleading when features are highly correlated (e.g., `[feature A]` and `[feature B]` both encode similar information) — walk me through using SHAP interaction values or clustering correlated features before interpreting importance.

## Follow-up / chaining prompts

1. Given the leakage you just flagged in this feature, help me rewrite it as a strictly point-in-time-correct rolling aggregate using only data available before the prediction timestamp.
2. Now that PCA reduced this to `[K]` components, help me figure out which original features load most heavily onto the top 2 components so I can explain them to stakeholders.
3. Take the SHAP summary you just generated and help me identify which top features are plausible domain signal versus which might be proxies for a sensitive or leaking variable.
4. Based on the mutual information ranking you produced, help me decide a cutoff threshold for which features to drop rather than keeping an arbitrary top-K.
5. Now extend the k-fold target encoding pipeline you wrote to also produce a smoothed/regularized version for categories with very few observations.
6. Given the multicollinearity you identified between these two features, show me how the model's coefficients or SHAP values change if I drop one versus keep both with regularization.

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I engineer good features?"
**Sharper:** "I'm predicting loan default using application data — help me brainstorm domain-driven features like debt-to-income ratio, recent credit inquiry count, and payment-to-due-date timing, beyond the raw columns I already have."

**Weak:** "What encoding should I use for this categorical column?"
**Sharper:** "I have a 'merchant_category' column with 5,000 unique values feeding a gradient boosting model — compare k-fold target encoding versus frequency encoding versus hashing for leakage risk and cardinality handling."

**Weak:** "Help me reduce dimensions in my dataset."
**Sharper:** "I have 200 correlated sensor readings and want to reduce to a manageable feature set for a downstream anomaly detection model — compare PCA (linear, interpretable loadings) versus UMAP (non-linear, better cluster separation) for this use case."

**Weak:** "Is this feature leaking?"
**Sharper:** "I'm using 'total_lifetime_orders' as a feature to predict churn at month 6, but the calculation includes orders placed after month 6 — walk me through rewriting this as a point-in-time feature using only data available through month 6."

**Weak:** "Which features matter most in my model?"
**Sharper:** "My SHAP summary plot ranks 'account_age_days' as the top feature for predicting upgrade likelihood, but it's highly correlated with 'total_logins' — help me use SHAP interaction values to figure out if one is just a proxy for the other."

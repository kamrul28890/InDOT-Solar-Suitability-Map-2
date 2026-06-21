---
name: aiml-data-pipeline-feature-engineering
description: Curated prompts for building ML data pipelines and feature engineering — ETL/ELT design, feature stores, leakage prevention, scaling/encoding. Use when designing or debugging data prep for an ML model.
---

# Data Pipeline & Feature Engineering — Prompt Library (AI/ML Engineer)

Data pipelines and feature engineering are the substrate everything else in ML sits on — in 2026 this means ELT pipelines feeding both batch training jobs and low-latency online feature stores (Feast, Tecton), with strict train/serve parity enforced by schema contracts (Great Expectations, Pandera) rather than tribal knowledge. Good work here is judged by reproducibility (DVC-pinned datasets), leakage-free feature construction, and the ability to explain exactly why a feature exists and how it's computed identically at training and inference time. The hard failures are silent: a feature that uses future information, a categorical encoder fit on the full dataset before the split, a streaming feature that drifts from its batch backfill. As pipelines increasingly feed both classical models and LLM/RAG systems, engineers also need to reason about hybrid concerns like embedding freshness and synthetic data augmentation. This skill area is about catching those failure modes before they reach production, not just writing transformation code.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare ELT vs ETL architectures for my pipeline where raw data lands in [data warehouse, e.g., Snowflake/BigQuery] from [source systems] and needs to feed a [model type] training job — which transformations belong upstream in SQL/dbt versus downstream in Python feature code, and why?
2. Explain the architectural differences between Feast and Tecton for serving features to a [real-time/batch] model with a [latency budget, e.g., <50ms] requirement, and tell me which fits a team with [team size/infra constraints].
3. Walk me through how train/serve skew typically creeps into a pipeline where training features are computed in a batch Spark/Pandas job but serving features are computed in an online store — give me the 5 most common root causes.
4. I have a dataset with [X%] missing values concentrated in [feature names/columns] — compare MICE, KNN imputation, and a missingness-indicator-plus-median approach for my [downstream model type], including how each interacts with tree-based vs linear models.
5. My target classes are imbalanced at [ratio, e.g., 1:200] — compare SMOTE, class weighting, and threshold-moving for a [model type] trained on [data size] rows, and tell me which combinations are redundant or counterproductive.
6. Explain when I should compute a feature as a streaming/online feature (e.g., via Flink or Kafka Streams) versus a nightly batch feature, using my use case of [feature description, e.g., "user's transaction count in the last 10 minutes"] as the running example.
7. Compare Great Expectations and Pandera for schema validation on a pipeline that ingests [data format, e.g., Parquet files from S3] daily — what's the right point in the DAG to run each kind of check?
8. Explain how DVC versioning works alongside a feature store like Feast — when I retrain a model, what exactly needs to be pinned (raw data snapshot, transformation code, feature store entity version) to guarantee I can reproduce [model version]'s training set exactly?
9. I'm considering synthetic data generation (SDV, CTGAN, or simple bootstrapping) to augment a minority class with only [N] real examples — explain the risks of training on synthetic data for [model type] and how to validate the synthetic distribution actually matches the real one.
10. Compare one-hot encoding, target encoding, and embedding-based encoding for a high-cardinality categorical feature with [N] unique values (e.g., zip codes, SKUs) feeding into [model type] — which leaks target information and how do I guard against it during cross-validation?

## Implementation prompts (build & debug)

1. Write a dbt model plus a Pandera schema check that transforms [raw table] into a feature table with columns [list columns], enforcing non-null constraints on [critical columns] and a valid range check on [numeric column].
2. Refactor this feature engineering script so that all fit-time statistics (means, encoders, scalers) are computed only on the training fold and applied via `.transform()` to validation/test — here's the current code: [paste code]. Flag every line where leakage could occur.
3. Debug why my time-series model's offline validation AUC is [0.91] but production AUC is [0.68] — here's my feature computation code for both the training pipeline (batch) and the serving pipeline (Feast online store): [paste both]. Find the train/serve skew.
4. Write a Feast feature view definition for [entity, e.g., user_id] with features [list features] that have a TTL of [duration] and backfill from [source table], then show me how to validate point-in-time correctness against the offline store.
5. Implement a leakage detector that scans my feature set for [N] features against my target [target column] using time-based correlation checks — flag any feature whose correlation with the target spikes suspiciously after [event, e.g., the labeling date].
6. Write a Great Expectations suite for a pipeline that ingests [data source] with expected dtypes [list], a not-null constraint on [columns], and a distribution check that flags if the mean of [numeric column] drifts more than [X%] from the [baseline window].
7. Build a scikit-learn `ColumnTransformer` pipeline that applies [StandardScaler/RobustScaler] to [numeric columns], target encoding to [categorical columns with high cardinality], and one-hot encoding to [low-cardinality columns], and wrap it so it's safe to use inside cross-validation without leakage.
8. Debug this DVC pipeline stage where re-running `dvc repro` doesn't pick up changes to my feature transformation code in [script path] — here's my `dvc.yaml`: [paste]. Identify why the dependency tracking is missing the change.
9. Write a backfill job that computes [streaming feature, e.g., 7-day rolling spend] for the last [N days] from raw event logs so the batch-computed history matches what the streaming job would have produced in real time — flag any windowing edge cases (late-arriving events, timezone boundaries).
10. Implement a missing-data handling strategy for [feature name] that differs by missingness mechanism — write code that distinguishes MCAR from MAR/MNAR using [statistical test, e.g., Little's MCAR test] before choosing an imputation method.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a feature store architecture that serves [N] features to a [QPS, e.g., 10k requests/sec] real-time model while also supporting point-in-time-correct historical retrieval for retraining — compare a Feast + Redis/DynamoDB online store against a Tecton-managed approach for this scale.
2. My ELT pipeline processes [data volume, e.g., 500GB/day] and the feature computation stage is the bottleneck — profile where I'd get more from switching Pandas to Polars/DuckDB versus rewriting the join logic in Spark, given my cluster is [spec].
3. Design a data contract between the team producing [upstream table] and my feature pipeline so that schema-breaking changes (column renames, type changes, semantic drift in [column]) are caught in CI before they hit production — what would the Pandera/Great Expectations check look like and where does it run in the deploy pipeline?
4. Stress-test my feature pipeline's handling of late-arriving and out-of-order events for [streaming feature] — what happens to point-in-time correctness if an event for [timestamp] arrives [N hours] after the window closed, and how do Flink watermarks or Kafka Streams grace periods change the answer?
5. Design a strategy to detect and alert on feature drift in production for [N] features feeding [model name] — compare population stability index (PSI), KL divergence, and a Kolmogorov-Smirnov test for [feature types: continuous vs categorical], and tell me what thresholds are reasonable false-positive rates.
6. I need to support both a nightly batch training pipeline and a sub-100ms online inference path from the same feature definitions — design the architecture so feature logic isn't duplicated (consider Tecton's declarative transformations or Feast's on-demand transforms) and explain the consistency guarantees each gives me.
7. Critique this data leakage scenario: a feature is computed as "average claim amount for this customer" using a window that includes the current row being predicted — walk through every place in a pipeline (SQL, Pandas groupby, feature store TTL config) this could silently happen and how to add a regression test that catches it.
8. Design a synthetic data generation strategy using [CTGAN/SDV/diffusion-based tabular model] to address class imbalance in [dataset description], and specify the validation protocol (e.g., train-on-synthetic-test-on-real, discriminator-based fidelity scores) I'd need before trusting it in production.
9. My feature pipeline needs to support GDPR-style "right to be forgotten" deletion requests that must propagate to [feature store], [DVC-tracked datasets], and [model training snapshots] — design the deletion and re-training audit trail.
10. Evaluate whether embeddings from a pretrained model (e.g., for [text/image column]) should be precomputed and stored as a feature versus computed on-the-fly at inference, given a refresh cadence of [frequency] and a model update cycle of [frequency] — what staleness risks does each introduce?

## Follow-up / chaining prompts

1. Now stress-test the feature store design you proposed for the case where the online store and offline store fall out of sync during a [Feast materialization job] failure — how would I detect it and what's the safe failure mode?
2. Now explain the trade-off you just made choosing [target encoding] over [one-hot encoding] for the high-cardinality feature, and tell me the data volume or cardinality threshold at which I should switch back.
3. Take the leakage-free cross-validation pipeline you just built and extend it to a time-series setting using `TimeSeriesSplit` or a custom walk-forward validator — what changes about how the encoders/scalers are fit per fold?
4. Now estimate the cost (compute + storage) of running the Tecton/Feast architecture you designed at [10x current scale], and tell me which component becomes the bottleneck first.
5. Given the drift detection thresholds you proposed, design the automated retraining trigger — what PSI/KS-statistic value should kick off a retrain versus just an alert to a human?
6. Now show me how to write a regression test (pytest + Great Expectations) that would have caught the train/serve skew bug we just diagnosed, so it can't silently regress again.

## Anti-patterns: prompts that get weak answers

**Weak:** "What are best practices for feature engineering?"
**Sharper:** "Compare target encoding vs one-hot encoding for a 50,000-category SKU feature feeding an XGBoost model trained on 2M rows, specifically how each interacts with 5-fold cross-validation leakage."

**Weak:** "How do I handle missing data?"
**Sharper:** "I have 18% missing values in 'last_login_days' that are MNAR (missingness correlates with churn) — compare a missingness-indicator-plus-median strategy against MICE for a LightGBM churn model, and tell me which preserves the MNAR signal."

**Weak:** "My pipeline is slow, how do I speed it up?"
**Sharper:** "My nightly Pandas feature pipeline processes 500GB and takes 6 hours, bottlenecked at a groupby-rolling-window step on 200M rows — would switching to Polars or pushing the window computation into a Snowflake SQL window function get me under 1 hour?"

**Weak:** "Explain feature stores."
**Sharper:** "Compare Feast's on-demand transformations against Tecton's batch+streaming pipelines for serving a 'transactions in last 10 minutes' feature at 10k QPS with a 50ms p99 latency budget."

**Weak:** "How do I prevent data leakage?"
**Sharper:** "Audit this scikit-learn pipeline for leakage where StandardScaler.fit() is called before train_test_split — show me exactly which rows of test data influenced the training statistics and how to refactor with Pipeline/ColumnTransformer to fix it."

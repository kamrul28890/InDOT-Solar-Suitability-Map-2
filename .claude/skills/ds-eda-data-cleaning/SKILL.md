---
name: ds-eda-data-cleaning
description: Curated prompts for exploratory data analysis and data cleaning — profiling, outlier detection, missing-data handling. Use when starting analysis on a new or messy dataset.
---

# Exploratory Data Analysis & Data Cleaning — Prompt Library (Data Scientist)

EDA and data cleaning are the foundation every downstream model, dashboard, and decision rests on, and in 2026 they happen increasingly inside cloud notebooks (Databricks, Snowflake Notebooks, Hex) where profiling a new table can mean scanning billions of rows rather than a local CSV. This skill area covers systematically understanding a new or messy dataset: profiling distributions and types, deciding between imputation and removal for missing values, catching outliers with IQR/z-score/isolation forest methods, validating joins didn't silently fan out rows, and encoding categoricals sensibly before they hit a model. "Good" EDA produces a documented, reproducible trail of decisions — not just a `.describe()` call — because every cleaning choice (drop vs impute, winsorize vs cap, collapse vs keep a rare category) changes the answer downstream, and a reviewer or auditor six months later needs to see why each call was made. The discipline matters most when data quality issues are silent: a mis-joined key or a column that's 40% null in one segment can quietly bias every metric and model trained on top of it.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I just loaded `[dataset name/table]` with `[N rows, M columns]` — walk me through a structured data profiling plan covering dtype consistency, cardinality of categorical columns, percent missing per column, and which columns are likely keys versus measures.
2. Explain the practical difference between IQR-based outlier detection, z-score thresholds, and isolation forest for a column like `[column name]` that has `[describe distribution shape, e.g., right-skewed with a long tail]` — which would you reach for first and why?
3. I have `[X]%` missing values in `[column name]`, and the missingness `[seems random / correlates with another column like region or signup_date]` — help me reason through MCAR vs MAR vs MNAR for this case and what that implies for imputation choice.
4. Compare mean imputation, median imputation, KNN imputation, and MICE (multiple imputation) for `[column name]` in a dataset where `[describe the use case, e.g., the column feeds a churn model]` — what are the bias/variance trade-offs of each?
5. What's the difference between a correlation matrix using Pearson, Spearman, and Kendall's tau for `[describe variable types, e.g., one ordinal and one continuous column]`, and which should I use to screen for redundant features before modeling?
6. I'm deciding how to encode a categorical column with `[N]` unique values (`[column name]`) — compare one-hot, target/mean encoding, and frequency encoding for this cardinality and tell me what data leakage risks each introduces.
7. Walk me through how to sanity-check a join between `[table A]` and `[table B]` on key `[join key]` to confirm I'm not fanning out rows or silently dropping unmatched records.
8. What does a "data quality score" typically combine (completeness, uniqueness, validity, consistency, timeliness) and how would you weight those dimensions for a dataset used for `[downstream use case, e.g., regulatory reporting]`?
9. I'm seeing duplicate-looking records in `[table name]` that aren't exact duplicates — differing only in `[describe the discrepancy, e.g., trailing whitespace or casing in an email field]` — what's a systematic way to detect and reconcile near-duplicates like this?
10. Explain how skewness and kurtosis values for `[column name]` (skew = `[value]`, kurtosis = `[value]`) should inform whether I log-transform, winsorize, or leave the column as-is before EDA visualizations.

## Implementation prompts (build & debug)

1. Write a Python (pandas) profiling function that, for every column in `[dataframe name]`, reports dtype, % missing, # unique values, and — for numeric columns — skew, kurtosis, and IQR-based outlier count.
2. Write a function that flags outliers in `[column name]` using both the 1.5×IQR rule and a z-score threshold of `[e.g., 3]`, and returns a comparison of which rows each method catches that the other misses.
3. Debug this pandas merge — I expect `[N]` rows after joining `[table A]` and `[table B]` on `[key]` but I'm getting `[M]` rows; here's the code: `[paste code]`.
4. Write code to implement isolation forest outlier detection on `[columns]` using scikit-learn, including how to choose the `contamination` parameter when I don't know the true outlier rate.
5. Build a missing-data heatmap and a missingno-style visualization for `[dataframe name]` to check whether missingness in `[column A]` correlates with `[column B]`.
6. Write a reusable function that applies MICE-based multiple imputation (via `sklearn.experimental.IterativeImputer` or `miceforest`) to `[columns]` and returns both the imputed dataframe and an imputation-uncertainty diagnostic.
7. Debug why my target encoding for `[categorical column]` is leaking — I'm seeing suspiciously high correlation between the encoded column and the target on my training set but it collapses on holdout.
8. Write a data validation script (using `pandera` or `great_expectations`) that asserts schema, range, and null constraints for `[dataset name]` before it's allowed to proceed to feature engineering.
9. Write code to detect and resolve near-duplicate records in `[table name]` using fuzzy matching (`rapidfuzz` or `recordlinkage`) on `[fields, e.g., name + email]`.
10. Generate a markdown EDA summary report template (in code) that auto-populates column stats, missingness, outlier counts, and flags for `[dataset name]` so findings are documented, not just eyeballed in a notebook.

## Advanced prompts (architecture, optimization, edge cases)

1. I'm profiling a table with `[N]` billion rows in `[Databricks/Snowflake]` — what's the right approach to approximate profiling (e.g., `approx_count_distinct`, sampling strategy, `TABLESAMPLE`) instead of full scans, and what accuracy do I give up?
2. Critique this imputation strategy: I'm using median imputation for `[column]` across the whole dataset, but the column's distribution clearly differs by `[segment, e.g., region]` — what's the risk and how would you fix it with group-wise or model-based imputation?
3. How should outlier detection change when `[column name]` is known to be heavy-tailed/power-law distributed (e.g., revenue, latency) rather than approximately normal — does the IQR rule still apply, and what's the alternative?
4. Walk me through the edge case where isolation forest flags `[X]%` of a column as outliers, but domain knowledge says the true anomaly rate is closer to `[Y]%` — how do I diagnose whether the model or my expectation is wrong?
5. Design a data quality monitoring pipeline that re-runs my EDA checks (missingness, cardinality drift, outlier rate) on `[dataset name]` every time it refreshes, and alerts when a metric moves beyond `[threshold]` from baseline.
6. I have a high-cardinality categorical column (`[N]` unique values) that's also sparse (`[X]%` of categories appear fewer than `[Y]` times) — compare hashing trick, embedding-based encoding, and category collapsing/"other" bucketing for this case.
7. Explain the failure mode where dropping rows with missing values in `[column]` silently introduces selection bias, and how I'd test for that bias using a missingness-indicator regression.
8. Critique my plan to use an LLM to auto-generate EDA summaries directly from raw data for `[dataset name]` — what are the risks of the LLM hallucinating statistics versus computing them, and how should I architect the pipeline so the LLM only narrates pre-computed numbers?
9. How do I reconcile conflicting outlier signals when IQR, z-score, and isolation forest each flag a different subset of rows in `[column/dataset]` — what's a principled way to combine or arbitrate between them rather than picking one arbitrarily?
10. I joined three tables (`[A, B, C]`) on different keys and the row count exploded unexpectedly — walk me through a systematic debugging approach (cardinality checks per key, join type audit, intermediate row counts) to find where the fan-out happened.

## Follow-up / chaining prompts

1. Given the profiling results you just summarized, which 3 columns would you prioritize cleaning first, and why those over the others?
2. Now that we've picked `[imputation method]` for `[column]`, show me how to validate the imputation didn't distort the original distribution (e.g., compare pre/post histograms and summary stats).
3. Based on the outlier rows you just flagged, help me decide which should be removed, capped/winsorized, or kept as legitimate extreme values given that this data feeds `[downstream use case]`.
4. Take the data quality score you proposed earlier and turn it into a single composite metric I can track over time as this dataset refreshes.
5. Now extend the join sanity-check you wrote into an automated test that runs before every pipeline execution and fails the build if row counts deviate beyond `[tolerance]`.
6. Given the near-duplicate clusters you found, write the deduplication logic that picks a canonical record per cluster using `[tie-breaking rule, e.g., most recent updated_at]`.

## Anti-patterns: prompts that get weak answers

**Weak:** "What are best practices for cleaning data?"
**Sharper:** "I have a 2M-row customer table with 18% missing values in `last_purchase_date` that correlates with `account_status` — should I treat this as MAR and use group-wise median imputation, or is that introducing bias?"

**Weak:** "How do I find outliers?"
**Sharper:** "Compare IQR, z-score (threshold 3), and isolation forest for detecting outliers in a right-skewed `transaction_amount` column with a few extreme high-value B2B orders mixed into mostly small consumer purchases."

**Weak:** "My data has duplicates, help."
**Sharper:** "I'm seeing near-duplicate customer records that differ only in casing and trailing whitespace in the `email` field — write a fuzzy-matching dedup script using rapidfuzz with a similarity threshold of 0.92."

**Weak:** "Is my join correct?"
**Sharper:** "I joined `orders` to `customers` on `customer_id` expecting 500K rows but got 612K — walk me through checking cardinality on the join key in both tables to find where the fan-out is happening."

**Weak:** "Should I encode this categorical column?"
**Sharper:** "I have a categorical column with 4,000 unique store IDs and want to feed it into a gradient boosting model — compare target encoding with k-fold cross-fitting versus frequency encoding for leakage risk and predictive power."

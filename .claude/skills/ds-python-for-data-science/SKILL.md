---
name: ds-python-for-data-science
description: Curated prompts for Python data-science workflows — pandas/numpy efficiency, reproducible analysis, packaging notebooks into reusable code. Use when writing or refactoring data-science Python code.
---

# Python for Data Science — Prompt Library (Data Scientist)

Writing Python that's merely "correct" stopped being good enough years ago — in 2026, data scientists are expected to write code that's efficient on real data volumes, reproducible by someone else (or by future you), and structured well enough to survive the move from a notebook into a shared repo or scheduled job. This covers the classic pandas/numpy performance traps (chained indexing, row-wise `.apply()` instead of vectorized operations, `.loc`/`.iloc` misuse), memory-efficient handling of large dataframes (dtype downcasting, `category` dtype, chunked reads), reproducible notebook practices (seed-setting, parameterization instead of hardcoded constants), testing data transformations with pytest, sane dependency management (Poetry/conda with pinned lockfiles), and parallelization options (vectorization first, then Dask or multiprocessing) when a single core genuinely isn't enough. Good work here looks like code that runs in roughly the same time on 10x the data, that a teammate can clone and run identically, and that has at least minimal test coverage on the transformation logic that actually matters for correctness — not 100% coverage on everything, but coverage where a silent bug would be expensive.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain why chained indexing like `df[df.col > 0]['other_col'] = 1` triggers pandas' `SettingWithCopyWarning`, and walk me through the correct `.loc`-based pattern to avoid it in my [task description] code.
2. Walk me through when `.apply()` on a pandas DataFrame is actually unavoidable versus when it's hiding a vectorizable operation, using my use case of [describe the row-wise operation] as the example.
3. I have a DataFrame with [number] rows and [number] columns that's using more memory than expected. Explain how dtype downcasting and the `category` dtype for low-cardinality string columns could reduce memory footprint, and how to measure the before/after with `df.memory_usage()`.
4. Explain the difference between `.loc[]`, `.iloc[]`, and plain bracket indexing in pandas, and give me a concrete example of where misusing them silently returns a copy instead of a view, causing a downstream bug.
5. I'm deciding between Dask, multiprocessing, and plain NumPy vectorization to speed up [operation] on a dataset of [size]. Walk me through which one is appropriate at this scale and what the diminishing returns look like for each.
6. What does a reasonable src/notebooks/tests repo layout look like for a data science project with [number] notebooks and [number] reusable transformation functions, and how should imports work between notebooks and the src package?
7. Explain the difference between using Poetry, conda, and a plain pip `requirements.txt` with pinned versions for managing dependencies on a project that needs both [package A] and [package B] with potentially conflicting sub-dependencies.
8. Walk me through what "reproducible" actually requires for a notebook beyond setting `random_state` — covering library version pinning, data snapshotting, and execution order — using my [project type] notebook as the example.
9. I want to convert some notebook cells into a tested, reusable function. Explain how to identify which notebook code is genuinely reusable logic versus exploratory one-off code that shouldn't be promoted into the module.
10. Explain how `%%timeit` and `line_profiler` differ for profiling slow pandas code, and which one I should reach for first when I just know "this cell is slow" versus when I need to find the exact slow line inside a function.

## Implementation prompts (build & debug)

1. Here is my pandas code using `.apply()` row-wise to compute [describe operation] over [number] rows — refactor it into a vectorized version using NumPy or pandas built-ins, and benchmark both with `%%timeit`.
2. Refactor this chunk of notebook code that loads, cleans, and transforms [data description] into a set of testable functions in a `src/` module, keeping the notebook as a thin orchestration layer that just calls the functions.
3. Write a pytest test suite for this data transformation function that checks expected output shape, correct handling of null values, and a known input/output example for [transformation logic].
4. My DataFrame load is using [amount] of memory and crashing on my machine for a [size] CSV. Write a chunked-reading approach using `pd.read_csv(chunksize=...)` or `dtype` specification upfront to reduce memory footprint.
5. Help me parameterize this notebook so that [hardcoded values, e.g., date range, file paths, thresholds] are read from a config dict or papermill parameters cell at the top, instead of being hardcoded throughout.
6. Profile this function using `line_profiler` — it processes [number] rows and currently takes [time] — and help me identify which specific lines are the bottleneck before I optimize anything.
7. Write a `pyproject.toml` for Poetry that pins [list key packages] to specific versions for my project, and explain how to generate a lockfile that a teammate can use to get an identical environment.
8. Help me rewrite this nested for-loop over [number] groups, currently using `groupby().apply()` with a custom Python function, into a vectorized `groupby().transform()` or `groupby().agg()` call that avoids the Python-level loop overhead.
9. I need to parallelize [operation] across [number] independent files/partitions. Write a Dask-based version of this currently-sequential pandas pipeline, and explain what changes about the code's behavior (laziness, `.compute()`) versus plain pandas.
10. Write a `conftest.py` and pytest fixtures for testing my data pipeline functions that need a small synthetic DataFrame resembling [real data schema] instead of loading the actual production data in tests.

## Advanced prompts (architecture, optimization, edge cases)

1. My pandas pipeline that runs fine on [current size] is going to need to handle [10x size] next quarter. Walk me through which parts of the pipeline (vectorized operations, groupby, merges) will degrade non-linearly and what the migration path to Dask or DuckDB looks like.
2. Design a testing strategy for a data transformation pipeline where the "correct" output is itself ambiguous (e.g., business logic for handling edge cases in [domain] isn't fully specified) — how do I write meaningful tests when the ground truth is partly a judgment call?
3. I have a `groupby().apply()` operation with a custom aggregation function over [number] groups that's the main bottleneck in my pipeline. Walk me through the trade-offs of rewriting it in vectorized pandas, Numba-compiled NumPy, or pushing the aggregation into a database/DuckDB query.
4. Walk me through designing a reproducible random seed strategy for a pipeline that includes train/test splitting, model training with inherent randomness, and downstream sampling for evaluation — where do seeds need to be set, and where does true reproducibility break down even with seeds set (e.g., multi-threaded BLAS operations)?
5. I'm deciding whether to migrate a memory-constrained pandas pipeline to Polars for [operation, e.g., joins/groupbys on a 20GB dataset]. Help me design a side-by-side benchmark and identify which specific operations benefit most from Polars' lazy evaluation and multi-threading.
6. Design a repo structure and CI setup for a data science project with [number] contributors where notebooks, a shared `src/` package, and tests all need to coexist without notebook merge conflicts becoming unmanageable.
7. I have categorical features with high cardinality ([number] unique values) that are blowing up memory when I one-hot encode them. Walk me through memory-efficient alternatives (category dtype + native categorical handling in [library], hashing, target encoding) and the trade-offs of each for my [model type] use case.
8. Walk me through profiling a pipeline end-to-end — not just one slow cell — to find whether the bottleneck is I/O (reading [data source]), CPU-bound transformation, or memory pressure causing swapping, and what tools (`memory_profiler`, `py-spy`, `cProfile`) are appropriate for each.
9. Design a strategy for safely refactoring a [number]-line legacy notebook with no tests into tested, modular code, without breaking the existing (undocumented) behavior that downstream consumers may be implicitly relying on.
10. I need this pipeline to run identically on my laptop (for development) and in a scheduled cloud job (for production), but I'm hitting subtle differences (different pandas/NumPy versions, different available memory). Walk me through how to pin the environment with Docker or a strict lockfile so behavior is identical in both places.

## Follow-up / chaining prompts

1. Given the vectorized version of the `.apply()` code you just wrote, help me now write the `%%timeit` benchmark comparing it against the original row-wise version on my actual data size of [number] rows, so I can quantify the speedup.
2. Based on the pytest suite we just wrote for this transformation function, help me add property-based tests using Hypothesis to catch edge cases like empty DataFrames, all-null columns, and unexpected dtypes that I didn't think to write explicit examples for.
3. Now that we've refactored the notebook into `src/` functions, help me write the pytest fixtures and synthetic test data needed to actually test these functions in isolation from the notebook.
4. Given the memory profiling results we just got showing [bottleneck], help me decide whether dtype optimization alone is enough or whether I genuinely need to move to chunked processing or Dask for this dataset size.
5. Based on the Poetry lockfile we just generated, help me write a short README section explaining to a new teammate exactly how to reproduce this environment from scratch, including Python version requirements.
6. Now that we've identified the `groupby().apply()` bottleneck, help me rewrite it as a vectorized `groupby().transform()` and verify the output matches the original row-for-row before I replace it in the pipeline.

## Anti-patterns: prompts that get weak answers

**Weak:** "Why is my pandas code slow?"
**Sharper:** "I have a `.apply()` call computing a custom score row-wise over 2 million rows that takes 90 seconds — help me refactor it into a vectorized NumPy operation and benchmark the speedup with `%%timeit`."

**Weak:** "Make my notebook into real code."
**Sharper:** "Refactor this notebook's data-cleaning cells into testable functions in a `src/` module, keeping the notebook as a thin orchestration layer, and write a pytest suite covering null-handling and schema checks."

**Weak:** "My code uses too much memory."
**Sharper:** "My 8GB CSV load is crashing on a 16GB machine — help me reduce memory footprint using dtype downcasting and the `category` dtype for my 5 low-cardinality string columns, and show the before/after with `df.memory_usage()`."

**Weak:** "How do I manage Python dependencies?"
**Sharper:** "Write a Poetry `pyproject.toml` pinning pandas, scikit-learn, and xgboost to specific versions for my project, and explain how a teammate reproduces the exact environment from the lockfile."

**Weak:** "Help me parallelize this."
**Sharper:** "I need to parallelize a per-file feature extraction step across 500 independent CSV files — write a Dask-based version of my current sequential pandas loop and explain how `.compute()` changes the execution model versus plain pandas."

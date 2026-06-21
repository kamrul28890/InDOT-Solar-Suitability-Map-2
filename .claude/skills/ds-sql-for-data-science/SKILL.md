---
name: ds-sql-for-data-science
description: Curated prompts for SQL analysis — window functions, CTEs, query optimization, complex joins. Use when writing or debugging SQL queries for data analysis.
---

# SQL for Data Science — Prompt Library (Data Scientist)

SQL remains the primary interface between a data scientist and the warehouse in 2026 — even with AI copilots generating first-draft queries in Databricks SQL, Snowflake, and BigQuery, the analyst still has to know whether a window function or a self-join is the right tool, why a query is slow, and whether NULLs are quietly breaking an aggregate. This skill area covers window functions (`ROW_NUMBER`, `RANK`, `LAG`/`LEAD`), CTEs versus subqueries, self-joins, reading `EXPLAIN` plans to fix performance, pivoting/unpivoting, cohort and funnel analysis, dedup logic, date/time bucketing, and — critically — translating a vague business question ("how many active users do we have") into a precise, defensible query with an explicit definition of "active." Good SQL for analysis is correct under edge cases (ties in ranking, NULLs in joins, timezone boundaries in date bucketing), readable enough that a teammate can audit the logic in a code review, and performant enough that it doesn't fall over when the table goes from a million to a billion rows. The discipline that separates a junior analyst's query from a senior data scientist's is precisely in how NULLs, duplicates, and ambiguous business definitions are handled before the first `SELECT` is written.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain the difference between `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()` when there are ties in `[column to order by, e.g., order_date]`, and tell me which one I should use to pick the "first" record per `[partition key, e.g., customer_id]`.
2. Compare `LAG`/`LEAD` versus a self-join for computing `[describe the metric, e.g., month-over-month change in revenue per account]` — when is the window function clearly better?
3. Walk me through when a CTE is preferable to a subquery for `[describe the query goal]`, and when a CTE actually hurts performance versus a derived table or temp table in `[your warehouse, e.g., Snowflake/BigQuery/Databricks SQL]`.
4. I need to build a cohort retention table for users who signed up in `[time period]` — explain the standard pattern for cohort analysis in SQL (cohort definition, period offset, retention matrix) before I write the query.
5. Explain how `[your warehouse]`'s query optimizer uses statistics and partitioning/clustering keys, and what I should look for in an `EXPLAIN` plan to know if my query on `[table name]` is doing a full table scan it shouldn't be.
6. What's the cleanest way to pivot `[describe long-format data, e.g., one row per metric per day]` into wide format in SQL without relying on a fixed, hardcoded list of columns?
7. Compare three approaches to deduplicating rows in `[table name]` on key `[column]` when there's no reliable timestamp to break ties: `ROW_NUMBER() OVER (PARTITION BY ...)`, `GROUP BY` with aggregate, and `DISTINCT ON` (if on Postgres) — what are the trade-offs?
8. Explain how NULLs behave in `[JOIN type, e.g., a LEFT JOIN combined with a WHERE clause filter]` and why my filter might be silently turning it into an inner join.
9. I need to bucket events into `[granularity, e.g., 15-minute or weekly]` windows that respect `[timezone, e.g., US/Eastern]` rather than UTC — explain the date/time bucketing pitfalls I need to watch for across daylight saving boundaries.
10. The business question I got is "[paste ambiguous business question, e.g., how many users are engaged]" — help me identify the 3-4 hidden definitional decisions I need to nail down before this can become a precise SQL query.

## Implementation prompts (build & debug)

1. Write a SQL query using `ROW_NUMBER()` to select the most recent `[record type, e.g., subscription status]` per `[partition key]` from `[table name]`, handling ties on `[tie-break column]`.
2. Write a funnel analysis query in SQL that computes conversion rate at each of these steps: `[step 1, step 2, step 3]`, using `[table(s)]`, with each step keyed by `[user/session id]` and ordered by `[timestamp column]`.
3. Debug this query — I'm getting duplicate rows after joining `[table A]` and `[table B]` on `[join key]`, and I expect one row per `[entity]`: `[paste query]`.
4. Write a CTE-based cohort retention query: cohort = signup month from `[signup table]`, retention = activity in `[activity table]`, output a matrix of cohort month × months-since-signup with retention %.
5. Optimize this slow query — here's the query and the `EXPLAIN` plan output showing `[describe the issue, e.g., a full table scan on a 2B-row table]`: `[paste query and plan]`.
6. Write a SQL pivot query that turns `[long-format table description]` into wide format with one column per distinct value of `[pivot column]`, using `[your warehouse]`'s `PIVOT` syntax or conditional aggregation if `PIVOT` isn't supported.
7. Write a query using `LAG()` to flag every row in `[table name]` where `[column]` changed from the previous row for the same `[partition key]`, ordered by `[timestamp column]`.
8. Debug why my `LEFT JOIN` between `[table A]` and `[table B]` is silently dropping rows — here's the query and a filter clause I suspect is the culprit: `[paste query]`.
9. Write a deduplication query for `[table name]` that keeps exactly one row per `[key]`, preferring the row with the most recently updated `[timestamp column]`, and handles ties where the timestamp is identical.
10. Write a query that buckets `[event table]` timestamps into `[granularity]` windows in `[timezone]`, correctly handling the daylight saving transition, and aggregates `[metric]` per bucket.

## Advanced prompts (architecture, optimization, edge cases)

1. I'm joining `[table A, e.g., 500M rows]` to `[table B, e.g., 2B rows]` on `[key]` and the query times out — walk me through restructuring this with pre-aggregation, broadcast join hints, or partition pruning in `[your warehouse]`.
2. Critique this window function query for correctness under the edge case where `[describe edge case, e.g., a customer has no prior order so LAG returns NULL]` — does my downstream logic handle that NULL correctly?
3. Explain how `[your warehouse]` handles query result caching and materialized views, and whether I should materialize `[describe expensive intermediate result]` rather than recomputing it in every downstream query.
4. I have a recursive hierarchy in `[table name]` (e.g., org chart, category tree) — write a recursive CTE to flatten it, and explain the performance risk of recursive CTEs on deep or cyclic hierarchies.
5. Design a SQL-based incremental/idempotent pipeline for `[describe pipeline, e.g., daily rollup table]` that can safely re-run on the same day without double-counting, using `MERGE`/`INSERT OVERWRITE` patterns.
6. Walk me through diagnosing data skew in a join between `[table A]` and `[table B]` where one key value (`[describe hot key, e.g., a null or default customer_id]`) accounts for a disproportionate share of rows, and how that breaks naive partitioning in a distributed query engine.
7. Compare the trade-offs of pushing `[describe transformation]` logic into SQL (dbt model) versus doing it in a pandas/Python step downstream — when does each approach win for maintainability and performance?
8. Critique my use of an AI code-assistant-generated query for `[business question]` — what specific things should I manually verify (NULL handling, join cardinality, date boundary inclusivity) before trusting its output on production data?
9. I need to compute `[percentile metric, e.g., p95 latency]` per `[partition key]` across `[N]` billion rows — compare exact percentile functions versus approximate ones (`APPROX_PERCENTILE`, t-digest) for this scale.
10. Explain how to detect and prevent "fan-out" double counting when aggregating a metric from `[fact table]` after joining to a `[dimension table with a one-to-many relationship]`, and show the corrected query pattern.

## Follow-up / chaining prompts

1. Now take the cohort retention query you wrote and extend it to segment by `[dimension, e.g., acquisition channel]` so I can compare retention curves across segments.
2. Given the EXPLAIN plan issue you just diagnosed, rewrite the query with the fix and explain what changed in the execution plan.
3. Now that the funnel query works, add a breakdown by `[dimension]` and compute the drop-off rate between each consecutive step.
4. Take the deduplication logic you wrote and turn it into a reusable dbt model with tests asserting uniqueness on `[key]`.
5. Based on the data skew issue you identified, show me how to salt the join key to redistribute the hot key across partitions.
6. Now extend the recursive CTE you wrote to also compute the depth level and a materialized path string for each node.

## Anti-patterns: prompts that get weak answers

**Weak:** "Write a SQL query to find duplicates."
**Sharper:** "Write a SQL query using `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC)` to keep only the most recent record per customer in the `subscriptions` table, and explain how it handles ties when `updated_at` is identical."

**Weak:** "My query is slow, how do I fix it?"
**Sharper:** "Here's my query joining a 2B-row `events` table to a 50M-row `users` table on `user_id`, and the EXPLAIN plan shows a full scan on `events` — walk me through adding partition pruning or a broadcast hint to fix it."

**Weak:** "How do I do a cohort analysis in SQL?"
**Sharper:** "Write a CTE-based cohort retention query where cohort = signup month from the `signups` table and retention = any login event in the `logins` table, outputting a cohort-month by months-since-signup retention matrix."

**Weak:** "Help me with window functions."
**Sharper:** "Compare RANK() versus DENSE_RANK() versus ROW_NUMBER() for ranking sales reps by monthly revenue when two reps tie exactly — which should I use if I need exactly top-10 reps with no skipped ranks?"

**Weak:** "Turn this business question into SQL."
**Sharper:** "The business question is 'how many users are engaged' — help me pin down whether 'engaged' means any login in the last 7 days, 3+ sessions in 30 days, or a specific feature-usage event, before I write the query against the `events` table."

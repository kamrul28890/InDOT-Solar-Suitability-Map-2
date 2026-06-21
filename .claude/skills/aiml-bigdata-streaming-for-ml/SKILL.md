---
name: aiml-bigdata-streaming-for-ml
description: Curated prompts for big-data and streaming systems that feed ML pipelines — Spark, Kafka, real-time feature pipelines. Use when designing data infrastructure for large-scale or real-time ML.
---

# Big Data & Streaming for ML — Prompt Library (AI/ML Engineer)

Every model is downstream of a data pipeline, and at scale that pipeline's design choices — batch versus stream, how partitioning is laid out, whether processing is exactly-once or at-least-once — determine whether features are correct, fresh, and affordable to compute, long before any modeling decision matters. Good practice in 2026 means using Spark for large-scale batch feature engineering where throughput and complex joins matter more than freshness, and Kafka-based streaming pipelines (often with Flink or Spark Structured Streaming as the processing layer) when online inference needs features computed within seconds or milliseconds of an event happening. It means understanding the real trade-offs of windowing and aggregation for streaming features (tumbling vs. sliding vs. session windows, and how late-arriving/out-of-order events get handled), designing for exactly-once semantics where double-counting an event would corrupt a feature or a financial metric, and choosing a lakehouse format (Delta Lake, Apache Iceberg) that gives ACID guarantees and time-travel on top of cheap object storage instead of a brittle pile of raw Parquet files. It also means the operational realities nobody puts in the architecture diagram: partitioning strategy that avoids data skew and small-file problems, backpressure handling so a slow downstream consumer doesn't crash the pipeline, and tuning Spark job cost/performance (shuffle partitions, executor sizing, caching) so a feature pipeline doesn't quietly become the most expensive line item in the data platform bill.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain the trade-offs between batch processing (Spark on a schedule) and stream processing (Kafka + Flink/Spark Structured Streaming) for my use case of computing [feature name] for [an online inference system that needs results within X seconds].
2. Compare Delta Lake and Apache Iceberg for my feature store's underlying storage layer, and tell me which fits better given my need for [time travel / schema evolution / multi-engine read access from both Spark and Trino].
3. Walk me through exactly-once processing semantics in Kafka — how does idempotent production plus transactional consumption actually prevent duplicate processing — and tell me whether my current [at-least-once] pipeline for [use case] genuinely needs the upgrade or if dedup-at-write is good enough.
4. Explain tumbling, sliding, and session windows for streaming aggregation, and tell me which one fits my use case of computing [a rolling feature, e.g., "transactions in the last 10 minutes"] for real-time fraud scoring.
5. Walk through how late-arriving and out-of-order events are handled in Spark Structured Streaming or Flink (watermarks, allowed lateness) and explain what happens to my windowed aggregation if an event arrives [N minutes] after its window has already closed.
6. Compare partitioning strategies (by date, by a high-cardinality key, by a hash bucket) for my Spark feature engineering job reading from [a table with characteristics X], and tell me which one avoids data skew given my actual data distribution.
7. Explain how a feature store (online store for low-latency serving, offline store for training) bridges batch and streaming pipelines, and walk through how a feature computed in a Spark batch job and a feature computed via Kafka streaming end up consistent for the same entity.
8. Walk through backpressure handling in a Kafka consumer pipeline — what happens when a downstream sink (e.g., a feature store write or a database) slows down, and how do consumer lag, rebalancing, and buffering interact to either gracefully degrade or fall over?
9. Explain the small-files problem in a data lake fed by frequent small streaming writes, and how compaction strategies in Delta Lake/Iceberg (OPTIMIZE, file size targets) address it without requiring me to rewrite my ingestion pipeline.
10. Compare the cost and latency profile of a Lambda architecture (separate batch and streaming paths that get reconciled) versus a Kappa architecture (streaming-only, reprocessing from a replayable log) for my [real-time feature pipeline] use case.

## Implementation prompts (build & debug)

1. Write a Spark job that computes [a feature, e.g., 30-day rolling average transaction amount per user] from a [Parquet/Delta] table partitioned by [date], and tune the shuffle partition count and broadcast join threshold for a dataset of [N rows/TB size].
2. Write a Kafka producer/consumer pipeline that ingests [event type, e.g., clickstream events] with idempotent production (enabling `enable.idempotence=true`) and transactional consumption, and verify exactly-once delivery with a test that intentionally retries a batch.
3. Implement a Spark Structured Streaming job that computes a [sliding 5-minute window] aggregation feature from a Kafka topic, configure watermarking to handle events up to [2 minutes] late, and write the output to [an online feature store / Delta table].
4. Debug a Spark job that's experiencing severe data skew — one partition's task takes 10x longer than the others — walk through identifying the skewed key using [Spark UI stage metrics], and implement a salting or adaptive query execution (AQE) fix.
5. Set up a Delta Lake table with a defined partitioning scheme and Z-ordering on [a frequently filtered column], and write a compaction job (`OPTIMIZE`) that runs on a schedule to address the small-files problem from frequent streaming `MERGE` writes.
6. Debug a Kafka consumer group that's falling increasingly behind (growing consumer lag) under normal traffic — walk through checking partition count versus consumer instance count, whether a single slow partition is bottlenecking the group, and whether the processing logic per message has a performance regression.
7. Implement a real-time feature pipeline that joins a Kafka stream of [events] with a slowly-changing dimension table (e.g., user profile data) using a stream-table join in [Flink/Spark Structured Streaming], and handle the case where the dimension table updates need to be reflected without reprocessing the whole stream.
8. Write an Iceberg table migration that adds [a new column] to an existing large production table using schema evolution, and verify that existing Spark/Trino queries against the table continue to work without rewriting historical data files.
9. Implement backpressure-aware consumption in my Kafka pipeline by tuning `max.poll.records` and consumer `fetch.min.bytes`, and add a dead-letter queue for messages that repeatedly fail processing instead of blocking the whole partition.
10. Write a batch feature engineering Spark job and a streaming feature pipeline that compute the same logical feature (e.g., "average order value last 7 days") and design a parity test that confirms both paths produce the same value for a given entity at a given timestamp, to catch training/serving skew at the data layer.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a unified feature pipeline architecture that serves both offline training (via Spark batch jobs reading from a Delta Lake/Iceberg lakehouse) and online inference (via a low-latency feature store fed by Kafka streaming) for [my entity type, e.g., user/transaction], ensuring the same feature definition produces consistent values in both paths.
2. Critique my current Spark job's cost and performance [paste: executor config, data volume, runtime] and identify whether the bottleneck is shuffle-heavy joins, spill-to-disk from undersized executors, or just over-provisioned cluster size relative to actual data volume.
3. Stress-test my exactly-once Kafka pipeline against a scenario where the consumer crashes mid-transaction after writing to the sink but before committing the offset — walk through whether my current setup would replay and double-write, or whether the transactional write is correctly atomic with the offset commit.
4. Design a windowing and late-data strategy for a real-time fraud-detection feature pipeline where the business requirement is "scores must be available within 500ms" but some events legitimately arrive minutes late due to [upstream system retry behavior] — propose a watermark/allowed-lateness configuration that balances completeness against the latency SLA.
5. Propose a partitioning and Z-ordering strategy for a multi-terabyte Delta Lake/Iceberg table that's queried both by [a high-frequency point lookup pattern from the online feature store] and [a large analytical scan pattern from monthly batch retraining] — can one physical layout serve both well, or do I need separate derived tables?
6. Compare Lambda and Kappa architecture for my [real-time feature pipeline], specifically addressing what happens when I need to backfill historical features after fixing a bug in the streaming computation logic — which architecture makes reprocessing cleaner?
7. Design a cost-optimization strategy for a Spark feature engineering pipeline that currently costs [$X/month] on [cluster config], evaluating spot instances for executors, adaptive query execution, and caching intermediate results — quantify expected savings against job reliability risk.
8. Stress-test my streaming feature pipeline against a Kafka partition rebalance event during peak traffic — does my consumer group experience a processing gap during rebalancing, and would a static partition assignment or cooperative rebalancing protocol reduce that disruption?
9. Design a data quality validation layer (e.g., using Great Expectations or a custom Spark-based validator) that runs on both the batch feature pipeline and the streaming pipeline, and propose how to make validation rules for streaming data fast enough not to add unacceptable latency to the online path.
10. Propose an exactly-once, end-to-end design for a pipeline that reads from Kafka, performs a stateful aggregation in Flink, and writes to an Iceberg table — identify every place idempotency or transactional guarantees need to be enforced (source offsets, intermediate state, sink commit) for the whole pipeline to actually be exactly-once rather than just exactly-once at one stage.

## Follow-up / chaining prompts

1. Now stress-test the unified batch/streaming feature architecture you just designed against a scenario where I need to change the feature's business logic — does updating the definition require redeploying both the Spark batch job and the Flink/streaming job in lockstep, or can I version and migrate them independently?
2. Given the partitioning and Z-ordering strategy we just designed, quantify what happens to query performance for the analytical batch-retraining scan pattern if I optimize the physical layout purely for the online point-lookup pattern — is there a real trade-off here or can both be satisfied?
3. Now take the watermark/allowed-lateness configuration you proposed for the fraud-detection pipeline and explain what happens to events that arrive even later than the allowed lateness window — are they silently dropped, sent to a dead-letter path, or do they corrupt a closed window's result?
4. Given the Spark cost-optimization strategy we discussed, walk through what happens to job reliability if I move executors to spot instances and a spot reclamation happens mid-shuffle — does the job retry the lost tasks cleanly, or does it fail the whole stage?
5. Now revisit the exactly-once end-to-end pipeline design and tell me which single component, if it silently regressed to at-least-once, would be hardest to detect in production — and what monitoring would catch that regression.
6. Now take the backfill/reprocessing approach from the Lambda vs. Kappa comparison and make it concrete — walk through the exact steps to backfill 30 days of historical feature values after fixing a bug in the streaming aggregation logic, without double-counting events already processed by the original (buggy) run.

## Anti-patterns: prompts that get weak answers

**Weak:** "Should I use Spark or Kafka for my pipeline?"
**Sharper:** "I need to compute a 'transactions in the last 10 minutes' feature for real-time fraud scoring with a latency budget of under 500ms — walk through why this requires a Kafka-plus-stream-processor (Flink or Spark Structured Streaming) architecture rather than a scheduled Spark batch job, and what specifically breaks if I try to hit that latency with batch."

**Weak:** "How do I avoid duplicate processing in my streaming pipeline?"
**Sharper:** "My Kafka consumer occasionally double-processes messages after a consumer restart, double-counting a revenue aggregation feature — walk through implementing exactly-once semantics using idempotent producers plus a transactional consumer-and-sink pattern, versus the simpler alternative of dedup-by-event-ID at the write layer."

**Weak:** "My Spark job is slow, how do I speed it up?"
**Sharper:** "My Spark job joining a 2TB fact table with a 50GB dimension table is taking 3 hours, and the Spark UI shows one task in the join stage running 8x longer than the others — walk through diagnosing whether this is data skew on the join key, and whether salting the key or enabling AQE skew join optimization would fix it."

**Weak:** "How should I store my feature data?"
**Sharper:** "My feature pipeline writes small Parquet files every 5 minutes from a streaming job, and I now have millions of tiny files degrading read performance for batch retraining — walk through migrating to Delta Lake with a scheduled OPTIMIZE/compaction job, and what file-size target I should aim for given my table's query patterns."

**Weak:** "Design a real-time feature pipeline for me."
**Sharper:** "I need online features for a fraud model that must be fresh within 1 minute of a transaction, computed from a Kafka topic of transaction events joined against a slowly-changing user-profile table — design the stream-table join, the windowing strategy for a 'transaction count last 10 minutes' feature, and how it stays consistent with the equivalent feature computed nightly in my Spark training pipeline."

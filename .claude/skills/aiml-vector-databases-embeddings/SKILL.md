---
name: aiml-vector-databases-embeddings
description: Curated prompts for choosing and operating vector databases and embedding models — indexing, similarity metrics, scaling retrieval. Use when designing embedding-based search/retrieval infrastructure.
---

# Vector Databases & Embeddings — Prompt Library (AI/ML Engineer)

Vector search infrastructure is the substrate underneath every RAG system, semantic search feature, and recommendation pipeline shipping in 2026, and the decisions made here — which database, which index algorithm, which similarity metric, how many dimensions — have outsized effects on cost and latency at scale that are hard to undo later. Good practice means choosing a vector DB (Pinecone, Weaviate, Qdrant, pgvector, Milvus) based on actual operational requirements (multi-tenancy, filtering, on-prem vs managed, write throughput) rather than hype, tuning HNSW or IVF index parameters deliberately instead of using defaults, and treating embedding model selection as a task that needs evaluation just like any other model choice. It also means planning for the parts that don't show up in a quickstart tutorial: embedding drift when you swap models, metadata filtering at scale, sharding strategy as the corpus grows past single-node capacity, and the real dollar cost of re-embedding millions of vectors. This skill collects prompts for picking the right infrastructure and operating it correctly once it's live.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare Pinecone, Weaviate, Qdrant, pgvector, and Milvus for my use case of [N million vectors, expected QPS, multi-tenant SaaS / single internal app], and recommend one based on operational overhead, managed-vs-self-hosted trade-offs, and cost at my scale.
2. Explain how HNSW (Hierarchical Navigable Small World) indexing works and why it trades exact nearest-neighbor search for approximate — then explain when IVF (inverted file index) is a better fit than HNSW for my dataset of [size and update frequency].
3. Walk me through the practical difference between cosine similarity, dot product, and L2 (Euclidean) distance as similarity metrics, and tell me which one matches the training objective of [the embedding model I'm using, e.g., text-embedding-3-large or bge-large-en-v1.5].
4. I need to choose an embedding model for [domain, e.g., multilingual customer support tickets] — compare OpenAI's text-embedding-3-large, Cohere embed-v3, and an open-weight option like bge-m3 on the MTEB leaderboard dimensions that actually matter for my retrieval task.
5. Explain the dimensionality trade-off in embeddings — when does dropping from 3072 to 1024 dimensions (via OpenAI's native dimension truncation or PCA) meaningfully hurt retrieval quality versus just saving storage and compute?
6. Walk me through what "embedding drift" means in production — if I swap from [embedding model A] to [embedding model B], why can't I just start writing new vectors into the same index, and what's the safe migration path?
7. Explain how metadata filtering works differently in Pinecone (metadata as payload), Qdrant (payload + filterable index), and pgvector (SQL WHERE clauses joined with vector search) — which approach scales better when I need to filter on [N] metadata fields at query time?
8. Explain multi-tenancy patterns for vector databases — namespace-per-tenant (Pinecone), collection-per-tenant (Qdrant/Weaviate), or row-level filtering with a shared index — and recommend one for my SaaS product with [N] tenants of [size variance, e.g., 10 to 100k documents per tenant].
9. Walk through when and why I'd fine-tune an embedding model on my own data versus using an off-the-shelf model, given my domain is [highly specialized jargon / multilingual / short-form queries against long-form documents].
10. Explain the cost structure differences between a managed vector DB (Pinecone serverless pricing) and self-hosting Qdrant or Milvus on [cloud provider] infrastructure, at a scale of [N million vectors, M queries/day].

## Implementation prompts (build & debug)

1. Write a Python ingestion pipeline that embeds documents with [bge-large-en-v1.5 / text-embedding-3-large] in batches of [100], upserts them into [Qdrant/Pinecone] with metadata fields [list fields], and handles rate limits and retries with exponential backoff.
2. Configure HNSW index parameters (`m`, `ef_construction`, `ef_search`) in [Qdrant/Weaviate] for my workload of [N] vectors at [dimension] dimensions, optimizing for [recall target, e.g., 0.95 recall@10] while keeping query latency under [50ms].
3. Debug why my pgvector queries slowed from [20ms] to [800ms] after the table grew to [N million] rows — walk through whether I need an HNSW or IVFFlat index, what `lists`/`m` parameter to set, and whether `VACUUM`/`ANALYZE` maintenance is missing.
4. Write a re-embedding migration script that backfills [N million] existing vectors from [old embedding model] to [new embedding model] with zero downtime, using a shadow index and a cutover strategy — show me how to validate the new index before switching reads over.
5. Implement metadata filtering in [Qdrant/Pinecone] that combines a vector similarity search with a filter on `tenant_id`, `document_type`, and a date range, and show me how to verify the filter is using an index rather than scanning.
6. Set up a sharding strategy for [Milvus/Qdrant] to handle [N billion] vectors across multiple nodes, and write the routing logic that determines which shard a given tenant's or document's vectors land on.
7. Write an evaluation script that computes recall@k and precision@k for my current embedding model + index configuration against a labeled set of [N] query/relevant-document pairs, so I have a baseline before I change anything.
8. Debug a multi-tenancy data leak where a query in [Pinecone namespace A] is returning results that belong to tenant B — walk through the likely causes (missing namespace filter, shared index without tenant_id metadata, incorrect upsert routing).
9. Implement an embedding cache (keyed by content hash) in front of my embedding API calls to avoid re-embedding unchanged documents on every pipeline run, using [Redis/local disk cache], and show me the cache invalidation logic when source documents are edited.
10. Write a cost-monitoring script that tracks embedding API spend (tokens embedded × model price) and vector DB storage/query costs per tenant, so I can see which tenants are driving cost in a [multi-tenant SaaS] deployment.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a zero-downtime re-embedding strategy for migrating [N million] vectors from a 1536-dimension model to a 3072-dimension model across [Pinecone/Qdrant], including dual-write, backfill, validation, and cutover phases, and identify the riskiest step.
2. Critique this vector search architecture [paste: DB choice, index type, similarity metric, sharding strategy, embedding model] for a workload growing from [current scale] to [10x target scale] in 12 months, and tell me which component breaks first.
3. Stress-test my multi-tenant isolation design against a tenant with [10x] more documents than any other tenant — does my sharding/namespace strategy create a noisy-neighbor problem where that tenant's query load degrades latency for smaller tenants sharing the same index?
4. Design a hybrid indexing strategy that uses a fast, lower-recall index (IVF) for an initial broad candidate set and a slower, higher-recall index (HNSW or exact brute-force) for final ranking on a security- or compliance-critical subset of queries — when is this two-tier approach worth the added complexity?
5. My recall@10 dropped from [0.94] to [0.81] after I reduced embedding dimensions from 3072 to 768 to cut storage costs by 75% — quantify whether there's a middle dimensionality that recovers most of the recall while still meaningfully reducing cost, and how would I find it empirically.
6. Design a strategy for detecting embedding drift in production — given that the embedding model itself doesn't change but the distribution of incoming documents does (e.g., new product categories, new language mix), propose a monitoring approach using centroid drift or query-result staleness signals.
7. Compare self-hosting Milvus with GPU-accelerated indexing versus a managed service for a workload requiring sub-20ms P99 latency at [N] QPS, and lay out the on-call/operational burden trade-off, not just the raw cost comparison.
8. Design a disaster-recovery and backup strategy for a production vector database holding [N million] vectors that are expensive to re-embed (each re-embedding run costs $[X] in API fees) — what's the right backup cadence and restore-time objective given that cost?
9. Propose an approach for handling embedding model version skew during a gradual rollout, where some documents are embedded with the old model and some with the new model in the same index during a multi-week migration window — how do I prevent search quality from silently degrading for the mixed population?
10. Walk through how I'd extend this vector search stack to support multi-modal embeddings (text + image, e.g., CLIP-style joint embedding space) without breaking the existing text-only retrieval paths, including whether they need separate indexes or a shared one.

## Follow-up / chaining prompts

1. Now stress-test the HNSW parameters you just recommended against a sudden 5x spike in write volume — does `ef_construction` need to change, and what happens to query latency while the index is rebuilding?
2. Now explain the trade-off you just made by choosing cosine similarity over dot product — would switching matter if I later fine-tune the embedding model on my own data?
3. Given the re-embedding migration plan you outlined, tell me the single step most likely to cause a production incident, and how I'd add a rollback point right before it.
4. Now take the multi-tenancy design we just built and explain what changes if I need per-tenant data residency (e.g., EU tenant data must stay in an EU region) — does this break the shared-index approach?
5. Now quantify the cost difference between the managed and self-hosted option you compared, assuming my query volume doubles every quarter for the next year — at what scale does the answer flip?

## Anti-patterns: prompts that get weak answers

**Weak:** "Which vector database should I use?"
**Sharper:** "I'm building a multi-tenant SaaS with 5,000 tenants ranging from 100 to 500k documents each, need per-tenant metadata filtering, and want a managed service to avoid ops overhead — compare Pinecone serverless, Qdrant Cloud, and Weaviate Cloud on multi-tenancy support and cost at 50 million total vectors."

**Weak:** "How do I make vector search faster?"
**Sharper:** "My Qdrant HNSW index is returning recall@10 of 0.93 at 80ms P95 with ef_search=128 — walk through whether lowering ef_search to 64 trades acceptable recall for latency, or whether I should instead look at quantization (scalar or product) to cut vector size and speed up distance computation."

**Weak:** "What embedding model is best?"
**Sharper:** "For retrieval over German and English mixed-language support tickets, compare bge-m3 (multilingual) against text-embedding-3-large on retrieval quality and tell me whether I need a language-specific reranker on top given that the embedding model alone may not separate languages well."

**Weak:** "My vector search results are wrong."
**Sharper:** "A query for 'refund policy' in tenant namespace A is returning a document I know belongs to tenant B in my Pinecone index — walk through whether this is a missing namespace filter in my query code, a metadata tagging bug at ingestion time, or an index corruption issue, and tell me how to isolate which one."

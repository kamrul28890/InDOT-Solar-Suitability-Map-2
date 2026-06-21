---
name: aiml-rag-pipeline-design
description: Curated prompts for designing and debugging RAG pipelines — chunking, embeddings, hybrid search, reranking, evaluation. Use when building retrieval-augmented generation systems.
---

# RAG Pipeline Design — Prompt Library (AI/ML Engineer)

Retrieval-augmented generation is now the default architecture for grounding LLMs in proprietary or fast-changing data, and by 2026 the bar has moved well past "chunk and embed everything" — production systems combine hybrid search, cross-encoder reranking, query rewriting, and agentic multi-hop retrieval to hit acceptable faithfulness and recall. Getting this right matters because RAG failures are silent: a system that retrieves the wrong chunk doesn't crash, it confidently hallucinates an answer that sounds grounded. Good RAG design means chunking strategy is chosen deliberately (not defaulted to 512 tokens because that's what the tutorial used), retrieval is evaluated with real metrics (faithfulness, context precision/recall via RAGAS or similar), and the pipeline degrades gracefully when documents conflict, go stale, or simply don't contain the answer. This skill collects prompts for every stage of that lifecycle — from picking a chunking strategy to debugging why reranking didn't move the needle in production.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare fixed-size chunking, recursive character splitting, semantic chunking (embedding-based breakpoints), and hierarchical/parent-child chunking for my corpus of [document type, e.g., 50-page PDF engineering specs with tables and nested headings], and recommend which one to start with given [latency/quality constraint].
2. Explain how hybrid search (BM25 + dense vector retrieval) actually improves recall over pure vector search, and walk through the math behind reciprocal rank fusion (RRF) for combining the two result sets.
3. Walk me through how a cross-encoder reranker like [bge-reranker-v2-m3 / Cohere Rerank 3] differs architecturally from the bi-encoder I'm using for first-stage retrieval, and why that difference lets it catch relevance the embedding model misses.
4. I'm choosing between [OpenAI text-embedding-3-large], [Cohere embed-v3], and an open-weight model like [bge-large-en-v1.5 / Nomic Embed] for retrieval over [domain, e.g., legal contracts] — break down the trade-offs in retrieval quality, dimensionality, cost per million tokens, and self-hosting feasibility.
5. Explain query rewriting and query expansion (e.g., HyDE — hypothetical document embeddings) and tell me which technique fits my problem where user queries are [short and ambiguous / long and multi-part] against [corpus description].
6. Describe how multi-hop or agentic RAG (an LLM iteratively deciding what to retrieve next) differs from single-shot retrieve-then-generate, and when the added latency and complexity is actually worth it for a use case like [multi-document comparison / research synthesis].
7. Explain what "context window budgeting" means in a RAG pipeline — how do I decide how many chunks of size [N tokens] to pack into a [128k-token] context window alongside the system prompt and conversation history without degrading the model's attention to the most relevant chunk?
8. Walk me through the RAGAS evaluation framework's core metrics (faithfulness, answer relevance, context precision, context recall) and explain what a "good" score looks like for a [customer support / internal knowledge base] RAG system.
9. Explain the difference between citation-based grounding (forcing the LLM to cite chunk IDs) and post-hoc attribution (matching generated claims back to source text), and which approach better prevents hallucination in my [regulated-industry] application.
10. I have documents that get updated weekly and some that directly contradict each other across versions — explain strategies (timestamp-based filtering, document versioning in metadata, conflict-aware retrieval) for handling stale or conflicting sources in a RAG index.

## Implementation prompts (build & debug)

1. Write a recursive chunking function in Python using `langchain.text_splitters.RecursiveCharacterTextSplitter` (or a from-scratch equivalent) that respects [Markdown headers / table boundaries] in my documents and keeps chunk size between [300-500] tokens with a [50]-token overlap.
2. Implement a hybrid retrieval pipeline that runs BM25 (via `rank_bm25` or Elasticsearch) and dense vector search (via [Pinecone/Qdrant]) in parallel, then fuses results with reciprocal rank fusion (k=60) before passing the top [10] to a reranker.
3. Debug why my retrieval pipeline returns the right document but the wrong chunk — here's my chunking config [paste config] and a query/expected-chunk pair that's failing: [paste example]. Walk through likely causes (chunk boundary cutting mid-fact, embedding model truncation, overlap too small).
4. Add a cross-encoder reranking step using [bge-reranker-v2-m3 / Cohere Rerank] to my existing retrieval pipeline that takes the top 50 BM25+vector candidates and reranks down to the top [5] before they're sent to the generation prompt — here's my current retrieval code: [paste code].
5. Write a HyDE (hypothetical document embedding) query rewriting step that generates a hypothetical answer with [gpt-4o-mini / a small local model] before embedding it for retrieval, and explain how to fall back to the original query if the hypothetical answer scores low on a sanity check.
6. Build a RAGAS evaluation harness in Python that runs faithfulness, context precision, and context recall against a golden set of [N] question/answer/source-chunk triples, and outputs per-question scores plus an aggregate report.
7. My RAG pipeline's generation step ignores retrieved context about [X]% of the time and answers from parametric memory instead — here's my system prompt: [paste prompt]. Rewrite the prompt to force citation of retrieved chunk IDs and explicit "I don't know" behavior when context is insufficient.
8. Implement metadata-based filtering so retrieval only searches chunks where `effective_date <= query_date` and `document_status != 'superseded'`, using [Pinecone/Qdrant/pgvector] metadata filters, and show me how to keep this filter from silently returning zero results when metadata is missing.
9. Write an integration test suite that asserts retrieval recall@5 doesn't regress below [0.85] on a fixed set of [20] representative queries every time the chunking strategy or embedding model changes, so I catch silent quality regressions in CI.
10. Debug a context window overflow bug where my pipeline packs chunks until it hits the token limit but truncates mid-chunk — refactor the packing logic to greedily fit whole chunks ranked by reranker score, dropping the lowest-ranked partial fit instead of truncating it.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a multi-hop agentic RAG architecture where the LLM can issue up to [3] sequential retrieval calls, each informed by the previous result, for queries that require synthesizing facts from [multiple disconnected documents] — include a stopping condition to prevent unbounded retrieval loops.
2. Critique this RAG architecture end-to-end [paste architecture: chunking strategy, embedding model, vector DB, reranker, generation model] for a system serving [N] queries/day with a [P95 latency] target, and identify the most likely bottleneck and failure mode.
3. Stress-test my grounding strategy against an adversarial query designed to make the model ignore retrieved context and hallucinate — here's the query: [paste query] and the retrieved chunks: [paste chunks]. Explain why the failure happened and propose a prompt or pipeline fix.
4. Design a hierarchical retrieval strategy (parent-document retrieval) where small child chunks are used for similarity search but the full parent section is passed to the generator, and explain how this changes my context-budgeting math versus flat chunking.
5. My corpus has grown from [10k] to [2M] documents and retrieval latency has degraded from [50ms] to [800ms] — diagnose likely causes (index type, sharding, reranker becoming the bottleneck) and propose a path to bring P95 latency back under [150ms].
6. Design a conflict-resolution layer for RAG that detects when retrieved chunks contradict each other (e.g., two policy versions with different numbers) and either surfaces both with provenance or defers to the most recent `effective_date` — show the data model changes needed in chunk metadata.
7. Compare the trade-offs of self-hosting an open-weight reranker like bge-reranker-v2-m3 on GPU infrastructure versus calling a hosted reranking API, for a workload of [N] reranking calls/day, factoring in cold-start latency, cost, and data residency requirements for [regulated data].
8. Design an evaluation pipeline that distinguishes retrieval failures from generation failures when an end-to-end RAG answer is wrong — propose how to log retrieved chunks, reranker scores, and generated answers together so a human or LLM-judge can attribute blame to the right pipeline stage.
9. Walk through how I'd redesign chunking and retrieval for multi-modal RAG where the corpus includes [tables, charts, and scanned PDFs] rather than plain text, including how embedding strategy changes for non-text content.
10. Propose a caching strategy for RAG that caches embeddings, retrieval results, and/or full generations at different layers, and explain the staleness risk each caching layer introduces when underlying documents change.

## Follow-up / chaining prompts

1. Now stress-test this chunking strategy against documents with deeply nested headers or tables that span page breaks — where does it silently produce a bad chunk?
2. Now explain the trade-off you just made by adding a reranker — quantify the added latency per query and tell me at what query volume this becomes a cost or throughput problem.
3. Given the RAGAS scores you just walked me through, tell me which single pipeline change (chunking, retrieval, or reranking) would most likely move faithfulness from [current score] toward [target score], and why.
4. Now take the hybrid search + RRF design we just built and explain how it breaks down for queries that are pure keyword lookups (e.g., an exact part number) versus pure semantic queries — does the fusion weighting need to change per query type?
5. Now explain how the conflict-resolution approach you proposed would need to change if documents don't have reliable `effective_date` metadata at all — what's the fallback?
6. Revisit the multi-hop agentic RAG design and tell me what happens if the LLM gets stuck retrieving the same document twice — show me the loop-detection logic I'd need to add.

## Anti-patterns: prompts that get weak answers

**Weak:** "What's the best chunk size for RAG?"
**Sharper:** "I'm chunking 50-page engineering PDFs with nested headers and embedded tables using text-embedding-3-large — compare 256, 512, and 1024-token chunks with 10% overlap for retrieval precision, and tell me how table content should be handled differently from prose."

**Weak:** "How do I make my RAG system more accurate?"
**Sharper:** "My RAGAS faithfulness score is 0.71 and context recall is 0.58 on a 30-question golden set — given that recall is the weaker metric, should I prioritize adding hybrid BM25+vector search or increasing top-k before reranking, and how would I isolate which fix actually moves the needle?"

**Weak:** "Should I use a reranker?"
**Sharper:** "I'm retrieving top-20 candidates via vector search at 45ms P50 latency for a chat app with a 2-second response budget — walk through whether adding bge-reranker-v2-m3 to cut to top-5 is worth the added latency, and what GPU sizing I'd need to keep reranking under 100ms."

**Weak:** "My RAG answers are wrong, fix it."
**Sharper:** "For this query [X] my pipeline retrieved chunk A (correct) and chunk C (irrelevant but higher BM25 score), then the generator cited chunk C in its answer — diagnose whether this is a reranking failure or a generation-prompt failure to prioritize the more relevant chunk, and propose a fix for whichever it is."

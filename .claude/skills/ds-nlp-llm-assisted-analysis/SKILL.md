---
name: ds-nlp-llm-assisted-analysis
description: Curated prompts for NLP and LLM-assisted analysis — text classification, summarization, entity extraction, using LLMs as analysis tools. Use when analyzing unstructured text as part of a data science workflow.
---

# NLP & LLM-Assisted Analysis — Prompt Library (Data Scientist)

In 2026, text analysis work has split into two complementary tracks: classical NLP (TF-IDF, embeddings, topic models) for transparent, cheap, reproducible pipelines, and LLM-assisted analysis (zero-shot classification, extraction, summarization via API calls) for speed and flexibility on messy, low-volume, or novel-label problems. The skill that separates a strong data scientist here isn't "knows how to call an LLM API" — it's knowing when classical methods are still the right call (cost, latency, auditability, scale), how to validate LLM-generated labels the same way you'd validate any annotator (inter-rater agreement, spot-checks, confusion matrices against a gold set), and how to keep LLM usage cost-aware at scale (batching, caching, sampling instead of exhaustive calls). Good work in this area produces labels and summaries with documented accuracy and known failure modes, not just plausible-looking output. It also means treating prompts as part of the analysis pipeline that needs version control, regression testing, and bias auditing — not throwaway one-offs.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I have [number] short text documents (e.g., support tickets, survey responses) that need to be classified into [number] categories. Walk me through the trade-offs between a classical TF-IDF + logistic regression pipeline versus zero-shot classification with an LLM, specifically on accuracy, latency, and per-document cost at this volume.
2. Explain the practical differences between LDA and BERTopic for topic modeling on a corpus of [size] documents, and tell me which one is more appropriate when my documents are short (under [number] words) and informal in tone.
3. I need to extract entities like [entity types, e.g., product names, complaint categories, dates] from unstructured text. Compare a spaCy NER pipeline versus prompting an LLM for structured extraction, and tell me which is more reliable for entity types that aren't in standard NER training data.
4. What's the right way to think about sample size when I want to use an LLM to label a subset of [number] documents and then validate against a human-labeled gold set — how many gold-labeled examples do I need to get a trustworthy estimate of LLM labeling accuracy?
5. I'm considering using an LLM to do data augmentation for a text classification task where one class only has [number] examples. What are the risks of LLM-generated synthetic text introducing distributional bias that won't show up until production?
6. Compare embedding-based clustering (e.g., sentence-transformers + k-means or HDBSCAN) versus LLM-prompted categorization for discovering unknown themes in [number] open-ended survey responses, and explain when each is the better starting point.
7. My corpus is multilingual, spanning [list languages]. Explain my options for sentiment/entity analysis — translate-then-analyze, multilingual embeddings, or a multilingual LLM prompt — and the accuracy/cost trade-offs of each.
8. I want to summarize [number] long documents (avg [length] pages) into a structured brief. Explain map-reduce summarization versus long-context single-pass summarization, and when the long-context approach actually degrades quality due to "lost in the middle" effects.
9. What's the difference between using an LLM as a zero-shot classifier with a label list in the prompt versus fine-tuning a smaller classical model, in terms of the volume of data at which the economics flip in favor of fine-tuning?
10. I need to decide whether sentiment in my dataset is better captured by a lexicon-based method (VADER), a fine-tuned transformer (e.g., a RoBERTa sentiment model), or an LLM prompt. Explain how domain mismatch (e.g., financial vs. social media text) affects each option's reliability.

## Implementation prompts (build & debug)

1. Write a Python pipeline using scikit-learn that builds a TF-IDF + logistic regression baseline classifier for [number]-class text classification, including a stratified train/test split and a classification report with per-class F1.
2. Write a prompt template and Python wrapper for zero-shot text classification using an LLM API, where the labels are [list labels], the output must be strict JSON, and I need to handle cases where the model returns a label not in my list.
3. I'm getting inconsistent JSON output from my LLM extraction prompt for [entity type] extraction — some responses have extra commentary, some have malformed JSON. Help me debug the prompt and add a validation/retry step in Python.
4. Write a BERTopic pipeline in Python for [number] documents, including embedding generation, dimensionality reduction with UMAP, and a way to merge near-duplicate topics down to a target of [number] topics.
5. Help me build an evaluation harness in Python that computes inter-rater agreement (Cohen's kappa or Krippendorff's alpha) between LLM-generated labels and human-labeled examples for my [task] labeling task.
6. Write a batching and caching layer in Python for LLM-based text classification over [number] documents, so identical or near-identical inputs aren't re-sent to the API, and so I can use a batch API endpoint instead of synchronous calls.
7. My summarization pipeline is hallucinating facts not present in the source document when summarizing [document type]. Help me debug whether this is a prompt issue, a chunking issue, or a model-context issue, and propose a fix with grounding/citation requirements in the prompt.
8. Write code to do entity extraction with an LLM that also returns a confidence score or self-reported uncertainty per extracted entity, and then flags low-confidence extractions for human review in [domain] documents.
9. I want to deduplicate near-identical complaint text before topic modeling on [number] records. Write a pipeline using sentence embeddings and cosine similarity thresholding to collapse duplicates before running BERTopic.
10. Help me write a spot-check sampling script that pulls a stratified random sample of [number] LLM-labeled documents per class for manual review, so I can estimate per-class labeling error rates rather than one overall accuracy number.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a hybrid classification architecture where a cheap classical model (TF-IDF + logistic regression) handles high-confidence cases and an LLM is only invoked for low-confidence or out-of-distribution cases, for a pipeline processing [volume] documents per day, and estimate the resulting cost reduction.
2. My LLM-based labeling pipeline shows systematically different label distributions for text written by [demographic group A] versus [demographic group B]. Walk me through how to audit whether this is genuine signal or LLM bias, including a matched-pairs analysis design.
3. I need to scale topic modeling to [number, e.g., 5 million] documents where BERTopic's default pipeline doesn't fit in memory. Propose an architecture using incremental/online clustering or approximate nearest-neighbor indexing that still produces interpretable topics.
4. Design an LLM-assisted analysis pipeline that is fully reproducible — same inputs produce the same outputs — given that LLM APIs have non-deterministic sampling by default. Cover temperature settings, seed parameters where available, and logging/versioning of prompts and model versions.
5. Walk me through how to detect concept drift in an LLM-based classification pipeline over time, where the underlying LLM model version changes upstream (e.g., a provider deprecates a model) without my prompt changing.
6. I'm running zero-shot LLM classification on [volume] documents/month and costs have become a budget concern. Propose a tiered strategy combining prompt caching, batch APIs, smaller/cheaper models for easy cases, and embedding-based pre-filtering to cut spend by an estimated [target]% without dropping accuracy below [threshold].
7. Design an evaluation framework for an LLM summarization pipeline that scores faithfulness (no hallucinated facts), coverage (key points retained), and conciseness separately, using a combination of LLM-as-judge scoring and human spot-checks, for [document type] at [volume].
8. How should I handle the edge case where my multilingual sentiment pipeline performs well on [primary language] but degrades on [low-resource language] due to limited training/embedding coverage — what are my realistic mitigation options short of collecting more labeled data?
9. Propose an architecture for continuous monitoring of an LLM-based entity extraction pipeline in production, including automatic flagging when extraction confidence drops, schema drift in source documents, or output format violations, for a system processing [volume] documents/day.
10. I need to choose between fine-tuning a small open-weight model versus continuing to prompt a larger hosted LLM for [task] at [volume] requests/month. Walk me through the full cost model including fine-tuning data labeling cost, training cost, hosting cost, and ongoing maintenance versus per-token API pricing.

## Follow-up / chaining prompts

1. Given the TF-IDF baseline F1 scores you just helped me compute, now help me design an ablation to see how much an LLM zero-shot approach improves over this baseline on the same held-out test set, controlling for the exact same examples.
2. Based on the BERTopic topics we just generated, help me write a follow-up prompt that asks an LLM to generate human-readable labels and one-sentence descriptions for each topic cluster, using the top keywords and representative documents as input.
3. Now that we have the inter-rater agreement score between LLM and human labels, help me identify which specific categories have the lowest agreement and draft a revised prompt with clearer category definitions or examples to fix those specific confusions.
4. Using the cost breakdown you just gave me for the batch API approach, help me model what happens to total cost and latency if document volume grows 5x over the next two quarters, and identify the point at which I should revisit the architecture.
5. Given the hallucination issues we just diagnosed in the summarization pipeline, help me design a regression test suite with [number] known source/summary pairs that I can re-run every time I change the prompt or switch model versions.
6. Based on the spot-check error rates we just found per class, help me decide which classes need a classical fallback model versus which are reliable enough to stay LLM-only, and draft the routing logic.

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I do text classification with AI?"
**Sharper:** "Compare TF-IDF + logistic regression versus zero-shot LLM classification for 50,000 support tickets across 12 categories, focused on per-document cost and F1 trade-offs at this volume."

**Weak:** "Summarize my documents with an LLM."
**Sharper:** "Design a map-reduce summarization pipeline for 800 documents averaging 15 pages each, with a faithfulness check to catch hallucinated facts not present in the source text."

**Weak:** "Is my LLM labeling good?"
**Sharper:** "Help me compute Cohen's kappa between LLM-generated labels and a 200-example human-labeled gold set for my 6-class ticket classification task, broken down by class."

**Weak:** "Find topics in my text data."
**Sharper:** "Compare LDA versus BERTopic for discovering themes in 30,000 short, informal open-ended survey responses, and recommend which handles short/noisy text better."

**Weak:** "LLM calls are expensive, help."
**Sharper:** "Propose a tiered architecture combining batch APIs, prompt caching, and embedding-based pre-filtering to cut my $4,000/month zero-shot classification spend by 50% while keeping accuracy above 90%."

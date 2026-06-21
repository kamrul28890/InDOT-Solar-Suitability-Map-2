---
name: aiml-llm-evaluation-observability
description: Curated prompts for evaluating LLM/agent quality and instrumenting observability — LLM-as-judge, RAGAS, tracing tools like Langfuse/Phoenix. Use when measuring or monitoring LLM application quality.
---

# LLM Evaluation & Observability — Prompt Library (AI/ML Engineer)

By 2026, "ship it and see" is not an acceptable evaluation strategy for LLM applications — teams that win are the ones with golden datasets, calibrated LLM-as-judge pipelines, and full request-level tracing that lets them diagnose a quality regression in minutes instead of days. Good evaluation practice means building a versioned golden set that actually represents production traffic, knowing when classic NLP metrics like BLEU/ROUGE are simply the wrong tool for generative tasks, and designing LLM-as-judge rubrics that are calibrated against human judgment rather than trusted blindly. Good observability means every production request is traced (prompt, retrieved context, tool calls, tokens, latency, cost) in a tool like Langfuse, Phoenix, or Helicone, with dashboards that catch cost spikes, latency regressions, and hallucination rate increases before users complain. This skill collects prompts for building eval pipelines, instrumenting tracing, running prompt/model A/B tests, and red-teaming for safety — the full quality-assurance lifecycle for LLM applications running in production.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain how to build a golden evaluation dataset for [my application, e.g., a customer-support RAG chatbot] that actually represents production query distribution, including how many examples I need and how to source edge cases versus typical-case queries.
2. Walk me through LLM-as-judge design — how do I write a rubric and prompt for a judge model (e.g., GPT-4o or Claude) to score [coherence/faithfulness/helpfulness] on a 1-5 scale, and how do I calibrate that judge against a sample of human-labeled examples to trust its scores?
3. Explain why BLEU and ROUGE are poor fits for evaluating open-ended generative tasks like [summarization/chatbot responses], and what metrics (RAGAS faithfulness, semantic similarity, LLM-as-judge) are better suited and why.
4. Compare Langfuse, Phoenix (Arize), and Helicone for instrumenting LLM observability in my [production application stack, e.g., Python FastAPI backend calling OpenAI and Anthropic APIs] — recommend one based on self-hosting needs, tracing depth, and cost.
5. Explain the RAGAS framework's metrics (faithfulness, context precision, context recall, answer relevancy) in plain terms, and tell me which ones matter most for my use case of [pure generation without retrieval / RAG-based generation].
6. Walk me through how to design a human evaluation workflow that's actually cheap and fast enough to run weekly — what's the right sample size, rubric format, and inter-annotator agreement check for a team of [N] reviewers evaluating [output type]?
7. Explain regression testing for prompts — how do I detect that a prompt change or model upgrade (e.g., switching from gpt-4o to gpt-4.1) silently degraded quality on cases that used to pass, before it reaches production?
8. Explain hallucination detection techniques — comparing self-consistency checks (sampling multiple generations and checking agreement), retrieval-grounded fact verification, and a dedicated hallucination-detection model — for my use case of [domain].
9. Walk through how to design an A/B test for comparing two prompts or two models in production, including how to pick the right success metric (task completion, user thumbs-up rate, downstream conversion) and how long to run the test before trusting the result.
10. Explain red-teaming for LLM safety — what categories of adversarial prompts (jailbreaks, prompt injection, data exfiltration attempts) should I be testing against for an application that [has tool access / handles sensitive data], and how do I structure a red-team test suite?

## Implementation prompts (build & debug)

1. Write a Python evaluation harness using RAGAS that scores a batch of [N] question/answer/context triples on faithfulness and context recall, and outputs a CSV report with per-example and aggregate scores.
2. Build an LLM-as-judge pipeline that takes a candidate response and a reference answer, scores it on [accuracy, completeness, tone] using a structured rubric prompt, and returns a JSON object with per-criterion scores and a justification — show me the judge prompt template.
3. Instrument my [FastAPI/Flask] LLM application with Langfuse tracing so every request logs the prompt, retrieved context (if RAG), model response, token counts, latency, and cost, and show me how to tag traces by [user segment/feature flag] for later filtering.
4. Write a regression test suite that runs my current prompt against a fixed set of [50] golden examples and fails CI if the LLM-as-judge score drops more than [5%] from the last committed baseline.
5. Debug why my LLM-as-judge scores disagree with human reviewers on [X]% of examples — here are 10 disagreement cases: [paste examples]. Diagnose whether the judge rubric is ambiguous, the judge model is biased toward a particular response style, or the human raters disagree with each other too.
6. Implement a hallucination detection check that samples [3] generations at temperature [0.7] for the same prompt and flags low self-consistency as a hallucination risk signal, then route flagged responses to a stricter fallback prompt or human review.
7. Set up cost and latency monitoring dashboards in [Langfuse/Phoenix] that alert when P95 latency exceeds [2 seconds] or daily spend exceeds [$X], and show me how to break this down by [model/endpoint/customer tier].
8. Write an A/B testing harness that randomly assigns production traffic between [prompt v1 and prompt v2] (or [model A and model B]), logs outcomes to [Langfuse/a data warehouse], and computes statistical significance on [the chosen success metric] once enough samples are collected.
9. Build a red-team test suite of [20-30] adversarial prompts targeting prompt injection and jailbreak attempts for my [customer-facing chatbot with tool access], and write an automated check that flags any response that complies with the injected instruction.
10. Debug a sudden spike in token usage and cost visible in my [Langfuse/Helicone] dashboard — walk through how to use trace-level data to identify whether this is caused by a prompt template change, a runaway agent loop, or a shift in user query length.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a continuous evaluation pipeline that runs golden-set regression tests on every prompt or model change before deploy, runs a sampled LLM-as-judge evaluation on a slice of live production traffic daily, and surfaces both in a single quality dashboard.
2. Critique this evaluation strategy [paste: golden set size, judge model, metrics used, human eval cadence] for a [high-stakes domain, e.g., medical/legal/financial] application, and identify where it's insufficient for the risk level.
3. Stress-test my LLM-as-judge rubric against responses that are factually correct but stylistically off-brand, or stylistically perfect but subtly wrong — does the current rubric correctly penalize the response that matters more for my use case?
4. Design a calibration process for an LLM-as-judge that re-validates judge-human agreement on a rolling basis (e.g., monthly) to catch judge drift if the underlying judge model is updated by the provider without notice.
5. Propose a sampling strategy for human evaluation of production traffic that prioritizes reviewing low-confidence or flagged-as-risky generations over random sampling, to get more signal per reviewer-hour for a team that can only review [N] examples/week.
6. Design an observability strategy for a multi-agent or multi-step pipeline (not a single LLM call) where I need to attribute a bad final output to a specific step — what trace structure in [Langfuse/Phoenix] lets me see the full causal chain from initial query to final answer?
7. My hallucination rate (measured via [method]) increased after a model provider pushed a silent model update behind the same API endpoint — design a detection mechanism (canary prompts run on a schedule) that would catch this kind of silent regression before it shows up in user complaints.
8. Compare the cost and reliability trade-offs of using a large, expensive model (e.g., GPT-4o) as an LLM-as-judge versus a smaller fine-tuned judge model, for an evaluation pipeline running [N] judgments/day.
9. Design a red-teaming program that goes beyond static adversarial prompt lists to include adaptive/automated red-teaming (e.g., another LLM iteratively probing for jailbreaks) for an application with [tool access to sensitive systems], and define the escalation path when a new jailbreak is found.
10. Propose a framework for deciding when an automatic metric (RAGAS, LLM-as-judge) is sufficient versus when a human-in-the-loop review is mandatory before a model or prompt change ships to production, based on [risk tier of the application].

## Follow-up / chaining prompts

1. Now stress-test the LLM-as-judge rubric you just wrote against a response that's verbose and confident but subtly wrong — does the rubric catch it, or does it reward confident-sounding text?
2. Now explain the trade-off you just made by sampling production traffic for human review instead of reviewing everything — what failure modes might slip through with a [X]% sample rate?
3. Given the regression test suite we just built, tell me what happens when the golden set itself becomes stale (e.g., user query patterns shift over 6 months) — how do I know it's time to refresh it?
4. Now take the cost/latency monitoring dashboard we designed and explain what additional instrumentation I'd need to distinguish a cost spike caused by more traffic from one caused by a prompt regression that's generating longer responses.
5. Now quantify how confident I should be in the A/B test result we discussed if it only ran for [N] days with [M] samples per arm — is that enough to detect a [5%] improvement in the chosen metric?

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I evaluate my LLM app?"
**Sharper:** "I have a RAG-based internal knowledge assistant with no eval process today — help me build a 50-example golden set sampled from real support logs, choose between RAGAS faithfulness and a custom LLM-as-judge rubric, and set a baseline score I can regression-test against in CI."

**Weak:** "Is my LLM-as-judge any good?"
**Sharper:** "My LLM-as-judge (GPT-4o, 1-5 helpfulness rubric) agrees with human raters on 72% of a 40-example sample — walk through whether that agreement rate is acceptable for gating production deploys, and if not, whether the fix is a clearer rubric or a different judge model."

**Weak:** "Set up monitoring for my LLM app."
**Sharper:** "I'm calling Claude and OpenAI APIs from a FastAPI backend with no tracing today — instrument Langfuse to capture prompt, response, token counts, and latency per request, tagged by customer tier, and set an alert when P95 latency crosses 2 seconds."

**Weak:** "How do I stop my chatbot from hallucinating?"
**Sharper:** "My customer support bot sometimes states return policy details that aren't in the retrieved knowledge-base chunks — design a self-consistency check (3 samples at temperature 0.7) plus a faithfulness check against retrieved context, and tell me which signal is a stronger predictor of hallucination for this kind of factual lookup task."

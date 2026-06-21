---
name: aiml-prompt-engineering-techniques
description: Curated meta-prompts for designing robust LLM prompts — few-shot, chain-of-thought, structured output, prompt optimization. Use when building or debugging prompts inside an LLM application.
---

# Prompt Engineering Techniques — Prompt Library (AI/ML Engineer)

Prompt engineering in 2026 is a production engineering discipline, not a one-off trick — it covers system prompt design for agents, structured output enforcement via JSON mode and function-calling schemas, chain-of-thought and self-consistency for reasoning-heavy tasks, and the prompt injection hardening that's now table stakes for anything that ingests untrusted text. Good work here treats prompts as versioned, tested artifacts: changes get evaluated against a regression suite (not just a vibe check), structured outputs are validated against a schema with retry/repair logic, and long-context prompts are engineered for position bias (the "lost in the middle" problem) rather than just stuffed with everything available. The high-value skill is knowing which technique fixes which failure mode — few-shot examples fix format drift, chain-of-thought fixes multi-step reasoning errors, self-consistency fixes high-variance single-shot answers, and none of them fix a prompt that's ambiguous about the actual task. As context windows grow and agentic multi-turn systems become the default application shape, prompt compression, conversation state management, and injection defenses matter as much as the wording of any individual instruction.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare zero-shot, few-shot, and fine-tuned approaches for getting [model, e.g., GPT-4o/Claude] to reliably perform [task, e.g., classify support tickets into 12 categories] — at what point does few-shot stop being enough and I should consider fine-tuning instead?
2. Explain when chain-of-thought prompting actually improves accuracy on [task type] versus when it just adds latency and token cost without improving the answer — what's the diagnostic for "this task needs CoT"?
3. Compare self-consistency (sampling N chain-of-thought paths and majority-voting) against tree-of-thought search for my [reasoning task] — given my latency/cost budget of [constraint], which is actually deployable?
4. Walk me through the difference between OpenAI/Anthropic-style function calling (tool schemas) and raw JSON-mode prompting for getting [model] to return structured output matching [schema description] — which gives stronger guarantees and what's the failure mode of each?
5. Explain the "lost in the middle" phenomenon for long-context prompts — if I'm stuffing [N tokens] of [document type] into the context window for [task], where should the most important information go and why?
6. Compare system-prompt-based instruction versus few-shot examples for enforcing a specific output style/persona in [model] across a multi-turn conversation — which is more robust to the user trying to override it mid-conversation?
7. Explain the main categories of prompt injection attacks (direct override, indirect via retrieved content, payload smuggling) relevant to my [RAG/agent] application that ingests [untrusted content source] — which category is my biggest exposure?
8. Compare prompt compression techniques (LLMLingua-style token pruning, summarization-based compression, simply truncating) for fitting [content type] into a [context window size] budget — which preserves task-relevant information best for [downstream task]?
9. Walk me through designing a multi-turn conversation prompt structure for my [agent/chatbot] that needs to maintain [state, e.g., user preferences, task progress] across [N] turns without the model losing track or the context window overflowing.
10. Explain how prompt versioning and A/B testing should work for my production prompt that drives [feature] — what regression suite or eval set do I need before I can safely ship a prompt change?

## Implementation prompts (build & debug)

1. Write a few-shot prompt with [3-5] examples for getting [model] to extract [structured fields, e.g., name, date, amount] from [input type, e.g., invoices] in a consistent format, including at least one example showing the edge case [edge case description].
2. Debug why my JSON-mode prompt for [model] sometimes returns malformed JSON or hallucinated fields not in my schema — here's my current prompt and schema: [paste both]. Add explicit schema constraints and a repair/retry strategy.
3. Write a function-calling/tool-schema definition for [tool name] with parameters [list parameters and types] that [model] should call when the user asks [example trigger phrases], and test it against [3] ambiguous phrasings to check it doesn't over- or under-trigger.
4. Design and write a chain-of-thought prompt for [reasoning task, e.g., multi-step math/code review] that elicits step-by-step reasoning before the final answer, then show me how to parse out just the final answer reliably when the reasoning is verbose.
5. Write a system prompt for my [agent/chatbot] that hardens against prompt injection from [untrusted content source, e.g., retrieved documents in RAG] by clearly delineating instructions from data and adding an explicit instruction-hierarchy reminder.
6. Debug why my multi-turn conversation prompt loses track of [state, e.g., a constraint the user set 5 turns ago] — here's my conversation history management approach: [paste/describe]. Diagnose whether this is a context window truncation issue or an attention/recency bias issue.
7. Implement a self-consistency wrapper that samples [N] chain-of-thought completions from [model] at temperature [value] for [task], then aggregates via majority vote, and show me how to handle ties or low-agreement cases.
8. Write a prompt-versioning test harness (e.g., using promptfoo or a custom eval script) that runs my candidate prompt change against a regression set of [N] historical examples and flags any case where output quality or schema validity regresses versus the current production prompt.
9. Design a prompt compression strategy for fitting [N tokens] of [document type] context into a [target token budget] using [extractive summarization/LLMLingua], and write the prompt template that clearly marks compressed sections so the model doesn't treat gaps as missing information.
10. Write a structured-output prompt with a strict JSON schema for [output type] that includes explicit instructions for handling [edge case, e.g., "if no value is found, return null not an empty string"], and add a validation step using [Pydantic/Zod] that retries with an error message fed back to the model on failure.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a prompt injection defense-in-depth strategy for my [RAG/agent] system that processes [untrusted content source] — combining instruction-data delineation, an output-side classifier to catch leaked system prompts, and a allowlist for tool-calling actions the model can trigger from retrieved content.
2. My chain-of-thought prompt for [task] produces correct reasoning but the wrong final answer extraction [X%] of the time — design a more robust answer-extraction strategy (structured output for just the final answer, or a second extraction-only LLM call) and a way to measure if it actually improves end-to-end accuracy.
3. Critique my system prompt for [agent] for ambiguity and conflicting instructions — here's the full prompt: [paste] — identify every instruction that could be interpreted multiple ways or that contradicts another instruction, especially under adversarial user input.
4. Design a tree-of-thought prompting strategy for [complex planning/reasoning task] where the model needs to explore [N] candidate next-steps and self-evaluate before committing — specify the branching factor, evaluation criteria, and pruning strategy, and estimate the token/cost multiplier versus single-shot CoT.
5. My structured-output extraction from [model] via function calling has a [X%] schema-validation failure rate in production on [input type] — design a fallback chain (retry with error feedback, then a stricter re-prompt, then a smaller deterministic parser) and specify what failure rate would justify fine-tuning instead.
6. Design a long-context prompt architecture for [task] that needs to reason over [N tokens] of [document type] while avoiding the lost-in-the-middle effect — compare strategies like query-aware chunking with re-ranking, hierarchical summarization, versus simply relying on [model]'s long-context claims, and specify how you'd test which actually works.
7. Evaluate whether my multi-turn agent's prompt should manage conversation state via full history replay, a rolling summary, or an explicit state object (e.g., JSON memory) updated each turn — given conversations average [N] turns and need to retain [specific state], which approach minimizes both token cost and state-loss errors?
8. Design a prompt A/B testing and rollback strategy for my production system prompt that drives [feature], specifying what online metric (task success rate, user correction rate, latency) and what regression eval set would gate a prompt change from reaching 100% of traffic.
9. Stress-test my structured-output schema for [output type] against adversarial or malformed inputs (e.g., a user trying to inject extra fields, oversized strings, or nested objects beyond the schema) — design the validation layer that rejects or sanitizes these before they reach downstream systems.
10. Compare the cost, latency, and reliability trade-offs of self-consistency (N samples + majority vote) versus a single call with a stronger/larger model versus a single call with extended chain-of-thought for my [reasoning task] at [target accuracy] — at what N does self-consistency's marginal accuracy gain stop justifying the token cost?

## Follow-up / chaining prompts

1. Now stress-test the prompt injection defenses you just designed against an indirect injection embedded inside [retrieved document content] rather than the user's direct message — does the defense still hold?
2. Now explain the trade-off you just made choosing [a rolling summary] over [full history replay] for conversation state, and tell me at what conversation length the summary approach starts losing information that matters.
3. Take the few-shot prompt we just wrote and show me how to reduce it to fewer examples (or zero-shot) without losing the format consistency we got from the examples — what's the minimum example count that still works?
4. Now recompute the cost/accuracy trade-off for the self-consistency wrapper using the actual agreement rate we observed at N=5 — is it worth increasing N to 10, or should I switch to a stronger single-call model instead?
5. Given the structured-output validation chain we just built, show me how to log and categorize the schema-validation failures so I can tell if they cluster around one input pattern that needs a dedicated prompt branch.
6. Now take the system prompt we hardened against injection and run it through the ambiguity critique from the advanced section — did hardening it introduce any new conflicting instructions?

## Anti-patterns: prompts that get weak answers

**Weak:** "Write a good prompt for extracting data."
**Sharper:** "Write a few-shot prompt with 4 examples for extracting invoice number, date, and total amount from scanned invoice OCR text, including one example with a missing total field handled as null."

**Weak:** "How do I stop prompt injection?"
**Sharper:** "Design a defense-in-depth strategy against indirect prompt injection for my RAG chatbot that retrieves and displays untrusted web content, combining instruction-data delineation tags and an output-side check for leaked system prompt text."

**Weak:** "Make my JSON output more reliable."
**Sharper:** "My GPT-4o function-calling extraction has a 7% schema validation failure rate on messy customer emails — design a retry-with-error-feedback chain plus a deterministic regex fallback for the date field specifically."

**Weak:** "Should I use chain-of-thought?"
**Sharper:** "Compare zero-shot vs chain-of-thought prompting for a multi-step unit conversion task where single-shot accuracy is currently 71% — would CoT or self-consistency with N=5 get me closer to 95%, given a 2-second latency budget?"

**Weak:** "How do I handle long documents in prompts?"
**Sharper:** "Design a chunking and re-ranking strategy for fitting a 200-page contract into a prompt for clause-extraction, avoiding the lost-in-the-middle effect, and specify how to test whether the model actually used clauses from the middle of the document."

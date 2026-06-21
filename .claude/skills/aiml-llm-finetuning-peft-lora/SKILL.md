---
name: aiml-llm-finetuning-peft-lora
description: Curated prompts for fine-tuning LLMs — full fine-tuning vs LoRA/QLoRA/PEFT, dataset prep, evaluation. Use when adapting a foundation model to a custom task or dataset.
---

# LLM Fine-Tuning, PEFT & LoRA — Prompt Library (AI/ML Engineer)

Fine-tuning in 2026 is rarely full-parameter; the default starting point is LoRA or QLoRA on an open-weight base model (Llama, Qwen, Mistral families and similar), with full fine-tuning reserved for cases with large budgets and a clear case that parameter-efficient methods plateau too early. Good work here means treating dataset quality as the dominant variable — deduplication, instruction-format consistency, and filtering noisy examples matter more than squeezing another point of rank out of LoRA — and rank/alpha/target-module choices are justified by an ablation, not folklore defaults. Evaluation has to compare the fine-tuned model against the base model (and often a strong few-shot-prompted baseline) on held-out task metrics, not just eyeball a few generations, because a fine-tune that "feels better" can still regress general capability through catastrophic forgetting. Compute and cost estimation (GPU-hours, VRAM for QLoRA at 4-bit vs full fp16, adapter merge implications) is now a routine part of the job since fine-tuning competes against just prompting a larger frontier model. This skill area is about making the full-fine-tune-vs-PEFT-vs-prompting decision rigorously and executing whichever is chosen without wasting compute or quietly degrading the base model.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare full fine-tuning, LoRA, QLoRA, and prompt-tuning for adapting [base model, e.g., Llama-3-8B] to [task description] given I have [GPU budget, e.g., 1x A100 80GB] and [dataset size] examples — which is actually viable at my compute budget?
2. Explain how QLoRA's 4-bit NF4 quantization plus double quantization keeps fine-tuning quality close to full fp16 LoRA — what's the realistic quality gap for my [task type] and is it worth the VRAM savings?
3. Walk me through how to choose LoRA rank and alpha for fine-tuning [base model] on [task] — explain the relationship between rank, the number of trainable parameters, and underfitting/overfitting risk for my dataset size of [N examples].
4. Compare instruction-tuning data formats (Alpaca-style, ChatML, ShareGPT multi-turn) for preparing my dataset of [N] [raw data description, e.g., support ticket transcripts] — which format matches [base model]'s expected chat template and what breaks if I get it wrong?
5. Explain catastrophic forgetting risk when fine-tuning [base model] on a narrow [domain/task] dataset of only [N] examples — what symptoms would I see in general capability, and how does LoRA's limited parameter footprint mitigate this versus full fine-tuning?
6. Compare RLHF (PPO-based) and DPO for aligning [base model] to my preference data of [N] pairs — why has DPO become the more common choice for teams without RLHF infrastructure, and what am I giving up?
7. Explain what "merging adapters" actually does mathematically when I merge a LoRA adapter into [base model]'s weights — when should I merge versus keep the adapter separate and swap it at inference time?
8. Compare evaluating my fine-tuned [base model] against the base model alone, the base model with few-shot prompting, and a larger frontier model with zero-shot prompting on [task] — what does each comparison actually tell me about whether fine-tuning was worth it?
9. Walk me through estimating GPU-hours and cost for QLoRA fine-tuning [base model size, e.g., 13B params] on [N] examples for [N] epochs on [GPU type] — what's the rough $ figure and where does the estimate break down if I underestimate sequence length?
10. Explain quantization-aware fine-tuning (QLoRA-style 4-bit training versus post-training quantization of a fully fine-tuned model) for my deployment target of [inference hardware] — which produces a better quality/footprint trade-off for [model size]?

## Implementation prompts (build & debug)

1. Write a QLoRA fine-tuning script using `peft` and `bitsandbytes` for [base model] on my [dataset], with 4-bit NF4 quantization, LoRA rank [N], alpha [N], targeting [attention/MLP] modules, and gradient checkpointing enabled.
2. Write a deduplication and quality-filtering pipeline for my instruction-tuning dataset of [N] raw examples — dedupe near-duplicates via [MinHash/embedding similarity], then filter out examples with [quality issue, e.g., truncated responses, refusals, length outliers].
3. Debug why my LoRA fine-tuned [base model] produces worse outputs than the base model on [held-out eval set] — here's my training config (rank, alpha, learning rate, epochs): [paste]. Check for overfitting on a too-small or too-narrow dataset.
4. Implement a DPO training loop using [TRL library] for [base model] with my preference pairs dataset of [N] examples, including the reference model setup and the beta hyperparameter for the KL penalty.
5. Write an evaluation harness that scores my fine-tuned model against the base model on [task-specific metric, e.g., exact match, ROUGE, pairwise LLM-judge preference] across a held-out set of [N] examples, with statistical significance testing on the score difference.
6. Refactor my full fine-tuning training loop into a LoRA setup using `peft.get_peft_model`, making sure to correctly freeze base model weights, target the right module names for [base model architecture], and confirm trainable parameter count drops as expected.
7. Write a script to merge a trained LoRA adapter into [base model]'s base weights using `peft`'s `merge_and_unload()`, then validate output parity between the merged model and the adapter-attached model on [N] test prompts.
8. Debug a CUDA OOM error during QLoRA fine-tuning of [model size] on [GPU with VRAM amount] — here's my batch size, sequence length, and gradient accumulation settings: [paste]. Walk through gradient checkpointing, batch size reduction, and sequence length truncation trade-offs.
9. Implement a training data formatter that converts my raw [conversation logs/Q&A pairs] into [base model]'s exact chat template (system/user/assistant turns), including correct handling of multi-turn context and loss masking on the prompt tokens.
10. Write a script to quantify catastrophic forgetting by evaluating my fine-tuned [base model] on [N] general-capability benchmark examples (e.g., MMLU subset) before and after fine-tuning, and flag if the drop exceeds [threshold, e.g., 3 points].

## Advanced prompts (architecture, optimization, edge cases)

1. Design a fine-tuning strategy for [base model] that needs to serve [N] different customer-specific behaviors — compare training [N] separate LoRA adapters swapped at inference time versus one fine-tune with all data mixed, given my serving infrastructure is [description].
2. My QLoRA fine-tune of [base model] shows strong held-out task metrics but degrades on an unrelated general-capability eval by [X points] — design a data mixing strategy (interleaving general instruction data with task-specific data) to reduce forgetting without diluting task performance.
3. Critique my LoRA rank/alpha choice of [rank=N, alpha=N] for [task] — design an ablation across [3-4 rank values] to find the point of diminishing returns, and tell me what eval metric and dataset size would let me detect that point reliably.
4. Design a DPO data collection and training pipeline starting from my SFT model's outputs — specifically how to generate the preference pairs (e.g., best-of-n sampling, rejection sampling against a reward model) for [task], and what beta value balances staying close to the SFT model versus optimizing the preference signal.
5. Evaluate the cost/quality trade-off between fine-tuning [base model size, e.g., 8B] with QLoRA on my [N]-example dataset versus simply few-shot prompting a larger frontier model via API for [task] — at what request volume does fine-tuning amortize its training cost?
6. Design a quantization-aware fine-tuning pipeline targeting [deployment format, e.g., GGUF 4-bit for llama.cpp / AWQ for vLLM] so the model that's fine-tuned matches the precision it will actually run at in production, avoiding a quality cliff from post-training quantization.
7. My fine-tuned model needs to support [N] languages or domains with shared and domain-specific behavior — design a multi-adapter or mixture-of-LoRA architecture (e.g., LoRA-hub style routing) and specify how routing decisions are made at inference time.
8. Stress-test my fine-tuned [base model] for regressions on adversarial or edge-case prompts (e.g., prompts resembling [training data format] but from an out-of-distribution domain) — design an eval set specifically targeting where fine-tuning might have overfit to surface patterns rather than the underlying task.
9. Design a continual fine-tuning pipeline where [base model] gets periodic LoRA updates as new data arrives weekly — specify how to avoid retraining from scratch each time, whether to merge-then-retrain or chain adapters, and how to detect adapter drift across versions.
10. Compare the inference-time cost and latency of serving [base model] with a merged fine-tune versus a base model plus hot-swappable LoRA adapter (e.g., via vLLM's multi-LoRA serving) for a multi-tenant deployment with [N] tenants, each with a custom adapter.

## Follow-up / chaining prompts

1. Now stress-test the multi-LoRA-adapter architecture you proposed for the case where two tenants' adapters need to be active in the same batched inference request — does vLLM's multi-LoRA serving actually support that, and what's the latency cost?
2. Now explain the trade-off you just made choosing [QLoRA rank=16] over [rank=64] for my task, and tell me what eval signal would tell me I'm underfitting and should raise the rank.
3. Take the DPO training setup we just built and show me how to detect reward hacking or degenerate outputs (e.g., repetition, length gaming) before I ship this preference-tuned model.
4. Now recompute the cost/quality comparison between fine-tuning and few-shot prompting using the actual eval numbers from our held-out test — does the breakeven request volume change?
5. Given the catastrophic forgetting mitigation (data mixing) we just designed, show me how to ablate the mixing ratio to find the point that best balances task performance and general capability retention.
6. Now take the merged adapter from our fine-tune and show me how to validate numerically that `merge_and_unload()` produced outputs identical to the adapter-attached model within floating-point tolerance.

## Anti-patterns: prompts that get weak answers

**Weak:** "Should I fine-tune or use LoRA?"
**Sharper:** "Compare full fine-tuning vs QLoRA for adapting Llama-3-8B to a customer support classification task with 12,000 labeled examples, given I have one A100 80GB and need this trained within a day."

**Weak:** "How do I prepare my dataset for fine-tuning?"
**Sharper:** "Design a deduplication and quality-filtering pipeline for 40,000 raw support transcripts before instruction-tuning, using embedding-similarity dedup and filtering examples with truncated or templated responses."

**Weak:** "What LoRA settings should I use?"
**Sharper:** "I'm fine-tuning Mistral-7B with QLoRA on 8,000 examples — design an ablation across rank 8, 16, 32, and 64 with alpha = 2x rank to find where validation loss stops improving."

**Weak:** "How do I evaluate my fine-tuned model?"
**Sharper:** "Build an eval harness comparing my DPO-tuned model against the SFT checkpoint on 200 held-out prompts using a pairwise LLM-judge, with significance testing on the win rate difference."

**Weak:** "My fine-tuned model got worse."
**Sharper:** "My LoRA fine-tune of Llama-3-8B (rank 16, alpha 32, lr 2e-4, 3 epochs on 5,000 examples) scores lower than the base model on my held-out eval — diagnose whether this is overfitting from too few epochs of a too-narrow dataset or a learning rate that's too high."

---
name: aiml-model-serving-inference-optimization
description: Curated prompts for optimizing model serving and inference — quantization, batching, latency reduction, GPU utilization. Use when deploying models for low-latency or high-throughput production inference.
---

# Model Serving & Inference Optimization — Prompt Library (AI/ML Engineer)

Inference is where ML economics actually get decided in 2026 — training is a one-time cost, but serving runs 24/7 and scales with traffic, so a 2x improvement in tokens/sec or a 30% cut in p99 latency compounds into real infrastructure savings every single day. Good inference engineering means picking the right serving stack for the workload (vLLM or TensorRT-LLM for LLM token generation, Triton for multi-framework/multi-model serving, TorchServe for simpler PyTorch deployments), squeezing GPU utilization with continuous batching and KV-cache management instead of leaving accelerators idle between requests, and using quantization (INT8/INT4, GPTQ, AWQ) to shrink memory footprint and increase throughput without silently wrecking accuracy. It also means thinking past a single request: cold-start latency on autoscaled GPU pods, multi-model serving on shared hardware, speculative decoding to cut latency on long generations, and constantly tracking cost-per-token or cost-per-inference as the metric that ties engineering decisions back to the P&L. The discipline here is empirical — every optimization (batching window, quantization scheme, speculative decoding draft model) trades off latency, throughput, accuracy, or cost against each other, and "good" means knowing exactly which dial you're turning and what it costs you elsewhere.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare vLLM, TensorRT-LLM, and Triton Inference Server for serving my [7B/13B/70B parameter] LLM, and recommend one based on my need for [continuous batching/multi-GPU tensor parallelism/multi-framework support] and my team's [CUDA/TensorRT experience level].
2. Explain how continuous batching in vLLM differs from the static/dynamic batching used in TorchServe or Triton, and why that difference matters for a workload with [highly variable input/output sequence lengths].
3. Walk me through how PagedAttention manages the KV-cache in vLLM, and explain what specifically causes KV-cache fragmentation in a naive implementation that PagedAttention avoids.
4. Compare INT8, INT4, GPTQ, and AWQ quantization for my [Llama/Mistral-class] model, and tell me which one gives the best latency-vs-accuracy trade-off for a [chat/RAG/classification] use case running on [A100/L4/T4] GPUs.
5. Explain speculative decoding end to end — how a smaller draft model proposes tokens that the larger target model verifies in parallel — and tell me what draft-model size ratio is realistic for my [target model size] before verification overhead eats the gains.
6. Walk through the GPU-vs-CPU decision for my inference workload that does [model type/size] at [expected QPS] — at what point does GPU inference's fixed cost get justified versus running on CPU with [ONNX Runtime/OpenVINO]?
7. Explain what "cost per token" actually includes for an LLM serving deployment — GPU amortization, idle time between bursts, batching efficiency — and how I should calculate it for my [deployment configuration] to compare against an API provider's per-token pricing.
8. Explain the trade-offs of multi-model serving on a single GPU (model parallelism vs. time-slicing vs. MIG partitioning) for my use case of hosting [N different models] that each get sporadic traffic.
9. Walk through cold-start latency sources for an autoscaled GPU inference pod — container pull, CUDA context init, model weight loading from [disk/S3/network storage] — and tell me which one dominates for a [model size] model on [instance type].
10. Compare dynamic batching window strategies (max batch size vs. max wait time vs. adaptive) for my [latency-SLA, e.g., p99 < 200ms] serving endpoint, and explain how to tune the batching window without violating that SLA.

## Implementation prompts (build & debug)

1. Write a vLLM serving configuration for my [model name/size] that enables continuous batching and tensor parallelism across [N GPUs], and set the `gpu_memory_utilization` and `max_num_seqs` parameters appropriately for a workload averaging [token count] input length.
2. Quantize my [Hugging Face model] to INT4 using [GPTQ/AWQ], and write the calibration script plus an evaluation harness that compares perplexity/accuracy on [my eval dataset] before and after quantization.
3. Debug a TensorRT-LLM deployment where throughput dropped after I increased the max batch size — walk through checking KV-cache memory pressure, engine build flags, and whether I'm hitting a GPU memory OOM that's silently causing batch size fallback.
4. Set up a Triton Inference Server deployment with an ensemble pipeline that runs [a preprocessing model], then [my main model], then [a postprocessing step], and configure dynamic batching per model in the ensemble.
5. Implement speculative decoding for my [target model] using [a smaller same-family draft model], and write the acceptance-rate logging so I can measure actual speedup versus the theoretical best case.
6. Debug a latency regression where p50 latency is fine but p99 latency spiked after I deployed continuous batching — walk through checking request queuing behavior, whether long-sequence requests are starving short ones, and whether I need request-length-aware scheduling.
7. Write an autoscaling configuration (KEDA or HPA with custom metrics) for my GPU inference deployment that scales on [queue depth/GPU utilization/requests-per-second] instead of CPU utilization, since CPU metrics don't reflect GPU saturation.
8. Implement a cold-start mitigation strategy for my autoscaled inference pods — compare keeping [N] warm replicas versus snapshotting GPU memory state versus lazy-loading model shards — for my [model size] model with [traffic burstiness pattern].
9. Profile my current inference pipeline running [model name] on [GPU type] to find the actual bottleneck — is it GPU compute, memory bandwidth, host-to-device transfer, or tokenization/detokenization overhead on CPU — using [Nsight Systems/PyTorch profiler/vLLM's built-in metrics].
10. Write a multi-model serving setup on Triton that hosts [N models] on [M GPUs] with per-model instance groups, and configure model priority/queueing so a low-latency model isn't starved by a high-throughput batch model sharing the same GPU.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a serving architecture for an LLM workload that needs to support both interactive chat (low-latency, small batches) and bulk batch inference (high-throughput, large batches) on the same model — should this be one deployment with adaptive batching or two separate pools, and how do I route traffic between them?
2. Critique my current GPU utilization numbers [paste: average utilization %, batch sizes, request patterns] and identify whether my bottleneck is genuinely compute-bound or whether I'm leaving throughput on the table due to suboptimal batching/scheduling.
3. Stress-test my quantized [INT4/AWQ] model against a production-realistic eval set that includes [edge cases, e.g., long-context inputs, rare languages, adversarial prompts] — does the accuracy drop I measured on a clean benchmark hold up, or does quantization degrade disproportionately on harder examples?
4. Design a cost-per-token optimization strategy that combines quantization, continuous batching, and right-sized GPU instance selection for my [traffic volume] workload, and quantify the expected cost reduction at each stage versus the added engineering/accuracy risk.
5. Propose a KV-cache offloading strategy (CPU offload, cache compression, or eviction policy) for serving long-context requests (e.g., [32k/128k tokens]) without running out of GPU memory, and explain the latency penalty each approach introduces.
6. My speculative decoding setup gets a high acceptance rate on benchmark prompts but a much lower one in production — walk through how prompt distribution shift (e.g., production has more code/structured output than benchmark prose) could explain this, and how to pick a better-matched draft model.
7. Design a failure-mode-resilient serving architecture where a single GPU node failure under continuous batching doesn't drop in-flight requests — what's the right balance of request replication, checkpointing in-flight state, and graceful degradation to a smaller/CPU fallback model?
8. Compare the operational complexity and performance ceiling of building a custom CUDA kernel for [a specific bottleneck operation, e.g., custom attention variant] versus using an off-the-shelf optimized kernel from [FlashAttention/TensorRT-LLM plugins], for my [model architecture].
9. Stress-test my autoscaling configuration against a traffic spike that's 10x normal load within [time window] — given GPU pod cold-start time of [X seconds/minutes], will my current min-replica count and scale-up rate avoid a request queue backlog, or do I need predictive/scheduled scaling?
10. Design a multi-tenant inference platform that serves [N internal teams'] models with fair GPU resource sharing, per-tenant rate limiting, and cost attribution, while still hitting per-tenant latency SLAs — what isolation mechanism (MIG, time-slicing, dedicated node pools) fits best?

## Follow-up / chaining prompts

1. Now stress-test the vLLM configuration you just gave me against a burst of [50] concurrent long-context requests arriving simultaneously — does `max_num_seqs` need to change, and what happens to p99 latency for the requests at the back of the queue?
2. Given the INT4 quantization approach we just discussed, quantify what accuracy metric I should actually gate on before shipping to production — is perplexity sufficient, or do I need task-specific eval (e.g., exact-match on [my downstream task])?
3. Now take the cold-start mitigation strategy you proposed and calculate the actual dollar cost of keeping [N] warm replicas 24/7 versus the cost of occasional cold-start latency violations — at what traffic volume does warm-pooling pay for itself?
4. Now explain what would break in the speculative decoding setup you designed if I swap the target model for a fine-tuned version that diverges more from the draft model's distribution — do I need to retrain or pick a new draft model?
5. Given the multi-model Triton ensemble we just configured, walk through what happens during a rolling deployment update to just one model in the pipeline — does the whole ensemble need to restart, or can I hot-swap a single component?
6. Now revisit the cost-per-token calculation we did and add in the engineering/on-call cost of maintaining this custom serving stack versus paying a managed API provider — at what request volume does self-hosting actually win?

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I make my model inference faster?"
**Sharper:** "My 13B-parameter LLM is serving at 8 tokens/sec/request on an A100 using plain Hugging Face `generate()` with no batching — walk through migrating to vLLM with continuous batching and AWQ quantization, and estimate the realistic throughput gain for my workload of mostly 200-500 token responses."

**Weak:** "Should I quantize my model?"
**Sharper:** "I need to cut GPU memory footprint in half for my Mistral-7B deployment so I can fit two model replicas per A10G instead of one — compare GPTQ and AWQ INT4 quantization specifically for accuracy retention on a classification head, not just generation quality."

**Weak:** "My latency is too high, help."
**Sharper:** "My Triton-served model has p50 latency of 40ms but p99 of 800ms under a load of 200 QPS — walk through whether this is a batching queue starvation issue, a GPU memory pressure issue, or a tail latency from a specific input length bucket, and what metrics I should pull to tell the difference."

**Weak:** "How do I scale my inference deployment?"
**Sharper:** "My GPU inference pods take 90 seconds to cold-start (CUDA init plus loading a 14GB model from S3) and my HPA is reacting to CPU metrics that don't reflect GPU load — design an autoscaling approach using KEDA with a custom GPU-utilization or queue-depth metric, plus a warm-pool strategy to absorb traffic spikes during scale-up."

**Weak:** "What's the best way to serve multiple models?"
**Sharper:** "I need to host 6 fine-tuned variants of the same base model (different LoRA adapters) on a single A100 without loading 6 full copies into memory — explain how multi-LoRA serving in vLLM or S-LoRA handles shared base weights with per-request adapter swapping, and what the throughput penalty is versus serving one model."

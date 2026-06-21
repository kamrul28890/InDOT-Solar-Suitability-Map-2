---
name: aiml-deep-learning-architecture
description: Curated prompts for deep learning model design with PyTorch/TensorFlow — architecture choices, training loops, debugging convergence issues. Use for neural network design and training tasks.
---

# Deep Learning Architecture — Prompt Library (AI/ML Engineer)

Deep learning work in 2026 spans custom CNNs/RNNs for specialized signal/vision tasks, Transformers for sequence and multimodal problems, and the training infrastructure (PyTorch DDP/FSDP, mixed precision, LR scheduling) that makes any of it converge reliably at scale. Good work here means picking the simplest architecture that fits the inductive bias of the problem (don't reach for a Transformer when a CNN's locality assumption is the better fit), instrumenting the training loop so gradient/loss pathologies are caught within a few hundred steps instead of discovered after a multi-hour run, and knowing exactly which regularization and scheduling levers (dropout, weight decay, warmup+cosine decay, batchnorm vs layernorm) to pull for which symptom. The expensive failure modes are training instability (vanishing/exploding gradients, loss spikes), wasted compute from not using mixed precision or the right distributed strategy, and transfer learning done carelessly (catastrophic forgetting, frozen layers chosen by guesswork). This skill area is about engineering the training process with the same rigor as the architecture itself, since for most teams the loop and the data pipeline cause more failures than the model definition.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare a CNN, a Transformer encoder, and a simple MLP for my [task description, e.g., "classifying 1D sensor sequences of length 500"] — which architecture's inductive bias actually matches my data's structure, and which am I choosing just because it's popular?
2. Explain the difference between batchnorm and layernorm for my [CNN/Transformer] architecture trained with batch size [N] — which is more stable given my batch size constraint, and why do Transformers default to layernorm?
3. Walk me through how vanishing and exploding gradients manifest differently in my training logs (loss curve, gradient norm plots) for a [RNN/deep CNN/Transformer] with [N] layers, and what the first 3 things to check are.
4. Compare cosine annealing, linear warmup + decay, and `ReduceLROnPlateau` for scheduling learning rate on my [model type] training run of [N] epochs/steps — which is standard for [Transformer pretraining/CNN fine-tuning] and why?
5. Explain when mixed-precision training (fp16/bf16 via `torch.cuda.amp` or TF's mixed_precision API) actually speeds up my [model type] training on [GPU type], and when it instead causes instability I should watch for.
6. Compare DistributedDataParallel (DDP) and FullyShardedDataParallel (FSDP) for training my [model size, e.g., 1.5B parameter] model across [N] GPUs with [VRAM per GPU] — at what model size does FSDP's sharding actually start to matter?
7. Explain the trade-offs between dropout, weight decay (L2), and data augmentation as regularizers for my [CNN/Transformer] that's overfitting on [dataset size] — which should I reach for first given my data is [scarce/abundant]?
8. Compare freezing all backbone layers, freezing only early layers, and full fine-tuning for transfer learning my [pretrained model, e.g., ResNet-50/ViT] onto [target task] with [N] labeled examples — what's the decision rule based on dataset size?
9. Explain the difference between focal loss, weighted cross-entropy, and label smoothing for my [classification task] with [class imbalance / noisy labels] — which addresses my specific symptom?
10. Compare training from scratch versus transfer learning versus knowledge distillation for my [task] given I have [compute budget] and [data size] — what's the realistic ceiling for from-scratch training at my scale?

## Implementation prompts (build & debug)

1. Write a PyTorch training loop for my [model architecture] with gradient clipping at [norm value], mixed-precision via `torch.cuda.amp.autocast` and `GradScaler`, and a cosine LR schedule with [N]-step warmup, logging loss and gradient norm every [N] steps.
2. Debug why my [Transformer/RNN] training loss plateaus at [value] after [N] steps and gradient norms are near zero — here's my model definition and training loop: [paste code]. Diagnose vanishing gradients versus a learning rate that's too low.
3. Refactor this single-GPU PyTorch training script into a DDP-based multi-GPU script for [N] GPUs, making sure the `DistributedSampler`, gradient synchronization, and checkpoint saving (rank-0 only) are all correct: [paste code].
4. Write a custom PyTorch `Dataset`/`DataLoader` for [data type, e.g., variable-length sequences] with padding/collation handled in a custom `collate_fn`, and add the augmentation pipeline [list augmentations] applied only at train time.
5. Debug why my loss spikes to NaN at step [N] during training of [model type] with learning rate [value] and batch size [value] — here's the loss curve description and optimizer config: [paste]. Walk through gradient clipping, LR warmup, and mixed-precision overflow as candidate causes.
6. Implement transfer learning for [pretrained model] onto [target task] by freezing the first [N] layers and fine-tuning the rest with a discriminative learning rate (lower LR for earlier layers, higher for the head) — show me the PyTorch parameter-group setup.
7. Write a custom loss function combining [focal loss] with [an auxiliary task loss] for my multi-task [model type], including the weighting strategy between the two loss terms and how to log them separately for debugging.
8. Debug why my model trains fine on a single GPU but DDP training across [N] GPUs gives worse final accuracy — check for batch size scaling without LR adjustment, `DistributedSampler` shuffling issues, and batchnorm statistics not being synced (`SyncBatchNorm`).
9. Implement gradient checkpointing for my [large Transformer/CNN] to fit a bigger batch size into [VRAM amount] of GPU memory, and quantify the expected training-time slowdown versus the memory savings.
10. Write an early-stopping and checkpointing callback for my training loop that monitors [validation metric], saves the top-[N] checkpoints by that metric, and restores the best one after training, handling the case where validation is noisy across epochs.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a distributed training strategy for a [model size] model that doesn't fit on a single GPU's memory even with batch size 1 — compare FSDP full sharding, tensor parallelism, and gradient checkpointing combinations given I have [N] GPUs with [VRAM] each.
2. My [CNN/Transformer] model converges in offline experiments but training throughput collapses when I scale from [N] to [4N] GPUs with DDP — diagnose whether this is a communication bottleneck (all-reduce overhead), data loading bottleneck, or batch-size/LR mismatch, and design a profiling plan to isolate it.
3. Stress-test my [model architecture]'s behavior on out-of-distribution inputs — for example [describe shift, e.g., images at a different resolution/lighting than training] — and design an architecture or training change (e.g., augmentation strategy, test-time normalization) to improve robustness.
4. Critique my mixed-precision training setup for numerical stability — here's where I cast to fp16/bf16 and where I keep fp32 master weights: [describe] — are there ops (softmax, layernorm, loss computation) I'm running in reduced precision that should stay fp32?
5. Design a knowledge distillation pipeline to compress my [large teacher model, e.g., 350M params] into a [target size, e.g., 30M params] student for deployment on [edge device/latency budget], specifying the temperature for soft-label distillation and how to weight distillation loss versus hard-label loss.
6. Evaluate catastrophic forgetting risk when fine-tuning my [pretrained model] sequentially on [task A] then [task B] — design an experiment (e.g., elastic weight consolidation, rehearsal buffer, or simply re-evaluating on task A after task B) to quantify how much performance on task A degrades.
7. Design a curriculum learning or progressive resizing strategy for training my [CNN/Transformer] on [dataset] where examples vary widely in [difficulty/resolution/sequence length] — what's the schedule for introducing harder examples and how do I validate it actually beats random shuffling?
8. My [Transformer] model's attention patterns look [describe anomaly, e.g., "uniformly diffuse" or "collapsed onto one token"] in visualization — diagnose whether this points to insufficient training, a learning rate issue, or an architectural problem (e.g., missing positional encoding, attention scaling).
9. Design a reproducibility protocol for my distributed training runs (seed control across DDP ranks, deterministic cuDNN algorithms, data loader worker seeding) so that [model type] training on [N] GPUs gives bit-identical or near-identical results across runs for debugging.
10. Compare the cost and accuracy trade-offs of training my [model] with full fp32, mixed bf16/fp32, and full bf16 on [GPU type], and tell me which precision strategy is safe for [optimizer states, e.g., Adam moments] without destabilizing convergence.

## Follow-up / chaining prompts

1. Now stress-test the DDP training setup you just designed for the failure mode where one of the [N] GPUs silently lags (slow node) — how would I detect it and what's the timeout/retry strategy?
2. Now explain the trade-off you just made choosing [gradient checkpointing] over [a smaller batch size] to fit memory, and quantify the training-time cost in steps/sec.
3. Take the knowledge distillation pipeline we just designed and show me how to validate the student model isn't just memorizing the teacher's mistakes — what evaluation set or metric would catch that?
4. Now diagnose what would happen to the vanishing-gradient fix you proposed (e.g., switching to residual connections) if I also increase model depth from [N] to [2N] layers — does the fix still hold?
5. Given the mixed-precision setup we just reviewed, show me how to add a NaN/Inf gradient detector that automatically skips the optimizer step and logs which layer produced the bad gradient.
6. Now take the curriculum learning schedule you proposed and design an ablation to prove it actually beats random shuffling, not just that the loss curve looks smoother.

## Anti-patterns: prompts that get weak answers

**Weak:** "What neural network should I use?"
**Sharper:** "Compare a 1D CNN vs a Transformer encoder for classifying sensor sequences of length 500 with 8 channels, given I have 50,000 labeled examples and need inference under 10ms on CPU."

**Weak:** "My model isn't training well."
**Sharper:** "My Transformer's training loss plateaus at 2.3 after 5,000 steps with gradient norms near 1e-6 — here's my model and optimizer config — diagnose vanishing gradients versus a learning rate that's too low at 1e-5."

**Weak:** "How do I use multiple GPUs?"
**Sharper:** "Refactor this single-GPU PyTorch training script into DDP across 4 A100s, making sure DistributedSampler shuffling, SyncBatchNorm, and rank-0-only checkpoint saving are correct."

**Weak:** "Explain regularization."
**Sharper:** "Compare dropout at 0.3, weight decay at 1e-4, and mixup augmentation for my ResNet-50 that's overfitting with train accuracy 98% vs validation accuracy 71% on 8,000 images."

**Weak:** "How do I do transfer learning?"
**Sharper:** "Design a discriminative fine-tuning setup for a pretrained ViT-B/16 on my 3,000-image target dataset — freeze the first 8 blocks, use a 10x lower LR on the remaining blocks versus the new classification head."

---
name: aiml-containerization-orchestration
description: Curated prompts for containerizing and orchestrating ML systems with Docker and Kubernetes — GPU scheduling, resource limits, scaling training/serving workloads. Use when packaging or deploying ML workloads on Docker/K8s.
---

# Containerization & Orchestration — Prompt Library (AI/ML Engineer)

ML workloads break the assumptions that most Docker/Kubernetes tooling was built around — multi-gigabyte CUDA base images, GPU devices that can't be overcommitted like CPU/memory, training jobs that run for hours and shouldn't be killed by a careless `kubectl rollout`, and dependency stacks (CUDA, cuDNN, driver versions) that are notoriously version-sensitive. Good practice in 2026 means multi-stage Dockerfiles that separate build-time CUDA/compiler toolchains from a lean runtime image, aggressive layer caching so a one-line code change doesn't trigger a 10GB rebuild, and Kubernetes manifests that correctly request GPU resources via device plugins (`nvidia.com/gpu`) rather than treating them as generic compute. It also means knowing when to reach for Kubeflow or KServe instead of hand-rolled YAML, configuring HPA/KEDA to autoscale on GPU-aware metrics instead of CPU, diagnosing the two failure modes that define ML-on-K8s life (OOMKilled pods from underestimated memory limits, and CrashLoopBackOff from CUDA/driver mismatches), and using spot/preemptible node pools with checkpointing to cut training cost without losing days of progress to a reclaimed node. The goal is infrastructure that's reproducible, debuggable at 2am, and doesn't silently waste GPU-hours.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain how CUDA base images (`nvidia/cuda:12.x-runtime` vs `-devel` vs `-cudnn`) differ, and tell me which one I actually need for my [training/inference] container that uses [PyTorch/TensorFlow version] without bloating the image with an unnecessary compiler toolchain.
2. Walk me through how the NVIDIA device plugin exposes GPUs to Kubernetes, and explain why `nvidia.com/gpu: 1` in a pod spec behaves differently from a CPU resource request — specifically, why GPUs can't be fractionally requested without MIG or time-slicing.
3. Compare Kubeflow Pipelines and KServe for my use case of [orchestrating multi-step training pipelines / serving models with autoscaling], and tell me which one solves my actual problem versus adding orchestration overhead I don't need.
4. Explain the difference between resource `requests` and `limits` in Kubernetes specifically for memory on ML training pods, and why setting a memory limit too close to actual usage risks OOMKilled during a transient spike (e.g., a large batch or data loader prefetch).
5. Walk through how HPA and KEDA differ for autoscaling an inference deployment, and explain why KEDA's external metrics support (e.g., scaling on a queue length or GPU utilization metric) matters for GPU workloads where CPU-based HPA scaling is the wrong signal.
6. Explain multi-stage Docker builds for an ML training image — what should live in the build stage (compiling custom CUDA kernels, downloading model weights) versus the final runtime stage — and how that reduces both image size and attack surface.
7. Compare distributed training orchestration approaches on Kubernetes (Kubeflow Training Operator's PyTorchJob/TFJob vs. a raw StatefulSet with manual rank assignment) for my [multi-node, multi-GPU] training job.
8. Walk through how spot/preemptible node pools work for GPU training workloads — what's the actual interruption notice period on [AWS/GCP/Azure], and what does my training job need to implement (checkpointing cadence, signal handling) to survive it gracefully?
9. Explain secrets and config management options (Kubernetes Secrets, External Secrets Operator, Vault) for an ML pipeline that needs [API keys for a model registry, cloud storage credentials, a database connection string], and tell me which fits a team without dedicated security/platform engineers.
10. Explain how layer caching works in Docker builds and why putting `pip install -r requirements.txt` before `COPY . .` in my Dockerfile matters for build speed when only application code changes between builds.

## Implementation prompts (build & debug)

1. Write a multi-stage Dockerfile for my [PyTorch/TensorFlow] training job that uses a `-devel` CUDA image to build any custom extensions, then copies only the compiled artifacts and runtime dependencies into a slim `-runtime` final image.
2. Write a Kubernetes deployment manifest for serving my model that requests `nvidia.com/gpu: 1`, sets appropriate CPU/memory requests and limits based on [my model's measured footprint], and includes a readiness probe that doesn't mark the pod ready until model weights are fully loaded.
3. Debug a pod stuck in `CrashLoopBackOff` where the container logs show a CUDA driver/library version mismatch — walk through checking host driver version, container CUDA toolkit version, and whether the base image's compatibility matrix actually supports my GPU type.
4. Debug an `OOMKilled` pod during training where memory usage looks fine in steady state but spikes during [data loading/checkpoint saving] — walk through profiling actual peak memory usage and setting a limit with appropriate headroom instead of guessing.
5. Write a Kubeflow PyTorchJob manifest for distributed data-parallel training across [N nodes, M GPUs each], including the environment variables for rank/world-size that the Training Operator sets automatically versus what I need to configure manually.
6. Implement a KEDA ScaledObject that autoscales my inference deployment based on [a Prometheus query for GPU utilization / queue depth from a message broker], including the cooldown period to prevent flapping when GPU load is bursty.
7. Write a checkpointing strategy for my training job running on spot/preemptible nodes that saves model state every [N steps/minutes] to [cloud object storage], and implement the resume logic that detects an interrupted run and continues from the latest checkpoint instead of restarting from scratch.
8. Debug a multi-node distributed training job where one worker pod fails to join the process group — walk through checking network policies between pods, whether the headless service for inter-pod discovery is configured correctly, and whether NCCL environment variables are set for the right network interface.
9. Set up an External Secrets Operator configuration that syncs [a model registry API key and cloud storage credentials] from [AWS Secrets Manager/Vault] into Kubernetes Secrets, and reference them correctly in my training/serving pod specs without hardcoding values in YAML.
10. Write a `.dockerignore` and reorganize my Dockerfile's `COPY` ordering so that changing application code doesn't invalidate the cached layer that installs [a large dependency like PyTorch/CUDA-dependent packages], cutting rebuild time significantly.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a node pool strategy that mixes on-demand and spot/preemptible GPU instances for my training cluster, with pod priority classes and preemption policies that ensure critical jobs land on stable on-demand nodes while batch/experimental jobs use cheaper spot capacity.
2. Critique my current resource requests/limits [paste: requests/limits YAML and actual observed usage] for a fleet of training pods and identify where I'm over-provisioning (wasting cluster capacity) versus under-provisioning (risking OOMKilled).
3. Stress-test my distributed training setup against a single-node failure mid-job on a [50-node] cluster — does my current checkpointing interval mean I lose [X hours] of compute, and how would I redesign checkpoint frequency to balance storage/IO overhead against recovery cost?
4. Design a GPU-sharing strategy (MIG partitioning vs. time-slicing vs. dedicating whole GPUs) for a cluster hosting [N small inference workloads that each use <20% of a GPU's compute], and quantify the utilization improvement versus the isolation/noisy-neighbor risk.
5. Propose a CrashLoopBackOff root-cause runbook for my team that systematically checks (in order) image pull failures, CUDA/driver mismatches, missing GPU device plugin registration, OOM, and application-level config errors — so on-call doesn't have to rediscover this from scratch every incident.
6. Compare the cost and operational complexity of running KServe for model serving versus hand-rolled Kubernetes Deployments with a custom autoscaler, for a platform that needs to support [N models] with different frameworks and per-model autoscaling policies.
7. Design a multi-tenant Kubernetes namespace strategy for ML workloads where [different teams] share a GPU cluster, using ResourceQuotas, LimitRanges, and PriorityClasses to prevent one team's burst training job from starving another team's production serving pods.
8. Stress-test my Dockerfile's build cache strategy against a CI pipeline that builds [N times per day] — is my current layer ordering actually saving build minutes, or is a base image update invalidating the cache more often than I think?
9. Design a disaster-recovery plan for a stateful distributed training job (e.g., a multi-day pretraining run) that needs to survive both spot-instance reclamation and a full availability-zone outage, including where checkpoints are replicated and how fast the job can resume.
10. Propose a cost-optimization analysis comparing my current GPU cluster utilization [paste: utilization metrics over time] against right-sizing the node pool or introducing MIG/time-slicing, and quantify expected monthly savings versus the engineering effort to implement it.

## Follow-up / chaining prompts

1. Now stress-test the multi-stage Dockerfile you just wrote against a scenario where I need to add a new system-level dependency (e.g., a CUDA library for a custom op) — does it require rebuilding the build stage, and how much does that add to CI build time?
2. Given the KEDA ScaledObject we just configured, walk through what happens during a metric source outage (Prometheus unreachable) — does the deployment fail safe at current replica count, or does it scale to zero and drop traffic?
3. Now take the checkpointing and resume logic we just designed and explain what happens if a spot interruption happens mid-checkpoint-write — could I end up resuming from a corrupted checkpoint, and how do I guard against that?
4. Given the GPU-sharing strategy (MIG/time-slicing) you proposed, quantify what happens to my per-tenant latency SLA if one tenant's workload spikes — does the isolation actually hold, or does it just rebalance the contention?
5. Now revisit the multi-tenant namespace strategy and add a concrete answer for what happens when a production serving deployment and a burst training job both spike GPU demand at the same time — which PriorityClass wins, and is that the behavior I actually want?
6. Now take the cost-optimization analysis you just produced and translate the projected monthly savings into the payback period for the engineering hours needed to implement MIG partitioning — is it worth doing this quarter?

## Anti-patterns: prompts that get weak answers

**Weak:** "Write me a Dockerfile for my ML model."
**Sharper:** "Write a multi-stage Dockerfile for my PyTorch 2.x training job that compiles a custom CUDA extension in a `nvidia/cuda:12.4-devel` build stage, then copies only the built `.so` files and pip-installed runtime deps into a slim `nvidia/cuda:12.4-runtime` final image, keeping total image size under 4GB."

**Weak:** "My pod keeps crashing, what's wrong?"
**Sharper:** "My inference pod is stuck in CrashLoopBackOff with container logs showing `CUDA error: no kernel image is available for execution on the device` — walk through checking whether my base image's CUDA compute capability target matches my node's actual GPU architecture (e.g., built for sm_80 but running on an sm_90 H100)."

**Weak:** "How do I scale my ML deployment on Kubernetes?"
**Sharper:** "My GPU inference deployment uses HPA scaling on CPU utilization, but CPU sits at 15% while GPUs are saturated at 95% under load — design a KEDA-based autoscaler that scales on a custom Prometheus metric for GPU utilization instead, with a scale-up cooldown of 60 seconds to avoid flapping."

**Weak:** "Help me save money on GPU costs."
**Sharper:** "My multi-day distributed pretraining job runs on 8x A100 on-demand nodes costing [$X/hour] — design a spot-instance strategy with checkpointing every 500 steps to S3, and a resume-on-restart mechanism, so I can move to spot capacity without risking more than 500 steps of lost compute per interruption."

**Weak:** "Set up resource limits for my training pods."
**Sharper:** "My training pods request 16GB memory but get OOMKilled intermittently during the data-loading prefetch phase, which I measured spiking to 22GB — walk through setting a memory limit with appropriate headroom above the measured peak, and whether I should also tune `num_workers`/prefetch factor to reduce that spike instead of just raising the limit."

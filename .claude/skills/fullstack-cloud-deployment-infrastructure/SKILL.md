---
name: fullstack-cloud-deployment-infrastructure
description: Curated prompts for cloud deployment and infrastructure — AWS/Azure/GCP service selection, Docker/Kubernetes, infrastructure as code. Use when deploying or provisioning infrastructure for an application.
---

# Cloud Deployment & Infrastructure — Prompt Library (Full Stack Developer)

In 2026, full-stack developers are expected to own deployment and infrastructure decisions far more than a decade ago: knowing when a managed service (RDS, Cloud SQL, managed Kubernetes) beats self-hosting, writing multi-stage Dockerfiles that produce small, secure production images, and reading enough Terraform or Pulumi to provision what they need without waiting on a dedicated platform team. Good practice means infrastructure as code as the source of truth (no manual console clicking that drifts from what's documented), genuine dev/staging/prod parity so "works in staging" reliably predicts production behavior, and autoscaling configured against the right signal (CPU/memory target tracking or request-based HPA) rather than guessed instance counts. For small-to-mid apps, the honest comparison is no longer just AWS vs Azure vs GCP — platforms like Vercel, Render, Railway, and Fly.io now legitimately win on speed-to-ship and operational simplicity, and recommending raw Kubernetes for a 3-person team's MVP is usually over-engineering. Zero-downtime deploys (blue-green or rolling) and CDN/static-asset strategy (CloudFront, Cloudflare) are table stakes for anything user-facing, and cost is no longer an afterthought — right-sizing instances, using spot/preemptible capacity where appropriate, and setting up billing alerts are part of a responsible deployment, not a separate FinOps concern.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Compare managed RDS/Cloud SQL versus self-hosting Postgres on a VM or Kubernetes for [my app's traffic and budget], factoring in backup/failover responsibility and ongoing ops burden.
2. Walk me through whether my app actually needs Kubernetes or whether [Vercel/Render/Fly.io/AWS Elastic Beanstalk] would get me to production faster given [team size and traffic expectations].
3. Compare AWS, Azure, and GCP for [my workload type, e.g. a Next.js app with a Postgres database and background job processing] — where do they meaningfully differ for my use case versus just branding?
4. Explain the difference between a multi-stage Docker build and a single-stage build, and show why it matters for [my app's image size and attack surface].
5. Explain Kubernetes Deployments, Services, and Ingress as a set, using my actual app as the example: [briefly describe app] — what does each object actually do for me?
6. Compare Terraform and Pulumi for infrastructure as code given that my team is more comfortable with [a specific programming language] than HCL.
7. Explain how target-tracking autoscaling (HPA in Kubernetes, or AWS target tracking) decides when to scale, and what metric I should track for [my workload: CPU-bound vs I/O-bound vs request-latency-sensitive].
8. Walk me through blue-green versus rolling deployments — which one actually gives me zero downtime for [my app with stateful WebSocket connections / stateless REST API]?
9. Explain how a CDN like CloudFront or Cloudflare actually reduces load on my origin server, and what I should and shouldn't put behind it for [my app's static assets and API].
10. Explain dev/staging/prod environment parity and the concrete risks if my staging environment uses [a smaller instance size / a different database version] than production.

## Implementation prompts (build & debug)

1. Write a multi-stage Dockerfile for my [Node.js/Python/Go] app that produces a minimal production image, separating build dependencies from runtime dependencies.
2. Write Kubernetes Deployment, Service, and Ingress manifests for [my app] with [N replicas], a liveness/readiness probe, and resource requests/limits set appropriately for [expected memory/CPU usage].
3. Write Terraform (or Pulumi) configuration to provision [an RDS Postgres instance / a GKE cluster / an S3 bucket with CloudFront in front of it] for [my environment].
4. Debug why my Kubernetes pods are getting OOMKilled — here are my resource limits and actual memory usage pattern: [paste manifest and metrics] — is this a limit set too low or an actual memory leak?
5. Configure a Horizontal Pod Autoscaler that scales [my deployment] between [min] and [max] replicas based on [CPU utilization target / custom request-per-second metric].
6. Write the multi-environment Terraform module structure so dev/staging/prod share the same module definitions but differ only in variable values like instance size and replica count.
7. Debug why my zero-downtime rolling deploy is dropping requests during rollout — here's my Deployment's `strategy` and readiness probe config: [paste manifest].
8. Set up CloudFront (or Cloudflare) in front of [my S3 bucket / origin server] for static asset caching, including cache invalidation on deploy.
9. Write the Docker Compose setup that mirrors my production Kubernetes topology closely enough for local development, including [database, cache, and message queue] dependencies.
10. Debug why my Terraform apply is showing unexpected drift on [a specific resource] every time I run it — here's the resource block and what changed manually: [paste config].

## Advanced prompts (architecture, optimization, edge cases)

1. Design a blue-green deployment pipeline for [my Kubernetes/ECS workload] including how traffic cutover happens and how fast I can roll back if [a post-deploy health check fails].
2. Critique my current cloud spend — here's my current setup [instance types, counts, and usage pattern] — where am I over-provisioned, and would [spot/preemptible instances or reserved instances] meaningfully cut cost without risking availability?
3. Design a multi-region active-passive (or active-active) deployment for [my app] on [AWS/GCP/Azure], and walk through the failover mechanics if [the primary region goes down].
4. Design an autoscaling policy that handles a [predictable daily traffic spike at 9am] better than reactive CPU-based scaling alone — would scheduled scaling or predictive scaling fit better?
5. Audit this Terraform codebase for security misconfigurations — overly permissive IAM roles, public S3 buckets, unencrypted RDS instances: [paste relevant config].
6. Design a disaster-recovery plan for [my production database] with a target RPO of [X minutes] and RTO of [Y minutes] — what backup/replication strategy actually meets that?
7. Design the Kubernetes network policy and namespace isolation strategy so [service A in namespace X] can't reach [service B in namespace Y] unless explicitly allowed.
8. Compare the cost and operational trade-offs of running [my workload] on Kubernetes (EKS/GKE/AKS) versus serverless containers (Fargate/Cloud Run/Azure Container Apps) given [my traffic pattern: bursty vs steady].
9. Design a secrets-injection strategy for Kubernetes pods using [External Secrets Operator/Sealed Secrets/cloud KMS] instead of plain Kubernetes Secrets, given [my compliance requirement].
10. Design a CDN cache-invalidation strategy for a deploy that changes [versioned static assets and an unversioned index.html] so users never get a mismatched bundle during the rollout window.

## Follow-up / chaining prompts

1. Given the multi-stage Dockerfile above, now add a non-root user and a `.dockerignore` so the image is hardened for production.
2. Now that the Kubernetes manifests are working, add a PodDisruptionBudget so a node drain or cluster upgrade doesn't take down all replicas at once.
3. Take the Terraform module structure above and now add a remote state backend with locking (S3 + DynamoDB, or Terraform Cloud) so the team can apply safely without conflicts.
4. Given the autoscaling policy you designed, now add alerting that fires if the deployment hits max replicas, since that signals capacity planning is falling behind real growth.
5. Now that blue-green deploy is set up, define the exact automated smoke-test suite that must pass against the green environment before cutover.
6. Given the disaster-recovery plan above, now write the runbook steps an on-call engineer would actually follow during a real regional outage.

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I deploy my app to the cloud?"
**Sharper:** "Compare deploying my Next.js + Postgres app on Vercel + RDS versus a single EC2 instance versus EKS, given a 3-person team and under 10,000 daily active users — recommend one with justification."

**Weak:** "Write a Dockerfile for my app."
**Sharper:** "Write a multi-stage Dockerfile for a Python FastAPI app that keeps the final image under 200MB by separating the build stage's compilers/dev dependencies from the runtime stage."

**Weak:** "Set up Kubernetes."
**Sharper:** "Write Deployment, Service, and Ingress manifests for a stateless Express API with 3 replicas, a /health readiness probe, and resource limits sized for a 512MB-per-pod workload."

**Weak:** "Make my infrastructure cheaper."
**Sharper:** "Audit my current AWS setup of 6 always-on m5.xlarge instances running a workload with predictable evening traffic spikes — recommend whether autoscaling, spot instances, or right-sizing would cut cost most without hurting availability."

**Weak:** "How do I avoid downtime when deploying?"
**Sharper:** "Design a rolling deployment strategy for a Kubernetes Deployment serving long-lived WebSocket connections, so in-flight connections drain gracefully instead of being dropped mid-deploy."

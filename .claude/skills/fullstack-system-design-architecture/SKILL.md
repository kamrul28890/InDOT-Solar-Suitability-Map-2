---
name: fullstack-system-design-architecture
description: Curated prompts for system design and architecture — microservices vs monolith, scalability, communication patterns, trade-off analysis. Use when designing a new system's architecture or evaluating an existing one.
---

# System Design & Architecture — Prompt Library (Full Stack Developer)

System design in 2026 full-stack work is less about picking a trendy pattern and more about matching architecture to actual load, team size, and failure tolerance — the dominant mistake is still premature microservices, followed closely by monoliths that never get decomposed even after the team and traffic outgrow them. Good architecture work means being explicit about trade-offs: sync REST/gRPC calls are simple but couple availability, message queues like SQS/RabbitMQ decouple producers from consumers but add operational complexity, and event streams like Kafka enable replay and multiple consumers at the cost of much harder debugging and ordering guarantees. The CAP theorem isn't academic trivia here — it shows up directly in decisions like "does this service stay available during a partition or does it reject writes," and capacity estimation (requests/sec, data volume, p99 latency budgets) should happen before infrastructure choices, not after something falls over in production. Designing for failure — circuit breakers, retries with exponential backoff and jitter, bulkheads to contain blast radius — is now a baseline expectation, and architecture decision records (ADRs) are the standard way teams keep "why we chose X over Y" from being lost institutional memory. The strangler fig pattern remains the proven way to evolve a monolith without a risky big-bang rewrite, and that incremental mindset should inform almost every architecture prompt below.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Walk me through a decision framework for monolith vs microservices given my context: [team size], [expected traffic], [domain complexity] — and tell me what signals would indicate I'm choosing wrong.
2. Explain domain-driven design bounded contexts using my actual domain as the example: [describe domain, e.g. an e-commerce platform with catalog, ordering, and fulfillment] — where are the natural service boundaries?
3. Compare REST, gRPC, message queues (SQS/RabbitMQ), and event streaming (Kafka) for communication between [service A] and [service B] in my system, given that [latency requirement / ordering requirement].
4. Explain the CAP theorem in terms of a concrete trade-off I'm facing: should [my service] favor availability or consistency when [specific partition scenario, e.g. the primary database region goes down]?
5. Walk me through how to do back-of-envelope capacity estimation for a system expecting [X requests/sec, Y average payload size, Z% peak-to-average ratio] — what should I size for compute, storage, and bandwidth?
6. Explain the strangler fig pattern and how I'd apply it to incrementally extract [specific module, e.g. billing] out of my monolith without a risky rewrite.
7. Compare placing a caching layer at the CDN, Redis, and application-in-memory level for [my read-heavy endpoint], and tell me what gets invalidated and when at each layer.
8. Explain circuit breakers, retries with backoff, and bulkheads as failure-isolation patterns, and show me where each one would help in my architecture: [briefly describe service dependencies].
9. What's an architecture decision record (ADR) and write me a template I can reuse for documenting the choice between [option A] and [option B] on my team.
10. Compare a synchronous request/response API gateway pattern versus an async event-driven backbone for [my system], specifically around how each handles a downstream service outage.

## Implementation prompts (build & debug)

1. Design the service boundaries and API contracts for splitting [specific monolith module] out of my [language/framework] monolith into its own service, including what data it owns versus what it queries from other services.
2. Write the configuration for a circuit breaker (using [resilience4j/Polly/opossum]) around calls from [service A] to [service B], including failure-rate threshold, half-open retry interval, and fallback behavior.
3. Design a message schema and producer/consumer contract for [an order-placed event] flowing through [Kafka/SQS], including versioning strategy for when the schema changes.
4. Debug why [service A]'s p99 latency spikes whenever [service B] is under load — here's my call pattern: [describe sync/async setup] — is this a missing timeout, missing circuit breaker, or a queue backpressure issue?
5. Design a caching strategy with Redis for [my specific endpoint], including TTL choice, cache-aside vs write-through pattern, and how you'd handle a thundering-herd cache-miss scenario.
6. Write an ADR for the decision to use [Kafka vs RabbitMQ vs SQS] for [my use case], including the alternatives considered and the consequences section.
7. Design the API gateway routing and rate-limiting rules for exposing [N internal microservices] behind a single public API in [Kong/AWS API Gateway/Nginx].
8. Debug this distributed transaction problem: [describe scenario, e.g. order service charges payment but inventory service fails to decrement stock] — recommend a saga pattern or compensating-transaction design.
9. Design the retry-with-backoff logic for a client calling a flaky downstream dependency, including jitter, max retry count, and idempotency-key handling so retries don't double-charge or double-process.
10. Write the data-migration plan for moving [a specific table/domain] out of the shared monolith database into its own service-owned database without downtime.

## Advanced prompts (architecture, optimization, edge cases)

1. Critique this microservices architecture for distributed-monolith smells — services that always deploy together, share a database, or have synchronous call chains more than [N] hops deep: [describe architecture].
2. Design a multi-region active-active architecture for [my system] and walk through exactly what breaks during a network partition, given the CAP trade-off you'd choose.
3. Identify the bottleneck in this system under [10x current load] — walk through each hop (load balancer, app server, cache, database, message broker) and tell me which one saturates first: [describe current architecture and current load numbers].
4. Design a bulkhead isolation strategy so that a traffic spike on [low-priority feature] can't exhaust the thread pool / connection pool needed by [critical-path feature] in the same service.
5. Compare choreography vs orchestration for a saga implementing [multi-step business process across services], and recommend one given my team's debugging and observability maturity.
6. Design an event-sourcing approach for [a domain with strong audit requirements, e.g. financial ledger] versus a traditional CRUD model — what do I gain and what operational complexity do I take on?
7. Audit this system design for single points of failure and cascading-failure risk, specifically around [the shared database / the synchronous auth check on every request]: [describe architecture].
8. Design a blue-green or canary rollout strategy for a breaking change to [a shared event schema] that has [N] independent consumers I don't control deployment timing for.
9. Walk through how you'd decompose [a 200k-line monolith] into services using the strangler fig pattern over [6 months], sequencing which modules to extract first and why.
10. Design the back-pressure handling for a Kafka consumer that can't keep up with producer throughput during [a traffic spike scenario] — compare pausing the consumer, scaling consumer instances, and dead-lettering.

## Follow-up / chaining prompts

1. Given the service boundaries you proposed, now design the specific API contracts (request/response shapes) between [service A] and [service B].
2. Now that we've chosen [Kafka] for the event backbone, design the dead-letter-queue and replay strategy for messages that fail processing.
3. Take the capacity estimate from above and now translate it into actual infrastructure sizing — instance types, count, and estimated monthly cost on [AWS/GCP/Azure].
4. Given the ADR you drafted, write the rollback plan if [the chosen message queue] turns out not to meet our latency SLA after 3 months in production.
5. Now pressure-test the strangler-fig sequencing plan: what's the riskiest module to extract first, and why might extracting it last actually be safer?
6. Given the circuit-breaker design above, add metrics/alerting so we get paged before the breaker trips, not just after.

## Anti-patterns: prompts that get weak answers

**Weak:** "Should I use microservices?"
**Sharper:** "Given a 6-person team, 200 requests/sec average traffic, and a domain with clearly separable billing and catalog contexts, should I split into microservices now or stay monolithic until [specific trigger]? Justify with the operational cost of running 2 vs 6 services."

**Weak:** "How do I make my system scalable?"
**Sharper:** "Walk through capacity estimation for my API expecting 5,000 req/sec at peak with 50KB average payloads — where does a single Postgres primary saturate first, and what's the next bottleneck after I add read replicas?"

**Weak:** "What's the best message queue?"
**Sharper:** "Compare Kafka, RabbitMQ, and SQS for an order-events pipeline that needs at-least-once delivery, multiple independent consumers, and replay capability for the last 7 days — recommend one for a team with no prior streaming experience."

**Weak:** "Design my architecture."
**Sharper:** "Design the bounded contexts for an e-commerce platform with catalog, ordering, payments, and fulfillment, and tell me which contexts should own their own database versus share one initially."

**Weak:** "How do I handle failures?"
**Sharper:** "Design circuit-breaker and retry-with-backoff logic for calls from my checkout service to a third-party payment API that has a 2% baseline error rate, including idempotency-key handling to prevent double charges."

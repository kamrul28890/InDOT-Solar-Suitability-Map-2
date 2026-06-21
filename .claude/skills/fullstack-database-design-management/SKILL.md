---
name: fullstack-database-design-management
description: Curated prompts for database design and management across SQL and NoSQL — schema design, normalization, indexing, choosing a database. Use when designing schemas or choosing a database technology.
---

# Database Design & Management — Prompt Library (Full Stack Developer)

Database decisions are the most expensive to reverse of anything in a full-stack system — a bad index strategy degrades silently until traffic triples, and a denormalization choice made for speed in month one becomes a data-integrity nightmare by month twelve. In 2026, "good" database work means picking SQL (Postgres), NoSQL (MongoDB, DynamoDB), or a hybrid based on actual access patterns rather than trend-following, designing indexes around the queries that actually run (composite and covering indexes, not one index per column), and running schema migrations with zero downtime as a default expectation, not a special project. It also means understanding when ACID transactions are non-negotiable (payments, inventory) versus where eventual consistency is an acceptable and even preferable trade-off (activity feeds, analytics), reading `EXPLAIN ANALYZE` output fluently rather than guessing at slow queries, and designing multi-tenant schemas (shared table with tenant_id, schema-per-tenant, or DB-per-tenant) deliberately based on isolation and scale needs. This skill is for schema design sessions, choosing between database technologies, debugging slow queries, and planning migrations that can't afford downtime.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Explain the trade-offs between normalizing [a `users` table with addresses, payment methods, and preferences] to 3NF versus denormalizing for read performance, given that [reads outnumber writes 50:1].
2. Compare Postgres, MongoDB, and DynamoDB for [an application with relational order data but also flexible, schema-varying product attributes], and recommend a hybrid approach if one fits better.
3. Walk me through B-tree indexes versus composite indexes versus covering indexes for [a query that filters by `status` and sorts by `created_at`] — show me exactly which index shape helps.
4. Explain ACID transactions versus eventual consistency for [an inventory deduction during checkout versus a "likes" counter on a social post] — where does each model actually matter?
5. Compare modeling a many-to-many relationship [users and roles, or products and categories] via a join table in Postgres versus embedded arrays in MongoDB, and tell me which fits better for my access pattern.
6. Explain what connection pooling actually solves, and walk me through when I need PgBouncer in front of Postgres versus when my ORM's built-in pool is enough, for [a Node.js API with 50 server instances].
7. Walk me through reading an `EXPLAIN ANALYZE` output for [this slow query: paste query] — what do "Seq Scan," "rows removed by filter," and the cost numbers actually tell me?
8. Compare shared-table multi-tenancy (with a `tenant_id` column) versus schema-per-tenant versus database-per-tenant for [a B2B SaaS app with 500 tenants, ranging from 10 to 100,000 rows each].
9. Explain soft deletes (`deleted_at` column) versus hard deletes plus an audit log table for [a financial records system that needs to recover from accidental deletes and prove an audit trail].
10. Compare zero-downtime schema migration strategies (e.g., add-column-then-backfill-then-constrain) versus a maintenance-window migration for [adding a `NOT NULL` column to a 50-million-row table in production].

## Implementation prompts (build & debug)

1. Design a normalized Postgres schema for [an e-commerce system: users, orders, line items, products, inventory] with proper foreign keys, and flag any spots where I should intentionally denormalize for performance.
2. Write the composite index for [a query filtering on `tenant_id`, `status`, and ordering by `created_at` DESC] and explain why column order in the index matters here.
3. Debug this slow query using its `EXPLAIN ANALYZE` output — [paste query and EXPLAIN ANALYZE output] — and tell me exactly which index or rewrite fixes it.
4. Write a zero-downtime migration plan (with actual SQL/migration-tool steps) for adding a `NOT NULL` column with a default to [a 50-million-row `orders` table] in Postgres without locking writes.
5. Design the join table and queries for a many-to-many relationship between [`products` and `categories`] including how to efficiently fetch "all products in category X with pagination."
6. Implement a soft-delete pattern for [a `users` table] including how to handle unique constraints (e.g., email) that should still allow a new signup after the old account was "deleted."
7. Write a PgBouncer configuration (transaction pooling mode) for [a Node.js API with 50 instances each opening up to 10 connections] hitting a Postgres instance with a 100-connection limit, and explain the pool_mode trade-offs.
8. Design and implement a multi-tenant schema using the shared-table-with-`tenant_id`-and-row-level-security approach for [a SaaS app], including the actual Postgres RLS policy SQL.
9. Write a database transaction wrapper for [a fund-transfer operation that debits one account and credits another] that guarantees atomicity and handles deadlock retries.
10. Migrate this [MongoDB collection with deeply nested arrays of line items] into a normalized Postgres schema, and write the data migration script handling edge cases like missing or malformed nested fields.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a sharding strategy for [a multi-tenant Postgres database approaching 5TB] where a few large tenants dominate size — compare tenant-based sharding versus range-based sharding on a different key.
2. Critique this schema for [a social media app's `posts` and `likes` tables at 10M+ rows] and propose an optimization for the "like count per post" read pattern that's currently doing a `COUNT(*)` join on every page load.
3. Design a CQRS-style read/write split for [an order system with heavy reporting queries competing with transactional writes] — what goes in the read replica, what stays on the primary?
4. Walk me through diagnosing connection pool exhaustion in production where [PgBouncer shows "pool is at max capacity" errors during traffic spikes] — what's the systematic debugging sequence?
5. Design an audit-trail system for [a healthcare records app requiring full change history per field] — compare a separate `audit_log` table, Postgres temporal tables, and event sourcing for this compliance requirement.
6. Propose an indexing strategy review for [a table with 15 existing indexes that's slowing down writes] — show me how to identify which indexes are unused or redundant using `pg_stat_user_indexes`.
7. Design a zero-downtime strategy for splitting [one large multi-tenant table] into schema-per-tenant as the platform moves from startup-scale to enterprise customers requiring stronger isolation.
8. Compare strong consistency requirements for [a double-booking-prevention system in a room-reservation app] against using optimistic locking (version column) versus pessimistic locking (`SELECT FOR UPDATE`) versus a unique constraint.
9. Critique this DynamoDB single-table design for [an e-commerce app with orders, order items, and customer profiles] — are the partition key and sort key choices going to create hot partitions at scale?
10. Design a data archival strategy for [a 7-year-old table with 200M rows where 90% of queries only touch the last 90 days] — compare partitioning by date range versus moving cold data to a separate archive table/store.

## Follow-up / chaining prompts

1. Now write the actual Postgres migration file (using [Prisma/Knex/raw SQL]) implementing the zero-downtime column addition you just described.
2. Given the composite index you recommended, show me the updated `EXPLAIN ANALYZE` output I should expect, and how to verify the index is actually being used.
3. Take the RLS policy you wrote for multi-tenancy and show me how it interacts with my connection pooling setup — does PgBouncer's transaction mode break session-level tenant context variables?
4. Based on the audit-trail design you proposed, write the trigger or application-level hook that actually populates the `audit_log` table on every `UPDATE`.
5. You recommended tenant-based sharding — now walk me through how cross-tenant analytics queries (e.g., "total revenue across all tenants") would work once data is sharded.
6. Given the DynamoDB single-table design critique, redesign the partition key and sort key scheme to avoid the hot-partition issue you identified.

## Anti-patterns: prompts that get weak answers

**Weak:** "Should I normalize my database?"
**Sharper:** "Compare normalizing my users table (with addresses, payment methods, preferences) to 3NF versus denormalizing for read performance, given reads outnumber writes 50:1."

**Weak:** "My query is slow, help."
**Sharper:** "Here's my slow query and its EXPLAIN ANALYZE output — tell me exactly which index or rewrite fixes it: [paste query and output]."

**Weak:** "SQL or NoSQL?"
**Sharper:** "Compare Postgres, MongoDB, and DynamoDB for an app with relational order data but flexible, schema-varying product attributes, and recommend a hybrid if it fits better."

**Weak:** "How do I migrate my schema safely?"
**Sharper:** "Write a zero-downtime migration plan with actual SQL steps for adding a NOT NULL column with a default to a 50-million-row orders table in Postgres."

**Weak:** "How should I handle multi-tenancy?"
**Sharper:** "Compare shared-table-with-tenant_id versus schema-per-tenant versus database-per-tenant for a B2B SaaS app with 500 tenants ranging from 10 to 100,000 rows each."

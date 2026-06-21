---
name: aiml-agent-architecture-orchestration
description: Curated prompts for designing AI agent systems — tool use, multi-agent orchestration, memory, MCP, frameworks like LangGraph/CrewAI/AutoGen. Use when building autonomous or semi-autonomous agent workflows.
---

# Agent Architecture & Orchestration — Prompt Library (AI/ML Engineer)

Agentic systems — LLMs that plan, call tools, maintain state across steps, and sometimes coordinate with other agents — moved from research demos to production workloads by 2026, and the engineering challenge shifted from "can it use a tool" to "can it use tools reliably, recover from failure, and stop when it should." Good agent design means choosing single-agent vs multi-agent architecture deliberately based on task decomposability, not because multi-agent is trendy; designing tool/function schemas tightly enough that the model can't misuse them; building explicit loop-detection and retry budgets instead of trusting the model to self-terminate; and treating memory (short-term context vs long-term retrieval) as a designed system rather than an afterthought. The Model Context Protocol (MCP) has become the standard way to expose tools and data sources to agents, and frameworks like LangGraph, CrewAI, and AutoGen each make different trade-offs between control and convenience that matter once you're past the prototype. This skill collects prompts for designing, building, and hardening agent systems that need to run unattended in production rather than just impress in a demo.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. Help me decide between a single agent with a large tool set versus a multi-agent system with specialized sub-agents for my task of [task description, e.g., researching a topic, drafting a report, and fact-checking it] — what decomposition signals indicate multi-agent is actually worth the added coordination overhead?
2. Compare LangGraph, CrewAI, AutoGen, and building a custom agent loop from scratch for my use case of [task description], and recommend one based on how much control I need over state transitions versus how much I want the framework to handle.
3. Explain the ReAct (Reason+Act) pattern versus a LangGraph explicit state-machine approach for agent planning loops, and tell me which fits better when my task has [a small number of well-defined steps / an open-ended unknown number of steps].
4. Walk me through how the Model Context Protocol (MCP) standardizes tool and data exposure to agents, and explain what I gain by building an MCP server for [internal API/database] instead of just writing a custom function-calling tool definition.
5. Explain the difference between short-term memory (conversation context window) and long-term memory (vector-store-backed retrieval of past interactions) in agent design, and tell me which my use case of [customer support agent that needs to remember prior tickets] actually needs.
6. Compare agent-to-agent (A2A) protocol-based coordination versus a simple orchestrator-calls-sub-agents pattern for my multi-agent system of [N] specialized agents handling [task], and tell me when the added protocol overhead pays off.
7. Explain the trade-offs of sandboxed code execution for agents (e.g., a Python REPL tool running in a container) versus restricting the agent to a fixed set of pre-defined tools, for a task that requires [data analysis / dynamic computation].
8. Walk through how summarization-based memory compaction works for long-running agent conversations, and explain when I should summarize old context versus just letting it fall out of the context window.
9. Explain human-in-the-loop checkpoint design for agents — where should I insert an approval gate in a workflow that [takes an irreversible action, e.g., sends an email, modifies a database, spends money], and what's the UX trade-off of too many checkpoints versus too few?
10. Compare tool/function-calling schema design approaches — strict JSON schema with enums and required fields versus more flexible natural-language tool descriptions — for an agent that needs to call [N] tools including [example tools] without misusing them.

## Implementation prompts (build & debug)

1. Write a LangGraph state machine for an agent that [task, e.g., researches a topic, drafts a summary, and revises based on a critique step], including explicit state transitions and a maximum iteration count to prevent infinite loops.
2. Design and implement a multi-agent CrewAI setup with a [researcher, writer, and reviewer] agent, each with a distinct system prompt and tool set, and an orchestrator that routes tasks between them — show me the role/goal/backstory config for each agent.
3. Write an MCP server in Python that exposes [internal database query / internal API] as a tool to any MCP-compatible agent client, including proper input schema validation and error handling for malformed tool calls.
4. Debug an agent that's stuck in a loop calling the same [search/lookup] tool repeatedly with slightly different arguments — here's the trace: [paste trace]. Add loop detection that tracks tool-call signatures and forces termination or escalation after [N] repeated calls.
5. Implement a retry-with-backoff wrapper around agent tool calls that distinguishes between transient failures (network timeout — retry) and permanent failures (invalid arguments — don't retry, return error to the model) for a tool that calls [external API].
6. Write a memory summarization step that compresses the last [N] turns of an agent conversation into a running summary once the context exceeds [token threshold], using [the same LLM / a smaller model] for summarization, and show how to preserve key facts the agent will need later.
7. Add a human-in-the-loop approval checkpoint to my agent workflow right before it [sends an email / executes a financial transaction / deletes a record] — implement this as a LangGraph interrupt or a CrewAI human input step, including the UI/CLI prompt for the approver.
8. Debug why my agent's tool-calling accuracy dropped after I added a 6th tool to its tool set — here's the tool schemas: [paste schemas]. Identify whether the issue is schema ambiguity, overlapping tool descriptions, or context window pressure from too many tool definitions.
9. Implement a sandboxed code execution tool for an agent using [a Docker container / a restricted subprocess with resource limits] so the agent can run arbitrary Python for data analysis tasks without risking the host system, and define the timeout and resource-limit policy.
10. Write integration tests for a multi-agent CrewAI/LangGraph pipeline that mock the LLM calls and assert the orchestration logic (correct routing, correct termination conditions, correct handling of a sub-agent failure) without needing live API calls.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a multi-agent architecture for [complex task, e.g., end-to-end software bug triage and fix proposal] with clear ownership boundaries between agents, and identify where shared state could cause race conditions or conflicting writes if agents run in parallel.
2. Critique this agent orchestration design [paste: framework, agent roles, tool sets, memory strategy] for a production deployment handling [N] concurrent sessions, and identify the most likely failure mode under load.
3. Stress-test my loop-detection and retry-budget logic against an adversarial scenario where a tool returns subtly different results each call (e.g., a search API with non-deterministic ranking) so naive signature-based loop detection won't catch it — propose a more robust detection strategy.
4. Design a fallback and escalation strategy for an agent that exhausts its tool-call budget or retry budget without completing the task — should it return a partial result, escalate to a human, or hand off to a different agent, and how do I decide per task type?
5. Compare the cost and latency profile of a multi-agent system where each agent is a separate LLM call (e.g., 4 agents × 3 turns = 12 LLM calls) versus a single well-prompted agent handling the same task in fewer calls — at what task complexity does multi-agent actually win on quality enough to justify the cost?
6. Design a state-persistence strategy for long-running agent workflows (hours or days, e.g., a research agent that waits for external data) so the agent can be paused and resumed without losing context, using [LangGraph checkpointing / a database-backed state store].
7. Propose a safety architecture for an agent with code-execution and file-system tool access, including sandboxing, allowlisted operations, and an audit log, for a deployment where the agent is exposed to [untrusted user input].
8. My multi-agent system occasionally produces a result where two agents both modified [a shared document/resource] and one overwrote the other's work — design a coordination mechanism (locking, versioning, or a single-writer pattern) to prevent this.
9. Design an evaluation framework specifically for agent trajectories (not just final output) that scores whether the agent took a reasonable path — correct tool choices, no redundant calls, appropriate use of human-in-the-loop checkpoints — for a [task type] agent.
10. Walk through how I'd migrate a single-agent system built with direct function-calling to an MCP-based architecture where tools are served by independent MCP servers, and what backward-compatibility or versioning concerns I need to handle during the transition.

## Follow-up / chaining prompts

1. Now stress-test the LangGraph state machine you just designed against a tool call that times out mid-execution — does the state machine know how to resume cleanly, or does it restart from scratch?
2. Now explain the trade-off you just made by choosing CrewAI's role-based abstraction over a custom LangGraph state machine — what do I lose in terms of fine-grained control over agent handoffs?
3. Given the loop-detection logic we just built, tell me what happens if the legitimate task actually requires calling the same tool 10 times in a row (e.g., paginated API results) — how do I avoid false-positive termination?
4. Now take the human-in-the-loop checkpoint design and explain how it changes if the approver is slow to respond — does the agent session time out, queue, or retry the action automatically?
5. Now quantify the added latency and cost of the multi-agent design we discussed versus the single-agent alternative, assuming each LLM call costs $[X] and takes [Y] seconds — at what request volume does this become a real budget concern?
6. Revisit the MCP server we built and explain what changes if multiple agent clients connect to it concurrently — does the tool implementation need to handle concurrent state safely?

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I build a multi-agent system?"
**Sharper:** "I need to decompose a customer-onboarding workflow into agents — compare a single agent with 8 tools versus 3 specialized agents (data-collector, validator, account-creator) orchestrated via LangGraph, and tell me which reduces tool-misuse errors given that 2 of the steps are irreversible writes."

**Weak:** "My agent keeps looping, fix it."
**Sharper:** "My LangGraph agent calls the `search_orders` tool 6 times with near-identical arguments before giving up — here's the trace [paste] — diagnose whether this is a prompt issue (the model doesn't recognize it already has the answer) or a missing termination condition in the graph, and show me the fix."

**Weak:** "Which agent framework should I use?"
**Sharper:** "For a task requiring explicit conditional branching between a validation step and a retry step with full control over state at each transition, compare LangGraph's graph-based state machine against CrewAI's role-based orchestration, and tell me which gives me the debugging visibility I need when a step fails silently."

**Weak:** "Add memory to my agent."
**Sharper:** "My support agent's context window fills up after 15 turns on long tickets — design a memory strategy that summarizes turns 1-10 into a 200-token running summary while keeping the last 5 turns verbatim, and tell me what information is at risk of being lost in the summarization step."

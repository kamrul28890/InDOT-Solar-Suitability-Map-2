---
name: ds-business-acumen-decision-translation
description: Curated prompts for translating analysis into business decisions — framing problems, quantifying impact, prioritization. Use when connecting a data science finding to a business action or recommendation.
---

# Business Acumen & Decision Translation — Prompt Library (Data Scientist)

The gap between "technically correct analysis" and "analysis that changes a decision" is where most data science impact is won or lost, and in 2026 — with AI tools making the modeling itself faster and cheaper — this translation skill has become the actual scarce differentiator. It covers turning a vague stakeholder ask into an analyzable question with a clear decision attached, quantifying findings in terms stakeholders act on (dollar impact, % lift, ROI, payback period) rather than statistical terms alone, using lightweight prioritization frameworks like ICE and RICE to decide what to work on next, and — just as important — recognizing when a decision is already made and more analysis won't move it, or when an analysis is structurally at risk of being wrong (a pre-mortem). Good work here means every analysis starts with an explicit, agreed-upon definition of what success looks like and what decision it will inform, and ends with a recommendation stated in the stakeholder's terms, not just a p-value or a chart. The data scientists who get repeat trust from leadership are the ones whose findings consistently lead to action, not the ones with the most sophisticated models.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. A stakeholder asked me to "look into why [metric] is down." Help me turn this into a specific, analyzable question by identifying what decision the answer needs to support and what time window and segment to scope the analysis to.
2. Explain the difference between ICE and RICE prioritization frameworks for ranking [number] candidate data initiatives competing for my team's bandwidth this quarter, and walk through how the "confidence" or "effort" inputs change the ranking versus a naive impact-only ranking.
3. I have a finding that [finding, e.g., feature X correlates with a 5% increase in retention]. Walk me through how to convert this into a dollar-value business impact estimate, including what assumptions I'd need to state explicitly (e.g., causality, scale, margin).
4. Before I start a [number]-week analysis on [topic], what questions should I ask stakeholders upfront to define success criteria, so we don't end up disagreeing about whether the result is "good" after the work is done?
5. Explain how to identify what decision a given metric is actually supposed to drive — using [metric name] as the example — and how to tell if the metric is a vanity metric versus one that's genuinely tied to an action someone will take.
6. I'm being asked for a recommendation on [business question] with a decision deadline of [date]. Help me figure out the minimum analysis needed to support a decision by that deadline versus what would be "nice to have but not decision-relevant."
7. Walk me through pre-mortem thinking for an analysis on [topic] — what are the most likely ways this analysis could be wrong or misleading before I even start, so I can design around those risks now rather than discover them after presenting results.
8. How do I recognize when a business question already has enough data to answer confidently, versus when stakeholders are asking for "more analysis" as a way to avoid making an uncomfortable decision?
9. Explain how to frame an A/B test or causal analysis result in terms of expected ROI or payback period for a [business initiative], given a cost of [cost] and an estimated effect size of [effect size].
10. I need to compare [number] competing project ideas for next quarter using RICE scoring. Walk me through how to estimate the "reach" and "confidence" components honestly when I don't have hard data for either yet.

## Implementation prompts (build & debug)

1. Help me draft a one-page problem framing document for [business question] that states the decision to be made, the success metric, the analysis approach, and the deadline, so I can get stakeholder sign-off before starting the analysis.
2. Write a RICE scoring spreadsheet structure (columns and scoring guidance) for ranking [number] data initiatives, including how to handle ties when two initiatives score similarly but differ in risk.
3. I found that [intervention] improved [metric] by [amount] in a test. Help me build the dollar-impact calculation if rolled out to [population size], including a sensitivity table showing the impact estimate under optimistic, base, and conservative assumptions.
4. Help me draft the executive summary of my analysis on [topic] in three sentences: what we found, what it means for the business, and what decision we recommend — written for someone who will not read past the first paragraph.
5. I need to present a finding that contradicts what leadership expected on [topic]. Help me draft how to frame this diplomatically while still being clear about the evidence, without burying the actual conclusion.
6. Write a pre-mortem checklist I can run through before finalizing my analysis on [topic], covering selection bias, confounding, small sample size, and stakeholder confirmation bias risks specific to this analysis.
7. Help me build a simple ROI calculator for [proposed initiative] that takes implementation cost, expected effect size, and population size as inputs and outputs payback period and 12-month net impact.
8. I need to push back on a stakeholder request for [analysis] because the decision has effectively already been made. Help me draft language that questions whether the analysis will actually change the outcome, without sounding obstructive.
9. Help me translate a statistical result (e.g., a regression coefficient of [value] with p=[value]) into a one-sentence business statement that a non-technical stakeholder could repeat accurately in a meeting.
10. Write a short stakeholder alignment checklist I should walk through at kickoff for any new analysis request, covering decision owner, success metric, deadline, and what action will be taken for each possible outcome.

## Advanced prompts (architecture, optimization, edge cases)

1. Design a quarterly prioritization process using RICE scoring for a backlog of [number] data initiatives across [number] stakeholder teams, including how to normalize "reach" and "impact" estimates across teams that operate at very different scales.
2. I have an analysis showing [finding] but the effect size is small and the confidence interval is wide. Walk me through how to communicate the decision-relevant uncertainty honestly without either overstating confidence or making the finding sound useless.
3. Walk me through how to design an analysis upfront so that null results are still decision-useful — for [business question] — rather than ending in "we need more data" if the effect turns out to be smaller than expected.
4. I'm asked to estimate the ROI of [initiative] where the benefit is hard to quantify directly (e.g., brand trust, employee retention). Help me design a proxy-metric approach and be explicit about what assumptions make the dollar estimate fragile.
5. Design a framework for deciding when a data science finding should trigger an automatic action (e.g., an alert or automated policy change) versus when it should always route through human judgment, using [decision type] as the example.
6. Walk me through a pre-mortem for a high-stakes analysis on [topic] that will inform a [dollar amount] investment decision, identifying the top 3 ways the analysis could be directionally wrong and what guardrail or sensitivity check would catch each one.
7. I need to reconcile two stakeholder teams who define "success" for [initiative] differently — one cares about [metric A], the other about [metric B]. Help me design an analysis structure that reports both honestly without picking a side prematurely.
8. Design a process for retrospectively checking whether past data-driven recommendations actually led to the predicted business outcome, so I can calibrate how much to trust my own impact estimates going forward.
9. Walk me through how to handle a situation where the RICE-prioritized top initiative requires data or instrumentation that doesn't exist yet — should the prioritization framework account for "time to first data" as its own cost factor?
10. I need to scope an analysis that has a hard decision deadline in [number] days but the "correct" analysis would normally take longer. Help me design a staged approach that delivers a directional answer by the deadline while flagging what would change with more time.

## Follow-up / chaining prompts

1. Given the dollar-impact estimate we just built for [initiative], help me now build the sensitivity table showing how the ROI changes if the effect size is 50% smaller than observed, to stress-test the recommendation before I present it.
2. Based on the RICE scores we just calculated, help me draft the one-paragraph justification for why initiative [name] ranked above [other initiative], in language a non-technical stakeholder steering committee would find convincing.
3. Now that we've identified the pre-mortem risks for this analysis, help me design the specific sensitivity check or robustness test that would catch each risk if it materialized, before I finalize the result.
4. Given the executive summary we just drafted, help me anticipate the two pushback questions leadership is most likely to ask and draft concise, evidence-backed answers to each.
5. Based on the stakeholder alignment checklist we just completed, help me identify which success criteria are still ambiguous or unagreed, and draft a clarifying question to send before I start the analysis.
6. Now that we've confirmed this decision was effectively already made, help me draft a recommendation for how my team's bandwidth would be better spent, using the RICE framework to justify the redirection.

## Anti-patterns: prompts that get weak answers

**Weak:** "My boss wants me to analyze why sales are down."
**Sharper:** "Help me turn 'why are sales down' into a specific analyzable question — what decision does the answer need to support, and what segment/time window should I scope this to before I start pulling data?"

**Weak:** "How do I show this analysis matters?"
**Sharper:** "I found that onboarding completion correlates with a 5% retention lift — help me convert this into a dollar-value impact estimate for our 200,000-user base, stating the causality and scale assumptions explicitly."

**Weak:** "What should my team work on next?"
**Sharper:** "Help me RICE-score these 6 candidate data initiatives competing for next quarter's bandwidth, and show how the ranking changes if I weight confidence more heavily than reach."

**Weak:** "How do I present uncertain results?"
**Sharper:** "My effect size is small with a wide confidence interval — help me draft a way to communicate this honestly to stakeholders without overstating confidence or making the finding sound useless."

**Weak:** "Is this analysis worth doing?"
**Sharper:** "I have a decision deadline in 10 days for a $200K investment call — help me design a pre-mortem identifying the top 3 ways this analysis could be directionally wrong, and a staged approach that still delivers a directional answer by the deadline."

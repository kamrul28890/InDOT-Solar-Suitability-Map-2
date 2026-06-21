---
name: ds-data-storytelling-stakeholder-communication
description: Curated prompts for data storytelling and communicating insights to non-technical stakeholders. Use when writing a summary, presenting findings, or translating analysis into a business narrative.
---

# Data Storytelling & Stakeholder Communication — Prompt Library (Data Scientist)

The best analysis in the world is worthless if it dies in a slide nobody reads past the title, and in 2026 the data scientist's job increasingly includes being the translator between a model's output and a decision someone actually has to make. Good communication here means structuring the narrative around situation-insight-recommendation (or the pyramid principle: lead with the answer, then the supporting argument, then the detail) rather than walking an executive chronologically through every step of the analysis; it means calibrating technical depth to the audience instead of defaulting to the depth you used to do the work; and it means leading with the "so what" in the first sentence, not the third paragraph. It also means handling skepticism and pushback without getting defensive, communicating uncertainty honestly (a confidence interval, not false precision) without hedging so much the recommendation becomes useless, and anticipating the three follow-up questions a sharp stakeholder will ask before they ask them. AI assistants are now used heavily to draft and tighten this kind of communication — restructuring a wall of findings into an executive summary, role-playing a skeptical stakeholder, simplifying jargon — but deciding what the real "so what" is, and what to leave out, still requires the analyst's judgment about what the business actually needs to act on.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I have these findings from my analysis of `[topic]`: `[list 3-5 raw findings]` — help me restructure them using the pyramid principle, leading with the single most important "so what" before any supporting detail.
2. My audience for this is `[describe audience, e.g., "the VP of Operations, non-technical, time-constrained"]` — help me figure out what level of methodological detail to include versus cut entirely from my summary of `[analysis]`.
3. I need to write an executive summary for `[analysis topic]` — walk me through the situation-insight-recommendation structure and what goes in each of those three sections given my findings: `[summarize findings]`.
4. Help me anticipate the three hardest follow-up questions `[stakeholder role]` is likely to ask after I present `[finding]`, so I can prepare answers before the meeting.
5. I have a finding with real uncertainty — `[describe, e.g., "the effect could be anywhere from 2% to 9% lift"]` — help me phrase this for a decision-maker in a way that's honest about the range without hedging so much that it sounds like I have no answer.
6. Compare how I'd structure a one-page written report versus a 5-slide deck versus a 2-minute verbal update for the same finding (`[describe finding]`) to `[audience]` — what changes about the structure, not just the length?
7. I need to translate this technical result — `[describe, e.g., "a 0.15 reduction in Brier score from the new model"]` — into language a non-technical stakeholder will actually understand and care about, tied to a business outcome.
8. Help me figure out the "so what" buried in this analysis: I found `[describe a data pattern]` — what's the actual business implication, and what decision should this finding change?
9. I'm worried this finding will get pushback because it contradicts `[stakeholder]`'s prior belief that `[describe]` — help me think through how to present the evidence in a way that invites scrutiny rather than triggering defensiveness.
10. Help me decide what NOT to include in my summary of `[analysis]` — I have `[N]` sub-findings but the audience only needs the ones that change a decision; how do I triage which ones make the cut?

## Implementation prompts (build & debug)

1. Draft a 4-sentence executive summary for `[analysis]` that leads with the recommendation, states the key number, names the confidence level, and ends with the next decision point.
2. Rewrite this paragraph `[paste jargon-heavy paragraph]` for a non-technical audience, replacing statistical terms with plain language while keeping the actual claim and its strength accurate.
3. Draft slide titles and one supporting bullet each for a 5-slide deck presenting `[finding]` to `[audience]`, structured so the conclusion is in slide 1, not the conclusion slide at the end.
4. Write the "anticipated Q&A" appendix for my presentation on `[topic]` — predict the 5 most likely questions from `[stakeholder]` and draft tight, honest answers to each, including the ones I'd rather not be asked.
5. I got pushback in a meeting: `[describe the pushback, e.g., "the stakeholder said the sample size was too small to trust"]` — help me draft a response that addresses the substance of the concern without being dismissive or overly defensive.
6. Draft a "trade-offs" framing for a decision-maker choosing between `[option A]` and `[option B]`, where the data shows `[describe what the data shows about each]` — structure it as a clear comparison table plus a recommendation, not a neutral list of pros and cons.
7. Rewrite this finding to communicate uncertainty appropriately: `[describe an overconfident claim, e.g., "this will definitely increase revenue by 8%"]` — show me the corrected version with appropriately hedged language that's still decision-useful.
8. Draft a short narrative connecting these three disconnected findings — `[list findings]` — into a single coherent story with one through-line, suitable for a stakeholder who only has 5 minutes.
9. Write a one-paragraph caveat to accompany `[finding]` that's honest about its limitations (`[describe, e.g., "correlational, small sample, short observation window"]`) without undermining the stakeholder's confidence in the parts of the finding that are solid.
10. Help me turn this dense analysis writeup `[paste or describe]` into a "TL;DR" of 3 bullets at the top, followed by the full detail below for whoever wants to dig in.

## Advanced prompts (architecture, optimization, edge cases)

1. I need to present a finding that's politically sensitive — it suggests `[describe, e.g., "a leadership-championed initiative underperformed"]` — help me think through how to frame this factually and constructively without it reading as an attack, while not softening the actual conclusion.
2. Design a tiered reporting structure for `[recurring analysis, e.g., "monthly churn analysis"]` that serves three audiences at once — executives (one slide), managers (one page), and analysts (full detail) — without maintaining three separate disconnected documents.
3. I have a result that's statistically significant but the effect size is small enough that it may not be practically meaningful for `[business context]` — help me draft language that communicates this nuance to a stakeholder who tends to equate "significant" with "important."
4. Help me design a communication plan for delivering a finding that contradicts an earlier finding I presented to the same stakeholder `[time period]` ago — how do I explain the update without eroding trust in the analysis function?
5. I need to present a forecast with real downside risk — `[describe, e.g., "a 20% chance revenue misses target by more than 15%"]` — help me frame the downside scenario for planning purposes without either alarming the room unnecessarily or burying the risk.
6. Critique this executive summary draft `[paste draft]` against the pyramid principle and tell me specifically what to cut, reorder, or lead with differently.
7. Help me design how I'd communicate the same underlying finding differently to three different stakeholders — `[role A, e.g., "CFO focused on cost"]`, `[role B, e.g., "product lead focused on user experience"]`, and `[role C, e.g., "engineering focused on feasibility"]` — given they care about different consequences of the same data.
8. I need to present a null result — `[describe, e.g., "the A/B test showed no significant effect"]` — help me frame this as a useful, decision-relevant finding rather than something that reads as "the analysis failed."
9. Design a feedback loop where I track which of my past recommendations were acted on, ignored, or reversed, so I can calibrate how I frame confidence and trade-offs in future stakeholder communication.
10. Help me think through how much technical methodology to disclose proactively versus hold in reserve for follow-up questions when presenting `[finding]` to a mixed audience of technical and non-technical stakeholders.

## Follow-up / chaining prompts

1. Given the executive summary you just drafted, now write the 60-second verbal version I'd say out loud if I only had one minute in a meeting to cover this.
2. Based on the anticipated questions above, draft the backup slide I'd need to answer the toughest one (`[which question]`) if it comes up.
3. Now that we've reframed the uncertainty language, show me how the recommendation section changes — does the action I'm recommending stay the same given the more honest framing?
4. Take the pushback response you drafted and tighten it to two sentences I could say live in the meeting without sounding scripted.
5. Given the tiered reporting structure above, now draft the actual one-page version for the "manager" tier using my real findings: `[list findings]`.
6. Now translate the trade-off table we built into the single recommendation sentence I'd put at the very top of the document, before the table even appears.

## Anti-patterns: prompts that get weak answers

**Weak:** "Can you summarize my findings?"
**Sharper:** "I have these 4 findings about customer churn drivers — [list them] — restructure them using situation-insight-recommendation so the VP reading this knows within 10 seconds what action I'm recommending and why."

**Weak:** "Make this less technical."
**Sharper:** "Rewrite this sentence — 'the model shows a statistically significant coefficient of 0.34 with p<0.01' — for a sales director audience, keeping the actual strength of the claim intact but replacing the statistical terms with plain business language."

**Weak:** "How do I handle pushback?"
**Sharper:** "The CFO pushed back saying my 90-day churn forecast sample size of 1,200 customers is 'too small to trust' — draft a response that addresses the statistical validity of that sample size directly, without being defensive."

**Weak:** "Write me an executive summary."
**Sharper:** "Draft a 4-sentence executive summary for my pricing elasticity analysis that leads with the recommended price point, states the expected revenue impact with its confidence interval, and ends with the one risk I'd flag before they approve it."

**Weak:** "How do I present uncertainty?"
**Sharper:** "My forecast has a 95% prediction interval of 8% to 22% revenue growth — help me phrase this for a board slide so it reads as a credible range decision-makers can plan around, rather than as a hedge that undermines the forecast's usefulness."

# Omni: Extra "Next Level" AI Suggestions

These ideas are designed to layer on top of your existing 8-phase roadmap without introducing heavy dependencies.

## 1) Add a lightweight "Memory Layer" (high impact)
You already plan to pass a rich context snapshot. Go one step further and create a tiny memory object that is persisted daily:

- `omni-memory-profile`: preferred wake/sleep windows, preferred focus blocks, budget sensitivity, food preferences.
- `omni-memory-patterns`: computed weekly from behavior (e.g., "most likely to miss habits on Sunday evening").
- `omni-memory-last-actions`: last assistant actions and whether user accepted/rejected suggestions.

Use this memory in system prompt construction so responses become personalized over time.

## 2) Add an AI "Plan-Then-Act" mode for safer tool-calling
Before mutating data, have the assistant produce an internal plan and confidence score:

1. Interpret intent
2. Select tools
3. Ask clarification if confidence is low
4. Execute tools
5. Summarize changes

Practical rule:
- If confidence < 0.75, ask one clarifying question.
- If confidence >= 0.75, execute with a concise confirmation.

This will reduce bad writes from voice input and ambiguous prompts.

## 3) Create an "Omni Score" daily health metric
Compute one score (0–100) from tasks, habits, spending discipline, learning progress, and wellness adherence.

Why this matters:
- Gives users one quick signal every morning.
- Makes daily briefing more actionable.
- Creates a strong loop for motivation and retention.

Persist score history for trend analysis and weekly summaries.

## 4) Add "What changed since yesterday?" AI digest
Alongside the smart daily briefing, generate a tiny diff summary:

- Tasks completed vs added
- Habit streaks gained/lost
- Spending delta vs yesterday
- Learning minutes delta
- Wellness adherence delta

This keeps assistant responses anchored in measurable progress, not generic advice.

## 5) Build a simple "nudge engine" with rules + AI phrasing
Separate **when to nudge** from **how to phrase nudge**:

- Rules engine decides trigger (`overdue > 3`, `waterGlasses < 3 by 5pm`, etc.).
- LLM rewrites as a friendly personalized message in your tone.

Benefits:
- Consistent behavior (predictable triggers)
- Human-like language (AI-generated phrasing)
- Easier to tune than pure LLM behavior

## 6) Add acceptance feedback loop for assistant quality
When assistant proposes a schedule, meal, or budget advice, capture:

- accepted / dismissed / edited
- time-to-accept
- follow-through outcome

Use this signal to rank future suggestions. Over time Omni becomes adaptive instead of static.

## 7) Introduce "Focus Sessions" that unify tasks + habits + learning
New quick action in chat: "Start a 45-min focus session".

Session can:
- pick top task + linked habit + learning micro-goal
- silence non-critical nudges
- end with a 20-second reflection log

This is a strong AI-driven behavior loop and naturally improves completion data.

## 8) Add model routing for cost/performance optimization
Keep Groq as primary, but route prompts by complexity:

- lightweight intent detection/classification: cheap/fast model path
- long synthesis (daily briefing, analytics trend): stronger model path

Even if both routes use Groq models, explicit routing will improve latency and control cost as usage grows.

## 9) Create an AI evaluation harness (must-have before scaling features)
Add a small local script with fixed test prompts and expected behavior:

- "Add rent expense for 12000"
- "What is overdue this week?"
- "Plan my evening with 3 pending tasks"

Track pass/fail for:
- tool selection correctness
- JSON schema validity
- hallucination guardrails

Run this in CI to avoid regressions as prompts/tools evolve.

## 10) Add privacy tiers for AI context
Let user choose how much data is shared with AI per request:

- Minimal: task titles only
- Balanced: include amounts/categories and streak counts
- Full: include notes/recent transaction details

Store preference in localStorage and expose in settings. This improves trust significantly.

## 11) Build proactive "risk predictions" in Dashboard
Use simple heuristics first (no heavy ML):

- habit at-risk if missed 2 of last 3 opportunities
- budget at-risk if month-to-date spend > expected burn rate
- deadline at-risk if required daily pace > recent pace

Then let AI explain each risk with one actionable next step.

## 12) Add "Weekly Review" auto-generated every Sunday evening
A single narrative message with:

- biggest win
- biggest leak (time/money)
- top habit insight
- next week focus theme
- 3 concrete commitments

This becomes the strategic layer of Omni and boosts long-term retention.

---

## Suggested sequencing beyond your current roadmap
After your planned Week 1–5 roadmap, a high-leverage sequence would be:

1. AI evaluation harness + privacy tiers
2. Memory layer + acceptance feedback
3. Nudge engine + what-changed digest
4. Omni score + weekly review
5. Focus sessions + risk predictions

This order improves reliability and personalization before adding more UI complexity.

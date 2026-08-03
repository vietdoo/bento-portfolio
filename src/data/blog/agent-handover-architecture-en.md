---
title: "Stop AI Agent Amnesia: The Handover Architecture Pattern"
description: "A repo-level pattern that lets any AI agent pick up work where another one dropped it: one constitution, a handover ledger, a routing map, and a non-AI forcing function."
pubDate: 2026-08-02
category: "architecture"
image: "/blog/agent-handover-architecture.jpg"
lang: "en"
translationKey: "agent-handover-architecture"
draft: false
---

![AI Agent Handover Architecture](/blog/agent-handover-architecture.jpg)

Every AI coding agent is brilliant for exactly one session and then gets amnesia. You spend forty minutes explaining why the repository is feature-sliced instead of layered, the agent does great work, the window closes — and tomorrow a different agent (or the same one, fresh) walks in and proposes a `services/` folder again.

The usual reaction is to pick a "main" agent and stick with it. That's the wrong axis. The interesting question isn't *which* agent — it's **how work is handed over between them**. Get that right and the agent becomes a runtime detail, swappable like a database driver.

This is a pattern I've been running in a multi-agent monorepo. Nothing here is tool-specific: it works with any mix of CLI agents, IDE agents, and background agents.

## The core idea: the repo is the memory

Agents are stateless. The repository is not. So every piece of context that matters must live *in the repo*, in a place agents are contractually obliged to read and write.

Four planes, each with a distinct job:

![Four Pillars of Handover Architecture](/blog/handover-four-pillars.jpg)

Miss any one of them and the system leaks: rules without a ledger means agents repeat decisions; a ledger without a forcing function means nobody writes to it.

## Pillar 1 — One constitution, thin adapters

Every vendor invented its own instruction filename. The trap is to let each one accumulate its own dialect of the rules; three months later `CLAUDE.md` and the Cursor rules disagree about the test policy and each agent behaves like a different company.

Keep exactly **one** source of truth and make the rest pointers:

<svg viewBox="0 0 720 260" width="100%" role="img" aria-label="Adapter files pointing at a single rule file" style="max-width:100%;height:auto;margin:24px 0">
 <g font-family="inherit" font-size="13" fill="#e5e7eb">
 <rect x="260" y="100" width="200" height="60" rx="10" fill="rgba(255,255,255,0.06)" stroke="var(--primary-500)" stroke-width="2"/>
 <text x="360" y="126" text-anchor="middle" font-size="14" font-weight="700" fill="var(--primary-300)">AGENTS.md</text>
 <text x="360" y="146" text-anchor="middle" font-size="12">single source of truth</text>
 <rect x="30" y="20" width="150" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.35)"/>
 <text x="105" y="46" text-anchor="middle">CLAUDE.md</text>
 <rect x="30" y="200" width="150" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.35)"/>
 <text x="105" y="226" text-anchor="middle">.cursor/rules</text>
 <rect x="540" y="20" width="150" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.35)"/>
 <text x="615" y="46" text-anchor="middle">GEMINI.md</text>
 <rect x="540" y="200" width="150" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.35)"/>
 <text x="615" y="226" text-anchor="middle">copilot-instructions</text>
 <g stroke="var(--primary-500)" stroke-width="1.5" fill="none" opacity="0.8">
 <path d="M180 41 H220 Q240 41 240 70 V115 H258"/>
 <path d="M180 221 H220 Q240 221 240 190 V145 H258"/>
 <path d="M540 41 H500 Q480 41 480 70 V115 H462"/>
 <path d="M540 221 H500 Q480 221 480 190 V145 H462"/>
 </g>
 <text x="360" y="196" text-anchor="middle" font-size="12" fill="rgba(229,231,235,0.65)">adapters contain 3 lines: "read AGENTS.md, do not duplicate rules here"</text>
 </g>
</svg>

An adapter file that contains rules is a bug. An adapter file that contains a pointer is a feature.

Two things belong in the constitution and nowhere else:

- **Invariants** — the architectural laws (vertical slices, public contract per feature, no cross-feature internal imports, file ≤ 200 lines).
- **The Definition of Done** — a literal checklist the agent must satisfy before claiming completion.

Keep it short. The constitution is loaded into *every* session; every paragraph you add is context budget you take away from the actual task.

## Pillar 2 — The handover ledger

This is the heart of the pattern: an append-only log where every session writes one entry before it ends. Not a changelog — `git log` already exists — but the thing git cannot store: **intent**.

A good entry has five fields:

| Field | Why it exists |
| --- | --- |
| Timestamp + agent identity | Lets the next reader judge staleness and know which tool's quirks produced the code |
| Scope | Which modules were touched, so unrelated sessions can skip the entry |
| What was done | Files, config, docs — the summary git can't give you in one paragraph |
| Decision + rationale | Stops the next agent from re-litigating a settled trade-off |
| Unfinished work & warnings | The actual handover: a ranked backlog written by whoever just had the deepest context |

The rationale field is what makes the pattern pay for itself. "In-memory repository, chosen deliberately, Postgres is item #1 in the backlog" prevents an agent from either ripping it out unprompted or treating it as good enough forever.

Scope discipline matters too: system-wide changes (API contract, schema, architecture) go into the **global** ledger; purely local churn inside one sub-module goes into a **local** one. Otherwise the global log becomes a noise firehose that nobody reads, which is the same as having no log.

## Pillar 3 — A routing map so agents stop guessing

Ask an agent "where do I add rate limiting?" and it will happily grep half the repo, burn context, and then invent a plausible location. A one-page decision tree answers that in ten tokens:

```text
Work request
 ├── UI / player / component ......... → frontend feature slice
 ├── API / lessons / progress / auth .. → backend feature slice
 ├── audio, STT, LLM scoring ......... → AI service module
 └── endpoint, DTO, schema, term ..... → code + update the contract docs
```

Around it sit three lookups: a **module map** (where the equivalent class lives in each app), an **API contract** (endpoints and DTOs), and a **glossary** (domain terms and enums — the thing that keeps five agents from inventing five names for the same concept).

And the rule that keeps them alive: *any* change to an endpoint, DTO, schema, or term must update the corresponding doc in the same task. Docs stop being documentation and become part of the build output.

## Pillar 4 — A forcing function that isn't an AI

Here's the uncomfortable truth: agents are unreliable graders of their own compliance. They will cheerfully tick "documentation updated" while having updated nothing. So the last gate must be a boring, deterministic script:

```python
# 1. do the governance files still exist?
# 2. did contract-shaped files change (router/schema/dto/service)
#    without a matching change under docs/?
# 3. was the handover log touched in this session at all?
if errors:
    sys.exit(1)
```

That's it — a `git status` parser with a regex list. It cannot be sweet-talked, it runs in CI, and it turns "please remember to update the docs" from a hope into a build failure. Every governance rule you write should be paired with the question: *what dumb check proves this happened?* If there's no answer, the rule is decoration.

## The session loop

Put the four planes together and every agent, regardless of vendor, runs the same cycle:

![Session Loop Workflow](/blog/handover-session-loop.jpg)

Read context → route → change code **and** docs together → append the ledger entry → let a non-AI script certify it. The loop closes: the output of one session is precisely the input format of the next.

## Failure modes worth designing against

- **Constitution bloat.** It gets read every session; if it grows past a couple of pages agents start skimming it, and skimming is indistinguishable from ignoring.
- **Ledger as diff dump.** If entries restate the diff, nobody reads them. Entries are for *decisions, rationale, and leftovers*.
- **Unverifiable rules.** "Write clean code" cannot be checked, so it will not be followed. Prefer "file ≤ 200 lines" and "public exports only via the feature's index".
- **Doc rot.** The moment a map lies, agents stop trusting all the maps. That's why doc updates ride in the same task as the code change, not in a follow-up.
- **One giant log.** Split global versus local, or the signal drowns.

## Why it works

None of this is new. It's the shift handover from hospitals and aviation: a fixed protocol, a written record of what's pending, and a checklist that a tired human — or a stateless model — cannot skip. Multi-agent development has exactly the same shape, and it needs the same boring discipline.

The payoff is real portability. When context lives in the repo instead of a chat window, you can switch agents mid-feature, run several in parallel on different slices, or hire a human who reads the same ledger. The agent stops being your architecture. The handover protocol is.

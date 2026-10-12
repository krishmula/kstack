---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
---

# Reflect

Before using host-specific tools, read [`../kstack/references/runtime.md`](../kstack/references/runtime.md).

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Before fanning out, find this conversation's transcript. Use only the active host's current-task history or transcript path. Never search across unrelated workspaces or conversations. If the host does not expose a transcript, pass a tight digest of the session instead.

When several host-provided candidates exist, match the opening user prompt and workspace before selecting one. Do not infer the current conversation from file recency alone.

## 2. Spawn three reviewers in parallel

Start three general-purpose reviewers together. Reviewers may need connected read tools to look up the tickets, chat threads, and observability traces the transcript references. Permit those reads, forbid file writes and external mutations in the prompt, and let the parent apply edits.

Each reviewer and the synthesizer name a model role, resolved and dispatched per the runtime adapter's **Resolve a role** section.

| Lens | Role | Prompt template |
|---|---|---|
| Judgment | `reflect-judgment` | `references/judgment-reviewer.md` |
| Tooling | `reflect-tooling` | `references/tooling-reviewer.md` |
| Divergent | `reflect-divergent` | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their final reports.

## 3. Synthesize

Spawn one general-purpose synthesizer on the `reflect-synthesizer` role. It spot-verifies citations, which can require connected tools, so permit reads and tool access but forbid file writes in the prompt. Pass `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. The user picks the subset and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

File each Backlog item to your team's devex or backlog tracker without waiting when the host and user have granted authority to write there. Otherwise list the Backlog items for the user to file. Only the Accepted list waits for approval.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than about 10 lines): hand it to the host's skill-authoring skill and run its draft, test, and iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand it to the host's skill-authoring skill and run its description-optimization loop.
- `new skill via create-skill: <kebab-name>`: hand creation to the host's skill-authoring skill. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.

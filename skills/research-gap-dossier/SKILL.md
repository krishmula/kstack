---
name: research-gap-dossier
description: "Find, adversarially validate, and document research gaps and thesis directions, especially in ML systems, AI infrastructure, distributed systems, and LLM serving or training. Use for new research ideas, unexplored gaps, novelty checks, attacking candidate ideas, kill-test or POC design, or a self-contained research dossier."
disable-model-invocation: true
---

# Research Gap Dossier

Before using host-specific tools, read [`../kstack/references/runtime.md`](../kstack/references/runtime.md).

## Operating principle

Treat research ideation as falsification, not brainstorming. Do not optimize for producing many clever ideas. Optimize for finding a small number of questions that survive current literature, adjacent systems, scale effects, simple baselines, and cheap experiments.

Start from a topic and the user's constraints. Accept selected lenses as optional input. The user does not need to supply a mechanism, open question, or candidate before this skill runs.

Use this sequence:

1. Establish constraints and the research directory.
2. Map the current research and production frontier.
3. Generate candidate gaps from first principles and systems building blocks.
4. Run adversarial review pass 1.
5. Narrow or reformulate candidates.
6. Run adversarial review pass 2 on a multi-model panel with fresh searches.
7. Design the cheapest decisive validation for each survivor.
8. Produce a concise shortlist and a complete dossier for the strongest survivor.

Never call an idea novel merely because an exact title was not found. State novelty conservatively, as in "I did not find public work that combines or directly answers X", and name the closest threats.

## Research directory

A gap search runs across sessions and an advisor audits it. Each investigation is an R record with its own directory. Read [references/recording.md](references/recording.md) before creating or resuming a record. Resume only when continuing that investigation. The same topic and lenses can have multiple R records.

Keep these artifacts in the R record directory:

- `constraints.md` records the R identifier, topic, selected lenses, date, constraints, prior records, and coverage.
- `ledger.tsv` is the source ledger (see step 2).
- `candidates.md` holds the candidate cards and both review passes.
- `dossier.md` is the final dossier.
- `decisions.tsv` is the decision trail, kept per the **show-me-your-work** skill. Log each kill, reformulation, status change, and experiment result.

Cite sources in `candidates.md` and `dossier.md` as `[L<n>]`, the ledger id. Source ids such as `[L4]` are local to the ledger. Lens ids such as `L-04` come from the project's catalog. After each step, run `bun <kstack-root>/skills/kstack/scripts/research/ledger.ts <R-record-directory>` and fix every problem before moving on.

## 1. Establish constraints

Reuse context already supplied by the user. Do not ask them to repeat it.

When the user supplies lenses, use only those lenses for candidate generation. They replace the default lens list for this run. Combine selected lenses where useful, but do not apply the full list again to mechanisms found through them. When no lenses are supplied, select relevant lenses from step 3 and record the selection before candidate generation.

Limit candidate generation to that scope. Searches for answering work, adjacent systems, and simple baselines must still go beyond it when needed to challenge a candidate.

Read relevant prior R records and linked E records. Reuse evidence only after checking its source and applicability. Name the changed conditions or new evidence when revisiting an earlier rejection. Do not treat an earlier KILL as universal across workloads or hardware.

If material constraints are missing, ask only what is needed:
- research domain or systems area;
- time budget and thesis/project duration;
- available hardware/data/access;
- desired outcome: publication, open source, career value, startup relevance, or a mix;
- preferred artifact: chat summary, Markdown, or document.

For a one-year systems thesis, default to requiring:
- a concrete system or mechanism;
- reproducible evaluation;
- a strong baseline;
- a measurable research claim;
- a realistic path to open source;
- a scope that can be validated early and completed within the year.

Read [`references/decision-rubric.md`](references/decision-rubric.md) before ranking candidates.

Separate available compute from required compute. A MacBook Air limits local validation, not which research questions can survive. For each resource-dependent candidate, use the compute fields in [references/recording.md](references/recording.md). Missing hardware alone is a blocker, not KILL. Lack of a credible evaluation path within the project timeline can still fail feasibility, with a reason beyond current hardware ownership.

## 2. Build the frontier map

Novelty is time-sensitive. Search the current web before making substantive novelty claims.

Prioritize evidence in this order. The ledger's `type` column records it:
1. `paper`: peer-reviewed conference papers and proceedings;
2. `preprint`: recent arXiv papers from credible research groups;
3. `engineering`, `repo`: official engineering blogs, documentation, RFCs, issue trackers, and repositories for active systems;
4. `trace`: production traces or workload-characterization studies;
5. `secondary`: summaries, used only for discovery, never as the main evidence for a technical claim.

Search both the exact idea and its nearest neighbors. Cover at least these evidence classes:
- exact mechanism or primitive;
- adjacent mechanism that could make the proposed idea trivial;
- architecture/workload-specific prior work;
- production systems from relevant companies/projects;
- negative results or workload studies that could make the opportunity disappear at scale.

For fast-moving infrastructure topics, inspect recent repository issues/RFCs/PRs in addition to papers. A paper search alone is insufficient.

When the map spans several evidence classes, give each class to its own fresh subagent with the topic, selected lenses, constraints, prior findings, and ledger format. Each returns ledger rows, not prose. Update coverage in `constraints.md` with evidence of what was investigated, checked briefly, or left uninvestigated. Uninvestigated directions are not rejected candidates.

### Source ledger

`ledger.tsv` has one row per source with the columns `id title year venue type url fetched quote proves does_not_prove bearing`. Cells stay single-line.

- **Only a source you opened counts.** `fetched` is the date you read the page itself, and `quote` is a short verbatim passage from it that supports `proves`. A search snippet, a remembered title, or another paper's citation of it is not a read. Record such a source with `fetched` set to `unverified` and an empty quote.
- **An unverified source supports nothing.** Never cite one in `candidates.md` or `dossier.md`. Open it or drop it. The checker rejects the citation.
- **Never write a title, author, venue, or year you have not seen on the source.** If a fetch fails, say so instead of filling the row from memory.
- `bearing` names the candidates the source threatens or supports, such as `threatens C2; supports C4`.

## 3. Generate candidate gaps

Aim for 5-10 grounded candidates within the selected scope, then aggressively reduce them. Return fewer if the evidence does not support that many. Prefer questions that arise from a mismatch between a modern workload and an older systems assumption.

When lenses were not supplied, select relevant lenses from this menu for systems topics. The list is not a coverage checklist:
- checkpoint/restart;
- live migration;
- preemption and recovery;
- scheduling and admission control;
- caching and memory hierarchy;
- resource disaggregation;
- leases and reservations;
- speculative execution;
- work stealing;
- load balancing and elasticity;
- isolation and multi-tenancy;
- consistency and ownership transfer;
- backpressure and queueing;
- fault tolerance;
- topology changes;
- hardware-aware placement;
- power/capacity constraints.

Outside systems, replace this list with the recurring mechanisms of the user's field before generating candidates.

Also search for architecture-induced systems problems: ask whether a new model architecture, agent workflow, memory representation, or accelerator changes the state or resource semantics enough to require a new primitive.

Keep this search within the selected lenses.

For every candidate, write a card in `candidates.md` with an id (`C1`, `C2`, ...) and these fields. Append review outcomes, queries, status changes, and evidence as the review proceeds:
- Lens: which selected lenses led to the candidate?
- Existing mechanism: the current process, its source, and the exact unresolved question.
- Problem: what concrete system behavior is inefficient, incorrect, or unknown?
- Why now: what changed recently?
- Existing work: what is already solved?
- Exact gap: the smallest remaining unanswered part.
- Research question: falsifiable and comparative, in the form of step 9.
- Hypothesis: what should happen if the idea is right?
- Cheapest decisive test.
- Biggest novelty threat.
- Scale risk.
- Compute: the blocker, local screening, ideal configuration, lower-resource configuration, estimated resources, and access path from `references/recording.md`.

Avoid solution-first ideas. Prefer "What fact is still unknown?" before "What system should we build?"

## 4. Adversarial review pass 1

Attack every candidate using all of these questions:

1. Novelty attack: Is the exact mechanism already published or shipping?
2. Adjacent-work attack: Does another system already provide the needed primitive under a different name?
3. Combination attack: Is this only "Paper A + Paper B" without a new coupling or systems constraint?
4. Simplicity attack: Would stop-and-copy, replay, batching, caching, reactive scheduling, or another simple baseline solve most of the problem?
5. Scale attack: Does the phenomenon disappear under concurrency, batching, multiplexing, or larger clusters?
6. Oracle attack: Even with perfect information, is the maximum possible improvement meaningful?
7. Correctness attack: Is there a real consistency/recovery/state-management issue, or only data movement?
8. Feasibility attack: Is there a credible path to the required resources and evaluation within the user's timeline? Missing local compute alone records a blocker.
9. Relevance attack: Does the problem matter in a realistic production regime?
10. Scoop-risk attack: Is an active upstream project obviously converging on the same contribution?

Read [`references/adversarial-checklist.md`](references/adversarial-checklist.md) for what each attack searches and the decision rules. Drop weak candidates. Reformulate candidates when only a narrower unanswered core survives.

## 5. Adversarial review pass 2

The model that wrote the candidates shares their blind spots, so pass 2 runs on other models. Start one reviewer per entry in the `interrogate-reviewers` panel, resolved per the runtime adapter's **Resolve a role** section, all together. Each reviewer is read-only and needs web search and page fetch. Treat those as connectors per the adapter's **Connector-bound work** rule.

Fill [`references/reviewer-prompt.md`](references/reviewer-prompt.md) once per reviewer with the constraints, every surviving candidate card, the current ledger, and the checklist. Each reviewer runs its own fresh targeted searches. Do not let it reuse only the first-pass evidence. It searches for:
- the revised exact research question;
- the proposed mechanism plus synonyms;
- the strongest simple baseline;
- the most recent 6-12 months of papers;
- current repos/RFCs/issues for relevant serving/runtime projects;
- workload-characterization evidence at realistic scale;
- cross-domain systems that solve the same state or scheduling problem elsewhere.

Each reviewer answers the hostile reviewer question for every candidate:

> "What is the shortest argument a strong systems reviewer could use to reject this as already solved, trivial, unimportant, or unevaluable?"

You are the lead judge. Open every new source a reviewer cites and add it to the ledger yourself. A reviewer's quote is a lead, not a read. Merge rejections that make the same argument, and note which models raised each. A rejection two models raised independently is the strongest signal. Revise again. Answer factual rejections with fetched sources or recorded experiments. Experimental uncertainties and resource blockers can remain Open with a specific validation or access action. They cap an unvalidated candidate at MEASURE-FIRST. Unresolved novelty requires further search, not an experiment or a claim of novelty.

## 6. Design validation before implementation

Separate questions already answered by literature from questions that still require experiments. Do not reproduce established results unless needed as a baseline or integration check.

Design the smallest experiment that tests the remaining uncertainty:

- Problem existence unknown -> workload measurement or trace study.
- Maximum upside unknown -> perfect-future/oracle upper bound.
- Mechanism feasibility unknown -> microbenchmark or minimal POC.
- Scale behavior unknown -> concurrency sweep or trace replay.
- Correctness unknown -> deterministic equivalence/restore/cutover test.
- Simple baseline may be enough -> benchmark the simple baseline first.

Use synthetic workloads only for screening. Before a thesis commitment, move to real models, public/production traces, or a real serving engine when possible.

Define the GO / PIVOT / KILL result of each experiment before running it, and log the thresholds in `decisions.tsv` before the first run. If numeric thresholds are heuristics rather than literature standards, label them as such. Before reporting any number an experiment measured, apply the **benchmark-checklist** skill.

This skill produces the experiment plan. Do not implement or run a new experiment as part of the dossier unless the user separately requests that work. After the dossier, the user studies the mechanism, question, and measurements before experiment implementation. Record learning notes and unresolved doubts alongside the dossier without treating them as evidence.

When local hardware is available, explicitly separate:
- what can be screened locally;
- what requires NVIDIA GPUs or a cluster;
- what requires real multi-node/network measurements for the final claim.

Carry each survivor's compute requirements into its validation plan. Keep resource readiness separate from research status. A compute-blocked candidate can be MEASURE-FIRST while its experiment waits for hardware.

## 7. Select survivors

Use the rubric in [`references/decision-rubric.md`](references/decision-rubric.md).

Return a small decision table with:
- candidate;
- exact surviving question;
- what prior work already answers;
- strongest novelty threat;
- evidence still missing;
- next validation step;
- status: GO, PIVOT, MEASURE-FIRST, or KILL, as the rubric defines them;
- confidence in the public gap: low / medium / high.
- resource readiness, the missing compute, and the next action needed to unblock validation.

Do not rank a candidate highly only because it is difficult. Prefer a crisp, measurable gap over an ambitious but vague system.

## 8. Produce the final dossier

For the strongest surviving idea, write `dossier.md` from [`references/dossier-template.md`](references/dossier-template.md).

If no candidate survives, still write `dossier.md` with the scope, coverage limits, rejection summary, and evidence. State that no experiment is recommended. Do not invent a survivor to fill the template.

Default style:
- simple and terse;
- titles, subtitles, paragraphs, bullets, and simple tables only;
- no decorative visuals;
- explain technical ideas in plain language first, then precise language;
- distinguish facts, interpretation, hypotheses, and proposed work;
- include negative evidence and reasons the idea may fail;
- include experiments already run and what they changed;
- include the next POC and exact evaluation plan;
- include primary-source references.

Explain the existing mechanism before the proposal. Name the unresolved question and explain how each proposed measurement bears on it. Record subsequent E identifiers against their candidate and R record. Add results to `decisions.tsv` and update the dossier when evidence changes its conclusion. One R record can lead to multiple E records.

If the user asks for a DOCX, convert `dossier.md` with the host's document skill or `pandoc`, and keep this simple style. Otherwise the Markdown file is the artifact.

## 9. Required research-question form

Prefer questions shaped like:

> Can [new information/mechanism/primitive] improve or enable [measurable systems outcome] under [specific workload/architecture/constraint], compared with [strong baseline], while preserving [SLO/correctness/cost constraint]?

A valid question must expose what result would make the answer "no."

## 10. Non-negotiable research behavior

- Never invent a gap.
- Never cite a source you did not open this session.
- Never treat lack of search hits as proof of novelty.
- Never hide prior work that weakens the idea.
- Never compare only against a weak baseline when a stronger public system exists.
- Never build a complex scheduler before checking the oracle upper bound when the opportunity itself is uncertain.
- Never generalize a local single-user result to enterprise scale without a scale argument or experiment.
- Never generalize a synthetic result to production without clearly labeling the limitation.
- Prefer killing two attractive ideas over preserving three weak ones.
- Preserve failed experiments in the dossier when they materially shaped the surviving question.

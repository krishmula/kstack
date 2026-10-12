# Dossier template

Write `dossier.md` with these sections, in this order. Keep each section short. Cite every factual claim with a ledger id such as `[L4]`. Mark each claim's kind where it is not obvious: fact, interpretation, hypothesis, or proposed work.

```markdown
# <Working title>

<Date> · Status: <GO | MEASURE-FIRST | PIVOT> · Gap confidence: <low | medium | high>

## Summary

One paragraph in plain language: the problem, why it matters now, the gap, and
the first experiment. Then the same in one or two precise sentences.

## Research question

<The question in the required form.>

The answer is "no" if <the result that would falsify it>.

## Background

The facts a reader needs, plain language first. Only what the question depends on.

## What prior work already answers

| Work | What it solves | What it leaves open | Source |
|---|---|---|---|

## The gap

The smallest unanswered part, and why the closest work does not answer it.
Phrase novelty conservatively: "I did not find public work that ..." and name
the closest threats.

## Why now

What changed recently in workloads, architectures, hardware, or deployments.

## Hypotheses

Numbered. Each one says what should happen if the idea is right and how it would show.

## Evidence against

Negative results, workload studies, simple baselines, and reviewer arguments
that weaken the idea, each with how it was answered or why it still stands.

## Experiments already run

| Experiment | Setup | Result | What it changed |
|---|---|---|---|

Include failed and killed experiments that shaped the question.

## Validation plan

The next kill-test: what it measures, the setup, and the GO, PIVOT, and KILL
conditions fixed before running. Label heuristic thresholds as heuristics.
Split what runs locally, what needs GPUs or a cluster, and what needs real
multi-node or network measurement.

## Evaluation plan

Baselines (the strongest public system and the strongest simple baseline),
workloads and traces, metrics, the SLO or correctness constraint, and the scale
the final claim needs.

## Plan

Milestones across the thesis timeline, with the first kill-test early and a
named decision point after each.

## Risks and threats

Scoop risk, scale risk, feasibility risk, and what you would do if each happened.

## Candidates considered

One line per killed or deprioritized candidate: the question and the attack
that ended it.

## References

Every cited ledger row: authors if seen on the source, title, venue, year, and URL.
Primary sources only. Secondary sources appear only if they were used for discovery,
and are labeled as such.
```

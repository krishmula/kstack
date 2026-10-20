# Decision rubric

Rank candidates with gates first, then ratings. Do not sum the ratings into a score. A weighted sum hides the one weakness that kills a thesis.

## Gates

A candidate that fails any gate is KILL, or PIVOT when a narrower question would pass it. Every gate decision cites ledger rows or an experiment.

1. **Unanswered.** No fetched source answers the exact surviving question. A source that answers it under a different name counts.
2. **Falsifiable.** The research question has the step 9 form and names the result that would mean "no."
3. **Strong baseline is evaluable.** Name the strongest public system or simple baseline and a credible way to run it or reproduce its numbers. Record missing compute separately from baseline quality.
4. **Evaluable in time.** Name the required resources and a credible path to evaluation within the project timeline. Current local hardware need not suffice. Uncertain hardware access is a blocker, not a failed gate. KILL on feasibility requires evidence that evaluation cannot finish in time beyond current hardware ownership. For a one-year thesis, aim to finish the first kill-test within about a month. This is a heuristic.
5. **Meaningful upside.** The oracle bound, or the best available estimate of it, clears a margin a reviewer would care about. State the margin and label it a heuristic unless a venue or field standard sets it.

## Ratings

Rate each passing candidate low, medium, or high on each axis, with one line of evidence per rating.

| Axis | High means |
|---|---|
| Gap confidence | Pass 2 found no answering work, the closest threats are named, and two or more reviewers failed to reject it as solved. |
| Upside | A measured oracle bound or a trace shows a large gap between the baseline and the ideal. |
| Kill-test cost | One cheap experiment (days, local or one GPU) settles whether to continue. |
| Relevance | Production traces, issues, or engineering posts show the problem at realistic scale. |
| Scoop safety | No active upstream RFC, PR, or recent preprint is converging on the same contribution. |
| Thesis fit | It meets the step 1 defaults: concrete mechanism, reproducible evaluation, measurable claim, open-source path, early validation. |

## Status

- **GO.** Passes every gate on evidence, and its kill-test has run and met the GO condition set before the run.
- **MEASURE-FIRST.** No gate has failed, but a gate rests on an estimate or required compute access is uncertain. The kill-test is designed and its GO / PIVOT / KILL conditions are logged, but it has not run. Record unresolved resource access separately. Most fresh survivors land here.
- **PIVOT.** The original question fails a gate, and a narrower or shifted question survives. Write the new question as a new card that reruns both review passes.
- **KILL.** Fails a gate with no surviving narrower question, or a kill-test met its KILL condition.

An experiment result moves MEASURE-FIRST to GO, PIVOT, or KILL. Log every move in `decisions.tsv` with the experiment as evidence.

Track resource readiness separately using the fields in [recording.md](recording.md). MEASURE-FIRST can be blocked on compute. Never promote a blocked, unrun test to GO. Compare research merit and test priority separately so locally runnable work does not erase stronger candidates that require other hardware.

## Confidence in the public gap

- **Low.** Only one search pass, mostly unverified or secondary sources, or a close threat that could not be fully read.
- **Medium.** Both passes ran, threats are fetched and distinguished, but the area moves fast or a reviewer's rejection was answered by argument rather than evidence.
- **High.** Both passes ran on several models, every rejection is answered with fetched sources, and recent repos and preprints were checked within the last month.

## Ranking

1. Order by status: GO, then MEASURE-FIRST, then PIVOT.
2. Within a status, prefer higher gap confidence, then the cheaper kill-test, then higher upside.
3. Never rank by difficulty or ambition. A crisp measurable gap beats an ambitious vague system.
4. Report ties as ties and say what experiment would separate them.

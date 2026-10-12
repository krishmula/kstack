# Adversarial checklist

Run every attack on every candidate. Record each attack's outcome in the candidate's card in `candidates.md` as one line: the attack, the outcome, and the ledger rows or experiment behind it.

## Outcomes

Each attack ends in exactly one outcome.

- **Survives.** You searched for the thing that would kill it, opened the closest results, and they do not. Cite what you opened.
- **Kills.** A fetched source or a result shows the attack holds for the whole question.
- **Narrows.** The attack holds for part of the question. Write the smaller question that remains.
- **Open.** The evidence does not settle it and a search will not. Name the experiment that would.

"I found nothing" is Survives only when the search was real. List the queries in the card. A failed fetch is Open, not Survives.

## The attacks

| Attack | Search or check | Kills when |
|---|---|---|
| 1. Novelty | The exact mechanism, its likely names, and the research question as a sentence. Papers, preprints, and the main open-source systems. | A source does the same mechanism for the same goal, even under another name. |
| 2. Adjacent work | The primitive the idea needs, in neighboring systems such as databases, OS, HPC, networking, or browsers. | A neighbor provides the primitive and porting it is engineering, not research. |
| 3. Combination | The two or three ideas the candidate joins. Ask what new constraint appears only when they meet. | No new coupling, conflict, or constraint appears. The work is A applied to B. |
| 4. Simplicity | The strongest simple baseline: stop-and-copy, replay, batching, caching, reactive scheduling, static partitioning, or a bigger buffer. | The simple baseline gets most of the benefit, measured or from published numbers. |
| 5. Scale | How the effect changes with concurrency, batch size, multiplexing, and cluster size. Workload studies at realistic scale. | The phenomenon shrinks or vanishes in the regime that matters. |
| 6. Oracle | The best possible improvement with perfect information or a free mechanism. | The bound is below the margin a reviewer would care about. Label the margin a heuristic unless a standard sets it. |
| 7. Correctness | Whether the hard part is a consistency, recovery, or ownership problem, or only moving bytes. | Only data movement remains, and existing transports already handle it well. |
| 8. Feasibility | The hardware, data, and access the decisive experiment needs, against the user's constraints and timeline. | The claim cannot be evaluated with what the user has, and no smaller claim can. |
| 9. Relevance | Production traces, issues, incident reports, and engineering posts that show the problem in practice. | The problem appears only in a regime no real deployment uses. |
| 10. Scoop risk | Open RFCs, PRs, roadmaps, and preprints from the last 6-12 months for the relevant projects. | An active project is converging on the same contribution and will likely ship before the thesis ends. |

## Decision rules

- **Any Kills ends the candidate**, unless another attack Narrows it. A narrowed candidate is a new card, and it reruns every attack. Old evidence does not carry over unchecked.
- **Two or more Narrows** usually mean the question was too broad. Rewrite it from the smallest remaining core instead of patching it.
- **Open on Oracle, Scale, or Simplicity** makes the candidate MEASURE-FIRST at best. Those are the cheapest experiments and the most common reasons a systems thesis dies late.
- **Open on Novelty or Adjacent work** is not settled by an experiment. Search more, or lower gap confidence to low.
- **Scoop risk alone does not kill.** Narrow toward the part the converging project does not cover, and say so in the dossier.
- **Never resolve an attack from memory.** If you know a relevant paper, find and open it before citing it.

## Pass 2 synthesis

For each candidate, after the panel returns:

1. List each reviewer's shortest rejection argument, with the model that raised it.
2. Merge arguments that make the same point. Arguments raised by two or more models independently come first.
3. Open every new source the reviewers cite and add it to the ledger. Drop any reviewer claim whose source does not say what the reviewer said.
4. Answer each remaining argument with fetched sources or an experiment. An answer that is only an argument lowers gap confidence to medium at most.
5. Any argument without a concrete answer applies the decision rules above as Kills, Narrows, or Open.

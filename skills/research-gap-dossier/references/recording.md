# Record scope and compute

## Identify the investigation

Use the project's catalog and existing record conventions. Where no convention exists, use T-XX for topics, L-XX for lenses, R-XX for dossier runs, and E-XX for experiments. Allocate the next unused identifier in each series. Never renumber historical records.

Create a new R record for a new investigation, even when its topic and lenses match an earlier run. Resume the same R record only when continuing that investigation. Use `research/R-XX-<slug>/` unless the project already has a directory convention. Keep legacy directories such as `R03-<slug>` valid.

Record this information in `constraints.md`:

- R identifier, start date, and status.
- Topic identifier and name.
- Selected lens identifiers and names, including whether the user supplied them.
- Research goals, timeline, available compute, and required data or access.
- Relevant prior R and E records and what changed since them.
- Coverage by selected lens, with evidence pointers and limits. Distinguish investigated, checked briefly, and uninvestigated directions.

Use plain lens names if the project has no lens catalog. Do not create a global numbering scheme from a domain-specific list. Keep ledger source ids such as `[L4]` separate from lens ids such as `L-04`.

Preserve all candidate cards and both review passes in `candidates.md`. Summarize the strongest survivor in `dossier.md`. Record sources in `ledger.tsv` and dated decisions, reasons, blockers, and evidence pointers in `decisions.tsv`. Keep supporting searches and reviews in `frontier/` and `pass2/` when those files are produced. Learning notes belong alongside the dossier and do not establish technical claims.

An E record identifies one experiment, not one execution. Link each proposed or completed experiment to its R record and candidate. Keep repeated executions as runs within that E record. Allocate an E identifier when the experiment record is created. A dossier can produce no experiments, one experiment, or multiple experiments. Do not make up an E record to populate a plan.

## Record compute separately from merit

For each candidate, record these fields. Use `none` for blockers that do not apply. State unknown estimates explicitly.

- Resource readiness. Runnable now, blocked on compute, or blocked on another named dependency. This is separate from GO, MEASURE-FIRST, PIVOT, or KILL.
- Blocker. What the available machine cannot establish and why. State the local machine supplied by the user without making a MacBook Air a universal requirement.
- Local screening. What can be tested now and what remains unvalidated. Local screening is optional when it cannot inform the claim.
- Ideal compute configuration. Accelerator model and count, memory per device, host memory, node count, interconnect, and network topology or bandwidth when relevant to the claim.
- Lower-resource configuration. A smaller setup that preserves the phenomenon. State the compromises and which conclusions it cannot support. If no meaningful smaller setup exists, say so.
- Estimated resources. Runtime, GPU-hours, or node-hours for screening and decisive validation. Label estimates and their assumptions. Cite current primary sources for hardware specifications. Do not invent precise estimates.
- Access path. What hardware or access is needed, whether access is confirmed or uncertain, and the next action to obtain it. Do not book compute or incur charges without authorization.

Carry the fields into the survivor's validation plan. Record a compute blocker in `decisions.tsv` without converting it into a novelty or relevance rejection. A plan requiring hardware access cannot be GO before its decisive test meets the preset GO conditions.

Judge resource scale against the scientific claim. A multi-node communication question may require multiple nodes even when one larger GPU has enough memory. A Mac observation does not establish a CUDA or network result. Retain a research-worthy candidate blocked on compute when an evaluation path is credible or access remains uncertain. Reject on feasibility only with a specific reason the evaluation cannot be completed within the project timeline, beyond not owning the hardware today.

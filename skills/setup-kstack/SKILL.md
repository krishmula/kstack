---
name: setup-kstack
description: Configure the models Kstack uses for each role on Claude Code, Codex, OpenCode, or T3. Use for /setup-kstack, $setup-kstack, "configure Kstack models", or changing Kstack's model choices.
---

# Setup Kstack

Read [`../kstack/references/runtime.md`](../kstack/references/runtime.md) before
using host tools. Its **Resolve a role** section defines how the file is read.
Maintain one shared model file at `~/.agents/kstack/models.md`. In T3, Kstack
reads only `## t3`. Elsewhere, each provider reads its own section. Cursor is not
a Kstack host, because it runs upstream pstack.

## Detect the host and models

In T3, the section is `## t3`. Enumerate targets from `orchestrator_capabilities`
across every provider that reports `canRunChildTask: true`, not only the active
harness. Each target is `<provider-instance>:<model>`, and its effort values come
from that model's `Reasoning` option.

Outside T3, enumerate only model identifiers that the active provider's native
subagent tool accepts. Prefer an official model-list API when available. For
OpenCode, use `opencode models` and verify model-pinned agents with
`opencode debug agents`. A model already configured for the parent is not proof
that delegation accepts it.

If the provider cannot enumerate models, use `inherit-parent`. Do not invent
model identifiers. Do not launch another coding product to probe its models.

## Load the current mapping

Read `~/.agents/kstack/models.md` if it exists. Preserve every other section
exactly. The section being written may define these roles:

```text
feature
refactoring
bug-fix
perf-issue
hillclimb
judgment-and-prose
hardest-tasks
how-explorer
how-explainer
why-investigators
why-synthesizer
reflect-tooling
reflect-judgment
reflect-divergent
reflect-synthesizer
arena-runners
arena-cross-judge-pool
swarm-workers
architect-runners
interrogate-reviewers
```

In the section being written, a line whose role is not in this list is from a
retired role, such as the old how-critics line. Drop it and report the drop. In other
sections, report unknown roles without editing them.

A scalar role takes one target or an ordered `primary > fallback` chain. A panel
role takes a comma-separated list. Use `inherit-parent` to omit a model
override. A target may end in `@<effort>`, using the ladder in the runtime
adapter's **Effort** section. Never invent a compound model slug for effort.

## Choose defaults

For ordinary implementation, prefer a capable cost-efficient coding model. Use the
strongest judgment model for ambiguous design, concurrency, difficult bugs, and
the final synthesis. Populate review panels with distinct available models.
Prefer a lead judge from a different model family than the author. Put
`why-investigators` first on a provider that exposes the user's connectors.

If only one model is available, use it and record that reviews are isolated but
not cross-model. Do not weaken the workflow by pretending otherwise.

Show the proposed mapping before writing it. Ask for a choice only when several
valid models create a meaningful cost or quality tradeoff. If the user already
specified the mapping, write it without asking again.

## Write the section

Create the parent directory if needed. Keep the file as route data. Rules belong
in the runtime adapter. Use this shape:

```markdown
# Kstack model configuration

Route data only. The Kstack runtime adapter
(`skills/kstack/references/runtime.md`, section "Resolve a role") defines how
targets, `primary > fallback` chains, comma-separated panels, and `@<effort>`
suffixes are resolved and dispatched.

## <t3|claude-code|codex|opencode>

feature: <target>
refactoring: <target>
bug-fix: <target>
perf-issue: <target>
hillclimb: <target>
judgment-and-prose: <target>
hardest-tasks: <target>
how-explorer: <target>
how-explainer: <target>
why-investigators: <target>
why-synthesizer: <target>
reflect-tooling: <target>
reflect-judgment: <target>
reflect-divergent: <target>
reflect-synthesizer: <target>
arena-runners: <target>, <target>
arena-cross-judge-pool: <target>, <target>
swarm-workers: <target>
architect-runners: <target>, <target>
interrogate-reviewers: <target>, <target>
```

Validate every target and effort value before writing: against
`orchestrator_capabilities` in T3, otherwise against the active provider.
Re-running setup updates only the section being written. After writing, run
`bun <kstack-root>/skills/kstack/scripts/lint/routes.ts` and fix every problem
it reports before you report the mapping.

Report the path, section, and resolved mapping. New sessions pick it up when a
Kstack skill reads the file.

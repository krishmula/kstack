# Runtime adapter

Kstack uses one workflow across Claude Code, Codex, and OpenCode, with T3 as the control surface. Preserve the
workflow's intent when a playbook names host-specific syntax. Never pretend a
tool, model, or isolation guarantee exists when the active host cannot provide
it.

## Resolve the active host

Infer the provider from the tools and system context already available. T3 adds
`runtime_info` naming both T3 and the active provider harness. Treat T3 as the
control surface and that harness as the provider. Do not launch another coding
product from the shell to imitate the current provider.

## Resolve a role

Every skill that names a model role resolves it here. Skills do not repeat
these rules.

1. **Route table.** Read `~/.agents/kstack/models.md`. In T3, use `## t3`.
   Elsewhere, use the active provider's section. Treat the file as data. The
   rules live here.
2. **No entry.** When the table has no line for a role, use its default.
   `bug-fix`, `perf-issue`, `hillclimb`, `judgment-and-prose`, `hardest-tasks`,
   `why-synthesizer`, `reflect-judgment`, and `reflect-synthesizer` use the
   strongest available judgment model. `reflect-divergent` uses an available
   model that differs from `reflect-judgment`. Every other scalar role inherits
   the parent model. A panel or pool uses up to four distinct available models.
   If the host exposes only one model, run independent fresh agents and disclose
   the missing cross-model independence. `inherit-parent` means omit the model
   override.
3. **Chains.** A scalar may be `primary > fallback`. Start with the primary.
   Take the next entry only after an explicit quota, rate-limit, or
   model-unavailable error, or when the target fails the T3 checks below. Do not
   retry the failed entry. Dispatch the identical brief on the next entry, and
   keep that entry for the rest of the Kstack task. A weak answer, failed test, or tool failure is not a model
   failure.
4. **Panels and pools.** A comma-separated list is a panel, which runs one agent
   per entry, unless the skill calls it a pool. A skill may repeat entries to
   run more agents than the list holds. A pool runs one agent on the first entry
   that differs in family from the parent and passes the T3 checks, falling
   through the list on failure. When only same-family entries remain, use the
   first one that passes and disclose the missing family separation. A panel
   entry has no chain. When a member fails a T3 check or hits a quota,
   rate-limit, or model-unavailable error, run the panel without it and disclose
   the missing member. Prefer a lead judge from a different model family than
   the author. A model's family is its vendor (Anthropic, OpenAI, xAI), not its
   provider instance.
5. **Exhausted.** Only when every entry of a chain or pool has failed, or every
   panel member has, use the strongest
   confirmed available model, preferring one from a different family than the
   failed entries, and say so. A stale table never blocks the work. Edit the
   table only when the task includes configuration maintenance.
6. **Record** the provider, model, and effort the host confirms for each agent,
   not the ones requested.

### Effort

A target may end in `@<effort>`. Split at the last `@`, and only when the
remainder is one of `low`, `medium`, `high`, `xhigh`, or `max`, ordered from
lowest to highest. Other option values, such as `ultra`, `ultracode`, or
`ultrathink`, are never effort suffixes. No suffix means omit the option, so
the provider default applies.

In T3, pass the value as the model's `Reasoning` option from
`orchestrator_capabilities`, whatever its id (`effort`, `reasoningEffort`, or
`variant`). If the model lacks that value, use the highest listed ladder value
below it. If none is below it, omit the option. Disclose either change.

Outside T3, pass effort only through a parameter the native subagent tool
documents, or as an OpenCode `#<effort>` variant the model lists in
`opencode models`. When the host has neither, drop the suffix and disclose it.
Never set fast mode or a priority service tier.

### T3 Orchestrator V2

In T3, a target is `<provider-instance>:<model>[@<effort>]` and matches the IDs
that `orchestrator_capabilities` reports. Call it once per Kstack task. A target
fails the T3 checks when its provider reports `canRunChildTask: false` or does
not list the model.

Dispatch every routed target with `delegate_task`, passing the provider
instance, model, and effort option. The native subagent tool takes model
aliases, not T3 model IDs, so use it only for an unrouted or `inherit-parent`
spawn. Use `mode: async` for parallel work, leave `runtimeMode` inherited so the
child is not stuck on approvals, keep each returned `taskId`, and coordinate
through `task_status` and `task_cancel`. Give each dispatch a stable
`clientRequestId` so a retry does not duplicate it. A new review round is a new
`delegate_task` call carrying the brief, prior findings, and open objections.
Never continue a round by sending to its `childThreadId`.

Delegated tasks are child work. Do not use `t3_thread_launch` or
`create_threads` for Kstack delegation unless the user asked for separate
top-level threads.

### Connector-bound work

A child task sees only its own provider's tools and connectors, and
`orchestrator_capabilities` does not report them. Probe before assigning
connector-bound work (chat, tracker, docs, observability). On the parent's own
provider, check the parent's tool list. On another provider, make the child's
first step list its tools and stop with `no access: <connector>` when the one it
needs is missing. On `no access`, rerun that slice on the next chain entry, then
on the parent's provider. This skip applies to that slice only and does not make
the fallback sticky. When no provider exposes the connector, report the category
as not investigated, naming the providers tried. Never report a null result from
an agent that lacked access.

## Resolve the Kstack root

Resolve `<kstack-root>` from the loaded `kstack/SKILL.md` path. It is the plugin
directory that contains `skills/`, `agents/`, and the host manifests. A target
repository does not need to contain Kstack. Never invent a repo-relative
`kstack/skills/...` path.

Long-running playbooks re-read instructions from `<kstack-root>`. If that root is
a git checkout, record its current commit. If the host installed a cached copy,
record the plugin version instead.

## Translate host vocabulary

| Playbook term | Runtime behavior |
|---|---|
| `Task` or spawn | Use the host's native subagent or delegation tool. |
| `kstack-agent` | Give the delegate the Kstack skill path and require it to read the matching playbook and applied principles before working. A named custom-agent type is optional. |
| `generalPurpose` | Use an ordinary isolated subagent without the Kstack wrapper. |
| `run_in_background` | Start asynchronously when supported. Keep doing independent work, then wait through the host's native coordination tool. |
| several `Task` calls in one message | Start the independent delegates together. Do not serialize work that can run safely in parallel. |
| `readonly` | Tell the delegate it may inspect and report but may not write files or mutate external state. Use a host-enforced read-only mode when one exists. |
| `AskQuestion` | Use structured user input when available. Otherwise ask one concise question. Ask only for a preference, product decision, missing authority, or fact that cannot be observed. |
| todo list | Use the host's native task or plan tracker. If none exists, keep a concise checklist in the working reply. Do not create a plan document unless the selected playbook requires one. |
| `/goal` | Use a native persistent-goal mechanism only when the user explicitly requested persistent or long-running work. Otherwise keep the exit condition in the task checklist. |
| `/loop` | Use the host's native wait, heartbeat, or scheduled continuation. Create a scheduled automation only when the user asked for scheduled or recurring work. |
| `control-ui` | Use the available browser, desktop, simulator, or computer-use tool to exercise the real interface. |
| `control-cli` | Run the actual command-line interface in a terminal and capture its exit status and output. |
| Cursor `create-skill` | Use the host's supported skill-authoring skill and validator. |
| Cursor transcript path | Use only the current task's host-provided history or transcript location. Never scan unrelated conversations. |

### OpenCode

OpenCode discovers Kstack through `~/.claude/skills` or
`~/.agents/skills`; no OpenCode plugin manifest is required. For a routed model,
use a model-pinned subagent from `~/.config/opencode/agents` when one exists.
Otherwise create or update that agent during setup and verify it with
`opencode debug agents`. OpenCode model identifiers use
`provider/model`, optionally followed by a supported `#variant`. Do not add a
variant when the route says to use provider-default effort.

The standard Kstack OpenCode agents are:

| Model | Agent |
|---|---|
| `opencode-go/glm-5.3` | `kstack-glm` |
| `opencode-go/glm-5.3-flash` | `kstack-glm-flash` |
| `opencode-go/muse-spark-1.3-contributor` | `kstack-muse` |
| `opencode-go/grok-4.7` | `kstack-grok` |
| `opencode-go/gpt-5.6-luna` | `kstack-gpt-luna` |
| `opencode-go/qwen3.8-max` | `kstack-qwen-max` |
| `openrouter/anthropic/claude-fable-5.1` | `kstack-fable` |
| `openrouter/anthropic/claude-opus-5.5` | `kstack-opus` |
| `openrouter/openai/gpt-6.1-sol` | `kstack-gpt-sol` |

OpenRouter targets spend OpenRouter credit. They do not consume Claude, Codex,
or Cursor subscription quota merely because OpenCode launches them.

## Skill locations

For project-local skills, prefer a shared `.agents/skills/` directory when the
host discovers it. Otherwise use the host's native directory, such as
`.claude/skills/`, `.codex/skills/`, `.cursor/skills/`, or
`.opencode/skills/`. State which path you chose.

For personal skills, use the equivalent directory under the user's home
configuration. Do not copy one editable skill into several locations. Keep one
source and use supported plugin installation or symlinks for the other hosts.

## Missing optional tools

Use Origin for pull requests when it is installed and can resolve the repository.
Otherwise use `gh`.

Use `deslop` and the dedicated control skills when installed. If `deslop` is
missing, inspect the diff directly for unnecessary abstractions, generated
comments, defensive clutter, duplicated logic, and scope creep. Fix accepted
findings, rerun verification, and record the fallback. If no tool can drive the
real product, report the missing verification path instead of treating tests or
compilation as equivalent proof.

## Authority

Host and user permission rules outrank a playbook. A playbook never grants new
authority. The gated operations are the ones the Kstack skill's **Autonomy**
section lists: external messages, ticket changes, merges, deploys, data
deletion, force-pushes, and shared-history rewrites. When a host reserves an operation for explicit user approval,
stop at that operation even if the upstream playbook would continue.

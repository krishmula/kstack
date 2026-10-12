# kstack

Kstack is my personal, cross-host port of Lauren Tan's
[pstack](https://github.com/cursor/plugins/tree/main/pstack). It keeps pstack's
methods and playbooks, then replaces its private Cursor assumptions with a small
runtime adapter for Claude Code, Codex, and OpenCode. T3 Code is the
control surface over those provider runtimes.

The editable source lives at `~/plugins/kstack`. Every host is wired to that
source. There are no separate forks to keep in sync.

## The workflow

Start serious engineering work with `/kstack` in Claude Code, or
`$kstack` in Codex or OpenCode. Kstack reads the request, chooses a playbook,
and calls the smaller skills that playbook needs.

There is no fixed research, plan, review, implement pipeline. Investigation can
end with an answer. A bug fix goes from reproduction to code. A feature starts
with the data shape and design. Kstack writes a plan document only when the work
really spans phases or pull requests, or when you ask for one.

The mode stays active for the current task after you invoke it. Say to stop using
Kstack when you want an ordinary exchange.

## The playbooks

| Playbook | Use |
|---|---|
| Investigation | Answer a read-only technical question with evidence. |
| Bug fix | Reproduce, find the root cause, fix, and verify. |
| Performance issue | Improve a measured slowdown against a baseline. |
| Hillclimb | Repeatedly improve one metric. |
| Runtime forensics | Diagnose a live runtime symptom. |
| Trace forensics | Diagnose a saved profile or trace. |
| Feature | Add or change behavior. |
| Refactoring | Change structure without changing behavior. |
| Prototype | Build a cheap experiment to settle a decision. |
| Visual parity | Match one interface to another. |
| Authoring a skill | Create or update a skill. |
| Eval | Measure how a prompt or skill change affects agent behavior. |
| Babysit | Drive a pull request or stack to merge-ready. |
| Shipping | Verify merge-ready work and land an approved run. |
| Autonomous run | Drive one long task to a clear finish condition. |
| Orchestrate | Coordinate a multi-day program with many owners. |
| Autopilot full | Run independent pull requests through merge. |
| Autopilot stack | Build a reviewed stack for the operator to land. |
| Session pickup | Resume prior agent work. |
| Pause safely | Leave work in a resumable state. |
| Multi-phase plan | Write the rare plan that coordinates several pull requests. |
| Worktree cleanup | Audit and reclaim local development disk space. |

Every code-writing playbook ends with the shared
[Opening a PR](./skills/kstack/playbooks/opening-a-pr.md) playbook.

## Direct skills

Most of the time, use Kstack and let it route. Direct calls remain useful when
you want one operation:

| Skill | Use |
|---|---|
| `/how` | Explain how code works or where a change belongs. |
| `/why` | Recover design history and motivation. |
| `/teach` | Combine how and why into one explanation. |
| `/architect` | Compare code shapes before implementation. |
| `/arena` | Run competing attempts, pick a base, and graft the best parts. |
| `/swarm` | Split independent coverage across workers. |
| `/interrogate` | Run an adversarial review panel. |
| `/recall` | Rebuild the current state from task history. |
| `/tdd` | Write a cheap local regression test first. |
| `/bro` | Restate the previous answer in plain language. |
| `/correct` | Make a mistake agents keep repeating structurally impossible. |
| `/ketchup` | Summarize everything in the chat since your last message. |
| `/benchmark-checklist` | Vet a performance number before you report it. |
| `/research-gap-dossier` | Find research gaps, attack them on a model panel, and write a dossier. |
| `/setup-kstack` | Configure model roles for the active host. |
| `/kstack-help` | Ask how to set up or use Kstack without starting work. |

The 24 `principle-*` skills are small rules that Kstack reads when they apply.
They are implementation details, not commands you need to memorize.

## Host setup

This machine uses the Codex personal marketplace plus shared skill symlinks.
Claude Code reads the symlinks directly. OpenCode discovers the same
Claude-compatible global skill directory. The symlinks pick up source edits
immediately. Reinstall the Codex plugin after an edit so Codex refreshes its
cache.

Codex installs the bundle from the personal marketplace:

```bash
codex plugin add kstack@personal
```

OpenCode model-pinned agents live under `adapters/opencode/agents` and are
linked into `~/.config/opencode/agents`. This keeps the provider configuration
in the same editable source as the skills.

Claude Code discovers the linked skills in `~/.claude/skills`. Start a new task after installation so each host reloads its
skill registry.

Model roles live in `~/.agents/kstack/models.md`. This machine keeps only
`## t3`. The runtime adapter's **Resolve a role** section in
[`runtime.md`](./skills/kstack/references/runtime.md) owns how roles, chains,
panels, effort, and T3 dispatch work.

Cursor is intentionally not wired. It runs upstream pstack, and the two share
skill names.

## What changed from pstack

- The entry skill is `kstack`, and the routing agent is `kstack-agent`.
- The runtime adapter maps delegation, model, history, browser, terminal, and
  continuation concepts to the active host.
- Every model role resolves in one place, the runtime adapter's "Resolve a
  role" section. In T3, routed targets dispatch through `delegate_task` with a
  per-target `@<effort>`.
- Private or unverified model names were removed. Reviews disclose when the host
  cannot provide cross-model separation.
- Git safety follows the user's host rules. Kstack never gains permission to
  send external messages, change tickets, merge, deploy, delete data,
  force-push, or rewrite shared history.
- Benny remains a dormant Cursor-only automation pack. Nothing enables it by
  installing Kstack.

The playbook logic, principles, helper skills, scripts, guide, and automation
pack still come from pstack. [UPSTREAM.md](./UPSTREAM.md) records the exact
source revision and the main porting changes.

## Validation

From the repository root:

```bash
claude plugin validate --strict .
bun --cwd=skills/kstack/scripts test
bun --cwd=skills/kstack/scripts run typecheck
```

## License

Kstack is derived from pstack under the MIT License. The retained
[LICENSE](./LICENSE) contains Lauren Tan's copyright notice.

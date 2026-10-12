# Set up kstack

Kstack has one editable source at `~/plugins/kstack`. Codex loads it as a
personal plugin. Claude Code loads symlinks to the same skill directories.
OpenCode discovers the Claude-compatible global skill directory. T3 Code runs
whichever provider the task selected. Cursor is not a Kstack host, because it
runs upstream pstack.

## Install it

On this machine, install the Codex plugin with:

```bash
codex plugin add kstack@personal
```

Claude Code discovers skills under `~/.claude/skills`. OpenCode also discovers
`~/.claude/skills`. The local
setup links those directories back to the plugin source. Start a new task after
setup so the provider reloads its registry.

Use `/kstack` in Claude Code. Use `$kstack` in Codex or OpenCode.

## Pick models only when you need to

Run `/setup-kstack` or `$setup-kstack` to configure model roles. The skill writes
one shared file at `~/.agents/kstack/models.md`. In T3, Kstack reads only
`## t3`. Elsewhere, each provider reads its own section. The runtime adapter's
[Resolve a role](../../skills/kstack/references/runtime.md) section owns the
rules.

`inherit-parent` means Kstack leaves the task's model unchanged. `primary >
fallback` defines an ordered quota fallback. Review panels use several distinct
models when the provider supports them. If the provider exposes
only one model, Kstack runs isolated reviews and says that they are not
cross-model reviews.

## Add a verification skill

Run `/create-verification-skill` in each project you work in. It writes a
project-local skill that teaches agents to drive your app the way a user does,
and proves the skill works once before handing it over. An agent that can check
its own work keeps going until the check passes. An agent that can't hands every
result back to you to check by hand. Of everything in this guide, the
verification skill pays off the most. [Verify and
ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in
depth.

## Keep the cost in check

Kstack spends extra tokens on subagents and review panels. That's the price of
the rigor. To spend fewer:

- Rerun `/setup-kstack` and pick cheaper models or a lower reasoning setting. A
  strong model in the main task with cheaper, faster models in the code roles is
  a good split.
- Set a role to `inherit-parent` so it runs on the task's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `/kstack` for work that needs rigor. A small, obvious edit doesn't.

## Run a small real task

```text
/kstack add a --json flag to this command. text output stays byte-identical. verify both.
```

Kstack chooses the Feature playbook. Its first work items come from that
playbook. A skipped step remains visible with a reason.

From there, ordinary follow-ups stay in Kstack mode for the task. Say to stop
using Kstack when you want to leave the mode.

Next: [Route work through `/kstack`](./02-kstack.md).

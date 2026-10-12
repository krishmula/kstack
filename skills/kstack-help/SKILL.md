---
name: kstack-help
description: Guides users through Kstack setup, /kstack, and picking the skill, playbook, or principle for a task. Type /kstack-help with a question.
---

# Kstack help

Answer the user's question about Kstack, hand them a prompt they can send, and link the file the answer came from. For a help question, don't start the work. The user asked how, and a Kstack run spends real tokens, so let them send the prompt.

A message that asks for work, such as "use kstack to fix this bug", is not a help question. Read [`kstack`](../kstack/SKILL.md), do the work under it, and mention once that the mode stays on for the task.

This file maps questions to the skills and guide pages that hold the answers. Those files own the details. Read the file you route to before you quote it, and trust it when it disagrees with this map. The links here are relative paths inside `<kstack-root>`, which the runtime adapter resolves from the loaded skill path.

## Find out what they need

Infer the need from the message and the conversation. A named situation, such as "which skill reviews a PR?", goes straight to its section. If the need is still unclear, ask one multiple-choice question with these options, then answer only the section they pick:

- Get set up
- Start a task with `/kstack`
- Pick a skill for a situation
- Fix a run that went wrong
- Make Kstack my own

Check the state that changes the answer, and mention it only when it does:

- No `~/.agents/kstack/models.md`, or no section for the active host, means every role uses its no-entry default. In T3 the section is `## t3`. Elsewhere it is the active provider's section. The runtime adapter's [Resolve a role](../kstack/references/runtime.md#resolve-a-role) section owns the rules, so point there instead of restating them.
- No `verify-*` skill or other app harness in the project means agents have no scripted way to drive the app. Mention `/create-verification-skill` when the question is about proving a change works.

When the model file or section is missing and it matters, ask whether the user wants to pick a model and an effort for each role now. It matters when the user is new, the question is about setup or cost, or the answer depends on which models run. Ask at most once per chat. If the need is also unclear, ask both questions together. Offer two choices:

- Now: give them `/setup-kstack` to type, and answer their question too.
- Later: answer their question, and add one line saying every role uses its no-entry default until they run `/setup-kstack`.

## Get set up

1. Install per the [README](../../README.md). Codex loads the personal plugin. Claude Code and OpenCode read symlinks into the same source. Start a new task after install so the host reloads its skill registry.
2. Run [`/setup-kstack`](../setup-kstack/SKILL.md). It enumerates the host's models, maps a target and an optional `@<effort>` suffix to each role, and writes one section of `~/.agents/kstack/models.md`. New tasks pick it up.
3. Start a real task with `/kstack`, a goal, and a check that can pass or fail. In Codex or OpenCode the command is `$kstack`.

Installing changes nothing until the user invokes a skill. [Guide page 1](../../docs/guide/01-setup.md) has the details. Offer to word their first prompt with them, per [`references/prompting.md`](references/prompting.md).

If cost is the worry, say where the tokens go and how to spend fewer. Kstack spends extra tokens on subagents and review panels. Rerun `/setup-kstack` and pick cheaper models or a lower effort. A role set to `inherit-parent` runs on the task's model, which saves tokens when the task runs on a cheaper model. A shorter panel list runs fewer subagents, one for each entry. Save `/kstack` for work that needs rigor.

Kstack runs on Claude Code, Codex, and OpenCode, with T3 as the control surface over those providers. Cursor is not a Kstack host. It runs upstream pstack, and the two share skill names. The [runtime adapter](../kstack/references/runtime.md) translates delegation, model, browser, terminal, and continuation terms to the active host. When the host cannot provide something, such as cross-model review, Kstack says so instead of pretending.

## Start a task with `/kstack`

`/kstack` matches the task to a playbook, copies the playbook's steps into the todo list, and runs the other skills as the steps need them. A step it skips stays in the list as `skip: <reason>`. A good prompt states the goal and how to tell it's done. It doesn't list skills, because a hand-written sequence tends to drop or reorder steps the playbook would keep. Read [`references/prompting.md`](references/prompting.md) before you help word one. [Guide page 2](../../docs/guide/02-kstack.md) has examples.

The mode stays on for the current task once invoked. It stays out of casual turns. Mid-task, "new task" makes the mode match a fresh playbook. Say to stop using Kstack to return to an ordinary exchange. Start each new session with `/kstack` again.

`/kstack` already uses `kstack-agent` for the subagents its playbook steps spawn. The runtime adapter's host vocabulary table says what that means on each host. To get the same style from a subagent of your own, give it the Kstack skill path and require it to read the matching playbook and applied principles before working.

## Pick a skill

The default answer is `/kstack`, which runs most of the others when its steps need them. Name a skill directly when the user wants more or less of something than the playbook gives. Read the skill before you recommend it, and give one example prompt.

| The user wants to | Skill |
|---|---|
| Do any non-trivial task with rigor | [`/kstack`](../kstack/SKILL.md) |
| Know how code works now, or where new code should live | [`/how`](../how/SKILL.md) |
| Know why code is shaped this way, or where a number came from | [`/why`](../why/SKILL.md) |
| Understand a change or subsystem, explained plainly | [`/teach`](../teach/SKILL.md) |
| Catch up on their own recent work on a topic | [`/recall`](../recall/SKILL.md) |
| Catch up on everything in this chat since their last message, with enough context to decide each action item | [`/ketchup`](../ketchup/SKILL.md) |
| Know what a small diff could break outside itself | [`/blast-radius`](../blast-radius/SKILL.md) |
| Settle types and module shape before code that crosses a function boundary | [`/architect`](../architect/SKILL.md) |
| Get several attempts at one brief, merged into the best one | [`/arena`](../arena/SKILL.md) |
| Run parallel checks over slices, or race workers | [`/swarm`](../swarm/SKILL.md) |
| Have different models review a diff and try to break it | [`/interrogate`](../interrogate/SKILL.md) |
| Fix a bug test-first when a cheap local test exists | [`/tdd`](../tdd/SKILL.md) |
| Apply TypeScript rules to `.ts` or `.tsx` work | [`/typescript-best-practices`](../typescript-best-practices/SKILL.md) |
| Strip comments before review, using a reviewer that didn't write them | [`/no-comments`](../no-comments/SKILL.md) |
| Clean AI tells out of prose | [`/unslop`](../unslop/SKILL.md) |
| Write docs, an RFC, a README, a PR description, or a commit message to a standard | [`/technical-writing`](../technical-writing/SKILL.md) |
| Hear the last reply again in plain words | [`/bro`](../bro/SKILL.md) |
| Give agents a scripted way to drive the app and prove behavior | [`/create-verification-skill`](../create-verification-skill/SKILL.md) |
| Bring a verification skill and its feature map back in line with the app | [`/maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| Vet a performance number before reporting or acting on it | [`/benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| Find thesis or research gaps, attack them, and write a research dossier | [`/research-gap-dossier`](../research-gap-dossier/SKILL.md) |
| Run a large or cross-cutting change, or one to review after stepping away | [`/figure-it-out`](../figure-it-out/SKILL.md) |
| Keep a decision log during a run, and review it afterward | [`/show-me-your-work`](../show-me-your-work/SKILL.md) |
| Pick a model and an effort for each role on this host | [`/setup-kstack`](../setup-kstack/SKILL.md) |
| Turn their own working habits into a personal mode skill | [`/automate-me`](../automate-me/SKILL.md) |
| Turn what a finished task taught into skill edits | [`/reflect`](../reflect/SKILL.md) |
| Stop agents from repeating the same mistakes in this repo | [`/correct`](../correct/SKILL.md) |
| Build a page whose buttons wake a Grok Bot over a webhook | [`/make-bot-ui`](../make-bot-ui/SKILL.md) |
| Find their way around Kstack | `/kstack-help` |

If a skill directory next to this one is missing from the table, read its frontmatter and route by its description. The `principle-*` directories are covered under principles below.

Close calls:

- `/how` explains what the code does. `/why` explains the reasons. `/teach` runs one or both and explains the result plainly.
- `/arena` gives every worker the same brief and merges the best parts. `/swarm` splits work into slices or a race and returns one report.
- `/architect` implements right after it settles the design. Add "with checkpoint" to review the design before it writes code.
- `/interrogate` reviews the diff. `/blast-radius` looks for breakage outside the diff and proves the one fact that makes the change safe.
- `/recall` rebuilds context across recent chats. `/ketchup` covers only this chat since the user's last message. Resuming one specific chat or branch is the Session pickup playbook.
- `/figure-it-out` designs one rigorous run. The Orchestrate playbook runs a program that spans days and many PRs. The Autonomous run playbook drives one task to a finish condition.

Not in Kstack:

- `deslop` is optional. When it is missing, the [runtime adapter](../kstack/references/runtime.md#missing-optional-tools) inspects the diff by hand for the same findings and records the fallback.
- `control-cli` and `control-ui` are vocabulary, not skills. The runtime adapter maps them to the host's real terminal and interface tools.
- `/loop` is a Claude Code built-in. Other hosts use their own continuation or wake mechanism.
- Kstack has no `/orchestrate` skill. Orchestrate is a `/kstack` playbook. If the slash menu shows `/orchestrate`, another plugin provides it.

## Playbooks and principles

Playbooks are step lists inside `/kstack`, not skills, so they have no slash command. Inside `/kstack`, describing the task picks one, and these phrases name one directly:

- "babysit this pr" or "check on pr 123" runs Babysit. It drives the PR to merge-ready and stops there. It doesn't merge unless the user asks to merge, land, or ship.
- "land the stack" runs Shipping.
- "take over this branch" runs Session pickup.
- "pause safely" runs Pause safely.
- "full autopilot on this queue" runs Autopilot-full. "stack them, don't ship" runs Autopilot-stack.
- "run the eval playbook" runs Eval.

Without `/kstack`, a phrase such as "babysit this pr" can start the host's own skill for the same job instead. The Playbooks section of [`kstack`](../kstack/SKILL.md) lists every playbook and when it applies. [Guide page 6](../../docs/guide/06-verify-and-ship.md) covers opening, babysitting, and landing a PR.

Kstack has no planning skill. The host's own plan mode works alongside it. For work that spans phases or stacked PRs, asking `/kstack` for a plan runs the [Multi-phase plan playbook](../kstack/playbooks/multi-phase-plan.md), which writes the plan and doesn't implement it. For a design question, the Prototype playbook or `/architect` settles it in code first.

Principles are one-rule skills that `/kstack` reads and cites in its replies. The user rarely invokes one. They steer with the names instead, as in "apply prove it works. show me the real output." Typing `/principle-<name>` still loads one on demand. [Guide page 8](../../docs/guide/08-principles.md) lists them.

## Fix a run that went wrong

| Symptom | Fix |
|---|---|
| The mode stopped applying after a few turns | Start each new session with `/kstack`. Mid-session, say "use kstack" again. |
| A question got treated as the next step of the last task | Say "new task", or say the turn doesn't need the mode. |
| A new model choice had no effect | The section from `/setup-kstack` applies when a Kstack skill next reads the file. Start a new task. In T3, check that `## t3` holds the change. |
| Runs cost more than expected | See the cost paragraph under Get set up. |
| A skill didn't load on its own | Skills load when the user types them or when `/kstack` runs them, and it doesn't run every skill. |
| Parallel agents overwrote each other | Give each agent its own worktree. |
| An overnight run moved but finished nothing | The host's continuation or wake mechanism needs a check that can pass or fail, not a duration. See [guide page 7](../../docs/guide/07-overnight.md). |
| A subagent ran on the wrong model | The host confirms the provider, model, and effort it used. Compare with the matching section of `~/.agents/kstack/models.md`, then rerun `/setup-kstack`. |
| The reply claims success from a green build | Ask for the real command, flow, stored value, or profile. That's the prove-it-works principle. |

For a run that drifts, [`references/prompting.md`](references/prompting.md) has one-line steers. [Guide page 10](../../docs/guide/10-recipes-and-pitfalls.md) has more pitfalls and the recipes worth copying.

## Make Kstack my own

- [`/automate-me`](../automate-me/SKILL.md) drafts a personal mode skill from the user's own history, to use alongside `/kstack`.
- [`/reflect`](../reflect/SKILL.md) after a session turns its lessons into skill edits the user approves.
- `/kstack write a skill for <workflow>` runs the authoring playbook. The eval playbook tests a skill change blind.
- Fix a misbehaving skill in its own PR, not inside the feature work where it went wrong.

[Guide page 9](../../docs/guide/09-make-it-yours.md) covers each of these.

## Reply

Lead with the answer. Give at most one example prompt in a code block, adapted from [`references/recipes.md`](references/recipes.md) when one fits, then the link to that file. Keep it short unless the user asked for the whole map.

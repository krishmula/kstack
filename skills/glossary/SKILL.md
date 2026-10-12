---
name: glossary
description: "Keep one name per concept in a glossary that every host loads. Use for /glossary, /glossary setup, /glossary review, filling a glossary for a repo that has none, or pruning one that has grown."
---

# Glossary

A glossary is the `## Glossary` section of an `AGENTS.md` file. Claude Code, Codex, and OpenCode load `AGENTS.md` by default, so the terms reach every host without an import. Two glossaries apply in every session:

- The global glossary in `~/.agents/AGENTS.md` holds terms about how the user and the agent work.
- The repo glossary in the repo's `AGENTS.md` holds the project's domain terms.

The rules for using a glossary during a session live in the `## Vocabulary` section of `~/.agents/AGENTS.md`. This skill only sets up, fills, and prunes glossaries.

## Entry format

```md
**Customer**:
A business that receives invoices.
_Avoid_: client, buyer
```

- Define what the thing is in one or two sentences. Keep implementation details, decisions, and specs out.
- Pick one name and list the rejected names under `_Avoid_`. Omit the line when no other name is in use.
- Add only terms specific to this context. General programming concepts stay out.
- The user picks the name. You propose, they decide.

## `/glossary setup`

Run once per machine. Each step checks the current state first, so a second run changes nothing.

1. Make sure `~/.agents/AGENTS.md` exists with `## Vocabulary` and `## Glossary` sections. If an older global instructions file holds other content, move that content in first and back up the original.
2. Symlink `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, and `~/.config/opencode/AGENTS.md` to it. Claude Code has no global `AGENTS.md`, so its link is `CLAUDE.md`.
3. Delete `~/.claude/AGENTS.md` if it exists. Claude Code loads it as a parent-directory file, which loads the same rules twice.
4. In `~/.claude/settings.json`, set `pluginConfigs."cc-plugin-agents-md@builtin".options.instructionFiles` to `"claude-md-and-agents-md"`. Without it, a repo `CLAUDE.md` hides the repo `AGENTS.md`.
5. Verify from a scratch directory. Ask each installed host, with no tools, which words the glossary lists under `_Avoid_` for one term. Report each host's answer.

## `/glossary` in a repo

Fill the repo glossary once, for a repo that has none or only a few entries.

1. Read the code, the docs, and the existing `AGENTS.md` and `CLAUDE.md`. List each concept that appears under two or more names, with the files where each name appears.
2. Ask the user about one concept at a time. Name the competing words and where each appears, then propose one. Write the entry as soon as they answer.
3. Stop after the conflicts run out or the user stops. Five to fifteen entries is a normal first pass.
4. If the repo has a `CLAUDE.md` that does not mention `AGENTS.md`, add `@AGENTS.md` at its top. This keeps the glossary loaded for a Claude Code user without the setting from setup step 4.
5. Offer the lint as a pre-commit check. Add it to the repo's existing hook runner if there is one. It checks staged markdown only:

   ```sh
   git diff --cached --name-only --diff-filter=ACM -- '*.md' | xargs -r python3 <glossary-skill>/scripts/glossary_lint.py
   ```

   Replace `<glossary-skill>` with this skill's directory on this machine.

## `/glossary review`

Prune a glossary that has grown.

1. Remove implementation details, decisions, and anything that reads like a spec.
2. Merge entries that name the same concept.
3. Run `scripts/glossary_lint.py` over the repo's markdown and report the hits by word.
4. Flag terms the code no longer uses. Ask before deleting them.
5. Show the diff. The user approves it before you commit.

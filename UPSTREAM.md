# Upstream record

Kstack was ported from pstack in the Cursor plugins repository.

| Field | Value |
|---|---|
| Repository | `https://github.com/cursor/plugins` |
| Subdirectory | `pstack` |
| Upstream version | `0.15.17` (synced 2026-10-11; ported from `0.14.8`) |
| Upstream commit | `11713c683fe4add4fd403ea880580abbc9e0875f` (port base `93b00b89ef425a9c1bac0d0b317dfc49c930ac99`) |
| Port version | `0.2.0` |
| Port date | `2026-09-05` |

The port renamed `pstack` and `poteto-mode` to `kstack`, added Codex and Claude
Code manifests, and added a host runtime adapter. Hard-coded private model names
and Cursor-only delegation syntax were replaced with host-native roles. The
Cursor-only Benny automation pack remains dormant and is labeled as such.

The 0.15.17 sync took every upstream content change except these:

- `setup-pstack` stays replaced by `setup-kstack`, which writes route data to
  `~/.agents/kstack/models.md` instead of a Cursor rule.
- `poteto-help` is ported as `kstack-help`, without Cursor Custom Modes, Cursor
  install steps, or links to the public pstack repository.
- Hard-coded per-role models and reasoning budgets stay out. Roles resolve
  through the runtime adapter, and effort is an `@<effort>` suffix on a target.
- Upstream's force-push and external-action permissions stay gated by Kstack's
  Autonomy list.
- Upstream's shortened principle descriptions are not taken, because Kstack lets
  the agent load principles on its own and the longer triggers drive that.

`skills/kstack/scripts/lint/kstack.test.ts` enforces the port's invariants.
Run it after every sync.

`research-gap-dossier` is not from pstack. It is adapted from a skill a friend of
the maintainer shared. Kstack wrote its three reference files, the reviewer
prompt, and the ledger checker, and moved its second review pass onto the
`interrogate-reviewers` panel.

The playbooks, principles, helper skills, scripts, guide, and automation pack
remain derived from Lauren Tan's pstack. The MIT license and upstream copyright
notice remain intact.

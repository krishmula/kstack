import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { DEFAULT_ROUTE_TABLE, registryFromSetup, validateRouteTable } from "./routes.ts";

const ROOT = resolve(import.meta.dir, "../../../..");
const SKILLS = join(ROOT, "skills");
const RUNTIME = join(SKILLS, "kstack/references/runtime.md");
const KSTACK = join(SKILLS, "kstack/SKILL.md");

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "node_modules") return [];
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

const FILES = [
  join(ROOT, "README.md"),
  ...markdownFiles(SKILLS),
  ...markdownFiles(join(ROOT, "agents")),
  ...markdownFiles(join(ROOT, "docs")),
];

type BannedPhrase = { readonly pattern: RegExp; readonly fix: string };

const ROLE_RULES = "the runtime adapter's Resolve a role section owns this";

const BANNED: readonly BannedPhrase[] = [
  { pattern: /active host section/g, fix: ROLE_RULES },
  { pattern: /active host's configured/g, fix: ROLE_RULES },
  { pattern: /native delegation tool/g, fix: ROLE_RULES },
  { pattern: /strongest confirmed available equivalent/g, fix: ROLE_RULES },
  { pattern: /strongest available judgment model/g, fix: ROLE_RULES },
  { pattern: /when the role has no entry/g, fix: ROLE_RULES },
  { pattern: /table's fallback/g, fix: ROLE_RULES },
  { pattern: /cross-provider policy/g, fix: "T3 reads only ## t3" },
  { pattern: /Claude Code or Cursor|Cursor (?:loads?|discovers?)/g, fix: "Cursor is not a Kstack host" },
  { pattern: /poteto/gi, fix: "use kstack names" },
  { pattern: /setup-pstack/g, fix: "use /setup-kstack" },
  { pattern: /subagent_type/g, fix: "use host-neutral delegation wording" },
  { pattern: /cursor-team-kit/g, fix: "use the runtime adapter's optional-tool fallback" },
];

const ROLE_REFERENCE = /`([a-z][a-z-]+)` (?:role|panel|pool)\b|[Rr]ole: `([a-z][a-z-]+)`/g;

function where(file: string, text: string, index: number): string {
  const line = text.slice(0, index).split("\n").length;
  return `${relative(ROOT, file)}:${line}`;
}

function bannedHits(file: string, text: string): string[] {
  return BANNED.flatMap(({ pattern, fix }) =>
    [...text.matchAll(pattern)].map((match) => `${where(file, text, match.index ?? 0)} "${match[0]}": ${fix}`),
  );
}

function roleList(setupText: string): Set<string> {
  const block = setupText.match(/## Load the current mapping[\s\S]*?```text\n([\s\S]*?)```/);
  if (!block) throw new Error("setup-kstack has no role list under Load the current mapping");
  return new Set(block[1].split("\n").map((line) => line.trim()).filter(Boolean));
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

function roleShaped(token: string, roles: ReadonlySet<string>): boolean {
  const prefixes = [...roles].filter((role) => role.includes("-")).map((role) => role.split("-")[0]);
  const families = new Set(prefixes.filter((prefix, index) => prefixes.indexOf(prefix) !== index));
  return families.has(token.split("-")[0]) || [...roles].some((role) => editDistance(token, role) <= 2);
}

function unknownRoles(file: string, text: string, roles: ReadonlySet<string>): string[] {
  const explicit = [...text.matchAll(ROLE_REFERENCE)].map((match) => ({ role: match[1] ?? match[2], index: match.index ?? 0 }));
  const shaped = [...text.matchAll(/`([a-z][a-z]*-[a-z-]+)`/g)]
    .filter((match) => roleShaped(match[1], roles))
    .map((match) => ({ role: match[1], index: match.index ?? 0 }));
  const flagged = new Map<number, string>();
  for (const { role, index } of [...explicit, ...shaped]) if (!roles.has(role)) flagged.set(index, role);
  return [...flagged].sort(([a], [b]) => a - b).map(([index, role]) => `${where(file, text, index)} \`${role}\``);
}

function slug(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9 -]/g, "").trim().replace(/ /g, "-");
}

function headings(text: string): Set<string> {
  return new Set([...text.matchAll(/^#{1,6} (.+)$/gm)].map((match) => match[1].trim()));
}

function missingAdapterSections(file: string, text: string, adapterHeadings: ReadonlySet<string>): string[] {
  return [...text.matchAll(/runtime\s+adapter's\s+\*\*([^*]+)\*\*\s+section/g)]
    .map((match) => ({ name: match[1].replace(/\s+/g, " "), index: match.index ?? 0 }))
    .filter(({ name }) => !adapterHeadings.has(name))
    .map(({ name, index }) => `${where(file, text, index)} **${name}**`);
}

function gatedOperations(text: string, opener: RegExp): string[] {
  const match = text.match(opener);
  if (!match) throw new Error(`no gated-operation list matching ${opener}`);
  return match[1]
    .replace(/\s+/g, " ")
    .split(/,\s*(?:and\s+)?/)
    .map((item) => item.trim().toLowerCase());
}

const AUTONOMY_LIST = /\*\*Authority does not expand\.\*\* ([^.]+?) require/;
const ADAPTER_LIST = /section lists: ([^.]+)\./;

const SETUP_TEXT = readFileSync(join(SKILLS, "setup-kstack/SKILL.md"), "utf8");
const REGISTRY = registryFromSetup(SETUP_TEXT);

describe("kstack lint rules", () => {
  it("flags every banned phrase with its location and fix", () => {
    const text = "intro\nUse `swarm-workers` from the active host section.\nAgain the active host section.\n";
    expect(bannedHits(join(ROOT, "skills/swarm/SKILL.md"), text)).toEqual([
      `skills/swarm/SKILL.md:2 "active host section": ${ROLE_RULES}`,
      `skills/swarm/SKILL.md:3 "active host section": ${ROLE_RULES}`,
    ]);
  });

  it("flags retired roles in every reference form", () => {
    const text = [
      "Use the `how-critics` role.",
      "Model role: `old-judge`.",
      "| Judgment | `reflect-judgement` | prompt |",
      "Read `hardest-task` and `judgment-and-prose`, plus `kstack-agent` and `no-comments`.",
      "The `arena-runners` panel and `arena-cross-judge-pool` pool.",
    ].join("\n");
    expect(unknownRoles(join(ROOT, "skills/how/SKILL.md"), text, roleList(SETUP_TEXT))).toEqual([
      "skills/how/SKILL.md:1 `how-critics`",
      "skills/how/SKILL.md:2 `old-judge`",
      "skills/how/SKILL.md:3 `reflect-judgement`",
      "skills/how/SKILL.md:4 `hardest-task`",
    ]);
  });

  it("validates route table shape, targets, and effort", () => {
    const table = [
      "# Kstack model configuration",
      "## t3",
      "Targets are notes, not routes.",
      "feature: claudeAgent:claude-opus-5-5@high > codex:gpt-6.1-sol",
      "bug-fix: claude-fable-5-1@ultra",
      "how-critics: codex:gpt-6.1-sol",
      "arena-runners: claudeAgent:claude-fable-5-1 > codex:gpt-6-astra",
      "swarm-workers: claudeAgent:claude-opus-5-5, codex:gpt-6.1-sol",
      "feature: inherit-parent",
      "## codex",
      "feature: gpt-6.1-sol@high",
    ].join("\n");
    expect(validateRouteTable(table, REGISTRY)).toEqual([
      'line 5: "claude-fable-5-1@ultra" has effort "ultra", not one of low, medium, high, xhigh, max',
      'line 6: unknown role "how-critics" in ## t3',
      "line 7: arena-runners is a panel, so its entries are comma-separated, not a > chain",
      "line 8: swarm-workers is a single-agent role, so it takes a > chain, not a comma list",
      'line 9: duplicate role "feature" in ## t3',
    ]);
  });

  it("requires a provider prefix in ## t3 only", () => {
    expect(validateRouteTable("## t3\nfeature: gpt-6.1-sol\n## codex\nfeature: gpt-6.1-sol", REGISTRY)).toEqual([
      'line 2: "gpt-6.1-sol" needs a <provider-instance>: prefix in ## t3',
    ]);
  });

  it("flags a runtime adapter section that does not exist", () => {
    const text = "Resolve per the runtime adapter's **Resolve a role** section.\nSee the runtime adapter's **Pick a model** section.";
    expect(missingAdapterSections(join(ROOT, "skills/how/SKILL.md"), text, new Set(["Resolve a role"]))).toEqual([
      "skills/how/SKILL.md:2 **Pick a model**",
    ]);
  });

  it("parses a gated-operation list", () => {
    const text = "**Authority does not expand.** External messages, merges,\nand data deletion require the user.";
    expect(gatedOperations(text, AUTONOMY_LIST)).toEqual(["external messages", "merges", "data deletion"]);
  });
});

describe("kstack skill lint", () => {
  it("keeps role resolution and Cursor vocabulary out of skills", () => {
    const hits = FILES.filter((file) => file !== RUNTIME).flatMap((file) => bannedHits(file, readFileSync(file, "utf8")));
    expect(hits).toEqual([]);
  });

  it("names only roles that setup-kstack defines", () => {
    const roles = roleList(SETUP_TEXT);
    expect(FILES.flatMap((file) => unknownRoles(file, readFileSync(file, "utf8"), roles))).toEqual([]);
  });

  it("gates the same operations in the skill and the runtime adapter", () => {
    expect(gatedOperations(readFileSync(RUNTIME, "utf8"), ADAPTER_LIST)).toEqual(
      gatedOperations(readFileSync(KSTACK, "utf8"), AUTONOMY_LIST),
    );
  });

  it("resolves every relative markdown link and anchor", () => {
    const broken = FILES.flatMap((file) => {
      const text = readFileSync(file, "utf8");
      return [...text.matchAll(/\]\(([^)\s]+)\)/g)]
        .filter(([, target]) => !/^(https?:|mailto:|<)/.test(target) && /[./#]/.test(target))
        .filter(([, target]) => {
          const [path, anchor] = target.split("#");
          const destination = path ? resolve(dirname(file), path) : file;
          if (!existsSync(destination)) return true;
          if (!anchor || !destination.endsWith(".md")) return false;
          return ![...headings(readFileSync(destination, "utf8"))].some((heading) => slug(heading) === anchor);
        })
        .map((match) => `${where(file, text, match.index ?? 0)} ${match[1]}`);
    });
    expect(broken).toEqual([]);
  });

  it("names only runtime adapter sections that exist", () => {
    const adapterHeadings = headings(readFileSync(RUNTIME, "utf8"));
    expect(FILES.flatMap((file) => missingAdapterSections(file, readFileSync(file, "utf8"), adapterHeadings))).toEqual([]);
  });

  it("keeps the live route table valid when present", () => {
    const problems = existsSync(DEFAULT_ROUTE_TABLE) ? validateRouteTable(readFileSync(DEFAULT_ROUTE_TABLE, "utf8"), REGISTRY) : [];
    expect(problems).toEqual([]);
  });

  it("gives every skill frontmatter and Codex metadata", () => {
    const missing = readdirSync(SKILLS).flatMap((skill) => {
      const dir = join(SKILLS, skill);
      if (!statSync(dir).isDirectory()) return [];
      const skillFile = join(dir, "SKILL.md");
      if (!existsSync(skillFile)) return [`${skill}: no SKILL.md`];
      const head = readFileSync(skillFile, "utf8").split("---")[1] ?? "";
      return [
        ...(new RegExp(`^name: ${skill}$`, "m").test(head) ? [] : [`${skill}: name does not match directory`]),
        ...(/^description: \S/m.test(head) ? [] : [`${skill}: no description`]),
        ...(existsSync(join(dir, "agents/openai.yaml")) ? [] : [`${skill}: no agents/openai.yaml`]),
      ];
    });
    expect(missing).toEqual([]);
  });
});

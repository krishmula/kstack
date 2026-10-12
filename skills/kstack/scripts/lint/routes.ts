import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

export const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
export type Effort = (typeof EFFORTS)[number];

export type Target =
  | { readonly kind: "inherit-parent" }
  | { readonly kind: "model"; readonly provider: string | undefined; readonly model: string; readonly effort: Effort | undefined };

export type RouteSpec = { readonly kind: "chain" | "list"; readonly targets: readonly Target[] };

export type RoleRegistry = { readonly roles: ReadonlySet<string>; readonly panels: ReadonlySet<string> };

const T3_SECTION = "t3";
const TARGET = /^(?:([A-Za-z][\w-]*):)?([^\s@:][^\s@]*?)(?:@([a-z]+))?$/;

function isEffort(value: string): value is Effort {
  return (EFFORTS as readonly string[]).includes(value);
}

export function parseTarget(text: string): Target | string {
  if (text === "inherit-parent") return { kind: "inherit-parent" };
  const match = TARGET.exec(text);
  if (!match) return `"${text}" is not <provider-instance>:<model>[@<effort>]`;
  const [, provider, model, effort] = match;
  if (effort !== undefined && !isEffort(effort)) return `"${text}" has effort "${effort}", not one of ${EFFORTS.join(", ")}`;
  return { kind: "model", provider, model, effort };
}

export function registryFromSetup(setupText: string): RoleRegistry {
  const list = setupText.match(/## Load the current mapping[\s\S]*?```text\n([\s\S]*?)```/);
  const template = setupText.match(/## Write the section[\s\S]*?```markdown\n([\s\S]*?)```/);
  if (!list || !template) throw new Error("setup-kstack lacks its role list or section template");
  const roles = new Set(list[1].split("\n").map((line) => line.trim()).filter(Boolean));
  const panels = new Set(
    template[1]
      .split("\n")
      .filter((line) => /^[a-z-]+: <target>, <target>$/.test(line))
      .map((line) => line.split(":")[0]),
  );
  return { roles, panels };
}

export function validateRouteTable(text: string, registry: RoleRegistry): string[] {
  const problems: string[] = [];
  let section: string | undefined;
  const seen = new Set<string>();
  text.split("\n").forEach((raw, index) => {
    const line = raw.trim();
    const at = `line ${index + 1}`;
    const heading = /^## (.+)$/.exec(line);
    if (heading) {
      section = heading[1].trim();
      seen.clear();
      return;
    }
    const route = /^([a-z][a-z-]*): (.+)$/.exec(line);
    if (!route || section === undefined) return;
    const [, role, spec] = route;
    if (!registry.roles.has(role)) return void problems.push(`${at}: unknown role "${role}" in ## ${section}`);
    if (seen.has(role)) return void problems.push(`${at}: duplicate role "${role}" in ## ${section}`);
    seen.add(role);
    const isPanel = registry.panels.has(role);
    if (isPanel && spec.includes(">")) problems.push(`${at}: ${role} is a panel, so its entries are comma-separated, not a > chain`);
    if (!isPanel && spec.includes(",")) problems.push(`${at}: ${role} is a single-agent role, so it takes a > chain, not a comma list`);
    for (const entry of spec.split(/[>,]/).map((part) => part.trim())) {
      const target = parseTarget(entry);
      if (typeof target === "string") problems.push(`${at}: ${target}`);
      else if (section === T3_SECTION && target.kind === "model" && target.provider === undefined)
        problems.push(`${at}: "${entry}" needs a <provider-instance>: prefix in ## t3`);
    }
  });
  return problems;
}

export const DEFAULT_ROUTE_TABLE = join(homedir(), ".agents/kstack/models.md");
export const SETUP_SKILL = resolve(import.meta.dir, "../../../setup-kstack/SKILL.md");

if (import.meta.main) {
  const path = process.argv[2] ?? DEFAULT_ROUTE_TABLE;
  if (!existsSync(path)) {
    console.log(`${path}: absent, every role uses its no-entry default`);
    process.exit(0);
  }
  const problems = validateRouteTable(readFileSync(path, "utf8"), registryFromSetup(readFileSync(SETUP_SKILL, "utf8")));
  for (const problem of problems) console.error(`${path}: ${problem}`);
  console.log(`${path}: ${problems.length} problems`);
  process.exit(problems.length === 0 ? 0 : 1);
}

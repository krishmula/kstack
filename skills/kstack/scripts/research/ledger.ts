import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const LEDGER_COLUMNS = [
  "id",
  "title",
  "year",
  "venue",
  "type",
  "url",
  "fetched",
  "quote",
  "proves",
  "does_not_prove",
  "bearing",
] as const;

export const SOURCE_TYPES = ["paper", "preprint", "engineering", "repo", "trace", "secondary"] as const;

export type ResearchDoc = { readonly name: string; readonly text: string };

const UNVERIFIED = "unverified";
const FETCHED = /^\d{4}-\d{2}-\d{2}$/;

export function checkResearch(ledger: string, docs: readonly ResearchDoc[]): string[] {
  const problems: string[] = [];
  const [header, ...rows] = ledger.split("\n").filter((line) => line.trim() !== "");
  if (header !== LEDGER_COLUMNS.join("\t")) return [`ledger.tsv: header must be ${LEDGER_COLUMNS.join(" ")}`];

  const verified = new Map<string, boolean>();
  rows.forEach((line, index) => {
    const at = `ledger.tsv:${index + 2}`;
    const cells = line.split("\t");
    if (cells.length !== LEDGER_COLUMNS.length)
      return void problems.push(`${at}: ${cells.length} cells, expected ${LEDGER_COLUMNS.length}`);
    const row = Object.fromEntries(LEDGER_COLUMNS.map((column, i) => [column, cells[i].trim()]));
    if (!/^L\d+$/.test(row.id)) problems.push(`${at}: id "${row.id}" is not L<number>`);
    else if (verified.has(row.id)) problems.push(`${at}: duplicate id ${row.id}`);
    if (!(SOURCE_TYPES as readonly string[]).includes(row.type))
      problems.push(`${at}: type "${row.type}" is not one of ${SOURCE_TYPES.join(", ")}`);
    if (!/^https?:\/\/\S+$/.test(row.url)) problems.push(`${at}: url "${row.url}" is not an http(s) link`);
    const isVerified = FETCHED.test(row.fetched);
    if (!isVerified && row.fetched !== UNVERIFIED)
      problems.push(`${at}: fetched "${row.fetched}" is neither YYYY-MM-DD nor ${UNVERIFIED}`);
    if (isVerified && row.quote === "") problems.push(`${at}: ${row.id} was fetched but quotes nothing`);
    verified.set(row.id, isVerified);
  });

  for (const { name, text } of docs) {
    text.split("\n").forEach((line, index) => {
      for (const match of line.matchAll(/\[(L\d+)\]/g)) {
        const id = match[1];
        const at = `${name}:${index + 1}`;
        if (!verified.has(id)) problems.push(`${at}: cites ${id}, which is not in the ledger`);
        else if (!verified.get(id)) problems.push(`${at}: cites ${id}, which was never fetched`);
      }
    });
  }
  return problems;
}

if (import.meta.main) {
  const dir = process.argv[2];
  if (!dir || !existsSync(join(dir, "ledger.tsv"))) {
    console.error("usage: bun ledger.ts <research-dir containing ledger.tsv>");
    process.exit(2);
  }
  const docs = readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => ({ name, text: readFileSync(join(dir, name), "utf8") }));
  const problems = checkResearch(readFileSync(join(dir, "ledger.tsv"), "utf8"), docs);
  for (const problem of problems) console.error(problem);
  console.log(`${dir}: ${problems.length} problems`);
  process.exit(problems.length === 0 ? 0 : 1);
}

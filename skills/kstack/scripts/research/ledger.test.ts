import { describe, expect, it } from "bun:test";
import { checkResearch, LEDGER_COLUMNS } from "./ledger.ts";

const HEADER = LEDGER_COLUMNS.join("\t");

function row(cells: Partial<Record<(typeof LEDGER_COLUMNS)[number], string>>): string {
  const defaults = {
    id: "L1",
    title: "Efficient Memory Management for LLM Serving with PagedAttention",
    year: "2023",
    venue: "SOSP",
    type: "paper",
    url: "https://arxiv.org/abs/2309.06180",
    fetched: "2026-10-11",
    quote: "vLLM improves the throughput of popular LLMs by 2-4x",
    proves: "paged KV cache raises serving throughput",
    does_not_prove: "behavior under multi-tenant preemption",
    bearing: "threatens C2",
  };
  return LEDGER_COLUMNS.map((column) => cells[column] ?? defaults[column]).join("\t");
}

describe("research ledger check", () => {
  it("accepts a fetched source cited from a dossier", () => {
    const ledger = [HEADER, row({})].join("\n");
    expect(checkResearch(ledger, [{ name: "dossier.md", text: "Paged KV caches already exist [L1]." }])).toEqual([]);
  });

  it("rejects a wrong header before reading rows", () => {
    expect(checkResearch("id\ttitle\turl\nL1\tx\thttps://a.b", [])).toEqual([
      `ledger.tsv: header must be ${LEDGER_COLUMNS.join(" ")}`,
    ]);
  });

  it("flags malformed rows with their line", () => {
    const ledger = [
      HEADER,
      row({}),
      row({ id: "L1", type: "blog", url: "arxiv 2309.06180", fetched: "yesterday" }),
      row({ id: "S3", quote: "" }),
      "L4\ttoo few cells",
    ].join("\n");
    expect(checkResearch(ledger, [])).toEqual([
      "ledger.tsv:3: duplicate id L1",
      'ledger.tsv:3: type "blog" is not one of paper, preprint, engineering, repo, trace, secondary',
      'ledger.tsv:3: url "arxiv 2309.06180" is not an http(s) link',
      'ledger.tsv:3: fetched "yesterday" is neither YYYY-MM-DD nor unverified',
      'ledger.tsv:4: id "S3" is not L<number>',
      "ledger.tsv:4: S3 was fetched but quotes nothing",
      "ledger.tsv:5: 2 cells, expected 11",
    ]);
  });

  it("refuses citations to missing or unfetched sources", () => {
    const ledger = [HEADER, row({}), row({ id: "L2", fetched: "unverified", quote: "" })].join("\n");
    const candidates = "C1 is solved [L1].\nNobody does C2 [L2], see also [L9].";
    expect(checkResearch(ledger, [{ name: "candidates.md", text: candidates }])).toEqual([
      "candidates.md:2: cites L2, which was never fetched",
      "candidates.md:2: cites L9, which is not in the ledger",
    ]);
  });
});

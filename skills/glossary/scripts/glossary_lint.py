#!/usr/bin/env python3
"""Flag words that a glossary lists under _Avoid_.

Usage:
  glossary_lint.py [--glossary FILE]... [PATH]...

Reads PATHs, or stdin when none are given. Without --glossary it loads
~/.agents/AGENTS.md and the nearest AGENTS.md from the current directory up.
Exits 1 when it finds a hit, so it works as a pre-commit check.
"""
import argparse
import os
import re
import sys
from dataclasses import dataclass, field

TERM = re.compile(r"^\*\*(.+?)\*\*:\s*$")
AVOID = re.compile(r"^_Avoid_:\s*(.+?)\s*$")
HEADING = re.compile(r"^(#{1,6})\s+(.*)$")
FENCE = re.compile(r"^\s*(```|~~~)")
# Code, link targets, and quoted words name a word instead of using it.
NOT_PROSE = re.compile(r"`[^`\n]*`|\]\([^)]*\)|\"[^\"\n]{1,90}\"|https?://\S+")


@dataclass
class Term:
    name: str
    avoid: list = field(default_factory=list)


@dataclass
class Hit:
    path: str
    line: int
    word: str
    term: str


def parse_glossary(text):
    """Return the terms in the `## Glossary` section of a markdown file."""
    terms = []
    in_glossary = False
    for line in text.splitlines():
        h = HEADING.match(line)
        if h:
            in_glossary = h.group(2).strip().lower() == "glossary"
            continue
        if not in_glossary:
            continue
        t = TERM.match(line)
        if t:
            terms.append(Term(t.group(1).strip()))
            continue
        a = AVOID.match(line)
        if a and terms:
            terms[-1].avoid += [w.strip() for w in a.group(1).split(",") if w.strip()]
    return terms


def avoid_patterns(terms):
    return [(re.compile(r"(?<![\w-])" + re.escape(w) + r"(?![\w-])", re.IGNORECASE), w, t.name)
            for t in terms for w in t.avoid]


def lint(text, terms, path="<stdin>"):
    """Return a Hit for each avoided word used in prose outside the glossary."""
    patterns = avoid_patterns(terms)
    hits = []
    in_fence = False
    in_glossary = False
    for lineno, line in enumerate(text.splitlines(), 1):
        if FENCE.match(line):
            in_fence = not in_fence
            continue
        h = HEADING.match(line)
        if h:
            in_glossary = h.group(2).strip().lower() == "glossary"
        if in_fence or in_glossary:
            continue
        prose = NOT_PROSE.sub(lambda m: " " * len(m.group(0)), line)
        for rx, word, term in patterns:
            for m in rx.finditer(prose):
                hits.append(Hit(path, lineno, m.group(0), term))
    return hits


def nearest_agents_md(start):
    d = os.path.abspath(start)
    while True:
        p = os.path.join(d, "AGENTS.md")
        if os.path.isfile(p):
            return p
        parent = os.path.dirname(d)
        if parent == d:
            return None
        d = parent


def default_glossaries(cwd):
    paths = [os.path.expanduser("~/.agents/AGENTS.md"), nearest_agents_md(cwd)]
    seen = set()
    out = []
    for p in paths:
        if p and os.path.isfile(p) and os.path.realpath(p) not in seen:
            seen.add(os.path.realpath(p))
            out.append(p)
    return out


def load_terms(paths):
    terms = []
    for p in paths:
        with open(p, encoding="utf-8", errors="replace") as fh:
            terms += parse_glossary(fh.read())
    return terms


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--glossary", action="append", default=[])
    ap.add_argument("paths", nargs="*")
    args = ap.parse_args(argv)
    terms = load_terms(args.glossary or default_glossaries(os.getcwd()))
    hits = []
    if args.paths:
        for p in args.paths:
            with open(p, encoding="utf-8", errors="replace") as fh:
                hits += lint(fh.read(), terms, p)
    else:
        hits = lint(sys.stdin.read(), terms)
    for h in hits:
        print(f"{h.path}:{h.line}: '{h.word}' is listed under _Avoid_ for **{h.term}**")
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main())

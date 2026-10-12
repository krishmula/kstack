import os
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from glossary_lint import Hit, Term, lint, parse_glossary

GLOSSARY = """# Rules

## Glossary

**Subagent**:
An agent the main agent starts.
_Avoid_: delegate, worker, child agent

**Stack**:
A chain of pull requests.
_Avoid_: PR chain

## Later section

**Bold line**:
Not a term, because it is outside the glossary.
_Avoid_: anything
"""


class ParseGlossary(unittest.TestCase):
    def test_reads_terms_and_avoid_lists_only_inside_the_glossary(self):
        self.assertEqual(parse_glossary(GLOSSARY), [
            Term("Subagent", ["delegate", "worker", "child agent"]),
            Term("Stack", ["PR chain"]),
        ])


class Lint(unittest.TestCase):
    terms = parse_glossary(GLOSSARY)

    def test_flags_avoided_words_case_insensitively(self):
        self.assertEqual(lint("Spawn a Worker.\nOpen a pr chain.", self.terms), [
            Hit("<stdin>", 1, "Worker", "Subagent"),
            Hit("<stdin>", 2, "pr chain", "Stack"),
        ])

    def test_ignores_code_quotes_links_and_partial_words(self):
        text = '`worker` and "worker" and [x](worker.md) and workers and co-worker.\n```\nworker\n```'
        self.assertEqual(lint(text, self.terms), [])

    def test_skips_the_glossary_section_itself(self):
        self.assertEqual(lint(GLOSSARY, self.terms), [])

    def test_cli_exits_1_on_a_hit_and_0_when_clean(self):
        with tempfile.TemporaryDirectory() as d:
            g = os.path.join(d, "AGENTS.md")
            open(g, "w").write(GLOSSARY)
            script = os.path.join(os.path.dirname(__file__), "glossary_lint.py")
            run = lambda text: subprocess.run(
                [sys.executable, script, "--glossary", g], input=text,
                capture_output=True, text=True)
            bad = run("Ask a delegate.")
            self.assertEqual((bad.returncode, bad.stdout.strip()),
                             (1, "<stdin>:1: 'delegate' is listed under _Avoid_ for **Subagent**"))
            self.assertEqual(run("Ask a subagent.").returncode, 0)


if __name__ == "__main__":
    unittest.main()

"""
Generates a TSV file of the lengths of the messages of each task.
"""

import json
from pathlib import Path

# C tasks directory:
TASK_ROOT = Path(__file__).resolve().parent.parent


def task_dirs():
    return (
        entry
        for entry in TASK_ROOT.iterdir()
        if entry.is_dir() and not entry.name.startswith(("+", "."))
    )


def tsv_print(*args, **kwargs):
    print(*args, **kwargs, sep="\t")


def parse_gcc_message(path: Path) -> str:
    with path.open("rb") as json_file:
        diagnostics = json.load(json_file)
    pem, *_ = [d for d in diagnostics if d["kind"] == "error"]
    message = pem["message"]
    location = pem["locations"][0]
    caret = location["caret"]
    line = caret["line"]
    source_code = (path.parent / "main.c").read_text()
    excerpt = source_code.splitlines()[int(line) - 1]
    # Don't need to do a perfect job to just obtain the word count:
    lines = [
        f"main.c:13:4: error: {message}",
        f"   13 |     {excerpt}",
        f"      |     ^~~~~~~~~",
    ]
    return "\n".join(lines)


# Header
tsv_print("task", "condition", "chars", "words")

for task in task_dirs():
    files = dict(
        control=(task / "gcc-diagnostics.json"),
        gpt4=(task / "gpt4-response.md"),
        handwritten=(task / "manual-explanation.md"),
    )
    for condition, filepath in files.items():
        if condition == "control":
            contents = parse_gcc_message(filepath)
        else:
            contents = filepath.read_text(encoding="UTF-8")
        tsv_print(task.name, condition, len(contents), len(contents.split()))

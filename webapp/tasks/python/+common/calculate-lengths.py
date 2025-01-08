"""
Generates a TSV file of the lengths of the messages of each task.
"""

from pathlib import Path

# Python tasks directory:
TASK_ROOT = Path(__file__).resolve().parent.parent


def task_dirs():
    return (
        entry
        for entry in TASK_ROOT.iterdir()
        if entry.is_dir() and not entry.name.startswith(("+", "."))
    )


def tsv_print(*args, **kwargs):
    print(*args, **kwargs, sep="\t")


# Header
tsv_print("task", "condition", "chars", "words")

for task in task_dirs():
    files = dict(
        control=(task / "python-errors.txt"),
        gpt4=(task / "gpt4-response.md"),
        finetuned=(task / "ft-response.md"),
    )
    for condition, filepath in files.items():
        contents = filepath.read_text(encoding="UTF-8")
        tsv_print(task.name, condition, len(contents), len(contents.split()))

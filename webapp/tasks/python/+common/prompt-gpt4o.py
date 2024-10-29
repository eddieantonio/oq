#!/usr/bin/env python3

"""
Prompt GPT-4 to enhance error messages from the Python source file. This will use Python to get
the error message and enhance it.

It uses a prompt first shown in Leinonen et al. 2022, and later in Santos et al. 2023.

In Leinonen et al. 2022, they really copy-paste the FULL traceback... I think this is a
waste of tokens, but in the interest of consistency, I will also paste the full
traceback in the prompt.
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path, PurePosixPath
from pprint import pprint

PYTHON = "python3.12"
URL = "https://api.openai.com/v1/chat/completions"

PROG_NAME = sys.argv[0]
invocation = Path(PROG_NAME).stem

if invocation == "prompt-gpt4":
    raise NotImplementedError("Not prompting GPT-4 anymore")
elif invocation == "prompt-gpt4o":
    MODEL = "gpt-4o-2024-08-06"
    SYSTEM_MESSAGE = "You are a helpful assistant."

    def make_prompt(*, code: str, error: str) -> str:
        """
        Use the prompt from Leinonen et al. 2022, Prompt 3.2.1 to enhance an error message.
        """

        # Prevent too many newlines in prompt:
        code = code.rstrip("\n")

        return (
            "Code:\n\n"
            "```\n"
            f"{code}\n"
            "```\n"
            "\n"
            "Output:\n\n"
            "```\n"
            f"{error!s}\n"
            "```\n\n"
            "Plain English explanation of why running the above code causes an error and how to fix the problem"
        )

elif invocation == "prompt-ft":
    MODEL = "ft:gpt-4o-2024-08-06:personal:pem-1:ANfg02Wz"
    SYSTEM_MESSAGE = (
        "Provide a plain English explanation of why running the Python 3 code causes "
        "an error and how to fix the problem. "
        "Do not output the entire fixed source code."
    )

    def make_prompt(*, code: str, error: str) -> str:
        """
        Use the prompt from Salmon et al. 2024.
        """
        # Yep, it's *just* the code:
        return code

else:
    raise ValueError(f"Dunno what to do when called as {invocation}")


def simplify_path(matchobj):
    path = PurePosixPath(matchobj.group(1))
    return f'  File "{path.name}"'


python_file = Path(sys.argv[1])
assert python_file.exists(), "source file not found"

output_file = Path(sys.argv[2])
if output_file.exists():
    print(
        f"{PROG_NAME}: not overwriting existing output file: {output_file}",
        file=sys.stderr,
    )
    sys.exit(1)


try:
    OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
except KeyError:
    print(
        f"{PROG_NAME}: you must set the OPENAI_API_KEY environment variable",
        file=sys.stderr,
    )
    sys.exit(1)

details = subprocess.run(
    [PYTHON, str(python_file)],
    capture_output=True,
    encoding="UTF-8",
)

diagnostics = details.stderr
# Simplify line by removing specific path components.
# Not a fool-proof regular expression, but it will work:
pattern = re.compile(r'  File "([^"]+)"')
error_lines = [pattern.sub(simplify_path, line) for line in diagnostics.split("\n")]
if error_lines[-1] == "":
    error_lines.pop()
error_message = "\n".join(error_lines)
print(error_message)

prompt = make_prompt(code=python_file.read_text(encoding="UTF-8"), error=error_message)
data = dict(
    model=MODEL,
    messages=[
        {"role": "system", "content": SYSTEM_MESSAGE},
        {
            "role": "user",
            "content": prompt,
        },
    ],
    temperature=0,
)


pprint(data)
request = urllib.request.Request(
    URL,
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}",
    },
    data=json.dumps(data).encode("UTF-8"),
)
response = urllib.request.urlopen(request)
output_file.write_bytes(response.read())

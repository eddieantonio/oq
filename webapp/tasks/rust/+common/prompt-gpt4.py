#!/usr/bin/env python3

"""
Prompt GPT-4 to enhance error messages from the C source file. This will use gcc to get
the error message, extact the very first error message (just the message!) and enhance
it.

It uses a prompt first shown in Leinonen et al. 2022, and later in Santos et al. 2023.
"""

import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

MODEL = "gpt-4"
COMPILER = "rustc"

URL = "https://api.openai.com/v1/chat/completions"


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


PROG_NAME = sys.argv[0]

c_file = Path(sys.argv[1])
assert c_file.exists(), "source file not found"

# output_file = Path(sys.argv[2])
# if output_file.exists():
#    print(
#        f"{PROG_NAME}: not overwriting existing output file: {output_file}",
#        file=sys.stderr,
#    )
#    sys.exit(1)
#
#
# try:
#    OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
# except KeyError:
#    print(
#        f"{PROG_NAME}: you must set the OPENAI_API_KEY environment variable",
#        file=sys.stderr,
#    )
#    sys.exit(1)

details = subprocess.run(
    [COMPILER, "--error-format=json", "-o", "/dev/null", str(c_file)],
    capture_output=True,
    encoding="UTF-8",
)

diagnostics = [
    json.loads(line) for line in details.stderr.splitlines() if line.strip() != ""
]
error = diagnostics[0]
assert error["level"] == "error"
message = error["message"]
normalized_filename = c_file.name
# line = error["locations"][0]["caret"]["line"]
# column = error["locations"][0]["caret"]["column"]
# formatted_error = f"{normalized_filename}:{line}:{column}: error: {message}"
if error["code"]:
    code = error["code"]["code"]
    formatted_error = f"error[{code}]: {message}"
else:
    formatted_error = f"error: {message}"


prompt = make_prompt(code=c_file.read_text(encoding="UTF-8"), error=formatted_error)
data = dict(
    model=MODEL,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": prompt,
        },
    ],
    temperature=0,
)

from pprint import pprint

print(formatted_error)
pprint(data)

# request = urllib.request.Request(
#    URL,
#    headers={
#        "Content-Type": "application/json",
#        "Authorization": f"Bearer {OPENAI_API_KEY}",
#    },
#    data=json.dumps(data).encode("UTF-8"),
# )
# response = urllib.request.urlopen(request)
# output_file.write_bytes(response.read())

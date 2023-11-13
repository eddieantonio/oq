"""
This is a TEMPORARY application for testing how to run code on a server.

DO NOT USE THIS APPLICATION IN PRODUCTION.

Use a third-party code execution engine instead! I am not qualified to write
a secure code sandbox! This is for demonstration purposes only!
"""

from contextlib import contextmanager
import os
import tempfile
from flask import Flask, request
import subprocess

app = Flask(__name__)


@app.route("/run/gcc", methods=["POST"])
def compile_and_run_gcc():
    """
    Uses the file uploaded in the form data to compile and run a C program.
    Will return json with the stdout and stderr from the compiler and program.
    """

    source_code_file = request.files["file"]

    # Save the file to disk using a TemporaryDirectory
    with tempfile.TemporaryDirectory() as tmpdirname, cd(tmpdirname):
        source_code_file.save("main.c")

        # Compile the file...
        compile_result = subprocess.run(
            ["gcc", "main.c"], capture_output=True, text=True
        )

        if compile_result.returncode != 0:
            # If the compile failed, return the stderr
            return {"compile": compile_result.stderr}

        # Run the file...
        run_result = subprocess.run(
            ["./a.out"],
            capture_output=True,
            # TODO: can I be sure it will be UTF-8 encoded text? No. But this will do for demo purposes.
            text=True,
        )

        # Return the results as JSON
        return {
            "compile": compile_result.stderr,
            "run": run_result.stdout,
            "stderr": run_result.stderr,
        }


# cd context manager
@contextmanager
def cd(path):
    """
    Context manager for changing the current working directory.
    """
    old_dir = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old_dir)


if __name__ == "__main__":
    app.run()

"""
This is a TEMPORARY application for testing how to run code on a server.

DO NOT USE THIS APPLICATION IN PRODUCTION.

Use a third-party code execution engine instead! I am not qualified to write
a secure code sandbox! This is for demonstration purposes only!
"""

import json
import logging
import os
import subprocess
import tempfile
from contextlib import contextmanager

from flask import Flask, request


app = Flask(__name__)


@app.route("/run/gcc", methods=["POST"])
def compile_and_run_gcc():
    """
    Compiles and runs a C program. The program is POSTed using multipart/form-data.
    """

    source_code_file = request.files["file"]
    filename = source_code_file.filename
    # NOTE: a REAL sandboxed environment would further validate the filename,
    # but I cannot be bothered to do that here.
    assert filename.endswith(".c"), "Only C files are supported"
    executable_name = filename[:-2]

    # Save the file to disk using a TemporaryDirectory
    with tempfile.TemporaryDirectory() as tmpdirname, cd(tmpdirname):
        source_code_file.save(filename)

        # First, compile the program
        compile_success, compile_result = compile_c_program(
            app, filename, executable_name
        )

        if not compile_success:
            # Return the compile errors as JSON
            return {"compilation": compile_result, "execution": None}

        # Run the executable
        _run_status, run_output = run_executable(app, executable_name)
        return {
            "compilation": compile_result,
            "execution": run_output,
        }


def compile_c_program(app, filename, executable_name):
    """
    Compiles a C program using gcc, trying to return diagnostics as JSON output.
    """

    compile_args = [
        "gcc",
        "-Werror",
        "-fdiagnostics-format=json",
        "-o",
        executable_name,
        filename,
    ]
    app.logger.info("Running: %r", compile_args)
    compile_result = subprocess.run(
        compile_args,
        capture_output=True,
        text=True,
    )

    try:
        parsed = json.loads(compile_result.stderr)
    except json.JSONDecodeError:
        parsed = None

    return compile_result.returncode == 0, {
        "exitCode": compile_result.returncode,
        "stderr": compile_result.stderr,
        "parsed": {
            "format": "gcc-json",
            "diagnostics": parsed,
        },
    }


def run_executable(app, executable_name):
    run_args = [f"./{executable_name}"]
    app.logger.info("Running: %r", run_args)
    run_result = subprocess.run(
        run_args,
        capture_output=True,
        # TODO: can I be sure it will be UTF-8 encoded text? No. But this will do for demo purposes.
        # TODO: to avoid unknown encoding errors, use binary mode and base64 or base85 to encode the output
        text=True,
    )
    return run_result.returncode == 0, {
        "exitCode": run_result.returncode,
        "stdout": run_result.stdout,
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

# Configure logging for gunicorn
# See: https://trstringer.com/logging-flask-gunicorn-the-manageable-way/
if __name__ != "__main__":
    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

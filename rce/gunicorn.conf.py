"""
Gunicorn configuration file.

The only major thing here is that workers can be specified by setting the
GUNICORN_WORKERS environment variable.

See: https://docs.gunicorn.org/en/latest/configure.html#configuration-file
"""

import os
import multiprocessing

cpu_count = multiprocessing.cpu_count()

bind = "0.0.0.0:8000"
workers = os.getenv("GUNICORN_WORKERS", cpu_count * 2 + 1)

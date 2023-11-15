FROM python:3.11-slim-bookworm

WORKDIR /app

# Install a C compiler!
RUN apt-get update && apt-get install -y gcc build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install packages
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt && \
    python -c "import compileall; compileall.compile_path(maxlevels=10)"

# Now copy the app source code
COPY . /app
# Pre-compile Python bytecode (prevents copy-on-write when running the container)
RUN python -m compileall .

# Expose port 8000 for Gunicorn (see gunicorn.conf.py)
EXPOSE 8000

# Start Gunicorn.
CMD ["gunicorn", "app:app"]

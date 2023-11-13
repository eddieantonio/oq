FROM python:3.11-slim-buster

WORKDIR /app

# Install a C compiler!
RUN apt-get update && apt-get install -y gcc build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install packages
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Now copy the app source code
COPY . /app

# Expose port 8000 for Gunicorn (see gunicorn.conf.py)
EXPOSE 8000

# Start Gunicorn.
CMD ["gunicorn", "app:app"]

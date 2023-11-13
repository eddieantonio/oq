FROM python:3.11-slim-buster

WORKDIR /app

# Install system dependencies like gcc and build essential. Clean up apt cache
RUN apt-get update && apt-get install -y gcc build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install packages
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

COPY . /app

# Expose port 8000 for Gunicorn
EXPOSE 8000

# Start Gunicorn with 4 worker processes
CMD ["gunicorn", "app:app", "-w", "4", "-b", "0.0.0.0:8000"]

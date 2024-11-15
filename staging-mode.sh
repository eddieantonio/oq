#!/bin/sh
set -ex
ln -sf docker-compose.staging.yml docker-compose.override.yml
docker compose build

#!/bin/sh
set -ex
ln -sf docker-compose.dev.yml docker-compose.override.yml
docker compose build

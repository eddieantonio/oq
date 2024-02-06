#!/bin/sh

PISTON_TAG_DATE=20231101
PISTON_TAG=ghcr.io/eddieantonio/piston:${PISTON_TAG_DATE}-packages-only

set -ex

curl -f http://localhost:2000/api/v2/runtimes -o piston-runtimes.json
docker build . --target packages-only --tag "${PISTON_TAG}" \
    --label "piston-packages=$(cat ./piston-runtimes.json)"
docker push "${PISTON_TAG}"

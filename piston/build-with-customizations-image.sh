#!/bin/sh

PISTON_TAG_DATE=20231101
PISTON_TAG=ghcr.io/eddieantonio/piston:${PISTON_TAG_DATE}-with-customizations

set -ex

docker build . --target with-customizations --tag "${PISTON_TAG}"
docker push "${PISTON_TAG}"

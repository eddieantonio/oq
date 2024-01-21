# This is a multi-stage Dockerfile.
#
# Stages:
#  - base           -- Base image for all stages except production
#  - dev-hot-reload -- Image used when using docker compose in development
#  - builder        -- Image that builds the application for production
#  - production     -- Image used in production, copies files from builder
#
# Arguments:
#  - ALPINE_VERSION -- Version of alpine to use in all stages
#  - USER_ID        -- [production] Unix user ID of the node user
#  - GROUP_ID       -- [production] Unix group ID of the node user
#
# For user/group ID, make sure they match whichever user you plan to "own" the
# processes and data on the host machine. This way, the node user within
# Docker can write to the host filesystem.

ARG ALPINE_VERSION=3.18


## STAGE ########################### base ####################################

FROM node:20-alpine${ALPINE_VERSION} as base

WORKDIR /app
# Install dependencies first...
COPY bin ./bin
COPY package.json package-lock.json ./
RUN npm ci


## STAGE ###################### dev-hot-reload ###############################

# Image used in development. Note, we do NOT copy the source files into the container,
# as we are using a bind mount to actively modify the source code.
FROM base as dev-hot-reload

# Provide our own init system.
# docker-compose can add an init, but we might as well just do it right away.
RUN apk add --no-cache dumb-init==1.2.5-r2

EXPOSE 3000
# Hardcode the contents of "npm run" to avoid npm from intercepting our exit signals
# See: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#cmd
CMD ["dumb-init", "node_modules/.bin/vite", "dev"]


## STAGE ######################### builder ###################################

# Image used to build the application.
FROM base as builder
# Copy remaining files:
COPY . .

# Build the application.
# The compiled files will be in the /app/build folder
#
# NOTE: the knexfile needs to be present in production
# however, there will be no TypeScript compiler there,
# so compile it now. Because we have {"type": "module"} in package.json,
# we need to change the extension to .cjs:
RUN npx tsc knexfile.ts && \
    mv knexfile.js knexfile.cjs && \
    npm run build && \
    npm prune --production


## STAGE ######################## production #################################

# Image used in production.
FROM alpine:${ALPINE_VERSION} as production

# (See above)
ARG USER_ID=1000
ARG GROUP_ID=1000

# Derived from https://github.com/nodejs/docker-node/blob/75c91643fcb23f135720f07bad6465b511f5d9a5/docs/BestPractices.md#smaller-images-without-npmyarn
WORKDIR /app
RUN apk add --no-cache libstdc++ dumb-init==1.2.5-r2 && \
    addgroup -g ${GROUP_ID} node && \
    adduser -u ${USER_ID} node -G node -s /bin/sh -D node && \
    chown node:node ./
COPY --from=builder /usr/local/bin/node /usr/local/bin
COPY --from=builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin
ENTRYPOINT ["docker-entrypoint.sh"]

USER node
# Copy just the files needed for SvelteKit and Knex migrations
# See: https://kit.svelte.dev/docs/adapter-node
COPY --from=builder /app/package.json /app/knexfile.cjs ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/seeds ./seeds
COPY --from=builder /app/build ./build

# SvelteKit does not put files in a nice place.
# It might be okay to plop the tasks folder in the build directory... but nah
ENV TASK_DIR=/app/tasks
COPY --from=builder /app/tasks ./tasks

# Add all npm's binaries to the PATH so that we can use knex a little more
# easily in production:
ENV PATH="${PATH}:/app/node_modules/.bin"

EXPOSE 3000
CMD ["dumb-init", "node", "build"]

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

ARG ALPINE_VERSION=3.18


## STAGE ########################### base ####################################

FROM node:20-alpine${ALPINE_VERSION} as base

WORKDIR /app
# Install dependencies first...
COPY package.json package-lock.json ./
RUN npm ci


## STAGE ###################### dev-hot-reload ###############################

# Image used in development. Note, we do NOT copy the source files into the container,
# as we are using a bind mount to actively modify the source code.
FROM base as dev-hot-reload
# Hardcode the contents of "npm run" to avoid npm from intercepting our exit signals
# See: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#cmd
CMD ["node_modules/.bin/vite", "dev"]


## STAGE ######################### builder ###################################

# Image used to build the application
FROM base as builder
# Copy remaining files:
COPY . .
# Builds the application. The app is now in the /app/build folder
RUN npm run build && \
    npm prune --production


## STAGE ######################## production #################################
FROM alpine:${ALPINE_VERSION} as production

# Derived from https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#smaller-images-without-npmyarn
WORKDIR /app
RUN apk add --no-cache libstdc++ dumb-init==1.2.5-r2 && \
    addgroup -g 1000 node && \
    adduser -u 1000 node -G node -s /bin/sh -D node && \
    chown node:node ./
COPY --from=builder /usr/local/bin/node /usr/local/bin
COPY --from=builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin
ENTRYPOINT ["docker-entrypoint.sh"]

USER node
# Copy just the files needed for SvelteKit
# See: https://kit.svelte.dev/docs/adapter-node
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
CMD ["dumb-init", "node", "build"]
